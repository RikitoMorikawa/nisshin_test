import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';
import { ErrorService } from 'src/app/services/shared/error.service';
import { SelectOption } from 'src/app/components/atoms/select/select.component';
import {
  catchError,
  filter,
  forkJoin,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { errorConst } from 'src/app/const/error.const';
import { modalConst } from 'src/app/const/modal.const';
import { ModalService, ModalPurpose } from 'src/app/services/modal.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ApiResponseIsInvalid,
  isParameterInvalid,
} from 'src/app/functions/shared-functions';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FlashMessageService,
  FlashMessagePurpose,
} from 'src/app/services/flash-message.service';
import { DeliveryService } from 'src/app/services/delivery.service';
import { regExConst } from 'src/app/const/regex.const';
import { RentalSlip } from 'src/app/models/rental-slip';
import { CustomerOrderReceptionSlip } from 'src/app/models/customer-order-reception-slip';
import { deliveryConst } from 'src/app/const/delivery.const';
import { RentalSlipService } from 'src/app/services/rental-slip.service';
import { CustomerOrderReceptionSlipService } from 'src/app/services/customer-order-reception-slip.service';
import { RentalService } from 'src/app/services/rental.service';
import { CustomerOrderService } from 'src/app/services/customer-order.service';
import { Rental } from 'src/app/models/rental';
import { CustomerOrder } from 'src/app/models/customer-order';
import { DivisionService } from 'src/app/services/division.service';
import { divisionConst } from 'src/app/const/division.const';
import { Division } from 'src/app/models/division';
import { Delivery, DeliveryApiResponse } from 'src/app/models/delivery';
import { convertArrayToCsvBlob } from 'src/app/functions/shared-functions';
import { DeliveryDomain } from 'src/app/domains/delivery.domain';

@Component({
  selector: 'app-delivery-add',
  templateUrl: './delivery-add.component.html',
  styleUrls: ['./delivery-add.component.scss'],
})
export class DeliveryAddComponent implements OnInit, OnDestroy {
  /**
   *
   * @param fb
   * @param authorService
   * @param errorService
   * @param modalService
   * @param deliveryService
   * @param router
   * @param flashMessageService
   * @param activatedRoute
   * @param rentalSlipService
   * @param rentalService
   * @param corsService
   * @param coService
   * @param divisionService
   */
  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private errorService: ErrorService,
    private modalService: ModalService,
    private deliveryService: DeliveryService,
    private router: Router,
    private flashMessageService: FlashMessageService,
    private activatedRoute: ActivatedRoute,
    private rentalSlipService: RentalSlipService,
    private rentalService: RentalService,
    private corsService: CustomerOrderReceptionSlipService,
    private coService: CustomerOrderService,
    private divisionService: DivisionService,
    private deliveryDomain: DeliveryDomain
  ) {}

  // 購読を一元管理するための変数
  private subscription = new Subscription();

  // データ取得中フラグ
  isDuringAcquisition = false;

  // 送予定取得中フラグ
  isDeliveryScheduleLoading = false;

  // 回収予定取得中フラグ
  isCollectionScheduleLoading = false;

  // 回収フラグ
  isCollection = false;

  // 配送フラグ
  isDelivery = false;

  // ログイン中ユーザー
  author!: Employee;

  // キャンセル時のモーダルのタイトル
  cancelModalTitle = '配送登録キャンセル：' + modalConst.TITLE.CANCEL;

  // 配送一覧のパス
  listPagePath = '/delivery';

  // 配送予定
  deliverySchedule!: Delivery[];
  collectionSchedule!: Delivery[];

  // フォームで指定した配送年月日を保持する
  specifiedDate!: string;

  // レンタル受付票
  rentalSlip!: RentalSlip;
  // 紐付くレンタル予約
  rentals!: Rental[];

  // 客注受付票
  customerOrderReceptionSlip!: CustomerOrderReceptionSlip;
  // 紐付く客注予約
  customerOrders!: CustomerOrder[];
  customerOrdersAndDeliveries!: [];

  // 配送タイプ選択肢
  deliveryTypeOptions!: SelectOption[];

  // 配送日時設定済みの情報
  deliveries!: Delivery[];

  // 区分
  divisions!: Division[];

  // 売上タイプ
  salesType!: number;
  // 売上タイプ名
  salesTypeName!: string;

  // フォームで入力する情報以外のお客様情報
  customer = {
    id: '',
    customer_type: '',
    customer_type_name: '',
    name: '',
    name_kana: '',
    tel: '',
    shipping_address: '',
    customer_title: '',
    cors_slip_id: 0,
    rs_slip_id: 0,
  };

  // 時間選択肢
  hourOptions!: SelectOption[];

  // 分選択肢
  minuteOptions!: SelectOption[];

  // 受付票ID
  slipId!: number;

  // 配送用定数
  deliveryConst = deliveryConst;

  // エラー用定数
  errorConst = errorConst;

  // リアクティブフォームとバリデーションの設定
  form = this.fb.group({
    delivery_type_division_id: [
      '',
      [Validators.pattern(regExConst.NUMERIC_REG_EX), Validators.maxLength(11)],
    ],
    shipping_address: ['', [Validators.required, Validators.maxLength(255)]],
    additional_tel: [
      '',
      [Validators.maxLength(14), Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    delivery_specified_time: ['', [Validators.maxLength(255)]],
    delivery_hour: ['', [Validators.maxLength(2)]],
    delivery_minute: ['', [Validators.maxLength(2)]],
    collection_time: ['', [Validators.maxLength(255)]],
    collection_hour: ['', [Validators.maxLength(2)]],
    collection_minute: ['', [Validators.maxLength(2)]],
    remarks_1: ['', [Validators.maxLength(255)]],
    remarks_2: ['', [Validators.maxLength(255)]],
  });

  // 配送予定商品のチェックボックス用フォーム
  deliveryForm = this.fb.group({
    deliveries: this.fb.array([]),
  });

  get fc() {
    return this.form.controls;
  }

  get dfc(): FormArray {
    return this.deliveryForm.get('deliveries') as FormArray;
  }

  // チェックボックス用フォームのループ処理対応用
  deliveryFormGroupAt(index: number): FormGroup {
    return this.dfc.controls[index] as FormGroup;
  }

  // 時間の選択肢作成
  generateHourOptions(): SelectOption[] {
    let hours: SelectOption[] = [{ value: '', text: '選択してください' }];
    for (let i = 5; i <= 22; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      hours.push({ value: hour, text: hour });
    }
    return hours;
  }

  // 分の選択肢作成
  generateMinuteOptions(): SelectOption[] {
    let minutes: SelectOption[] = [{ value: '', text: '選択してください' }];
    for (let i = 0; i < 60; i += 5) {
      const minute = i < 10 ? `0${i}` : `${i}`;
      minutes.push({ value: minute, text: minute });
    }
    return minutes;
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
   * Angular ライフサイクルフック
   * コンポーネントの初期化時に1度だけ実行される
   */
  ngOnInit(): void {
    // キャンセルモーダルの閉じる処理を購読
    this.subscription.add(
      this.modalService.closeEventObservable$
        .pipe(
          filter(
            (_) =>
              this.modalService.getModalProperties().title ===
              this.cancelModalTitle
          ) // キャンセルモーダルじゃなければスルー
        )
        .subscribe((res) => {
          // OKボタンクリックの場合のみ処理を実行
          if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
            // 一覧画面へ移動する
            this.router.navigateByUrl(this.listPagePath);
          }
        })
    );

    // ログイン中ユーザー取得
    if (this.authorService.author) {
      // サービスが保持していれば取得
      this.author = this.authorService.author;
    } else {
      // 購読を格納
      this.subscription.add(
        // ログイン中ユーザーストリームを購読
        this.authorService.author$.subscribe((author) => {
          this.author = author;
        })
      );
    }

    // クエリパラメータを取得
    const salesType = this.activatedRoute.snapshot.queryParams['salesType'];
    const slipId = this.activatedRoute.snapshot.queryParams['slipId'];
    const salesTypeIsInvalid = isParameterInvalid(salesType);
    const slipIdIsInvalid = isParameterInvalid(slipId);

    // どちらかがエラーならモーダルを表示
    if (salesTypeIsInvalid || slipIdIsInvalid) {
      this.handleError(
        400,
        'パラメータ取得エラーが発生しました。一覧画面へ戻ります。',
        this.listPagePath
      );
      return;
    }

    this._addSubscription();

    // 時・分の選択肢をセット
    this.hourOptions = this.generateHourOptions();
    this.minuteOptions = this.generateMinuteOptions();

    // 受付票IDを設定
    this.slipId = Number(slipId);
    // 売上タイプを設定
    this.salesType = Number(salesType);

    // 初期化処理実行
    this.initialization(Number(salesType), Number(slipId));
  }

  /**
   * 配送の日付が選択されたら当日の配送予定を取得する
   *
   * @param deliverySpecifiedTime
   */
  getDeliveries(deliverySpecifiedTime: string, isCollection: boolean = false) {
    if (isCollection) {
      this.isCollectionScheduleLoading = true;
    } else {
      this.isDeliveryScheduleLoading = true;
    }
    const date = new Date(deliverySpecifiedTime).toLocaleDateString();
    this.subscription.add(
      this.deliveryService
        .getAll({
          from_delivery_specified_time: date,
          to_delivery_specified_time: date,
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (isCollection) {
              this.isCollectionScheduleLoading = false;
            } else {
              this.isDeliveryScheduleLoading = false;
            }
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorMessage = res.error
              ? res.error.message
              : errorConst.COULD_NOT_GET_DATA;
            this.handleError(res.status, errorMessage, this.listPagePath);
            return;
          }

          if (isCollection) {
            this.collectionSchedule = res.data;
            this.isCollectionScheduleLoading = false;
          } else {
            this.deliverySchedule = res.data;
            this.isDeliveryScheduleLoading = false;
          }
        })
    );
  }

  /**
   * 画面表示用初期化処理
   *
   * @param salesType - 売上タイプ
   * @param slipId - 受付票ID
   */
  initialization(salesType: number, slipId: number) {
    this.isDuringAcquisition = true;

    // 売上タイプを特定する
    const selectedSalesType = deliveryConst.SALES_TYPE.find((x) => {
      return x.id === salesType;
    });

    // 売上タイプに応じて修理・客注・レンタルのオブザーバブルを作成する
    const rentalObservable$ = forkJoin([
      this.rentalSlipService.find(slipId),
      this.rentalService.getAll({ rental_slip_id: slipId }),
      this.divisionService.getAll(),
    ]).pipe(
      switchMap(([rentalSlip, rentals, divisions]) => {
        // レンタル受付票、レンタル予約、区分マスタがすべて成功したら
        // レンタル予約ごとに、配送情報の取得を試みる
        const deliveryObservable$ = rentals.data.map((rental) => {
          return this.deliveryService.getAll({
            sales_id: rental.id,
            sales_type: salesType,
          });
        });
        return forkJoin([
          of(rentalSlip),
          of(rentals),
          of(divisions),
          forkJoin(deliveryObservable$),
        ]);
      }),
      // エラーが発生した場合、フラグを戻し、エラー情報をそのまま返します
      catchError((error: HttpErrorResponse) => {
        this.isDuringAcquisition = false;
        return of(error);
      })
    );
    const corsObservable$ = forkJoin([
      this.corsService.find(slipId),
      this.coService.getAll({ customer_order_reception_slip_id: slipId }),
      this.divisionService.getAll(),
    ]).pipe(
      switchMap(([corsSlip, customerOrders, divisions]) => {
        // 客注受付票、客注予約、区分マスタがすべて成功したら
        // 客注ごとに、配送情報の取得を試みる
        const deliveryObservable$ = customerOrders.data.map((customerOrder) => {
          return this.deliveryService.getAll({
            sales_id: customerOrder.id,
            sales_type: salesType,
          });
        });
        return forkJoin([
          of(corsSlip),
          of(customerOrders),
          of(divisions),
          forkJoin(deliveryObservable$),
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        this.isDuringAcquisition = false;
        return of(error);
      })
    );

    switch (selectedSalesType?.name) {
      case deliveryConst.RENTAL:
        this.subscription.add(
          rentalObservable$.subscribe((res) => {
            if (res instanceof HttpErrorResponse) {
              const errorMessage = res.error
                ? res.error.message
                : errorConst.COULD_NOT_GET_DATA;
              this.handleError(res.status, errorMessage, this.listPagePath);
              return;
            }
            this.salesTypeName = deliveryConst.RENTAL;
            this.initializationForRental(
              res[0].data[0],
              res[1].data,
              res[2].data,
              res[3]
            );
          })
        );
        break;
      case deliveryConst.CUSTOMER_ORDER:
        this.subscription.add(
          corsObservable$.subscribe((res) => {
            if (res instanceof HttpErrorResponse) {
              const errorMessage = res.error
                ? res.error.message
                : errorConst.COULD_NOT_GET_DATA;
              this.handleError(res.status, errorMessage, this.listPagePath);
              return;
            }
            this.salesTypeName = deliveryConst.CUSTOMER_ORDER;
            this.initializationForCustomerOrder(
              res[0].data[0],
              res[1].data,
              res[2].data,
              res[3]
            );
          })
        );
        break;
      default:
        break;
    }
  }

  /**
   * 文字列をDateへ変換してフォーマットを整形
   * 時間以下を削除
   * @param date
   * @returns Date
   */
  dateFormatter(date: string | undefined) {
    return date ? new Date(date).toLocaleDateString() : '';
  }

  /**
   * 文字列をDateへ変換してフォーマットを整形
   * 時間まで表示
   * @param date
   * @returns Date
   */
  dateTimeFormatter(date: string | undefined) {
    return date ? new Date(date).toLocaleString() : '';
  }

  /**
   * 引数の区分idからお客様タイプ区分を取得
   * @param divisions
   * @param customerTypeDivisionId
   * @returns Division（お客様タイプ区分） | undefined
   */
  getCustomerTypeDivision(
    divisions: Division[],
    customerTypeDivisionId: number
  ): Division | undefined {
    const customerTypeDivisions = divisions.filter((x) => {
      return x.name === divisionConst.CUSTOMER_TYPE;
    });
    const customerTypeDivision = customerTypeDivisions.find((x) => {
      return x.id === customerTypeDivisionId;
    });
    return customerTypeDivision;
  }

  /**
   * 配送ありの区分を取得する
   * @param divisions
   * @returns
   */
  getDeliveryAvailableDivision(divisions: Division[]) {
    const deliveryRequestDivisions = divisions.filter((x) => {
      return x.name === divisionConst.DELIVERY_REQUEST;
    });
    const deliveryAvailableDivision = deliveryRequestDivisions.find((x) => {
      return x.value === deliveryConst.DELIVERY_AVAILABLE;
    });
    return deliveryAvailableDivision;
  }

  /**
   * 回収ありの区分を取得する
   * @param divisions
   * @returns
   */
  getCollectionAvailableDivision(divisions: Division[]) {
    const collectionRequestDivisions = divisions.filter((x) => {
      return x.name === divisionConst.COLLECTION_REQUEST;
    });
    const collectionAvailableDivision = collectionRequestDivisions.find((x) => {
      return x.value === deliveryConst.COLLECTION_AVAILABLE;
    });
    return collectionAvailableDivision;
  }

  /**
   * 配送区分選択肢を取得
   * @param divisions
   * @returns
   */
  getDeliveryTypeOptions(divisions: Division[]) {
    const deliveryTypeDivisions = divisions.filter((x) => {
      return x.name === divisionConst.DELIVERY;
    });
    const deliveryTypeOptions = deliveryTypeDivisions.map((x) => {
      return { value: x.id, text: x.value };
    });
    const defaultValue = [{ value: '', text: '選択してください' }];
    return [...defaultValue, ...deliveryTypeOptions];
  }

  /**
   * レンタルの場合の初期化処理
   * @param rs
   * @param rentals
   * @param divisions
   */
  initializationForRental(
    rs: RentalSlip,
    rentals: Rental[],
    divisions: Division[],
    deliveries: DeliveryApiResponse[]
  ) {
    this.customer.rs_slip_id = this.slipId;
    // お客様タイプ区分取得
    const customerTypeDivision = this.getCustomerTypeDivision(
      divisions,
      Number(rs.customer_type_division_id)
    );
    // 配送依頼ありの区分情報取得
    const deliveryAvailableDivision =
      this.getDeliveryAvailableDivision(divisions);
    // 回収依頼区分取得
    const collectionAvailableDivision =
      this.getCollectionAvailableDivision(divisions);
    switch (customerTypeDivision?.value) {
      case deliveryConst.CLIENT:
        this.deliveryDomain.setClientCustomer(this.customer, rs);

        this.customer.tel = String(rs.mobile_number)
          ? String(rs.mobile_number)
          : String(rs.client_tel);
        break;
      case deliveryConst.MEMBER:
        this.deliveryDomain.setMemberCustomer(this.customer, rs);

        this.customer.tel = String(rs.mobile_number)
          ? String(rs.mobile_number)
          : String(rs.member_tel);

        break;
      case deliveryConst.GENERAL:
        this.deliveryDomain.setGeneralCustomer(this.customer, rs);
        break;
      default:
        break;
    }
    this.rentalSlip = rs;
    const filteredRentals = rentals.filter((x) => {
      if (x.delivery_division_id === deliveryAvailableDivision?.id) {
        this.isDelivery = true;
        this._setValidDeliverySpecifiedTime();
      }
      if (x.collection_division_id === collectionAvailableDivision?.id) {
        this.isCollection = true;
        this._setValidCollectionTime();
      }
      return (
        x.delivery_division_id === deliveryAvailableDivision?.id ||
        x.collection_division_id === collectionAvailableDivision?.id
      );
    });

    this.deliveries = deliveries
      .filter((x) => {
        return x && x.data && x.data.length > 0;
      })
      .map((x) => {
        return x.data;
      })
      .flat();
    // レンタルデータと配送データをマージする
    this.rentals = filteredRentals.map((rental) => {
      const relatedDelivery = {
        delivery_id: '',
        delivery_date_time: '',
        collection_id: '',
        collection_date_time: '',
      };
      this.deliveries.forEach((delivery) => {
        if (rental.id === delivery.sales_id) {
          if (
            delivery.division_delivery_type_value === deliveryConst.DELIVERY
          ) {
            relatedDelivery.delivery_id = String(delivery.id);
            relatedDelivery.delivery_date_time = String(
              delivery.delivery_specified_time
            );
            relatedDelivery.collection_id = '';
            relatedDelivery.collection_date_time = '';
          } else if (
            delivery.division_delivery_type_value === deliveryConst.COLLECTION
          ) {
            relatedDelivery.delivery_id = '';
            relatedDelivery.delivery_date_time = '';
            relatedDelivery.collection_id = String(delivery.id);
            relatedDelivery.collection_date_time = String(
              delivery.delivery_specified_time
            );
          }
        }
      });
      return { ...rental, ...relatedDelivery };
    });
    // 配送区分を必須とするバリデーションを追加する
    // this.fc.delivery_type_division_id.setValidators(Validators.required);
    // this.fc.delivery_type_division_id.updateValueAndValidity();
    this.deliveryTypeOptions = this.getDeliveryTypeOptions(divisions);
    // 配送予定商品のフォームを構成
    // 全てのチェックボックスを選択なしに設定しレコードの数だけ作成する
    this.rentals.forEach((x) => {
      this.dfc.push(
        this.fb.group({
          id: [x.id],
          isSelected: [false],
        })
      );
    });
    this.divisions = divisions;
    this.isDuringAcquisition = false;
  }

  /**
   * 客注の場合の初期化処理
   * @param cors
   * @param customerOrders
   * @param divisions
   */
  initializationForCustomerOrder(
    cors: CustomerOrderReceptionSlip,
    customerOrders: CustomerOrder[],
    divisions: Division[],
    deliveries: DeliveryApiResponse[]
  ) {
    const customerTypeDivision = this.getCustomerTypeDivision(
      divisions,
      Number(cors.customer_type_division_id)
    );

    this.customer.cors_slip_id = this.slipId;
    switch (customerTypeDivision?.value) {
      case deliveryConst.CLIENT:
        this.deliveryDomain.setClientCustomer(this.customer, cors);

        this.customer.tel = String(cors.client_tel);
        break;
      case deliveryConst.MEMBER:
        this.deliveryDomain.setMemberCustomer(this.customer, cors);

        this.customer.tel = String(cors.member_tel);

        break;
      case deliveryConst.GENERAL:
        this.deliveryDomain.setGeneralCustomer(this.customer, cors);
        break;
      default:
        break;
    }
    this.customerOrderReceptionSlip = cors;
    const filteredCustomerOrders = customerOrders;
    this.isDelivery = true;
    this.deliveryTypeOptions = this.getDeliveryTypeOptions(divisions);
    this.deliveries = deliveries
      .filter((x) => {
        return x && x.data && x.data.length > 0;
      })
      .map((x) => {
        return x.data;
      })
      .flat();
    // 客注データと配送データをマージする
    this.customerOrders = filteredCustomerOrders.map((customerOrder) => {
      const relatedDelivery = { delivery_id: '', delivery_date_time: '' };
      this.deliveries.forEach((delivery) => {
        if (customerOrder.id === delivery.sales_id) {
          if (
            delivery.division_delivery_type_value === deliveryConst.DELIVERY
          ) {
            relatedDelivery.delivery_id = String(delivery.id);
            relatedDelivery.delivery_date_time = String(
              delivery.delivery_specified_time
            );
          }
        }
      });
      return { ...customerOrder, ...relatedDelivery };
    });
    // 配送予定商品のフォームを構成
    // 全てのチェックボックスを選択なしに設定しレコードの数だけ作成する
    this.customerOrders.forEach((x) => {
      this.dfc.push(
        this.fb.group({
          id: [x.id],
          isSelected: [false],
        })
      );
    });
    this.divisions = divisions;
    this.isDuringAcquisition = false;
  }

  handleClickAddButton() {
    // ローディング開始
    this.isDuringAcquisition = true;

    // 送信ボタンを非活性にする
    this.form.markAsPristine();

    // フォームの値を取得
    const formVal = this.form.value;

    // 送信データを作成する
    let postData: any[] = [];
    // 選択された配送対象のidを取得
    // const selectedProductIds = this.getSelectedDeliveryProducts();
    // 選択された商品の分だけ送信データを作成する
    //selectedProductIds.forEach((x) => {
    //  //postData.push(delivery);
    //});

    const createPostData = (
      deliveryTypeIndex: number,
      deliverySpecifiedTime: string
    ) => ({
      delivery_type_division_id:
        this.deliveryTypeOptions[deliveryTypeIndex].value,
      customer_type: this.customer.customer_type,
      customer_id: this.customer.id,
      name: this.customer.name,
      sales_type_id: this.salesType,
      // sales_id: x,
      cors_slip_id: this.customer.cors_slip_id,
      rs_slip_id: this.customer.rs_slip_id,
      shipping_address: formVal.shipping_address
        ? formVal.shipping_address
        : this.customer.shipping_address,
      tel: this.customer.tel,
      additional_tel: formVal.additional_tel,
      delivery_specified_time: deliverySpecifiedTime,
      remarks_1: formVal.remarks_1,
      remarks_2: formVal.remarks_2,
    });

    if (this.isDelivery) {
      const deliverySpecifiedTime =
        this.deliveryDomain.getDeliverySpecifiedTime(
          formVal.delivery_specified_time,
          formVal.delivery_hour,
          formVal.delivery_minute
        );
      postData.push(createPostData(1, deliverySpecifiedTime));
    }

    if (this.isCollection) {
      const collectionSpecifiedTime =
        this.deliveryDomain.getDeliverySpecifiedTime(
          formVal.collection_time,
          formVal.collection_hour,
          formVal.collection_minute
        );
      postData.push(createPostData(2, collectionSpecifiedTime));
    }

    // 配送
    console.log(postData);
    // Blobに変換
    const blob = convertArrayToCsvBlob(postData);
    // データ送信
    this.subscription.add(
      this.deliveryService
        .bulkAdd(blob)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.isDuringAcquisition = false;
            return of(error);
          })
        )
        .subscribe((res) => {
          if (res instanceof HttpErrorResponse) {
            const errorMessage = res.error
              ? res.error.message
              : errorConst.COULD_NOT_GET_DATA;
            this.handleError(res.status, errorMessage, this.listPagePath);
            return;
          }
          this.isDeliveryScheduleLoading = false;
          const purpose: FlashMessagePurpose = 'success';
          this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
          // this.initialization(this.salesType, this.slipId);
          this.router.navigateByUrl(this.listPagePath);
        })
    );
  }

  /**
   * キャンセルボタンクリック時の処理
   * @returns void
   */
  handleClickCancel(): void {
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
      this.router.navigateByUrl(this.listPagePath);
    }
  }

  /**
   * エラーサービスへエラーをセットする
   * @param status
   * @param message
   */
  handleError(status: number, message: string, redirectPath?: string) {
    // 親コンポーネントへエラー内容を送信
    this.errorService.setError({
      status: status,
      title: '配送新規登録エラー：' + modalConst.TITLE.HAS_ERROR,
      message: message,
      redirectPath: redirectPath,
    });
  }

  /**
   * Angular ライフサイクルフック
   * コンポーネントが破棄される時に実行
   */
  ngOnDestroy(): void {
    // 一元管理した購読を全て解除
    this.subscription.unsubscribe();
  }

  /**
   * 配送日時を必須に
   *
   */
  _setValidDeliverySpecifiedTime() {
    this.fc.delivery_specified_time.setValidators(Validators.required);
    this.fc.delivery_specified_time.updateValueAndValidity();
    this.fc.delivery_hour.setValidators(Validators.required);
    this.fc.delivery_hour.updateValueAndValidity();
    this.fc.delivery_minute.setValidators(Validators.required);
    this.fc.delivery_minute.updateValueAndValidity();
  }

  /**
   * 回収日時を必須に
   *
   */
  _setValidCollectionTime() {
    this.fc.collection_time.setValidators(Validators.required);
    this.fc.collection_time.updateValueAndValidity();
    this.fc.collection_hour.setValidators(Validators.required);
    this.fc.collection_hour.updateValueAndValidity();
    this.fc.collection_minute.setValidators(Validators.required);
    this.fc.collection_minute.updateValueAndValidity();
  }

  /**
   *
   * フォームの値を監視して
   * 配送・回収日時の変更を購読
   *
   */
  _addSubscription(): void {
    this.subscription.add(
      // 配送日の変更を購読
      this.fc.delivery_specified_time.valueChanges.subscribe((res) => {
        // 配送日の変更があったら日付を指定して配送情報を取得する
        if (res) {
          this.specifiedDate = this.dateFormatter(res);
          this.getDeliveries(res);
        }
      })
    );

    this.subscription.add(
      // 回収日の変更を購読
      this.fc.collection_time.valueChanges.subscribe((res) => {
        // 配送日の変更があったら日付を指定して配送情報を取得する
        if (res) {
          this.specifiedDate = this.dateFormatter(res);
          this.getDeliveries(res, true);
        }
      })
    );
  }
}
