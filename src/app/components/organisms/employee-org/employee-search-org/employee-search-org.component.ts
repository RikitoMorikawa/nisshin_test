import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, Observable, of, Subscription, zipWith } from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { StoreService } from 'src/app/services/store.service';
import { Store, StoreApiResponse } from 'src/app/models/store';
import { DivisionService } from 'src/app/services/division.service';
import { generalConst } from 'src/app/const/general.const';
import { employeeConst } from 'src/app/const/employee.const';
import { modalConst } from 'src/app/const/modal.const';

@Component({
  selector: 'app-employee-search-org',
  templateUrl: './employee-search-org.component.html',
  styleUrls: ['./employee-search-org.component.scss'],
})
export class EmployeeSearchOrgComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  // 絞り込みイベントを親コンポーネントへ送信するEmitterの初期化
  @Output() searchEvent = new EventEmitter();

  // エラーを親コンポーネントへ送信するEmitterの初期化
  @Output() errorEvent = new EventEmitter<{
    status: number;
    title: string;
    message: string;
  }>();

  // 表示区分取得オブザーバー
  statusDivisionApiResponse$!: Observable<Record<string, SelectOption[]>>;

  // 表示区分選択肢
  statusDivisionOptions: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
  ];

  // 所属店舗取得オブザーバー
  storeApiResponse$!: Observable<StoreApiResponse>;

  // 所属店舗選択肢
  storeOptions: SelectOption[] = [
    {
      value: '',
      text: generalConst.PLEASE_SELECT,
    },
  ];

  // 絞り込みパネル開閉フラグ
  hasPanelOpened = false;

  // 絞り込みパネル開閉ボタンのアニメーション初期状態
  rotateAnimation = '';

  // 絞り込みフォーム
  employeeSearchFormGroup = this.formBuilder.group({
    code: '',
    store_id: this.storeOptions[0].value,
    status_division_id: this.statusDivisionOptions[0].value,
    last_name: '',
    first_name: '',
    last_name_kana: '',
    first_name_kana: '',
    mail: '',
  });

  /**
   * コンストラクター
   * @param formBuilder
   * @param divisionService
   * @param storeService
   */
  constructor(
    private formBuilder: FormBuilder,
    private divisionService: DivisionService,
    private storeService: StoreService
  ) {}

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnInit(): void {
    this.statusDivisionApiResponse$ = this.divisionService.getAsSelectOptions({
      name: employeeConst.EMPLOYEE_STATUS_DIVISION,
    });
    this.storeApiResponse$ = this.storeService.getAll();

    // 選択肢取得
    this.getSelectElOptions();
  }

  /**
   * Angular ライフサイクルフック
   * @returns void
   */
  ngOnDestroy(): void {
    // 全ての購読を解除
    this.subscription.unsubscribe();
  }

  /**
   * 絞り込みで利用する選択肢（社員表示区分・所属店舗）を取得
   * @returns void
   */
  private getSelectElOptions(): void {
    this.subscription.add(
      this.statusDivisionApiResponse$
        .pipe(
          zipWith(this.storeApiResponse$),
          catchError((error: HttpErrorResponse) => {
            return of(error);
          })
        )
        .subscribe({
          next: (res) => {
            if (res instanceof HttpErrorResponse) {
              // エラーを親コンポーネントへ通知
              this.errorEvent.emit({
                status: res.status,
                title: '社員絞り込み' + modalConst.TITLE.HAS_ERROR,
                message: res.error.message,
              });
            } else {
              // レスポンスのデータ不備判定フラグ
              let isIncompleteData = false;
              // レスポンスの1番目に社員表示区分というキーが存在するか
              if (employeeConst.EMPLOYEE_STATUS_DIVISION in res[0]) {
                res[0][employeeConst.EMPLOYEE_STATUS_DIVISION].forEach(
                  (state: SelectOption) => {
                    this.statusDivisionOptions.push(state);
                  }
                );
              } else {
                isIncompleteData = true;
              }
              // 店舗選択肢取得
              if (res[1] && res[1].data && res[1].data.length > 0) {
                res[1].data.forEach((store: Store) => {
                  const obj = { value: store.id, text: store.name };
                  this.storeOptions.push(obj);
                });
              } else {
                isIncompleteData = true;
              }

              if (isIncompleteData) {
                // エラーレスポンスを親コンポーネントへ通知
                this.errorEvent.emit({
                  status: 400,
                  title: '社員絞り込み' + modalConst.TITLE.HAS_ERROR,
                  message: employeeConst.FAILED_CHOICES_FOR_NARROWING_DOWN,
                });
              }
            }
          },
        })
    );
  }

  /**
   * 絞り込みクリアボタンのクリックイベントに対応
   * @returns void
   */
  handleClickClearButton(): void {
    Object.values(this.employeeSearchFormGroup.controls).forEach((x) =>
      x.patchValue('')
    );
  }

  /**
   * 絞り込みボタンのクリックイベントに対応
   * 絞り込みパネルの開閉と絞り込みボタンのアイコンアニメーションセット
   * @returns void
   */
  handleClickSearchButton(): void {
    if (this.hasPanelOpened) {
      this.hasPanelOpened = false;
      this.rotateAnimation = 'rotate-animation-0';
    } else {
      this.hasPanelOpened = true;
      this.rotateAnimation = 'rotate-animation-180';
    }
  }

  /**
   * 絞り込み実行ボタンのクリックイベント対応
   * @returns void
   */
  handleClickSubmitButton(): void {
    const searchValue = this.employeeSearchFormGroup.value;
    this.searchEvent.emit(searchValue);
  }
}
