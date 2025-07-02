import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CustomValidators } from 'src/app/app-custom-validator';
import { regExConst } from 'src/app/const/regex.const';

@Injectable({
  providedIn: 'root',
})
export class FormServiceService {
  constructor() {}
}
