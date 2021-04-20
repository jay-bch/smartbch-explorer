import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlockResourceService } from 'src/app/services/resources/block-resource.service';
import { Block } from 'web3-eth';

const REFRESH_INTERVAL = 5000;
const COUNT = 10;

@Component({
  selector: 'app-latest-blocks',
  templateUrl: './latest-blocks.component.html',
  styleUrls: ['./latest-blocks.component.scss']
})
export class LatestBlocksComponent implements OnInit, OnDestroy {

  blocks: Block[] = [];

  stop$ = new Subject();

  constructor(
    private blockResource: BlockResourceService
  ) {
    timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
      this.blocks = await this.blockResource.getLatestBlocks(COUNT);
    });
  }

  async ngOnInit(): Promise<void> {
    this.blocks = await this.blockResource.getLatestBlocks(COUNT);
  }

  async getMore() {
    this.blocks = await this.blockResource.getLatestBlocks(5)
  }

  ngOnDestroy() {
    this.stop$.next();
  }

}
