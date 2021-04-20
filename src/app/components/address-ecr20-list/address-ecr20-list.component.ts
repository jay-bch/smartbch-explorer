import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbTabComponent } from '@nebular/theme';
import { compact, find, get } from 'lodash';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';
import { Erc20ResourceService, IErc20Contract } from 'src/app/services/resources/erc20-resource.service';

@Component({
  selector: 'app-address-ecr20-list',
  templateUrl: './address-ecr20-list.component.html',
  styleUrls: ['./address-ecr20-list.component.scss']
})
export class AddressEcr20ListComponent implements OnInit, OnChanges {
  @Input()
  address :string | undefined;

  erc20contracts: IErc20Contract[] = [];

  activeErc20Contract: IErc20Contract | undefined;
  activeBalance: string | undefined;
  activeTxs: any[] = [];




  constructor(
    private erc20recource: Erc20ResourceService,
    private utilHelper: UtilHelperService
  ) { }


  async ngOnInit(): Promise<void> {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.erc20contracts = [];
    this.erc20recource.getAllErc20Contracts().then(async result => {
      for(let i = 0; i < result.length; i++) {
        const erc20contract = result[i]
        if(this.address && erc20contract) {
          const balance = await this.erc20recource.getBalanceForAddress(erc20contract.address, this.address);

          if(balance !== '0') {
            if(!this.activeErc20Contract) {
              this.setActiveContract(erc20contract)
            }
            this.erc20contracts.push(erc20contract);
          }
        }
      }
    });
  }

  async setActiveContract(contract: IErc20Contract | undefined) {
    this.activeErc20Contract = contract
    this.activeBalance = undefined;
    this.activeTxs = [];

    if(contract && this.address) {
      const unformattedBalance = await this.erc20recource.getBalanceForAddress(contract.address, this.address);
      this.activeBalance = this.utilHelper.convertValue(unformattedBalance, contract.decimals);
      this.activeTxs = await this.erc20recource.getTransactionsForAddress(contract.address, this.address);
    }

  }

  setActiveTab($event: NbTabComponent) {
    const contract = find(this.erc20contracts, {symbol: $event.tabTitle});
    this.setActiveContract(contract);

  }
}
