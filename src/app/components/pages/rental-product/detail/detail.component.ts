import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, filter, finalize, of, take } from 'rxjs';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import { RentalProduct } from 'src/app/models/rental-product';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { RentalProductService } from 'src/app/services/rental-product.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';

/**
 * 詳細一覧項目の型
 */
type listItem = {
  name: string;
  value?: string;
  prop_name: keyof RentalProduct;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private errorService: ErrorService,
    private rpService: RentalProductService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    public common: CommonService
  ) {}

  // 購読を一元管理
  private subscription = new Subscription();

  // 選択中レンタル商品データ
  rp!: RentalProduct;

  // 一覧のパス
  listPagePath = '/rental-slip/rental-product';

  // 編集画面のパス
  editPagePath!: string;

  // エラーモーダルのタイトル
  errorModalTitle = 'レンタル商品詳細エラー：' + modalConst.TITLE.HAS_ERROR;

  // 選択中のレンタル商品ID
  selectedId!: number;

  // 最終更新者名
  lastUpdater!: string;

  // 商品画像へのパス
  productImagePath!: string | undefined;

  // リスト要素で表示する項目の一覧とマッピング表
  private listItems: listItem[] = [
    { name: '商品ID', prop_name: 'id' },
    { name: '店舗', prop_name: 'store_name' },
    { name: '商品名', prop_name: 'name' },
    { name: '商品名カナ', prop_name: 'name_kana' },
    { name: '商品識別用バーコード', prop_name: 'product_barcode' },
    { name: 'バーコード', prop_name: 'barcode' },
    { name: '規格', prop_name: 'standard' },
    { name: '原価', prop_name: 'cost_price' },
    { name: '粗利率', prop_name: 'gross_profit_rate' },
    { name: '売価', prop_name: 'selling_price' },
    { name: '配送料', prop_name: 'delivery_charge' },
    { name: '消費税区分', prop_name: 'division_sales_tax_value' },
    { name: '消費税端数区分', prop_name: 'division_sales_fraction_value' },
    { name: '値引区分', prop_name: 'division_discount_value' },
    { name: 'ポイント区分', prop_name: 'division_point_value' },
    { name: 'ステータス区分', prop_name: 'division_status_value' },
    { name: '商品区分', prop_name: 'division_product_value' },
    { name: '公開区分', prop_name: 'division_data_permission_value' },
    { name: '備考1', prop_name: 'remarks_1' },
    { name: '備考2', prop_name: 'remarks_2' },
    { name: '備考3', prop_name: 'remarks_3' },
    { name: '備考4', prop_name: 'remarks_4' },
    { name: '大分類', prop_name: 'large_category_name' },
    { name: '中分類', prop_name: 'medium_category_name' },
    { name: '小分類', prop_name: 'small_category_name' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '更新者', prop_name: 'employee_updated_last_name' },
    { name: '廃番設定者', prop_name: 'employee_out_of_service_last_name' },
  ];

  get details() {
    return this.listItems as Required<listItem>[];
  }
  tags: { name: string; value: string }[] = [];

  ngOnInit(): void {
    // パスパラメータからidを取得
    const selectedId: string = this.activatedRoute.snapshot.params['id'];

    // パスパラメータ正当性確認
    const selectedIdIsInvalid = this.isParameterInvalid(selectedId);

    // パラメータがエラーならモーダルを表示
    if (selectedIdIsInvalid) {
      this.handleError(
        400,
        this.errorModalTitle,
        'パラメータがエラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    // メンバーへ取得した値をセット
    this.selectedId = Number(selectedId);
    this.editPagePath = this.listPagePath + '/edit/' + selectedId;

    this.initialization(Number(selectedId));
  }

  /**
   * string型の数字のパスパラメータ・クエリパラメータを受け取り正当性を確認
   * @param parameter
   * @returns
   */
  private isParameterInvalid(parameter: string): boolean {
    if (parameter === null) {
      // パラメータ取得エラー
      return true;
    } else if (isNaN(Number(parameter))) {
      // number型へのキャストエラー
      return true;
    }
    return false;
  }

  initialization(rentalProductId: number) {
    // ローディング開始
    this.common.loading = true;

    this.subscription.add(
      this.rpService
        .find(rentalProductId)
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(
              res.status,
              this.errorModalTitle,
              res.message,
              this.listPagePath
            );
            return;
          }
          // レスポンスがnull undefinedか
          if (res === null || res === undefined) {
            this.handleError(
              400,
              this.errorModalTitle,
              modalConst.BODY.HAS_ERROR,
              this.listPagePath
            );
            return;
          }
          // 選択中のレンタル商品をセット
          this.rp = res.data[0];
          this.lastUpdater =
            this.rp.employee_updated_last_name +
            ' ' +
            this.rp.employee_updated_first_name;
          this.productImagePath = this.rp.image_path
            ? this.rp.image_path
            : generalConst.NO_IMAGE_PATH;
          this.setListItemValue(this.rp);
        })
    );
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `RentalProduct`オブジェクト。
   */
  private setListItemValue(data: RentalProduct) {
    // プロパティそのままのものを格納
    this.listItems
      .filter((x) => x.name)
      .forEach((item) => {
        item.value = (data[item.prop_name] ?? '') + '';
      });

    // 値の修正
    this.listItems.forEach((item) => {
      // 値が未設定なら何もしない
      if (!item.value) {
        return;
      }

      // 金額系
      if (
        ['cost_price', 'delivery_charge', 'selling_price'].includes(
          item.prop_name
        )
      ) {
        item.value = `${Number(item.value).toLocaleString()} 円`;
      }
      // パーセント
      if (['gross_profit_rate'].includes(item.prop_name)) {
        item.value = item.value + ' ' + '%';
      }
      // 日時系
      if (
        ['created_at', 'updated_at', 'out_of_service_at'].includes(
          item.prop_name
        )
      ) {
        item.value = new Date(item.value).toLocaleString();
      }

      // 登録者
      if (item.prop_name === 'employee_created_last_name') {
        item.value = `${data.employee_created_last_name} ${data.employee_created_first_name}`;
      }

      // 更新者
      if (item.prop_name === 'employee_updated_last_name') {
        item.value = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
      }

      // 廃番登録者
      if (item.prop_name === 'employee_out_of_service_last_name') {
        item.value = `${data.employee_out_of_service_last_name} ${data.employee_out_of_service_first_name}`;
      }
    });
  }

  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = 'レンタル商品' + modalConst.TITLE.DELETE;
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
          )
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除処理を購読
            this.rpService
              .remove(this.selectedId)
              .pipe(
                // エラー対応
                catchError((error: HttpErrorResponse) => {
                  // 空の値を返却
                  return of(error);
                }),
                finalize(() => (this.common.loading = false))
              )
              .subscribe((res) => {
                // ローディング終了
                this.common.loading = false;
                if (res instanceof HttpErrorResponse) {
                  this.handleError(
                    res.status,
                    this.errorModalTitle,
                    res.error.message,
                    this.listPagePath
                  );
                  return;
                }

                const flashMessagePurpose: FlashMessagePurpose = 'success';
                this.flashMessageService.setFlashMessage(
                  res.message,
                  flashMessagePurpose,
                  15000
                );
                this.router.navigateByUrl(this.listPagePath);
              });
          }
        })
    );
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  private handleError(
    status: number,
    title: string,
    message: string,
    redirectPath?: string
  ) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title,
      message: message,
      redirectPath: redirectPath,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
