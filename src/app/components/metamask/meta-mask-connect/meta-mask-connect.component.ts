import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MetamaskService } from 'src/app/services/metamask/metamask.service';
import { MetaMaskState } from 'src/app/services/metamask/metamask.types';
import { NotificationService } from 'src/app/services/user/notification/notification.service';

@Component({
  selector: 'app-meta-mask-connect',
  templateUrl: './meta-mask-connect.component.html',
  styleUrls: ['./meta-mask-connect.component.scss']
})
export class MetaMaskConnectComponent implements OnInit {
  state: MetaMaskState | undefined;
  linkedAddress: string | undefined;

  constructor(
    public metaMaskService: MetamaskService,

    private cd: ChangeDetectorRef
  ) {
    this.metaMaskService.state$.subscribe( state => {
      if(state) {
        this.state = state;
        this.linkedAddress = this.metaMaskService.linkedAddress;
        console.log('Metamask:', state, this.linkedAddress);
        // this.cd.markForCheck();
        this.cd.detectChanges();
      }
    })
  }

  ngOnInit(): void {


  }

  metamaskAction() {
    if(this.state === 'connected') {
      this.metaMaskService.connect();
    }
  }

  connect() {

  }

}
