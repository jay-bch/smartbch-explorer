import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NgZone, ViewChild } from '@angular/core';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { filter, find } from 'lodash';
import { take } from 'rxjs/operators';
import { IEventLog } from 'src/app/services/resources/contract/contract-resource.service';

type DecodedViewMode = 'decoded' | 'hex';

@Component({
  selector: 'app-transaction-logs',
  templateUrl: './transaction-logs.component.html',
  styleUrls: ['./transaction-logs.component.scss']
})
export class TransactionLogsComponent implements OnInit, OnChanges {

  @Input()
  events: IEventLog[] | undefined;

  logView: DecodedViewMode = 'hex'

  rawLogs: string[] = [];
  hasDecodedLogs: boolean = false;

  @ViewChild('autosize') autosize: CdkTextareaAutosize | undefined;

  constructor(
    private _ngZone: NgZone
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.events) {

      const decodedLogs = filter(this.events, event => event.decodedLog !== undefined);

      if(decodedLogs.length) {
        this.hasDecodedLogs = true;
        this.logView = 'decoded';
      }

      // TODO - move to service
      this.rawLogs = [];

      this.events.forEach( (event, index) => {
        let rawLog = '';
        event.log.topics.forEach( (log: string, index: number) => {
          rawLog += `[${index}]:     ${log}`;

          if(index + 1 < event.log.topics.length) {
            rawLog += `\n`;
          }
        });

        if (event.log.data && event.log.data !== '0x') {
          rawLog += `\n[data]:  ${event.log.data}`;
        }
        this.rawLogs.push(rawLog)
      });
    }
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
