import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { isArray } from 'lodash';
import { IDecodedValue } from 'src/app/services/helpers/event-decoder/event-decoder';
import { AddressResourceService } from 'src/app/services/resources/address/address-resource.service';
import { IDecodedDataTableRow } from '../transaction-method/transaction-method.component';

const defaultColumns: string[] = ['index', 'name', 'type', 'data', 'extra']

@Component({
  selector: 'app-decoded-values',
  templateUrl: './decoded-values.component.html',
  styleUrls: ['./decoded-values.component.scss']
})
export class DecodedValuesComponent implements OnInit, OnChanges {
  @Input()
  params: IDecodedValue[] | undefined;

  @Input()
  log: any;

  @Input()
  type: 'method' | 'log' = 'method';

  @Input()
  showExtra = false;

  tableDisplayedColumns: string[] = ['index', 'name', 'type', 'data'];
  tableData: IDecodedDataTableRow[] = [];

  constructor(
    private addressResource: AddressResourceService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.params) {
      if (this.showExtra) {
        this.tableDisplayedColumns.push('extra');
      }
      this.tableData = [];
      this.params.forEach( (param, index) => {
        const row: IDecodedDataTableRow = {
          index,
          name: param.name,
          type: param.type,
          data: isArray(param.value) ? param.value : new Array(param.value),
          extraData: []
        };

        row.data.forEach(value => {
          if(param.type?.startsWith('address') && value !== this.addressResource.getAddressName(value)) {
            row.extraData?.push({
              name: this.addressResource.getAddressName(value),
              value
            });
          }
        });

        this.tableData.push(row);
      });
    }
  }

}
