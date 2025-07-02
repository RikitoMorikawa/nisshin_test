import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, filter, of, Subscription, take } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QualityCustomerService } from 'src/app/services/quality-customer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { errorConst } from 'src/app/const/error.const';
import { QualityCustomer } from 'src/app/models/quality-customer';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

// リストで表示する項目の要素
type elementsOfListItem = {
  name: string;
  value?: string;
  prop_name?: keyof QualityCustomer;
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  // データ取得中フラグ
  isLoading!: boolean;
  // 客層ID
  selectedId!: number;
  // 購読を一元的に格納
  subscription = new Subscription();
  // エラーモーダルのタイトル
  errorModalTitle = '客層詳細：' + modalConst.TITLE.HAS_ERROR;
  // 編集画面へのパスを格納
  editPath!: string;
  // 客層一覧へのパス
  qualityCustomerListPath = '/setting/quality-customer';
  // 最終更新者を格納
  lastUpdaterFullName!: string;
  // 客層を格納
  qualityCustomer!: QualityCustomer;

  // リスト要素で表示する項目の一覧とマッピング表
  readonly items: elementsOfListItem[] = [
    { name: '客層名', prop_name: 'name' },
    { name: '客層名カナ', prop_name: 'furi' },
    { name: '客層コード', prop_name: 'code' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者' },
    { name: '最終更新日時', prop_name: 'updated_at' },
    { name: '最終更新者' },
  ];

  /**
   * コンストラクタ
   * @param qualityCustomerService
   * @param modalService
   * @param router
   * @param route
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private qualityCustomerService: QualityCustomerService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   * @returns void
   */
  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            // 客層詳細エラーのモーダルのみにフィルタリング
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          )
        )
        .subscribe((res) => {
          // OKがクリックされた時のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 客層一覧画面へ遷移
            this.router.navigateByUrl(this.qualityCustomerListPath);
          }
        })
    );
    // パスパラメータから客層idを取得
    const selectedId = this.route.snapshot.paramMap.get('id');
    // idが取得できていないか、数字以外 ⇨　一覧へ遷移
    if (selectedId === null || isNaN(Number(selectedId))) {
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }
    // 編集画面へのパスを生成
    this.selectedId = Number(selectedId);
    this.editPath = '/setting/quality-customer/edit/' + this.selectedId;
    // 客層情報を取得・成形
    this.getData();
  }

  /**
   * 客層APIから客層レコード詳細情報を取得
   * @return void
   */
  getData() {
    this.common.loading = true;
    this.isLoading = true;
    // 購読を格納
    this.subscription.add(
      this.qualityCustomerService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          this.isLoading = false;
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          // 戻り値に中身があるか確認
          const isQualityCustomerInvalid = ApiResponseIsInvalid(res);
          if (isQualityCustomerInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.qualityCustomer = res.data[0];
          // 取得したデータを成形してクラス変数に格納
          this.setFormattedData(this.qualityCustomer);
        })
    );
  }

  /**
   * 客層情報を成形してクラス変数に格納
   * @param qualityCustomer: QualityCustomer
   * @return void
   */
  setFormattedData(qualityCustomer: QualityCustomer): void {
    // QualityCustomerのプロパティを丸ごと格納
    this.items
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (qualityCustomer[item.prop_name!] ?? '') + '';
      });
    // 客層名カナ
    qualityCustomer.furi
      ? (this.getItem('客層名カナ')!.value = qualityCustomer.furi)
      : (this.getItem('客層名カナ')!.value = '未登録');
    // 登録日時
    this.getItem('登録日時')!.value = new Date(
      qualityCustomer.created_at
    ).toLocaleString();
    // 登録者
    this.getItem(
      '登録者'
    )!.value = `${qualityCustomer.employee_created_last_name} ${qualityCustomer.employee_created_first_name}`;
    // 最終更新日時
    this.getItem('最終更新日時')!.value = new Date(
      qualityCustomer.updated_at
    ).toLocaleString();
    // 最終更新者
    this.getItem(
      '最終更新者'
    )!.value = `${qualityCustomer.employee_updated_last_name} ${qualityCustomer.employee_updated_first_name}`;
    this.lastUpdaterFullName = `${qualityCustomer.employee_updated_last_name} ${qualityCustomer.employee_updated_first_name}`;
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
    const modalTitle = '客層：' + modalConst.TITLE.DELETE;
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
            this.isLoading = true;
            this.common.loading = true;
            this.qualityCustomerService
              .remove(this.selectedId)
              .pipe(
                catchError((error: HttpErrorResponse) => {
                  // エラー時は空の値を返却
                  return of(error);
                })
              )
              .subscribe((res) => {
                this.isLoading = false;
                this.common.loading = false;
                // エラーの場合は親コンポーネントへエラーを送信
                if (res instanceof HttpErrorResponse) {
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: res.error.message,
                    redirectPath: this.qualityCustomerListPath,
                  });
                } else {
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    'success',
                    15000
                  );
                  this.router.navigateByUrl(this.qualityCustomerListPath);
                }
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
      title: '客層詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.qualityCustomerListPath,
    });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
