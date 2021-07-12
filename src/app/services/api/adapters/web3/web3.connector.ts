import Web3 from "web3";
import { BlockNumber, HttpProvider, Transaction, TransactionConfig, TransactionReceipt, WebsocketProvider } from "web3-core";
import { Block } from "web3-eth";
import { SBCHSource } from "../../node-api.service";
import { sbch_extensions, smartBCHWeb3 } from "./web3-sbch.extension";

export type Web3ConnectorType = 'ws' | 'http' | null

const STAKE_CONTRACT = '0x2710';

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

        this.web3.currentProvider
      }
    } catch(error) {
      console.log('[Node Adapter:Web3] Error connecting to node', error);

      throw new Error('Error connecting to node')
    }
  }

  getWeb3() {
    return this.web3;
  }

  getChainId(): Promise<number> {
    if(!this.web3) return Promise.reject();

    return this.web3.eth.getChainId();
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

  getTxListByHeightWithRange(blockId: string, start: string | number, end: string | number) {
    if(!this.web3) return Promise.reject();
    if(this.web3.sbch) {
      console.log('MEOW');
      return this.web3.sbch?.getTxListByHeightWithRange(blockId, Web3.utils.toHex(start.toString()), Web3.utils.toHex(end.toString()));
    }
    return Promise.reject(false);
  }
  getTransaction(hash: string): Promise<Transaction> {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.getTransaction(hash);
  }
  queryTxByAddr(address: string, from: string | number | 'latest', to: string | number | 'latest', limit = 0): Promise<Transaction[]> {
    if(!this.web3) return Promise.reject();
    if(this.web3.sbch) {
      return this.web3.sbch?.queryTxByAddr(address, from, to, Web3.utils.toHex(limit.toString()));
    }
    return Promise.reject(false);
  }
  queryTxBySrc(address: string, from: string | number | 'latest', to: string | number | 'latest', limit = 0): Promise<Transaction[]> {
    if(!this.web3) return Promise.reject();
    if(this.web3.sbch) {
      return this.web3.sbch?.queryTxBySrc(address, from, to, Web3.utils.toHex(limit.toString()));
    }
    return Promise.reject(false);
  }

  queryTxByDst(address: string, from: string | number | 'latest', to: string | number | 'latest', limit = 0): Promise<Transaction[]> {
    if(!this.web3) return Promise.reject();
    if(this.web3.sbch) {
      return this.web3.sbch?.queryTxByDst(address, from, to, Web3.utils.toHex(limit.toString()));
    }
    return Promise.reject(false);
  }

  getTransactionCount(address: string, type: SBCHSource = 'both') {
    if(!this.web3) return Promise.reject();

    if(this.web3.sbch) {
      return this.web3.sbch.getAddressCount(type, address);
    }
    return Promise.reject(false);
  }

  getSep20TransactionCount(address: string, sep20Contract: string, type: SBCHSource) {
    if(!this.web3) return Promise.reject();

    if(this.web3.sbch) {
      return this.web3.sbch.getSep20AddressCount(type, sep20Contract, address);
    }
    return Promise.reject(false);
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

  queryLogs(address: string, data: any[], start: string, end: string, limit: string) {
    if(!this.web3) return Promise.reject();
    return this.web3.sbch.queryLogs(address, data, start, end, limit);
  }

  async queryAddressLogs(address: string, start?: string, end?: string) {
    if(!this.web3) return Promise.reject();
    // const contract = new this.web3.eth.Contract([], address);

    // const pastEvents = await contract.getPastEvents('allEvents', {fromBlock: 1});

    // console.log('past', pastEvents);
    return this.web3?.sbch.queryLogs(address, [], '0x1', 'latest', Web3.utils.toHex(32));
  }

  decodeParameter(datType: string, call: string) {
    if(!this.web3) return Promise.reject();
    return this.web3.eth.abi.decodeParameter(datType, call);
  }
}
