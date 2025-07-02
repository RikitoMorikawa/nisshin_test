import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { CustomTag, CustomTagApiResponse } from 'src/app/models/custom-tag';
import { CustomTagService } from 'src/app/services/custom-tag.service';

/**
 * フォームのインターフェイス
 */
export interface CustomTagForm extends FormGroup {
  controls: {
    custom_tag_id: FormControl;
    name: FormControl;
    value: FormControl;
  };
}

/**
 * カスタムタグ入力フォームのコンポーネント
 */
@Component({
  selector: 'app-custom-tag-form',
  templateUrl: './custom-tag-form.component.html',
  styleUrls: ['./custom-tag-form.component.scss'],
})
export class CustomTagFormComponent implements OnInit {
  @Input() formArray!: FormArray<CustomTagForm>;
  @Output() err = new EventEmitter<HttpErrorResponse>();
  customTags: CustomTag[] = [];
  private template = {
    custom_tag_id: '',
    name: '',
    value: '',
  } as const;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private customTagService: CustomTagService
  ) {}

  /**
   * コンポーネントの初期化処理。
   */
  ngOnInit(): void {
    this.customTagService
      .getAll()
      .pipe(catchError(this.handleError()))
      .subscribe((x) => (this.customTags = x.data));
  }

  /**
   * フォーム配列を追加
   */
  addTagForm() {
    this.formArray.push(this.fb.group(this.template));
  }

  /**
   * フォーム配列からフォームを削除
   * @param index 削除するフォームのインデックス
   */
  removeTagForm(index: number) {
    this.formArray.removeAt(index);
  }

  /**
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`CustomTagApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (error: HttpErrorResponse) => {
      this.err.emit(error);
      return of({} as CustomTagApiResponse);
    };
  }
}
