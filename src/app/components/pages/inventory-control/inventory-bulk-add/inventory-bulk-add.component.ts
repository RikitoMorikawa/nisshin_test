import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, finalize, of } from 'rxjs';
import { isParameterInvalid } from 'src/app/functions/shared-functions';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ErrorService } from 'src/app/services/shared/error.service';

@Component({
  selector: 'app-inventory-bulk-add',
  templateUrl: './inventory-bulk-add.component.html',
  styleUrls: ['./inventory-bulk-add.component.scss'],
})
export class InventoryBulkAddComponent implements OnInit, OnDestroy {
  constructor(
    private inventoryService: InventoryService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    private router: Router,
    private route: ActivatedRoute,
    private common: CommonService
  ) {}

  private subscription = new Subscription();

  managementCd!: string;

  listPagePath!: string;

  // フォームコントロール周りの変数
  ctrl = new FormControl<File | null>(null, Validators.required);
  filename?: string;

  // 説明文
  descriptions = [
    {
      title: 'id',
      description: '棚卸ID（半角数字）',
      required: true,
    },
    {
      title: 'management_cd',
      description: '棚卸管理コード（10文字以内の文字列）',
      required: true,
    },
    {
      title: 'inventory_stock_quantity',
      description: '棚卸在庫数（半角数字）',
      required: true,
    },
  ];

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
    this.listPagePath = `/inventory-control/inventory/${this.managementCd}`;
    // ファイルの変更を購読
    this.subscription?.add(
      this.ctrl.valueChanges.subscribe((x) => {
        this.filename = x?.name;
      })
    );
  }

  /**
   * キャンセルクリック時の処理
   */
  handleClickCancel() {
    this.router.navigateByUrl(this.listPagePath);
  }

  /**
   * アップロードボタンクリック時の処理
   */
  onClickUpload() {
    // value が空なら何もしない（念のため）
    if (!this.ctrl.value) {
      return;
    }
    this.common.loading = true;
    this.subscription.add(
      // APIコール
      this.inventoryService
        .bulkAdd(this.ctrl.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const title = res.error.title ? res.error.title : 'エラー';
            const message = res.error.message
              ? res.error.message
              : 'エラーが発生しました';
            this.handleError({
              status: res.status,
              title: title,
              message: message,
            });
            return;
          }
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          this.router.navigateByUrl(this.listPagePath);
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
