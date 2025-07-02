import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, of, Subscription, take } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomSmallCategoryService } from 'src/app/services/custom-small-category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { errorConst } from 'src/app/const/error.const';
import { CustomSmallCategory } from 'src/app/models/custom-small-category';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private cscService: CustomSmallCategoryService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  selectedId!: number;

  // 購読を一元管理
  subscription = new Subscription();

  // エラーモーダルのタイトル
  errorModalTitle = 'カスタム小分類詳細：' + modalConst.TITLE.HAS_ERROR;

  // 編集画面へのパスを保持
  editPath!: string;

  // カスタム小分類の一覧のパス
  cscPath = '/setting/custom-small-category';

  //登録者
  add_user!: string;
  // 更新者を格納
  updater!: string;

  csc!: CustomSmallCategory;

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          ) // カスタム小分類詳細エラーのモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.cscPath);
          }
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

    this.selectedId = Number(selectedId);
    this.editPath = '/setting/custom-small-category/edit/' + this.selectedId;

    this.getDisplayData();
  }

  getDisplayData() {
    this.common.loading = true;
    // 購読を格納
    this.subscription.add(
      this.cscService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            // レスポンスがエラーの場合
            this.handleError(res.status, res.error.message);
            return;
          }

          // 安全に配列アクセスするためにdataの中身を確認
          const resInvalid = ApiResponseIsInvalid(res);

          if (resInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          const displayData = res.data[0];
          displayData.created_at = new Date(
            displayData.created_at
          ).toLocaleString();
          if (displayData.updated_at) {
            displayData.updated_at = new Date(
              displayData.updated_at
            ).toLocaleString();
          } else {
            displayData.updated_at = '未登録';
          }
          if (
            displayData.employee_updated_last_name &&
            displayData.employee_updated_first_name
          ) {
            this.updater =
              displayData.employee_updated_last_name +
              ' ' +
              displayData.employee_updated_first_name;
          } else {
            this.updater = '未登録';
          }
          this.csc = displayData;
          this.add_user =
            displayData.employee_created_last_name +
            ' ' +
            displayData.employee_created_first_name;
          this.common.loading = false;
        })
    );
  }

  /**
   * 削除処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = 'カスタム小分類：' + modalConst.TITLE.DELETE;
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
            this.cscService
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
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: res.error.message,
                    redirectPath: this.cscPath,
                  });
                } else {
                  const flashMessagePurpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    flashMessagePurpose,
                    15000
                  );
                  this.router.navigateByUrl(this.cscPath);
                }
              });
          }
        })
    );
  }

  /**
   * エラー処理
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    // エラー対応
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: 'カスタム小分類詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.cscPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を破棄
    this.subscription.unsubscribe();
  }
}
