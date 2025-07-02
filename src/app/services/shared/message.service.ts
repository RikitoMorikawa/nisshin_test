import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messege!: string;

  constructor() {}

  setMessege(text: string) {
    this.messege = text;
  }
  getMessege() {
    return this.messege;
  }
}
