import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IAddressTransactions, ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction/transaction-resource.service';
import { map, get } from 'lodash';
import { MatSelectChange } from '@angular/material/select';
import Web3 from 'web3';
import { PageEvent } from '@angular/material/paginator';
import { SBCHSource } from 'src/app/services/api/node-api.service';


const TABLECOUNT = 10;
export interface ITransactionTableRow {
  swatch: string;
  method: string;
  nonce: number;
  hash: string;
  blockId: number;
  from: string;
  to: string;
  fromToLabel: string;
  value: string;
  tokenSent?: string;
  status: boolean;
  statusMessage?: string;
  contractAddress?: string;
}


const REFRESH_INTERVAL = 15000;

@Component({
  selector: 'app-address-transactions-list-old',
  templateUrl: './address-transactions-list.component.html',
  styleUrls: ['./address-transactions-list.component.scss'],
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
export class AddressTransactionsListComponentOld implements OnInit, OnChanges, OnDestroy {

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
  tableDisplayedColumns: string[] = ['swatch', 'hash', 'method', 'blockId', 'from', 'fromToLabel', 'to', 'tokenSent', 'value'];
  tableData: ITransactionTableRow[] = [];
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  tablePageSizeOptions = [5, 10, 25, 100];
  stop$ = new Subject();

  constructor(
    private transactionResource: TransactionResourceService
  ) { }

  async ngOnInit(): Promise<void> {
    if(this.refresh) {
      timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
        if(this.address) {
          this.getTransactionsByAddress(this.address, this.tableCurrentPage, this.tableCurrentSize, this.selectedType);
        } else {
          if(this.tableCurrentPage === 0) {
            this.getLatestTransactions(this.tableCurrentPage, this.tableCurrentSize, 10000);
          }
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
    } else {
      // this.tableDisplayedColumns = ['swatch', 'hash', 'blockId', 'from', 'to', 'value'];
      this.getLatestTransactions(0, this.tableCurrentSize, 10000);
      this.txCount = 10000;
    }
  }

  public loadNextPage() {
    if(this.hasNextPage()) {
      if(this.address) {
        this.getTransactionsByAddress(this.address, ++this.tableCurrentPage, this.tableCurrentSize, this.selectedType);
      } else {
        this.getLatestTransactions(++this.tableCurrentPage, this.tableCurrentSize, 10000);
      }
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
    txPage = await this.transactionResource.getTxByAddress(address, selectedType, page + 1, pageSize);

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

  private async getLatestTransactions(page: number, pageSize: number, scope: number) {
    // if(!this.transactions) {
    //   this.loading = true;
    //   this.transactions = [];
    // }

    // if(page && page > 0) {
    //   this.page = page;
    // }
    console.log('PAGE', page);
    const txPage = await this.transactionResource.getLatestTransactions(page + 1, this.tableCurrentSize, undefined, scope);

    // // // next page is empty, meaning all txs have been fetched. Go back 1 page
    // if(page > 0 && txPage.transactions.length === 0) {
    //   this.lastPage = page - 1;
    //   this.loadPreviousPage();
    //   return;
    // }

    // // // // if the page didn't fill up, this is the last
    // if(txPage.transactions.length < this.tableCurrentSize) {
    //   this.lastPage = page;
    // }

    this.loading = false;
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
    } else {
      this.getLatestTransactions(this.tableCurrentPage, this.tableCurrentSize, 1000);
    }
  }

  private mapTableRow(tx: ITransaction): ITransactionTableRow {
    return {
      swatch: `#${tx.data.hash.substring(tx.data.hash.length - 6, tx.data.hash.length)}`,
      blockId: tx.data.blockNumber,
      nonce: tx.data.nonce,
      from: tx.data.from,
      to: tx.data.to,
      fromToLabel: this.address?.toLowerCase() === tx.data.from.toLowerCase() ? 'OUT' : 'IN',
      hash: tx.data.hash,
      method: tx.type,
      value: Web3.utils.hexToNumberString(tx.data.value),
      tokenSent: tx.erc20info?.transaction?.convertedValue ? `${tx.erc20info?.transaction?.convertedValue} ${tx.erc20info?.contract?.symbol}` : undefined,
      status: tx.receipt && tx.receipt.status === false ? false : true,
      statusMessage: get(tx.receipt, 'statusStr'),
      contractAddress: get(tx.receipt, 'contractAddress'),

    } as ITransactionTableRow
  }
  trackByMethod(index:number, el: ITransaction): number {
    return el?.data.blockNumber ?? 0;
  }
  public trackByTable(index:number, el:any): number {
    return el.nonce;
  }

  ngOnDestroy() {
    this.stop$.next();
  }
}
