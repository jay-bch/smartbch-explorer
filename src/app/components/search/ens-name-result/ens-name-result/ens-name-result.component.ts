import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ens-name-result',
  templateUrl: './ens-name-result.component.html',
  styleUrls: ['./ens-name-result.component.scss']
})
export class EnsNameResultComponent implements OnInit {
  @Input()
  data: { ensName: string, ensAddress: string } = { ensName: "", ensAddress: "" };

  constructor(
  ) { }

  ngOnInit(): void {
  }
}
