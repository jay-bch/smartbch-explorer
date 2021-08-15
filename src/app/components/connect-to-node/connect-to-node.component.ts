import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, filter, startWith, map, tap, takeUntil } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { get } from 'lodash';

import nodes from '../../../assets/config/nodes.json';

export interface INode {
  apiEndpoint: string;
  apiType: string;
  apiVersion: string;
  network: string;
}

@Component({
  selector: 'app-connect-to-node',
  templateUrl: './connect-to-node.component.html',
  styleUrls: ['./connect-to-node.component.scss']
})
export class ConnectToNodeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject();

  endpointForm = new FormGroup({
    endpointSelect: new FormControl(nodes[0]),
    endpointCustom: new FormControl(undefined),
  });
  error: Error | undefined;
  nodes: INode[];
  errorNodeUrl: string | undefined;
  filteredOptions: Observable<INode[]> | undefined;

  customNodeOption: INode = {
    apiEndpoint: '',
    apiType: '',
    apiVersion: '',
    network: 'custom'
  }
  showCustomInput: boolean = false;

  get endpointCustom(): FormControl {
    return this.endpointForm.get('endpointCustom') as FormControl;
  }

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

    this.filteredOptions = this.endpointForm.controls['endpointCustom'].valueChanges.pipe(
      startWith(""),
      map(val => this.filter(val))
    );

    this.endpointForm.controls['endpointSelect'].valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(node => this.showCustomInput = false),
      filter(node => node.network === 'custom'),
      tap(node => this.showCustomInput = true),
    ).subscribe();
  }

  updateEndpoint() {
    if(this.endpointForm.get('endpointSelect')?.value) {
      const node = this.endpointForm.get('endpointSelect')?.value;

      if(node.network !== 'custom') {
        this.sessionService.updateEndpoint({
          apiEndpoint: node.apiEndpoint,
          apiType: 'web3',
          apiVersion: 'v1',
          network: node.network
        });
      } else {
        if(this.endpointForm.get('endpointCustom')?.value) {
          this.sessionService.updateEndpoint({
            apiEndpoint: this.endpointForm.get('endpointCustom')?.value,
            apiType: 'web3',
            apiVersion: 'v1',
            network: 'custom'
          });
        }
      }
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
