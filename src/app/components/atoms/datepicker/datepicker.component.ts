import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class DatepickerComponent {
  @Input() nameAttrValue?: string;
  @Input() idAttrValue?: string;
  @Input() formCtrl!: FormControl;
  @Input() placeholder?: string;
  @Input() invalid = false;
  @Input() cutoffDateBilling = 98;
  @Input() fromTo?: string;

  constructor() {}

  /**
   * input要素からフォーカスが外れた場合の処理
   * input要素に値が一度も値がセットされていない場合、
   * touchedプロパティをfalseにして、初期状態で
   * エラーが表示される現象を抑制
   */
  onBlur() {
    if (!this.formCtrl.dirty) {
      this.formCtrl.markAsUntouched();
    }
  }

  public calendarFilter = (d: Date | null): boolean => {
    if (!d) return false;

    if (this.cutoffDateBilling === 98) {
      return true;
    }
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    if (this.cutoffDateBilling === 99) {
      if (this.fromTo === 'from') {
        return day === 1;
      }
      // 月末の日付を取得
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      return day === lastDayOfMonth;
    }

    const fromDay = new Date(year, month, this.cutoffDateBilling + 1).getDate();
    console.log(fromDay);
    if (this.fromTo === 'from') {
      return day === fromDay;
    }

    // console.log("myFilter day::", day);
    // // Prevent Saturday and Sunday from being selected.
    // return day === 10;
    return day === this.cutoffDateBilling;
  };
}
