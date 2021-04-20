import { Injectable } from '@angular/core';
import { NodeApiService } from '../api/node-api.service';
import { find, last, sortBy, reverse, get, filter, map, isString, uniqBy } from 'lodash';
import { BlockResourceService } from './block-resource.service';
import Web3 from 'web3';
import { BlockNumber, TransactionReceipt } from 'web3-core';
import { Transaction } from 'web3-eth';
import { Erc20ResourceService, IErc20Contract, IErc20Transaction, IErc20TransactionInformation } from './erc20-resource.service';

export const DEFAULT_SCOPE_SIZE = 1000000; // max block range scope
export const DEFAULT_PAGE_SIZE = 10;

export type TransactionType = 'transaction' | 'contract-call' | 'contract-create' | 'erc20-transfer';

export interface IAddress {
  address: string;
  balance: number;
  code?: string;
  input?: string;
}

export interface ITransaction {
  data: Transaction;
  txFee: number;
  receipt?: TransactionReceipt;
  type: TransactionType;
  erc20info?: IErc20TransactionInformation;
}

export interface IAddressTransactions {
  address: string;
  transactions: ITransaction[];
  page: number;
  pageSize: number;
  isEmpty: boolean;
  total?: number;
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

  async getTxsByBlock(blockId: BlockNumber) {
    const block = await this.blockResourceService.getBlock(blockId);

    if(block.transactions.length === 0) {
      return [];
    }

    const blockTxs = await this.apiService.getTxsByBlock( blockId );

    this.cacheTxs(blockTxs);

    return blockTxs;
  }

  async getTxByHash(hash: string) {
    const cachedTx = find(this.transactions, { hash: hash });

    if( cachedTx ) {
      console.log('FROM CACHE');
      return cachedTx;
    }

    const tx = await this.apiService.getTxByHash( hash );

    this.transactions.push(tx);

    return tx;
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
    page?: number,
    pageSize?: number) {

    if(!page) page = 1;
    if(!pageSize) pageSize = DEFAULT_PAGE_SIZE;

    const web3Txs = await this.apiService.getTxsByAccount(address, page, pageSize, undefined, DEFAULT_SCOPE_SIZE);
    const txs = this.sortTransactions(web3Txs.results);
    const waitForPromises: Promise<any>[] = [];

    const addressTransactions: IAddressTransactions = {
      address,
      page,
      pageSize,
      isEmpty: web3Txs.isEmpty,
      total: web3Txs.total,
      transactions: map(txs, (tx) => {
        const mappedTx: ITransaction = {
          data: tx,
          type: 'transaction',
          txFee: Web3.utils.hexToNumber(tx.gas) * Web3.utils.hexToNumber(tx.gasPrice)
        };

        if (tx.to && tx.to === '0x0000000000000000000000000000000000000000') {
          mappedTx.type = 'contract-create';
        } else if (tx.input && tx.input !== '0x') {
          mappedTx.type = 'contract-call';


        }

        return mappedTx;
      })
    }

    // fet all receipts
    addressTransactions.transactions.forEach( async (tx) => {
      if(tx.type !== 'transaction') {
        const promise = this.apiService.getTxReceiptByHash(tx.data.hash);
        waitForPromises.push(promise)
        tx.receipt = await promise;
      }
    });
    await Promise.all(waitForPromises);

    // is contract-call this call is a erc20transfer?
    addressTransactions.transactions.forEach( async (tx) => {
      if(tx.type === 'contract-call' && tx.receipt) {
        const erc20Contract = this.erc20ResourceService.getErc20TransactionInformation(tx.receipt);
        waitForPromises.push(erc20Contract);

        erc20Contract.then( (contract) => {
          if(contract) {
            tx.type = 'erc20-transfer';
            tx.erc20info = contract;
          }
        });
      }
    });
    await Promise.all(waitForPromises);

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
}
