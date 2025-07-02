import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, Observable, filter, Subscription } from 'rxjs';
import {
  ApiResponse,
  ExportStatus,
} from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { modalConst, templateModalString } from 'src/app/const/modal.const';
/**
 * APIサービスの型
 */
type ApiService = {
  add<T>(params: Partial<T>): Observable<ApiResponse>;
  update<T>(id: number, params: Partial<T>): Observable<ApiResponse>;
  handleErrorModal(): (err: HttpErrorResponse) => Observable<ApiResponse>;
};

/**
 * ステータスコード
 */
export const ApiCallStatus = { ...ExportStatus } as const;
export type ApiCallStatus = (typeof ApiCallStatus)[keyof typeof ApiCallStatus];

interface OBJECT {
  [key: string]: string;
}

/**
 * 編集画面テンプレートコンポーネント
 */
@Component({
  selector: 'app-template-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit {
  // 各種パラメータ
  @Input() service!: ApiService;
  @Input() formCtrl!: FormGroup;
  @Input() modFn = () => {
    return { ...this.formCtrl.value };
  };
  @Input() modFn2 = () => {
    return { ...this.formCtrl };
  };

  @Output() statusChange = new EventEmitter<ApiCallStatus>();

  //子コンポーネントから変数取得がまだできないので不本意だけど回避策
  pagenNameList: OBJECT = {
    client: templateModalString.CLIENT,
    product: templateModalString.PRODUCT,
    supplier: templateModalString.SUPPPLIER,
    'client-working-field': templateModalString.CLIENT_WORKING_FIELD,
  };

  id = this.route.snapshot.params['id'];
  url = this.router.url;
  detailUrl = this.url.replace('edit', 'detail');
  listlUrl = this.url.replace('/add', '');

  prevUrl = this.id ? `${this.detailUrl}` : '../';

  strsplit = this.url.split('/');
  pageName = this.strsplit[2];

  isPristine: boolean = false;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle =
    this.pagenNameList[this.pageName] +
    '更新キャンセル：' +
    modalConst.TITLE.CANCEL;

  detailPagePath: string = this.prevUrl;
  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flash: FlashMessageService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    if (!this.id) {
      console.log(this.listlUrl);
      this.detailPagePath = this.listlUrl;
      return;
    }
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
  }
  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }

  /**
   * 保存ボタン押下時の処理。
   */
  onClickSave() {
    const data = this.modFn();

    let observable$ = this.service.add(data);
    let response = '作成しました';
    let message = '正常に登録されました。';

    // 編集なら各種変数を書き換える
    if (this.id) {
      observable$ = this.service.update(this.id, data);
      response = '更新しました';
      message = '正常に更新されました。';
    }

    // APIコール
    this.statusChange.emit(ApiCallStatus.START);
    observable$
      .pipe(
        catchError(this.service.handleErrorModal()),
        finalize(() => this.statusChange.emit(ApiCallStatus.END))
      )
      .subscribe((x) => {
        if (x.message === response) {
          this.showSuccessMessage(message);
        }
        this.router.navigate([this.prevUrl], { relativeTo: this.route });
      });
  }

  /**
   * 成功のフラッシュメッセージを表示する。
   * @param message 表示するメッセージ。
   */
  private showSuccessMessage(message: string) {
    this.flash.setFlashMessage(message, 'success', 15000);
  }

  /**
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel() {
    // 入力があった場合はモーダルを表示
    const formdata = this.modFn2();
    if (!formdata.pristine) {
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
