import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-general-chip',
  templateUrl: './general-chip.component.html',
  styleUrls: ['./general-chip.component.scss']
})
export class GeneralChipComponent implements OnInit {
  @Input()
  value: string | number = '';

  @Input()
  type: string = 'success'

  constructor() { }

  ngOnInit(): void {
  }

}
