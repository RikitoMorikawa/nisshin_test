import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, of, Subscription } from 'rxjs';
import { DivisionService } from 'src/app/services/division.service';
import { LiquidationFn } from 'src/app/functions/liquidation-functions';
import { HttpErrorResponse } from '@angular/common/http';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';

export interface FormOrg extends FormGroup {
  controls: {
    name: FormControl;
    abbreviation_name: FormControl;
    display_division_id: FormControl;
    field_name: FormControl;
    liquidation_division_id: FormControl;
  };
}

/**
 * 仕入先情報入力フォームのコンポーネント
 */
@Component({
  selector: 'app-form-org',
  templateUrl: './form-org.component.html',
  styleUrls: ['./form-org.component.scss'],
})
export class FormOrgComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormOrg;
  @Output() err = new EventEmitter();

  imageUrl?: SafeUrl;
  filename = '現在のロゴ画像';
  options = {} as LiquidationFn.Options;
  get ctrls() {
    return this.formGroup.controls;
  }

  errorConst = errorConst;
  regExConst = regExConst;
  private subscription!: Subscription;

  /**
   * コンストラクタ
   */
  constructor(
    private sanitizer: DomSanitizer,
    private divisionService: DivisionService
  ) {}

  /**
   * 初期化処理
   */
  ngOnInit(): void {
    // 区分APIを取得し、サブスクライブ
    this.subscription = this.divisionService
      .getAsSelectOptions()
      .pipe(catchError(this.handleError()))
      .subscribe((x) => {
        this.options = LiquidationFn.initOptions(x, {
          value: '',
          text: '選択してください',
        });
      });
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * FormControl の不正判定
   * @param ctrl 対象となる FormControl オブジェクト
   * @returns boolean
   */
  invalid(ctrl: FormControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 親コンポーネントへエラーを通知し、テーブルの描画が止まらないよう
   * 空の`LiquidationApiResponse`の`Observable`を返却する。
   * @returns `rxjs`の`catchError`関数へ引き渡す関数。
   */
  private handleError() {
    return (err: HttpErrorResponse) => {
      this.err.emit(err);
      return of({});
    };
  }

  /**
   * 表示されるロゴ画像の更新処理
   * @param file 対象となる画像ファイルの File オブジェクト
   */
  private updateImageSources(file: File | null) {
    if (file) {
      const url = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(file)
      );
      this.imageUrl = url;
      this.filename = file.name;
    }
  }
}
