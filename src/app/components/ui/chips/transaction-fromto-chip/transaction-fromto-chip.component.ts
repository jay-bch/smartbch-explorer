import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-transaction-fromto-chip',
  templateUrl: './transaction-fromto-chip.component.html',
  styleUrls: ['./transaction-fromto-chip.component.scss']
})
export class TransactionFromtoChipComponent implements OnInit {

  @Input()
  method: string = '';

  @Input()
  fromToLabel: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
