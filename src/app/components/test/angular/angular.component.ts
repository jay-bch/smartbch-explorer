import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-angular',
  templateUrl: './angular.component.html',
  styleUrls: ['./angular.component.scss']
})
export class AngularComponent implements OnInit {
  opened = false;
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav | undefined;

  ngOnInit() {
    console.log(window.innerWidth)
    if(this.sidenav) {
      if (window.innerWidth < 768) {
        this.sidenav.fixedTopGap = 55;
        this.opened = false;
      } else {
        this.sidenav.fixedTopGap = 55;
        this.opened = false;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(this.sidenav) {
      if (event.target.innerWidth < 768) {
        this.sidenav.fixedTopGap = 55;
        this.opened = false;
      } else {
        this.sidenav.fixedTopGap = 55
        this.opened = true;
      }
    }
  }

  isBiggerScreen() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width < 768) {
      return true;
    } else {
      return false;
    }
  }

}
