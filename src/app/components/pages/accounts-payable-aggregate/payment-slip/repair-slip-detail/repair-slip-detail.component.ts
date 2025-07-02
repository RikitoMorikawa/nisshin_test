import {
  Component,
  OnDestroy,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  of,
  Subscription,
  take,
  Subject,
} from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { repairConst } from 'src/app/const/repair.const';
import { Repair } from 'src/app/models/repair';
import { RepairService } from 'src/app/services/repair.service';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService } from 'src/app/services/modal.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-repair-slip-detail',
  templateUrl: './repair-slip-detail.component.html',
  styleUrls: ['./repair-slip-detail.component.scss'],
})
export class RepairSlipDetailComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   * @param route
   * @param router
   * @param modalService
   * @param repairService
   * @param errorService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private errorService: ErrorService,
    private repairService: RepairService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 選択中id
  selectedId!: number;

  // 初期値のパス
  id = this.route.snapshot.params['id'];
  topPagePath = '/setting';
  listPagePath = `${this.topPagePath}/accounts-payable-aggregate/payment-slip`;
  slipListPagePath = this.listPagePath + '/' + this.id;

  // エラーモーダルのタイトル
  errorModalTitle = '支払伝票詳細：' + modalConst.TITLE.HAS_ERROR;

  // 修理定数
  repairConst = repairConst;
  repairs!: Repair[];

  // _params: TableWithPaginationParams = { total: 0, data: [] };
  counts = {
    start: 0,
    end: 0,
  };

  ngOnInit(): void {
    const selectedId = this.route.snapshot.params['repair_id'];
    this.common.loading = true;
    console.log('repair-slip-detail id: ', selectedId);
    this.subscription.add(
      forkJoin([this.repairService.find(selectedId)])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          console.log(res);
          if (res instanceof HttpErrorResponse) {
            const errorTitle: string = res.error
              ? res.error.title
              : 'エラーが発生しました。';
            this.handleError(res.status, errorTitle, this.listPagePath);
            return;
          }

          this.repairs = res[0].data;
        })
    );

    //console.log(this._pages);
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '支払伝票一覧：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントが破棄される時に実行
   */
  ngOnDestroy(): void {
    // 一元管理した購読を全て解除
    this.subscription.unsubscribe();
  }
}
