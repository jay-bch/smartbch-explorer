import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { NodeApiService } from '../../api/node-api.service';
import { compact, find, map, filter } from 'lodash';
import { UtilHelperService } from '../../helpers/util/util-helper.service';
import { ContractResourceService, IContract } from '../contract/contract-resource.service';
import { map as rxMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Sep20HelperService } from '../../helpers/sep20-helper/sep20-helper.service';

export interface ISep20Contract {
  address: string,
  name: string,
  symbol: string,
  totalSupply: string,
  decimals: number,
  logo?: boolean
  // transactions?: any,
  // addressesWithBalance?: string[],
}

export interface ISep20Transaction {
  address: string,
  from: string,
  to: string,
  convertedValue: string;
  parentHash?: string
}

export interface ISep20TransactionInformation {
  transaction: ISep20Transaction,
  contract: ISep20Contract,
}

@Injectable({
  providedIn: 'root'
})
export class Sep20ResourceService {

  sep20Abi: any;
  contracts: ISep20Contract[] = [];
  checkedAddresses: string[] = [];
  contracts$: BehaviorSubject<ISep20Contract[]> = new BehaviorSubject<ISep20Contract[]>([]);

  constructor(
    private contractResource: ContractResourceService,
    private nodeApiService: NodeApiService,
    private utilHelper: UtilHelperService,
    private sep20Helper: Sep20HelperService
  ) {

    this.contractResource.contracts$.pipe(
      rxMap( (contracts: IContract[]) => filter(contracts, contract => {
        return contract.type === 'sep20';
      }))
      ).subscribe(contracts => {
        const currentContracts = this.contracts$.getValue();

        const promises: Promise<ISep20Contract | undefined>[] = [];

        contracts.forEach(async (contract) => {
          if(!find(this.checkedAddresses, contract.address.toLowerCase())) {
            this.checkedAddresses.push(contract.address.toLowerCase());
            if (!contract.sep20) {
              promises.push(this.sep20Helper.getSep20ContractInformation(contract.address.toLowerCase(), contract.logo));
            } else {
              contract.sep20;
              promises.push(Promise.resolve(contract.sep20));
            }
          }
        });

        Promise.all(promises).then(results => {
          results.forEach( contract => {


            if (contract && !find(currentContracts, {address: contract.address})) {
              if(contract.address !== '0x0000000000000000000000000000000000002711') {
                currentContracts.push(contract);
              }
            }
          });

          this.contracts$.next(currentContracts);

        });

    });

    // this.contracts$.subscribe( contract => {
    //   console.log('contracts$', contract);
    // })
  }

  getAllSep20Contracts(): Promise<ISep20Contract[]> {
    return this.contracts$.toPromise();
  }

  public async getSep20Contract(address: string): Promise<ISep20Contract | undefined> {
    const contract = find(this.contracts$.getValue(), {address: address.toLowerCase()});
    return Promise.resolve(contract);
  }

  // public async getSep20TransactionInformation(receipt: TransactionReceipt): Promise<ISep20TransactionInformation | undefined> {
  //   const sep20Contract = receipt.to ? await this.getSep20Contract(receipt.to) : await Promise.resolve(undefined);
  //   // console.log('ERC20Contract', sep20Contract);
  //   let sep20TransactionInformation: ISep20TransactionInformation | undefined;
  //   if(
  //     receipt.to &&
  //     receipt.status &&
  //     receipt.logs.length > 0 &&
  //     receipt.logs[0].topics &&
  //     receipt.logs[0].topics.length > 2 &&
  //     sep20Contract) {
  //     sep20TransactionInformation = {
  //       transaction: {
  //         address: receipt.to,
  //         from: this.utilHelper.convertTopicAddress(receipt.logs[0].topics[1]),
  //         to: this.utilHelper.convertTopicAddress(receipt.logs[0].topics[2]),
  //         convertedValue: this.utilHelper.convertValue(receipt.logs[0].data, sep20Contract.decimals)
  //       },
  //       contract: sep20Contract
  //     }
  //   } else {
  //     if(sep20Contract) {
  //       console.warn('BAD TX', receipt.status, receipt)
  //     }
  //   }
  //   return Promise.resolve(sep20TransactionInformation);
  // }

  public async getSep20BalanceForAddress(contractAddress: string, address: string) {
    const count = await this.nodeApiService.getSep20AddressCount(address, contractAddress, 'both');
    // console.log('getBALANCE', address, contractAddress, count);

    const data: string = Web3.utils.sha3("balanceOf(address)")?.slice(0,10) + "000000000000000000000000" + Web3.utils.stripHexPrefix(address);
    return await this.nodeApiService.call({
      to: contractAddress,
      data
    },
    'uint256') as string;
  }

  // public async getSep20TransactionsForAddress(contractAddress: string, address?: string) {
  //   // console.log('get tx for address', this.contracts$.getValue());
  //   const contracts = await this.contracts$.getValue();
  //   const contract = find(contracts, contract => {
  //     if(contract.address.toLocaleLowerCase() === contractAddress.toLocaleLowerCase()) return true;
  //     return false;
  //   });

  //   if(!contract) return Promise.reject();

  //   // console.log('SEP20 contract',  contract);

  //   const data: string[] = [
  //     Web3.utils.keccak256('Transfer(address,address,uint256)')
  //   ];

  //   if(address) {
  //     data.push('0x000000000000000000000000' + Web3.utils.stripHexPrefix(address))
  //   }

  //   const transactions = await this.nodeApiService.queryLogs(
  //     contractAddress,
  //     data,
  //     '0x0',
  //     'latest',
  //     Web3.utils.toHex(10000),
  //   );

  //   // console.log('sep20txs', transactions);

  //   return map(transactions, (sep20tx) => {
  //     // console.log('FROM', this.utilHelper.convertTopicAddress(sep20tx.topics[1]));
  //     // console.log('TO', this.utilHelper.convertTopicAddress(sep20tx.topics[2]));
  //     return {
  //       address: sep20tx.address,
  //       parentHash: sep20tx.transactionHash,
  //       from: this.utilHelper.convertTopicAddress(sep20tx.topics[1]),
  //       to: this.utilHelper.convertTopicAddress(sep20tx.topics[2]),
  //       convertedValue: this.utilHelper.convertValue(sep20tx.data, contract.decimals)
  //     } as ISep20Transaction;
  //   });

  //   // return transactions;
  // }

  // public async getTransactionForHash(contractAddress: string, hash: string, block: number) {
  //   const contract = find(this.contracts, {address: contractAddress.toLowerCase()});
  //   if(!contract) return Promise.reject();

  //   const data: string[] = [
  //     Web3.utils.keccak256('Transfer(address,address,uint256)')
  //   ]

  //   const transaction = await this.nodeApiService.queryLogs(
  //     contractAddress,
  //     data,
  //     Web3.utils.numberToHex(block),
  //     Web3.utils.numberToHex(block)
  //   );

  //   console.log('sep20transforhash', transaction);

  //   return transaction;

  // }

}


// let events = [
//   {
//     type: 'event',
//     name: 'HelloWorld',
//     anonymous: false,
//     inputs: [{"indexed":false,"name":"call_address","type":"address"}]
//   },
//   // List out all the events you care about
// ];

// function getEventSignature(eventAbi) {
//   var signature = eventAbi.name + '(' + eventAbi.inputs.map(function(input) { return input.type; }).join(',') + ')';
//   var hash = web3.sha3(signature);
//   return {
//     signature: signature,
//     hash: hash,
//     abi: eventAbi
//   };
// }

// var topicMap = {};
// events.map(eventAbi => {
//   var signature = getEventSignature(eventAbi);
//   topicMap[signature.hash] = signature;
// });
// console.log(topicMap);
