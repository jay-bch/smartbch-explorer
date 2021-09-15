import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NodeApiService } from 'src/app/services/api/node-api.service';
import { ISep20Contract } from '../../services/resources/sep20/sep20-resource.service';
import Web3 from 'web3';
import { AddressResourceService } from 'src/app/services/resources/address/address-resource.service';
import { ContractResourceService, IContract } from 'src/app/services/resources/contract/contract-resource.service';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { find } from 'lodash';
import { Sep20HelperService } from 'src/app/services/helpers/sep20-helper/sep20-helper.service';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';
@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {
  // public transactions: Transaction[] | undefined;
  public address: string | undefined;
  public balance: string  = '0';
  public code: string | undefined;
  public initialized: boolean = false;
  public notFound: boolean = false;
  public stop$ = new Subject();
  public contractName: string | undefined;
  loading: boolean = false;
  selectedTabIndex: number = 0;
  isInternalContract = false;
  contract: IContract | undefined;
  sep20Contract: ISep20Contract | undefined | null;
  sep20SupplyWhole: string | undefined;
  sep20SupplyFraction: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private apiService: NodeApiService,
    private addressService: AddressResourceService,
    private contractService: ContractResourceService,
    private utilHelper: UtilHelperService,
    private sep20Helper: Sep20HelperService
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.route.params.pipe(takeUntil(this.stop$)).subscribe( async params => {
      if (params && params.addressId) {
        this.loading = true;
        this.address = toChecksumAddress(params.addressId);
        this.contractName = undefined;
        this.sep20Contract = undefined;
        this.sep20SupplyWhole = undefined;
        this.sep20SupplyFraction = undefined;


        if(this.address) {
          if(this.address === '0x0000000000000000000000000000000000002711') {
            this.isInternalContract = true;
          }
          // this.transactions = await this.transactionResource.getTxByAddress(this.address);
          await this.apiService.getAccountBalance(this.address).then( result => {
            this.balance = result;
            this.initialized = true;
            this.notFound = false;
          })
          .catch(() => {
            this.initialized = true;
            this.balance = '0';
            this.notFound = false;
          });

          await this.apiService.getCode(this.address).then( async code => {
            this.code = Web3.utils.stripHexPrefix(code);

            if (this.code && this.address) {

              this.contractName = this.addressService.getAddressName(this.address);
              this.contract = await this.contractService.getContract(this.address);

              if(this.contract?.type === 'sep20') {
                this.contractService.contracts$.pipe(map(contracts => {
                  const contract = find(contracts, {address: toChecksumAddress(this.address)})
                  if(contract) return contract;
                  return false;

                })).subscribe(async (contract) => {
                  if(this.address && contract) {
                    if(!contract.sep20) {
                      contract.sep20 = await this.sep20Helper.getSep20ContractInformation(this.address, contract.logo)
                    }

                    if(contract.sep20) {
                      this.sep20Contract = contract.sep20;
                      const sep20Supply = this.utilHelper.numberWithCommas(this.utilHelper.convertValue(contract.sep20.totalSupply, contract.sep20.decimals));
                      const splitBalance = sep20Supply.split('.');
                      this.sep20SupplyWhole = splitBalance[0]
                      this.sep20SupplyFraction = splitBalance[1] ?? undefined;
                    }
                  }
                })
              }
            } else {
              this.contract = undefined;
            }

          });

          this.loading = false;
        }
      }
    });

  }

  ngOnDestroy() {
    this.stop$.next();
  }


}
