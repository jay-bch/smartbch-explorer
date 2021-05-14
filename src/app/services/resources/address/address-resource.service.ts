import { Injectable } from '@angular/core';
import { Transaction } from 'web3-eth';
import { NodeApiService } from '../../api/node-api.service';
import { ContractResourceService } from '../contract/contract-resource.service';
import { ITransaction, TransactionResourceService } from '../transaction/transaction-resource.service';

export interface IAddress {
  address: string;
  balance: number;
  type?: string;
  input?: string;
  logs?: any[],
  data: string
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
    private contractService: ContractResourceService
  ) { }


  getAddressInfo(address: string) {

  }


  isContract() {

  }

  getContractInfo(address: string) {

  }

}
