import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, filter, of, Subscription, take } from 'rxjs';
import {
  Role,
  roleKeysForDisplay,
  roleLogicalNamesForDisplay,
} from 'src/app/models/role';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleService } from 'src/app/services/role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/shared/error.service';
import { errorConst } from 'src/app/const/error.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    public common: CommonService
  ) {}

  selectedId!: number;

  // 表示用論理名
  logicalNames = roleLogicalNamesForDisplay;

  last_update_user?: string;

  // 表示用社員のキー
  roleKeys = roleKeysForDisplay;

  // 購読を一元管理
  subscription = new Subscription();

  // 表示対象権限
  role!: { [key: string]: string };

  // エラーモーダルのタイトル
  errorModalTitle = '権限詳細：' + modalConst.TITLE.HAS_ERROR;

  // 編集画面へのパスを保持
  editPath!: string;

  // 権限一覧のパス
  roleListPath = '/setting/role';

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          ) // 権限詳細エラーのモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.roleListPath);
          }
        })
    );

    // ローディング開始
    this.common.loading = true;
    // パスパラメータからidを取得
    const selectedId = this.route.snapshot.paramMap.get('id');

    if (selectedId === null) {
      // パスパラメータ取得エラー 一覧へ戻す
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    } else if (isNaN(Number(selectedId))) {
      // number型へのキャストエラー 一覧へ戻す
      // パスパラメータ取得エラー 一覧へ戻す
      const purpose: ModalPurpose = 'danger';
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }

    this.selectedId = Number(selectedId);
    this.editPath = '/setting/role/edit/' + this.selectedId;

    // 購読を格納
    this.subscription.add(
      // 権限情報を取得
      this.roleService
        .find(this.selectedId)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          // ローディング終了
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            // レスポンスがエラーの場合
            this.handleError(res.status, res.error.message);
            return;
          }

          // 安全に配列アクセスするためにdataの中身を確認
          const roleResInvalid = ApiResponseIsInvalid(res);

          if (roleResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          const displayData = res.data[0];
          this.role = this.storeDataGeneration(displayData);
          this.last_update_user = this.role['updated_id'];
        })
    );
  }

  /**
   * APIで取得したデータを表示用にマッピング
   * @param role
   * @returns displayData { [key: string]: string }
   */
  storeDataGeneration(role: Role) {
    const displayData = {
      name: role.name,
      description: role.description ? role.description : '未登録',
      created_at: role.created_at
        ? new Date(role.created_at).toLocaleString()
        : '未登録',
      created_id:
        role.employee_created_last_name && role.employee_created_first_name
          ? role.employee_created_last_name +
            ' ' +
            role.employee_created_first_name
          : '未登録',
      updated_at: role.updated_at
        ? new Date(role.updated_at).toLocaleString()
        : '未登録',
      updated_id:
        role.employee_updated_last_name && role.employee_updated_first_name
          ? role.employee_updated_last_name +
            ' ' +
            role.employee_updated_first_name
          : '未登録',
    };
    return displayData;
  }

  /**
   * 削除処理
   * @returns void
   */
  handleClickDelete() {
    // モーダルのタイトル
    const modalTitle = '権限：' + modalConst.TITLE.DELETE;
    // モーダルのタイプ ModalPurpose型
    const modalPurposeDanger: ModalPurpose = 'danger';

    // 削除確認モーダル呼び出し
    this.modalService.setModal(
      modalTitle,
      modalConst.BODY.DELETE,
      modalPurposeDanger,
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );

    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1), // 1回のみ実行
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          ) // 実行確認のモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // ローディング開始
            this.common.loading = true;
            // 削除処理を購読
            this.roleService
              .remove(this.selectedId)
              .pipe(
                // エラー対応
                catchError((error: HttpErrorResponse) => {
                  // 空の値を返却
                  return of(error);
                })
              )
              .subscribe((res) => {
                // ローディング終了
                this.common.loading = false;
                if (res instanceof HttpErrorResponse) {
                  // 親コンポーネントへエラーを送信
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: res.error.message,
                    redirectPath: this.roleListPath,
                  });
                } else {
                  const flashMessagePurpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    flashMessagePurpose,
                    15000
                  );
                  this.router.navigateByUrl(this.roleListPath);
                }
              });
          }
        })
    );
  }

  /**
   * エラー処理
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    // エラー対応
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '権限詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.roleListPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を破棄
    this.subscription.unsubscribe();
  }
}
