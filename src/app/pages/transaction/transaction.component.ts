import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ITransaction, TransactionResourceService } from '../../services/resources/transaction/transaction-resource.service';
import { Block } from 'web3-eth';
import { BlockResourceService } from 'src/app/services/resources/block/block-resource.service';

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


  constructor(
    private route: ActivatedRoute,
    private transactionResource: TransactionResourceService,
    private blockResource: BlockResourceService
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

}
