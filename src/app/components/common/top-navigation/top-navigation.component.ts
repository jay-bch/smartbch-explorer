import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, HostBinding, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { throttleTime, pairwise, distinctUntilChanged, share, map, filter, takeUntil } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';


enum VisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

enum Direction {
  Up = 'Up',
  Down = 'Down'
}

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.scss'],
  animations: [
    trigger('toggle', [
      state(
        VisibilityState.Hidden,
        style({ opacity: 0, transform: 'translateY(-100%)' })
      ),
      state(
        VisibilityState.Visible,
        style({ opacity: 1, transform: 'translateY(0)' })
      ),
      transition('* => *', animate('200ms ease-in'))
    ])
  ]
})
export class TopNavigationComponent implements AfterViewInit, OnDestroy {
  private isVisible = true;
  networkName: string | undefined;

  @HostBinding('@toggle')
  get toggle(): VisibilityState {
    return this.isVisible ? VisibilityState.Visible : VisibilityState.Hidden;
  }

  destroy$: Subject<boolean> = new Subject();

  constructor(
    private window: Window,
    private sessionService: SessionService,
  ) {
  }

  ngAfterViewInit() {
    const scroll$ = fromEvent(window, 'scroll').pipe(
      throttleTime(10),
      map(() => this.window.pageYOffset),
      pairwise(),
      map(([y1, y2]): Direction => (y2 < y1 ? Direction.Up : Direction.Down)),
      distinctUntilChanged(),
      share()
    );

    const scrollUp$ = scroll$.pipe(
      filter(direction => direction === Direction.Up)
    );

    const scrollDown = scroll$.pipe(
      filter(direction => direction === Direction.Down)
    );

    scrollUp$.subscribe(() => (this.isVisible = true));
    scrollDown.subscribe(() => (this.isVisible = false));

    this.sessionService.session$.pipe(
      takeUntil(this.destroy$),
      filter(session => session.bootstrapped === true)
    ).subscribe( session => {
      this.networkName = session.apiConfig.network;
    })
  }

  disconnectFromNode() {
    localStorage.setItem('connection-config', JSON.stringify({}));
    window.location.reload();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

}
