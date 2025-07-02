import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, Subscription, take } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
})
export class MemberComponent implements OnInit, OnDestroy {
  constructor(
    private errorService: ErrorService,
    private modalService: ModalService,
    private router: Router,
    private common: CommonService
  ) {}

  // Subjectで流れてきた値を取得する
  private subscription = new Subscription();

  // リダイレクト希望の場合のパス
  private redirectPath?: string;

  // ローディング状態を格納
  isLoading = false;

  ngOnInit(): void {
    // 子コンポーネントから流されるエラーストリームを購読
    this.subscription.add(
      this.errorService.getError().subscribe((res) => {
        this.handleError(res);
      })
    );
    // ローディング状態を購読
    this.subscription.add(
      this.common.loading$.subscribe((x) => {
        // Angular のライフサイクルに逆行する(警告が出る)ため非同期化
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
          ) // 実行確認のモーダルじゃなければスルー
        )
        .subscribe((_) => {
          // リダイレクト希望があれば移動する
          if (this.redirectPath) this.router.navigateByUrl(this.redirectPath);
        })
    );
  }
}
