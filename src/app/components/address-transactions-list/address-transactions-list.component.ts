import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction-resource.service';

@Component({
  selector: 'app-address-transactions-list',
  templateUrl: './address-transactions-list.component.html',
  styleUrls: ['./address-transactions-list.component.scss']
})
export class AddressTransactionsListComponent implements OnInit, OnChanges {

  @Input()
  address: string | undefined;
  transactions: ITransaction[] | undefined;
  page = 1;
  pageSize = 10;
  placeholders: number[] = [];
  lastPage: number | undefined;
  loading = true;

  constructor(
    private transactionResource: TransactionResourceService
  ) { }


  async ngOnInit(): Promise<void> {
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
    this.loading = true;
    this.transactions = [];

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
}
