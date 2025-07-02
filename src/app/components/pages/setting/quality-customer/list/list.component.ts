import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  subscription = new Subscription();
  // 絞り込みコンポーネンから値をサブミットされたときにストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるsubjectをhtmlで子コンポーネントへストリームを流す
  parentTableEvent = new Subject<object>();
  /**
   * コンストラクタ
   * @param errorService
   */
  constructor(private errorService: ErrorService) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.subscription.add(
      this.parentSearchEvent.subscribe((res) => {
        this.parentTableEvent.next(res);
      })
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 子コンポーネントから送信されてくるエラーを処理
   * @param error
   */
  handleError(error: { status: number; title: string; message: string }) {
    this.errorService.setError({
      status: error.status,
      title: error.title,
      message: error.message,
    });
  }
}
