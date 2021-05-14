import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BlockResourceService } from '../../services/resources/block/block-resource.service';

@Component({
  selector: 'app-height-ticker',
  templateUrl: './height-ticker.component.html',
  styleUrls: ['./height-ticker.component.scss']
})
export class HeightTickerComponent implements OnInit {
  public blockHeight$: BehaviorSubject<number | undefined> | undefined;

  constructor(
    public blockResource: BlockResourceService
  ) { }

  async ngOnInit(): Promise<void> {
    this.blockHeight$ = this.blockResource.blockHeight$;
  }
}
