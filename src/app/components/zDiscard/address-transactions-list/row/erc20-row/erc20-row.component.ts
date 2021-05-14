import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';

import { DefaultRowComponent } from '../default-row/default-row.component';
import { first } from 'lodash';

@Component({
  selector: 'app-erc20-row',
  templateUrl: './erc20-row.component.html',
  styleUrls: ['./erc20-row.component.scss']
})
export class Erc20RowComponent extends DefaultRowComponent implements OnInit, OnChanges {

  constructor(
    private utilHelper: UtilHelperService
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {




    // this.erc20Resource.getTransactionForHash(this.transaction?.data.to, this.transaction?.data.)
  }



}
