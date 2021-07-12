import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { find } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';
import { Sep20ResourceService, ISep20Contract } from 'src/app/services/resources/sep20/sep20-resource.service';

@Component({
  selector: 'app-address-tokens-sep20-list',
  templateUrl: './sep20-list.component.html',
  styleUrls: ['./sep20-list.component.scss']
})
export class AddressSEP20ListComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  address :string | undefined;

  sep20contracts: ISep20Contract[] = [];

  activeSep20Contract: ISep20Contract | undefined;
  activeBalance: string | undefined;
  activeTxs: any[] = [];

  stop$ = new Subject();



  constructor(
    private sep20recource: Sep20ResourceService,
    private utilHelper: UtilHelperService
  ) { }



  async ngOnInit(): Promise<void> {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.activeBalance = undefined;
    this.activeTxs = [];
    this.activeSep20Contract = undefined;
    // this.sep20recource.getAllSep20Contracts().then(async result => {
    this.sep20recource.contracts$.pipe(takeUntil(this.stop$)).subscribe( async results => {
      const sep20contracts: ISep20Contract[] = [];
      // console.log('results', results);

      // for(let i = 0; i < result.length; i++) {
      for(let result of results) {
        const sep20contract = result;

        if(this.address && sep20contract) {
          const balance = await this.sep20recource.getSep20BalanceForAddress(sep20contract.address, this.address);

          // console.log('balance', balance);

          if(balance !== '0') {
            if(!this.activeSep20Contract) {
              this.setActiveContract(sep20contract)
            }
            sep20contracts.push(sep20contract);
          }
        }
      }

      this.sep20contracts = sep20contracts;
    });
  }

  async setActiveContract(contract: ISep20Contract | undefined) {
    this.activeSep20Contract = contract
    this.activeBalance = undefined;
    this.activeTxs = [];

    if(contract && this.address) {
      const unformattedBalance = await this.sep20recource.getSep20BalanceForAddress(contract.address, this.address);
      console.log('ACTIVE BALANCE', unformattedBalance, contract.decimals,  this.utilHelper.convertValue(unformattedBalance, contract.decimals));
      this.activeBalance = this.utilHelper.convertValue(unformattedBalance, contract.decimals);
      // this.activeTxs = await this.sep20recource.getSep20TransactionsForAddress(contract.address, this.address);
    }

  }

  setActiveTab($event: MatTabChangeEvent) {
    const contract = find(this.sep20contracts, {symbol: $event.tab.textLabel});
    console.log('set active contract', contract);
    this.setActiveContract(contract);

  }

  ngOnDestroy(): void {
    this.stop$.next();
  }
}
