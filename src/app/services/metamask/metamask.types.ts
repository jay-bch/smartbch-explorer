
export type MetaMaskState = undefined | 'unavailable' | 'error:init' | 'not-connected' | 'connected' | 'linked' | 'error:wrongchain';

export interface IMetaMask {
  isMetaMask: boolean,
  chainId: number,
  isConnected(): boolean;
  request(request: {method: 'eth_requestAccounts'}): Promise<any>;
  request(request: {method: 'eth_accounts'}): Promise<any>;
  on(event: 'connect', callback: (result: {chainId: string}) => void ): void;
  on(event: 'disconnect', callback: (result: {chainId: string}) => void ): void;
  on(event: 'message', callback: (result: {type: string; data: unknown; }) => void ): void;
  on(event: 'accountsChanged', callback: (result: Array<string>) => void ): void;
  on(event: 'chainChanged', callback: (result: string) => void ): void;
  listeners(event: string): any;
  removeAllListeners(): any;
}
