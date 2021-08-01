import { Component, AfterViewInit, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { ConnectToNodeComponent } from './components/connect-to-node/connect-to-node.component';
import { MetamaskService } from './services/metamask/metamask.service';
import { BlockResourceService } from './services/resources/block/block-resource.service';
import { Session, SessionService } from './services/session.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  session: Session | undefined;
  modal: MatDialogRef<any> | undefined;

  constructor(
    private sessionService: SessionService,
    private dialogService: MatDialog,
    private metaMaskService: MetamaskService,
    private blockResource: BlockResourceService,
    private router: Router
  ) {

  }

  ngAfterViewInit(): void {
    this.sessionService.session$.pipe(
      filter(session => session.bootstrapped && !session.initialized),
    ).subscribe( (session: Session) => {
      this.session = session;

      if (session.apiOffline && this.modal?.getState() !== 0) {

        this.blockResource.stopTimer();
        this.modal = this.dialogService.open(ConnectToNodeComponent, {disableClose: true, data: {error: session.error, url: session.apiConfig.apiEndpoint}});

        this.modal.afterClosed().subscribe( () => {
          this.router.navigate(['/']);
        })
      }
    });
  }

  ngOnInit() {

  }
}
