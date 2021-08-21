import { trigger, transition, style, animate, sequence } from '@angular/animations';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { find, first, map } from 'lodash';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { EventDecoder } from 'src/app/services/helpers/event-decoder/event-decoder';
import { AddressResourceService } from 'src/app/services/resources/address/address-resource.service';
import { BlockResourceService } from 'src/app/services/resources/block/block-resource.service';
import { ContractResourceService, IContract } from 'src/app/services/resources/contract/contract-resource.service';
import { ITransaction, TransactionResourceService } from 'src/app/services/resources/transaction/transaction-resource.service';
import Web3 from 'web3';
import { Log } from 'web3-core';

const TABLECOUNT = 5;
export interface IEventLogRow {
  blockId: string;
  log: Log;
  rawLog: string;
  method: string;
  methodFunction?: string;
  tx: ITransaction | undefined;
  decodedLog: any;
}

@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('1000ms ease-out', style({ opacity: '0' })),
        animate('250ms ease-out', style({ opacity: '1' })),
        // animate('1s ease-out', style({ backgroundColor: '#FFFFFF' })),
      ]),
      transition(':leave', [
        // style({ opacity: '1' }),
        animate('250ms ease-in', style({ opacity: '0'})),
        // animate('250s ease-out', style({ backgroundColor: '#FFFFFF' })),
      ]),
    ]),
    trigger('rowsAnimation', [
      transition(':enter', [
        style({ height: '*', opacity: '0', transform: 'translateX(-100%)', 'box-shadow': 'none' }),
        sequence([
          animate("250ms ease-in", style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none'  })),
          animate("250ms ease-in", style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
        ])
      ])
    ])
  ],
})
export class EventLogComponent implements OnInit, OnChanges {

  @Input()
  address: string | undefined;

  lastPage: number | undefined;
  loading = true;
  refreshing = false;
  tableDisplayedColumns: string[] = ['transaction', 'data'];
  tablePageSizeOptions = [5, 10, 25, 100];
  tableData: IEventLogRow[] = [];
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  tableLength = 0;
  tableMinSize = TABLECOUNT;
  stop$ = new Subject();
  contract: IContract | undefined;
  logDecoder: EventDecoder | undefined;
  blockHeight: number | undefined;
  rawLogs: string[] | undefined;

  constructor(
    private blockService: BlockResourceService,
    private addressService: AddressResourceService,
    private contractService: ContractResourceService,
    private transactionService: TransactionResourceService,

  ) { }

  ngOnInit(): void {
    this.blockService.blockHeight$.pipe( filter( (height) => !!height ), take(1) ).subscribe( (height) => {
      this.blockHeight = height;
    });
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {


    if(this.address) {
      this.contract = await this.contractService.getContract(this.address);
      if (this.contract && this.contract.abi) {
        this.logDecoder = new EventDecoder(this.contract.abi);
      }

      this.lastPage = undefined;
      this.tableCurrentPage = 0;
      this.loadLogs();
    }
  }

  async loadLogs() {
    if(this.address && this.blockHeight) {
      this.loading = true;

      // console.log('>> ', this.tableCurrentPage * this.tableCurrentSize, (this.tableCurrentPage + 1) * this.tableCurrentSize)
      const limit = (this.tableCurrentPage + 1) * this.tableCurrentSize;
      const response = await this.addressService.getEventLogs(this.address, this.blockHeight, 0, limit);

      if(this.lastPage === undefined) {
        if(response.length === limit - this.tableCurrentSize) {
          this.tableLength = limit - this.tableCurrentSize;
          this.lastPage = this.tableCurrentPage - 1;
          this.previousPage();

        } else if(response.length > 0 && response.length < limit) {
          this.tableLength = response.length;
          this.lastPage = this.tableCurrentPage;
        } else {
          // we don't know how many events there are. Set the table length to current size + 1 so paginator has next page option
          this.tableLength = response.length + 1;
        }
      }

      const page = response.slice(this.tableCurrentPage * this.tableCurrentSize, (this.tableCurrentPage + 1) * this.tableCurrentSize)
      const txPromises: Promise<ITransaction | undefined>[] = map(page, log => this.transactionService.getTxByHash(log.transactionHash));

      Promise.all(txPromises).then((txs) => {
        this.tableData = map(page, log => {
          // TODO - move to service
          let rawLog = '';

          log.topics.forEach( (topic, index) => {

          rawLog += `[${index}]:     ${topic}`;

            if(index + 1 < log.topics.length) {
              rawLog += `\n`;
            }
            if (log.data && log.data !== '0x') {
              rawLog += `\n[data]:  ${topic}`;
            }

          });

          const tx = find(txs, { data: {hash: log.transactionHash} })
          return this.mapTableRow(log, rawLog, tx);
        });

        this.loading = false;
      });
    }
  }

  public hasNext() {
    return this.tableData.length === this.tableCurrentSize;
  }

  public hasPrevious() {
    return this.tableCurrentPage > 0;
  }

  public loadMore() {
    if (this.hasNext()) {
      this.tableCurrentSize = this.tableCurrentSize + TABLECOUNT;
      this.loadLogs();
    }
  }

  public nextPage() {
    this.tableCurrentPage++;
    this.loadLogs();
  }

  public previousPage() {
    this.tableCurrentPage--;
    this.loadLogs();
  }

  changeTablePage($event: PageEvent) {
    this.tableCurrentPage = $event.pageIndex;
    this.tableCurrentSize = $event.pageSize;
    this.loadLogs();
  }

  private mapTableRow(row: Log, rawLog: string, tx?: ITransaction) {
    let log: any | undefined = undefined;

    if(row.address === this.address && this.logDecoder) {
      const _log = this.logDecoder.decodeLogs([row]);
      log = first(_log);
    }

    let methodFunction = undefined;

    if (tx && tx.method && tx.method.params) {
      let inner: string = '';
      tx.method.params.forEach( (param, index, params) => {
        inner += ` ${param.name}<${param.type}>`;

        if(params.length > index + 1) {
          inner += `, `
        }
      });
      methodFunction = `${tx.method.name}( ${inner} )`;

    }

    return {
      blockId: Web3.utils.hexToNumberString(row.blockNumber),
      log: row,
      decodedLog: log,
      method: tx?.data.input.substring(0, 10),
      methodFunction: methodFunction,
      rawLog,
      tx,

    } as IEventLogRow
  }
}
