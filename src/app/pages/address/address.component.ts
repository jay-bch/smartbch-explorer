import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { NodeApiService } from 'src/app/services/api/node-api.service';
import { Sep20ResourceService } from '../../services/resources/sep20/sep20-resource.service';
import { TransactionResourceService } from '../../services/resources/transaction/transaction-resource.service';
import Web3 from 'web3';
import { AddressResourceService } from 'src/app/services/resources/address/address-resource.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';


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

  constructor(
    private route: ActivatedRoute,
    private apiService: NodeApiService,
    private transactionResource: TransactionResourceService,
    private sep20ResourceService: Sep20ResourceService,
    private addressService: AddressResourceService,
  ) {

  }

  async ngOnInit(): Promise<void> {
    this.route.params.pipe(takeUntil(this.stop$)).subscribe( async params => {
      if (params && params.addressId) {
        this.loading = true;
        this.address = params.addressId.toLowerCase();
        this.contractName = undefined;


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

          await this.apiService.getCode(this.address).then( code => {
            this.code = Web3.utils.stripHexPrefix(code);

            if (this.code && this.address) {

              this.contractName = this.addressService.getAddressName(this.address);
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
