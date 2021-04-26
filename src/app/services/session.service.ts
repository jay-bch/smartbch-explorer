import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NodeApiService } from './api/node-api.service';
import { MetamaskService } from './metamask/metamask.service';

export interface ApiConfig {
  apiEndpoint?: string | null;
  ws3Endpoint?: string | null;
  apiType?: string | null;
  apiVersion?: string | null;
};

export interface Session {
  bootstrapped: boolean,
  initialized: boolean,
  apiOffline: boolean | undefined,
  apiConfig: ApiConfig,
  chainId?: number
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

  async bootstrapSession(apiConfig?: ApiConfig): Promise<boolean> {
    let loadedConfig = apiConfig;
    const storedConfig = localStorage.getItem('config');

    if(storedConfig && JSON.parse(storedConfig)) {
      loadedConfig = JSON.parse(storedConfig);
    }

    this.session$.next({ ...DEFAULT_SESSION, ...{ apiConfig: {
      apiEndpoint: loadedConfig?.apiEndpoint,
      apiType: loadedConfig?.apiType,
      apiVersion: loadedConfig?.apiVersion,
      ws3Endpoint: loadedConfig?.ws3Endpoint
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
    localStorage.setItem('config', JSON.stringify(newApiConfig));
    window.location.reload();
  }

  setEndpointOffline() {
    console.log('offline!')
    this.session$.next({...this.session$.getValue(), apiOffline: true, bootstrapped: true});
  }

  async setEndpointOnline(chainId: number) {
    this.session$.next({...this.session$.getValue(), apiOffline: false, initialized: true, bootstrapped: true, chainId: chainId});
  }
}
