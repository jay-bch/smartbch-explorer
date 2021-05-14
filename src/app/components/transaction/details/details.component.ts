import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { get } from 'lodash';
import { ITransaction } from 'src/app/services/resources/transaction/transaction-resource.service';
import { Block } from 'web3-eth';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class TransactionDetailsComponent implements OnInit, OnChanges {
  @Input()
  transaction: ITransaction | undefined

  @Input()
  block: Block | undefined;

  @Input()
  header: number | null | undefined;

  statusStr: string | undefined;
  txFee: string | undefined;
  gSat: number | undefined;
  gasPercentageUsed: number = 0;
  inputData: string | undefined;
  timestamp: number | undefined;

  constructor(
  ) { }

  async ngOnInit(): Promise<void> {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.transaction) {
      if(this.transaction.receipt) {
        this.statusStr = get(this.transaction.receipt, 'statusStr');
        this.txFee = (this.transaction.receipt.gasUsed * parseInt(this.transaction.data.gasPrice, 10)).toString();
        this.gSat = parseInt(this.transaction.data.gasPrice, 10) / 1000000000;
        if(this.transaction.receipt?.gasUsed > 0) {
          this.gasPercentageUsed = (this.transaction.receipt?.gasUsed / this.transaction.data.gas) * 100 ;
        }
        if(this.transaction.data.input && this.transaction.data.input !== '0x') {
          this.inputData = this.transaction.data.input
        }
        this.timestamp = Number(this.block?.timestamp) * 1000;
      }
    }
  }
}
