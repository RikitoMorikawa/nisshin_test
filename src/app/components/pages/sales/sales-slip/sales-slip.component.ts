import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  of,
  Subscription,
  take,
} from 'rxjs';
import { SalesSlip } from 'src/app/models/sales-slip';
import { SalesSlipService } from 'src/app/services/sales-slip.service';
import { SalesDetail } from 'src/app/models/sales-detail';
import { SalesDetailApiResponse } from 'src/app/models/sales-detail';
import { SalesDetailService } from 'src/app/services/sales-detail.service';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { errorConst } from 'src/app/const/error.const';
import { CommonService } from 'src/app/services/shared/common.service';

import {
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { ClientService } from 'src/app/services/client.service';
import { Client } from 'src/app/models/client';

/**
 * リスト表示項目（兼マッピング表）の型
 */
type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof SalesSlip;
};

/**
 * 売上伝票詳細コンポーネント
 */
@Component({
  selector: 'app-sales-slip',
  templateUrl: './sales-slip.component.html',
  styleUrls: ['./sales-slip.component.scss'],
})
export class SalesSlipComponent implements OnInit {
  // リスト要素で表示する項目の一覧とマッピング表
  listItems: ListItem[] = [
    { name: '売上日時(実時間)', prop_name: 'sale_date' },
    { name: '営業日時(レジ締め時間)', prop_name: 'business_date' },
    { name: '店舗番号', prop_name: 'store_cd' },
    { name: '端末番号', prop_name: 'terminal_cd' },
    { name: '伝票種別', prop_name: 'sales_slip_division_cd' },
    // { name: '入力担当者CD', prop_name: 'input_employee_cd' },
    { name: '入力担当者名', prop_name: 'input_employee_name' },
    { name: '人数', prop_name: 'number_of_people' },
    { name: '客層CD', prop_name: 'quality_customer_cd' },
    { name: '支払区分', prop_name: 'payment_division_cd' },
    { name: '合計数量', prop_name: 'total_quantity' },
    { name: '原価合計(税抜)', prop_name: 'total_cost' },
    { name: '値引き合計', prop_name: 'total_discount' },
    { name: '外税対象金額', prop_name: 'tax_excluded_target_amount' },
    { name: '外税対象税', prop_name: 'tax_excluded_target_tax' },
    { name: '内税対象金額', prop_name: 'tax_included_target_amount' },
    { name: '内税対象税', prop_name: 'tax_included_target_tax' },
    { name: '伝票金額', prop_name: 'slip_amount' },
    { name: '伝票金額(外税)', prop_name: 'slip_amount_tax_excluded' },
    { name: '現金【精算区分】', prop_name: 'cash' },
    { name: 'お釣り【精算区分】', prop_name: 'change' },
    { name: '雑収入【精算区分】', prop_name: 'miscellaneous_income' },
    { name: '商品券１【精算区分】', prop_name: 'gift_1' },
    { name: '商品券２【精算区分】', prop_name: 'gift_2' },
    { name: '商品券３【精算区分】', prop_name: 'gift_3' },
    { name: '商品券４【精算区分】', prop_name: 'gift_4' },
    { name: 'クレジット【精算区分】', prop_name: 'credit' },
    { name: '掛け【精算区分】', prop_name: 'accounts_receivable' },
    { name: '小数点端数', prop_name: 'decimal_point_fraction' },
    { name: '消費税端数', prop_name: 'tax_fraction' },
    { name: '消費税', prop_name: 'tax_division_cd' },
    { name: '消費税率', prop_name: 'tax_rate' },
    { name: '消費税計算', prop_name: 'tax_calculating_division_cd' },
    { name: '伝票返品制限用', prop_name: 'for_slip_return_limit' },
    { name: '会員id', prop_name: 'member_id' },
    { name: '会員コード', prop_name: 'member_cd' },
    { name: '会員名', prop_name: 'member_name' },
    { name: '得意先コード', prop_name: 'client_cd' },
    { name: '請求先コード', prop_name: 'billing_cd' },
    { name: '得意先名1', prop_name: 'client_name_1' },
    { name: '得意先名2', prop_name: 'client_name_2' },
    { name: 'レジ締回数', prop_name: 'register_closing_times' },
    { name: '売掛締日', prop_name: 'accounts_receivable_closing_date' },
    { name: '売掛年月', prop_name: 'accounts_receivable_year_month' },
    { name: '会員 前回ポイント', prop_name: 'last_point' },
    { name: '会員 今回発生ポイント', prop_name: 'current_grant_point' },
    { name: '会員 入力ポイント', prop_name: 'input_point' },
    { name: '会員 使用ポイント', prop_name: 'used_point' },
    { name: '会員 ポイント残高', prop_name: 'point_balance' },
    { name: '会員 ポイント対象金額', prop_name: 'point_target_amount' },
    { name: '会員 ポイント倍率', prop_name: 'point_magnification' },
    { name: '請求先現場コード', prop_name: 'billing_field_cd' },
    { name: '伝票作成日時', prop_name: 'slip_creation_time' },
    { name: '伝票更新日時', prop_name: 'slip_update_time' },
    { name: '基幹システム連携フラグ', prop_name: 'coordination_flag' },
    { name: '登録日時', prop_name: 'created_at' },
    // { name: '会員名(姓)', prop_name: 'member_last_name' },
    // { name: '会員名(名)', prop_name: 'member_first_name' },
  ];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private service: SalesSlipService,
    private modalService: ModalService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    private fb: FormBuilder,
    private clientService: ClientService,
    private salesDetailService: SalesDetailService
  ) {}

  private subscription = new Subscription();
  // isDuringAcquisition = false;

  // 各種パラムID取得
  sales_slip_cd = this.route.snapshot.params['code'];
  salesSlipId: number = this.route.snapshot.params['id'];
  // クライアント編集
  edit_client_form: boolean = false;

  // エラー文言
  errorConst = errorConst;
  // 選択中得意先
  selectedClient?: Client;

  // 得意先フォームグループ
  clientForm = this.fb.group({
    client_id: ['', [Validators.required]],
    name: [''],
    tel: [''],
  });

  get clientFc() {
    return this.clientForm.controls;
  }

  // detail データ
  sales_slip_data?: SalesSlip;

  sales_slip_detail_lists?: SalesDetail[];

  // 一覧のパス
  listPagePath = '/sales/detail';
  detailPagePath =
    this.listPagePath + '/' + this.sales_slip_cd + '/' + this.salesSlipId;

  // エラーモーダルのタイトル
  errorModalTitle = '売上伝票編集エラー：' + modalConst.TITLE.HAS_ERROR;

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.common.loading = true;

    // パスパラメータからidを取得
    this.subscription.add(
      forkJoin([
        this.service.getAll({ sales_slip_cd: this.sales_slip_cd }),
        this.salesDetailService.getAll({ sales_slip_cd: this.sales_slip_cd }),
      ])
        .pipe(finalize(() => (this.common.loading = false)))
        .subscribe((res) => {
          this.sales_slip_data = res[0].data[0];
          this.setListItemValue(res[0].data[0]);
          this.sales_slip_cd = res[0].data[0].sales_slip_cd;
          this.common.loading = false;
          this.sales_slip_detail_lists = res[1].data;
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
   * 得意先名サジェスト
   * @returns
   */
  getClientSuggests() {
    return {
      observable: this.clientService.getAll({
        name: this.clientFc.name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
  /**
   * 得意先サジェスト選択時に得意先オブジェクトをセット
   * @param client
   */
  handleSelectedClientData(client: Client) {
    this.selectedClient = client;
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `SalesSlip`オブジェクト。
   */
  private setListItemValue(data: SalesSlip) {
    // プロパティそのままのものを格納
    this.listItems
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (data[item.prop_name!] ?? '') + '';
      });

    // 値の修正
    this.listItems.forEach((item) => {
      // 値が未設定なら何もしない
      if (!item.value) {
        return;
      }

      // 金額系
      if (
        [
          '端末番号',
          '人数',
          '合計数量',
          '原価合計(税抜)',
          '値引き合計',
          '外税対象金額',
          '外税対象税',
          '内税対象金額',
          '内税対象税',
          '伝票金額',
          '伝票金額(外税)',
          '現金【精算区分】',
          'お釣り【精算区分】',
          '雑収入【精算区分】',
          '商品券１【精算区分】',
          '商品券２【精算区分】',
          '商品券３【精算区分】',
          '商品券４【精算区分】',
          'クレジット【精算区分】',
          '掛け【精算区分】',
          '会員 前回ポイント',
          '会員 今回発生ポイント',
          '会員 入力ポイント',
          '会員 使用ポイント',
          '会員 ポイント残高',
          '会員 ポイント対象金額',
          '会員 ポイント倍率',
        ].includes(item.name)
      ) {
        item.value = `${Number(item.value).toLocaleString()}`;
      }

      // 日時系
      if (['伝票作成日時', '伝票更新日時', '登録日時'].includes(item.name)) {
        item.value = new Date(item.value).toLocaleString();
      }

      if (item.name === '伝票種別') {
        item.value = Number(item.value) ? '返品' : '通常';
      }

      if (item.name === '支払区分') {
        item.value = Number(item.value) ? '現金' : '売掛';
      }

      if (item.name === '消費税') {
        const values = ['外税', '内税', '非課税'];
        item.value = values[Number(item.value)];
      }

      if (item.name === '消費税計算') {
        item.value = Number(item.value) ? '伝票単位' : '月単位';
      }

      if (item.name === '基幹システム連携フラグ') {
        const values = ['なし', 'レンタル', '修理', '客注'];
        item.value = values[Number(item.value)];
      }
    });
  }

  /**
   * 削除処理
   * @returns void
   */
  handleClickDelete(): void {
    // モーダルのタイトル
    const modalTitle = '売上伝票' + modalConst.TITLE.DELETE;
    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'danger';

    // 削除確認モーダル呼び出し
    this.modalService.setModal(
      modalTitle,
      modalConst.BODY.DELETE,
      modalPurposeDanger,
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          ) // 実行確認のモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除処理を購読
            this.service
              .remove(this.salesSlipId)
              .pipe(
                // エラー対応
                catchError((error: HttpErrorResponse) => {
                  // 空の値を返却
                  return of(error);
                }),
                finalize(() => {
                  // ローディング終了
                  this.common.loading = false;
                })
              )
              .subscribe((res) => {
                // ローディング終了
                this.common.loading = false;
                if (res instanceof HttpErrorResponse) {
                  const title = res.error ? res.error.title : 'エラー';
                  const message = res.error
                    ? res.error.message
                    : 'エラーが発生しました。';
                  this.handleError({
                    status: res.status,
                    title: title,
                    message: message,
                    redirectPath: '/sales',
                  });
                  return;
                } else {
                  const flashMessagePurpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    flashMessagePurpose,
                    15000
                  );
                  this.router.navigateByUrl('/sales');
                }
              });
          }
        })
    );
  }

  /**
   * 子コンポーネントから流れてくるエラーストリームを処理する
   * @param error
   */
  handleError(error: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    // モーダルのタイプをModalPurpose型から選択させる
    const modalPurpose: ModalPurpose = 'danger';

    let redirectPath = '';

    // リダイレクト希望の場合は保持しておく
    if (error.redirectPath) {
      redirectPath = error.redirectPath;
    }

    // statusで処理を分岐
    if (error.status === 0) {
      // クライアント側あるいはネットワークによるエラー
      // モーダル表示
      this.modalService.setModal(
        error.title,
        error.message + errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    } else {
      // サーバー側から返却されるエラー
      // モーダル表示
      this.modalService.setModal(
        error.title,
        `ステータスコード: ${error.status} \nメッセージ: ` +
          error.message +
          errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    }

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === error.title
          ) // 実行確認のモーダルじゃなければスルー
        )
        .subscribe((_) => {
          // リダイレクト希望があれば移動する
          if (redirectPath) this.router.navigateByUrl(redirectPath);
        })
    );
  }

  /**
   * フォーム展開
   */
  handleClickOpenFormButton() {
    this.edit_client_form = true;
    this.clientFc.client_id.patchValue('');
    this.clientFc.name.patchValue('');
    this.clientFc.tel.patchValue('');
  }
  /**
   * フォームクリア
   */
  handleClickClearButton() {
    this.edit_client_form = false;
    this.clientFc.client_id.patchValue('');
    this.clientFc.name.patchValue('');
    this.clientFc.tel.patchValue('');
  }

  /**
   * データ保存処理
   * フォームデータをapiへpost
   * @returns
   */
  handleClickSaveButton() {
    this.clientForm.markAsPristine();
    this.common.loading = true;

    const postData: { [key: string]: string | any[] | null | undefined } = {
      sales_slip_cd: String(this.sales_slip_data?.sales_slip_cd),
      sale_date: this.sales_slip_data?.sale_date,
      sale_year: String(this.sales_slip_data?.sale_year),
      sale_month: String(this.sales_slip_data?.sale_month),
      sale_day: String(this.sales_slip_data?.sale_day),
      sale_hour: String(this.sales_slip_data?.sale_hour),
      business_date: String(this.sales_slip_data?.business_date),
      business_year: String(this.sales_slip_data?.business_year),
      business_month: String(this.sales_slip_data?.business_month),
      business_month_and_year: String(
        this.sales_slip_data?.business_month_and_year
      ),
      business_day: String(this.sales_slip_data?.business_day),
      business_hour: String(this.sales_slip_data?.business_hour),
      register_closing_times: String(
        this.sales_slip_data?.register_closing_times
      ),
      accounts_receivable_closing_date: String(
        this.sales_slip_data?.accounts_receivable_closing_date
      ),
      deleted_flag: String(this.sales_slip_data?.deleted_flag),
      coordination_flag: String(this.sales_slip_data?.coordination_flag),
      //差し替えデータ
      client_cd: String(this.selectedClient?.client_cd),
      billing_cd: String(this.selectedClient?.billing_cd),
      client_name_1: String(this.selectedClient?.name),
      updated_at: new Date().toISOString(),
    };

    /**
     * Detail 情報の更新
     */
    /**
     * Create Details Post Data */
    let DetailPostData: SalesDetail[] = [];

    if (this.sales_slip_detail_lists) {
      this.sales_slip_detail_lists.forEach((detail) => {
        detail['client_cd'] = this.selectedClient?.client_cd
          ? this.selectedClient.client_cd
          : '';
        detail['billing_cd'] = this.selectedClient?.billing_cd
          ? this.selectedClient.billing_cd
          : '';
        detail['member_cd'] = '';
        detail['member_first_name'] = '';
        detail['member_id'] = '';
        detail['member_name'] = '';
      });

      const updatePromises = this.sales_slip_detail_lists.map((detail) => {
        const detail_id = detail['id'];
        return this.salesDetailService
          .update(detail_id, detail)
          .pipe(
            finalize(() => (this.common.loading = false)),
            catchError((error) => of(error))
          )
          .toPromise();
      });

      Promise.all(updatePromises).then((responses) => {
        responses.forEach((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError({
              status: res.status,
              title: this.errorModalTitle,
              message: res.message,
              redirectPath: this.detailPagePath,
            });
          }
        });

        // 更新処理_rental_slip(postData)
        this.subscription.add(
          this.service
            .update(this.salesSlipId, postData)
            .pipe(
              finalize(() => (this.common.loading = false)),
              catchError((error) => of(error))
            )
            .subscribe((res) => {
              if (res instanceof HttpErrorResponse) {
                this.handleError({
                  status: res.status,
                  title: this.errorModalTitle,
                  message: res.message,
                  redirectPath: this.detailPagePath,
                });
                return;
              }
              const purpose: FlashMessagePurpose = 'success';
              this.flashMessageService.setFlashMessage(
                res.message,
                purpose,
                15000
              );
              // フロント更新
              this.ngOnInit();
              //this.router.navigateByUrl(this.detailPagePath);
            })
        );
      });
    }
  }
}
