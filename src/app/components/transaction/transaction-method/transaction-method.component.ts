import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';
import { IDecodedValue } from 'src/app/services/helpers/event-decoder/event-decoder';
import Web3 from 'web3';

export interface IDecodedDataTableRow {
  index: number,
  name: string,
  type?: string,
  data: string[]
  extraData?: any[]
}

type DecodedViewMode = 'default' | 'original' | 'decoded' | 'utf8';

@Component({
  selector: 'app-transaction-method',
  templateUrl: './transaction-method.component.html',
  styleUrls: ['./transaction-method.component.scss']
})
export class TransactionMethodComponent implements OnInit, OnChanges {

  @Input()
  input: string | undefined;

  @Input()
  params: IDecodedValue[] | undefined;

  @Input()
  name: string | undefined;

  @ViewChild('autosize') autosize: CdkTextareaAutosize | undefined;

  rawMethod: string | undefined;
  rawInputData: string | undefined;

  inputView: DecodedViewMode = 'default'
  utf8: string | undefined;

  constructor(
    private _ngZone: NgZone
  ) { }

  ngOnChanges(changes: SimpleChanges): void {

      // this.tableData = [];
      // this.params.forEach( (param, index) => {
      //   const row: IDecodedDataTableRow = {
      //     index,
      //     name: param.name,
      //     type: param.type,
      //     data: isArray(param.value) ? param.value : new Array(param.value),
      //     extraData: []
      //   };

      //   row.data.forEach(value => {
      //     if(param.type?.startsWith('address') && value !== this.addressResource.getAddressName(value)) {
      //       row.extraData?.push({
      //         name: this.addressResource.getAddressName(value),
      //         value
      //       });
      //     }
      //   });

    if(this.input) {
      // this.rawInputData = [];
      this.rawMethod = this.input.substring(0, 10);
      const values = this.input.substring(10, this.input.length);
      let index: number = 0;

      const splitInput = [];
      while (index < values.length) {
          splitInput.push(values.substring(index, Math.min(index+64, values.length)));
          index=index+64;
      }

      this.rawInputData = '';

      if(this.name && this.params) {
        this.rawInputData += `${this.name}`

        if(this.params) {
          const length = this.params.length;
          this.rawInputData += `(`;
          this.params.forEach((param, index) => {
            this.rawInputData += `${param.type} ${param.name}`;

            if(index + 1 < length ) {
              this.rawInputData += `, `;
            }

          });
          this.rawInputData += `)`;
        }

        this.rawInputData += `\n\n`;
      } else {

      }

      this.rawInputData += `${this.rawMethod}\n`;

      splitInput.forEach( (value, index) => {
        this.rawInputData += `[${index}]: ${value}\n`;
      });

      this.utf8 = Web3.utils.toAscii(this.input);

      if(this.params?.length) {
        this.inputView = 'decoded';
      }

    }
  }

  ngOnInit(): void {



  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() =>  {
        if (this.autosize) {
          this.autosize.resizeToFitContent(true);
        }
    });
  }

}
