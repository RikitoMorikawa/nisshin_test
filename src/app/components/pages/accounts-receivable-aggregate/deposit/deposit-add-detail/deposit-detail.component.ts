import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { DepositDetailApiResponse } from 'src/app/models/deposit-detail';

/**
 * フォームのインターフェイス
 */
export interface DepositAddDetailForm extends FormGroup {
  controls: {
    id: FormControl;
    deposit_client_id: FormControl;
    deposit_client_name: FormControl;
    deposit_id: FormControl;
    deposit_detail_division_code: FormControl;
    deposit_amount: FormControl;
    deposit_date: FormControl;
    remarks_1: FormControl;
  };
}

export type DepositAddDetail = {
  id: FormControl;
  deposit_id: FormControl;
  deposit_client_id: FormControl;
  deposit_client_name: FormControl;
  deposit_detail_division_code: FormControl;
  deposit_amount: FormControl;
  deposit_date: FormControl;
  remarks_1: FormControl;
};

/**
 * カスタムタグ入力フォームのコンポーネント
 */
@Component({
  selector: 'app-deposit-add-detail',
  templateUrl: './deposit-detail.component.html',
  styleUrls: ['./deposit-detail.component.scss'],
})
export class DepositAddDetailComponent implements OnInit {
  @Input() itemsId?: number;
  @Input() formArray!: FormArray<DepositAddDetailForm>;
  @Input() delArray!: FormArray<DepositAddDetailForm>;
  @Output() err = new EventEmitter<HttpErrorResponse>();

  depositDetail: DepositAddDetail[] = [];

  private template = {
    id: '',
    deposit_id: '',
    deposit_client_id: '',
    deposit_client_name: '',
    deposit_detail_division_code: '',
    deposit_amount: '',
    deposit_date: '',
    remarks_1: '',
  } as const;

  /**
   * コンストラクタ
   */
  constructor(private fb: FormBuilder) {}

  /**
   * コンポーネントの初期化処理。
   */
  ngOnInit(): void {
    this.delArray.removeAt(0);
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
    this.delArray.push(this.formArray.at(index));
    this.formArray.removeAt(index);
  }

  /**
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`DepositDetailApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (error: HttpErrorResponse) => {
      this.err.emit(error);
      return of({} as DepositDetailApiResponse);
    };
  }
}
