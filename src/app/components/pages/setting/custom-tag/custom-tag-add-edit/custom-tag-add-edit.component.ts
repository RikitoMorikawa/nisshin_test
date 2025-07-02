import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, finalize, filter } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { CustomTagApiResponse } from 'src/app/models/custom-tag';
import { AuthorService } from 'src/app/services/author.service';
import { CustomTagService } from 'src/app/services/custom-tag.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { CustomTagCommonService } from '../custom-tag-common.service';
import { Employee } from 'src/app/models/employee';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-custom-tag-add-edit',
  templateUrl: './custom-tag-add-edit.component.html',
  styleUrls: ['./custom-tag-add-edit.component.scss'],
})
export class CustomTagAddEditComponent implements OnInit, OnDestroy {
  // 各種変数
  id = this.route.snapshot.params['id'];
  title = this.id ? 'カスタムタグ編集' : 'カスタムタグ新規登録';
  editor?: string;
  prevUrl = '/setting/custom-tag' + (this.id ? `/detail/${this.id}` : '');
  private subscription = new Subscription();

  // キャンセル時のモーダルのタイトル
  cancelModalTitle =
    'カスタムタグ詳細編集キャンセル：' + modalConst.TITLE.CANCEL;
  // 詳細画面のパス
  detailPagePath = this.prevUrl;

  // フォーム周りの変数
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    value: ['', [Validators.required, Validators.maxLength(255)]],
  });

  get ctrls() {
    return this.form.controls;
  }

  // 各種定数（テンプレートからの参照用）
  errorConst = errorConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cucommon: CustomTagCommonService,
    private service: CustomTagService,
    private author: AuthorService,
    private flash: FlashMessageService,
    private modalService: ModalService,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    if (!this.id) {
      // 新規なら登録者情報を取得
      if (this.author.author) {
        this.setEditorInfo(this.author.author);
      } else {
        this.subscription.add(
          this.author.author$.subscribe((author) => {
            this.setEditorInfo(author);
          })
        );
      }
      return;
    }
    this.common.loading = true;

    // キャンセルのモーダルを購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          )
        )
        .subscribe((res) => {
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.detailPagePath);
          }
        })
    );

    this.service
      .find(this.id)
      .pipe(
        catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const field = res.data[0];
        this.ctrls.name.patchValue(`${field.name}`);
        this.ctrls.value.patchValue(`${field.value}`);
        // 最終更新者をセット
        if (field.employee_updated_last_name) {
          this.editor = `${field.employee_updated_last_name} ${field.employee_updated_first_name}`;
        }
      });
  }

  /**
   * 登録者（ログインユーザー）情報の設定処理
   * @param author
   */
  setEditorInfo(author: Employee) {
    const authorInfo = author;
    this.editor = authorInfo.last_name + ' ' + authorInfo.first_name;
  }
  /**
   * FormControl の不正判定
   * @param ctrl 対象となる FormControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 保存ボタン押下時の処理。
   */
  onClickSave() {
    const value = { ...this.form.value };
    if (this.id) {
      this.update(value);
    } else {
      this.create(value);
    }
  }

  /**
   * APIの登録処理を叩き、正常終了後に一覧画面へ遷移させる。
   * @param params APIへ送信するオブジェクト。
   */
  private create(params: object) {
    this.common.loading = true;
    this.service
      .add(params)
      .pipe(
        catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '作成しました') {
          this.cucommon.showSuccessMessage(
            'カスタムタグ情報が正常に登録されました。'
          );
          this.router.navigateByUrl(this.prevUrl);
        }
      });
  }

  /**
   * APIの更新処理を叩き、正常終了後に詳細画面へ遷移させる。
   * @param params APIへ送信するオブジェクト。
   */
  private update(params: object) {
    this.common.loading = true;
    this.service
      .update(this.id, params)
      .pipe(
        catchError(this.service.handleErrorModal<CustomTagApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '更新しました') {
          this.cucommon.showSuccessMessage(
            'カスタムタグ情報が正常に更新されました。'
          );
        }
        this.router.navigateByUrl(this.prevUrl);
      });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel() {
    // 入力があった場合はモーダルを表示
    if (!this.form.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPagePath);
    }
  }
}
