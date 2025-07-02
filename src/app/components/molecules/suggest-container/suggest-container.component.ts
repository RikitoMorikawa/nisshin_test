import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

/**
 * タグ名/値の入力フォームコンポーネント
 */
@Component({
  selector: 'app-suggest-container',
  templateUrl: './suggest-container.component.html',
  styleUrls: ['./suggest-container.component.scss'],
})
export class SuggestContainerComponent implements OnInit {
  // フォーム周りの変数
  @Input() formCtrl!: FormControl;

  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();

  // サジェスト周りの変数
  private _inputSuggests: any[] = [];

  nameSuggests: string[] = [];
  valueSuggests: string[] = [];
  @Input() set suggestDatas(arg: any[]) {
    console.log(arg);
    this._inputSuggests = arg;
    this.nameSuggests = this.generateNameSuggests();
  }

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    //// 値の入力をサブスクライブ
    this.formCtrl.valueChanges.subscribe((value: string) => {
      const text = this.formCtrl.value ?? '';
      if (text && value) {
        this.formCtrl.patchValue(this.findValue(text));
      }
    });
  }

  /**
   * タグ名用のサジェストを生成する。
   */
  private generateNameSuggests() {
    return [...new Set(this._inputSuggests.map((x) => x.text))];
  }

  /**
   * タグ名と値からIDを検索し返却する。
   * @param name 検索対象のタグ名。
   * @param value 検索対象の値。
   * @returns 最初に一致した要素のID。存在しない場合は空文字を返却。
   */
  private findValue(text: string) {
    const id = this._inputSuggests.find((x) => x.text === text)?.value ?? '';
    return id;
  }
}
