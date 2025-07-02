import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  COMPOSITION_BUFFER_MODE,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import Fuse from 'fuse.js';
import { Subscription } from 'rxjs';
import { LabelSize } from 'src/app/components/atoms/label/label.component';
import { SelectOption } from 'src/app/components/atoms/select/select.component';

@Component({
  selector: 'app-select-suggest',
  templateUrl: './select-suggest.component.html',
  styleUrls: ['./select-suggest.component.scss'],
  providers: [{ provide: COMPOSITION_BUFFER_MODE, useValue: false }],
})

/**
 * フォームに値がセットされた後にサジェストの選択肢を渡すことで初期値設定が可能
 */
export class SelectSuggestComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param fb
   */
  constructor(private fb: FormBuilder) {}

  // 各種パラメータ
  @Input() nameAttrValue!: string;
  @Input() idAttrValue!: string;
  @Input() formCtrl!: FormControl;
  @Input() labelSize?: LabelSize = 'base';

  // サジェスト機能周りの変数
  selectOptions!: SelectOption[];
  @Input() set suggests(options: SelectOption[]) {
    if (this.formCtrl.value && options) {
      const formVal: string = this.formCtrl.value;
      const selectedOption = options.filter((x) => String(x.value) === formVal);
      this.selectedValue = selectedOption[0];
    }
    this.selectOptions = options;
  }
  required = false;
  results?: any;
  isHover = false;
  isOpen = false;
  selectedValue?: { value: string | number; text: string };
  suggestInputId = this.idAttrValue + '-suggest';
  private readonly SUGGESTION_MAX_LENGTH = 5;
  private subscription = new Subscription();

  // サジェスト入力用フォーム
  suggestForm = this.fb.group({
    suggest: '',
  });

  /**
   * サジェストコントロールのゲッター
   */
  get suggestCtrl() {
    return this.suggestForm.controls.suggest;
  }

  /**
   * Angular ライフサイクルフック
   */
  ngOnInit(): void {
    this.required =
      this.formCtrl.hasValidator(Validators.required) ||
      this.formCtrl.hasValidator(Validators.requiredTrue);

    // 初期状態で値がある場合
    if (this.formCtrl.value) {
      this.formCtrl.markAsDirty();
    }

    // 値の変更を購読
    this.subscription.add(
      this.formCtrl.valueChanges.subscribe((res) => {
        // 値が削除された場合
        if (res === '' || res === undefined || res === null) {
          // 選択中の値を削除
          this.selectedValue = undefined;
          // サジェスト用コントロールの値を空にする
          this.suggestCtrl.patchValue('');
        } else {
          this.formCtrl.markAsDirty();
        }
      })
    );
  }

  /**
   * Angular ライフサイクルフック
   * 購読があれば解除
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * サジェストパネルオープン処理とinput要素へフォーカス
   */
  openSuggestPanel() {
    // 既に選択肢が表示されている場合は何もしない
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    // input要素を取得するため遅延処理を挟む
    setTimeout(() => {
      const suggestEl = document.querySelector<HTMLInputElement>(
        `input[name="${this.nameAttrValue}"]`
      );
      if (suggestEl) {
        suggestEl.focus();
      }
    }, 0);
  }

  /**
   * 入力フォームがフォーカスされた際の処理。
   */
  onFocus() {
    // 候補から選択された値があるか確認
    if (this.selectedValue) {
      // 選択肢を限定
      this.results = [this.selectedValue];
    } else {
      // 未入力の状態なら先頭5件を候補として表示
      this.results = this.selectOptions.slice(0, this.SUGGESTION_MAX_LENGTH);
    }
    // 入力に応じて候補を検索して表示
    const fuseOptions = {
      shouldSort: true,
      keys: ['text'],
    };
    const fuse = new Fuse(this.selectOptions, fuseOptions);
    this.subscription.add(
      this.suggestForm.controls.suggest.valueChanges.subscribe((x) => {
        if (x !== null) {
          this.results = fuse.search(x).map((x) => x.item);
        }
      })
    );
  }

  /**
   * 入力フォームからフォーカスが外れた際の処理。
   */
  onBlur() {
    // サジェスト部にカーソルがあっている場合は何もしない
    if (this.isHover) {
      return;
    }
    this.formCtrl.markAsTouched({ onlySelf: true });
    this.isOpen = false;
  }

  /**
   * マウスオーバーフラグオン
   */
  onMouseover() {
    this.isHover = true;
  }
  /**
   * マウスオーバーフラグオフ
   */
  onMouseout() {
    this.isHover = false;
  }

  /**
   * サジェストの候補が選択された際の処理。
   * @param suggest 選択されたサジェストの候補。
   */
  onClick(suggest: { value: string; text: string }) {
    this.selectedValue = suggest;
    this.suggestCtrl.patchValue(suggest.text);
    this.formCtrl.patchValue(suggest.value);
    this.destroySuggests();
  }

  /**
   * 選択値削除ボタンがクリックされた時の処理
   */
  deleteValue() {
    this.selectedValue = undefined;
    this.suggestCtrl.patchValue('');
    this.formCtrl.patchValue('');
    this.destroySuggests();
  }

  /**
   * サジェスト関連の諸々の終了処理。
   */
  private destroySuggests() {
    this.results = undefined;
    this.isHover = false;
    this.isOpen = false;
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
