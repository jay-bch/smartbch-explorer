import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorthash'
})
export class ShorthashPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    if(value && value.startsWith('0x')) {
      return `${value.substring(0, 7)}...${value.substring(value.length - 7, value.length)}`;
    }

    return value;
  }

}
