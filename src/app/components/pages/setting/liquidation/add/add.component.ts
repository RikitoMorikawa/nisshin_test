import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/models/employee';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, finalize, forkJoin, Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/app-custom-validator';
import { FormOrg } from 'src/app/components/pages/setting/liquidation/form-org/form-org.component';
import { generalConst } from 'src/app/const/general.const';
import { regExConst } from 'src/app/const/regex.const';
import { LiquidationFn } from 'src/app/functions/liquidation-functions';
import {
  Liquidation,
  LiquidationApiResponse,
} from 'src/app/models/liquidation';
import { AuthorService } from 'src/app/services/author.service';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { ModalService } from 'src/app/services/modal.service';
import { LiquidationService } from 'src/app/services/liquidation.service';

/**
 * 仕入先の送信用パラメータのインターフェイス
 */
interface LiquidationFormParams extends Liquidation {}

/**
 * カスタムバリデーションのオブジェクト
 */
const CustomValids = {
  // ファイルサイズチェック
  maxFileSize: (maxFileSize: number): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      return file instanceof Blob && file.size > maxFileSize
        ? { maxFileSize: file.size }
        : null;
    };
  },
} as const;

/**
 * 仕入先情報更新インターフェイス
 */
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit {
  loading = true;
  liquidation?: Liquidation;
  liquidationId?: number;
  updater: string = 'データ取得中...';

  form: FormOrg = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(10)]],
    abbreviation_name: ['', [Validators.maxLength(2)]],
    field_name: ['', [Validators.maxLength(10)]],
    display_division_id: '',
    liquidation_division_id: '',
  });

  /**
   * コンストラクタ。
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private liquidationService: LiquidationService,
    private authorService: AuthorService,
    private fb: FormBuilder,
    private modal: ModalService,
    private flash: FlashMessageService
  ) {}

  // ログイン中ユーザー
  author!: Employee;
  private subscription = new Subscription();

  /**
   * 初期化処理。
   */
  ngOnInit(): void {
    this.liquidationId = this.route.snapshot.params['id'];

    // 編集 or 新規登録
    if (this.liquidationId) {
      this.setLiquidationData();
    } else {
      // ログイン中ユーザー取得
      if (this.authorService.author) {
        // サービスが保持していれば取得
        this.author = this.authorService.author;
        this.updater = `${this.author.last_name} ${this.author.first_name}`;
      } else {
        // 購読を格納
        this.subscription.add(
          // ログイン中ユーザーストリームを購読
          this.authorService.author$.subscribe((author) => {
            this.author = author;
            this.updater = `${this.author.last_name} ${this.author.first_name}`;
          })
        );
      }

      this.loading = false;
      this.authorService.author$.subscribe(
        (x) => (this.updater = `${x.last_name}　${x.first_name}`)
      );
    }
  }

  /**
   * 保存ボタン押下時の処理。
   */
  onClickSave() {
    this.loading = true;
    const values: Partial<LiquidationFormParams> = { ...this.form.value };

    // APIコール
    if (this.liquidationId) {
      this.update(values as LiquidationFormParams);
    } else {
      const params = LiquidationFn.removeNullsAndBlanks(
        values
      ) as LiquidationFormParams;
      this.create(params);
    }
  }

  /**
   * ユーザーへエラーを通知するモーダルを表示し、アプリの動作を止めないよう空のオブジェクトを返却する。
   * @returns `catchError`関数へ渡す関数。
   */
  private handleError<T>() {
    return (err: HttpErrorResponse) => {
      console.error(err);
      this.modal.setModal(
        `通信エラー(${err.status})`,
        err.message,
        'danger',
        '閉じる',
        ''
      );
      return of({} as T);
    };
  }

  /**
   * 各種APIから情報を取得してフォームにセットする。
   */
  private setLiquidationData() {
    this.loading = true;
    const id = this.liquidationId!;

    // 各APIのオブザーバブルを作成
    const liquidation$ = this.liquidationService
      .find(id)
      .pipe(catchError(this.handleError<LiquidationApiResponse>()));

    // サブスクライブ
    forkJoin({ liquidation$ })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ liquidation$ }) => {
        this.liquidation = liquidation$.data[0];
        this.setFormData(this.liquidation);
        this.updater = `${this.liquidation.employee_updated_last_name}　${this.liquidation.employee_updated_first_name}`;
      });
  }

  /**
   * APIからの戻り値をフォームに設定する。
   * @param liquidation APIから取得した仕入先情報
   */
  private setFormData(liquidation: Liquidation) {
    // フォームに値をセット
    this.form.patchValue(liquidation);
  }

  /**
   * 仕入先APIの登録処理を叩き、正常終了後に一覧画面へ遷移させる。
   * @param params 仕入先APIへ送信する仕入先オブジェクト。
   */
  private create(params: LiquidationFormParams) {
    this.liquidationService
      .add(params)
      .pipe(
        catchError(this.handleError<LiquidationApiResponse>()),
        finalize(() => (this.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '作成しました') {
          this.flash.setFlashMessage(
            '仕入先情報が正常に登録されました。',
            'success',
            15000
          );
        }
        this.router.navigateByUrl(`setting/liquidation`);
      });
  }

  /**
   * 仕入先APIの更新処理を叩き、正常終了後に詳細画面へ遷移させる。
   * @param params 仕入先APIへ送信する仕入先オブジェクト。
   */
  private update(params: LiquidationFormParams) {
    this.liquidationService
      .update(this.liquidationId!, params)
      .pipe(
        catchError(this.handleError<LiquidationApiResponse>()),
        finalize(() => (this.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '更新しました') {
          this.flash.setFlashMessage(
            '仕入先情報が正常に更新されました。',
            'success',
            15000
          );
        }
        this.router.navigateByUrl(
          `setting/liquidation/detail/${this.liquidationId}`
        );
      });
  }

  /**
   * リセットボタン押下時の処理。
   */
  onClickReset() {
    // ページを再読み込み
    window.location.reload();
  }
}
