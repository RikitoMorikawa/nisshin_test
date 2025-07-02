import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomTag } from 'src/app/models/custom-tag';
import { CustomTagForm } from '../custom-tag-form.component';

/**
 * タグ名/値の入力フォームコンポーネント
 */
@Component({
  selector: 'app-input-pair',
  templateUrl: './input-pair.component.html',
  styleUrls: ['./input-pair.component.scss'],
})
export class InputPairComponent implements OnInit {
  // フォーム周りの変数
  @Input() formGroup!: CustomTagForm;
  get ctrls() {
    return this.formGroup.controls;
  }
  @Input() index!: number;
  @Output() add = new EventEmitter();
  @Output() remove = new EventEmitter<number>();

  // サジェスト周りの変数
  private _customTags: CustomTag[] = [];
  nameSuggests: string[] = [];
  valueSuggests: string[] = [];
  @Input() set customTags(arg: CustomTag[]) {
    this._customTags = arg;
    this.nameSuggests = this.generateNameSuggests();
  }

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // タグ名の入力をサブスクライブ
    this.ctrls.name.valueChanges.subscribe((name) => {
      this.valueSuggests = this.generateValueSuggests(name ?? '');
    });

    // 値の入力をサブスクライブ
    this.ctrls.value.valueChanges.subscribe((value) => {
      const name = this.ctrls.name.value ?? '';
      if (name && value) {
        this.ctrls.custom_tag_id.patchValue(this.findCustomTagId(name, value));
      }
    });
  }

  /**
   * タグ名用のサジェストを生成する。
   */
  private generateNameSuggests() {
    return [...new Set(this._customTags.map((x) => x.name))];
  }

  /**
   * タグ名に紐づく値のサジェストを作成する。
   * @param name 検索対象のタグ名。
   */
  private generateValueSuggests(name: string) {
    return [
      ...new Set(
        this._customTags.filter((x) => x.name === name).map((x) => x.value)
      ),
    ];
  }

  /**
   * タグ名と値からIDを検索し返却する。
   * @param name 検索対象のタグ名。
   * @param value 検索対象の値。
   * @returns 最初に一致した要素のID。存在しない場合は空文字を返却。
   */
  private findCustomTagId(name: string, value: string) {
    const id =
      this._customTags.find((x) => x.name === name && x.value === value)?.id ??
      '';
    return id + '';
  }
}
