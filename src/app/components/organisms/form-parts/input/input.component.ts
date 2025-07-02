import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import Fuse from 'fuse.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, OnDestroy {
  // 入力フォーム周りの変数
  @Input() formCtrl!: FormControl;
  @Input() type: 'text' | 'number' | 'password' | 'email' | 'date' = 'text';
  @Input() useClear = false;
  @Input() alignRight = false;
  @Input() invalidOverride = false;
  required = false;
  timestamp = ''; // IDの代わりに使用

  // サジェスト機能周りの変数
  @Input() suggests: string[] = [];
  results?: string[];
  isHover = false;
  private readonly SUGGESTION_MAX_LENGTH = 10;
  private subscription?: Subscription;

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.required = this.formCtrl.hasValidator(Validators.required);
    this.timestamp = Date.now() + '' + Math.floor(Math.random() * 1000);
  }

  /**
   * コンポーネントの終了処理。
   */
  ngOnDestroy(): void {
    this.destroySuggests();
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

  /**
   * 入力フォームがフォーカスされた際の処理。
   */
  onFocus() {
    // サジェストを使用しないなら何もしない
    if (!this.suggests.length) {
      return;
    }

    // 未入力の状態なら先頭10件を候補として表示
    this.results = this.suggests.slice(0, this.SUGGESTION_MAX_LENGTH);

    // 入力に応じて候補を検索して表示
    const fuse = new Fuse(this.suggests, { shouldSort: true });
    this.subscription = this.formCtrl.valueChanges.subscribe((x) => {
      this.results = fuse
        .search(x)
        .slice(0, this.SUGGESTION_MAX_LENGTH)
        .map((x) => x.item);
    });
  }

  /**
   * 入力フォームからフォーカスが外れた際の処理。
   */
  onBlur() {
    // サジェスト部にカーソルがあっている場合は何もしない
    if (this.isHover) {
      return;
    }
    this.destroySuggests();
  }

  /**
   * サジェストの候補が選択された際の処理。
   * @param suggest 選択されたサジェストの候補。
   */
  onClick(suggest: string) {
    this.formCtrl.patchValue(suggest);
    this.destroySuggests();
  }

  /**
   * サジェスト関連の諸々の終了処理。
   */
  private destroySuggests() {
    this.subscription?.unsubscribe();
    this.results = undefined;
    this.isHover = false;
  }
}
