import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  constructor(private errorService: ErrorService) {}

  // 設定一覧のパス
  settingMenuPath = '/setting';

  // 購読を管理するSubscription
  private subscription = new Subscription();

  // 絞り込みのSubject
  searchEvent = new Subject<object>();
  // テーブルのSubject
  tableEvent = new Subject<object>();

  // データ取得中かどうか
  isDuringAcquisition = false;

  ngOnInit(): void {
    this.subscription.add(
      // 絞り込みコンポーネントの変更を購読する
      this.searchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        this.tableEvent.next(res);
      })
    );
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param error
   */
  handleError(
    error: {
      status: number;
      title?: string;
      message?: string;
    },
    redirectPath?: string
  ) {
    const title = error.title ? error.title : 'エラー';
    const message = error.message ? error.message : 'エラーが発生しました。';
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: error.status,
      title: title,
      message: message,
      redirectPath: redirectPath ? redirectPath : undefined,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
