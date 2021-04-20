import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TransactionResourceService } from 'src/app/services/resources/transaction-resource.service';
import Web3 from 'web3';
import { Transaction } from 'web3-eth';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  public transaction: Transaction | undefined;
  public stop$ = new Subject();
  input: any;

  constructor(
    private route: ActivatedRoute,
    private transactionResource: TransactionResourceService
  ) {
    this.route.params.pipe(takeUntil(this.stop$)).subscribe( async params => {
      if (params && params.transactionId) {
        this.transaction = await this.transactionResource.getTxByHash(params.transactionId);
        this.input = Web3.utils.hexToBytes(this.transaction.input);
      }
    });
  }

  async ngOnInit(): Promise<void> {
  }

}
