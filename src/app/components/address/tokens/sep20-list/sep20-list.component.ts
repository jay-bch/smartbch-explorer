import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { find } from 'lodash';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';
import { Sep20ResourceService, ISep20Contract } from 'src/app/services/resources/sep20/sep20-resource.service';

@Component({
  selector: 'app-address-tokens-sep20-list',
  templateUrl: './sep20-list.component.html',
  styleUrls: ['./sep20-list.component.scss']
})
export class AddressSEP20ListComponent implements OnInit, OnChanges {
  @Input()
  address :string | undefined;

  sep20contracts: ISep20Contract[] = [];

  activeSep20Contract: ISep20Contract | undefined;
  activeBalance: string | undefined;
  activeTxs: any[] = [];




  constructor(
    private sep20recource: Sep20ResourceService,
    private utilHelper: UtilHelperService
  ) { }


  async ngOnInit(): Promise<void> {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sep20contracts = [];
    this.activeBalance = undefined;
    this.activeTxs = [];
    this.activeSep20Contract = undefined;
    this.sep20recource.getAllSep20Contracts().then(async result => {

      for(let i = 0; i < result.length; i++) {
        const sep20contract = result[i];

        if(this.address && sep20contract) {
          const balance = await this.sep20recource.getSep20BalanceForAddress(sep20contract.address, this.address);

          if(balance !== '0') {
            if(!this.activeSep20Contract) {
              this.setActiveContract(sep20contract)
            }
            this.sep20contracts.push(sep20contract);
          }
        }
      }
    });
  }

  async setActiveContract(contract: ISep20Contract | undefined) {
    this.activeSep20Contract = contract
    this.activeBalance = undefined;
    this.activeTxs = [];

    if(contract && this.address) {
      const unformattedBalance = await this.sep20recource.getSep20BalanceForAddress(contract.address, this.address);
      this.activeBalance = this.utilHelper.convertValue(unformattedBalance, contract.decimals);
      this.activeTxs = await this.sep20recource.getSep20TransactionsForAddress(contract.address, this.address);
    }

  }

  setActiveTab($event: MatTabChangeEvent) {
    const contract = find(this.sep20contracts, {symbol: $event.tab.textLabel});
    this.setActiveContract(contract);

  }
}
