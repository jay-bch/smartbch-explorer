import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction/transaction-resource.service';
import { map, get } from 'lodash';
import Web3 from 'web3';
import { timingSafeEqual } from 'crypto';

const TABLECOUNT = 10;
const REFRESH_INTERVAL = 15000;
const BLOCK_SCOPE = 1000;

export interface ITransactionTableRow {
  swatch: string;
  method: string;
  nonce: number;
  hash: string;
  blockId: number;
  from: string;
  to: string;
  value: string;
  tokenSent?: string;
  status: boolean;
  statusMessage?: string;
  contractAddress?: string;
}

@Component({
  selector: 'app-latest-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
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
export class LatestTransactionsComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  refresh: boolean = false;
  placeholders: number[] = [];
  lastPage: number | undefined;
  loading = true;
  refreshing = false;
  tableDisplayedColumns: string[] = ['swatch', 'hash', 'method', 'blockId', 'from', 'fromToLabel', 'to', 'tokenSent', 'value'];
  tableData: ITransactionTableRow[] = [];
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  tableMinSize = TABLECOUNT;
  stop$ = new Subject();
  blockScope: number = BLOCK_SCOPE;

  constructor(
    private transactionResource: TransactionResourceService
  ) { }

  async ngOnInit(): Promise<void> {
    if(this.refresh) {
      timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
        if(!this.loading) {
          this.refreshing = true;
          await this.getLatestTransactions();
          this.refreshing = false;
        }
      });
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.placeholders = Array(this.tableCurrentSize).fill(null);
    this.lastPage = undefined;
    this.tableCurrentPage = 0;
    this.getLatestTransactions();
  }

  public hasMore() {
    return this.tableData.length === this.tableCurrentSize;
  }

  public loadMore() {
    if (this.hasMore()) {
      this.tableCurrentSize = this.tableCurrentSize + TABLECOUNT;
      this.getLatestTransactions();
    }
  }

  reset() {
    this.tableCurrentSize = this.tableMinSize;
    this.getLatestTransactions();
  }

  private async getLatestTransactions() {
    this.loading = true;
    const txPage = await this.transactionResource.getLatestTransactions(this.tableCurrentPage + 1, this.tableCurrentSize, undefined, this.blockScope);
    this.loading = false;
    this.tableData = map(txPage.transactions, tx => this.mapTableRow(tx));

    return Promise.resolve();
  }

  private mapTableRow(tx: ITransaction): ITransactionTableRow {
    return {
      swatch: `#${tx.data.hash.substring(tx.data.hash.length - 6, tx.data.hash.length)}`,
      blockId: tx.data.blockNumber,
      nonce: tx.data.nonce,
      from: tx.data.from,
      to: tx.data.to,
      hash: tx.data.hash,
      method: tx.type,
      value: Web3.utils.hexToNumberString(tx.data.value),
      tokenSent: tx.erc20info?.transaction?.convertedValue ? `${tx.erc20info?.transaction?.convertedValue} ${tx.erc20info?.contract?.symbol}` : undefined,
      status: tx.receipt && tx.receipt.status === false ? false : true,
      statusMessage: get(tx.receipt, 'statusStr'),
      contractAddress: get(tx.receipt, 'contractAddress'),

    } as ITransactionTableRow
  }

  public trackByTable(index:number, el:any): number {
    return el.nonce;
  }

  ngOnDestroy() {
    this.stop$.next();
  }
}
