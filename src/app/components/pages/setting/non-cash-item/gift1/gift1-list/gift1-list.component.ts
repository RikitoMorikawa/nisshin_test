import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-gift1-list',
  templateUrl: './gift1-list.component.html',
  styleUrls: ['./gift1-list.component.scss'],
})
export class Gift1ListComponent implements OnInit, OnDestroy {
  // 購読を一括して保持
  subscription = new Subscription();
  // 絞り込みコンポーネントから値をサブミットされたときにストリームを流す
  parentSearchEvent = new Subject<object>();
  // テーブルの変更を購読させるsubjectをhtmlでコンポーネントへストリームとして流す
  parentTableEvent = new Subject<object>();

  /**
   * コンストラクタ
   * @param errorService
   */
  constructor(
    private errorService: ErrorService,
    public common: CommonService
  ) {}

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

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
