import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  @Input()
  content: string | undefined;

  @ViewChild('autosize') autosize: CdkTextareaAutosize | undefined;

  constructor(
    private _ngZone: NgZone
  ) { }

  ngOnInit(): void {
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() =>  {
        if (this.autosize) {
          this.autosize.resizeToFitContent(true);
        }
    });
  }

}
