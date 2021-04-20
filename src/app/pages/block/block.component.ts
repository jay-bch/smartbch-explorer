import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlockResourceService } from 'src/app/services/resources/block-resource.service';
import { ActivatedRoute } from '@angular/router';
import { TransactionResourceService } from 'src/app/services/resources/transaction-resource.service';

import { Block } from 'web3-eth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit, OnDestroy {

  public transactions: any[] | undefined;

  public stop$ = new Subject();
  public block: Block | undefined;

  constructor(
    private route: ActivatedRoute,
    private blockResource: BlockResourceService,
    private transactionResource: TransactionResourceService,

  ) {
    this.route.params.pipe(takeUntil(this.stop$)).subscribe( async params => {
      if (params && params.blockId) {
        this.block = await this.blockResource.getBlock(params.blockId);
        const blockTransactions = await this.transactionResource.getTxsByBlock(parseInt(params.blockId, 10));
        this.transactions = blockTransactions;
      }
    });
  }

  async ngOnInit(): Promise<void> {
  }


  ngOnDestroy() {
    this.stop$.next();
  }


}
