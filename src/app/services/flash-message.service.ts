import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type FlashMessagePurpose =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | undefined;

export type FlashMessageProperties = {
  message: string;
  topBarColor: string;
  iconType: string;
  iconColor: string;
  timeOut: number;
};

@Injectable({
  providedIn: 'root',
})
export class FlashMessageService {
  private openEventSubject = new Subject();
  public openEventObservable$ = this.openEventSubject.asObservable();
  private closeEventSubject = new Subject<string>();
  public closeEventObservable$ = this.closeEventSubject.asObservable();
  private properties: FlashMessageProperties = {
    message: '',
    topBarColor: '',
    iconType: '',
    iconColor: '',
    timeOut: 0,
  };
  private purpose: FlashMessagePurpose;

  constructor() {}

  setFlashMessage(
    message: string,
    purpose: FlashMessagePurpose = 'info',
    timeOut: number = 30000
  ): void {
    this.properties.message = message;
    this.purpose = purpose;
    this.properties.timeOut = timeOut;

    switch (this.purpose) {
      case 'success':
        this.properties.topBarColor = 'border-t-success';
        this.properties.iconType = 'checkbox-circle-line';
        this.properties.iconColor = 'fill-success';
        break;
      case 'warning':
        this.properties.topBarColor = 'border-t-warning';
        this.properties.iconType = 'error-warning-line';
        this.properties.iconColor = 'fill-warning';
        break;
      case 'danger':
        this.properties.topBarColor = 'border-t-danger';
        this.properties.iconType = 'alert-line';
        this.properties.iconColor = 'fill-danger';
        break;
      default:
        this.properties.topBarColor = 'border-t-primary';
        this.properties.iconType = 'information-line';
        this.properties.iconColor = 'fill-primary';
        break;
    }
    this.openEventSubject.next(null);
  }

  getFlashMessageProperties(): FlashMessageProperties {
    return this.properties;
  }

  public requestCloseFlashMessage() {
    this.closeEventSubject.next('');
  }
}
