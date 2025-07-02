import { Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';

@Component({
  selector: 'app-error-messages',
  templateUrl: './error-messages.component.html',
  styleUrls: ['./error-messages.component.scss'],
})
export class ErrorMessagesComponent {
  @Input() errors!: ValidationErrors | null;
  errorConst = errorConst;
  regExConst = regExConst;
}
