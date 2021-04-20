import { Pipe, PipeTransform } from '@angular/core';
import Web3 from 'web3';

@Pipe({
  name: 'hextostring'
})
export class HextostringPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    return Web3.utils.hexToString(value);
  }

}
