import { Component, Input, OnInit } from '@angular/core';
import { ITransaction } from 'src/app/services/resources/transaction/transaction-resource.service';

@Component({
  selector: 'app-tx-result',
  templateUrl: './tx-result.component.html',
  styleUrls: ['./tx-result.component.scss']
})
export class TxResultComponent implements OnInit {

  @Input()
  tx: ITransaction | undefined;
  timestamp: number | undefined;

  constructor() { }

  ngOnInit(): void {
    if(this.tx?.block?.timestamp) {
      this.timestamp = Number(this.tx?.block?.timestamp);
    }
  }

}
