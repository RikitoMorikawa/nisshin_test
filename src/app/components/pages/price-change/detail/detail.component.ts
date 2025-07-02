import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, filter, of, take } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import { PriceChange, dummyData } from 'src/app/models/price-change';
import { AuthorService } from 'src/app/services/author.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { PriceChangeService } from 'src/app/services/price-change.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private authorService: AuthorService,
    private priceChangeService: PriceChangeService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private router: Router,
    public common: CommonService
  ) {}

  // 購読を一元管理
  private subscription = new Subscription();

  // 一覧ページのパス
  listPagePath = '/setting/price-change';

  // 編集ページのパス
  editPagePath!: string;

  // 設定一覧のパス
  settingMenuPath = '/setting';

  // 価格変更オブジェクト
  priceChange = {} as PriceChange;

  // 最終更新者フルネーム
  updater!: string;

  private selectedId!: number;

  ngOnInit(): void {
    // ログイン中ユーザーを取得して登録者に格納
    if (this.authorService.author) {
      const author = this.authorService.author;
      this.updater = author.last_name + ' ' + author.first_name;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.updater = author.last_name + ' ' + author.first_name;
        })
      );
    }

    // 価格変更IDを取得
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

    // 価格変更を取得
    this.getPriceChange(this.selectedId);
  }

  /**
   *
   * @param id
   */
  getPriceChange(id: number) {
    // データ取得中フラグをオン
    this.common.loading = true;

    // TODO: ダミーデータを利用 バックエンド対合後に削除
    // const dummy = dummyData.find((x) => x.id === id);
    // this.priceChange = dummy ? dummy : ({} as PriceChange);
    // this.common.loading = false;

    // 価格変更を取得
    this.priceChangeService
      .find(id)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.common.loading = false;
          return of(error);
        })
      )
      .subscribe((res) => {
        if (res instanceof HttpErrorResponse) {
          const message = res.error ? res.error.message : res.message;
          this.handleError(res.status, message);
          return;
        }
        this.priceChange = res.data[0];
        this.common.loading = false;
      });
  }

  handleDeleteLinkClick() {
    // 削除確認モーダルを表示
    // モーダルのタイトル
    const modalTitle = '価格変更' + modalConst.TITLE.DELETE;
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
            this.priceChangeService
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
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '価格変更詳細：' + modalConst.TITLE.HAS_ERROR,
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
