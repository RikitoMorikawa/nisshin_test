import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter, Subscription, take } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-quality-customer',
  templateUrl: './quality-customer.component.html',
  styleUrls: ['./quality-customer.component.scss'],
})
export class QualityCustomerComponent implements OnInit, OnDestroy {
  // Subjectで流れてきた値を格納
  private subscription = new Subscription();
  // リダイレクト希望の場合のパスを格納
  private redirectPath?: string;

  /**
   * コンストラクター
   * @param errorService
   * @param modalService
   * @param router
   */
  constructor(
    private errorService: ErrorService,
    private modalService: ModalService,
    private router: Router,
    private common: CommonService
  ) {}
  // ローディング表示を管理
  isLoading = false;
  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // コンポーネントから流されるエラーストリームを購読
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
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * コンポーネントから流れてくるエラーストリームを処理
   * @param error
   */
  handleError(error: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    const modalPurpose: ModalPurpose = 'danger';

    // リダイレクトの場合は保持
    if (error.redirectPath) {
      this.redirectPath = error.redirectPath;
    }

    if (error.status === 0) {
      // クライアント側またはネットワークによるエラーの場合
      this.modalService.setModal(
        error.title,
        error.message + errorConst.GUIDANCE_OF_SUPPORT,
        modalPurpose,
        modalConst.BUTTON_TITLE.CLOSE,
        ''
      );
    } else {
      // サーバ側から返却されるエラーの場合
      this.modalService.setModal(
        error.title,
        `ステータスコード：${error.status} \nメッセージ：` +
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
          take(1),
          filter(
            // 実行確認のモーダルのみ取得
            (_) => this.modalService.getModalProperties().title === error.title
          )
        )
        .subscribe((_) => {
          if (this.redirectPath) this.router.navigateByUrl(this.redirectPath);
        })
    );
  }
}
