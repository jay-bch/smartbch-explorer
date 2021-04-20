import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilHelperService {

  constructor() { }

  public convertValue(data: string, decimals: number) {
    return (BigInt(data) / BigInt(10 ** decimals)).toString(10);
  }

  public convertTopicAddress(data: string) {
    return '0x' + data.slice(data.length - 40, data.length)
  }
}
