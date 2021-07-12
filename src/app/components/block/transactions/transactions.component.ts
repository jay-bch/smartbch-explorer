import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { get, isNumber, map } from 'lodash';
import { IDecodedMethod } from 'src/app/services/helpers/event-decoder/event-decoder';
import { IBlockTransactions, ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction/transaction-resource.service';
import Web3 from 'web3';

const TABLECOUNT = 10;
export interface ITransactionTableRow {
  swatch: string;
  method: IDecodedMethod;
  type: string;
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
  selector: 'app-block-transactions-list',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsListComponent implements OnInit, OnChanges {
  @Input()
  blocknumber: number | string | undefined;
  blockTransactions: IBlockTransactions | undefined;

  tableDisplayedColumns: string[] = ['swatch', 'hash', 'method', 'from', 'fromToLabel', 'to', 'tokenSent', 'value'];
  tableData: ITransactionTableRow[] = [];
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  tablePageSizeOptions = [5, 10, 25, 100];
  txCount = 0;
  loading = true;

  constructor(
    private transactionResource: TransactionResourceService,
  ) { }

  ngOnInit(): void {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if(this.blocknumber) {
      this.loading = true;
      this.tableData = [];


      this.loadPage();
    }
  }

  public changeTablePage($event: PageEvent) {
    this.tableCurrentPage = $event.pageIndex;
    this.tableCurrentSize = $event.pageSize;
    this.loadPage();
  }

  private async loadPage() {
    if(this.blocknumber) {
      this.blockTransactions = await this.transactionResource.getTxsByBlock(this.blocknumber, this.tableCurrentPage + 1, this.tableCurrentSize);
      this.txCount = this.blockTransactions.total;
      this.loading = true;

      // const txsToShow = this.blockTransactions?.transactions.slice(this.tableCurrentPage * this.tableCurrentSize,  (this.tableCurrentPage + 1)  * this.tableCurrentSize);

      this.tableData = map(this.blockTransactions?.transactions, (tx: ITransaction) => this.mapTableRow(tx));
      this.loading = false;
    }
  }

  private mapTableRow(tx: ITransaction): ITransactionTableRow {
    return {
      swatch: `#${tx.data.hash.substring(tx.data.hash.length - 6, tx.data.hash.length)}`,
      nonce: tx.data.nonce,
      from: tx.data.from,
      to: tx.data.to,
      hash: tx.data.hash,
      method: tx.method,
      type: tx.type,
      value: isNumber(Number(tx.data.value)) ? tx.data.value : Web3.utils.hexToNumberString(tx.data.value),
      tokenSent: tx.sep20info?.transaction?.convertedValue ? `${tx.sep20info?.transaction?.convertedValue} ${tx.sep20info?.contract?.symbol}` : undefined,
      status: tx.receipt && tx.receipt.status === false ? false : true,
      statusMessage: get(tx.receipt, 'statusStr'),
      contractAddress: get(tx.receipt, 'contractAddress'),

    } as ITransactionTableRow
  }

  public trackByTable(index:number, el:any): number {
    return el.nonce;
  }

}
