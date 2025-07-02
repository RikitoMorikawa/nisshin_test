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
  selector: 'app-sliplist-repair-search',
  templateUrl: './repair-search.component.html',
  styleUrls: ['./repair-search.component.scss'],
})
export class RepairSearchComponent implements OnInit, OnChanges {
  @Output() event = new EventEmitter();
  @Input() repairsOrg!: TableData[][];

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
    arrival_date: this.fb.group(
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
    console.log('ngOnInit this.repairsOrg:: ', this.repairsOrg);
    //this.productSuggests = this.repairsOrg.map((res) => {
    if (this.repairsOrg !== undefined) {
      const a = this.repairsOrg.forEach((res) => {
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
    // this.searchForm.reset();
    //this.searchForm = this.setSearchClear();
    //
    // this.subscription.add(
    //   this.searchForm.valueChanges.subscribe((value) => {
    //     console.log(value);
    //     if (value === undefined) {
    //       return;
    //     }
    //     const tm = new Date('2025/02/05').toLocaleDateString();
    //     // let from_date;
    //     // if (value.arrival_date !== undefined && value.arrival_date !== null && value.arrival_date.from !== undefined && value.arrival_date.from !== null && value.arrival_date.from < tm.toLocaleDateString()) {
    //     //   from_date = new Date(value.arrival_date.from).toLocaleDateString();
    //     // }
    //     if (value.arrival_date === undefined) {
    //       console.log("value.arrival_date undefined ");
    //       return;
    //     }
    //     if (value.arrival_date === null) {
    //       console.log("value.arrival_date not null ");
    //       return;
    //     }
    //     if ( value.arrival_date.from === undefined) {
    //       console.log("value.arrival_date.from undefined ");
    //       return;
    //     }
    //     if (value.arrival_date.from === null) {
    //       console.log("value.arrival_date.from null ");
    //       return;
    //     }
    //     // const from_date = new Date(value.arrival_date.from).toLocaleDateString();
    //     // console.log(tm);
    //     // console.log(from_date);
    //     // if (from_date == "2025/2/5") {
    //     //   console.log("True");
    //     //   this.event.emit(this.repairsOrg);
    //     // } else {
    //     //   //console.log(this.repairs.slice(1,1);
    //     //   console.log("False", this.repairsOrg.slice(1,1));
    //     //   this.event.emit(this.repairsOrg.slice(0,1));
    //     // }
    //     // if (value.arrival_date !== undefined && value.arrival_date !== null && value.arrival_date.from !== undefined && value.arrival_date.from !== null && value.arrival_date.from < tm.toLocaleDateString()) {
    //     // }
    //     //this.event.emit(value);
    //   })
    // );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('ngOnChanges changes:: ', changes);
    // console.log('ngOnChanges this.repairsOrg:: ', this.repairsOrg);

    // const a = this.repairsOrg.forEach((res) => {
    //   return {
    //     value: res[2],
    //     text: res[2],
    //   }
    //   // const ret = res.data.map((x) => ({
    //   //   value: x.id,
    //   //   text: x.name,
    //   // }));
    //   // return ret;
    // });
    // console.log(a);
    if (changes['repairsOrg'] && changes['repairsOrg'].currentValue) {
      this.updateProductSuggests();
      // console.log('ngOnChanges this.repairsOrg:: ', this.repairsOrg);
      // this.filterRepairs();
    }
  }

  private updateProductSuggests() {
    this.productSuggests = this.repairsOrg.map((repair) => ({
      value: repair[2] as string,
      text: repair[2] as string,
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
      arrival_date: {
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
    this.filterRepairs();
  }

  private filterRepairs() {
    const flatted = flattingFormValue(
      this.removeNullsAndBlanks(this.searchForm.value)
    );
    console.log(flatted);
    //console.log(flatted.from_arrival_date);
    //console.log(flatted['from_arrival_date']);
    const from_arrival_date = (flatted as any)['from_arrival_date'];
    const to_arrival_date = (flatted as any)['to_arrival_date'];
    const from_date = new Date(from_arrival_date);
    const to_date = new Date(to_arrival_date);
    const filter_product_name = (flatted as any)['product_name'];
    const filteredRepairs = this.repairsOrg.filter((repair) => {
      const tmpArrivalDate = (repair[1] as string)
        .replace(/ 年 /, '/')
        .replace(/ 月 /, '/')
        .replace(/ 日/, '');
      const arrivalDate = new Date(tmpArrivalDate);
      const product_name = repair[2] as string;

      if (from_arrival_date !== '' && arrivalDate < from_date) {
        return false;
      }
      if (to_arrival_date !== '' && arrivalDate > to_date) {
        return false;
      }
      if (
        filter_product_name !== undefined &&
        product_name !== filter_product_name
      ) {
        return false;
      }
      return true;
      //return arrivalDate >= from_date;
    });
    // const toDateFilteredRepairs = fromDateFilteredRepairs.filter((repair) => {
    //   if (to_arrival_date === "") {
    //     return true;
    //   }
    //   const tmpArrivalDate = (repair[1] as string).replace(/ 年 /, "/").replace(/ 月 /, "/").replace(/ 日/, "")
    //   const arrivalDate = new Date(tmpArrivalDate);
    //   return arrivalDate <= to_date;
    // });
    this.event.emit(filteredRepairs);
    // console.log((flatted as any)['from_arrival_date']);
    // if (flatted.from_arrival_date !== undefined) {
    //   console.log(flatted.from_arrival_date);
    // }
    // console.log(flatted.to_arrival_date);
    //this.event.emit(flatted);
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
