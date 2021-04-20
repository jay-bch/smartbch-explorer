import Web3 from "web3";
import { BlockNumber, HttpProvider, Transaction, TransactionConfig, TransactionReceipt, WebsocketProvider } from "web3-core";
import { Block } from "web3-eth";
import { sbch_extensions, smartBCHWeb3 } from "./web3-sbch.extension";

export type Web3ConnectorType = 'ws' | 'http' | null

// var web3: smartBCHWeb3;

export class Web3Connector {
  web3: smartBCHWeb3 | undefined;
  type: string | null;
  endpoint: string;

  constructor(endpoint: string, type: Web3ConnectorType ) {
    this.type = type;
    this.endpoint = endpoint;

    try {
      if(!endpoint) {
        throw new Error('No endpoint provided');
      }

      if(!type) {
        throw new Error('No connector type provided');
      }

      if(type === 'ws')  {
        if( this.web3 ) {
          console.log('[Node Adapter:Web3] Dissconnect web3', endpoint);

          const provider: WebsocketProvider = this.web3.currentProvider as WebsocketProvider;

          if(provider.connected) {
            provider.disconnect(1000, 'Reload Provider');
          }
        }

        console.log('[Node Adapter:Web3] Connecting to node via WS');
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(endpoint)) as smartBCHWeb3;
      }

      if(type === 'http')  {
        console.log('[Node Adapter:Web3] Connecting to node via HTTP');
        this.web3 = new Web3(new Web3.providers.HttpProvider(endpoint)) as smartBCHWeb3;
      }

      console.log('[Node Adapter:Web3] Loading SBCH web3 extensions');
      if(this.web3) {
        this.web3.extend(sbch_extensions);
      }
    } catch(error) {
      console.log('[Node Adapter:Web3] Error connecting to node', error);

      throw new Error('Error connecting to node')
    }
  }

  getWeb3() {
    return this.web3;
  }

  getBlockNumber(): Promise<number> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getBlockNumber();
  }
  getBlock(blockId: BlockNumber): Promise<Block> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getBlock(blockId);
  }
  getTxListByHeight(blockId: string): Promise<Transaction[]> {
    if(!this.web3) return Promise.reject();
    return this.web3.sbch.getTxListByHeight(blockId);
  }
  getTransaction(hash: string): Promise<Transaction> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getTransaction(hash);
  }
  queryTxByAddr(address: string, from: string | number | 'latest', to: string | number | 'latest'): Promise<Transaction[]> {
    if(!this.web3) return Promise.reject();
    if(this.web3.sbch) {
      return this.web3.sbch?.queryTxByAddr(address, from, to);
    }
    return Promise.reject(false);
  }
  getTransactionCount(address: string) {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getTransactionCount(address);
  }
  getBalance(address: string): Promise<string> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getBalance(address);
  }

  getCode(address: string): Promise<string> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getCode(address);
  }

  getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getTransactionReceipt(hash)
  }

  call(transactionConfig: TransactionConfig): Promise<string> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.call(transactionConfig);
  }

  queryLogs(address: string, data: any[], start: string, end: string) {
    if(!this.web3) return Promise.reject();
    return this.web3.sbch.queryLogs(address, data, start, end);
  }

  decodeParameter(datType: string, call: string) {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.abi.decodeParameter(datType, call);
  }
}
