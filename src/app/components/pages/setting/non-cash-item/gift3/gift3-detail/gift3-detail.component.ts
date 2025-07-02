import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, of, Subscription, take } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { Gift3Service } from 'src/app/services/gift3.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { modalConst } from 'src/app/const/modal.const';
import { errorConst } from 'src/app/const/error.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { Gift3 } from 'src/app/models/gift3';
import { CommonService } from 'src/app/services/shared/common.service';

// リストで表示する項目の要素
type elementsOfListItem = {
  name: string;
  value?: string;
  prop_name?: keyof Gift3;
};

@Component({
  selector: 'app-gift3-detail',
  templateUrl: './gift3-detail.component.html',
  styleUrls: ['./gift3-detail.component.scss'],
})
export class Gift3DetailComponent implements OnInit, OnDestroy {
  // ギフト3ID
  selectedId!: number;
  // 購読を一元的に保持
  subscription = new Subscription();
  // エラーモーダルのタイトル
  errorModalTitle = 'ギフト3詳細：' + modalConst.TITLE.HAS_ERROR;
  // ギフト3一覧へのパス
  gift3ListPath = '/setting/non-cash-item/gift3';
  // ギフト3編集のルートパス
  gift3EditRootPath = '/setting/non-cash-item/gift3/edit/';
  // ギフト3レコード編集画面へのパス
  gift3EditPath!: string;
  // 最終更新者を格納
  lastUpdaterFullName!: string;
  // ギフト3のレコードを格納
  gift3!: Gift3;
  // リスト要素で表示する、項目と一覧のマッピング
  readonly items: elementsOfListItem[] = [
    { name: 'ギフト3名', prop_name: 'name' },
    { name: 'ギフト3名カナ', prop_name: 'furi' },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者' },
    { name: '最終更新日時', prop_name: 'updated_at' },
    { name: '最終更新者' },
  ];

  /**
   * コンストラクタ
   * @param gift3Service
   * @param modalService
   * @param router
   * @param route
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private gift3Service: Gift3Service,
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
          // ギフト3詳細エラーモーダルでフィルタリング
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          )
        )
        .subscribe((res) => {
          // oKがクリックされた場合のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.gift3ListPath);
          }
        })
    );
    // パスパラメータからギフト3idを取得
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
    this.gift3EditPath = this.gift3EditRootPath + this.selectedId;
    // ギフト3情報を取得・整形
    this.getData();
  }

  /**
   * ギフト3APIからギフト3レコード詳細情報を取得
   * @return void
   */
  getData() {
    this.common.loading = true;
    // 購読を格納
    this.subscription.add(
      this.gift3Service
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
          const isGift3Invalid = ApiResponseIsInvalid(res);
          if (isGift3Invalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          this.gift3 = res.data[0];
          console.log(res.data[0]);
          // 取得したデータを整形してクラス変数に格納
          this.setFormattedData(this.gift3);
          this.common.loading = false;
        })
    );
  }

  /**
   * ギフト3情報を整形してクラス変数に格納
   * @param gift3
   * @return void
   */
  setFormattedData(gift3: Gift3) {
    // Gift3のプロパティを丸ごと格納
    this.items
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (gift3[item.prop_name!] ?? '') + '';
      });
    // ギフト3名カナ
    gift3.furi
      ? (this.getItem('ギフト3名カナ')!.value = gift3.furi)
      : (this.getItem('ギフト3名カナ')!.value = '未登録');
    // 登録日時
    this.getItem('登録日時')!.value = new Date(
      gift3.created_at
    ).toLocaleString();
    // 登録者
    this.getItem(
      '登録者'
    )!.value = `${gift3.employee_created_last_name} ${gift3.employee_created_first_name}`;
    // 最終更新日時
    this.getItem('最終更新日時')!.value = new Date(
      gift3.updated_at
    ).toLocaleString();
    // 最終更新者
    this.getItem(
      '最終更新者'
    )!.value = `${gift3.employee_updated_last_name} ${gift3.employee_updated_first_name}`;
    this.lastUpdaterFullName = `${gift3.employee_updated_last_name} ${gift3.employee_updated_first_name}`;
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
    const modalTitle = 'ギフト3：' + modalConst.TITLE.DELETE;
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
            this.gift3Service
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
                    redirectPath: this.gift3ListPath,
                  });
                } else {
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    'success',
                    15000
                  );
                  this.router.navigateByUrl(this.gift3ListPath);
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
      title: 'ギフト3詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.gift3ListPath,
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
