import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, of, Subscription, take } from 'rxjs';
import {
  Store,
  storeLogicalNamesForDisplay,
  storeKeysForDisplay,
} from 'src/app/models/store';
import { StoreService } from 'src/app/services/store.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { HttpErrorResponse } from '@angular/common/http';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { ErrorService } from 'src/app/services/shared/error.service';
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
  /**
   * コンストラクター
   * @param storeService
   * @param route
   * @param router
   * @param modalService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  selectedId!: number;

  // 表示用論理名
  logicalNames = storeLogicalNamesForDisplay;

  // 表示用社員のキー
  storeKeys = storeKeysForDisplay;

  // 購読を一元管理
  subscription = new Subscription();

  // 表示対象店舗
  store!: { [key: string]: string };

  // エラーモーダルのタイトル
  errorModalTitle = '店舗詳細：' + modalConst.TITLE.HAS_ERROR;

  editPath!: string;

  storeLogoImage?: string;

  last_update_user?: string = '';
  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // ローディング開始
    this.common.loading = true;
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
            this.router.navigateByUrl('/setting/store');
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
    this.editPath = '/setting/store/edit/' + this.selectedId;

    // 購読を格納
    this.subscription.add(
      // 店舗情報を取得
      this.storeService
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
          } else {
            // 安全に配列アクセスするためにdataの中身を確認
            if (
              res &&
              res.data &&
              Array.isArray(res.data) &&
              res.data.length > 0
            ) {
              const displayData = res.data[0];
              this.storeLogoImage = displayData.logo_image_path
                ? displayData.logo_image_path
                : generalConst.NO_IMAGE_PATH;

              this.store = this.storeDataGeneration(displayData);
              this.last_update_user = this.store['updated_id'];
            } else {
              this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            }
          }
          // ローディング終了
          this.common.loading = false;
        })
    );
  }

  /**
   * APIで取得したデータを表示用にマッピング
   * @param store
   * @returns displayData { [key: string]: string }
   */
  storeDataGeneration(store: Store) {
    const displayData = {
      name: store.name,
      name_kana: store.name_kana ? store.name_kana : '未登録',
      alias: store.alias ? store.alias : '未登録',
      postal_code: store.postal_code,
      province: store.province,
      locality: store.locality,
      street_address: store.street_address,
      other_address: store.other_address ? store.other_address : '未登録',
      tel: store.tel,
      fax: store.fax ? store.fax : '未登録',
      payee_1: store.payee_1 ? store.payee_1 : '未登録',
      payee_2: store.payee_2 ? store.payee_2 : '未登録',
      logo_image_path: store.logo_image_path
        ? store.logo_image_path
        : generalConst.NO_IMAGE_PATH,
      created_at: store.created_at
        ? new Date(store.created_at).toLocaleString()
        : '未登録',
      created_id:
        store.employee_created_last_name && store.employee_created_first_name
          ? store.employee_created_last_name +
            ' ' +
            store.employee_created_first_name
          : '未登録',
      updated_at: store.updated_at
        ? new Date(store.updated_at).toLocaleString()
        : '未登録',
      updated_id:
        store.employee_updated_last_name && store.employee_updated_first_name
          ? store.employee_updated_last_name +
            ' ' +
            store.employee_updated_first_name
          : '未登録',
    };
    return displayData;
  }

  /**
   * 削除処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = '店舗' + modalConst.TITLE.DELETE;
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
            console.log('dell :' + String(this.common.loading));
            // 削除処理を購読
            this.storeService
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
                console.log('end dell :' + String(this.common.loading));
                if (res instanceof HttpErrorResponse) {
                  // 親コンポーネントへエラーを送信
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: res.error.message,
                    redirectPath: '/setting/store',
                  });
                } else {
                  const flashMessagePurpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    flashMessagePurpose,
                    15000
                  );
                  this.router.navigateByUrl('/setting/store');
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
      title: '店舗詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: '/setting/store',
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
