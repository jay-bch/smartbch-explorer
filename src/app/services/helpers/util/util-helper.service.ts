import { Injectable } from '@angular/core';
import { Block } from 'web3-eth';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class UtilHelperService {

  constructor() { }

  public convertValue(data: string, decimals: number) {
    const convertedValue = new BigNumber(data).dividedBy(new BigNumber(`1e${decimals}`)).toFixed(decimals);
    return convertedValue.toString();
  }

  public convertTopicAddress(data: string) {
    return '0x' + data.slice(data.length - 40, data.length)
  }

  public getGasPercentageUsed(block: Block) {
    return ( (block.gasUsed / block.gasLimit) * 100).toFixed(5)
  }
}
