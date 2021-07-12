import { Injectable } from '@angular/core';
import { NodeApiService, SBCHSource } from '../../api/node-api.service';
import { find, sortBy, reverse, get, filter, map, first, isNumber, isString } from 'lodash';
import { BlockResourceService } from '../block/block-resource.service';
import Web3 from 'web3';
import { BlockNumber, TransactionReceipt } from 'web3-core';
import { Block, Transaction } from 'web3-eth';
import { Sep20ResourceService, ISep20TransactionInformation } from '../sep20/sep20-resource.service';
import { IAddress } from '../address/address-resource.service';
import { ContractResourceService, IContract, IEventLog } from '../contract/contract-resource.service';
import { IDecodedMethod } from '../../helpers/event-decoder/event-decoder';

export const DEFAULT_SCOPE_SIZE = 1000000; // max block range scope
export const DEFAULT_PAGE_SIZE = 10;

export type TransactionType = 'transaction' | 'contract-call' | 'contract-create' | 'sep20-transfer';



export interface ITransaction {
  data: Transaction;
  txFee: number;
  receipt?: TransactionReceipt;
  type: TransactionType;
  method?: IDecodedMethod;
  events?: IEventLog[];
  sep20info?: ISep20TransactionInformation;
  block?: Block,
}

export interface IExtendedTransaction {
  hash: string,
  transaction: ITransaction,
  sender: IAddress,
  receiver: IAddress
}

export interface IAddressTransactions {
  address?: string;
  transactions: ITransaction[];
  page: number;
  pageSize: number;
  isEmpty: boolean;
  total?: number;
}

export interface IBlockTransactions {
  blockId: BlockNumber,
  transactions: ITransaction[],
  total: number
}

@Injectable({
  providedIn: 'root'
})
export class TransactionResourceService {

  transactions: Transaction[] = [];

  constructor(
    private apiService: NodeApiService,
    private blockResourceService: BlockResourceService,
    private sep20ResourceService: Sep20ResourceService,
    private contractService: ContractResourceService
  ) {}

  async getTxsByBlock(blockId: BlockNumber, page: number, pageSize: number): Promise<IBlockTransactions> {
    const txnew = await this.apiService.getTxsByBlock(blockId, (page - 1) * pageSize, page * pageSize);
    console.log( 'TX NEW', txnew);

    const block = await this.blockResourceService.getBlock(blockId);
    const txToFetch: string[] = block.transactions.slice( (page - 1) * pageSize, page * pageSize) as string[];

    console.log('txToFetch', txToFetch);

    const promises: Promise<ITransaction>[] = [];
    txToFetch.forEach( (hash) => {
      promises.push(this.getTxByHash(hash) as Promise<ITransaction>);
    });

    const txs = await Promise.all(promises);

    console.log('txs', txs);



    // const blockTxs = await this.apiService.getTxsByBlock( blockId );

    // this.cacheTxs(blockTxs);

    const blockTransactions: IBlockTransactions = {
      blockId: blockId,
      transactions: txs,
      // transactions: await this.mapTransactions(blockTxs, true, true),
      total: block.transactions.length
    }

    return blockTransactions;
  }

  async getTxByHash(hash: string, includeBlock = false): Promise<ITransaction | undefined> {
    // const cachedTx = find(this.transactions, { hash: hash });

    // if( cachedTx ) {
    //   console.log('FROM CACHE');
    //   return cachedTx;
    // }

    const tx = await this.apiService.getTxByHash( hash );

    this.transactions.push(tx);

    const richTx = await this.mapTransactions([tx], true, true, includeBlock);

    return first(richTx);
  }

  async getExtendedTransactionInfo(hash: string) {
    const transaction = await this.getTxByHash(hash);
    // return {
    //   hash,
    //   transaction,
    //   receiver,
    //   se

    // } as IExtendedTransaction
  }


  /**
   * Gets tx by address.
   * @param address
   * @param [page]
   * @param [pageSize]
   * @returns
   */
  async getTxByAddress(
    address: string,
    type: SBCHSource = 'both',
    page?: number,
    pageSize?: number,
    searchFromBlock?: number
  ) {

    if(!page) page = 1;
    if(!pageSize) pageSize = DEFAULT_PAGE_SIZE;

    const web3Txs = await this.apiService.getTxsByAccount(address, page, pageSize, type, searchFromBlock, DEFAULT_SCOPE_SIZE);
    const txs = this.sortTransactions(web3Txs.results);

    const addressTransactions: IAddressTransactions = {
      address,
      page,
      pageSize,
      isEmpty: web3Txs.isEmpty,
      total: web3Txs.total,
      transactions: await this.mapTransactions(txs, true, true)
    }
    return addressTransactions;
  }

  async getLatestTransactions(
    page?: number,
    pageSize?: number,
    searchFromBlock?: number,
    scopeSize?: number) {

    if(!page) page = 1;
    if(!pageSize) pageSize = DEFAULT_PAGE_SIZE;
    if(!scopeSize) scopeSize =- DEFAULT_SCOPE_SIZE

    const web3Txs = await this.apiService.getLatestTransactions(page, pageSize, searchFromBlock, scopeSize);

    const txs = this.sortTransactions(web3Txs.results);

    const addressTransactions: IAddressTransactions = {
      address: undefined,
      page,
      pageSize,
      isEmpty: web3Txs.isEmpty,
      total: web3Txs.total,
      transactions: await this.mapTransactions(txs, true, false)
    }

    return addressTransactions;
  }


  private getFromCache(keys: string[], values: any[][]): Transaction[] {
    const items = filter(this.transactions, (tx) => {

      const foundkeys: string[] = [];
      keys.forEach( (key, index) => {
        if(values[index].includes(get(tx, key))) {
          foundkeys.push(key);
        }
      });

      if(keys.length === foundkeys.length) {

        return true;
      }
      return false;
    });

    return items;
  }

  private cacheTxs(txs: Transaction[]) {
    txs.forEach( tx => {
      if(!find(this.transactions, { hash: tx.hash })) {
        this.transactions.push(tx);
      };
    });
  }

  private sortTransactions(txs: Transaction[]) {
    return reverse(sortBy(txs, (tx) => {
      return tx.blockNumber;
    }));
  }

  private async mapTransactions(txs: Transaction[], includeReceipts?: boolean, discoverContracts?: boolean, includeBlock?: boolean): Promise<ITransaction[]> {
    const waitForPromises: Promise<any>[] = [];

    const mappedTransactions = map(txs, (tx) => {
      let txGasPrice: number = 0;
      if(isString(tx.gasPrice) && tx.gasPrice.startsWith('0x')) txGasPrice = Web3.utils.hexToNumber(tx.gasPrice)
      if(isString(tx.gasPrice)) txGasPrice = parseInt(tx.gasPrice, 10);

      // const txGas = isNumber(tx.gas) ? tx.gas : Web3.utils.hexToNumber(tx.gas);
      // const txGasPrice = isNumber(tx.gasPrice) ? tx.gasPrice : Web3.utils.hexToNumber(tx.gasPrice);

      const mappedTx: ITransaction = {
        data: tx,
        type: 'transaction',
        method: undefined,
        txFee: tx.gas * txGasPrice,
      };

      if (tx.to && tx.to === '0x0000000000000000000000000000000000000000') {
        const method = { name: tx.input.substr(0, 10), value: tx.input }
        mappedTx.type = 'contract-create';
      } else if (tx.input && tx.input !== '0x') {
        mappedTx.method = tx.to ? this.contractService.getMethodForContract(tx.to, tx.input) : { name: tx.input.substr(0, 10) };
        mappedTx.type = 'contract-call';
      }
      if(!mappedTx.method) {
        console.error('method', mappedTx);
      }

      return mappedTx;
    });

    //add receipts to all txs
    if(includeReceipts) {
      mappedTransactions.forEach( async (tx) => {
        // console.log('TX', tx);
        // if(tx.type !== 'transaction') {
          if(tx.data.to) {
            const promise = this.apiService.getTxReceiptByHash(tx.data.hash);
            waitForPromises.push(promise)
            tx.receipt = await promise;
            // console.log('RECEIPT', tx.receipt);
          }

          if(tx.receipt && tx.receipt.status && tx.receipt.logs.length > 0) {
            try {
              // console.log(tx);
              tx.events = this.contractService.getLogsForContract(tx.receipt.to, tx.receipt.logs)
            } catch(error) {
              console.error(error);
            }
          }

          // if(tx.receipt && tx.receipt.logs) {
          //   console.log('LOGS>>>', this.contractService._decodeLogs(tx.receipt.logs));
          //   // console.log('METHOD>>>', this.contractService._decodeMethod(tx.receipt.logs[0].data));
          // }
      });


      await Promise.all(waitForPromises);
    }

    //discover contracts
    if(discoverContracts && includeReceipts) {
      // for(const tx of mappedTransactions) {

      mappedTransactions.forEach( async (tx) => {
        if(tx.type === 'contract-call' && tx.receipt && tx.receipt.status) {

          waitForPromises.push(this.contractService.getContract(tx.receipt.to));
          // const contract = await this.contractService.getContract(tx.receipt.to);

          // if(contract) {
            // console.log('Detected!', contract)

            // if(contract.type === 'sep20') {
            //   tx.type = 'sep20-transfer';
            //   tx.sep20info = contract.sep20;
            // }
          // }



          // const sep20Contract = this.sep20ResourceService.getSep20TransactionInformation(tx.receipt);
          // waitForPromises.push(sep20Contract);

          // sep20Contract.then((contract) => {

        }
      });
      await Promise.all(waitForPromises);
    }

    if(includeBlock) {
      mappedTransactions.forEach( async (tx) => {
        if(tx.data.blockNumber) {
          tx.block = await this.blockResourceService.getBlock(tx.data.blockNumber);
        }
      });
    }

    return mappedTransactions;
  }
}
