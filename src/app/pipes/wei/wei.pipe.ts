import { Pipe, PipeTransform } from '@angular/core';
import Web3 from 'web3';

import { Unit } from 'web3-utils'

@Pipe({
  name: 'wei'
})
export class WeiPipe implements PipeTransform {

  transform(value: string, arg: Unit): string | undefined {

    if(arg) {
      return Web3.utils.fromWei(value, arg);
    }

    return undefined;
  }
}
