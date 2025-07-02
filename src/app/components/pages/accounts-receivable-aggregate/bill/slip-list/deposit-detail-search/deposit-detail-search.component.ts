import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  Input,
  EventEmitter,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { CustomValidators } from 'src/app/app-custom-validator';
import { TableData } from 'src/app/components/atoms/table/table.component';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  flattingFormValue,
  convertToJpDate,
} from 'src/app/functions/shared-functions';

@Component({
  selector: 'app-sliplist-deposit-detail-search',
  templateUrl: './deposit-detail-search.component.html',
  styleUrls: ['./deposit-detail-search.component.scss'],
})
export class DepositDetailSearchComponent implements OnInit, OnChanges {
  @Output() event = new EventEmitter();
  @Input() depositDetailsOrg!: TableData[][];

  // パネル開閉のステータス
  isOpen = false;
  rotateAnimation = '';

  // 商品選択肢
  productSuggests!: SelectOption[];

  /**
   * コンストラクタ
   *
   * @param fb
   * @param flashMessageService
   */
  constructor(private fb: FormBuilder) {}

  // オブザーバーを格納する
  private subscription = new Subscription();

  // エラー文言
  errorConst = errorConst;
  regExConst = regExConst;

  // フォーム関連
  searchForm = this.fb.group({
    product_name: '',
    deposit_date: this.fb.group(
      { from: '', to: '' },
      { validators: [CustomValidators.beforeFromDate()] }
    ),
  });

  get ctrls() {
    return this.searchForm.controls;
  }

  get fc() {
    return this.searchForm.controls;
  }

  ngOnInit(): void {
    // TODO: ダミー
    console.log('ngOnInit this.depositDetailsOrg:: ', this.depositDetailsOrg);
    if (this.depositDetailsOrg !== undefined) {
      const a = this.depositDetailsOrg.forEach((res) => {
        console.log(res);
        return {
          value: res[1],
          text: res[1],
        };
        // const ret = res.data.map((x) => ({
        //   value: x.id,
        //   text: x.name,
        // }));
        // return ret;
      });
      console.log(a);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['depositDetailsOrg'] &&
      changes['depositDetailsOrg'].currentValue
    ) {
      this.updateProductSuggests();
    }
  }

  private updateProductSuggests() {
    this.productSuggests = this.depositDetailsOrg.map((depositDetail) => ({
      value: depositDetail[2] as string,
      text: depositDetail[2] as string,
    }));
    console.log('Updated productSuggests:: ', this.productSuggests);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    this.searchForm.reset({
      deposit_date: {
        from: '',
        to: '',
      },
    });
    // Object.values(this.ctrls).forEach((x) => x.patchValue('')); // 空文字で初期化
  }

  /**
   * 「絞り込み実行」ボタンクリック時の処理
   */
  onClickSubmit() {
    this.filterDepositDetails();
  }

  private filterDepositDetails() {
    const flatted = flattingFormValue(
      this.removeNullsAndBlanks(this.searchForm.value)
    );
    console.log(flatted);
    const from_deposit_date = (flatted as any)['from_deposit_date'];
    const to_deposit_date = (flatted as any)['to_deposit_date'];
    const from_date = new Date(from_deposit_date);
    const to_date = new Date(to_deposit_date);
    const filter_product_name = (flatted as any)['product_name'];
    const filteredDepositDetails = this.depositDetailsOrg.filter(
      (depositDetail) => {
        const tmpDepositDate = (depositDetail[1] as string)
          .replace(/ 年 /, '/')
          .replace(/ 月 /, '/')
          .replace(/ 日/, '');
        const depositDate = new Date(tmpDepositDate);
        const product_name = depositDetail[2] as string;

        if (from_deposit_date !== '' && depositDate < from_date) {
          return false;
        }
        if (to_deposit_date !== '' && depositDate > to_date) {
          return false;
        }
        if (
          filter_product_name !== undefined &&
          product_name !== filter_product_name
        ) {
          return false;
        }
        return true;
      }
    );
    this.event.emit(filteredDepositDetails);
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
   * フォームコントロールの状態管理
   *
   * @param formControl
   * @returns
   */
  formControlStateManager(formControl: FormControl): boolean {
    const formControlState =
      (formControl.touched || formControl.dirty) && formControl.invalid;
    return formControlState;
  }

  getFormControlTypeValue(form: AbstractControl, controlName: string) {
    return form.get(controlName) as FormControl;
  }

  /**
   * 検索条件初期化
   */
  // setSearchClear() {
  //   return this.fb.group({
  //     sale_date: this.fb.group(
  //       { from: '', to: '' },
  //       { validators: [CustomValidators.beforeFromDate()] }
  //     ),
  //     business_date: this.fb.group(
  //       { from: '', to: '' },
  //       { validators: [CustomValidators.beforeFromDate()] }
  //     ),
  //   });
  // }
}
