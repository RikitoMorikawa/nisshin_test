import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, of, Subscription, take } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import {
  ApiResponseIsInvalid,
  isParameterInvalid,
} from 'src/app/functions/shared-functions';
import { Delivery } from 'src/app/models/delivery';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { DeliveryService } from 'src/app/services/delivery.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { deliveryConst } from 'src/app/const/delivery.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-delivery-detail',
  templateUrl: './delivery-detail.component.html',
  styleUrls: ['./delivery-detail.component.scss'],
})
export class DeliveryDetailComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param route
   * @param router
   * @param modalService
   * @param repairService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private deliveryService: DeliveryService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 配送用定数
  deliveryConst = deliveryConst;

  // 選択中id
  selectedId!: number;

  // 配送一覧のパス
  listPagePath = '/delivery';

  // 編集ページのパス
  editPagePath!: string;

  // エラーモーダルのタイトル
  errorModalTitle = '配送詳細：' + modalConst.TITLE.HAS_ERROR;

  // 最終更新者フルネーム
  lastUpdaterName!: string;

  // 表示用商品オブジェクト
  delivery!: Delivery; //{ [key: string]: string | number };

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          ) // キャンセルモーダルじゃなければスルー
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

    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);
    this.editPagePath = this.listPagePath + '/edit/' + this.selectedId;

    this.getDelivery(this.selectedId);
  }

  /**
   * idで指定した1件の配送データを取得
   * @param id
   */
  getDelivery(id: number) {
    this.common.loading = true;
    this.subscription.add(
      this.deliveryService
        .find(id)
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
          const resInvalid = ApiResponseIsInvalid(res);
          if (resInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.delivery = res.data[0];
          this.lastUpdaterName =
            res.data[0].employee_updated_last_name +
            ' ' +
            res.data[0].employee_updated_first_name;
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
    return selectedSalesType?.name;
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
   * 削除リンククリック時の処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = '配送' + modalConst.TITLE.DELETE;
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
          ) // 削除モーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除処理を購読
            this.deliveryService
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
                if (res instanceof HttpErrorResponse) {
                  this.handleError(res.status, res.error.message);
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
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '配送詳細：' + modalConst.TITLE.HAS_ERROR,
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
