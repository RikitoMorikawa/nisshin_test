import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  finalize,
  Subscription,
  mergeMap,
  of,
  forkJoin,
  filter,
} from 'rxjs';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import { errorConst } from 'src/app/const/error.const';
import { regExConst } from 'src/app/const/regex.const';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { SpecialSaleApiResponse } from 'src/app/models/special-sale';
import { StoreApiResponse } from 'src/app/models/store';
import { AuthorService } from 'src/app/services/author.service';
import { ProductService } from 'src/app/services/product.service';
import { SpecialSaleService } from 'src/app/services/special-sale.service';
import { StoreService } from 'src/app/services/store.service';
import { SpecialSaleCommonService } from '../special-sale-common.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { Employee } from 'src/app/models/employee';
import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';

/**
 * カスタムバリデーター
 */
const myValidators = {
  beforeFromDate: () => {
    return (control: AbstractControl): ValidationErrors | null => {
      const from = control.get('start_date')?.value;
      const to = control.get('end_date')?.value;
      return from && new Date(from) > new Date(to)
        ? { beforeFromDate: true }
        : null;
    };
  },
};

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit, OnDestroy {
  // 各種変数
  id = this.route.snapshot.params['id'];
  title = this.id ? '特売編集' : '特売新規登録';
  editor?: string;
  prevUrl = '/setting/special-sale' + (this.id ? `/detail/${this.id}` : '');
  private subscription = new Subscription();

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '特売詳細編集キャンセル：' + modalConst.TITLE.CANCEL;
  detailPagePath = this.prevUrl;

  // フォーム周りの変数
  form = this.fb.group(
    {
      special_sale_cd: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      store_id: ['', Validators.required],
      product_id: ['', Validators.required],
      product_name: ['', Validators.required],
      barcode: [
        '',
        [
          Validators.required,
          Validators.pattern(regExConst.NUMERIC_REG_EX),
          Validators.maxLength(13),
        ],
      ],
      gyo_cd: [
        '',
        [Validators.required],
        Validators.pattern(regExConst.NUMERIC_REG_EX),
      ],
      start_date: ['', [Validators.required, Validators.maxLength(14)]],
      end_date: ['', [Validators.required, Validators.maxLength(14)]],
      special_sale_price: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
      special_sale_const_price: [
        '',
        [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
      ],
    },
    {
      validators: [myValidators.beforeFromDate()],
    }
  );
  get ctrls() {
    return this.form.controls;
  }
  options = {
    store: [] as SelectOption[],
  };

  // バーコード入力フォーム周りの変数
  product?: Product;

  // 各種定数（テンプレートからの参照用）
  errorConst = errorConst;
  regExConst = regExConst;

  /**
   * コンストラクタ
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private author: AuthorService,
    private common: CommonService,
    private spcommon: SpecialSaleCommonService,
    private service: SpecialSaleService,
    private products: ProductService,
    private stores: StoreService,
    private modalService: ModalService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 選択肢を初期化
    this.initOptions();
    this.subscribeFormChanges();

    // this.form.get('product_name')?.valueChanges.subscribe((value) => {
    //   if (value === '') {
    //     this.product = undefined;
    //   }
    // })

    // this.ctrls.product_name.valueChanges
    //   .pipe(
    //     debounceTime(500),
    //     distinctUntilChanged(),
    //   )
    //   .subscribe((value) => {
    //     if (value === '') {
    //       this.product = undefined;
    //     }
    //   })

    // 編集なら特売情報を取得
    if (this.id) {
      // ローディング表示
      this.common.loading = true;

      // キャンセルのモーダルを購読
      this.subscription.add(
        this.modalService.closeEventObservable$
          .pipe(
            filter(
              (_) =>
                this.modalService.getModalProperties().title ===
                this.cancelModalTitle
            )
          )
          .subscribe((res) => {
            if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
              this.router.navigateByUrl(this.detailPagePath);
            }
          })
      );

      this.service
        .find(this.id)
        .pipe(
          catchError(this.service.handleErrorModal<SpecialSaleApiResponse>()),
          // 戻り値を元に商品情報を取得
          mergeMap((x) =>
            forkJoin({
              ss: of(x),
              pr: this.products
                .find(x.data[0].product_id)
                .pipe(
                  catchError(
                    this.products.handleErrorModal<ProductApiResponse>()
                  )
                ),
            })
          ),
          finalize(() => (this.common.loading = false))
        )
        .subscribe((x) => {
          const data = x.ss.data[0];
          this.form.patchValue(data as object);

          // 商品名の表記をサジェストに合わせる
          this.ctrls.product_name.patchValue(`${data.product_name}`);

          // 日付フォームは Date 型に変換してセット
          this.ctrls.start_date.patchValue(new Date(data.start_date) as any);
          this.ctrls.end_date.patchValue(new Date(data.end_date) as any);

          // 最終更新者をセット
          if (data.employee_updated_last_name) {
            this.editor = `${data.employee_updated_last_name} ${data.employee_updated_first_name}`;
          }

          // 商品情報の初期値をセット
          this.product = x.pr.data[0];
        });
      return;
    }

    // 新規なら登録者情報を取得
    if (this.author.author) {
      this.setEditorInfor(this.author.author);
    } else {
      this.subscription.add(
        this.author.author$.subscribe((author) => {
          this.setEditorInfor(author);
        })
      );
    }
  }

  /**
   * 登録者（ログインユーザー）情報の設定処理
   * @param author
   */
  setEditorInfor(author: Employee) {
    const authorInfo = author;
    this.editor = authorInfo.last_name + ' ' + authorInfo.first_name;
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
  invalid(ctrl: AbstractControl) {
    return (ctrl.touched || ctrl.dirty) && ctrl.invalid;
  }

  /**
   * 保存ボタン押下時の処理。
   */
  onClickSave() {
    const value = { ...this.form.value };

    // 日付項目の書式を変更
    value.start_date = new Date(value.start_date!).toLocaleDateString();
    value.end_date = new Date(value.end_date!).toLocaleDateString();

    // 各APIをコール
    if (this.id) {
      this.update(value);
    } else {
      this.create(value);
    }
  }

  /**
   * APIから情報を取得して、選択肢項目を設定する。
   */
  private initOptions() {
    // APIからデータ取得
    this.common.loading = true;
    this.stores
      .getAll()
      .pipe(
        catchError(this.stores.handleErrorModal<StoreApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        this.options.store = x.data.map((y) => ({ value: y.id, text: y.name }));
        this.options.store.unshift({ value: '', text: '選択してください' });
      });
  }

  /**
   * APIの登録処理を叩き、正常終了後に一覧画面へ遷移させる。
   * @param params APIへ送信するオブジェクト。
   */
  private create(params: object) {
    this.common.loading = true;
    this.service
      .add(params)
      .pipe(
        catchError(this.service.handleErrorModal<SpecialSaleApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '作成しました') {
          this.spcommon.showSuccessMessage('特売情報が正常に登録されました。');
          this.router.navigateByUrl(this.prevUrl);
        }
      });
  }

  /**
   * APIの更新処理を叩き、正常終了後に詳細画面へ遷移させる。
   * @param params APIへ送信するオブジェクト。
   */
  private update(params: object) {
    this.common.loading = true;
    this.service
      .update(this.id, params)
      .pipe(
        catchError(this.service.handleErrorModal<SpecialSaleApiResponse>()),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((x) => {
        if (x.message === '更新しました') {
          this.spcommon.showSuccessMessage('特売情報が正常に更新されました。');
        }
        this.router.navigateByUrl(this.prevUrl);
      });
  }

  /**
   * 商品名サジェスト機能
   * @returns
   */
  getSuggests() {
    return {
      observable: this.products.getAll({
        name: this.ctrls.product_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }

  /**
   * 商品名サジェスト機能で選択した時に得られるオブジェクトを設定
   * @param product
   */
  handleSelectedRecord(product: Product) {
    this.product = product;
  }

  /**
   * フォームの変更に応じて実行する処理
   */
  subscribeFormChanges() {
    this.subscription.add(
      this.ctrls.product_name.valueChanges.pipe().subscribe((value) => {
        // 商品名が空白の時に前回選択時の商品情報を表示しない
        if (value === '') {
          this.product = undefined;
        }
      })
    );
  }
  /**
   * キャンセルボタンが押させて場合の処理
   * @returns void
   */
  handleClickCancel() {
    // 入力があった場合はモーダルを表示
    if (!this.form.pristine) {
      const purpose: ModalPurpose = 'warning';
      this.modalService.setModal(
        this.cancelModalTitle,
        modalConst.BODY.CANCEL,
        purpose,
        modalConst.BUTTON_TITLE.EXECUTION,
        modalConst.BUTTON_TITLE.CANCEL
      );
    } else {
      this.router.navigateByUrl(this.detailPagePath);
    }
  }
}
