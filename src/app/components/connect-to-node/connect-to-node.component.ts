import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { get } from 'lodash';
@Component({
  selector: 'app-connect-to-node',
  templateUrl: './connect-to-node.component.html',
  styleUrls: ['./connect-to-node.component.scss']
})
export class ConnectToNodeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject();

  endpointForm = new FormGroup({
    endpoint: new FormControl('wss://moeing.app:9546'),
  });
  error: Error | undefined;


  constructor(
    public dialogRef: MatDialogRef<ConnectToNodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sessionService: SessionService,
  ) {


  }

  ngOnInit() {
    this.error = get(this.data, 'error');

    console.log(this.error);
    // populate form with data from current session
    this.sessionService.session$
      .pipe(
        take(1)
      ).subscribe( session => {
        if(session.apiConfig.ws3Endpoint) {
          this.endpointForm.patchValue({
            endpoint: session.apiConfig.ws3Endpoint
          })
        }
      });

      // as soon as the session is initialized, close dialog
      this.sessionService.session$
        .pipe(
          filter( (session) => session.apiOffline === false && session.initialized),
          take(1)
        )
        .subscribe( () => {
          this.close();
        })
  }

  updateEndpoint() {
    if(this.endpointForm.get('endpoint')?.value) {
      this.sessionService.updateEndpoint({
        apiEndpoint: this.endpointForm.get('endpoint')?.value,
        apiType: 'web3',
        apiVersion: 'v1',
        ws3Endpoint: this.endpointForm.get('endpoint')?.value
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }
}
