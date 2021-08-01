import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { NodeApiService } from '../../api/node-api.service';

import { find, filter as loFilter, orderBy, uniqBy, forEach, indexOf, map } from 'lodash';
import { filter, take, takeUntil } from 'rxjs/operators';
import { SessionService } from '../../session.service';

import { Block } from 'web3-eth';
import { BlockNumber } from 'web3-core';

const REFRESH_INTERVAL = 50000;

@Injectable({
  providedIn: 'root'
})
export class BlockResourceService {

  public blocks: Block[] = [];

  public blockHeight$: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);

  private stop$ = new Subject();

  constructor(
    private apiService: NodeApiService,
    private sessionService: SessionService
  ) {

    this.sessionService.session$.pipe(
      filter(session => session.initialized),
      take(1),
    ).subscribe((session) => {
      timer(0, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
        try {
          const height = await this.apiService.getBlockHeader();
          this.blockHeight$.next(height);
        } catch(e) {
          this.sessionService.setEndpointOffline(e);
        }
      });
    })
  }

  async getBlockHeader() {
    return await this.apiService.getBlockHeader();
  }

  async getBlock(blockId: BlockNumber): Promise<Block> {
    const cachedBlock: Block = find(this.blocks, { number: blockId }) as Block;

    if(cachedBlock) {
      // console.log('CACHED BLOCK RETURNED!');
      return cachedBlock;
    }

    const block = await this.apiService.getBlock( blockId );

    this.blocks.push( block );
    this.blocks = orderBy(this.blocks, ['number'], ['desc']);
    this.blocks = uniqBy(this.blocks, 'number');

    // console.log('BLOCK', block);

    return block;
  }

  async getBlocks(blockIds: BlockNumber[]): Promise<Block[]> {
    // console.log('getBlocks', blockIds);
    const cachedBlocks: Block[] = loFilter(this.blocks, block => blockIds.includes(block.number));
    const blocksToFetch: BlockNumber[] = loFilter(blockIds, id => !find(cachedBlocks, {number: id}));
    // console.log( 'cached blocks', cachedBlocks);
    // console.log( 'blocks to fetch', blocksToFetch);

    let fetchedBlocks: Block[] = [];

    if(blocksToFetch.length) {
      fetchedBlocks = await this.apiService.getBlocks(blocksToFetch);
    }

    this.blocks = this.blocks.concat(fetchedBlocks);

    this.blocks = orderBy(this.blocks, ['number'], ['desc']);
    this.blocks = uniqBy(this.blocks, 'number');

    const blocksToReturn = cachedBlocks.concat(fetchedBlocks);

    return orderBy(blocksToReturn, ['number'], ['desc']);
  }

  async getLatestBlocks(count: number, height?: number) {
    let blockHeight: number = height ?? 0;

    if(!blockHeight) {
      blockHeight = await this.apiService.getBlockHeader();
    }


    if(!blockHeight) {
      return Promise.reject();
    }

    const blockRequests: Promise<Block>[] = [];
    const ids: number[] = []

    for(let i = 0; i < count; i++) {
      if (!find(this.blocks, {number: blockHeight - i })) {
        ids.push(blockHeight - i)
        // blockRequests.push(this.apiService.getBlock(blockHeight - i));
      }
    }

    const blocks = await this.getBlocks(ids);

    // await Promise.all(blockRequests).then((responses) => {
      forEach(blocks, block => {
        if (!find(this.blocks, {number: block.number })) {
          this.blocks.push(block);
        }
      });
    // })

    this.blocks = orderBy(this.blocks, ['number'], ['desc']);
    this.blocks = uniqBy(this.blocks, 'number');

    return loFilter(this.blocks, block => block.number > (blockHeight - count));
  }

  stopTimer() {
    this.stop$.next();
  }
}
