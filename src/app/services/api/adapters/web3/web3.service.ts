import { Injectable } from '@angular/core';
import { NodeAdapter } from '../adapter.service';

import { isString, map, noop, orderBy } from 'lodash';

import { Web3Connector, Web3ConnectorType } from './web3.connector';

import Web3 from 'web3';
import { BlockNumber, Transaction, TransactionConfig, TransactionReceipt } from 'web3-core';
import { Block } from 'web3-eth';
import { PagedResponse, SBCHSource } from '../../node-api.service';
import { Hex } from 'web3-utils';

export const DEFAULT_QUERY_SIZE = 5; // max block range per request
@Injectable({
  providedIn: 'root'
})
export class Web3Adapter implements NodeAdapter{
  apiConnector?: Web3Connector;

  constructor() {}

  init(endpoint: string) {
    if(!endpoint) return Promise.reject();

    console.log('[Node Adapter:Web3] Initializing web3', endpoint);
    let connectorType: Web3ConnectorType = null;

    endpoint.startsWith('ws://') || endpoint.startsWith('wss://') ? connectorType = 'ws' : noop();
    endpoint.startsWith('http://') || endpoint.startsWith('https://') ? connectorType = 'http' : noop();
    try {
      this.apiConnector = new Web3Connector(endpoint, connectorType)
    } catch(error) {
      console.log('[Node Adapter:Web3] Error connecting to node', error);
      localStorage.removeItem('config');
      return Promise.reject();
    }

    return Promise.resolve(true);
  }

  getChainId(): Promise<number> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getChainId();
  }

  getBlockHeader(): Promise<number> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getBlockNumber();
  }
  getBlock(blockId: BlockNumber): Promise<Block> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getBlock(blockId);
  }
  getTxsByBlock(blockId: string): Promise<Transaction[]> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getTxListByHeight(blockId);
  }
  getTxByHash(hash: string): Promise<Transaction> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getTransaction(hash);
  }

  async getTxsByAccount(address: string, page: number, pageSize: number, type?: SBCHSource, searchFromBlock?: number, scopeSize?: number) {
    if(!this.apiConnector) return Promise.reject();
    if(!searchFromBlock) searchFromBlock = await this.getBlockHeader();
    if(!scopeSize) scopeSize = 0;

    let scope = searchFromBlock - scopeSize > 0 ? searchFromBlock - scopeSize : 0; // Will stop searching when this blockId is reached
    let startIndex = (page - 1) * pageSize;
    let endIndex = (startIndex + pageSize);
    const totalTxInAddress = Web3.utils.hexToNumber(await this.getTxCount(address, type));
    if(endIndex > totalTxInAddress) {
      endIndex = totalTxInAddress;
    }

    let txFound: Transaction[] = [];

    let to = searchFromBlock;
    let from = to - DEFAULT_QUERY_SIZE;

    let extendQueryBy = 10;

    // console.log('endIndex', endIndex);

    // console.log('scope', scope);
    // console.log('from', from);
    // console.log('to', to);

    if(totalTxInAddress) {
      // get the txs from node. requests will be divided in chuncks set by query size. Will stop when we reach the end of the chain, or when requested txs in page have been found.
      do {
        // don't search beyond scope
        if(from < scope) from = scope;
        if(to < scope) to = scope;

        // console.log(`Fetching txs from block ${from} to ${to}`);
        let txInThisPage: Transaction[] = [];
        try {
          if(type === 'both') {
            txInThisPage = await this.apiConnector.queryTxByAddr(
              address,
              Web3.utils.numberToHex(from),
              Web3.utils.numberToHex(to)
            )
          }

          if(type === 'from') {
            txInThisPage = await this.apiConnector.queryTxBySrc(
              address,
              Web3.utils.numberToHex(from),
              Web3.utils.numberToHex(to)
            )
          }

          if(type === 'to') {
            txInThisPage = await this.apiConnector.queryTxByDst(
              address,
              Web3.utils.numberToHex(from),
              Web3.utils.numberToHex(to)
            )
          }
        } catch(error) {
          console.error('sbch_queryTx Error!', error);
        }

        if  (txInThisPage.length) {
          txFound = txFound.concat(txInThisPage);
          // console.log(`Found ${txFound.length} transactions`)
        } else {
          if(extendQueryBy < 10000) extendQueryBy = extendQueryBy * 2;
          // console.log('extended query size', extendQueryBy)
        }

        to = from - 1;
        from = from - (DEFAULT_QUERY_SIZE * extendQueryBy);
      } while ( txFound.length < (endIndex) && to > scope );

      txFound = map(txFound, (tx) => {
        if(isString(tx.blockNumber)) {
          // convert blocknumber to int. sbch returns these as hexes, while Web3 Transaction expects them to be number
          tx.blockNumber = Web3.utils.hexToNumber(tx.blockNumber as any)

          return tx;
        }

        return tx;
      });

      txFound = orderBy(txFound, ['blockNumber'], ['desc']);
    }

    const txResults = txFound.slice(startIndex, endIndex);

    return {
      results: txResults,
      page,
      pageSize,
      isEmpty: totalTxInAddress === 0,
      total: totalTxInAddress
    } as PagedResponse<Transaction>;
  }

  async getLatestTransactions(page: number, pageSize: number, searchFromBlock?: number, scopeSize?: number) {
    if(!this.apiConnector) return Promise.reject();
    if(!searchFromBlock) searchFromBlock = await this.getBlockHeader();
    if(!scopeSize) scopeSize = 0;

    let scope = searchFromBlock - scopeSize; // Will stop searching when this blockId is reached
    let startIndex = (page - 1) * pageSize;
    let endIndex = (startIndex + pageSize);
    let txFound: Transaction[] = [];

    let to = searchFromBlock;
    let from = to - DEFAULT_QUERY_SIZE;

    let extendedQueryBy = 1;

    // console.log('scope', scope);
    // console.log('from', from);
    // console.log('to', to);

    do {
      // don't search beyond scope
      if(from < scope) from = scope;
      if(to < scope) to = scope;

      // console.log('SEARCH BLOCKS', from, to);

      const promises: any[] = [];
      for(let i = from; i < to; i++) {
        promises.push(
          this.apiConnector.getTxListByHeight(Web3.utils.numberToHex(i))
        );
      }

      const promiseResults = await Promise.all(promises);
      const txInThisPage = promiseResults.filter(e => e.length).reduce((a, b) => a.concat(b), []);

      if  (txInThisPage.length) {
        txFound = txFound.concat(txInThisPage);
        // console.log(`Found ${txFound.length} transactions`);
        extendedQueryBy = 1;
      } else {
        // if we didnt find anything, double query size
        if(extendedQueryBy < 10000) extendedQueryBy = extendedQueryBy * 2;
      }

      to = from - 1;
      from = from - (DEFAULT_QUERY_SIZE * extendedQueryBy);
    } while ( txFound.length < (endIndex) && to > scope );


    txFound = orderBy(txFound, ['blockNumber'], ['desc']);

    txFound = map(txFound, tx => {
      tx.blockNumber = Web3.utils.hexToNumber(tx.blockNumber as Hex);
      return tx;
    });

    const txResults = txFound.slice(startIndex, endIndex);
    // console.log(`RESULT (Last block ${to})`, txResults);

    return {
      results: txResults,
      page,
      pageSize,
      isEmpty: txResults.length === 0,
      total: to < scope ? txFound.length : undefined
    } as PagedResponse<Transaction>

  }

  getTxCount(address: string, type: SBCHSource = 'both') {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getTransactionCount(address, type);
  }
  getAccountBalance(address: string): Promise<string> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getBalance(address);
  }

  getCode(address: string): Promise<string> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getCode(address);
  }
  getTxReceiptByHash(hash: string): Promise<TransactionReceipt> {
    if(!this.apiConnector) return Promise.reject();

    return this.apiConnector.getTransactionReceipt(hash)
  }
  async call(transactionConfig: TransactionConfig, returnType: string) {
    if(!this.apiConnector) return Promise.reject();

    let callReturn: {[key: string]: any} | undefined;

    await this.apiConnector.call(transactionConfig).then( (call) => {
      callReturn = this.apiConnector?.getWeb3()?.eth.abi.decodeParameter(returnType, call);
    });

    if(!callReturn) {
      return Promise.reject();
    }

    return Promise.resolve(callReturn);
  }

  queryLogs(address: string, data: any[], start: string, end: string) {
    if(!this.apiConnector) return Promise.reject();
    return this.apiConnector.queryLogs(address, data, start, end);
  }

  async hasMethodFromAbi(address: string, method: string, abi: any): Promise<boolean> {
    const myMethod = Web3.utils.sha3("symbol()");
    // const myMethod2 = Web3.utils.sha3("name()");
    const myMethod3 = Web3.utils.sha3("totalSupply()");

    // if(myMethod3) {
    //   this.call({ to: address, data: myMethod3}).then( call => {
    //     console.log('SUPPLY', this.apiConnector?.decodeParameter("uint256", call));
    //   });
    // }

    // if(myMethod2) {
    //   this.call({ to: address, data: myMethod2}).then( call => {
    //     console.log('NAME', abi.decodeParameter("string", call));
    //   });
    // }

    this.queryLogs(
      address,
      [
        Web3.utils.keccak256('Transfer(address,address,uint256)'),
        // web3.utils.sha3('Deposit(address,uint256)'),
        // web3.utils.sha3('Withdrawal(address,uint256)'),

      ],
      '0x0',
      'latest'
    ).then(result => {
      console.log('sbch', result)
      console.log( Web3.utils.stringToHex(result[0].topics[1] ));
    })

    // if (myMethod) {
    //   this.call({ to: address, data: myMethod}).then( call => {
    //     console.log('SYMBOL', web3.eth.decodeParameter("string", call));
    //     console.log(Web3.utils.keccak256('Transfer(address,address,uint256)'))
    //     console.log(Web3.utils.keccak256('transfer(address,uint256)'))



    //     // web3.eth.getPastLogs({
    //     //   fromBlock: '0x0',
    //     //   address: address,
    //     //   topics: [
    //     //     web3.utils.sha3('Transfer(address,address,uint256)')
    //     //   ]
    //     // }).then( result => {
    //     //   console.log('PAST LOGS', result);

    //     //   console.log( web3.utils.stringToHex(result[0].topics[1] ));
    //     // })

    //   })
    //   .catch(error => {
    //     console.log('NO METHOD', error)
    //   });
    // }

    return Promise.resolve(false);
  }
}
