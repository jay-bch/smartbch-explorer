import { SessionService } from '../session.service';
import { NodeAdapter } from './adapters/adapter.service';
import { filter, map, take } from 'rxjs/operators';
import { AdapaterLocator } from './adapters/adapter.locator';
import { Injectable, Injector } from '@angular/core';
import { Web3Adapter } from './adapters/web3/web3.service';
import { Block } from 'web3-eth';
import { BlockNumber, TransactionConfig } from 'web3-core';

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
        .then( blockHeight => {
          if (blockHeight && blockHeight > 0) {
            this.sessionService.setEndpointOnline();
            console.log(`[Node-API service]: Successfully retrieved blockheader ${blockHeight}, API is online.`);
          } else {
            this.sessionService.setEndpointOffline();
            console.log('[Node-API service]: Error retrieving block 1, API not online.');
          }
        })
        .catch( () => {
          console.log('[Node-API service]: Error retrieving block 1, API not online.');
          this.sessionService.setEndpointOffline();
        });

        this.sessionService.setEndpointOnline();
      })
      .catch(() => {
        console.error(`[Node-API service]: Error Initializing adapter ${apiConfig.apiType}`);
      });
    });
  }

  async getBlockHeader() {
    return await this.apiAdapter?.getBlockHeader();
  }

  async getBlock(blockId: BlockNumber): Promise<Block> {
    if (this.apiAdapter) {
      return await this.apiAdapter?.getBlock(blockId);
    }

    throw new Error('Adapter not initialized.');
  }

  async getLatestBlocks(count: number) {
    let latestBlocks: Block[] = [];

    const latestBlock = await this.getBlock('latest');

    latestBlocks.push(latestBlock);

    const promises = [];
    let blockId: number = latestBlock.number;

    for(let i = 1; i < count; i++) {
      --blockId;
      promises.push(this.getBlock(blockId));
    }

    await Promise.all(promises).then( (blocks) => {
      latestBlocks = latestBlocks.concat(blocks);
    });

    return latestBlocks;
  }

  async getTxsByBlock(blockId: BlockNumber) {
    return await this.apiAdapter?.getTxsByBlock(blockId);
  }

  async getTxByHash(hash: string) {
    return await this.apiAdapter?.getTxByHash(hash);
  }

  public async getTxsByAccount(address: string, page: number, pageSize: number, searchFromBlock?: number, scopeSize?: number) {
    console.log('NODE SERVICE: getTxsByAccount', address, page, pageSize, searchFromBlock, scopeSize);
    return await this.apiAdapter?.getTxsByAccount(address, page, pageSize, searchFromBlock, scopeSize);
  }

  public async getTxReceiptByHash(hash: string) {
    return await this.apiAdapter?.getTxReceiptByHash(hash);
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

  public async queryLogs(address: string, data: string[], start: string, end: string) {
    return await this.apiAdapter?.queryLogs(address, data, start, end);
  }

  public async call(transactionConfig: TransactionConfig, returnType: string) {
    return await this.apiAdapter.call(transactionConfig, returnType);
  }
}
