import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  of,
  finalize,
  Subscription,
  takeUntil,
} from 'rxjs';
import { InventoryApiResponse } from 'src/app/models/inventory';
import { InventoryService } from 'src/app/services/inventory.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit, OnDestroy {
  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  private subscription = new Subscription();

  terms?: object;
  subject = new Subject<object>();
  inventory$!: Observable<any>;
  // loading = false;

  // 管理コードでグループ化された一覧ページへのパス
  listPagePath = '/inventory-control/inventory';

  // 一括登録ページへのパス
  bulkRegistrationPagePath!: string;

  // 棚卸管理コード
  managementCd!: string;

  // 棚卸完了フラグ
  isInventoryCompleted!: boolean;

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // パスパラメータからidを取得
    const managementCd = this.route.snapshot.params['management_cd'];
    const managementCdIsInvalid = isParameterInvalid(managementCd);
    // エラーならモーダルを表示
    if (managementCdIsInvalid) {
      this.handleError({
        status: 400,
        title: 'エラー',
        message: 'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        redirectPath: this.listPagePath,
      });
      return;
    }
    // 取得したパスパラメータをメンバへセット
    this.managementCd = managementCd;
    this.bulkRegistrationPagePath = `/inventory-control/inventory/bulk-add/${this.managementCd}`;

    this.changeTerms({});

    this.subscription.add(
      // テーブルコンポーネントの変更を購読する
      this.inventoryService.inventoryUpdateEvent$.subscribe((res) => {
        // テーブルコンポーネントからストリームが流れてきたら入金データを取得する
        this.updateInventoryStockQuantity(res);
      })
    );
    this.inventoryService
      .getGroupAll({ management_cd: this.managementCd })
      .subscribe((res) => {
        res.data[0].inventory_complete_date === ''
          ? (this.isInventoryCompleted = false)
          : (this.isInventoryCompleted = true);
      });
  }

  /**
   * 実在庫更新時に呼ばれる
   * @param values
   */
  private updateInventoryStockQuantity(values: InventoryApiResponse) {
    this.common.loading = true;
    this.subscription.add(
      this.inventoryService
        .update(values)
        .pipe(
          catchError((res: HttpErrorResponse) => {
            return of(res);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました';
            this.handleError({
              status: res.status,
              title: title,
              message: message,
              redirectPath: this.listPagePath,
            });
            return;
          }
          //ここで再読み込みをしないと、理論在庫数は0が取得される（management_cdの絞り込みが解除されているらしい）
          // 参考：https://cioc.cloud.redmine.jp/issues/7691?issue_count=12&issue_position=1&next_issue_id=7459
          location.reload();
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.subject.next({});
        })
    );
  }

  handleClickCompleteButton() {
    this.common.loading = true;

    this.isInventoryCompleted = true;
    this.subscription.add(
      this.inventoryService
        .complete(this.managementCd)
        .pipe(
          catchError((res: HttpErrorResponse) => {
            return of(res);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'エラーが発生しました';
            this.handleError({
              status: res.status,
              title: title,
              message: message,
              redirectPath: this.listPagePath,
            });
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.subject.next({});
        })
    );
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    // サブジェクトへコンプリートを流す
    this.subject.complete();
    this.subscription.unsubscribe();
  }

  /**
   * 絞り込み条件変更時に実行される処理
   * @param terms 絞り込み条件のオブジェクト
   */
  changeTerms(terms: object) {
    console.log(terms);
    const params = { ...{ management_cd: this.managementCd }, ...terms };
    this.terms = params;
    this.subject.next(params);

    this.inventory$ = this.inventoryService.getPdf(params, 'pdf').pipe(
      catchError((err: HttpErrorResponse) => {
        const title = err.error ? err.error.title : 'エラー';
        const message = err.error ? err.error.message : 'エラーが発生しました';
        this.handleError({
          status: err.status,
          title: title,
          message: message,
          redirectPath: this.listPagePath,
        });
        return of({} as any);
      })
    );
  }

  /**
   * 子コンポーネントから送信されてくるエラーに対応
   * @param res
   */
  handleError(res: {
    status: number;
    title: string;
    message: string;
    redirectPath?: string;
  }) {
    // エラーサービスへストリームを流す
    this.errorService.setError({
      status: res.status,
      title: res.title,
      message: res.message,
      redirectPath: res.redirectPath ? res.redirectPath : undefined,
    });
  }
}
