import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
})
export class TextareaComponent implements OnInit {
  // 入力フォーム周りの変数
  @Input() formCtrl!: FormControl;
  @Input() rows = 5;
  required = false;
  timestamp = ''; // IDの代わりに使用

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.required = this.formCtrl.hasValidator(Validators.required);
    this.timestamp = Date.now() + '' + Math.floor(Math.random() * 1000);
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
