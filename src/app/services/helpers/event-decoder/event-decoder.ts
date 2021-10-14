import { map } from "lodash";
import { filter } from "rxjs/operators";
import Web3 from "web3";
import { AbiCoder } from "web3-eth-abi";
import { IContract } from "../../resources/contract/contract-resource.service";

const abicoder: AbiCoder = require('web3-eth-abi');

export interface IDecodedValue {
  name: string;
  value?: any;
  type?: string
}

export interface IDecodedMethod {
  name: string;
  params?: IDecodedValue[]
}

export interface IDecodedLog {
  address: string;
  events: IDecodedValue[];
  name: string;
}


export class EventDecoder {
  methodIDs: any = {};

  constructor(abi?: any) {
    if(abi) {
      this.addABI(abi);
    }
  }

  public getMethodIDs() {
    return this.methodIDs;
  }

  public decodeMethod(data: any): IDecodedMethod | undefined {
    const methodID = data.slice(2, 10);
    const abiItem = this.methodIDs[methodID];

    if (abiItem) {
      let decoded = abicoder.decodeParameters(abiItem.inputs, data.slice(10));

      // const rawInputs = map(abiItem.inputs, input => {
      //   return {
      //     internalType: input.internalType,
      //     name: input.name,
      //     type: 'string',
      //   }

      // });

      // console.log(abicoder.decodeParameters(rawInputs, data.slice(10)));

      let retData: IDecodedMethod = {
        name: abiItem.name,
        params: [],
      };

      for (let i = 0; i < decoded.__length__; i++) {
        let param = decoded[i];
        let parsedParam = param;
        const isUint = abiItem.inputs[i].type.indexOf("uint") === 0;
        const isInt = abiItem.inputs[i].type.indexOf("int") === 0;
        const isAddress = abiItem.inputs[i].type.indexOf("address") === 0;

        if (isUint || isInt) {
          const isArray = Array.isArray(param);

          if (isArray) {
            parsedParam = param.map((val: any) => Web3.utils.toBN(val).toString());
          } else {
            parsedParam = Web3.utils.toBN(param).toString();
          }
        }

        // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
        if (isAddress) {
          const isArray = Array.isArray(param);

          if (isArray) {
            parsedParam = param.map( (param: any) => param.toLowerCase());
          } else {
            parsedParam = param.toLowerCase();
          }
        }

        if(retData.params) retData.params.push({
          name: abiItem.inputs[i].name,
          value: parsedParam,
          type: abiItem.inputs[i].type,
        });
      }

      return retData;
    }

    return undefined;
  }

  public decodeLogs(logs: any) {
    return logs.filter((log: any) => log.topics.length > 0).map((logItem: any) => {
      const methodID = logItem.topics[0].slice(2);
      const method = this.methodIDs[methodID];

      if (method) {
        let logData = logItem.data;
        // fix/hack for ERC721 transfer events
        if(logData === '0x' && methodID === 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' ) {
          method.inputs[2] = {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        }

        // fix/hack for ERC721 approval events
        if(logData === '0x' && methodID === '8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925' ) {
          method.inputs[2] = {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        }


        let decodedParams: IDecodedValue[] = [];
        let dataIndex = 0;
        let topicsIndex = 1;

        let dataTypes: string[] = [];
        method.inputs.map((input: any) => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
        });

        let decodedData: {[key:string]: any} | undefined;

        try {
          decodedData = abicoder.decodeParameters(
            dataTypes,
            logData.slice(2)
          );
        }  catch {
          console.log('Error parsing log', method, methodID);
        }

        // Loop topic and data to get the params
        method.inputs.map((param: any) => {
            if(decodedData) {
              let decodedP: IDecodedValue = {
                name: param.name,
                type: param.type,
              };

              if (param.indexed) {
                decodedP.value = logItem.topics[topicsIndex];
                topicsIndex++;
              } else {
                decodedP.value = decodedData[dataIndex];
                dataIndex++;
              }

              if (param.type === "address") {
                decodedP.value = decodedP.value?.toLowerCase();
                // 42 because len(0x) + 40
                if (decodedP.value && decodedP.value.length > 42) {
                  let toRemove = decodedP.value.length - 42;
                  let temp = decodedP.value.split("");
                  temp.splice(2, toRemove);
                  decodedP.value = temp.join("");
                }
              }

              if (
                param.type === "uint256" ||
                param.type === "uint8" ||
                param.type === "int"
              ) {
                // ensure to remove leading 0x for hex numbers
                if(decodedP.value) decodedP.value = Web3.utils.toBN(decodedP.value).toString(10);
              }

              decodedParams.push(decodedP);
            }
          });



        return {
          name: method.name,
          events: decodedParams,
          address: logItem.address,
        };
      }

      return null;
    });
  }

  private _typeToString(input: any) {
    if (input.type === "tuple") {
      return "(" + input.components.map(this._typeToString).join(",") + ")";
    }
    return input.type;
  }

  public addABI(abiArray: any[]) {

    if (Array.isArray(abiArray)) {
      // Iterate new abi to generate method id"s
      abiArray.map((abi) => {
        if (abi.name) {
          const signature = Web3.utils.sha3(
            abi.name +
              "(" +
              abi.inputs
                .map(this._typeToString)
                .join(",") +
              ")"
          );
          if(signature) {
            if (abi.type === "event") {
              this.methodIDs[signature.slice(2)] = abi;
            } else {
              this.methodIDs[signature.slice(2, 10)] = abi;
            }
          }
        }
      });

      // this.state.savedABIs = this.state.savedABIs.concat(abiArray);
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  private _removeABI(abiArray: any[]) {
    if (Array.isArray(abiArray)) {
      // Iterate new abi to generate method id"s
      abiArray.map((abi) => {
        if (abi.name) {
          const signature = Web3.utils.sha3(
            abi.name +
              "(" +
              abi.inputs
                .map((input: any) => {
                  return input.type;
                })
                .join(",") +
              ")"
          );
          if(signature) {
            if (abi.type === "event") {
              if (this.methodIDs[signature.slice(2)]) {
                delete this.methodIDs[signature.slice(2)];
              }
            } else {
              if (this.methodIDs[signature.slice(2, 10)]) {
                delete this.methodIDs[signature.slice(2, 10)];
              }
            }
          }
        }
      });
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }
}
