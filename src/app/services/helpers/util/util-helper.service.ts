import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { Block } from 'web3-eth';

@Injectable({
  providedIn: 'root'
})
export class UtilHelperService {

  constructor() { }

  public convertValue(data: string, decimals: number) {
    return ((Number(data)) / Math.pow(10, decimals)).toString(10);
  }

  public convertTopicAddress(data: string) {
    return '0x' + data.slice(data.length - 40, data.length)
  }

  public getGasPercentageUsed(block: Block) {
    return ( (block.gasUsed / block.gasLimit) * 100).toFixed(2)
  }
}
