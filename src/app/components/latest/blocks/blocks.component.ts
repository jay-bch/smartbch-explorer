import { trigger, transition, style, animate, query, sequence } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { map } from 'lodash';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';
import { TimeElapsedPipe } from 'src/app/pipes/time-elapsed/time-elapsed.pipe';
import { BlockResourceService } from '../../../services/resources/block/block-resource.service';
import { Block } from 'web3-eth';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';

const CAROUSELCOUNT = 6;
const TABLECOUNT = 10;
const LS_BLOCK_SHOWCAROUSEL   = 'block_showCarousel';
const LS_BLOCK_SHOWTABLE       = 'block_showTable';
const LS_BLOCK_AUTOREFRESH    = 'block_autoRefresh';
export interface ICarouselBlock extends Block {
  gasPercentageUsed: string;
  age: string;
}
export interface IBlockTableRow {
  swatch: string;
  block: number;
  hash: string;
  age: string;
  date: Date | undefined;
  validator: string;
  gasUsed: number;
  gasLimit: number;
  gasPercentageUsed: string;
  count: number;
}
@Component({
  selector: 'app-latest-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':increment', [
        style({ opacity: '0' }),
        animate('500ms ease-in', style({ opacity: '1' })),
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('1000ms ease-in', style({ opacity: '1' })),
      ])
    ]),
    trigger('growVertical', [
      transition(":enter", [
        // :enter is alias to 'void => *'
        style({ height: "0", overflow: "hidden" }),
        animate('250ms ease-in', style({ height: "*" }))
      ]),
      transition(":leave", [
        // :leave is alias to '* => void'
        animate('250ms ease-out', style({ height: 0, overflow: "hidden" }))
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
    trigger('rowsAnimation', [
      transition(':enter', [
        style({ height: '*', opacity: '0', transform: 'translateX(-100%)', 'box-shadow': 'none' }),
        sequence([
          animate("500ms ease-in", style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none'  })),
          animate("500ms ease-in", style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
        ])
      ])
    ])
  ],
})

export class LatestBlocksComponent implements OnInit, OnDestroy {
  initialized: boolean = false;
  blockHeight$: BehaviorSubject<number | undefined> | undefined;
  blocks: ICarouselBlock[] = [];
  pauseRefresh: boolean = false;
  autoRefresh: boolean = true;
  showCarousel: boolean = true;
  showTable: boolean = true;
  tableDisplayedColumns: string[] = ['swatch','block', 'age', 'hash', 'validator', 'count', 'gas'];
  tableData: IBlockTableRow[] = [];
  tableData$: Subject<IBlockTableRow[]> = new Subject<IBlockTableRow[]>();
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  blockHeight = 0;
  tablePageSizeOptions = [5, 10, 25, 100];
  stop$ = new Subject();
  invisibleBlocks: number = 0;
  isRefreshingCarousel: boolean = false;
  rawBlocks: Block[] = [];
  latestVisibleBlock: number = 0;

  constructor(
    private blockResource: BlockResourceService,
    private timeElapsedPipe: TimeElapsedPipe,
    private helper: UtilHelperService,
  ) {}

  async ngOnInit(): Promise<void> {
    // get settings from local storage
    if(localStorage.getItem(LS_BLOCK_SHOWCAROUSEL)) {
      this.showCarousel = JSON.parse(localStorage.getItem(LS_BLOCK_SHOWCAROUSEL) ?? 'true');
    }

    if(localStorage.getItem(LS_BLOCK_SHOWTABLE)) {
      this.showTable = JSON.parse(localStorage.getItem(LS_BLOCK_SHOWTABLE) ?? 'false');
    }

    if(localStorage.getItem(LS_BLOCK_AUTOREFRESH)) {
      this.autoRefresh = JSON.parse(localStorage.getItem(LS_BLOCK_AUTOREFRESH) ?? 'true');
    }

    // wait for blockheight
    this.blockHeight$ = this.blockResource.blockHeight$;
    this.blockHeight, this.latestVisibleBlock = await this.blockHeight$.pipe(filter(height => height !== undefined && height > 0), take(1)).toPromise() ?? 0;

    // if somehow both carousel and table are not visible, toggle table
    if(!this.showCarousel && !this.showTable) {
      this.showTable = true;
    }

    // fill table data with placeholder content
    this.setTablePlaceholders();

    // init table
    this.refreshAll();
    // if(this.showTable) {
    //   this.setTablePlaceholders();
    //   await this.refreshTable();
    // }

    // // init carousel
    // if(this.showCarousel) {
    //   await this.refreshLatestCarouselBlocks();
    // }

    // list to blockheight changes and autorefresh if enabled
    this.blockHeight$.pipe(takeUntil(this.stop$), filter(height => height !== undefined && height > 0)).subscribe(async height => {
      // set latest height
      this.blockHeight = height ?? 0;

      if(this.autoRefresh && !this.pauseRefresh) {
        this.latestVisibleBlock = height ?? 0;

        if(this.showCarousel) {
          await this.refreshLatestCarouselBlocks();
        }

        if(this.showTable && (this.tableCurrentPage === 0)) {
          await this.refreshTable()
        }
      }

      // calculate amount of invisible blocks
      this.invisibleBlocks = this.blockHeight - this.latestVisibleBlock;
    });


  }

  ngOnDestroy() {
    this.stop$.next();
  }
  public toggleRefresh() {
    this.autoRefresh = !this.autoRefresh;
    localStorage.setItem(LS_BLOCK_AUTOREFRESH, JSON.stringify(this.autoRefresh));
  }
  public refreshAll() {
    this.blockHeight = this.blockHeight$?.getValue() ?? 0;
    this.invisibleBlocks = 0;
    this.latestVisibleBlock = this.blockHeight;

    if(this.showCarousel) {
      this.refreshLatestCarouselBlocks();
    }

    if(this.showTable) {
      this.refreshTable();
    }
  }

  public async refreshLatestCarouselBlocks() {
    this.isRefreshingCarousel = true;
    this.rawBlocks = await this.blockResource.getLatestBlocks(Math.max(CAROUSELCOUNT, this.tableCurrentSize), this.blockHeight);

    this.blocks = map(this.rawBlocks, block => {
      return this.mapCarouselBlock(block);
    });
    this.isRefreshingCarousel = false;

    return Promise.resolve();
  }

  public async refreshTable() {
    return this.setTablePage(this.blockHeight, this.tableCurrentSize)
  }
  public async toggleTable(){
    this.showTable = !this.showTable;
    localStorage.setItem(LS_BLOCK_SHOWTABLE, JSON.stringify(this.showTable));
    if(this.showTable) {
      // table length is current block height
      this.setTablePage(this.blockHeight, this.tableCurrentSize);
    }
  }
  public async toggleCarousel() {
    this.showCarousel = !this.showCarousel
    localStorage.setItem(LS_BLOCK_SHOWCAROUSEL, JSON.stringify(this.showCarousel));
    if(!this.showCarousel && !this.showTable) {
      this.toggleTable();
    }

    if(this.showCarousel) {
      if(!this.autoRefresh) {
        this.rawBlocks = await this.blockResource.getLatestBlocks(Math.max(CAROUSELCOUNT, this.tableCurrentSize), this.blockHeight);
      }
      this.refreshLatestCarouselBlocks();
    }
  }
  public changeTablePage($event: PageEvent) {
    this.tableCurrentPage = $event.pageIndex;
    this.tableCurrentSize = $event.pageSize;
    this.setTablePage($event.length - ($event.pageSize * $event.pageIndex), $event.pageSize);
  }
  async setTablePage(startBlock: number, pageSize: number) {
    const blockPromises: Promise<Block>[] = [];
    for(let i = startBlock; i > (startBlock - pageSize) && i > 0; i--) {
      blockPromises.push(this.blockResource.getBlock(i));
    }

    this.tableData = map(await Promise.all(blockPromises), block => {
      return this.mapTableRow(block);
    });

    this.tableData$.next(this.tableData);

    return Promise.resolve();
  }

  private setTablePlaceholders() {
    this.tableData = map(Array.from(Array(this.tableCurrentSize).keys()), ()=>{
      return {
        swatch: '',
        block: -1,
        hash: '',
        age: '',
        validator: '',
        count: -1,
        gasLimit: -1,
        gasUsed: -1,
        gasPercentageUsed: '',
        date: undefined
      } as IBlockTableRow
    });
    this.tableData$.next(this.tableData);
  }

  private mapCarouselBlock(block: Block): ICarouselBlock {
    return {
      ...block,
      gasPercentageUsed: `${this.helper.getGasPercentageUsed(block)} %`,
      age: this.timeElapsedPipe.transform(block.timestamp)
    } as ICarouselBlock
  }

  private mapTableRow(block: Block): IBlockTableRow {
    return {
      swatch: `#${block.hash.substring(block.hash.length - 6, block.hash.length)}`,
      block: block.number,
      hash: block.hash,
      age: this.timeElapsedPipe.transform(block.timestamp),
      date: new Date(block.timestamp),
      validator: block.miner,
      count: block.transactions.length,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      gasPercentageUsed: this.helper.getGasPercentageUsed(block)
    } as IBlockTableRow
  }

  // used for ngFor in carousel, so it will not trigger animations for non new blocks
  public trackByCarousel(index:number, el:any): number {
    return el.number;
  }
  public trackByTable(index:number, el:any): number {
    return el.block;
  }
}
