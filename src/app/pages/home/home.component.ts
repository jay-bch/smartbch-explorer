import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NodeApiService } from 'src/app/services/api/node-api.service';
import { MetamaskService } from 'src/app/services/metamask/metamask.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  linkedAddress: string | undefined;
  linkedAddressEnsName: string | undefined;

  constructor(
    private metamaskService: MetamaskService,
    private apiService: NodeApiService,
  ) {}

  ngOnInit(): void {
    this.metamaskService.state$
      .pipe().subscribe(async (state) => {
        this.linkedAddress = this.metamaskService.linkedAddress;
        this.linkedAddressEnsName = await this.apiService.ensNameLookup(this.linkedAddress!);
      })

  }

}
