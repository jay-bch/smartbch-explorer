import { Injectable } from '@angular/core';
import { Transaction } from 'web3-eth';
import { NodeApiService } from '../api/node-api.service';

export interface AddressInformation {
  address: string,
  transactions: Transaction[],

}

export interface ContractInformation {
  logs: any[],
  type: 'unknown' | 'erc20'
}

@Injectable({
  providedIn: 'root'
})
export class AddressResourceService {

  constructor(
    private apiService: NodeApiService,
  ) { }


  isContract() {

  }

  getContractInfo(address: string) {

  }

}
