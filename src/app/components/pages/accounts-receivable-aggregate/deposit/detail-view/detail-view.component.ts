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
import { Deposit } from 'src/app/models/deposit';
import {
  DepositDetail,
  DepositDetailApiResponse,
} from 'src/app/models/deposit-detail';
import { DepositService } from 'src/app/services/deposit.service';
import { DepositDetailService } from 'src/app/services/deposit-detail.service';

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
    private depositService: DepositService,
    private depositDetailService: DepositDetailService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService,
    private divisionService: DivisionService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;

  // 入金一覧のパス
  topPagePath = '/setting';
  listPagePath = '../../../deposit';

  // 入金詳細編集のパス
  editPath!: string;
  editPagePath = '../../../deposit/detail-edit/{{ depositId }}';

  // 入金ID
  depositId = '';

  // エラーモーダルのタイトル
  errorModalTitle = '入金一覧：' + modalConst.TITLE.HAS_ERROR;

  // 表示用商品オブジェクト
  deposit!: Deposit; //{ [key: string]: string | number };
  depositDetail: DepositDetail[] = []; //{ [key: string]: string | number };

  /**入金区分 */
  depositClassficationOption: any[] = [];

  ngOnInit(): void {
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
          const deposit = res[0][divisionConst.DEPOSIT_CLASSIFICATION].filter(
            (x: any) => {
              this.depositClassficationOption.push({
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
    this.getDeposit(this.selectedId);
    this.getDepositDetail(this.selectedId);
  }

  getdepositClass(code: number): string {
    const status = this.depositClassficationOption.find((x: any) => {
      return x.value === code;
    });
    return status?.text;
  }

  /**
   * idで指定した1件の入金データを取得
   * @param id
   */
  getDeposit(id: number) {
    this.subscription.add(
      this.depositService
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
          this.deposit = res.data[0];
        })
    );
  }

  /**
   * idで指定した1件の入金明細データを取得
   * @param id
   */
  getDepositDetail(id: number) {
    this.subscription.add(
      this.depositDetailService
        .getAll({ deposit_id: id })
        .pipe(
          catchError(
            this.depositDetailService.handleErrorModal<DepositDetailApiResponse>()
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
          this.depositDetail = res.data;
          console.log(this.depositDetail);
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
      title: '入金一覧：' + modalConst.TITLE.HAS_ERROR,
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
   * 請求残高計算
   */
  calc() {
    let answer = 0;
    this.depositDetail.forEach((x) => {
      answer += Number(x.deposit_amount);
    });
    return Math.floor(answer);
  }
  /**
   * 入金区分
   */
  getDivisionName(division_code: number) {
    let statusDivisionOptions = [
      {
        value: 1,
        text: '入金待ち',
      },
      {
        value: 2,
        text: '入金済み',
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
    const modalTitle = '入金' + modalConst.TITLE.DELETE;

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

            // 入金伝票_削除処理を購読
            this.depositService
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

                // 入金明細削除を実施
                if (this.depositDetail) {
                  this.depositDetail.forEach((x) => {
                    if (x.id) {
                      this.deleteDepositDetailItem(x.id);
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

  deleteDepositDetailItem(depositDetaiId: number) {
    // 削除実行
    this.depositDetailService
      .remove(depositDetaiId.toString())
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
