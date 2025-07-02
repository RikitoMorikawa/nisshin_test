import { Component, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  filter,
  finalize,
  Observable,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ModalService } from 'src/app/services/modal.service';
import { ApiResponse } from '../export-link-org/export-link-org.component';

@Component({
  selector: 'app-delete-link',
  templateUrl: './delete-link.component.html',
  styleUrls: ['./delete-link.component.scss'],
})
export class DeleteLinkComponent implements OnDestroy {
  @Input() removeMethod$!: Observable<ApiResponse>;
  @Input() redirectPath!: string;
  loading = false;
  private subscription?: Subscription;

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modal: ModalService,
    private flashMessage: FlashMessageService
  ) {}

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * 削除ボタンクリック時の処理
   */
  onClick() {
    // モーダルの戻り値をサブスクライブ
    this.subscription = this.modal.closeEventObservable$
      .pipe(
        take(1),
        filter(
          () =>
            this.modal.getModalProperties().title === modalConst.TITLE.DELETE
        ), // 実行確認のモーダルじゃなければスルー
        filter(
          (result) =>
            result === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE
        ),
        tap(() => (this.loading = true)),
        switchMap(() => this.removeMethod$), // APIコールへスイッチ
        filter((x) => x.message === '削除しました'), // 削除に失敗したら何もしない
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        // フラッシュメッセージを表示して一覧画面へ遷移する
        this.flashMessage.setFlashMessage(
          '正常に削除されました。',
          'success',
          15000
        );
        this.router.navigate([this.redirectPath], { relativeTo: this.route });
      });

    // モーダルサービスをセット
    this.modal.setModal(
      modalConst.TITLE.DELETE,
      modalConst.BODY.DELETE,
      'danger',
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );
  }
}
