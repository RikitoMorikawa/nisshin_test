import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @Input() formCtrl!: FormGroup;
  @Output() submitEvent = new EventEmitter<object>();

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  /**
   * パネル開閉ボタンクリック時の処理
   */
  searchButtonOnClick() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  /**
   * 「絞り込みクリア」ボタンクリック時の処理。
   */
  onClickReset(form: FormGroup = this.formCtrl) {
    // 空文字で初期化
    Object.values(form.controls).forEach((ctrl) => {
      if (ctrl instanceof FormGroup) {
        this.onClickReset(ctrl); // 入れ子になっている場合は再帰呼び出し
      } else {
        ctrl.patchValue('');
      }
    });
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    this.submitEvent.emit({ ...this.formCtrl.value });
  }
}
