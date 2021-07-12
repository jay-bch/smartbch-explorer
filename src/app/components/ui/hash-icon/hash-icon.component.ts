import { AfterViewInit, Compiler, Component, ComponentFactoryResolver, ElementRef, Input, OnChanges, OnInit, SecurityContext, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import jazzicon from '@metamask/jazzicon';

@Component({
  selector: 'app-hash-icon',
  templateUrl: './hash-icon.component.html',
  styleUrls: ['./hash-icon.component.scss']
})
export class HashIconComponent implements OnInit, OnChanges {
  @Input()
  address: string | undefined;
  @Input()
  diameter: number = 50;

  @Input()
  type: 'address' | 'contract' = 'address';
  template: SafeHtml | undefined;

  constructor(private sanitizer:DomSanitizer) { }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.address) {
      const addr = this.address.slice(2, 10);
      const seed = parseInt(addr, 16);
      this.template = this.sanitizer.bypassSecurityTrustHtml(jazzicon(this.diameter, seed).outerHTML);
    }
  }

  ngOnInit(): void {
  }
}
