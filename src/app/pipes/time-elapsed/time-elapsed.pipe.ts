import { Pipe, PipeTransform } from '@angular/core';

const DRIFT_COMPENTSATION = 0;

@Pipe({
  name: 'timeElapsed',
  pure: false
})
export class TimeElapsedPipe implements PipeTransform {

  transform(timestamp: number | string, ...args: unknown[]): string {
    return this.secondsToHms( (new Date().getTime() - ( (Number(timestamp) + DRIFT_COMPENTSATION) * 1000)) / 1000 );
  }

  private secondsToHms(seconds: number): string {
    var h = Math.floor(Math.round(seconds) / 3600);
    var m = Math.floor(Math.round(seconds) % 3600 / 60);
    var s = Math.floor(Math.round(seconds) % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    // var sDisplay = s > 0 ? "about 1 minute" : "";

    return hDisplay ? hDisplay : (mDisplay ? mDisplay : sDisplay);
}

}
