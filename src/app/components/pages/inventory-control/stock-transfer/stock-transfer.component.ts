import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-stock-transfer',
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss'],
})
export class StockTransferComponent implements OnInit, OnDestroy {
  // 購読を管理
  private subscription = new Subscription();
  // 絞り込みコンポーネントから値をサブミットされた時にストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるSubjectをhtmlで子コンポーネントへストリームを流す
  parentTableEvent = new Subject<object>();

  /**
   * コンストラクタ
   */
  constructor(private errorService: ErrorService) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.subscription.add(
      this.parentSearchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        this.parentTableEvent.next(res);
      })
    );
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param res
   */
  handleError(error: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: error.status,
      title: error.title,
      message: error.message,
      redirectPath: error.redirectPath ? error.redirectPath : undefined,
    });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
