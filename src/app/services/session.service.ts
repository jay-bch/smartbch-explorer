import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import config from '../../assets/config/nodes.json';

export interface ApiConfig {
  apiEndpoint?: string | null;
  apiType?: string | null;
  apiVersion?: string | null;
  network?: string;
};

export interface Session {
  bootstrapped: boolean,
  initialized: boolean,
  apiOffline: boolean | undefined,
  apiConfig: ApiConfig,
  chainId?: number
  error?: Error
}

export const DEFAULT_SESSION: Session = {
  bootstrapped: false,
  apiOffline: true,
  initialized: false,
  apiConfig: {}
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  session$: BehaviorSubject<Session> = new BehaviorSubject<Session>(DEFAULT_SESSION)

  constructor() {}

  resetSession() {
    this.session$.next(DEFAULT_SESSION);
  }

  async bootstrapSession(): Promise<boolean> {
    let loadedConfig: ApiConfig = config[0];
    const storedConfig = localStorage.getItem('connection-config');

    if(storedConfig && JSON.parse(storedConfig)) {
      loadedConfig = JSON.parse(storedConfig);
    }

    this.session$.next({ ...DEFAULT_SESSION, ...{ apiConfig: {
      apiEndpoint: loadedConfig?.apiEndpoint,
      apiType: loadedConfig?.apiType,
      apiVersion: loadedConfig?.apiVersion,
      network: loadedConfig?.network
    }}});

    return Promise.resolve(true)
  };

  // loadContracts() {
  //   erc20Contracts.forEach(async (contract) => {
  //     try {
  //       const contractInfo = this.getErc20ContractInformation(contract.address);
  //       if (contractInfo) {
  //         contracts.push(contractInfo);
  //       }

  //     } catch {
  //       return null;
  //     }

  //     return;
  //   });
  // }

  updateEndpoint(newApiConfig: ApiConfig) {
    localStorage.setItem('connection-config', JSON.stringify(newApiConfig));
    window.location.reload();
  }

  setEndpointOffline(error?: Error) {
    this.session$.next({...this.session$.getValue(), apiOffline: true, bootstrapped: true, initialized: false, error});
  }

  async setEndpointOnline(chainId: number) {
    this.session$.next({...this.session$.getValue(), apiOffline: false, initialized: true, bootstrapped: true, chainId: chainId});
  }
}
