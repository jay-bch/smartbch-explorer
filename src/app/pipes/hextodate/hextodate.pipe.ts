import { Pipe, PipeTransform } from '@angular/core';
import Web3 from 'web3';
import { Hex } from 'web3-utils';

@Pipe({
  name: 'hextodate'
})
export class HextodatePipe implements PipeTransform {
  transform(value: Hex): Date | undefined {
    const timestamp =  Web3.utils.hexToNumber(value)
    return new Date(timestamp * 1000);
  }
}
