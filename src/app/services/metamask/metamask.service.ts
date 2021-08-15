import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import Web3 from 'web3';
import { SessionService } from '../session.service';
import { IMetaMask, MetaMaskState } from './metamask.types';

import detectEthereumProvider from '@metamask/detect-provider';
import { NotificationService } from '../user/notification/notification.service';
import { ShorthashPipe } from 'src/app/pipes/shorthash/shorthash.pipe';

declare const ethereum : IMetaMask;

@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  state$: BehaviorSubject<MetaMaskState | undefined> = new BehaviorSubject<MetaMaskState>(undefined)
  chainId: number | undefined;
  metaMaskChainId: number | undefined;
  linkedAddress: string | undefined;

  ac = new AbortController();

  constructor(
    private sessionService: SessionService,
    private notificationService: NotificationService,
    private hashPipe: ShorthashPipe


  ) {
    this.sessionService.session$.pipe(filter(session => !session.apiOffline), take(1))
    .subscribe((session) => {
      this.chainId = session.chainId;
      this.init();
    });

  }

  async init () {
    this.linkedAddress = undefined;
    if(window.ethereum === undefined || !ethereum){
      this.state$.next('unavailable');
      return;
    }

    const provider = await detectEthereumProvider();

    if (provider !== ethereum) {
      console.error('Do you have multiple wallets installed?');
      this.state$.next('error:init');
      return;
    }

    this.watchStateChanges();

    if(ethereum.isConnected()) {
      this.metaMaskChainId = Web3.utils.hexToNumber(ethereum.chainId);
    } else {
      this.state$.next('not-connected');
      return;
    }

    if(this.chainId !== this.metaMaskChainId) {
      console.log('wrong chain');
      this.notificationService.showToast(`Wrong network! Expected ID ${this.chainId}. Metamask is connected to ID ${this.metaMaskChainId}. Switch to a smartBCH chain.`, 'MetaMask', 'warning', 5000)
      this.state$.next('error:wrongchain')
      return;
    }

    ethereum.request({ method: 'eth_accounts' }).then( (accounts: any) => {
      if(accounts && accounts.length > 0) {
        this.linkedAddress = accounts[0];
        this.notificationService.showToast(`Connected to account ${this.hashPipe.transform(this.linkedAddress ?? '')}!`, 'MetaMask', 'success');
        this.state$.next('linked');
      } else {
        this.notificationService.showToast(`Metamask detected, click the fox to link an account.`, 'MetaMask', 'info');
        this.state$.next('connected');
      }
    });

    //  address available defines that address linked...


    // ethereum.request({ method: 'eth_requestAccounts' }).then( (result: any) => {
    //   console.log('eth_requestAccounts', result)
    //   this.state$.next('connected');
    // });


  }

  connect() {
    ethereum.request({ method: 'eth_requestAccounts' }).then( (result: any) => {
      this.linkedAddress = result[0];

      this.state$.next('linked');
    });
  }

  watchStateChanges() {
    ethereum.removeAllListeners();

    ethereum.on('chainChanged', (chainId) => {
      this.metaMaskChainId = Web3.utils.hexToNumber(chainId);
      this.init();
    });

    ethereum.on('connect', (result) => {
      // console.log('connect', result);
      this.metaMaskChainId = Web3.utils.hexToNumber(result.chainId);
      this.init();
    });

    ethereum.on('disconnect', (result) => {
      // console.log('disconnect', result);
      this.metaMaskChainId = undefined;
      this.init();
    });

    ethereum.on('accountsChanged', () => {
      this.init();
    })
  }

  abortSignal() {

  }
}
