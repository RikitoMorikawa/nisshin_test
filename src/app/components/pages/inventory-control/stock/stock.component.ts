import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent implements OnInit, OnDestroy {
  // 購読を一括管理
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
      // 絞り込みコンポーネントの変更を購読する
      this.parentSearchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        this.parentTableEvent.next(res);
      })
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    // サブジェクトへコンプリートを流す
    this.subscription.unsubscribe();
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param res エラーのレスポンス
   */
  handleError(res: HttpErrorResponse) {
    const title = res.error ? res.error.title : 'エラー';
    const message = res.error.message ? res.error.message : res.message;
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: res.status,
      title: title,
      message: message,
    });
  }
}
