import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  Subscription,
  catchError,
  finalize,
  forkJoin,
  of,
  switchMap,
} from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { divisionConst } from 'src/app/const/division.const';
import { errorConst } from 'src/app/const/error.const';
import { generalConst } from 'src/app/const/general.const';
import { modalConst } from 'src/app/const/modal.const';
import { rentalSlipConst } from 'src/app/const/rental-slip.const';
import {
  flattingFormValue,
  removeNullsAndBlanks,
} from 'src/app/functions/shared-functions';
import { ClientService } from 'src/app/services/client.service';
import { DivisionService } from 'src/app/services/division.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { MemberService } from 'src/app/services/member.service';
import { Member } from 'src/app/models/member';
import { RentalSlipService } from 'src/app/services/rental-slip.service';
import { RentalSlip } from 'src/app/models/rental-slip';
import { Rental } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private clientService: ClientService,
    private memberService: MemberService,
    private divisionService: DivisionService,
    private rentalSlipService: RentalSlipService,
    private rentalService: RentalService,
    private cdr: ChangeDetectorRef
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

  // 受付担当者サジェスト
  employeeSuggests!: SelectOption[];

  // 得意先サジェスト
  clientSuggests!: SelectOption[];

  // 会員サジェスト
  //memberSuggests!: SelectOption[];

  // 会員番号サジェスト
  //memberCdSuggests: SelectOption[] = [];

  // 商品サジェスト
  productSuggests: SelectOption[] = [];
  prouctlistbase: any[] = [];
  productnameSuggests: SelectOption[] = [];
  slip_id_lists: number[] = [];
  // タグサジェスト
  tagSuggests: SelectOption[] = [];

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // ステータス選択肢
  statusOptions!: SelectOption[];

  // 精算区分選択肢
  settleDivisions!: SelectOption[];

  // レンタル受付票定数
  rsConst = rentalSlipConst;

  // バリデーション用
  errorConst = errorConst;

  //日付
  today = new Date().toISOString();

  // サジェスト用のダミー
  df = this.fb.group({
    product_name: '',
    product_id: '',
  });
  // フォームグループ
  form = this.fb.group({
    id: '',
    tel: '',
    mobile_number: '',
    shipping_address: '',
    client_id: '',
    member_id: '',
    member_cd: '',
    status_division_id: '',
    reception_employee_id: '',
    rental_slip_id: '',
    reception_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    scheduled_rental_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    scheduled_return_date: this.fb.group(
      { from: '', to: '' },
      {
        validators: [CustomValidators.beforeFromDate()],
      }
    ),
    reception_tag: '',
    settle_status_division_id: '',
  });

  get fc() {
    return this.form.controls;
  }
  get dfc() {
    return this.df.controls;
  }
  ngOnInit(): void {
    // 選択肢初期化書実行
    this.initialization();
  }

  private initialization() {
    const today = new Date().toISOString().split('T')[0];

    this.subscription.add(
      forkJoin([
        this.employeeService.getAsSelectOptions(),
        this.clientService.getAsSelectOptions(),
        this.divisionService.getAsSelectOptions(),
        this.rentalSlipService.getAll(),
        this.rentalService.getAll({
          'scheduled_rental_date.from': today,
        }),
      ])
        .pipe(
          catchError((error) => {
            this.errorEvent.emit(error);
            return of(null);
          })
        )
        .subscribe((res) => {
          if (!res || res instanceof HttpErrorResponse) {
            this.handleError(
              res?.status || 500,
              res?.message || 'Unknown error'
            );
            return;
          }

          const [employees, clients, divisions, slips, rentals] = res;

          // サジェスト設定
          this.employeeSuggests = employees;
          this.clientSuggests = clients;

          // ステータス・精算区分
          const statusDivisionsRes: Record<string, SelectOption[]> = divisions;
          const defaultOption: SelectOption[] = [
            { value: '', text: generalConst.PLEASE_SELECT },
          ];
          this.statusOptions = defaultOption.concat(
            statusDivisionsRes[divisionConst.RENTAL_SLIP_STATUS]
          );
          this.settleDivisions = defaultOption.concat(
            statusDivisionsRes[divisionConst.SETTLE_STATUS]
          );
          // タグ
          const tags = slips.data
            .filter((x: any) => x.reception_tag !== '')
            .map((x: any) => x.reception_tag);
          const uniqueTags = Array.from(new Set(tags));
          this.tagSuggests = uniqueTags.map((tag) => ({
            value: tag,
            text: tag,
          }));

          // 商品名サジェスト
          this.slip_id_lists = slips.data.map((x: any) => x.id);
          rentals.data.forEach((x: any) => {
            const index = this.prouctlistbase.findIndex(
              (obj) => obj.rental_product_name === x.rental_product_name
            );
            if (index > -1) {
              this.prouctlistbase[index].rental_slip_id.push(x.rental_slip_id);
            } else {
              this.prouctlistbase.push({
                rental_product_id: x.rental_product_id,
                rental_slip_id: [x.rental_slip_id],
                rental_product_name: x.rental_product_name,
              });
              this.productnameSuggests.push({
                value: x.rental_product_id,
                text: String(x.rental_product_name),
              });
            }
          });

          // 商品名選択時の処理
          this.dfc.product_name.valueChanges.subscribe((value) => {
            const slip_ids = this.prouctlistbase.find(
              (x) => x.rental_product_id === Number(value)
            );
            if (slip_ids?.rental_slip_id) {
              const unique_list = Array.from(new Set(slip_ids.rental_slip_id));
              this.fc.id.setValue(unique_list.join(','));
              this.dfc.product_id.setValue('');
            }
          });

          this._initSearch();
        })
    );
  }

  /**
   *
   * 初期検索状態設定
   * 初期検索状態を設定しているので、
   * src/app/components/organisms/rental-slip-org/table/table.component.ts
   * で行っている初期化処理はコメントアウトしています。
   *
   */
  private _initSearch(): void {
    if (this.settleDivisions === undefined) {
      return;
    }
    // 精算ステータス区分の初期設定(精算前)
    const settleStatusDivision = this.settleDivisions.find((x) => {
      return x.text === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED;
    });
    if (settleStatusDivision !== undefined) {
      this.fc.settle_status_division_id.patchValue(
        String(settleStatusDivision.value)
      );
    }
    // from の初期値を設定
    const fromControl = this.fc.scheduled_rental_date.get('from');
    const date = new Date();
    const formattedDate = this.formatDate(date);
    if (fromControl) {
      fromControl.patchValue(formattedDate);
      this.cdr.detectChanges();
    }
    this.handleClickSubmitButton();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月は0から始まるので+1する
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  /**
   * フォームの入力値をチェック
   * @param ctrl
   * @returns
   */
  invalid(ctrl: FormControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 絞り込みパネル開閉処理
   */
  panelOpenButtonOnClick() {
    if (this.hasPanelOpened) {
      this.hasPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
    } else {
      this.hasPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 絞り込みクリアボタンのクリックイベントに対応
   * @returns void
   */
  handleClickClearButton(): void {
    // 各コントロールの値を空文字に設定
    Object.values(this.fc).forEach((x) => {
      // 日付のfrom、toに対応するためにFormGroupの時は更にループ処理を実行
      if (x instanceof FormGroup) {
        Object.values(x.controls).forEach((child) => {
          child.patchValue('');
        });
      } else {
        x.patchValue('');
      }
    });
  }

  /**
   * 絞り込み実行ボタンのクリックイベント対応
   * @returns void
   */
  handleClickSubmitButton(): void {
    const memberCd = this.fc.member_cd.value;
    if (memberCd) {
      // 会員番号から会員ID取得
      this.subscription.add(
        this.memberService
          .getAll({ member_cd: memberCd })
          .pipe(
            catchError(() => {
              return of(null);
            })
          )
          .subscribe((res) => {
            if (res && res.data && res.data.length > 0) {
              this.fc.member_id.setValue(String(res.data[0].id));
            } else {
              this.fc.member_id.setValue('');
            }
            this.executeSearch();
          })
      );
    } else {
      this.executeSearch();
    }
  }

  // 検索処理
  private executeSearch(): void {
    this.form.controls.mobile_number.setValue(this.form.controls.tel.value);
    const searchValue = this.form.value;
    const searchParams = { ...searchValue };
    delete searchParams.member_cd;
    const flatted = flattingFormValue(searchParams);
    this.searchEvent.emit(removeNullsAndBlanks(flatted));
  }

  /**
   * エラーを親コンポーネントへ送信
   * @param status
   * @param message
   */
  handleError(status: number, message: string) {
    this.errorEvent.emit({
      status: status,
      title: 'レンタル受付票一覧絞り込み：' + modalConst.TITLE.HAS_ERROR,
      message: message,
    });
  }

  /**
   * 電話番号の値をモバイル番号にコピーする
   * @returns void
   */
  // copyTelToMobilenumber(): void{
  //   this.form.controls.tel.valueChanges.subscribe((value) => {
  //     this.form.controls.mobile_number.setValue(value);
  //   });
  // }
}
