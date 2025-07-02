import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import {
  Observable,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  forkJoin,
} from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { modalConst } from 'src/app/const/modal.const';
import { Client } from 'src/app/models/client';
import { flattingFormValue } from 'src/app/functions/shared-functions';
import { ClientService } from 'src/app/services/client.service';
import { DivisionService } from 'src/app/services/division.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-billlist-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private divisionService: DivisionService,
    private errorService: ErrorService
  ) {}

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 購読を管理
  private subscription = new Subscription();

  // エラーモーダルのタイトル
  errorLoadTitle = '請求一覧画面エラー：' + modalConst.TITLE.HAS_ERROR;

  // エラー文言
  errorConst = errorConst;
  regExConst = regExConst;

  // ローディング中フラグ
  isDuringAcquisition = false;

  // 絞り込みパネル開閉フラグ
  hasSearchPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // 絞り込まれた得意先を入れる
  filteredOptions: SelectOption[] = [];

  // ステータス選択肢
  statusDivisionOptions!: SelectOption[];

  // 選択肢取得中ローディング
  isSearchLoading = false;

  // 得意先
  clients!: Client[];

  // 得意先選択肢
  clientSuggests!: SelectOption[];

  // 得意先ID
  clientId!: number;

  // フォーム関連
  searchForm = this.fb.group({
    id: '',
    client_id: '',
    billing_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
    payment_exp_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });
  get ctrls() {
    return this.searchForm.controls;
  }

  /**
   * 初期化
   */
  ngOnInit(): void {
    // 検索条件肢初期化実行
    this.searchForm = this.setSearchClear();
    // 選択肢初期化実行
    this.initialization();
  }

  /**
   * 選択肢初期化
   */
  private initialization() {
    this.subscription.add(
      forkJoin([this.clientService.getAsSelectOptions()])
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
          this.clientSuggests = res[0];
        })
    );
  }

  /**
   * フォームの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  /**
   * 絞り込みパネル開閉ボタンクリック時の処理
   * @returns void
   */
  handleClickSearchPaneToggleButton() {
    if (this.hasSearchPanelOpened) {
      this.hasSearchPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
      Object.values(this.ctrls).forEach((x) => x.patchValue(''));
    } else {
      this.hasSearchPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 入力内容クリアボタンクリック時の処理
   */
  handleClickSearchClearButton() {
    this.searchForm.reset();
    this.searchForm = this.setSearchClear();
  }

  /**
   * 絞り込み実行ボタンクリック時の処理
   */
  handleClickSearchSubmitButton() {
    // 親コンポーネントへ送信
    const flatted = flattingFormValue(
      this.removeNullsAndBlanks(this.searchForm.value)
    );
    this.searchEvent.emit(flatted);
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
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
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
   * 破棄
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 検索条件初期化
   */
  setSearchClear() {
    return this.fb.group({
      id: '',
      client_id: '',
      billing_date: this.fb.group(
        { from: '', to: '' },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
      payment_exp_date: this.fb.group(
        { from: '', to: '' },
        { validators: [CustomValidators.beforeFromDate()] }
      ),
    });
  }
}
