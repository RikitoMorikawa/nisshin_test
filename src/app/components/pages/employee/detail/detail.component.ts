import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import {
  Employee,
  EmployeeApiResponse,
  employeeLogicalNamesForDisplay,
  employeeKeysForDisplay,
} from 'src/app/models/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import {
  FlashMessageService,
  FlashMessagePurpose,
} from 'src/app/services/flash-message.service';
import { modalConst } from 'src/app/const/modal.const';
import { generalConst } from 'src/app/const/general.const';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  // 購読を一元管理
  subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    public common: CommonService
  ) {}

  // 表示用論理名
  logicalNames = employeeLogicalNamesForDisplay;

  // 表示用社員のキー
  employeeKeys = employeeKeysForDisplay;

  // APIレスポンス
  employeeApiResponse$!: Observable<EmployeeApiResponse>;

  // 表示対象社員
  employee!: { [key: string]: string };

  // 取得する社員のid
  selectedId = 0;

  // プロフィール画像へのパス
  profileImagePath!: string | undefined;

  // 編集画面へ遷移するためのパス
  editPath!: string;

  // 登録者名
  createdEmployeeName!: string;

  // 登録者のロール
  createdByRoleTypeName!: string;

  // 最終更新者名
  lastUpdaterName!: string;

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // パスパラメータから社員のIDを取得して社員詳細取得APIを購読
    this.employeeApiResponse$ = this.route.paramMap.pipe(
      switchMap((params) => {
        this.selectedId = parseInt(params.get('id')!, 10);
        this.editPath = '/employee/edit/' + this.selectedId;
        return this.employeeService.find(this.selectedId);
      })
    );

    // 社員を取得
    this.getEmployee();
  }

  /**
   * APIでの社員詳細取得を購読
   * @returns void
   */
  getEmployee(): void {
    this.common.loading = true;
    this.subscription.add(
      this.employeeApiResponse$
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((apiResponse) => {
          this.common.loading = false;
          console.log(apiResponse);
          if (apiResponse instanceof HttpErrorResponse) {
            // 親コンポーネントへエラー内容を送信
            this.errorService.setError({
              status: apiResponse.status,
              title: '社員詳細：' + modalConst.TITLE.HAS_ERROR,
              message: apiResponse.error.message,
            });
          } else {
            if (apiResponse.data.length > 0) {
              // 社員詳細データは1件しか返ってこないので配列の最初のインデックスでEmployeeデータ取得
              const responseData = apiResponse.data[0];
              this.profileImagePath = responseData.image_path
                ? responseData.image_path
                : generalConst.NO_IMAGE_PATH;
              this.employee = this.employeeDataGeneration(responseData);
              this.lastUpdaterName = this.employee['updated_id'];
            }
          }
        })
    );
  }

  /**
   *
   * @param employee
   * @returns
   */
  employeeDataGeneration(employee: Employee): { [key: string]: string } {
    const displayData = {
      barcode: employee.barcode ? employee.barcode : '未登録',
      code: employee.code.toString(),
      store_id: employee.store_name ? employee.store_name : '未登録',
      role_id: employee.role_name ? employee.role_name : '未登録',
      role_name: employee.role_name ? employee.role_name : '未登録',
      last_name: employee.last_name,
      first_name: employee.first_name,
      last_name_kana: employee.last_name_kana,
      first_name_kana: employee.first_name_kana,
      mail: employee.mail,
      tel: employee.tel ? employee.tel : '未登録',
      max_discount_rate: employee.max_discount_rate
        ? employee.max_discount_rate.toString() + '%'
        : '未登録',
      status_division_id: employee.division_status_value
        ? employee.division_status_value.toString()
        : '未登録',
      last_login_at: employee.last_login_at
        ? new Date(employee.last_login_at).toLocaleString()
        : '未登録',
      created_at: employee.created_at
        ? new Date(employee.created_at).toLocaleString()
        : '未登録',
      created_id:
        employee.employee_created_last_name +
        ' ' +
        employee.employee_created_first_name,
      updated_at: employee.updated_at
        ? new Date(employee.updated_at).toLocaleString()
        : '未登録',
      updated_id:
        employee.employee_updated_last_name +
        ' ' +
        employee.employee_updated_first_name,
    };
    return displayData;
  }

  /**
   * 削除処理
   * @returns void
   */
  handleClickDelete(): void {
    // モーダルのタイトル
    const modalTitle = '社員' + modalConst.TITLE.DELETE;
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
            this.employeeService
              .remove(this.selectedId)
              .pipe(
                // エラー対応
                catchError((error: HttpErrorResponse) => {
                  // 空の値を返却
                  return of(error);
                }),
                finalize(() => (this.common.loading = false))
              )
              .subscribe((res) => {
                if (res instanceof HttpErrorResponse) {
                  // 親コンポーネントへエラーを送信
                  this.errorService.setError({
                    status: res.status,
                    title: modalTitle,
                    message: res.error.message,
                    redirectPath: '/employee/list',
                  });
                } else {
                  const flashMessagePurpose: FlashMessagePurpose = 'success';
                  this.flashMessageService.setFlashMessage(
                    res.message,
                    flashMessagePurpose,
                    15000
                  );
                  this.router.navigateByUrl('/employee/list');
                }
              });
          }
        })
    );
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
