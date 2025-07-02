import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  catchError,
  filter,
  finalize,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { AuthorService } from 'src/app/services/author.service';
import { generalConst } from 'src/app/const/general.const';
import { HttpErrorResponse } from '@angular/common/http';
import { Employee } from 'src/app/models/employee';
import { ModalPurpose } from 'src/app/services/modal.service';
import { ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { Router } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import {
  FlashMessagePurpose,
  FlashMessageService,
} from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { ApiCallStatus } from '../../master/template/add-edit/add-edit.component';

@Component({
  selector: 'app-bulk-add',
  templateUrl: './bulk-add.component.html',
  styleUrls: ['./bulk-add.component.scss'],
})
export class BulkAddComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private authorService: AuthorService,
    private modalService: ModalService,
    private router: Router,
    private employeeService: EmployeeService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    private common: CommonService
  ) {}

  // 購読を一元管理
  private subscription = new Subscription();

  // テンプレートダウンロード用
  template$!: Observable<string>;
  fileNamePrefix = '社員';

  // ログイン中ユーザー
  author!: Employee;

  // キャンセル用モーダルのタイトル
  cancelModalTitle = '社員一括登録キャンセル：' + modalConst.TITLE.CANCEL;

  // アップロード対象のファイル名
  fileName?: string;

  // アップロード可能な最大ファイルサイズ
  exceededFileSizeLimit = generalConst.IMAGE_MAX_FILE_SIZE;

  // ファイル最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // アップロードボタン活性化・非活性化制御フラグ
  isUploadable = false;

  // リアクティブフォームとバリデーションの設定
  employeeBulkAddForm = this.formBuilder.group({
    file: [null, [this.limitFileSizeValidator()]],
  });

  // CSVファイルの説明文
  descriptions = [
    {
      title: 'id',
      description:
        '識別番号 (半角数字、未記入で新規登録、更新時は番号はそのまま)',
    },
    {
      title: 'status_division_id',
      description: '表示区分（7：通常、8：停止中、9：退職者）',
      required: true,
    },
    {
      title: 'role_id',
      description:
        '権限（1：admin - 全ての操作権限保有者、3：管理者 - 基幹システム全操作可能、4：一般ユーザー - 日常業務）',
      required: true,
    },
    {
      title: 'store_id',
      description: '所属店舗（1：楽働館、2：名護店、3：店舗3、5：中部店）',
      required: true,
    },
    {
      title: 'code',
      description: '社員コード（半角数字4文字以内）', // addのformバリデーション設定
      required: true,
    },
    {
      title: 'last_name',
      description: '社員 姓（10文字以内）',
      required: true,
    },
    {
      title: 'first_name',
      description: '社員 名（10文字以内）',
      required: true,
    },
    {
      title: 'last_name_kana',
      description: '社員 セイ（全角カタカナ7文字以内）',
      required: true,
    },
    {
      title: 'first_name_kana',
      description: '社員 メイ（全角カタカナ7文字以内）',
      required: true,
    },
    {
      title: 'mail',
      description: 'メールアドレス（255文字以内）',
      required: true,
    },
    {
      title: 'tel',
      description: '電話番号（半角数字10~14文字）',
    },
    {
      title: 'password',
      description:
        'ログインパスワード（半角英数8~24文字（大文字・小文字・数字をそれぞれ1文字ずつ含む））',
      required: true,
    },
    {
      title: 'pos_password',
      description: 'POS用パスワード（半角数字4~7文字）',
    },
    {
      title: 'barcode',
      description: '社員バーコード（半角数字4桁以内）', // addのformバリデーション設定
    },
    {
      title: 'max_discount_rate',
      description: '最大割引率（半角数字）',
    },
  ];

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // テンプレートダウンロード用のオブザーバブルを作成
    this.template$ = this.employeeService
      .getCsv('template')
      .pipe(catchError(this.handleCatchError<string>('')));

    // 購読を格納
    this.subscription.add(
      // 画像の FormControl の変更を購読
      this.employeeBulkAddForm.controls.file.valueChanges.subscribe((file) => {
        this.updatePreviewElements(file);
      })
    );
    if (this.authorService.author) {
      this.author = this.authorService.author;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーを取得
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }
    // 購読を格納
    this.subscription.add(
      // キャンセルのモーダルを購読
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // キャンセルのモーダルじゃなければスルー
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl('/employee/list');
          }
        })
    );
  }

  /**
   * ファイルサイズバリデーション
   * 最大ファイルサイズ：maxFileSizeで指定
   * @returns { upload_file: { value: null } } | null
   */
  limitFileSizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file: File = control.value;
      // ファイルサイズが3Mより大きい場合はアップロードさせない
      if (file?.size && file?.size > generalConst.IMAGE_MAX_FILE_SIZE) {
        // employeeAddForm upload_file"の値を削除する
        this.employeeBulkAddForm.controls.file.setValue(null);
        // upload_fileのerrorsへエラーメッセージを設定
        return { limitFileSize: { errorMessage: this.exceededFileSizeLimit } };
      }
      return null;
    };
  }

  /**
   * TODO: テンプレートダウンロード用エラー対応、親コンポーネントへ渡す処理があるので統合するなどリファクタリングが必要
   * @param result
   * @returns
   */
  private handleCatchError<T>(result?: T) {
    return (err: HttpErrorResponse) => {
      console.error(err);
      return of(result as T);
    };
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string): void {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '社員一括登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel(): void {
    // 入力があった場合はモーダルを表示
    if (this.isUploadable) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl('/employee/list');
    }
  }

  /**
   * ファイルアップロード
   * @returns void
   */
  handleClickUploadButton(): void {
    // ボタンを非活性
    this.isUploadable = false;
    // ローディング開始
    this.common.loading = true;

    // 購読を格納
    this.subscription.add(
      // 社員一括登録実行
      this.employeeService
        .bulkAdd(this.employeeBulkAddForm.controls.file.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          this.common.loading = false;
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
          } else {
            const purpose: FlashMessagePurpose = 'success';
            this.flashMessageService.setFlashMessage(
              res.message,
              purpose,
              15000
            );
            this.router.navigateByUrl('/employee/list');
          }
        })
    );
  }

  /**
   * ファイル削除アイコクリック対応
   * @returns void
   */
  handleClickDeleteIcon(): void {
    this.employeeBulkAddForm.controls.file.setValue(null);
  }

  /**
   * 画像選択時に表示されるプレビュー画像の更新処理
   * @param file 対象となる画像ファイルの File オブジェクト
   * @returns void
   */
  private updatePreviewElements(file: File | null): void {
    if (file) {
      this.fileName = file.name;
      this.isUploadable = true;
    } else {
      this.fileName = undefined;
      this.isUploadable = false;
    }
  }

  /**
   * 一括登録のステータス変更に応じた処理
   * @param status モジュールからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    if (status === ApiCallStatus.START) {
      this.common.loading = true;
    }
    if (status === ApiCallStatus.END) {
      this.common.loading = false;
    }
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を解除
    this.subscription.unsubscribe();
  }
}
