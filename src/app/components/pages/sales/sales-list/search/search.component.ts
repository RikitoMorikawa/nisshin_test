import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  finalize,
  filter,
  tap,
  of,
  Subscription,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { StoreApiResponse } from 'src/app/models/store';
import { StoreService } from 'src/app/services/store.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { Client, ClientApiResponse } from 'src/app/models/client';
import { ClientService } from 'src/app/services/client.service';
import { CustomValidators } from 'src/app/app-custom-validator';
import { MemberService } from 'src/app/services/member.service';
import { Member, MemberApiResponse } from 'src/app/models/member';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { SalesSlipApiResponse, SalesSlip } from 'src/app/models/sales-slip';
import { SalesSlipService } from 'src/app/services/sales-slip.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  // 各種パラメータ
  @Output() event = new EventEmitter();

  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();
  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // 得意先選択肢
  clientSuggests!: SelectOption[];
  bilingSuggests!: SelectOption[];
  bindBilingSuggests!: SelectOption[];
  clientList!: ClientApiResponse[];

  memberSuggests!: SelectOption[];
  salesSlipList!: SalesSlipApiResponse[];
  membersList!: any[];

  // 選択中会員
  selectedMember?: Member;
  // 選択中会員
  selectedSlipMember?: SalesSlip;

  selectedClient?: Client;

  selected_member?: any;

  billing_cd?: string = '';

  // 各種選択肢項目
  options = {
    stores: [] as SelectOption[],
    payment_division: [] as SelectOption[],
    sales_slip_division: [] as SelectOption[],
    month: [] as SelectOption[],
    day: [] as SelectOption[],
    client: [] as SelectOption[],
  };

  dates = this.fb.group({
    sale_date: this.fb.group(
      { from: [''], to: [''] },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
  });

  // 会員フォームグループ
  memberForm = this.fb.group({
    member_id: [''],
    first_name: [''],
    last_name: [''],
    member_cd: [''],
    member_tel: [''],
    member_name: [''],
  });

  // フォーム関連
  form = this.fb.group({
    store_cd: '',
    terminal_cd: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    from_sale_date: [''],
    to_sale_date: [''],
    sales_slip_division_cd: '',
    payment_division_cd: '',
    client_id: '',
    client_cd: '',
    client_name_1: '',
    billing_cd: ['', Validators.pattern(regExConst.NUMERIC_REG_EX)],
    member_id: '',
    member_cd: '',
    member_name: '',
  });

  private saveFilterParams(filter: object) {
    localStorage.setItem('filterParams', JSON.stringify(filter));
  }
  private loadFilterParams(): object | null {
    const params = localStorage.getItem('filterParams');
    return params ? JSON.parse(params) : null;
  }

  private clearFilterParams() {
    localStorage.clear();
  }

  get ctrls() {
    return this.form.controls;
  }
  get date_ctrls() {
    return this.dates.controls;
  }
  get memberFc() {
    return this.memberForm.controls;
  }

  // 各種定数（テンプレートからの参照用）
  errorConst = errorConst;
  regExConst = regExConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private stores: StoreService,
    private clientService: ClientService,
    private memberService: MemberService,
    private salesSlipService: SalesSlipService
  ) {}

  clientOption!: SelectOption[];

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // LocalStrage値取得
    const filterParams: any = this.loadFilterParams();
    // 先に選択済みの値を設定
    if (filterParams && filterParams['client_cd']) {
      this.clientSuggests = [
        {
          value: filterParams['client_cd'],
          text: filterParams['client_name_1'],
        },
      ];
      let client_cd: string = String(filterParams['client_cd']);
      this.ctrls.client_cd.setValue(client_cd);
    }

    this.initOptions().subscribe(() => {
      // フィルターパラメータをロードしてフォームに設定
      if (filterParams) {
        if ('from_sale_date' in filterParams) {
          let from = this.formatDate(
            this.convertStringToDate(filterParams['from_sale_date'])
          );
          this.date_ctrls.sale_date.controls.from.setValue(from);
        }
        if ('to_sale_date' in filterParams) {
          let to_date = this.convertStringToDate(filterParams['to_sale_date']);
          to_date.setDate(to_date.getDate() - 1);
          let to = this.formatDate(to_date);
          this.date_ctrls.sale_date.controls.to.setValue(to);
        }
        this.setSearchArgs(filterParams);
      }
    });
    this.subscription.add(
      forkJoin([
        this.clientService.getAll(),
        this.salesSlipService.getAll(),
        this.memberService.getAll(),
      ])
        .pipe(
          finalize(() => (this.common.loading = false)),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            this.stores.handleErrorModal<StoreApiResponse>();
            return;
          }

          const clientList = res[0].data;
          const SlipList = res[1].data;
          const members = res[2].data;

          this.clientSuggests = SlipList.map((sales_slip: any) => {
            return {
              value: sales_slip.client_cd,
              text: sales_slip.client_name_1,
            } as SelectOption;
          })
            .filter(
              (item, index, self) =>
                // 重複を削除
                index === self.findIndex((t) => t.value === item.value)
            )
            .filter(
              (item) =>
                // client_cd と client_name_1 が空でないことを確認
                item.value && item.text
            );

          this.bilingSuggests = SlipList.map((sales_slip: any) => {
            return {
              value: sales_slip.billing_cd,
              text: sales_slip.client_name_1,
            } as SelectOption;
          });

          this.memberSuggests = SlipList.map((sales_slip: any) => {
            return {
              value: sales_slip.member_id,
              text: sales_slip.member_name,
            } as SelectOption;
          });

          this.membersList = members.map((member: any) => {
            return {
              id: member.id,
              member_cd: member.member_cd,
              text: member.member_name,
            };
          });

          if (filterParams) {
            // 初期値を設定 Client
            if ('client_cd' in filterParams) {
              let client_cd: string = String(filterParams['client_cd']);
              this.ctrls.client_cd.setValue(client_cd);
              //controles.client_id.setValue(filterParams["client_id"]);
              //
              const client_name = this.clientSuggests.find((x: any) => {
                return x.value === Number(client_cd);
              });

              if (client_name) {
                this.ctrls.client_name_1.setValue(client_name.text);
              }

              this.memberForm.reset();
              this.ctrls.member_name.setValue('');
              this.ctrls.member_id.setValue('');
              this.ctrls.member_cd.setValue('');
              this.ctrls.billing_cd.setValue('');
            }

            if ('member_name' in filterParams) {
              this.memberForm.controls.member_name.setValue(
                filterParams['member_name']
              );
              const member_data = this.memberSuggests.find((x: any) => {
                return x.text === filterParams['member_name'];
              });
              const member = this.membersList.find((x: any) => {
                return x.member_id === member_data!.value;
              });
            }

            if ('member_id' in filterParams) {
              const member_data = this.membersList.find((x: any) => {
                return x.id === Number(filterParams['member_id']);
              });
              this.memberForm.controls.member_cd.setValue(
                member_data.member_cd
              );
            }
          }

          // Client 通常 valueChangesがあった場合
          this.ctrls.client_cd.valueChanges.subscribe(() => {
            let target = this.ctrls.client_cd;

            // x クリアボタン
            // LocalStrageの値も破棄
            if (!target.value) {
              this.ctrls.client_name_1.setValue('');
              delete filterParams['client_name_1'];
              delete filterParams['client_cd'];
              this.saveFilterParams(filterParams);
              return;
            }

            const client_name = this.clientSuggests.find((x: any) => {
              return x.value === Number(target.value);
            });
            if (client_name) {
              this.ctrls.client_name_1.setValue(client_name.text);
            }
            this.memberForm.reset();
            this.ctrls.member_name.setValue('');
            this.ctrls.member_id.setValue('');
            this.ctrls.billing_cd.setValue('');
            this.ctrls.member_cd.setValue('');
          });
        })
    );

    this.date_ctrls.sale_date.controls.from.valueChanges.subscribe(() => {
      let from = this.date_ctrls.sale_date.controls.from.value
        ? this.date_ctrls.sale_date.controls.from.value
        : '';
      if (!from) {
        delete filterParams['from_sale_date'];
        delete filterParams['to_sale_date'];
        this.saveFilterParams(filterParams);
        return;
      }

      let date = new Date(from);
      let formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}000000`;
      this.ctrls.from_sale_date.setValue(formattedDate);
    });

    this.date_ctrls.sale_date.controls.to.valueChanges.subscribe(() => {
      let to = this.date_ctrls.sale_date.controls.to.value
        ? this.date_ctrls.sale_date.controls.to.value
        : '';
      if (!to) {
        return;
      }
      let date = new Date(to);
      date.setDate(date.getDate() + 1); // 1日を加える
      let formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}000000`;
      this.ctrls.to_sale_date.setValue(formattedDate);
    });
  }

  setSearchArgs(filterParams: any) {
    Object.entries(filterParams).forEach(([key, value]) => {
      if (
        key === 'from_sale_date' ||
        key === 'to_sale_date' ||
        !key ||
        key === 'client_id' ||
        key === 'client_name_1'
      ) {
        return;
      }
      if (key in this.form.controls) {
        (
          this.form.controls[
            key as keyof typeof this.form.controls
          ] as FormControl
        ).setValue(value);
      }
      if (key in this.memberForm.controls) {
        (
          this.memberForm.controls[
            key as keyof typeof this.memberForm.controls
          ] as FormControl
        ).setValue(value);
      }
    });

    this.form.patchValue(filterParams);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月は0から始まるので+1する
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertStringToDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // 月は0から始まるので-1する
    const day = parseInt(dateString.substring(6, 8), 10);
    const hours = parseInt(dateString.substring(8, 10), 10);
    const minutes = parseInt(dateString.substring(10, 12), 10);
    const seconds = parseInt(dateString.substring(12, 14), 10);

    return new Date(year, month, day, hours, minutes, seconds);
  }

  /**
   * パネル開閉ボタンクリック時の処理
   */
  searchButtonOnClick() {
    this.isOpen = !this.isOpen;
    this.rotateAnimation = this.isOpen
      ? 'rotate-animation-180'
      : 'rotate-animation-0';
  }

  /**
   * 「絞り込みクリア」ボタンクリック時の処理
   */
  onClickReset() {
    this.form.reset();
    // 各コントロールの値を空文字に設定
    Object.values(this.ctrls).forEach((x) => {
      // 日付のfrom、toに対応するためにFormGroupの時は更にループ処理を実行
      if (x instanceof FormGroup) {
        Object.values(x.controls).forEach((child) => {
          child.patchValue('');
        });
      } else {
        x.patchValue('');
      }
    });
    this.dates.reset();
    this.memberForm.reset();
    // local strage をクリア
    this.clearFilterParams();
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    this.event.emit(this.removeNullsAndBlanks(this.form.value));
  }

  /**
   * AbstractControl の不正判定
   * @param ctrl 対象となる AbstractControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
   * 再帰的なチェックは行われません。
   * @param obj 対象となるオブジェクト（JSON）
   * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
   */
  removeNullsAndBlanks(obj: object) {
    const ret = {} as any;
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        ret[key] = value;
      }
    }
    return ret as object;
  }

  /**
   * 選択肢項目の生成
   */
  private initOptions(): Observable<any> {
    // 日付
    for (let i = 1; i <= 12; i++) {
      this.options.month.push({ value: i, text: `${i}月` });
    }
    for (let i = 1; i <= 31; i++) {
      this.options.day.push({ value: i, text: `${i}日` });
    }

    // 支払区分
    this.options.payment_division = [
      { value: 0, text: '売掛' },
      { value: 1, text: '現金' },
    ];

    // 伝票種別
    this.options.sales_slip_division = [
      { value: 0, text: '通常' },
      { value: 1, text: '返品' },
    ];

    // 店舗一覧のオブザーバブル
    const stores$ = this.stores.getAll().pipe(
      catchError(this.stores.handleErrorModal<StoreApiResponse>()),
      map((x) =>
        x.data.map(
          (store) =>
            ({
              value: store.id,
              text: `${store.id}: ${store.name}`,
            } as SelectOption)
        )
      )
    );

    // APIコール（絞り込み項目の修正に備えて forkJoin してます）
    this.common.loading = true;
    return forkJoin({ stores$ /*, client$*/ }).pipe(
      finalize(() => (this.common.loading = false)),
      tap((x: any) => {
        this.options.stores = x.stores$;
        //this.clientSuggests = x.client$;
        // 初期値をセット
        Object.values(this.options).forEach((value) => {
          value.unshift({ value: '', text: '選択してください' });
        });
      })
    );
  }

  /**
   * フォームの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  /**
   * 会員番号サジェスト
   * @returns
   */
  getMemberCdSuggests(): ApiInput<MemberApiResponse> {
    return {
      observable: this.memberService.getAll({
        member_cd: this.memberFc.member_cd.value,
      }),
      idField: 'id',
      nameField: 'member_cd',
    };
  }
  getBillingCdSuggests(): ApiInput<ClientApiResponse> {
    return {
      observable: this.clientService.getAll({
        billing_cd: this.ctrls.billing_cd.value,
      }),
      idField: 'id',
      nameField: 'billing_cd',
    };
  }

  getMemberNameSuggests(): ApiInput<SalesSlipApiResponse> {
    return {
      observable: this.salesSlipService
        .getAll({
          member_name: this.memberForm.controls.member_name.value,
        })
        .pipe(
          map((response) => {
            const uniqueMembers = response.data.filter(
              (member, index, self) =>
                index ===
                self.findIndex(
                  (m) =>
                    m.member_id === member.member_id &&
                    m.member_name === member.member_name
                )
            );
            return { ...response, data: uniqueMembers };
          })
        ),
      idField: 'member_id',
      nameField: 'member_name',
    };
  }

  /**
   * 会員番号サジェスト選択時に会員番号オブジェクトをセット
   * @param member
   *
   */
  handleSelectedMemberCdData(member: Member) {
    this.selectedMember = member;
    this.ctrls.member_id.setValue(String(member.id));
    this.memberFc.member_cd.setValue(String(member.member_cd));

    this.ctrls.member_name.setValue('');
    this.memberFc.member_name.setValue('');
    this.ctrls.client_name_1.setValue('');
    this.ctrls.client_id.setValue('');
    this.ctrls.billing_cd.setValue('');
  }

  handleSelectedBillingCdData(client: Client) {
    this.selectedClient = client;

    this.memberFc.member_id.setValue('');
    this.memberFc.member_cd.setValue('');
    this.memberFc.member_name.setValue('');
    this.ctrls.member_id.setValue('');
    this.ctrls.member_cd.setValue('');
    this.ctrls.client_name_1.setValue('');
    this.ctrls.client_id.setValue('');
    this.ctrls.client_cd.setValue('');
  }

  /**
   * 会員名サジェスト選択時に会員番号オブジェクトをセット
   * @param member
   */
  handleSelectedMemberNameData(salesslip: SalesSlip) {
    this.selectedSlipMember = salesslip;
    this.ctrls.member_name.setValue(String(salesslip.member_name));
    this.ctrls.member_id.setValue(String(salesslip.member_id));

    this.memberFc.member_id.setValue('');
    this.memberFc.member_cd.setValue('');
    this.ctrls.member_id.setValue('');
    this.ctrls.client_name_1.setValue('');
    this.ctrls.client_id.setValue('');
    this.ctrls.billing_cd.setValue('');
  }
}
