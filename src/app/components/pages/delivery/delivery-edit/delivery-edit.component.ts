import { Component, OnDestroy, OnInit } from '@angular/core';
import { Delivery } from 'src/app/models/delivery';
import { DeliveryService } from 'src/app/services/delivery.service';
import { catchError, filter, finalize, forkJoin, of, Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { ErrorService } from 'src/app/services/shared/error.service';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ApiResponseIsInvalid,
  isParameterInvalid,
} from 'src/app/functions/shared-functions';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { regExConst } from 'src/app/const/regex.const';
import {
  FlashMessageService,
  FlashMessagePurpose,
} from 'src/app/services/flash-message.service';
import { deliveryConst } from 'src/app/const/delivery.const';
import { Division } from 'src/app/models/division';
import { divisionConst } from 'src/app/const/division.const';
import { DivisionService } from 'src/app/services/division.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-delivery-edit',
  templateUrl: './delivery-edit.component.html',
  styleUrls: ['./delivery-edit.component.scss'],
})
export class DeliveryEditComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param deliveryService
   * @param fb
   * @param errorService
   * @param modalService
   * @param router
   * @param route
   * @param divisionService
   * @param flashMessageService
   */
  constructor(
    private deliveryService: DeliveryService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private divisionService: DivisionService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  // 購読を一元管理するための変数
  subscription = new Subscription();

  // 選択中店舗ID
  selectedId!: number;

  // 必須以外の値に変化がない場合submitさせないフラグ
  formInvalid = true;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '配送編集キャンセル：' + modalConst.TITLE.CANCEL;

  // パスパラメータ取得エラー時のモーダルのタイトル
  getPathErrorModalTitle =
    'パラメータ取得エラー：' + modalConst.TITLE.HAS_ERROR;

  // 一覧画面へのパス
  listPagePath = '/delivery';

  // 詳細画面へのパス
  detailPagePath!: string;

  // 配送用定数
  deliveryConst = deliveryConst;

  errorConst = errorConst;

  // 配送タイプ選択肢
  deliveryTypeOptions!: SelectOption[];

  // 売上タイプ名
  salesTypeName!: string;

  // APIから取得した更新前の基本情報を保持
  beforeUpdateDelivery!: Delivery;

  // 最終更新者
  lastUpdater?: string;

  // 時間選択肢
  hourOptions!: SelectOption[];

  // 分選択肢
  minuteOptions!: SelectOption[];

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    delivery_type_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    shipping_address: ['', [Validators.maxLength(255)]],
    additional_tel: [
      '',
      [Validators.maxLength(14), Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    delivery_specified_time: [
      '',
      [Validators.required, Validators.maxLength(255)],
    ],
    delivery_hour: ['', [Validators.required, Validators.maxLength(2)]],
    delivery_minute: ['', [Validators.required, Validators.maxLength(2)]],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
  });

  get fc() {
    return this.form.controls;
  }

  // 時間の選択肢作成
  generateHourOptions(): SelectOption[] {
    let hours: SelectOption[] = [{ value: '', text: '選択してください' }];
    for (let i = 5; i <= 22; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      hours.push({ value: hour, text: hour });
    }
    return hours;
  }

  // 分の選択肢作成
  generateMinuteOptions(): SelectOption[] {
    let minutes: SelectOption[] = [{ value: '', text: '選択してください' }];
    for (let i = 0; i < 60; i += 5) {
      const minute = i < 10 ? `0${i}` : `${i}`;
      minutes.push({ value: minute, text: minute });
    }
    return minutes;
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントの初期化時に1度だけ実行される
   */
  ngOnInit(): void {
    // パスパラメータ取得エラーモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.getPathErrorModalTitle
          ) // パスパラメータ取得エラーモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.params['id'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);

    // エラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // IDを保持
    this.selectedId = Number(selectedId);
    // 詳細のパスを生成
    this.detailPagePath = this.listPagePath + '/detail/' + this.selectedId;

    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // キャンセルモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 詳細画面へ移動する
            this.router.navigateByUrl(this.detailPagePath);
          }
        })
    );

    // 時・分の選択肢をセット
    this.hourOptions = this.generateHourOptions();
    this.minuteOptions = this.generateMinuteOptions();

    this.subscription.add(
      // フォームの変更を購読
      this.form.valueChanges.subscribe((res) => {
        this.checkFormDefaultValueChanged(res);
      })
    );

    this.initialization(this.selectedId);
  }

  /**
   * 文字列をDateへ変換してフォーマットを整形
   * 時間以下を削除
   * @param date
   * @returns Date
   */
  dateFormatter(date: string | undefined) {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  /**
   * 文字列をDateへ変換してフォーマットを整形
   * 時間まで表示
   * @param date
   * @returns Date
   */
  dateTimeFormatter(date: string | undefined) {
    return date ? new Date(date).toLocaleString() : '';
  }

  /**
   * フォームに表示する全てのデータを取得
   * @param deliveryId
   */
  initialization(deliveryId: number) {
    this.common.loading = true;
    this.subscription.add(
      forkJoin([
        this.deliveryService.find(deliveryId),
        this.divisionService.getAll(),
      ])
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          const deliveryResInvalid = ApiResponseIsInvalid(res[0]);
          if (deliveryResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          this.lastUpdater =
            res[0].data[0].employee_updated_last_name +
            ' ' +
            res[0].data[0].employee_updated_first_name;

          // 初期値を取得
          this.beforeUpdateDelivery = res[0].data[0];

          // 売上タイプ名取得
          this.salesTypeName = this.getSalesTypeName(
            res[0].data[0].sales_type_id
          );

          // 配送区分取得
          this.deliveryTypeOptions = this.getDeliveryTypeOptions(res[1].data);

          const defaultValue = this.getDefaultValue();
          defaultValue.delivery_specified_time = new Date(
            defaultValue.delivery_specified_time
          ).toISOString();

          this.form.reset(defaultValue);
        })
    );
  }

  /**
   * 売上タイプidから売上タイプ名を取得する
   * @param salesTypeId
   * @returns
   */
  getSalesTypeName(salesTypeId: number) {
    // 売上タイプを特定する
    const selectedSalesType = deliveryConst.SALES_TYPE.find((x) => {
      return x.id === salesTypeId;
    });
    return selectedSalesType?.name ? selectedSalesType.name : '';
  }

  /**
   * 配送区分選択肢を取得
   * @param divisions
   * @returns
   */
  getDeliveryTypeOptions(divisions: Division[]) {
    const deliveryTypeDivisions = divisions.filter((x) => {
      return x.name === divisionConst.DELIVERY;
    });
    const deliveryTypeOptions = deliveryTypeDivisions.map((x) => {
      return { value: x.id, text: x.value };
    });
    const defaultValue = [{ value: '', text: '選択してください' }];
    return [...defaultValue, ...deliveryTypeOptions];
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

  /**
   * 日時を分解して年月日時分のオブジェクトを返す
   * @param targetDate
   * @returns dateTimeObj = { year: year, month: month, day: day, hour: hour, minutes: minutes, }
   */
  splitDateAndTime(targetDate: string) {
    // 日付を文字列に変換し年月日のフォーマットへ変換
    const date = this.dateFormatter(targetDate);

    // 日付の部分をパース
    const dateParts = date.split('/');
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1; // JavaScriptのDateは月を0-11で表現するため、実際の月-1を行う
    const day = Number(dateParts[2]);

    // 日付文字列をDateオブジェクトに変換
    const dateObj = new Date(targetDate);

    // 時間と分を取得
    const hour = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    const dateTimeObj = {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minutes: minutes,
    };

    return dateTimeObj;
  }

  /**
   * 日時を分解して年月日のオブジェクトを返す
   * @param targetDate
   * @returns dateObj = { year: year, month: month, day: day, }
   */
  splitDate(targetDate: string) {
    // 日付を文字列に変換し年月日のフォーマットへ変換
    const date = this.dateFormatter(targetDate);

    // 日付の部分をパース
    const dateParts = date.split('/');
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1; // JavaScriptのDateは月を0-11で表現するため、実際の月-1を行う
    const day = Number(dateParts[2]);

    const dateTimeObj = {
      year: year,
      month: month,
      day: day,
    };

    return dateTimeObj;
  }

  /**
   * フォームの初期値を生成
   * @returns
   */
  getDefaultValue() {
    // 日付を文字列に変換し年月日のフォーマットへ変換
    const dateTimeObj = this.splitDateAndTime(
      String(this.beforeUpdateDelivery.delivery_specified_time)
    );
    const defaultValue = {
      delivery_type_division_id: String(
        this.beforeUpdateDelivery.delivery_type_division_id
      ),
      shipping_address: this.beforeUpdateDelivery.shipping_address,
      sales_id: this.beforeUpdateDelivery.sales_id,
      additional_tel: this.beforeUpdateDelivery.additional_tel,
      tel: this.beforeUpdateDelivery.tel,
      delivery_specified_time: new Date(
        String(this.beforeUpdateDelivery.delivery_specified_time)
      ).toLocaleDateString(),
      delivery_hour: String(dateTimeObj.hour),
      delivery_minute: String(dateTimeObj.minutes),
      remarks_1: this.beforeUpdateDelivery.remarks_1,
      remarks_2: this.beforeUpdateDelivery.remarks_2,
    };
    return defaultValue;
  }

  /**
   * オブジェクトをキーでソート
   * @param obj
   * @returns
   */
  sortObject(obj: any) {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key: string) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          result[key] = this.sortObject(obj[key]);
        } else {
          result[key] = obj[key];
        }
        return result;
      }, {});
  }

  /**
   * フォームの初期値と比較して変更がない場合 markAsPristine とする
   *
   * @param formValues フォームの値
   * @returns void
   */
  checkFormDefaultValueChanged(formVal: any): void {
    const defaultValue = this.getDefaultValue();

    formVal.delivery_specified_time = new Date(
      String(formVal.delivery_specified_time)
    ).toLocaleDateString();

    formVal['sales_id'] = defaultValue['sales_id'];
    formVal['tel'] = defaultValue['tel'];

    const sortedObj1 = this.sortObject(defaultValue);
    const sortedObj2 = this.sortObject(formVal);

    const before = JSON.stringify(sortedObj1);
    const after = JSON.stringify(sortedObj2);

    if (before === after) {
      this.form.markAsPristine();
    }

    // フォームの値と初期値が同じ場合サブミットさせない
    this.formInvalid = before === after;
  }

  /**
   * キャンセルボタンクリック時の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (!this.formInvalid || !this.form.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPagePath);
    }
  }

  /**
   * フォームの値を初期状態に戻す
   * @returns void
   */
  handleClickClearButton() {
    const defaultValue = this.getDefaultValue();
    defaultValue.delivery_specified_time = new Date(
      defaultValue.delivery_specified_time
    ).toISOString();
    this.form.reset(defaultValue);
    this.formInvalid = true;
  }

  /**
   * 配送更新処理
   * @returns void
   */
  handleClickSaveButton() {
    // 送信ボタンを非活性にする
    this.formInvalid = true;

    // ローディング開始
    this.common.loading = true;

    // フォームの値を取得
    const formVal = this.form.value;

    // 日付を文字列に変換し年月日のフォーマットへ変換
    const date = this.dateFormatter(String(formVal.delivery_specified_time));

    // 日付の部分をパース
    const dateParts = date.split('/');
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1; // JavaScriptのDateは月を0-11で表現するため、実際の月-1を行う
    const day = Number(dateParts[2]);

    // 時間と分を数値に変換
    const hourNumber = Number(formVal.delivery_hour);
    const minuteNumber = Number(formVal.delivery_minute);

    // Date オブジェクトを作成しPOSTできるようなフォーマットへ変換
    const deliverySpecifiedTime = new Date(
      year,
      month,
      day,
      hourNumber,
      minuteNumber
    ).toLocaleString();

    const delivery = {
      delivery_type_division_id: formVal.delivery_type_division_id
        ? formVal.delivery_type_division_id
        : this.deliveryTypeOptions[1].value,
      customer_type: this.beforeUpdateDelivery.customer_type,
      customer_id: this.beforeUpdateDelivery.id,
      name: this.beforeUpdateDelivery.name,
      sales_type_id: this.beforeUpdateDelivery.sales_type_id,
      sales_id: this.beforeUpdateDelivery.sales_id,
      shipping_address: formVal.shipping_address
        ? formVal.shipping_address
        : this.beforeUpdateDelivery.shipping_address,
      tel: this.beforeUpdateDelivery.tel,
      additional_tel: formVal.additional_tel,
      delivery_specified_time: deliverySpecifiedTime,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
    };

    // 更新処理を購読へ追加
    this.subscription.add(
      this.deliveryService
        .update(this.selectedId, delivery)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.detailPagePath);
        })
    );
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '配送編集エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントが破棄される時に実行
   */
  ngOnDestroy(): void {
    // 一元管理した購読を全て解除
    this.subscription.unsubscribe();
  }
}
