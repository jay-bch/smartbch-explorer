import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction-resource.service';
import { Transaction } from 'web3-eth';

const REFRESH_INTERVAL = 5000;

@Component({
  selector: 'app-address-transactions-list',
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
export class AddressTransactionsListComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  address: string | undefined;

  @Input()
  refresh: boolean = false;

  transactions: ITransaction[] = [];
  page = 1;
  pageSize = 10;
  placeholders: number[] = [];
  lastPage: number | undefined;
  loading = true;

  stop$ = new Subject();

  constructor(
    private transactionResource: TransactionResourceService
  ) { }


  async ngOnInit(): Promise<void> {
    if(this.refresh) {
      timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntil(this.stop$)).subscribe( async () => {
        if(this.address) {
          this.getTransactionsByPage(this.address, this.page, this.pageSize);
        }
      });
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if(this.address) {
      this.address = this.address.toLowerCase();
      this.placeholders = Array(this.pageSize).fill(null);
      this.lastPage = undefined;
      this.page = 1;
      await this.getTransactionsByPage(this.address, 1, this.pageSize);
    }
  }

  public nextPage() {
    if(this.address && this.hasNextPage()) {
      this.getTransactionsByPage(this.address, ++this.page, this.pageSize);
    }
  }

  public hasNextPage() {
    if(this.lastPage === this.page ) {
      return false;
    }

    return this.pageSize === this.transactions?.length;
  }

  public previousPage() {
    if(this.address && this.hasPreviousPage()) {
      this.getTransactionsByPage(this.address, --this.page, this.pageSize);
    }
  }

  public hasPreviousPage() {
    return this.page > 1;
  }

  private async getTransactionsByPage(address: string, page: number, pageSize: number) {
    if(!this.refresh || !this.transactions) {
      this.loading = true;
      this.transactions = [];
    }

    if(page && page > 0) {
      this.page = page;
    }

    const txPage = await this.transactionResource.getTxByAddress(address, page, this.pageSize);

    // // next page is empty, meaning all txs have been fetched. Go back 1 page
    // // TODO: add modal to inform user this page was empty
    if(page > 1 && txPage.transactions.length === 0) {
      this.lastPage = page - 1;
      this.previousPage();
      return;
    }

    // // if the page didn't fill up, this is the last
    if(txPage.transactions.length < this.pageSize) {
      this.lastPage = page;
    }

    this.loading = false;
    this.transactions = txPage.transactions;
  }


  trackByMethod(index:number, el: ITransaction): number {
    return el?.data.blockNumber ?? 0;
  }


  ngOnDestroy() {
    this.stop$.next();
  }
}
