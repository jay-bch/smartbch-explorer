import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { get } from 'lodash';
import { take } from 'rxjs/operators';
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

  @ViewChild('autosize') autosize: CdkTextareaAutosize | undefined;


  statusStr: string | undefined;
  txFee: number = 0;
  txFeeSatoshi: string = ''
  gasPrice: number = 0;
  gasPriceSatoshi: string = '0';
  gasPercentageUsed: number = 0;
  inputData: string | undefined;
  timestamp: number | undefined;

  constructor(
    private _ngZone: NgZone
  ) { }

  async ngOnInit(): Promise<void> {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.transaction) {
      if(this.transaction?.receipt) {
        this.statusStr = get(this.transaction.receipt, 'statusStr');
        this.txFee = (this.transaction.receipt.gasUsed * parseInt(this.transaction.data.gasPrice, 10));
        this.txFeeSatoshi = (this.txFee * 1e-10).toFixed(4);
        this.gasPrice = parseInt(this.transaction.data.gasPrice, 10);
        this.gasPriceSatoshi = (this.gasPrice * 1e-10).toFixed(4);
        if(this.transaction.receipt?.gasUsed > 0) {
          this.gasPercentageUsed = (this.transaction.receipt?.gasUsed / this.transaction.data.gas) * 100 ;
        }

        if(this.transaction.data.input && this.transaction.data.input !== '0x') {
          this.inputData = this.transaction.data.input
        }
      }
    }

    if(changes.block) {
      this.timestamp = Number(this.block?.timestamp) * 1000;
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() =>  {
        if (this.autosize) {
          this.autosize.resizeToFitContent(true);
        }
    });
  }
}
