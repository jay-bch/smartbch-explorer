import { Injectable } from '@angular/core';
import { NbGlobalPosition, NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private index: number = 0;

  constructor(private toastrService: NbToastrService) { }

  showToast(message: string, title: string, position: NbGlobalPosition, status: string, duration: number = 3000) {
    this.index += 1;
    this.toastrService.show(
      message,
      title,
      { position, status, duration });
  }
}
