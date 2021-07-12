import { Component, Input, OnInit } from '@angular/core';
import { IAddress } from 'src/app/services/resources/address/address-resource.service';

@Component({
  selector: 'app-address-result',
  templateUrl: './address-result.component.html',
  styleUrls: ['./address-result.component.scss']
})
export class AddressResultComponent implements OnInit {
  @Input()
  address: IAddress | undefined;

  constructor(
  ) { }

  ngOnInit(): void {
  }
}
