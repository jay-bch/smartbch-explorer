import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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

const TABLECOUNT = 10;
export interface IEventLogRow {
  blockId: string;
  log: Log;
  method: string;
  methodFunction?: string;
  tx: ITransaction | undefined;
  decodedLog: any;
}

@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss']
})
export class EventLogComponent implements OnInit, OnChanges {

  @Input()
  address: string | undefined;

  lastPage: number | undefined;
  loading = true;
  refreshing = false;
  tableDisplayedColumns: string[] = ['transaction', 'data'];
  tableData: IEventLogRow[] = [];
  tableCurrentPage = 0;
  tableCurrentSize = TABLECOUNT;
  tableMinSize = TABLECOUNT;
  stop$ = new Subject();
  contract: IContract | undefined;
  logDecoder: EventDecoder | undefined;
  blockHeight: number | undefined;

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


      console.log('>> ', this.tableCurrentPage * this.tableCurrentSize, (this.tableCurrentPage + 1) * this.tableCurrentSize)
      const response = await this.addressService.getEventLogs(this.address, 0, this.blockHeight, (this.tableCurrentPage + 1) * this.tableCurrentSize);
      const page = response.slice(this.tableCurrentPage * this.tableCurrentSize, (this.tableCurrentPage + 1) * this.tableCurrentSize)
      console.log('PAGE', page);
      const txPromises: Promise<ITransaction | undefined>[] = map(page, log => this.transactionService.getTxByHash(log.transactionHash));

      Promise.all(txPromises).then((txs) => {
        this.tableData = map(page, log => {
          const tx = find(txs, { data: {hash: log.transactionHash} })
          return this.mapTableRow(log, tx);
        });
      });
    }
  }

  public hasMore() {
    return this.tableData.length === this.tableCurrentSize;
  }

  public loadMore() {
    if (this.hasMore()) {
      this.tableCurrentSize = this.tableCurrentSize + TABLECOUNT;
      this.loadLogs();
    }
  }

  public nextPage() {
    this.tableCurrentPage++;
    this.loadLogs();
  }

  private mapTableRow(row: Log, tx?: ITransaction) {
    let log: any | undefined = undefined;

    if(row.address === this.address && this.logDecoder) {
      const _log = this.logDecoder.decodeLogs([row]);
      log = first(_log);
    }
    console.log(tx);

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

    console.log(methodFunction);

    return {
      blockId: Web3.utils.hexToNumberString(row.blockNumber),
      log: row,
      decodedLog: log,
      method: tx?.data.input.substring(0, 10),
      methodFunction: methodFunction,
      tx,

    } as IEventLogRow
  }
}
