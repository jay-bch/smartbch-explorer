import { Component, OnInit } from '@angular/core';
import { DefaultRowComponent } from '../default-row/default-row.component';

@Component({
  selector: 'app-contract-call-row',
  templateUrl: './contract-call-row.component.html',
  styleUrls: ['./contract-call-row.component.scss']
})
export class ContractCallRowComponent extends DefaultRowComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
