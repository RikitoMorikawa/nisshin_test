import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, of, Subscription, take } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { QrService } from 'src/app/services/qr.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { modalConst } from 'src/app/const/modal.const';
import { errorConst } from 'src/app/const/error.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Qr } from 'src/app/models/qr';
import { CommonService } from 'src/app/services/shared/common.service';

// リストで表示する項目の要素
type elementsOfListItem = {
  name: string;
  value?: string;
  prop_name?: keyof Qr;
};

@Component({
  selector: 'app-qr-detail',
  templateUrl: './qr-detail.component.html',
  styleUrls: ['./qr-detail.component.scss'],
})
export class QrDetailComponent implements OnInit, OnDestroy {
  // QRID
  selectedId!: number;
  // 購読を一元的に保持
  subscription = new Subscription();
  // エラーモーダルのタイトル
  errorModalTitle = 'QR詳細：' + modalConst.TITLE.HAS_ERROR;
  // QR一覧へのパス
  qrListPath = '/setting/non-cash-item/qr';
  // QR編集のルートパス
  qrEditRootPath = '/setting/non-cash-item/qr/edit/';
  // レコード編集画面へのパス
  qrEditPath!: string;
  // 最終更新者を格納
  lastUpdaterFullName!: string;
  // QRのレコードを格納
  qr!: Qr;
  // リスト要素で表示する、項目と一覧のマッピング
  readonly items: elementsOfListItem[] = [
    { name: 'QR名', prop_name: 'name' },
    { name: 'QR名カナ', prop_name: 'furi' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者' },
    { name: '最終更新日時', prop_name: 'updated_at' },
    { name: '最終更新者' },
  ];

  /**
   * コンストラクタ
   * @param qrService
   * @param modalService
   * @param router
   * @param route
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private qrService: QrService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   * @returns void
   */
  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          // QR詳細エラーモーダルでフィルタリング
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          )
        )
        .subscribe((res) => {
          // oKがクリックされた場合のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.qrListPath);
          }
        })
    );
    // パスパラメータからQRidを取得
    const selectedId = this.route.snapshot.paramMap.get('id');
    // idが取得できないか数字以外 ⇨ 一覧へ遷移
    if (selectedId === null || isNaN(Number(selectedId))) {
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        'danger',
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }
    // 編集画面へのパスを生成
    this.selectedId = Number(selectedId);
    this.qrEditPath = this.qrEditRootPath + this.selectedId;
    // QR情報を取得・整形
    this.getData();
  }

  /**
   * QRAPIからQRレコード詳細情報を取得
   * @return void
   */
  getData() {
    this.common.loading = true;
    // 購読を格納
    this.subscription.add(
      this.qrService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          // 戻り値に中身があるか確認
          const isQrInvalid = ApiResponseIsInvalid(res);
          if (isQrInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.qr = res.data[0];
          this.setFormattedData(this.qr);
          this.common.loading = false;
        })
    );
  }

  /**
   * QR情報を整形してクラス変数に格納
   * @param qr
   * @return void
   */
  setFormattedData(qr: Qr) {
    // Qrのプロパティを丸ごと格納
    this.items
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (qr[item.prop_name!] ?? '') + '';
      });
    // QR名カナ
    qr.furi
      ? (this.getItem('QR名カナ')!.value = qr.furi)
      : (this.getItem('QR名カナ')!.value = '未登録');
    // 登録日時
    this.getItem('登録日時')!.value = new Date(qr.created_at).toLocaleString();
    // 登録者
    this.getItem(
      '登録者'
    )!.value = `${qr.employee_created_last_name} ${qr.employee_created_first_name}`;
    // 最終更新日時
    this.getItem('最終更新日時')!.value = new Date(
      qr.updated_at
    ).toLocaleString();
    // 最終更新者
    this.getItem(
      '最終更新者'
    )!.value = `${qr.employee_updated_last_name} ${qr.employee_updated_first_name}`;
    this.lastUpdaterFullName = `${qr.employee_updated_last_name} ${qr.employee_updated_first_name}`;
  }

  /**
   * 項目名を取得
   * @param name
   * @returns 項目名
   */
  private getItem(name: string) {
    return this.items.find((x) => x.name === name);
  }

  /**
   * 削除ボタン押下後の処理
   * @return void
   */
  handleClickDelete() {
    // 削除確認モーダル設定
    const modalTitle = 'QR：' + modalConst.TITLE.DELETE;
    this.modalService.setModal(
      modalTitle,
      modalConst.BODY.DELETE,
      'danger',
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );
    // モーダルを閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1),
          filter(
            // 実行確認のモーダルをフィルタリング
            (_) => this.modalService.getModalProperties().title === modalTitle
          )
        )
        .subscribe((res) => {
          // 実行ボタン押下時のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.common.loading = true;
            this.qrService
              .remove(this.selectedId)
              .pipe(
                catchError((error: HttpErrorResponse) => {
                  // エラー時は空の値を返却
                  return of(error);
                })
              )
              .subscribe((res) => {
                // エラーの場合は親コンポーネントへエラーを送信
                if (res instanceof HttpErrorResponse) {
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: res.error.message,
                    redirectPath: this.qrListPath,
                  });
                } else {
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    'success',
                    15000
                  );
                  this.router.navigateByUrl(this.qrListPath);
                }
                this.common.loading = false;
              });
          }
        })
    );
  }

  /**
   * エラー処理
   * 親コンポーネントへエラーを送信する
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorService.setError({
      status: status,
      title: 'QR詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.qrListPath,
    });
  }

  /**
   * コンポーネントの終了処理
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
