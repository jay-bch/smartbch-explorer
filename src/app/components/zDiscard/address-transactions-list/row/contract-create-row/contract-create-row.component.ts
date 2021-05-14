import { Component, OnInit } from '@angular/core';
import { DefaultRowComponent } from '../default-row/default-row.component';

@Component({
  selector: 'app-contract-create-row',
  templateUrl: './contract-create-row.component.html',
  styleUrls: ['./contract-create-row.component.scss']
})
export class ContractCreateRowComponent extends DefaultRowComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
