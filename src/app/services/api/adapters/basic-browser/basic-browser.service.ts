import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { NodeAdapter } from '../adapter.service';
import { BasicBrowserAccount, BasicBrowserBlock, BasicBrowserTransactionBasicInfo, BasicBrowserTxs } from './basic-browser.types';
import { map } from 'lodash';
import { Block, BlockTransactionString, Transaction, TransactionConfig, TransactionReceipt } from 'web3-eth';
import { PagedResponse } from '../../node-api.service';

@Injectable({
  providedIn: 'root'
})
export class BasicBrowserAdapter implements NodeAdapter {
  constructor(
    private sessionService: SessionService,
    private httpClient: HttpClient
  ) {
  }
  call(transactionConfig: TransactionConfig, returnType: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  queryLogs(address: string, data: any[], start: string, end: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getTxReceiptByHash(hash: string): Promise<TransactionReceipt> {
    throw new Error('Method not implemented.');
  }
  getTxCount(address: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  hasMethodFromAbi(address: string, method: string, abi: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getCode(address: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  init(endpoint: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getBlockHeader(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getBlock(blockId: string): Promise<BlockTransactionString> {
    return new Promise( async (resolve, reject) => {
      const session = this.sessionService.session$.getValue();
      const block: BasicBrowserBlock = await this.httpClient.get(`${session.apiConfig.apiEndpoint}/${session.apiConfig.apiVersion}/block/${blockId}`, {}).toPromise() as BasicBrowserBlock;

      // const formattedBlock: AppBlock = {
      //   Number: parseInt(block.Number, 16),
      //   GasLimit: block.GasLimit,
      //   GasUsed: parseInt(block.GasUsed, 16),
      //   Hash: block.Hash,
      //   Miner: block.Miner,
      //   ParentHash: block.ParentHash,
      //   Size: parseInt(block.Size, 16),
      //   StateRoot: block.StateRoot,
      //   Timestamp: new Date( parseInt(block.Timestamp, 16) * 1000 ),
      //   Transactions: block.Transactions,
      //   TransactionsCount: parseInt(block.TransactionsCount, 16),
      //   TransactionsRoot: block.TransactionsRoot
      // };

      // resolve( formattedBlock );
    });
  }

  getTxsByBlock(blockId: string): Promise<Transaction[]> {
    return new Promise( async (resolve, reject) => {
      const session = this.sessionService.session$.getValue();
      const transactions: BasicBrowserTxs = await this.httpClient.get(`${session.apiConfig.apiEndpoint}/${session.apiConfig.apiVersion}/txs/${blockId}`, {}).toPromise() as BasicBrowserTxs;

      // const formattedTransactions: AppTransaction[] = map(transactions.Transactions, transaction => {
      //   return {
      //     BlockNumber: transaction.BlockNumber,
      //     Age: transaction.Age,
      //     From: transaction.From,
      //     To: transaction.To,
      //     Hash: transaction.Hash,
      //     Value: transaction.Value
      //   } as AppTransaction;
      // });

      // resolve(formattedTransactions);
    });
  }

  getTxByHash(hash: string): Promise<Transaction> {
    const session = this.sessionService.session$.getValue();
    return this.httpClient.get(`${session.apiConfig.apiEndpoint}/${session.apiConfig.apiVersion}/tx/${hash}`, {}).toPromise() as Promise<any>;
  }

  getTxsByAccount(address: string, page?: number, pageSize?: number, searchFromBlock?: number, scopeSize?: number): Promise<PagedResponse<Transaction>> {

    return new Promise( async (resolve, reject) => {
      const session = this.sessionService.session$.getValue();

      // const account = await this.httpClient.get(`${session.apiConfig.apiEndpoint}/${session.apiConfig.apiVersion}/account/${address}?page=${page}&from=${ from ? 'true' : 'false' }&to=${ to ? 'true' : 'fasle' }`, {}).toPromise() as BasicBrowserAccount;

      // resolve(account.Transactions);

    });

  }

  getAccountBalance(address: string): Promise<string> {
    return new Promise( async (resolve, reject) => {
      const session = this.sessionService.session$.getValue();

      const account = await this.httpClient.get(`${session.apiConfig.apiEndpoint}/${session.apiConfig.apiVersion}/account/${address}?page=1&from=false&to=true`, {}).toPromise() as any;



    });
  }

  getBchPrice(): Promise<string> {
    const session = this.sessionService.session$.getValue();
    return this.httpClient.get(`${session.apiConfig.apiEndpoint}/${session.apiConfig.apiVersion}/bch_price`, {}).toPromise() as Promise<string>;
  }




}
