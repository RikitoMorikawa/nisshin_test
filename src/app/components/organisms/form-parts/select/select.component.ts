import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/components/atoms/select/select.component';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit {
  // 入力フォーム周りの変数
  @Input() formCtrl!: FormControl;
  @Input() options: SelectOption[] = [];
  @Input() useClear = false;
  required = false;
  timestamp = ''; // IDの代わりに使用

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.required =
      this.formCtrl.hasValidator(Validators.required) ||
      this.formCtrl.hasValidator(Validators.requiredTrue);
    this.timestamp = Date.now() + '' + Math.floor(Math.random() * 100);
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

  /**
   * クリアアイコン押下時の処理
   */
  clear() {
    this.formCtrl.reset();
    this.formCtrl.patchValue('');
  }
}
