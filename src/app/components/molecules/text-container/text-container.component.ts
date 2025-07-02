import { Component, OnDestroy, Input } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, FormControl } from '@angular/forms';
import Fuse from 'fuse.js';
import { Subscription } from 'rxjs';
import { LabelSize } from '../../atoms/label/label.component';

@Component({
  selector: 'app-text-container',
  templateUrl: './text-container.component.html',
  styleUrls: ['./text-container.component.scss'],
  providers: [{ provide: COMPOSITION_BUFFER_MODE, useValue: false }],
})
export class TextContainerComponent implements OnDestroy {
  // 各種パラメータ
  @Input() inputType?: string = 'text';
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() maxLength?: number;
  @Input() formCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() textRight = false;
  @Input() labelSize?: LabelSize = 'base';

  // サジェスト機能周りの変数
  @Input() suggests: string[] = [];
  results?: string[];
  isHover = false;
  private readonly SUGGESTION_MAX_LENGTH = 10;
  private subscription?: Subscription;

  /**
   * コンポーネントの終了処理。
   */
  ngOnDestroy(): void {
    this.destroySuggests();
  }

  /**
   * 入力フォームがフォーカスされた際の処理。
   */
  onFocus() {
    console.log(this.maxLength);
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
