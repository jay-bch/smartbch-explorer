import { Injectable } from '@angular/core';
import { map } from 'lodash';
import Web3 from 'web3';
import { NodeApiService } from '../../api/node-api.service';
import { ISep20Contract, Sep20ResourceService } from '../../resources/sep20/sep20-resource.service';

export const sep20Properties = [
  {
    property: 'symbol',
    method: 'symbol()',
    type: 'string'
  },
  {
    property: 'name',
    method: 'name()',
    type: 'string'
  },
  {
    property: 'totalSupply',
    method: 'totalSupply()',
    type: 'uint256'
  },
  {
    property: 'decimals',
    method: 'decimals()',
    type: 'uint256'
  },
]
@Injectable({
  providedIn: 'root'
})
export class Sep20HelperService {

  constructor(
    private nodeApiService: NodeApiService,
  ) { }

  public async getSep20ContractInformation(address: string): Promise<ISep20Contract | undefined> {
    try {
      const callParams = await this.nodeApiService.callMultiple( map(sep20Properties, property => {
        return {
          transactionConfig: {
            to: address,
            data: Web3.utils.sha3(property.method)?.slice(0,10)
          },
          returnType: property.type
        }
      }));

      console.log('CALL PARAMS', callParams);

      if(callParams.length !== sep20Properties.length) {
        return undefined;
      }

      const symbol = callParams[0];
      const name = callParams[1];
      const totalSupply = callParams[2];
      const decimals = callParams[3];

      // const symbol = await this.nodeApiService.call({
      //   to: address,
      //   data: Web3.utils.sha3("symbol()")?.slice(0,10) ?? undefined
      // },
      // 'string') as string;

      // const name = await this.nodeApiService.call({
      //   to: address,
      //   data: Web3.utils.sha3("name()")?.slice(0,10) ?? undefined
      // },
      // 'string') as string;

      // const supply = await this.nodeApiService.call({
      //   to: address,
      //   data: Web3.utils.sha3("totalSupply()")?.slice(0,10) ?? undefined
      // },
      // 'uint256') as string;

      // const decimals = await this.nodeApiService.call({
      //   to: address,
      //   data: Web3.utils.sha3("decimals()")?.slice(0,10) ?? undefined
      // },
      // 'uint256') as string;

      const sep20Contract = {
        address,
        decimals: parseInt(decimals, 10),
        name,
        symbol,
        totalSupply
      }

      return sep20Contract;
    } catch {
      // if any fails, we don't consider it a sep20 contract.
      return undefined;
    }
  }
}
