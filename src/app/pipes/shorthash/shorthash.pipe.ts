import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorthash'
})
export class ShorthashPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    if(value && value.startsWith('0x')) {
      return `${value.substring(0, 10)}...${value.substring(value.length - 10, value.length)}`;
    }

    return value;
  }

}
