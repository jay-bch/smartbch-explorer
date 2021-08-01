import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, filter, startWith, map } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { get } from 'lodash';

import nodes from '../../../assets/config/nodes.json';

export interface INode {
  apiEndpoint: string; apiType: string; apiVersion: string;
}

@Component({
  selector: 'app-connect-to-node',
  templateUrl: './connect-to-node.component.html',
  styleUrls: ['./connect-to-node.component.scss']
})
export class ConnectToNodeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject();

  endpointForm = new FormGroup({
    endpoint: new FormControl(nodes[0].apiEndpoint),
  });
  error: Error | undefined;
  nodes: INode[];
  errorNodeUrl: string | undefined;
  filteredOptions: Observable<INode[]> | undefined;

  constructor(
    public dialogRef: MatDialogRef<ConnectToNodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sessionService: SessionService,
  ) {
    this.nodes = nodes;
  }

  ngOnInit() {
    this.error = get(this.data, 'error');
    this.errorNodeUrl = get(this.data, 'url');
      // as soon as the session is initialized, close dialog
      this.sessionService.session$
        .pipe(
          filter( (session) => session.apiOffline === false && session.initialized),
          take(1)
        )
        .subscribe( () => {
          this.close();
        });

    this.filteredOptions = this.endpointForm.controls['endpoint'].valueChanges.pipe(
          startWith(""),
          map(val => this.filter(val))
        );
  }

  updateEndpoint() {
    if(this.endpointForm.get('endpoint')?.value) {
      this.sessionService.updateEndpoint({
        apiEndpoint: this.endpointForm.get('endpoint')?.value,
        apiType: 'web3',
        apiVersion: 'v1',
      });
    }
  }

  filter(val: string): INode[] {
    return this.nodes.filter(option => {
      return true;
      // return option.apiEndpoint.match(val.toLowerCase());
    });
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }
}
