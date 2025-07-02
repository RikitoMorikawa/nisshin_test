import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ModalPurpose =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | undefined;
export type ModalProperties = {
  title: string;
  body: string;
  topBarColor: string;
  iconType: string;
  iconColor: string;
  continueButtonText: string;
  cancelButtonText: string;
  showCancelButton: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private openEventSubject = new Subject();
  public openEventObservable$ = this.openEventSubject.asObservable();
  private closeEventSubject = new Subject<string>();
  public closeEventObservable$ = this.closeEventSubject.asObservable();
  private properties: ModalProperties = {
    title: '',
    body: '',
    topBarColor: '',
    iconType: '',
    iconColor: '',
    continueButtonText: '',
    cancelButtonText: '',
    showCancelButton: true,
  };
  private purpose: ModalPurpose;

  setModal(
    title: string,
    body: string,
    purpose: ModalPurpose = 'info',
    continueButtonText: string = 'このまま実行',
    cancelButtonText: string = 'キャンセル',
    showCancelButton: boolean = true
  ): void {
    this.properties.title = title;
    this.properties.body = body;
    this.purpose = purpose;
    this.properties.continueButtonText = continueButtonText;
    this.properties.cancelButtonText = cancelButtonText;
    this.properties.showCancelButton = showCancelButton;

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

  getModalProperties(): ModalProperties {
    return this.properties;
  }

  public requestCloseModal(choice: string) {
    this.closeEventSubject.next(choice);
  }
}
