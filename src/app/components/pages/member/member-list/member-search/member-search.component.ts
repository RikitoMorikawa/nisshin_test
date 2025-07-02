import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { modalConst } from 'src/app/const/modal.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { DivisionService } from 'src/app/services/division.service';

@Component({
  selector: 'app-member-search',
  templateUrl: './member-search.component.html',
  styleUrls: ['./member-search.component.scss'],
})
export class MemberSearchComponent implements OnInit {
  // 絞り込みイベントを親コンポーネントへ送信するEmitter
  @Output() searchEvent = new EventEmitter();
  // エラーを親コンポーネントへ送信するEmitter
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();
  // 購読を一元的に保持
  private subscription = new Subscription();
  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;
  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';
  // 絞り込み用得意先選択肢
  members!: SelectOption[];
  // ステータスID区分の選択肢
  statusIdOptions!: SelectOption[];
  // 絞り込みフォーム
  formGroup = this.formBuilder.group({
    id: '',
    member_cd: '',
    last_name: '',
    first_name: '',
    tel: '',
    mail: '',
    status_division_id: '',
  });
  get ctrls() {
    return this.formGroup.controls;
  }

  /**
   * コンストラクタ
   * @param formBuilder
   * @param memberService
   * @param divisionService
   */
  constructor(
    private formBuilder: FormBuilder,
    private divisionService: DivisionService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    this.getSelectOptions();
  }

  /**
   * 選択区分項目取得
   * @returns void
   */
  getSelectOptions(): void {
    this.subscription.add(
      this.divisionService
        .getAsSelectOptions({ name: '会員ステータス区分' })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.handleError(res.status, res.error.message);
            return;
          }
          this.statusIdOptions = res['会員ステータス区分'];
          this.statusIdOptions.unshift({
            value: '',
            text: '選択してください',
          });
        })
    );
  }

  /**
   * 絞り込みパネル開閉ボタンクリック時の処理
   * @returns void
   */
  handleClickSearchButton() {
    if (this.hasPanelOpened) {
      this.hasPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
    } else {
      this.hasPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 絞り込みクリアボタンクリック時の処理
   * @returns void
   */
  handleClickClearButton() {
    Object.values(this.formGroup.controls).forEach((x) => x.patchValue(''));
  }

  /**
   * 絞り込み実行ボタンクリック時の処理
   * @returns void
   */
  handleClickSubmitButton() {
    const searchValue = this.formGroup.value;
    this.searchEvent.emit(searchValue);
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: '会員一覧検索：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }
}
