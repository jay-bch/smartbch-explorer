import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ITransaction, TransactionResourceService } from '../../services/resources/transaction/transaction-resource.service';
import { Block } from 'web3-eth';
import { BlockResourceService } from 'src/app/services/resources/block/block-resource.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})

export class TransactionComponent implements OnInit {

  public stop$ = new Subject();
  transaction: ITransaction | undefined;
  transactionBlock: Block | undefined;
  blockHeight$: BehaviorSubject<number | undefined> | undefined;
  @ViewChild('autosize') autosize: CdkTextareaAutosize | undefined;

  constructor(
    private route: ActivatedRoute,
    private transactionResource: TransactionResourceService,
    private blockResource: BlockResourceService,
    private _ngZone: NgZone
  ) {
    this.route.params.pipe(takeUntil(this.stop$)).subscribe( async params => {
      if (params && params.transactionId) {
        this.transaction = await this.transactionResource.getTxByHash(params.transactionId);
        if(this.transaction && this.transaction.data.blockNumber) {
          this.transactionBlock = await this.blockResource.getBlock(this.transaction.data.blockNumber);
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.blockHeight$ = this.blockResource.blockHeight$;
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
