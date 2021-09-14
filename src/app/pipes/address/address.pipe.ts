import { Pipe, PipeTransform } from '@angular/core';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { isString } from 'lodash'

@Pipe({
  name: 'address'
})
export class AddressPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {
    if(isString(value) && value.startsWith('0x')) {
      return toChecksumAddress(value);
    }
    return value;
  }

}
