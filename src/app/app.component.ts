import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { filter, take } from 'rxjs/operators';
import { ConnectToNodeComponent } from './components/connect-to-node/connect-to-node.component';
import { MetamaskService } from './services/metamask/metamask.service';
import { BlockResourceService } from './services/resources/block-resource.service';
import { Session, SessionService } from './services/session.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  session: Session | undefined;

  constructor(
    private sessionService: SessionService,
    private dialogService: NbDialogService,
    private blockResource: BlockResourceService,
    private router: Router
  ) {

  }

  ngAfterViewInit(): void {
    this.sessionService.session$.pipe(
      filter(session => session.bootstrapped && !session.initialized),
      take(1)
    ).subscribe( (session: Session) => {
      console.log(session);
      this.session = session;

      if (session.apiOffline) {
        const modal = this.dialogService.open(ConnectToNodeComponent, {
          closeOnBackdropClick: false,
          backdropClass: 'connect-dialog-open'
        });

        modal.onClose.subscribe( () => {
          this.router.navigate(['/']);
        })
      }
    });
  }

  ngOnInit() {

  }
}
