import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { RentalProduct } from 'src/app/models/rental-product';
import { DivisionService } from 'src/app/services/division.service';
import { RentalProductService } from 'src/app/services/rental-product.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private rentalProductService: RentalProductService,
    private divisionService: DivisionService
  ) {}

  // 購読を一元管理する Subscription
  private subscription = new Subscription();

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // レンタル商品サジェスト
  rpSuggests!: SelectOption[];

  // ステータス選択肢
  statusOptions!: SelectOption[];

  // 公開区分選択肢
  publishDivisionOptions!: SelectOption[];

  // バリデーション用
  errorConst = errorConst;

  // フォームグループ
  form = this.fb.group({
    id: '',
    status_division_id: '',
    name: '',
    barcode: '',
    data_permission_division_id: '',
  });

  get fc() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // 選択肢初期化書実行
    this.initialization();
  }

  private initialization() {
    this.subscription.add(
      forkJoin([
        this.rentalProductService.getAll(),
        this.divisionService.getAsSelectOptions(),
      ])
        .pipe(
          catchError((error) => {
            error.emit(error);
            return of(error.error);
          })
        )
        .subscribe((res) => {
          console.log(res);
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.message);
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(400, modalConst.BODY.HAS_ERROR);
            return;
          }
          // レスポンスの配列の要素が2つあるか
          if (res.length !== 2) {
            this.handleError(400, modalConst.BODY.HAS_ERROR);
            return;
          }
          this.rpSuggests = res[0].data.map((x: RentalProduct) => {
            return { value: x.id, text: x.name };
          });
          // ステータス選択肢取得
          const statusDivisionsRes: Record<string, SelectOption[]> = res[1];
          const statusDivisionOptions =
            statusDivisionsRes[divisionConst.RENTAL_PRODUCT_STATUS];
          // ステータス選択肢に初期値を追加
          const defaultOption: SelectOption[] = [
            {
              value: '',
              text: generalConst.PLEASE_SELECT,
            },
          ];
          this.statusOptions = defaultOption.concat(statusDivisionOptions);
          // 公開区分選択肢取得・設定（データ公開区分を設定）
          const publishDivisionOptions =
            statusDivisionsRes[divisionConst.DATA_PERMISSION];
          this.publishDivisionOptions = [
            ...defaultOption,
            ...publishDivisionOptions,
          ];
        })
    );
  }

  /**
   * フォームの入力値をチェック
   * @param ctrl
   * @returns
   */
  invalid(ctrl: FormControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 絞り込みパネル開閉処理
   */
  panelOpenButtonOnClick() {
    if (this.hasPanelOpened) {
      this.hasPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
    } else {
      this.hasPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 絞り込みクリアボタンのクリックイベントに対応
   * @returns void
   */
  handleClickClearButton() {
    // 各コントロールの値を空文字に設定
    Object.values(this.fc).forEach((x) => {
      // 日付のfrom、toに対応するためにFormGroupの時は更にループ処理を実行
      if (x instanceof FormGroup) {
        Object.values(x.controls).forEach((child) => {
          child.patchValue('');
        });
      } else {
        x.patchValue('');
      }
    });
  }

  /**
   * 絞り込み実行ボタンのクリックイベント対応
   * @returns void
   */
  handleClickSubmitButton() {
    const searchValue = this.form.value;
    const flatted = flattingFormValue(searchValue);
    this.searchEvent.emit(removeNullsAndBlanks(flatted));
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: 'レンタル商品一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }
}
