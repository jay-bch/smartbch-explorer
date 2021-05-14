import { Injectable } from '@angular/core';
import Web3 from 'web3';

const abicoder = require('web3-eth-abi');

@Injectable({
  providedIn: 'root'
})
export class ContractResourceService {

  state: any = {
    savedABIs: [],
    methodIDs: {},
  };


  constructor(

  ) {
    const testABI = [{"inputs": [{"type": "address", "name": ""}], "constant": true, "name": "isInstantiation", "payable": false, "outputs": [{"type": "bool", "name": ""}], "type": "function"}, {"inputs": [{"type": "address[]", "name": "_owners"}, {"type": "uint256", "name": "_required"}, {"type": "uint256", "name": "_dailyLimit"}], "constant": false, "name": "create", "payable": false, "outputs": [{"type": "address", "name": "wallet"}], "type": "function"}, {"inputs": [{"type": "address", "name": ""}, {"type": "uint256", "name": ""}], "constant": true, "name": "instantiations", "payable": false, "outputs": [{"type": "address", "name": ""}], "type": "function"}, {"inputs": [{"type": "address", "name": "creator"}], "constant": true, "name": "getInstantiationCount", "payable": false, "outputs": [{"type": "uint256", "name": ""}], "type": "function"}, {"inputs": [{"indexed": false, "type": "address", "name": "sender"}, {"indexed": false, "type": "address", "name": "instantiation"}], "type": "event", "name": "ContractInstantiation", "anonymous": false}];
    this._addABI(testABI);

    const testData = "0x53d9d9100000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114de5000000000000000000000000a6d9c5f7d4de3cef51ad3b7235d79ccc95114daa";
    const decodedData = this._decodeMethod(testData);

    console.log('decode', decodedData)

  }

  _getABIs() {
    return this.state.savedABIs;
  }

  _typeToString(input: any) {
    if (input.type === "tuple") {
      return "(" + input.components.map(this._typeToString).join(",") + ")";
    }
    return input.type;
  }

  _addABI(abiArray: any[]) {

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
              this.state.methodIDs[signature.slice(2)] = abi;
            } else {
              this.state.methodIDs[signature.slice(2, 10)] = abi;
            }
          }
        }
      });

      this.state.savedABIs = this.state.savedABIs.concat(abiArray);
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  _removeABI(abiArray: any[]) {
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
              if (this.state.methodIDs[signature.slice(2)]) {
                delete this.state.methodIDs[signature.slice(2)];
              }
            } else {
              if (this.state.methodIDs[signature.slice(2, 10)]) {
                delete this.state.methodIDs[signature.slice(2, 10)];
              }
            }
          }
        }
      });
    } else {
      throw new Error("Expected ABI array, got " + typeof abiArray);
    }
  }

  _getMethodIDs() {
    return this.state.methodIDs;
  }

  _decodeMethod(data: any) {
    const methodID = data.slice(2, 10);
    const abiItem = this.state.methodIDs[methodID];
    if (abiItem) {
      let decoded = abicoder.decodeParameters(abiItem.inputs, data.slice(10));

      let retData = {
        name: abiItem.name,
        params: [],
      } as any;

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

        retData.params.push({
          name: abiItem.inputs[i].name,
          value: parsedParam,
          type: abiItem.inputs[i].type,
        });
      }

      return retData;
    }
  }

  _decodeLogs(logs: any) {
    return logs.filter((log: any) => log.topics.length > 0).map((logItem: any) => {
      const methodID = logItem.topics[0].slice(2);
      const method = this.state.methodIDs[methodID];
      if (method) {
        const logData = logItem.data;
        let decodedParams: any = [];
        let dataIndex = 0;
        let topicsIndex = 1;

        let dataTypes: any = [];
        method.inputs.map((input: any) => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
        });

        const decodedData = abicoder.decodeParameters(
          dataTypes,
          logData.slice(2)
        );

        // Loop topic and data to get the params
        method.inputs.map((param: any) => {
          let decodedP: any = {
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
            decodedP.value = decodedP.value.toLowerCase();
            // 42 because len(0x) + 40
            if (decodedP.value.length > 42) {
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
            decodedP.value = Web3.utils.toBN(decodedP.value).toString(10);
          }

          decodedParams.push(decodedP);
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
}
