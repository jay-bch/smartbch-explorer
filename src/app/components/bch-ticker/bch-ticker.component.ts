import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { NodeApiService } from 'src/app/services/api/node-api.service';
import { BlockResourceService } from 'src/app/services/resources/block-resource.service';

@Component({
  selector: 'app-bch-ticker',
  templateUrl: './bch-ticker.component.html',
  styleUrls: ['./bch-ticker.component.scss']
})
export class BchTickerComponent implements OnInit {
  public bchprice: string | undefined;

  public blockHeight$: BehaviorSubject<number | undefined> | undefined;

  constructor(
    private apiService: NodeApiService,
    public blockResource: BlockResourceService
  ) { }

  async ngOnInit(): Promise<void> {
    // const source = timer(1000, 20000);

    // const subscribe = source.subscribe(async () => {
    //   this.bchprice = await this.apiService.getBchPrice();
    // });

    this.blockHeight$ = this.blockResource.blockHeight$;
  }



}
