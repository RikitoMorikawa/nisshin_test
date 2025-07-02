import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, finalize, Subscription, filter, take } from 'rxjs';
import { modalConst } from 'src/app/const/modal.const';
import { memberLogicalNameForDisplay, Member } from 'src/app/models/member';
import { MemberService } from 'src/app/services/member.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { ModalService } from 'src/app/services/modal.service';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { errorConst } from 'src/app/const/error.const';
import { CommonService } from 'src/app/services/shared/common.service';

// リストで表示する項目の要素
type elementsOfItem = {
  name: string;
  value?: string;
  prop_name?: keyof Member;
};

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  // 購読を一元的に管理
  subscription = new Subscription();
  // 選択された会員ID
  memberId!: number;
  // 会員一覧のパス
  memberListPath = '/member';
  // 会員編集のルートパス
  memberEditRootPath = '/member/edit/';
  // 会員編集のパス
  memberEditPath!: string;
  // エラーモーダルのタイトル
  errorModalTitle = '会員詳細：' + modalConst.TITLE.HAS_ERROR;
  // 最終更新者フルネーム
  lastUpdaterName!: string;
  // 項目の論理名
  logicalNames = memberLogicalNameForDisplay;
  // 会員を格納
  member = {} as Member;
  // 更新者情報を格納
  updater?: string;
  // リスト要素で表示する項目の一覧とマッピング表
  readonly items: elementsOfItem[] = [
    { name: '会員番号', prop_name: 'member_cd' },
    { name: 'お名前（姓）', prop_name: 'last_name' },
    { name: 'お名前（名）', prop_name: 'first_name' },
    { name: 'お名前（姓）カナ', prop_name: 'last_name_kana' },
    { name: 'お名前（名）カナ', prop_name: 'first_name_kana' },
    { name: '住所' },
    { name: '電話番号', prop_name: 'tel' },
    { name: 'メールアドレス', prop_name: 'mail' },
    { name: 'ポイント保有数', prop_name: 'point' },
    { name: '会員ステータス区分', prop_name: 'division_status_value' }, // 区分「値」を格納
    { name: '備考1', prop_name: 'remarks_1' },
    { name: '備考2', prop_name: 'remarks_2' },
    {
      name: '本人確認書類確認年月日',
      prop_name: 'identification_document_confirmation_date',
    },
    { name: '登録日時', prop_name: 'created_at' },
    { name: '登録者' },
    { name: '最終更新日時', prop_name: 'updated_at' },
    { name: '最終更新者' },
  ];

  /**
   * コンストラクタ
   * @param route
   * @param router
   * @param memberService
   * @param modalService
   * @param errorService
   * @param flashMessageService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private modalService: ModalService,
    private errorService: ErrorService,
    private flashMessageService: FlashMessageService,
    private common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.errorModalTitle
          )
        )
        .subscribe((res) => {
          // okボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.router.navigateByUrl(this.memberListPath);
          }
        })
    );
    // ページ遷移時に表示範囲を最上段へ戻す
    window.scrollTo(0, 0);
    // パスパラメータからIDを取得
    const memberId = this.route.snapshot.params['id'];
    // 取得失敗
    if (memberId === null || isNaN(Number(memberId))) {
      this.modalService.setModal(
        this.errorModalTitle,
        modalConst.BODY.CANCEL,
        'danger',
        modalConst.BUTTON_TITLE.CLOSE
      );
      return;
    }
    // 取得したIDをクラス変数へ格納
    this.memberId = Number(memberId);
    this.memberEditPath = this.memberEditRootPath + this.memberId;
    this.getMember(this.memberId);
  }

  /**
   * idで指定した会員レコードの取得
   * @param id
   */
  getMember(id: number) {
    this.common.loading = true;
    this.subscription.add(
      this.memberService
        .find(id)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          }),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          const isResInvalid = ApiResponseIsInvalid(res);
          if (isResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          // レコードを変数に格納
          this.setItems(res.data[0]);
        })
    );
  }

  /**
   * 取得したレコードを表示用変数とクラス変数に成形して格納
   * @param member
   */
  setItems(member: Member) {
    // クラス変数に値を格納
    this.member = member;
    this.updater = `${member.employee_updated_last_name}　${member.employee_updated_first_name}`;

    // 会員プロパティを丸ごと格納
    this.items
      .filter((x) => x.prop_name)
      .forEach((item) => {
        item.value = (member[item.prop_name!] ?? '') + '';
      });
    // 住所
    const address = () => {
      const { postal_code, province, locality, street_address, other_address } =
        member;
      const postalCode = postal_code
        ? `〒${postal_code?.slice(0, 3)}-${postal_code?.slice(3)} `
        : '';
      return (
        postalCode + `${province}${locality}${street_address}${other_address}`
      );
    };
    this.getItem('住所')!.value = address();
    // 本人確認書類確認年月日
    if (member.identification_document_confirmation_date) {
      const tempDate = new Date(
        member.identification_document_confirmation_date
      );
      const formattedDate = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(tempDate);
      this.getItem('本人確認書類確認年月日')!.value = formattedDate;
    }
    // 登録日時
    this.getItem('登録日時')!.value = new Date(
      member.created_at
    ).toLocaleString();
    // 登録者
    this.getItem(
      '登録者'
    )!.value = `${member.employee_created_last_name} ${member.employee_created_first_name}`;
    // 最終更新日
    this.getItem('最終更新日時')!.value = new Date(
      member.updated_at
    ).toLocaleString();
    // 最終更新者
    this.getItem(
      '最終更新者'
    )!.value = `${member.employee_updated_last_name} ${member.employee_updated_first_name}`;
    // 値がない項目には「未登録」を格納
    this.items
      .filter((item) => !item.value)
      .forEach((item) => {
        item.value = '未登録';
      });
  }

  /**
   * 項目の値を取得
   * @param name
   * @returns 項目名
   */
  private getItem(name: string) {
    return this.items.find((x) => x.name === name);
  }

  /**
   * 削除ボタン押下時の処理
   */
  handleClickDelete() {
    const modalTitle = '会員' + modalConst.TITLE.DELETE;
    // 削除確認
    this.modalService.setModal(
      modalTitle,
      modalConst.BODY.DELETE,
      'danger',
      modalConst.BUTTON_TITLE.DELETE,
      modalConst.BUTTON_TITLE.CANCEL
    );
    // モーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          take(1),
          filter(
            (_) => this.modalService.getModalProperties().title === modalTitle
          )
        )
        .subscribe((res) => {
          // 実行ボタンがクリックされた場合のみ実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            this.common.loading = true;
            // 削除処理を購読
            this.memberService
              .remove(this.memberId)
              .pipe(
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                }),
                finalize(() => (this.common.loading = false))
              )
              .subscribe((res) => {
                this.common.loading = false;
                if (res instanceof HttpErrorResponse) {
                  this.errorService.setError({
                    status: res.status,
                    title: '会員：' + modalConst.TITLE.HAS_ERROR,
                    message: res.message,
                    redirectPath: this.memberListPath,
                  });
                  return;
                }
                this.flashMessageService.setFlashMessage(
                  res.message,
                  'success',
                  15000
                );
                this.router.navigateByUrl(this.memberListPath);
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
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '会員詳細：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: this.memberListPath,
    });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
