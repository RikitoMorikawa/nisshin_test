import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { catchError, forkJoin, of, map, finalize, Subscription } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { modalConst } from 'src/app/const/modal.const';
import { PaymentApiResponse } from 'src/app/models/payment';
import { PaymentService } from 'src/app/services/payment.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { Supplier } from 'src/app/models/supplier';
import { flattingFormValue } from 'src/app/functions/shared-functions';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  // 各種パラメータ
  @Output() event = new EventEmitter();

  // エラーモーダルのタイトル
  errorLoadTitle = '支払データ一覧画面エラー：' + modalConst.TITLE.HAS_ERROR;

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // フォーム関連
  searchForm = this.fb.group({
    id: '',
    supplier_id: '',
    payment_due_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  get ctrls() {
    return this.searchForm.controls;
  }

  // 仕入先
  suppliers!: Supplier[];

  // 仕入先選択肢
  supplierSuggests!: SelectOption[];

  // 仕入先ID
  supplierId!: number;

  // オブザーバーを格納する
  private subscription = new Subscription();

  // 各種定数（テンプレートからの参照用）
  errorConst = errorConst;
  regExConst = regExConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private supplierService: SupplierService,
    private errorService: ErrorService,
    private paymentService: PaymentService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 検索条件初期化実行
    this.searchForm = this.setSearchClear();
    // 選択肢初期化実行
    this.initOptions();
  }

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
   * 「絞り込みクリア」ボタンクリック時の処理
   */
  onClickReset() {
    this.searchForm.reset();
    this.searchForm = this.setSearchClear();
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    // フォームの値をフラットにする
    const flatted = flattingFormValue(
      this.removeNullsAndBlanks(this.searchForm.value)
    );
    // 絞り込みイベントを親コンポーネントへ送信
    this.event.emit(flatted);
  }

  /**
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
  }

  /**
   * 選択肢項目の生成
   */
  private initOptions() {
    // サジェスト用サプライヤー、ステータス選択肢取得
    this.subscription.add(
      forkJoin([this.supplierService.getAsSelectOptions()])
        .pipe(
          //finalize(() => (this.isDuringAcquisition = false)),
          catchError((error) => {
            error.emit(error);
            return of(error.error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, this.errorLoadTitle, res.message);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorLoadTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          // レスポンスの配列の要素が3つあるか
          if (res.length !== 1) {
            this.handleError(
              400,
              this.errorLoadTitle,
              modalConst.BODY.HAS_ERROR
            );
            return;
          }
          this.supplierSuggests = res[0];
        })
    );
  }

  /**
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param title
   * @param message
   */
  handleError(status: number, title: string, message: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
    });
  }

  /**
   * 検索条件初期化
   */
  setSearchClear() {
    return this.fb.group({
      id: '',
      supplier_id: '',
      payment_due_date: this.fb.group(
        { from: '', to: '' },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
    });
  }
}
