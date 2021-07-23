import { SessionService } from '../session.service';
import { NodeAdapter } from './adapters/adapter.service';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { AdapaterLocator } from './adapters/adapter.locator';
import { Injectable, Injector } from '@angular/core';
import { Web3Adapter } from './adapters/web3/web3.service';
import { Block } from 'web3-eth';
import { BlockNumber, TransactionConfig } from 'web3-core';

export type SBCHSource = 'both' | 'from' | 'to';

export interface PagedResponse<T> {
  results: T[]
  pageSize: number;
  page: number;
  total?: number;
  isEmpty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NodeApiService {
  private apiAdapter: NodeAdapter;
  connectionAttempts: any;

  constructor(
    private sessionService: SessionService,

    private injector: Injector
  ) {
    AdapaterLocator.injector = this.injector;
    this.apiAdapter = AdapaterLocator.injector.get(Web3Adapter);

    //wait for the session service to emit settings, then load the configured adapter
    this.sessionService.session$.pipe(
      filter((session) => !session.initialized ),
      map((session) => session.apiConfig ),
      take(1)
    ).subscribe((apiConfig) => {
      if(!apiConfig.apiVersion || !apiConfig.apiEndpoint) {
        this.sessionService.setEndpointOffline();
        return;
      }

      if(apiConfig.apiType === 'web3') {
        this.apiAdapter = AdapaterLocator.injector.get(Web3Adapter);
      }

      this.apiAdapter.init(apiConfig.apiEndpoint)
      .then(() => {
        // now that the adapter is loaded, check if the node is online
        this.getBlockHeader()
        .then( async blockHeight => {
          if (blockHeight && blockHeight > 0) {
            const chainId = await this.getChainId();
            this.sessionService.setEndpointOnline(chainId);
            console.log(`[Node-API service]: Successfully retrieved blockheader ${blockHeight}, API is online.`);
          } else {
            this.sessionService.setEndpointOffline();
            console.log('[Node-API service]: Error retrieving block 1, API not online.');
          }
        })
        .catch( (e) => {
          console.log(`[Node-API service]: Error retrieving block 1, API not online. ${e}`);
          this.sessionService.setEndpointOffline(e);
        });
      })
      .catch((e) => {
        console.error(`[Node-API service]: Error Initializing adapter ${apiConfig.apiType}, ${e}`);
        this.sessionService.setEndpointOffline(e);
      });

      this.connectionAttempts++
    });
  }

  async getChainId() {
    return await this.apiAdapter?.getChainId();
  }

  async getBlockHeader() {
    return await this.apiAdapter?.getBlockHeader();
  }

  async getBlock(blockId: BlockNumber): Promise<Block> {
    if (this.apiAdapter) {
      console.log('getblock');
      return await this.apiAdapter?.getBlock(blockId);
    }

    throw new Error('Adapter not initialized.');
  }

  async getBlocks(blockIds: BlockNumber[]): Promise<Block[]> {
    if(this.apiAdapter) {
      return await this.apiAdapter.getBlocks(blockIds);
    }

    throw new Error('Adapter not initialized.');
  }

  // async getLatestBlocks(count: number) {
  //   let latestBlocks: Block[] = [];

  //   const latestBlock = await this.getBlock('latest');

  //   latestBlocks.push(latestBlock);

  //   const promises = [];
  //   let blockId: number = latestBlock.number;

  //   for(let i = 1; i < count; i++) {
  //     --blockId;
  //     promises.push(this.getBlock(blockId));
  //   }

  //   await Promise.all(promises).then( (blocks) => {
  //     latestBlocks = latestBlocks.concat(blocks);
  //   });

  //   return latestBlocks;
  // }

  async getTxCount(address: string, type: SBCHSource = 'both') {
    return await this.apiAdapter?.getTxCount(address, type);
  }

  async getSep20AddressCount(address: string, sep20Contract: string, type: SBCHSource): Promise<any> {
    return await this.apiAdapter.getSep20AddressCount(address, sep20Contract, type);
  }

  async getTxsByBlock(blockId: BlockNumber, start: number, end: number) {
    return await this.apiAdapter?.getTxsByBlock(blockId, start, end);
  }

  async getTxByHash(hash: string) {
    return await this.apiAdapter?.getTxByHash(hash);
  }

  public async getTxsByAccount(address: string, page: number, pageSize: number, type?: SBCHSource, searchFromBlock?: number, scopeSize?: number) {
    // console.log('NODE SERVICE: getTxsByAccount', address, page, pageSize, searchFromBlock, scopeSize);
    return await this.apiAdapter?.getTxsByAccount(address, page, pageSize, type, searchFromBlock, scopeSize);
  }

  public async getTxReceiptByHash(hash: string) {
    return await this.apiAdapter?.getTxReceiptByHash(hash);
  }

  public async getTxReceiptsByHashes(hashes: string[]) {
    return await this.apiAdapter?.getTxReceiptsByHashes(hashes);
  }

  public async getAccountBalance(address:string) {
    return await this.apiAdapter?.getAccountBalance(address);
  }

  public async getCode(address: string) {
    return await this.apiAdapter?.getCode(address);
  }

  public async hasMethodFromAbi(address: string, method: string, abi: any) {
    return await this.apiAdapter?.hasMethodFromAbi(address, method, abi);
  }

  public async queryLogs(address: string, data: string[] | null, start: string, end: string, limit: string) {
    return await this.apiAdapter?.queryLogs(address, data, start, end, limit);
  }

  public async queryAddressLogs(address: string) {
    return await this.apiAdapter.queryAddressLogs(address);
  }

  public async call(transactionConfig: TransactionConfig, returnType: string) {
    return await this.apiAdapter.call(transactionConfig, returnType);
  }

  public async callMultiple(items: {transactionConfig: TransactionConfig, returnType: string}[]) {
    return await this.apiAdapter.callMultiple(items);
  }

  public async getLatestTransactions(page: number, pageSize: number, searchFromBlock?: number, scopeSize?: number) {
    return await this.apiAdapter?.getLatestTransactions(page, pageSize, searchFromBlock, scopeSize);
  }
}
