import { Component, Input, OnInit } from '@angular/core';
import { TimeElapsedPipe } from 'src/app/pipes/time-elapsed/time-elapsed.pipe';
import { Block } from 'web3-eth';

@Component({
  selector: 'app-block-result',
  templateUrl: './block-result.component.html',
  styleUrls: ['./block-result.component.scss']
})
export class BlockResultComponent implements OnInit {

  @Input()
  block: Block | undefined;

  timestamp: number | undefined;

  constructor(
    private timeElapsedPipe: TimeElapsedPipe
  ) { }

  ngOnInit(): void {
    if(this.block?.timestamp) {
      this.timestamp = Number(this.block?.timestamp);
    }

  }

}
