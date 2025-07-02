import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { Payment } from 'src/app/models/payment';
import {
  PaymentDetail,
  PaymentDetailApiResponse,
} from 'src/app/models/payment-detail';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentDetailService } from 'src/app/services/payment-detail.service';

import { DivisionService } from 'src/app/services/division.service';
import { divisionConst } from 'src/app/const/division.const';

type Mapping<T> = {
  name: keyof T;
  name_jp: string;
};

type ApiResponse<T> = {
  message: string;
  totalItems: number;
  data: T[];
};

@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss'],
})
export class DetailViewComponent implements OnInit, OnDestroy {
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
    private paymentService: PaymentService,
    private paymentDetailService: PaymentDetailService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService,
    private divisionService: DivisionService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;

  // 支払消込一覧のパス
  topPagePath = '/setting';
  listPagePath = '../../../payment-clearing';

  // 支払消込編集のパス
  editPath!: string;
  editPagePath = '../../../payment-clearing/detail-edit/{{ depositId }}';

  // 支払ID
  paymentId = '';

  // エラーモーダルのタイトル
  errorModalTitle = '支払消込一覧：' + modalConst.TITLE.HAS_ERROR;

  // 表示用商品オブジェクト
  payment!: Payment; //{ [key: string]: string | number };
  paymentDetail: PaymentDetail[] = []; //{ [key: string]: string | number };

  /**支払い区分 */
  paymentClassficationOption: any[] = [];

  ngOnInit(): void {
    this.common.loading = true;
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          )
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    this.common.loading = true;
    this.subscription.add(
      forkJoin([
        this.divisionService.getAsSelectOptions({
          name: divisionConst.DEPOSIT_CLASSIFICATION,
        }),
      ])
        .pipe(finalize(() => (this.common.loading = false)))
        .subscribe((res) => {
          // code と value 置き換え
          const payment = res[0][divisionConst.DEPOSIT_CLASSIFICATION].filter(
            (x: any) => {
              this.paymentClassficationOption.push({
                value: x.code,
                text: x.text,
              });
            }
          );
          this.common.loading = false;
        })
    );

    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.paramMap.get('id');

    if (selectedId === null) {
      // パスパラメータ取得エラー 一覧へ戻す
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    } else if (isNaN(Number(selectedId))) {
      // number型へのキャストエラー 一覧へ戻す
      // パスパラメータ取得エラー 一覧へ戻す
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }

    // 取得したパスパラメータをメンバへセット
    this.selectedId = Number(selectedId);
    this.editPath = '../../detail-edit/' + this.selectedId;
    this.getPayment(this.selectedId);
    this.getPaymentDetail(this.selectedId);
  }

  getPaymentClass(code: number): string {
    const status = this.paymentClassficationOption.find((x: any) => {
      return x.value === code;
    });
    if (status === undefined) {
      return '';
    }
    return status.text;
  }

  /**
   * idで指定した1件の支払消込データを取得
   * @param id
   */
  getPayment(id: number) {
    this.subscription.add(
      this.paymentService
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
          this.payment = res.data[0];
        })
    );
  }

  /**
   * idで指定した1件の支払消込明細データを取得
   * @param id
   */
  getPaymentDetail(id: number) {
    this.subscription.add(
      this.paymentDetailService
        .getAll({ payment_id: id })
        .pipe(
          catchError(
            this.paymentDetailService.handleErrorModal<PaymentDetailApiResponse>()
          ),
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
          this.paymentDetail = res.data;
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
      title: '支払消込一覧：' + modalConst.TITLE.HAS_ERROR,
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

  /**
   * 支払残高計算
   */
  calc() {
    let answer = 0;
    this.paymentDetail.forEach((x) => {
      answer += Number(x.payment_amount);
    });
    return Math.floor(answer);
  }
  /**
   * 支払区分
   */
  getDivisionName(division_code: number) {
    let statusDivisionOptions = [
      {
        value: 1,
        text: '売掛',
      },
      {
        value: 2,
        text: '現金',
      },
    ];
    return statusDivisionOptions.find((x) => x.value === division_code)?.text;
  }

  /**
   * 日付フォーマット変換
   */
  getDateFormat(tmpDateInfo: String) {
    let dateInfo;
    if (tmpDateInfo === '') {
      dateInfo = '';
    } else if (tmpDateInfo === 'NaT') {
      dateInfo = '';
    } else {
      dateInfo = new Date(tmpDateInfo as string).toLocaleDateString();
    }
    return dateInfo;
  }

  /**
   * 削除リンククリック時の処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = '支払' + modalConst.TITLE.DELETE;

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

            // 支払伝票_削除処理を購読
            this.paymentService
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
                  const errorTitle: string = res.error
                    ? res.error.title
                    : 'エラーが発生しました。';
                  this.handleError(res.status, errorTitle, res.message);
                  return;
                }

                // 支払明細削除を実施
                if (this.paymentDetail) {
                  this.paymentDetail.forEach((x) => {
                    if (x.id) {
                      this.deletePaymentDetailItem(x.id);
                    }
                  });
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

  deletePaymentDetailItem(paymentDetaiId: number) {
    // 削除実行
    this.paymentDetailService
      .remove(paymentDetaiId.toString())
      .pipe(
        finalize(() => (this.common.loading = false)),
        catchError((error: HttpErrorResponse) => {
          return of(error);
        })
      )
      .subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          const errorTitle: string = res.error
            ? res.error.title
            : 'エラーが発生しました。';
          this.handleError(res.status, errorTitle, res.message);
          return;
        }
      });
  }
}
