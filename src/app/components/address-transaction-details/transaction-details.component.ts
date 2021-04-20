import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from 'web3-eth';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {
  @Input()
  transaction: Transaction | undefined

  constructor(
  ) { }

  async ngOnInit(): Promise<void> {

  }



}
