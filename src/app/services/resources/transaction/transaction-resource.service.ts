import { Injectable } from '@angular/core';
import { NodeApiService, SBCHSource } from '../../api/node-api.service';
import { find, sortBy, reverse, get, filter, map, first, isNumber, isString } from 'lodash';
import { BlockResourceService } from '../block/block-resource.service';
import Web3 from 'web3';
import { BlockNumber, TransactionReceipt } from 'web3-core';
import { Transaction } from 'web3-eth';
import { Erc20ResourceService, IErc20TransactionInformation } from '../erc20/erc20-resource.service';
import { IAddress } from '../address/address-resource.service';

export const DEFAULT_SCOPE_SIZE = 1000000; // max block range scope
export const DEFAULT_PAGE_SIZE = 10;

export type TransactionType = 'transaction' | 'contract-call' | 'contract-create' | 'erc20-transfer';



export interface ITransaction {
  data: Transaction;
  txFee: number;
  receipt?: TransactionReceipt;
  type: TransactionType;
  erc20info?: IErc20TransactionInformation;
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
    private erc20ResourceService: Erc20ResourceService
  ) {}

  async getTxsByBlock(blockId: BlockNumber): Promise<IBlockTransactions> {
    const block = await this.blockResourceService.getBlock(blockId);
    const blockTxs = await this.apiService.getTxsByBlock( blockId );

    this.cacheTxs(blockTxs);

    const blockTransactions: IBlockTransactions = {
      blockId: blockId,
      transactions: await this.mapTransactions(blockTxs, true, true),
      total: block.transactions.length
    }

    return blockTransactions;
  }

  async getTxByHash(hash: string): Promise<ITransaction | undefined> {
    // const cachedTx = find(this.transactions, { hash: hash });

    // if( cachedTx ) {
    //   console.log('FROM CACHE');
    //   return cachedTx;
    // }

    const tx = await this.apiService.getTxByHash( hash );

    this.transactions.push(tx);

    const richTx = await this.mapTransactions([tx], true, true);

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
    searchFromBlock?: number) {

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
      transactions: await this.mapTransactions(txs, true, true)
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

  private async mapTransactions(txs: Transaction[], includeReceipts?: boolean, erc20check?: boolean): Promise<ITransaction[]> {
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
        txFee: tx.gas * txGasPrice
      };

      if (tx.to && tx.to === '0x0000000000000000000000000000000000000000') {
        mappedTx.type = 'contract-create';
      } else if (tx.input && tx.input !== '0x') {
        mappedTx.type = 'contract-call';
      }

      return mappedTx;
    });

    //add receipts to all txs
    if(includeReceipts) {
      mappedTransactions.forEach( async (tx) => {
        // if(tx.type !== 'transaction') {
          const promise = this.apiService.getTxReceiptByHash(tx.data.hash);
          waitForPromises.push(promise)
          tx.receipt = await promise;
      });
      await Promise.all(waitForPromises);
    }

    //detect tokens
    if(erc20check && includeReceipts) {
      mappedTransactions.forEach( async (tx) => {
        if(tx.type === 'contract-call' && tx.receipt && tx.receipt.status) {

          const erc20Contract = this.erc20ResourceService.getErc20TransactionInformation(tx.receipt);
          waitForPromises.push(erc20Contract);

          erc20Contract.then((contract) => {
            if(contract) {
              tx.type = 'erc20-transfer';
              tx.erc20info = contract;
            }
          });
        }
      });
      await Promise.all(waitForPromises);
    }

    return mappedTransactions;
  }
}
