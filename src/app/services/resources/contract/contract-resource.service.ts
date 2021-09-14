import { Injectable } from '@angular/core';

import contractAbis from '../../../../assets/config/contract-abi.json';
import configuredContracts from '../../../../assets/config/contract.json'
import { toChecksumAddress } from 'ethereum-checksum-address';
import { find, first, map, noop, uniq } from 'lodash';
import { ISep20Contract } from '../sep20/sep20-resource.service';
import { BehaviorSubject } from 'rxjs';
import { Sep20HelperService } from '../../helpers/sep20-helper/sep20-helper.service';
import { NotificationService } from '../../user/notification/notification.service';
import { EventDecoder, IDecodedLog, IDecodedMethod } from '../../helpers/event-decoder/event-decoder';

export type ContractType = 'sep20' | 'custom';

export interface IContract {
  address: string;
  abi?: any;
  name: string;
  type: ContractType;
  sep20?: ISep20Contract | null;
  logo: boolean;
}

export interface IEventLog {
  contractAddress: string;
  log: any;
  logIndex: number;
  decodedLog?: IDecodedLog;
  contractName?: string;
}



const abicoder = require('web3-eth-abi');

@Injectable({
  providedIn: 'root'
})
export class ContractResourceService {
  methodIDs: any = {};
  // contracts: IContract[] = [];
  contracts$: BehaviorSubject<IContract[]> = new BehaviorSubject<IContract[]>([]);

  discoveredAddresses: string[] = [];

  eventLogDecoder: EventDecoder | undefined;

  constructor(
    private sep20Helper: Sep20HelperService,
    private notificationService: NotificationService
  ) {
    this.loadContracts();
  }

  loadContracts() {
    const contracts: IContract[] = [];

    if(configuredContracts && configuredContracts.length > 0) {

      configuredContracts.forEach( (contract: any) => {
        let type: ContractType = 'custom';
        contract.type === 'sep20' ? type = 'sep20' : noop();

        let abi: any[] = []

        contract.abiNames.forEach( (name: any) => {
          abi = abi.concat(find(contractAbis, {type: name})?.abi)
        });

        const newContract: IContract = {
          address: toChecksumAddress(contract.address),
          type,
          name: contract.name ?? toChecksumAddress(contract.address),
          abi,
          logo: contract.logo
        }

        contracts.push(newContract);
      });
    }

    if(contracts.length > 0) {
      this.eventLogDecoder = new EventDecoder();

      contracts.forEach( contract => {
        if(contract.abi) this.eventLogDecoder?.addABI(contract.abi)
      });

      this.contracts$.next(contracts);
    }

    this.contracts$.subscribe(contracts => {
      this.eventLogDecoder = new EventDecoder();

      contracts.forEach( contract => {
        if(contract.abi) this.eventLogDecoder?.addABI(contract.abi)
      });
    })
  }

  addContract(address: string, type: 'sep20' | 'custom', name: string, abi?: any, data?: any) {
    const existing = find(this.contracts$.getValue(), {address: toChecksumAddress(address)});
    if(existing) return existing;

    const newContract: IContract = {
      address,
      type,
      name,
      abi,
      logo: false
    }

    if(type === 'sep20') {
      newContract.sep20 = data;
      newContract.abi = find(contractAbis, {type: "sep20"})?.abi;
    }

    const allContracts = this.contracts$.getValue();
    // console.log('NEW CONTRACT', newContract);
    allContracts.push(newContract);
    this.contracts$.next(allContracts);

    return newContract;
  }

  async discover(address: string) {
    this.discoveredAddresses.push(toChecksumAddress(address));

    // console.log('discover', address, this.discoveredAddresses, this.discoveredAddresses.includes(address.toLowerCase()));
    //sep20 discovery
    const sep20ContractInfo = await this.sep20Helper.getSep20ContractInformation(toChecksumAddress(address), false);

    if(sep20ContractInfo) {
      // console.log('sep20 contract discovery', sep20ContractInfo);
      this.notificationService.showToast(`${sep20ContractInfo.name} (${sep20ContractInfo.symbol}) Discovered!`, 'SEP20', 'info' );
      return Promise.resolve(this.addContract(toChecksumAddress(address), 'sep20', sep20ContractInfo.name, null, sep20ContractInfo));
    }

    return Promise.resolve(undefined);
  }

  async getContract(address: string): Promise<IContract | undefined> {
    let contract = find(this.contracts$.getValue(), {address: toChecksumAddress(address)});

    if(!contract && !this.discoveredAddresses.includes(toChecksumAddress(address))) {
      contract = await this.discover(address);
    }

    return contract;
  }

  getContractName(address: string) {
    const contract = find(this.contracts$.getValue(), {address: toChecksumAddress(address)});
    return contract?.name ?? null;
  }

  getLogsForContract(contractAddress: string, logs: any) {

    // const contractsInLog: string[] = uniq(map(logs, log => log.address));
    // console.log("contracts in log", contractsInLog);

    const eventLogs: IEventLog[] = [];

    for(let log of logs) {
      const eventLog: IEventLog = {
        contractAddress: toChecksumAddress(log.address),
        log,
        logIndex: log.logIndex,
      }
      const contract = find(this.contracts$.getValue(), {address: toChecksumAddress(log.address)});

      if (contract) {
        // console.log(`logByContract ${contract.name}`, decoder.decodeLogs([log]));
        eventLog.contractName = contract.name;
      } else {
        // console.warn('no abi for contract', log.address.toLowerCase())
      }

      if(this.eventLogDecoder) {
        const decodedLog = this.eventLogDecoder.decodeLogs([log]);
        eventLog.decodedLog = first(decodedLog);
      }

      eventLogs.push(eventLog);
    }

    // console.log('new LOGS', eventLogs);

    return eventLogs;
  }

  getMethodForContract(contractAddress: string, input: any) {
    // console.log('getMethodForContract', input);
    const contract = find(this.contracts$.getValue(), {address: toChecksumAddress(contractAddress)});
    let decodedMethod: IDecodedMethod | undefined = undefined
    if (contract?.abi) {
      const decoder = new EventDecoder(contract.abi);
      decodedMethod = decoder.decodeMethod(input);
    }

    if(!decodedMethod) {
      decodedMethod = { name: input.substr(0, 10) }
    }

    return decodedMethod;

  }

  // private _typeToString(input: any) {
  //   if (input.type === "tuple") {
  //     return "(" + input.components.map(this._typeToString).join(",") + ")";
  //   }
  //   return input.type;
  // }

  // private _addABI(abiArray: any[]) {

  //   if (Array.isArray(abiArray)) {
  //     // Iterate new abi to generate method id"s
  //     abiArray.map((abi) => {
  //       if (abi.name) {
  //         const signature = Web3.utils.sha3(
  //           abi.name +
  //             "(" +
  //             abi.inputs
  //               .map(this._typeToString)
  //               .join(",") +
  //             ")"
  //         );
  //         if(signature) {
  //           if (abi.type === "event") {
  //             this.methodIDs[signature.slice(2)] = abi;
  //           } else {
  //             this.methodIDs[signature.slice(2, 10)] = abi;
  //           }
  //         }
  //       }
  //     });

  //     // this.state.savedABIs = this.state.savedABIs.concat(abiArray);
  //   } else {
  //     throw new Error("Expected ABI array, got " + typeof abiArray);
  //   }
  // }

  // private _removeABI(abiArray: any[]) {
  //   if (Array.isArray(abiArray)) {
  //     // Iterate new abi to generate method id"s
  //     abiArray.map((abi) => {
  //       if (abi.name) {
  //         const signature = Web3.utils.sha3(
  //           abi.name +
  //             "(" +
  //             abi.inputs
  //               .map((input: any) => {
  //                 return input.type;
  //               })
  //               .join(",") +
  //             ")"
  //         );
  //         if(signature) {
  //           if (abi.type === "event") {
  //             if (this.methodIDs[signature.slice(2)]) {
  //               delete this.methodIDs[signature.slice(2)];
  //             }
  //           } else {
  //             if (this.methodIDs[signature.slice(2, 10)]) {
  //               delete this.methodIDs[signature.slice(2, 10)];
  //             }
  //           }
  //         }
  //       }
  //     });
  //   } else {
  //     throw new Error("Expected ABI array, got " + typeof abiArray);
  //   }
  // }

  // private _getMethodIDs() {
  //   return this.methodIDs;
  // }

  // private _decodeMethod(data: any) {
  //   const methodID = data.slice(2, 10);
  //   const abiItem = this.methodIDs[methodID];
  //   if (abiItem) {
  //     let decoded = abicoder.decodeParameters(abiItem.inputs, data.slice(10));

  //     let retData = {
  //       name: abiItem.name,
  //       params: [],
  //     } as any;

  //     for (let i = 0; i < decoded.__length__; i++) {
  //       let param = decoded[i];
  //       let parsedParam = param;
  //       const isUint = abiItem.inputs[i].type.indexOf("uint") === 0;
  //       const isInt = abiItem.inputs[i].type.indexOf("int") === 0;
  //       const isAddress = abiItem.inputs[i].type.indexOf("address") === 0;

  //       if (isUint || isInt) {
  //         const isArray = Array.isArray(param);

  //         if (isArray) {
  //           parsedParam = param.map((val: any) => Web3.utils.toBN(val).toString());
  //         } else {
  //           parsedParam = Web3.utils.toBN(param).toString();
  //         }
  //       }

  //       // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
  //       if (isAddress) {
  //         const isArray = Array.isArray(param);

  //         if (isArray) {
  //           parsedParam = param.map( (param: any) => param.toLowerCase());
  //         } else {
  //           parsedParam = param.toLowerCase();
  //         }
  //       }

  //       retData.params.push({
  //         name: abiItem.inputs[i].name,
  //         value: parsedParam,
  //         type: abiItem.inputs[i].type,
  //       });
  //     }

  //     return retData;
  //   }
  // }

  // private _decodeLogs(logs: any) {
  //   return logs.filter((log: any) => log.topics.length > 0).map((logItem: any) => {
  //     const methodID = logItem.topics[0].slice(2);
  //     const method = this.methodIDs[methodID];
  //     if (method) {
  //       // console.log('METHOD', method, methodID, this.methodIDs);
  //       const logData = logItem.data;
  //       let decodedParams: any = [];
  //       let dataIndex = 0;
  //       let topicsIndex = 1;

  //       let dataTypes: any = [];
  //       method.inputs.map((input: any) => {
  //         // console.log(input);
  //         if (!input.indexed) {
  //           dataTypes.push(input.type);
  //         }
  //       });

  //       // console.log('>>>', dataTypes, logData, logData.slice(2));
  //       const decodedData = abicoder.decodeParameters(
  //         dataTypes,
  //         logData.slice(2)
  //       );

  //       // Loop topic and data to get the params
  //       method.inputs.map((param: any) => {
  //         let decodedP: any = {
  //           name: param.name,
  //           type: param.type,
  //         };

  //         if (param.indexed) {
  //           decodedP.value = logItem.topics[topicsIndex];
  //           topicsIndex++;
  //         } else {
  //           decodedP.value = decodedData[dataIndex];
  //           dataIndex++;
  //         }

  //         if (param.type === "address") {
  //           decodedP.value = decodedP.value.toLowerCase();
  //           // 42 because len(0x) + 40
  //           if (decodedP.value.length > 42) {
  //             let toRemove = decodedP.value.length - 42;
  //             let temp = decodedP.value.split("");
  //             temp.splice(2, toRemove);
  //             decodedP.value = temp.join("");
  //           }
  //         }

  //         if (
  //           param.type === "uint256" ||
  //           param.type === "uint8" ||
  //           param.type === "int"
  //         ) {
  //           // ensure to remove leading 0x for hex numbers
  //           decodedP.value = Web3.utils.toBN(decodedP.value).toString(10);
  //         }

  //         decodedParams.push(decodedP);
  //       });

  //       return {
  //         name: method.name,
  //         events: decodedParams,
  //         address: logItem.address,
  //       };
  //     }

  //     return null;
  //   });
  // }
}
