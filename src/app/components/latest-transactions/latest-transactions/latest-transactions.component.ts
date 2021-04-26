import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { last } from 'lodash';
import { ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction-resource.service';

@Component({
  selector: 'app-latest-transactions',
  templateUrl: './latest-transactions.component.html',
  styleUrls: ['./latest-transactions.component.scss'],
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
export class LatestTransactionsComponent implements OnInit {
  latestTransactions: any;
  transactions: ITransaction[] | undefined;
  loading = false;

  page = 1;
  pageSize = 10;
  placeholders: number[] = [];
  lastPage: number | undefined;

  constructor(
    private transactionResource: TransactionResourceService
  ) { }

  ngOnInit(): void {
    this.getTransactionsByPage(1, this.pageSize, 1000);
  }

  public nextPage() {
    if(this.hasNextPage()) {
      this.getTransactionsByPage(++this.page, this.pageSize, 1000);
    }
  }

  public hasNextPage() {
    if(this.lastPage === this.page ) {
      return false;
    }

    return this.pageSize === this.transactions?.length;
  }

  public previousPage() {
    if(this.hasPreviousPage()) {
      this.getTransactionsByPage(--this.page, this.pageSize, 1000);
    }
  }

  public hasPreviousPage() {
    return this.page > 1;
  }

  private async getTransactionsByPage(page: number, pageSize: number, scope: number) {
    if(!this.transactions) {
      this.loading = true;
      this.transactions = [];
    }

    if(page && page > 0) {
      this.page = page;
    }

    const txPage = await this.transactionResource.getLatestTransactions(page, this.pageSize, undefined, scope);

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

}
