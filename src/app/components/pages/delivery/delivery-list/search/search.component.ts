import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { modalConst } from 'src/app/const/modal.const';
import { ApiResponseIsInvalid } from 'src/app/functions/shared-functions';
import { errorConst } from 'src/app/const/error.const';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { ClientService } from 'src/app/services/client.service';
import { MemberService } from 'src/app/services/member.service';
import { catchError, finalize, forkJoin, of, Subscription } from 'rxjs';
import { deliveryConst } from 'src/app/const/delivery.const';
import { CustomValidators } from 'src/app/app-custom-validator';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  /**
   *
   * @param formBuilder
   * @param clientService
   * @param memberService
   */
  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private memberService: MemberService
  ) {}

  // 購読を一元管理する Subscription
  private subscription = new Subscription();

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // 絞り込み用得意先選択肢
  clients!: SelectOption[];

  // 絞り込み用会員選択肢
  members!: SelectOption[];

  // エラーメッセージ用定数
  errorConst = errorConst;

  // 絞り込みフォーム
  form = this.fb.group({
    client_id: '',
    member_id: '',
    name: '',
    shipping_address: '',
    tel: '',
    additional_tel: '',
    delivery_specified_time: this.fb.group(
      {
        from: this.getTodayString(),
        to: '',
      },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });

  /**
   * 今日の日付をYYYY-MM-DD形式で取得
   * @returns string
   */
  getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get fc() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form.markAsDirty();
    // 入力された値に応じて重複する絞り込みをリセットする
    // 得意先の変更を購読
    this.subscription.add(
      this.fc.client_id.valueChanges.subscribe((res) => {
        if (res) {
          this.fc.member_id.reset('');
        }
      })
    );
    // 得意先の変更を購読
    this.subscription.add(
      this.fc.member_id.valueChanges.subscribe((res) => {
        if (res) {
          this.fc.client_id.reset('');
        }
      })
    );
    this.getSelectOptions();
  }

  /**
   * 絞り込み選択取得
   * @returns void
   */
  getSelectOptions() {
    this.subscription.add(
      forkJoin([
        this.clientService.getAll(),
        this.memberService.getAll({ $select: 'id,last_name,first_name' }),
      ])
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
          if (!Array.isArray(res)) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          if (res.length !== 2) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }

          const clientResInvalid = ApiResponseIsInvalid(res[0]);
          if (clientResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          const clients = res[0].data;
          this.clients = clients.map((client) => {
            return { value: client.id, text: client.name };
          });

          const memberResInvalid = ApiResponseIsInvalid(res[1]);
          if (memberResInvalid) {
            this.handleError(400, errorConst.COULD_NOT_GET_DATA);
            return;
          }
          const members = res[1].data;
          this.members = members.map((member) => {
            return {
              value: member.id,
              text: member.last_name + ' ' + member.first_name,
            };
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
  handleClickClearButton(form: FormGroup = this.form) {
    Object.values(form.controls).forEach((ctrl) => {
      ctrl instanceof FormGroup
        ? this.handleClickClearButton(ctrl) // 入れ子になっている場合は再帰呼び出し
        : ctrl.patchValue('');
    });
  }

  /**
   * 絞り込み実行ボタンクリック時の処理
   * @returns void
   */
  handleClickSubmitButton() {
    const formVal = this.form.value;
    const searchValue: any = {
      customer_type: '',
      customer_id: '',
      name: formVal.name,
      shipping_address: formVal.shipping_address,
      tel: formVal.tel,
      additional_tel: formVal.additional_tel,
      from_delivery_specified_time: '',
    };
    // 配送または回収日時の`from`を設定
    if (this.fc.delivery_specified_time.controls.from.value) {
      const tempFrom = new Date(
        this.fc.delivery_specified_time.controls.from.value
      );
      searchValue.from_delivery_specified_time = tempFrom.toLocaleDateString();
    }
    // 配送または回収日時の`to`を設定
    if (this.fc.delivery_specified_time.controls.to.value) {
      const tempTo = new Date(
        this.fc.delivery_specified_time.controls.to.value
      );
      searchValue.to_delivery_specified_time = tempTo.toLocaleDateString();
    }

    // 得意先か会員かを判断
    if (formVal.client_id) {
      const customerType = deliveryConst.CUSTOMER_TYPE.find((x) => {
        return x.name === deliveryConst.CLIENT;
      });
      searchValue.customer_type = String(customerType?.id);
      searchValue.customer_id = formVal.client_id;
    } else if (formVal.member_id) {
      const customerType = deliveryConst.CUSTOMER_TYPE.find((x) => {
        return x.name === deliveryConst.MEMBER;
      });
      searchValue.customer_type = String(customerType?.id);
      searchValue.customer_id = formVal.member_id;
    }

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
      title: '配送一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
