import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, filter, of, take } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import { PriceRanking } from 'src/app/models/price_ranking';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PriceRankingService } from 'src/app/services/price-ranking.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * リスト表示項目（兼マッピング表）の型
 */
type ListItem = {
  name: string;
  value?: string;
  prop_name?: keyof PriceRanking;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private priceRankingService: PriceRankingService,
    private modalService: ModalService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  private subscription = new Subscription();

  // 一覧ページのパス
  listPagePath = '/setting/price-ranking';

  // 編集ページのパス
  editPagePath!: string;

  // 設定一覧のパス
  settingMenuPath = '/setting';

  // ページタイトル
  title!: string;

  // ランク価格オブジェクト
  priceRanking = {} as PriceRanking;

  // 最終更新者フルネーム
  updater!: string;

  private selectedId!: number;

  // リスト要素で表示する項目の一覧とマッピング表
  listItems: ListItem[] = [
    { name: 'ランク価格ID', prop_name: 'id' },
    { name: 'ランク区分ID', prop_name: 'rank_division_id' },
    { name: '店舗名', prop_name: 'store_name' },
    { name: '商品名', prop_name: 'product_name' },
    { name: 'バラ仕入単価', prop_name: 'supplier_cost_price' },
    { name: '小分け仕入単価', prop_name: 'b_supplier_cost_price' },
    { name: 'ケース仕入単価', prop_name: 'c_supplier_cost_price' },
    { name: 'バラ荒利率', prop_name: 'gross_profit_rate' },
    { name: '小分け荒利率', prop_name: 'b_gross_profit_rate' },
    { name: 'ケース荒利率', prop_name: 'c_gross_profit_rate' },
    { name: 'バラ売価', prop_name: 'selling_price' },
    { name: '小分け売価', prop_name: 'b_selling_price' },
    { name: 'ケース売価', prop_name: 'c_selling_price' },
    { name: '商品消費税区分', prop_name: 'division_sales_tax_value' },
    { name: '商品消費税端数区分', prop_name: 'division_sales_fraction_value' },
    {
      name: '仕入先消費税区分',
      prop_name: 'division_supplier_sales_tax_value',
    },
    {
      name: '仕入先消費税端数区分',
      prop_name: 'division_supplier_sales_fraction_value',
    },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者', prop_name: 'employee_created_last_name' },
    { name: '更新日時', prop_name: 'updated_at' },
    { name: '更新者', prop_name: 'employee_updated_last_name' },
  ];

  /**
   * Angular ライフサイクルフック
   * コンポーネントが初期化される時に実行
   * @returns
   */
  ngOnInit(): void {
    // ランク価格IDを取得
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
    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);

    // 編集ページのパスをセット
    this.editPagePath = this.listPagePath + '/edit/' + this.selectedId;

    // ランク価格を取得
    this.getPriceRanking(this.selectedId);
  }

  /**
   * ランク価格を取得する
   * @param id
   */
  getPriceRanking(id: number) {
    // データ取得中フラグをオン
    this.common.loading = true;

    // ランク価格を取得
    this.subscription.add(
      this.priceRankingService
        .find(id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.common.loading = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました。';
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }
          this.priceRanking = res.data[0];
          this.setListItemValue(this.priceRanking);
          this.title = `ランク：${this.priceRanking.division_rank_value}`;
          if (this.priceRanking.employee_updated_last_name) {
            this.updater = `${this.priceRanking.employee_updated_last_name} ${this.priceRanking.employee_updated_first_name}`;
          }
          this.common.loading = false;
        })
    );
  }

  /**
   * リスト項目として表示する値を生成し、`this.listItems`の値を書き換える。
   * @param data `SalesSlip`オブジェクト。
   */
  private setListItemValue(data: PriceRanking) {
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
      if (/^.*[売価 | 単価]$/.test(item.name)) {
        item.value = `${Number(item.value).toLocaleString()}`;
      }

      // 荒利率系
      if (/^.*荒利率$/.test(item.name)) {
        item.value = `${Number(item.value).toLocaleString()} %`;
      }

      // 日時系
      if (['登録日時', '更新日時'].includes(item.name)) {
        item.value = new Date(item.value).toLocaleString();
      }

      // 登録者
      if (item.name === '登録者') {
        item.value = `${data.employee_created_last_name} ${data.employee_created_first_name}`;
      }

      // 更新者
      if (item.name === '更新者') {
        item.value = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
      }
    });
  }

  /**
   * 削除ボタンクリック時の処理
   */
  handleDeleteLinkClick() {
    // 削除確認モーダルを表示
    // モーダルのタイトル
    const modalTitle = 'ランク価格' + modalConst.TITLE.DELETE;
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
            this.priceRankingService
              .remove(this.selectedId)
              .pipe(
                // エラー対応
                catchError((error: HttpErrorResponse) => {
                  // 空の値を返却
                  return of(error);
                })
              )
              .subscribe((res) => {
                // ローディング終了
                this.common.loading = false;
                if (res instanceof HttpErrorResponse) {
                  // 親コンポーネントへエラーを送信
                  const message = res.error ? res.error.message : res.message;
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: message,
                    redirectPath: this.listPagePath,
                  });
                } else {
                  const flashMessagePurpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    flashMessagePurpose,
                    15000
                  );
                  this.router.navigateByUrl(this.listPagePath);
                }
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
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath?: string
  ) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: title
        ? 'ランク価格詳細：' + title + modalConst.TITLE.HAS_ERROR
        : 'ランク価格詳細：' + modalConst.TITLE.HAS_ERROR,
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
