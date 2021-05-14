import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig
} from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private index: number = 0;

  constructor(
    private snackBar: MatSnackBar
  ) { }

  showToast(
    message: string,
    title: string,
    status: string,
    duration: number = 3000) {
    this.index += 1;

    this.snackBar.open(message, title, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration,
      panelClass: status
    });


    // this.toastrService.show(
    //   message,
    //   title,
    //   { position, status, duration });
  }
}
