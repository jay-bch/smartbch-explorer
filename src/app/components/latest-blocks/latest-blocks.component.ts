import { trigger, transition, style, animate } from '@angular/animations';
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
  styleUrls: ['./latest-blocks.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0', backgroundColor: '#C7E351' }),
        animate('1s ease-in', style({ opacity: '1', backgroundColor: '#74DD54' })),
        animate('1s ease-out', style({ backgroundColor: '#FFFFFF' })),
      ]),
    ]),
  ],
})

export class LatestBlocksComponent implements OnInit, OnDestroy {

  blocks: Block[] = [];

  stop$ = new Subject();

  constructor(
    private blockResource: BlockResourceService
  ) {
    timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
      this.blockResource.getLatestBlocks(COUNT).then(result => {
        this.blocks = result
      });
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

  trackByMethod(index:number, el:any): number {
    return el.number;
  }

}
