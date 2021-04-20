import Web3 from 'web3';
import { Transaction } from 'web3-core';
import helpers from 'web3-core-helpers'
import { Hex } from 'web3-utils';

export interface smartBCHWeb3 extends Web3 {
  sbch: {
    queryTxBySrc(from: string, start: number, end: number): Promise<any>;
    queryTxByDst(from: string, start: number | 'latest', end: number | 'latest'): Promise<any>;
    queryTxByAddr(from: string, start: Hex | 'latest', end: Hex | 'latest'): Promise<any>;
    queryLogs(address: string, data: any[], start: string | 'latest', end: string | 'latest'): Promise<any>;
    getTxListByHeight(blockHeight: string): Promise<Transaction[]>;
  }
}

export var sbch_extensions = {
  property: 'sbch',
  methods: [
    {
      name: 'queryTxBySrc',
      call: 'sbch_queryTxBySrc',
      params: 3,
      inputFormatter: [helpers.formatters.inputAddressFormatter, null, null],
      outputFormatter: null
    },
    {
      name: 'queryTxByDst',
      call: 'sbch_queryTxByDst',
      params: 3,
      inputFormatter: [helpers.formatters.inputAddressFormatter, null, null],
      outputFormatter: null
    },
    {
      name: 'queryTxByAddr',
      call: 'sbch_queryTxByAddr',
      params: 3,
      inputFormatter: [helpers.formatters.inputAddressFormatter, null, null],
      outputFormatter: null
    },
    {
      name: 'queryLogs',
      call: 'sbch_queryLogs',
      params: 4,
      inputFormatter: [helpers.formatters.inputAddressFormatter, null, null, null],
      outputFormatter: null
    },
    {
      name: 'getTxListByHeight',
      call: 'sbch_getTxListByHeight',
      params: 1,
      inputFormatter: [helpers.formatters.inputDefaultBlockNumberFormatter],
      outputFormatter: null
    }
  ]
} as any;
