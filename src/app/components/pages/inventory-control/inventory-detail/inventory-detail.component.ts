import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, catchError, finalize, of } from 'rxjs';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import { Inventory } from 'src/app/models/inventory';
import { InventoryService } from 'src/app/services/inventory.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.component.html',
  styleUrls: ['./inventory-detail.component.scss'],
})
export class InventoryDetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private inventoryService: InventoryService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  subscription = new Subscription();

  // 棚卸管理コード
  managementCd!: string;

  // 選択中id
  selectedId!: number;

  // 管理コード別一覧のパス
  listPagePath!: string;
  listPageName!: string;

  // 最終更新者フルネーム
  lastUpdaterName!: string;

  inventory!: Inventory;

  ngOnInit(): void {
    // パスパラメータからidを取得
    const managementCd = this.route.snapshot.params['management_cd'];
    const managementCdIsInvalid = isParameterInvalid(managementCd);
    const selectedId = this.route.snapshot.params['id'];
    const selectedIdIsInvalid = isParameterInvalid(selectedId);
    // エラーならモーダルを表示
    if (selectedIdIsInvalid || managementCdIsInvalid) {
      this.handleError(
        400,
        'エラー',
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        '/inventory-control'
      );
      return;
    }
    // 取得したパスパラメータをメンバへセット
    this.managementCd = managementCd;
    this.selectedId = Number(selectedId);
    // 管理コード別一覧のパスをメンバへセット
    this.listPagePath = '/inventory-control/inventory/' + this.managementCd;
    // 管理コード別一覧のページ名をメンバへセット
    this.listPageName =
      '棚卸管理コード：' + this.managementCd + ' ' + 'データ一覧';
    // 棚卸詳細データを取得
    this.getInventory(this.selectedId);
  }

  /**
   * 棚卸詳細データを取得
   * @param id
   */
  getInventory(id: number) {
    // データ取得中フラグをtrueへ
    this.common.loading = true;
    // 購読を追加
    this.subscription.add(
      this.inventoryService
        .find(id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error ? res.error.title : 'エラー';
            const message = res.error
              ? res.error.message
              : 'データ取得エラーが発生しました。一覧画面へ戻ります。';
            this.handleError(res.status, title, message, this.listPagePath);
            return;
          }
          this.inventory = res.data[0];
          const lastName = res.data[0].employee_updated_last_name;
          const firstName = res.data[0].employee_updated_first_name;
          this.lastUpdaterName = lastName + ' ' + firstName;
        })
    );
  }

  /**
   *
   * @param status
   * @param title
   * @param message
   * @param redirectPath
   */
  handleError(
    status: number,
    title: string,
    message: string,
    redirectPath?: string
  ) {
    // エラーをセット
    this.errorService.setError({
      status,
      title,
      message,
      redirectPath,
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
