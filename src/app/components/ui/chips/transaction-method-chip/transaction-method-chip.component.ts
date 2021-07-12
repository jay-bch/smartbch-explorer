import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-transaction-method-chip',
  templateUrl: './transaction-method-chip.component.html',
  styleUrls: ['./transaction-method-chip.component.scss']
})
export class TransactionMethodChipComponent implements OnInit {

  @Input()
  method: any;

  constructor() { }

  ngOnInit(): void {
  }
}
