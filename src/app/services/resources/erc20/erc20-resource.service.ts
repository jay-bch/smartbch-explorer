import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { NodeApiService } from '../../api/node-api.service';
import erc20Contracts from '../../../../assets/config/contract.json';
import { compact, find, map } from 'lodash';
import { UtilHelperService } from '../../helpers/util/util-helper.service';
import { TransactionReceipt } from 'web3-eth';

export interface IErc20Contract {
  address: string,
  name: string,
  symbol: string,
  totalSupply: string,
  decimals: number,
  transactions?: any,
  addressesWithBalance?: string[],
}

export interface IErc20Transaction {
  address: string,
  from: string,
  to: string,
  convertedValue: string;
  parentHash?: string
}

export interface IErc20TransactionInformation {
  transaction: IErc20Transaction,
  contract: IErc20Contract,
}

@Injectable({
  providedIn: 'root'
})
export class Erc20ResourceService {

  contracts: IErc20Contract[] = [];

  constructor(
    private nodeApiService: NodeApiService,
    private utilHelper: UtilHelperService
  ) {
    // this.init();
  }

  async init() {
    const contracts: Promise<IErc20Contract | undefined>[] = []

    erc20Contracts.forEach(async (contract: any) => {
      try {
        const contractInfo = this.getErc20ContractInformation(contract.address);
        if (contractInfo) {
          contracts.push(contractInfo);
        }

      } catch {
        return null;
      }

      return;
    });

    await Promise.all(contracts).then( results => {
      this.contracts = compact(results);


      // temp test
      // const contractAddr = '0xbf6D6cfe6153117AdfAD261317d02e0bA244FBD6';
      // const accountAddr = '0xe66ffae0ab6bfb46237f985fbbb52d5595ff1e12'

      // this.getBalanceForAddress(contractAddr, accountAddr).then( result => {
      //   console.log('ERC20BALANCE', this.utilHelper.convertValue(result, 18));
      // });

      // this.getTransactionForAddress(contractAddr, accountAddr).then( result => {
      //   console.log('TRANS', result);
      // });

    });

    return Promise.resolve(true);
  }

/**
 * Gets erc20 contract information by retrieving symbol, name, totalSupply and decimals. If any fails, it's not considered a erc20.
 * @param address
 * @returns erc20 contract information
 */
public async getErc20ContractInformation(address: string): Promise<IErc20Contract | undefined> {

    let contract: IErc20Contract | undefined;

    try {
      const symbol = await this.nodeApiService.call({
        to: address,
        data: Web3.utils.sha3("symbol()")?.slice(0,10) ?? undefined
      },
      'string') as string;

      const name = await this.nodeApiService.call({
        to: address,
        data: Web3.utils.sha3("name()")?.slice(0,10) ?? undefined
      },
      'string') as string;

      const supply = await this.nodeApiService.call({
        to: address,
        data: Web3.utils.sha3("totalSupply()")?.slice(0,10) ?? undefined
      },
      'uint256') as string;

      const decimals = await this.nodeApiService.call({
        to: address,
        data: Web3.utils.sha3("decimals()")?.slice(0,10) ?? undefined
      },
      'uint256') as string;

      return {
        address,
        decimals: parseInt(decimals, 10),
        name,
        symbol,
        totalSupply: supply
      }
    } catch {
      return undefined;
    }
  }

  getAllErc20Contracts() {
    const promises: Promise<IErc20Contract | undefined>[] = [];
    map(erc20Contracts, async (contract: any) => {
      promises.push(this.getErc20Contract(contract.address));
    });

    return Promise.all(promises);
  }

  public async getErc20Contract(address: string): Promise<IErc20Contract | undefined> {

    const contract = find(this.contracts, {address: address});

    if(!contract) {
      const newContract = await this.getErc20ContractInformation(address);
      if(newContract) this.contracts.push(newContract);
    }

    return find(this.contracts, {address: address});
  }

  public async getErc20TransactionInformation(receipt: TransactionReceipt): Promise<IErc20TransactionInformation | undefined> {
    const erc20Contract = receipt.to ? await this.getErc20Contract(receipt.to) : await Promise.resolve(undefined);
    // console.log('ERC20Contract', erc20Contract);
    let erc20TransactionInformation: IErc20TransactionInformation | undefined;
    if(
      receipt.to &&
      receipt.status &&
      receipt.logs.length > 0 &&
      receipt.logs[0].topics &&
      receipt.logs[0].topics.length > 2 &&
      erc20Contract) {
      erc20TransactionInformation = {
        transaction: {
          address: receipt.to,
          from: this.utilHelper.convertTopicAddress(receipt.logs[0].topics[1]),
          to: this.utilHelper.convertTopicAddress(receipt.logs[0].topics[2]),
          convertedValue: this.utilHelper.convertValue(receipt.logs[0].data, erc20Contract.decimals)
        },
        contract: erc20Contract
      }
    } else {
      if(erc20Contract) {
        console.warn('BAD TX', receipt.status, receipt)
      }
    }
    return Promise.resolve(erc20TransactionInformation);
  }

  public async getBalanceForAddress(contractAddress: string, address: string) {
    // console.log('getBALANCE', address, contractAddress);
    const data: string = Web3.utils.sha3("balanceOf(address)")?.slice(0,10) + "000000000000000000000000" + Web3.utils.stripHexPrefix(address);
    return await this.nodeApiService.call({
      to: contractAddress,
      data
    },
    'uint256') as string;
  }

  public async getTransactionsForAddress(contractAddress: string, address?: string) {
    // console.log('get tx for address');
    const contract = find(this.contracts, contract => {
      if(contract.address.toLocaleLowerCase() === contractAddress.toLocaleLowerCase()) return true;
      return false;
    });

    if(!contract) return Promise.reject();

    const data: string[] = [
      Web3.utils.keccak256('Transfer(address,address,uint256)')
    ];

    if(address) {
      data.push('0x000000000000000000000000' + Web3.utils.stripHexPrefix(address))
    }

    const transactions = await this.nodeApiService.queryLogs(
      contractAddress,
      data,
      '0x0',
      'latest'
    );

    return map(transactions, (erc20tx) => {
      return {
        address: erc20tx.address,
        parentHash: erc20tx.transactionHash,
        from: this.utilHelper.convertTopicAddress(erc20tx.topics[1]),
        to: this.utilHelper.convertTopicAddress(erc20tx.topics[2]),
        convertedValue: this.utilHelper.convertValue(erc20tx.data, contract.decimals)
      } as IErc20Transaction;
    });

    // return transactions;
  }

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

  //   console.log('erc20transforhash', transaction);

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
