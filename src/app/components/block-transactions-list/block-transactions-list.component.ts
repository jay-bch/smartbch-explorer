import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-block-transactions-list',
  templateUrl: './block-transactions-list.component.html',
  styleUrls: ['./block-transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  @Input()
  blocknumber: number | string | undefined;

  @Input()
  transactions: any[] | undefined


  constructor() { }

  ngOnInit(): void {
  }

}
