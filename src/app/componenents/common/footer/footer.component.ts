import { Component, OnInit } from '@angular/core';

import packageSettings from '../../../../../package.json';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  version: string;

  constructor() {
    this.version = packageSettings.version;
  }

  ngOnInit(): void {
  }

}
