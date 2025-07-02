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
import { MemberService } from 'src/app/services/member.service';
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
    private memberService: MemberService,
    private flashMessageService: FlashMessageService,
    private errorService: ErrorService,
    public common: CommonService
  ) {}

  // 購読を一元管理
  private subscription = new Subscription();

  // テンプレートダウンロード用
  template$!: Observable<string>;
  fileNamePrefix = '会員';

  // ログイン中ユーザー
  author!: Employee;

  // キャンセル用モーダルのタイトル
  cancelModalTitle = '会員一括登録キャンセル：' + modalConst.TITLE.CANCEL;

  // アップロード対象のファイル名
  fileName?: string;

  // 一覧へのパス
  listPath = '/member';

  // アップロード可能な最大ファイルサイズ
  exceededFileSizeLimit = generalConst.IMAGE_MAX_FILE_SIZE;

  // ファイル最大サイズ表示用
  maxFileSizeForDisplay = generalConst.IMAGE_MAX_FILE_SIZE_FOR_DISPLAY;

  // アップロードボタン活性化・非活性化制御フラグ
  isUploadable = false;

  // リアクティブフォームとバリデーションの設定
  formGroup = this.formBuilder.group({
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
      title: 'member_cd',
      description: '会員番号（10文字以内）',
      required: true,
    },
    {
      title: 'status_division_id',
      description:
        '会員ステータス区分ID（117：正常、118：停止中、119：退会済み）',
      required: true,
    },
    {
      title: 'point',
      description: 'ポイント保有数（半角数字256桁以内）',
    },
    {
      title: 'last_name',
      description: 'お名前（姓）（255文字以内）',
      required: true,
    },
    {
      title: 'first_name',
      description: 'お名前（名）（255文字以内）',
      required: true,
    },
    {
      title: 'last_name_kana',
      description: 'お名前（姓）カナ（255文字以内）',
    },
    {
      title: 'first_name_kana',
      description: 'お名前（名）カナ（255文字以内）',
    },
    {
      title: 'postal_code',
      description: '郵便番号（半角数字7桁 ハイフンなし））',
    },
    {
      title: 'province',
      description: '都道府県（4文字以内）',
    },
    {
      title: 'locality',
      description: '市区町村（20文字以内）',
    },
    {
      title: 'street_address',
      description: '町名番地（20文字以内）',
    },
    {
      title: 'other_address',
      description: '建物名など（20文字以内）',
    },
    {
      title: 'tel',
      description: '電話番号（半角数字16桁以内）',
    },
    {
      title: 'mail',
      description: 'メールアドレス（255文字以内）',
    },
    {
      title: 'remarks_1',
      description: '備考1（255文字以内）',
    },
    {
      title: 'remarks_2',
      description: '備考2（255文字以内）',
    },
    {
      title: 'identification_document_confirmation_date',
      description:
        '本人確認書類確認年月日（8文字以上64文字以内。例：2023/05/31）',
    },
  ];

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    // テンプレートダウンロード用のオブザーバブルを作成
    this.template$ = this.memberService
      .getCsv('template')
      .pipe(catchError(this.handleCatchError<string>('')));

    // 購読を格納
    this.subscription.add(
      // ファイルの FormControl の変更を購読
      this.formGroup.controls.file.valueChanges.subscribe((file) => {
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
            this.router.navigateByUrl(this.listPath);
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
      // const file: File = control.value;
      // // ファイルサイズが3Mより大きい場合はアップロードさせない
      // if (file?.size && file?.size > generalConst.IMAGE_MAX_FILE_SIZE) {
      //   // Form の upload_file の値を削除する
      //   this.formGroup.controls.file.setValue(null);
      //   // upload_fileのerrorsへエラーメッセージを設定
      //   return { limitFileSize: { errorMessage: this.exceededFileSizeLimit } };
      // }
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
      title: '会員一括登録エラー：' + modalConst.TITLE.HAS_ERROR,
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
      this.router.navigateByUrl(this.listPath);
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
      // 会員一括登録実行
      this.memberService
        .bulkAdd(this.formGroup.controls.file.value)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          // ローディング終了
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
            this.router.navigateByUrl(this.listPath);
          }
        })
    );
  }

  /**
   * ファイル削除アイコクリック対応
   * @returns void
   */
  handleClickDeleteIcon(): void {
    this.formGroup.controls.file.setValue(null);
  }

  /**
   * ファイル選択時に表示されるファイル名の更新処理
   * @param file 対象となるファイルの File オブジェクト
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
