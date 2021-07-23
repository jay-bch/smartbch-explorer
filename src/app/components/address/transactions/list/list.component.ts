import { animate, query, sequence, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IAddressTransactions, ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction/transaction-resource.service';
import { map, get } from 'lodash';
import { MatSelectChange } from '@angular/material/select';
import Web3 from 'web3';
import { PageEvent } from '@angular/material/paginator';
import { SBCHSource } from 'src/app/services/api/node-api.service';
import { AddressResourceService } from 'src/app/services/resources/address/address-resource.service';
import { IDecodedMethod } from 'src/app/services/helpers/event-decoder/event-decoder';

const TABLECOUNT = 10;
export interface ITransactionTableRow {
  swatch: string;
  method: IDecodedMethod;
  type: string;
  nonce: number;
  hash: string;
  blockId: number;
  from: string;
  fromName: string;
  to: string;
  toName: string
  fromToLabel: string;
  value: string;
  tokenSent?: string;
  status: boolean;
  statusMessage?: string;
  contractAddress?: string;
}

const REFRESH_INTERVAL = 60000;

@Component({
  selector: 'app-address-transactions-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
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
export class AddressTransactionsListComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  address: string | undefined;

  @Input()
  refresh: boolean = false;

  // transactions: ITransaction[] = [];
  placeholders: number[] = [];
  lastPage: number | undefined;
  loading = true;
  txCount = 0;
  selectedType: SBCHSource = 'both';
  tableDisplayedColumns: string[] = ['swatch', 'hash', 'method', 'blockId', 'from', 'fromToLabel', 'to', 'value'];
  tableData: ITransactionTableRow[] = [];
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  tablePageSizeOptions = [5, 10, 25, 100];
  stop$ = new Subject();

  constructor(
    private transactionResource: TransactionResourceService,
    private addressResource: AddressResourceService
  ) { }

  async ngOnInit(): Promise<void> {
    if(this.refresh) {
      timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
        if(this.address) {
          this.getTransactionsByAddress(this.address, this.tableCurrentPage, this.tableCurrentSize, this.selectedType);
        }
      });
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.placeholders = Array(this.tableCurrentSize).fill(null);
    this.lastPage = undefined;
    this.tableCurrentPage = 0;
    if(this.address) {
      this.address = this.address.toLowerCase();
      await this.getTransactionsByAddress(this.address, 0, this.tableCurrentSize, this.selectedType);
    }
  }

  public loadNextPage() {
    if(this.address && this.hasNextPage()) {
      this.getTransactionsByAddress(this.address, ++this.tableCurrentPage, this.tableCurrentSize, this.selectedType);
    }
  }

  public hasNextPage() {
    if(this.lastPage === this.tableCurrentPage ) {
      return false;
    }

    return this.tableCurrentSize === this.tableData?.length;
  }

  public loadPreviousPage() {
    if(this.address && this.hasPreviousPage()) {
      this.getTransactionsByAddress(this.address, --this.tableCurrentPage, this.tableCurrentSize, this.selectedType);
    }
  }
  public hasPreviousPage() {
    return this.tableCurrentPage > 0;
  }

  private async getTransactionsByAddress(address: string, page: number, pageSize: number, selectedType: SBCHSource) {
    this.loading = true;

    let txPage: IAddressTransactions | undefined = undefined;
    txPage = await this.transactionResource.getTxByAddress(address, selectedType, page + 1, pageSize, undefined);

    // if we get a total from response, calculate how many pages we have
    if(txPage.total) {
      this.lastPage = Math.ceil(txPage.total / txPage.pageSize);
    } else {
      // if we didnt get a total, try to determine if we hit the last page

      // if returned page is empty, meaning all txs have been fetched. Go back 1 page
      if(page > 0 && txPage.transactions.length === 0) {
        this.lastPage = page - 1;
        this.loadPreviousPage();
        return;
      }

      // // if the page didn't fill up to pageSize this is the last
      if(txPage.transactions.length < pageSize) {
        this.lastPage = page;
      }
    }

    this.loading = false;
    this.txCount = txPage.total ?? 0;
    this.tableData = map(txPage.transactions, tx => this.mapTableRow(tx));

    return Promise.resolve();
  }

  changeType(event$: MatSelectChange) {
    console.log(event$);
    this.selectedType = event$.value;
    if(this.address) {
      this.tableCurrentPage = 0;
      this.getTransactionsByAddress(this.address, this.tableCurrentPage, this.tableCurrentSize, this.selectedType);
    }
  }

  public changeTablePage($event: PageEvent) {
    this.tableCurrentPage = $event.pageIndex;
    this.tableCurrentSize = $event.pageSize;
    if(this.address) {
      this.getTransactionsByAddress(this.address, $event.pageIndex, $event.pageSize, this.selectedType);
    }
  }

  private mapTableRow(tx: ITransaction): ITransactionTableRow {
    let fromToLabel = this.address?.toLowerCase() === tx.data.from.toLowerCase() ? 'OUT' : 'IN';
    if(tx.data.to && tx.data.from.toLowerCase() === tx.data.to.toLowerCase()) {
      fromToLabel = 'SELF';
    }

    return {
      swatch: `#${tx.data.hash.substring(tx.data.hash.length - 6, tx.data.hash.length)}`,
      blockId: tx.data.blockNumber,
      nonce: tx.data.nonce,
      from: tx.data.from,
      fromName: this.addressResource.getAddressName(tx.data.from),
      to: tx.data.to,
      toName: tx.data.to ? this.addressResource.getAddressName(tx.data.to) : tx.data.to,
      fromToLabel,
      hash: tx.data.hash,
      method: tx.method,
      type: tx.type,
      value: Web3.utils.hexToNumberString(tx.data.value),
      tokenSent: tx.sep20info?.transaction?.convertedValue ? `${tx.sep20info?.transaction?.convertedValue} ${tx.sep20info?.contract?.symbol}` : undefined,
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
