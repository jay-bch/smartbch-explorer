import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ConnectToNodeComponent } from '../components/connect-to-node/connect-to-node.component';

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

  async bootstrapSession(apiConfig?: ApiConfig): Promise<boolean> {
    let loadedConfig = apiConfig;
    const storedConfig = localStorage.getItem('connection-config');

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
    localStorage.setItem('connection-config', JSON.stringify(newApiConfig));
    console.log('update');
    window.location.reload();
  }

  setEndpointOffline(error?: Error) {
    this.session$.next({...this.session$.getValue(), apiOffline: true, bootstrapped: true, initialized: false, error});
  }

  async setEndpointOnline(chainId: number) {
    this.session$.next({...this.session$.getValue(), apiOffline: false, initialized: true, bootstrapped: true, chainId: chainId});
  }
}
