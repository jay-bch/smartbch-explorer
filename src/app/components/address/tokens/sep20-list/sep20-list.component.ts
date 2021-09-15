import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { find, map } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';
import { Sep20ResourceService, ISep20Contract } from 'src/app/services/resources/sep20/sep20-resource.service';

export interface ISep20ContractListItem {
  contract: ISep20Contract,
  balance: string,
  balanceWhole: string,
  balanceFraction: string | undefined
}

@Component({
  selector: 'app-address-tokens-sep20-list',
  templateUrl: './sep20-list.component.html',
  styleUrls: ['./sep20-list.component.scss']
})
export class AddressSEP20ListComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  address :string | undefined;

  sep20contracts: ISep20Contract[] = [];
  sep20BalanceList: ISep20ContractListItem[] = [];

  activeSep20Contract: ISep20Contract | undefined;
  activeBalance: string | undefined;
  activeTxs: any[] = [];

  stop$ = new Subject();
  loading: boolean = false;



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

    this.sep20BalanceList = [];
    // this.sep20recource.getAllSep20Contracts().then(async result => {
    if(this.address) {
      const _address = this.address;
      this.loading = true;
      this.sep20recource.contracts$.pipe(takeUntil(this.stop$)).subscribe( async results => {
        const sep20BalanceList = [];
        const sep20contracts: ISep20Contract[] = [];
        // console.log('results', results);

        const balances = await this.sep20recource.getSep20BalancesForaddress(_address, map(results, (contract: any) => contract.address));

        // for(let i = 0; i < result.length; i++) {
        for(let [index, contract] of results.entries()) {
          // const sep20contract = contract;
          // const unformattedBalance = await this.sep20recource.getSep20BalanceForAddress(contract.address, _address);
          const unformattedBalance = balances[index];
          if (unformattedBalance && unformattedBalance !== '0') {
            const balance = this.utilHelper.convertValue(unformattedBalance, contract.decimals);
            const splitBalance = balance.split('.');
            sep20BalanceList.push({
              contract,
              balance,
              balanceWhole: this.utilHelper.numberWithCommas(splitBalance[0]),
              balanceFraction: splitBalance[1] ? splitBalance[1] : undefined
            });
          }

          // if(this.address && sep20contract) {

          //   // console.log('balance', balance);

          //   if(balance !== '0') {
          //     if(!this.activeSep20Contract) {
          //       this.setActiveContract(sep20contract)
          //     }
          //     sep20contracts.push(sep20contract);
          //   }
          // }
        }
        this.sep20BalanceList = sep20BalanceList;
        this.sep20contracts = sep20contracts;
        this.loading = false;
      });
    }
  }

  async setActiveContract(contract: ISep20Contract | undefined) {
    this.activeSep20Contract = contract
    this.activeBalance = undefined;
    this.activeTxs = [];

    if(contract && this.address) {
      const unformattedBalance = await this.sep20recource.getSep20BalanceForAddress(contract.address, this.address);
      // console.log('ACTIVE BALANCE', unformattedBalance, contract.decimals,  this.utilHelper.convertValue(unformattedBalance, contract.decimals));
      this.activeBalance = this.utilHelper.convertValue(unformattedBalance, contract.decimals);
      // this.activeTxs = await this.sep20recource.getSep20TransactionsForAddress(contract.address, this.address);
    }

  }

  setActiveTab($event: MatTabChangeEvent) {
    const contract = find(this.sep20contracts, {symbol: $event.tab.textLabel});
    // console.log('set active contract', contract);
    this.setActiveContract(contract);

  }

  ngOnDestroy(): void {
    this.stop$.next();
  }
}
