import { Component, Input, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlockResourceService } from 'src/app/services/resources/block-resource.service';
import { Block } from 'web3-eth';

@Component({
  selector: 'app-block-information',
  templateUrl: './block-information.component.html',
  styleUrls: ['./block-information.component.scss']
})
export class BlockInformationComponent implements OnInit {

  @Input()
  block: Block | undefined;
  public timestamp: number | undefined;

  public gasPercentageUsed: string | undefined;
  public blockHeight$: BehaviorSubject<number | undefined> | undefined;

  constructor(
    private blockResource: BlockResourceService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.blockHeight$ = this.blockResource.blockHeight$;
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['block'] && this.block) {
      this.timestamp = Number(this.block?.timestamp);
      this.gasPercentageUsed = (this.block.gasUsed / this.block.gasLimit).toFixed(2);
    }
  }

  next() {
    if(this.block) {
      this.router.navigate(['/block', this.block.number + 1]);
    }
  }

  previous() {
    if(this.block) {
      this.router.navigate(['/block', this.block.number - 1])
    }
  }
}
