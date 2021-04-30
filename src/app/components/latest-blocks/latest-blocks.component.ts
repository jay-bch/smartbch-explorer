import { trigger, transition, style, animate, sequence, query, stagger,  } from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { map } from 'lodash';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimeElapsedPipe } from 'src/app/pipes/time-elapsed/time-elapsed.pipe';
import { BlockResourceService } from 'src/app/services/resources/block-resource.service';
import { Block } from 'web3-eth';

const REFRESH_INTERVAL = 5000;
const COUNT = 6;

export interface ICarouselBlock extends Block {
  gasPercentageUsed: string;
  age: string;
}

@Component({
  selector: 'app-latest-blocks',
  templateUrl: './latest-blocks.component.html',
  styleUrls: ['./latest-blocks.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':increment', [
        style({ opacity: '0' }),
        animate('500ms ease-in', style({ opacity: '1' })),
      ])
    ]),
    trigger('anim', [
      transition(':enter, void => *', [
        query('.box', [
          style({ opacity: 0, transform: 'translateX(-120%)'}),
          animate('500ms ease-in', style({ opacity: 1, transform: 'translateX(0%)' })),
        ]),
      ]),
      transition(':leave, * => void', [
        query('.box', [
          style({ transform: 'translateX(-100%)'}),
          animate('500ms ease-out', style({ opacity: 0, transform: 'translateX(100%)' })),
        ], { optional: true })
      ]),

      transition(':increment', [
        query('.box', [
          style({ transform: 'translateX(-100%)'}),
          animate('500ms ease-in', style({ transform: 'translateX(0%)' })),
        ], { optional: true })
      ]),
    ]),
  ],
})

export class LatestBlocksComponent implements OnInit, OnDestroy {
  @HostListener('mouseenter')
  onMouseEnter() {
    this.pauseRefresh = true;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.pauseRefresh = false;
  }

  blocks: ICarouselBlock[] = [];
  slideConfig = {"slidesToShow": 10, "slidesToScroll": 1};
  pauseRefresh = false;

  stop$ = new Subject();



  constructor(
    private blockResource: BlockResourceService,
    private timeElapsedPipe: TimeElapsedPipe
  ) {
    timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
      if(!this.pauseRefresh) {
        this.blockResource.getLatestBlocks(COUNT).then(result => {
          this.blocks = map(result, block => {
            // block.totalDifficulty
            return this.mapCarouselBlock(block);
          });

        });
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const blocks = await this.blockResource.getLatestBlocks(COUNT);
    this.blocks = map(blocks, block => this.mapCarouselBlock(block));
  }

  async getMore() {
    const blocks = await this.blockResource.getLatestBlocks(5);
    this.blocks = map(blocks, block => this.mapCarouselBlock(block));
  }

  ngOnDestroy() {
    this.stop$.next();
  }

  trackByMethod(index:number, el:any): number {
    return el.number;
  }

  mapCarouselBlock(block: Block): ICarouselBlock {
    return {
      ...block,
      gasPercentageUsed: `${(block.gasUsed / block.gasLimit).toFixed(2)} %`,
      age: this.timeElapsedPipe.transform(block.timestamp)
    } as ICarouselBlock
  }

}
