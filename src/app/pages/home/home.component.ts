import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { MetamaskService } from 'src/app/services/metamask/metamask.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  linkedAddress: string | undefined;

  constructor(
    private metamaskService: MetamaskService
  ) {}

  ngOnInit(): void {
    this.metamaskService.state$
      .pipe().subscribe( state => {
        this.linkedAddress = this.metamaskService.linkedAddress;
      })

  }

}
