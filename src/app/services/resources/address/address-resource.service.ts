import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { NodeApiService } from '../../api/node-api.service';
import { ContractResourceService } from '../contract/contract-resource.service';
import { ITransaction, TransactionResourceService } from '../transaction/transaction-resource.service';

export interface IAddress {
  address: string;
  balance: string;
  type?: string;
  code?: string;
  method?: string;
  txCount: number;
}

export interface ContractInformation {
  logs: any[],
  type: 'unknown' | 'sep20'
}

@Injectable({
  providedIn: 'root'
})
export class AddressResourceService {

  constructor(
    private apiService: NodeApiService,
    private contractService: ContractResourceService
  ) { }


  async getAddressInfo(address: string): Promise<IAddress> {
    const code = await this.apiService.getCode(address);
    const balance = await this.apiService.getAccountBalance(address);
    return {
      address,
      balance,
      type: code !== '0x' ? 'contract' : 'address',
      code,
      txCount: Web3.utils.hexToNumber(await this.apiService.getTxCount(address, 'both'))
    };
}

  // getMethod(method: string) {
  //   this.contractService._decodeMethod(method)
  // }

  // getContractInfo(address: string) {
  // }

  getAddressName(address: string) {
    let addressLabebel = address;
    addressLabebel = this.contractService.getContractName(address) ?? addressLabebel;

    return addressLabebel;
  }

  async getEventLogs(address: string, start: number, end: number, limit: number) {
    return this.apiService.queryLogs(address, [], Web3.utils.toHex(start), Web3.utils.toHex(end), Web3.utils.toHex(limit));
  }
}
