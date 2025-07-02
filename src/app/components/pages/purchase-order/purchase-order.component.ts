import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
})
export class PurchaseOrderComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param modalService
   * @param errorService
   * @param router
   */
  constructor(
    private modalService: ModalService,
    private errorService: ErrorService,
    private router: Router,
    private common: CommonService
  ) {}

  // 購読を管理するための変数
  private subscription = new Subscription();

  // リダイレクト希望の場合のパス
  private redirectPath?: string;

  // ローディング表示を管理
  isLoading = false;

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // 子コンポーネントから流れてくるエラーストリームを購読
    this.subscription.add(
      this.errorService.getError().subscribe((res) => {
        this.handleError(res);
      })
    );
    // ローディング状況を購読
    this.subscription.add(
      this.common.loading$.subscribe((x) => {
        setTimeout(() => (this.isLoading = x));
      })
    );
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 子コンポーネントから流れてくるエラーストリームを処理する
   * @param error
   */
  handleError(error: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    // モーダルのタイプをModalPurpose型から選択させる
    const modalPurpose: ModalPurpose = 'danger';

    // リダイレクト希望の場合は保持しておく
    if (error.redirectPath) {
      this.redirectPath = error.redirectPath;
    }

    // statusで処理を分岐
    if (error.status === 0) {
      // クライアント側あるいはネットワークによるエラー
      // モーダル表示
      this.modalService.setModal(
        error.title,
        error.message + errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    } else {
      // サーバー側から返却されるエラー
      // モーダル表示
      this.modalService.setModal(
        error.title,
        `ステータスコード: ${error.status} \nメッセージ: ` +
          error.message +
          errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    }

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === error.title
          ) // モーダルのタイトルがエラーのタイトル以外は実行しない
        )
        .subscribe((_) => {
          // リダイレクト希望があれば移動する
          if (this.redirectPath) this.router.navigateByUrl(this.redirectPath);
        })
    );
  }
}
