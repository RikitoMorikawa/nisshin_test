import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-date-term',
  templateUrl: './date-term.component.html',
  styleUrls: ['./date-term.component.scss'],
})
export class DateTermComponent implements OnInit {
  constructor() {}

  // 入力フォーム周りの変数
  @Input() formCtrl!: FormControl;
  @Input() nameAttrValue!: string;
  @Input() idAttrValue!: string;
  required = false;

  ngOnInit(): void {
    this.required = this.formCtrl.hasValidator(Validators.required);
  }

  /**
   * FormControl の不正判定
   * @returns boolean
   */
  invalid() {
    return (
      (this.formCtrl.touched || this.formCtrl.dirty) && this.formCtrl.invalid
    );
  }
}
