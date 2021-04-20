import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NodeApiService } from 'src/app/services/api/node-api.service';
import { Erc20ResourceService } from 'src/app/services/resources/erc20-resource.service';
import { TransactionResourceService } from 'src/app/services/resources/transaction-resource.service';
import Web3 from 'web3';

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

  constructor(
    private route: ActivatedRoute,
    private apiService: NodeApiService,
    private transactionResource: TransactionResourceService,
    private erc20ResourceService: Erc20ResourceService
  ) {
    this.route.params.pipe(takeUntil(this.stop$)).subscribe( async params => {
      if (params && params.addressId) {

        this.address = params.addressId;

        if(this.address) {
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
              this.erc20ResourceService.getErc20Contract(this.address);
            }

          });


        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
  }

  ngOnDestroy() {
    this.stop$.next();
  }


}
