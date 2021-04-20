import { Pipe, PipeTransform } from '@angular/core';
import Web3 from 'web3';

@Pipe({
  name: 'hextoint'
})
export class HextointPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): any {
    if( value ) {
      return Web3.utils.hexToNumberString(value as string);
    }

    return 0;
  }
}
