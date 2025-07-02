import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  constructor(
    private errorService: ErrorService,
    private route: ActivatedRoute
  ) {}

  subscription = new Subscription();

  // 絞り込みコンポーネントから値をサブミットされた時にストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるSubjectをhtmlで子コンポーネントへストリームを流す
  parentTableEvent = new Subject<object>();

  // クエリパラメータで渡ってくる大分類を取得
  selectedLcId?: number;
  selectedLcName?: string;

  ngOnInit(): void {
    this.subscription.add(
      // 絞り込みコンポーネントの変更を購読する
      this.parentSearchEvent.subscribe((res) => {
        // 絞り込みコンポーネントからストリームが流れてきたらテーブルコンポーネントへ値をストリームで流す
        this.parentTableEvent.next(res);
      })
    );

    // クエリパラメータがあれば取得する
    const params = this.route.snapshot.queryParams;
    if (params['id'] && params['name']) {
      this.selectedLcId = params['id'];
      this.selectedLcName = params['name'];
    }
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読解除
    this.subscription.unsubscribe();
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param error
   */
  handleError(error: { status: number; title: string; message: string }) {
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: error.status,
      title: error.title,
      message: error.message,
    });
  }
}
