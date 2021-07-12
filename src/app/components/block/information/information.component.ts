import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UtilHelperService } from 'src/app/services/helpers/util/util-helper.service';
import { BlockResourceService } from 'src/app/services/resources/block/block-resource.service';
import { Block } from 'web3-eth';

@Component({
  selector: 'app-block-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class BlockInformationComponent implements OnInit {

  @Input()
  block: Block | undefined;
  public timestamp: number | undefined;

  public gasPercentageUsed: string | undefined;
  public blockHeight$: BehaviorSubject<number | undefined> | undefined;

  constructor(
    private blockResource: BlockResourceService,
    private helper: UtilHelperService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.blockHeight$ = this.blockResource.blockHeight$;
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['block'] && this.block) {
      this.timestamp = Number(this.block?.timestamp);
      this.gasPercentageUsed = this.helper.getGasPercentageUsed(this.block);
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
