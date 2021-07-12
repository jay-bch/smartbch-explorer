import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-empty-result',
  templateUrl: './empty-result.component.html',
  styleUrls: ['./empty-result.component.scss']
})
export class EmptyResultComponent implements OnInit {

  @Input()
  query: string | undefined;


  constructor() { }

  ngOnInit(): void {
  }
}
