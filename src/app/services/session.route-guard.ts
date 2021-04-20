import { Injectable                 } from '@angular/core';
import { CanActivate                } from '@angular/router';
import { filter, take, timeout } from 'rxjs/operators';
import { SessionService } from './session.service';

@Injectable()
export class SessionRouteGuard implements CanActivate {

  constructor(
    private sessionService: SessionService
  ) {}

  canActivate(): Promise<boolean> {
    return new Promise( ( resolve, reject ) => {
      this.sessionService.session$.pipe(
        timeout(5000),
        filter(session => session.initialized),
        take(1)
      ).subscribe(() => {
        resolve(true)
      }, (error) => {
        console.log('[Bootstrap] Timed out');
        resolve(false)
      });
    });
  }
}

