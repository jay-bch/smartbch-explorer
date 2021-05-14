import { Component, Input, OnInit } from '@angular/core';
import { ITransaction } from 'src/app/services/resources/transaction/transaction-resource.service';

@Component({
  selector: 'app-default-row',
  templateUrl: './default-row.component.html',
  styleUrls: ['./default-row.component.scss']
})
export class DefaultRowComponent implements OnInit {

  @Input()
  transaction: ITransaction | undefined;

  @Input()
  address: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
