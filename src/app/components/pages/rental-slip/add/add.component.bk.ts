// import { HttpErrorResponse } from '@angular/common/http';
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Subscription, catchError, filter, finalize, forkJoin, of } from 'rxjs';
// import { SelectOption } from 'src/app/components/atoms/select/select.component';
// import { divisionConst } from 'src/app/const/division.const';
// import { errorConst } from 'src/app/const/error.const';
// import { modalConst } from 'src/app/const/modal.const';
// import { regExConst } from 'src/app/const/regex.const';
// import { rentalSlipConst } from 'src/app/const/rental-slip.const';
// import { Client } from 'src/app/models/client';
// import { Employee } from 'src/app/models/employee';
// import { Member } from 'src/app/models/member';
// import { AuthorService } from 'src/app/services/author.service';
// import { ClientService } from 'src/app/services/client.service';
// import { DivisionService } from 'src/app/services/division.service';
// import { EmployeeService } from 'src/app/services/employee.service';
// import {
//   FlashMessagePurpose,
//   FlashMessageService,
// } from 'src/app/services/flash-message.service';
// import { MemberService } from 'src/app/services/member.service';
// import { ModalPurpose, ModalService } from 'src/app/services/modal.service';
// import { RentalSlipService } from 'src/app/services/rental-slip.service';
// import { AddFormType, FormService } from 'src/app/services/rental-slip/form.service';
// import { ErrorService } from 'src/app/services/shared/error.service';
// import { StoreService } from 'src/app/services/store.service';

// @Component({
//   selector: 'app-add',
//   templateUrl: './add.component.html',
//   styleUrls: ['./add.component.scss'],
// })
// export class AddComponent implements OnInit, OnDestroy {
//   constructor(
//     private fb: FormBuilder,
//     private authorService: AuthorService,
//     private modalService: ModalService,
//     private router: Router,
//     private storeService: StoreService,
//     private clientService: ClientService,
//     private memberService: MemberService,
//     private employeeService: EmployeeService,
//     private divisionService: DivisionService,
//     private errorService: ErrorService,
//     private rsService: RentalSlipService,
//     private formService: FormService,
//     private flashMessageService: FlashMessageService
//   ) {}

//   // オブザーバーを格納するためのSubscription
//   private subscription = new Subscription();

//   // 一覧のパス
//   listPagePath = '/rental-slip';

//   // データ取得中フラグ
//   isDuringAcquisition!: boolean;

//   // キャンセル時のモーダルのタイトル
//   cancelModalTitle =
//     'レンタル受付票新規登録キャンセル：' + modalConst.TITLE.CANCEL;

//   // エラーモーダルのタイトル
//   errorModalTitle =
//     'レンタル受付票新規登録エラー：' + modalConst.TITLE.HAS_ERROR;

//   // ログイン中ユーザー名
//   authorName!: string;

//   // ログイン中ユーザーロール
//   authorRole!: string;

//   // --------- 新規画面レイアウト用追加項目 開始

//   // ラジオボックスの選択肢のチェック状態　暫定
//   isSelectMember = true;

//   memberSuggestForm = this.fb.group({
//     id: ['', [Validators.required]],
//     full_name: [''],
//   });

//   get memberFc() {
//     return this.memberSuggestForm.controls;
//   }

//   clientSuggestForm = this.fb.group({
//     id: ['', [Validators.required]],
//     client_name: [''],
//   });

//   get clientFc() {
//     return this.clientSuggestForm.controls;
//   }

//   getMemberFormNameSuggests() {
//     let fullName = this.memberFc.full_name.value;
//     if (fullName === null) {
//       fullName = '';
//     }
//     // 半角スペースまたは全角スペースで分割
//     const [lastName, ...firstNameParts] = fullName.split(/\s|\u3000/);
//     const firstName = firstNameParts.join(' ');
//     return {
//       observable: this.memberService.getAll({
//         // 姓・名で検索
//         last_name: lastName,
//         first_name: firstName,
//       }),
//       // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
//       valueTargetColumn: 'id',
//       textTargetColumn: 'last_name',
//       textAttachColumn: 'first_name',
//     };
//   }

//   onMemberNameSuggestIdChange(id: string) {
//   }

//   onMemberNameSuggestDataSelected(data: SelectOption) {
//   }

//   getClientFormNameSuggests() {
//     let fullName = this.memberFc.full_name.value;
//     if (fullName === null) {
//       fullName = '';
//     }
//     // 半角スペースまたは全角スペースで分割
//     const [lastName, ...firstNameParts] = fullName.split(/\s|\u3000/);
//     const firstName = firstNameParts.join(' ');
//     return {
//       observable: this.memberService.getAll({
//         // 姓・名で検索
//         last_name: lastName,
//         first_name: firstName,
//       }),
//       // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
//       valueTargetColumn: 'id',
//       textTargetColumn: 'last_name',
//       textAttachColumn: 'first_name',
//     };
//   }

//   onClientNameSuggestIdChange(id: string) {
//   }

//   onClientNameSuggestDataSelected(data: SelectOption) {
//   }

//   productSuggestForm = this.fb.group({
//     id: ['', [Validators.required]],
//     product_name: [''],
//   });

//   get productFc() {
//     return this.productSuggestForm.controls;
//   }

//   getProductFormNameSuggests() {
//     return {
//       observable: this.memberService.getAll({
//         // 姓・名で検索
//         name: this.productFc.product_name.value,
//       }),
//       // 選択肢のvalueとtextとして使用するレンタル商品テーブルのカラム名
//       valueTargetColumn: 'id',
//       textTargetColumn: 'name',
//     };
//   }

//   onProductNameSuggestIdChange(id: string) {
//   }

//   onProductNameSuggestDataSelected(data: SelectOption) {
//   }

//   // レンタル明細追加用フォーム
//   addForm!: FormGroup<AddFormType>;

//   // レンタル明細追加フォームのゲッター
//   get addFc(): AddFormType {
//     return this.addForm.controls;
//   }

//   deliveryDivisionOptions!: SelectOption[];

//   collectionDivisionOptions!: SelectOption[];

//   // --------- 新規画面レイアウト用追加項目 終了

//   // 社員サジェスト
//   employeeSuggests!: SelectOption[];

//   // 得意先
//   clients!: Client[];

//   // 得意先サジェスト
//   clientSuggests!: SelectOption[];

//   // 会員
//   members!: Member[];

//   // 会員サジェスト
//   memberSuggests!: SelectOption[];

//   // 店舗選択肢
//   storeSuggests!: SelectOption[];

//   // ステータス区分Id
//   statusDivisionId!: string;

//   // 精算ステータス区分Id
//   settleStatusDivisionId!: string;

//   // インシデント発生区分Id
//   incidentDivisionId!: string;

//   // エラー文言
//   errorConst = errorConst;

//   // お客様タイプ選択肢
//   customerTypes!: SelectOption[];

//   // 選択したお客様タイプ
//   customerType!: SelectOption;

//   // レンタル受付票定数
//   rsConst = rentalSlipConst;

//   // 得意先フォームグループ
//   clientForm = this.fb.group({
//     client_id: [
//       '',
//       [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
//     ],
//     mobile_number: [
//       '',
//       [
//         Validators.minLength(10),
//         Validators.maxLength(14),
//         Validators.pattern(regExConst.NUMERIC_REG_EX),
//       ],
//     ],
//   });

//   // 会員フォームグループ
//   memberForm = this.fb.group({
//     member_id: [
//       '',
//       [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
//     ],
//     mobile_number: [
//       '',
//       [
//         Validators.minLength(10),
//         Validators.maxLength(14),
//         Validators.pattern(regExConst.NUMERIC_REG_EX),
//       ],
//     ],
//   });

//   // 共通フォーム
//   form = this.fb.group({
//     reception_date: ['', [Validators.required]],
//     shipping_address: ['', [Validators.maxLength(255)]],
//     remarks_1: ['', [Validators.maxLength(255)]],
//     remarks_2: ['', [Validators.maxLength(255)]],
//     customer_type_division_id: [
//       '',
//       [Validators.pattern(regExConst.NUMERIC_REG_EX)],
//     ],
//     store_id: ['', [Validators.required]],
//     reception_employee_id: ['', [Validators.required]],
//   });

//   get clientCtrls() {
//     return this.clientForm.controls;
//   }

//   get memberCtrls() {
//     return this.memberForm.controls;
//   }

//   get ctrls() {
//     return this.form.controls;
//   }

//   /**
//    * ログイン中ユーザーの情報をもとに画面表示を初期化する
//    * @param author
//    */
//   initWithAuthorInfo(author: Employee) {
//     this.authorName = author.last_name + ' ' + author.first_name;
//     this.authorRole = author.role_name ? author.role_name : '';
//     this.ctrls.reception_employee_id.patchValue(String(author.id));
//     this.ctrls.store_id.patchValue(String(author.store_id));
//     this.ctrls.reception_date.patchValue(new Date().toISOString());
//   }

//   ngOnInit(): void {
//     // ログイン中ユーザー取得処理
//     if (this.authorService.author) {
//       // authorServiceに値がある場合
//       this.initWithAuthorInfo(this.authorService.author);
//       // 選択肢初期化処理
//       this.initOptions();
//     } else {
//       // authorServiceに値がない場合
//       // 購読を格納
//       this.subscription.add(
//         // ログイン中ユーザーを取得
//         this.authorService.author$.subscribe((author) => {
//           this.initWithAuthorInfo(author);
//           // 選択肢初期化処理
//           this.initOptions();
//         })
//       );
//     }

//     this.addForm = this.formService.createAddForm(this.fb);

//     // キャンセルのモーダルを購読
//     this.subscription.add(
//       this.modalService.closeEventObservable$
//         .pipe(
//           filter(
//             (_) =>
//               this.modalService.getModalProperties().title ===
//               this.cancelModalTitle
//           )
//         )
//         .subscribe((res) => {
//           if (res === modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE) {
//             this.router.navigateByUrl(this.listPagePath);
//           }
//         })
//     );

//     // お客様タイプの変更を購読
//     this.subscription.add(
//       this.ctrls.customer_type_division_id.valueChanges.subscribe((res) => {
//         this.selectedCustomerType(res);
//       })
//     );
//   }

//   ngOnDestroy(): void {
//     this.subscription.unsubscribe();
//   }

//   /**
//    * フォームコントロールの状態管理
//    *
//    * @param formControl
//    * @returns
//    */
//   formControlStateManager(formControl: FormControl): boolean {
//     const formControlState =
//       (formControl.touched || formControl.dirty) && formControl.invalid;
//     return formControlState;
//   }

//   /**
//    * お客様タイプが変更された場合の処理
//    *
//    * @param typeId
//    * @returns
//    */
//   selectedCustomerType(typeId: string | null) {
//     // 引数が渡ってこない場合
//     if (typeId === null) {
//       this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
//       return;
//     }

//     const selectedType = this.customerTypes.find((x) => {
//       return String(x.value) === typeId;
//     });

//     if (selectedType === undefined) {
//       this.handleError(400, this.errorModalTitle, '選択肢取得エラー');
//       return;
//     }

//     // 既に選択したタイプがある場合フォームの値をリセット
//     if (this.customerType) {
//       switch (this.customerType.text) {
//         case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
//           this.clientCtrls.client_id.setValue('');
//           this.clientCtrls.mobile_number.setValue('');
//           break;
//         case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
//           this.memberCtrls.member_id.setValue('');
//           this.memberCtrls.mobile_number.setValue('');
//           break;
//         default:
//           break;
//       }
//     }
//     this.customerType = selectedType;
//   }

//   /**
//    * Httpリクエストのエラーを検出する
//    * @param res Httpリクエストの返り値
//    * @param resLength 返り値の個数
//    * @returns
//    */
//   detectErrors(res: any, resLength: number): boolean {
//     if (res instanceof HttpErrorResponse) {
//       this.handleError(res.status, this.errorModalTitle, res.message);
//       return true;
//     }
//     // レスポンスがnull undefinedか
//     if (res === null || res === undefined) {
//       this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//       return true;
//     }
//     // レスポンスの配列の要素が resLength 個あるか
//     if (res.length !== resLength) {
//       this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//       return true;
//     }

//     return false;
//   }

//   /**
//    * 区分を生成する
//    * @param divisions - 区分
//    * @returns
//    */
//   generateStatusDivisions(divisions: any): boolean {
//     // お客様区分選択肢
//     const tempTypes: SelectOption[] = divisions[divisionConst.CUSTOMER_TYPE];
//     // 一般の選択肢を除外する
//     const customerTypes: SelectOption[] = tempTypes.filter((x) => {
//       return x.text !== rentalSlipConst.CUSTOMER_TYPE_DIVISION.VALUE.GENERAL;
//     });
//     if (customerTypes.length > 0) {
//       // 取得した選択肢をメンバへセット
//       this.customerTypes = [
//         ...[{ value: '', text: '選択してください' }],
//         ...customerTypes,
//       ];
//     } else {
//       this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//       return false;
//     }

//     const statusDivisions: SelectOption[] =
//       divisions[divisionConst.RENTAL_SLIP_STATUS];
//     if (statusDivisions.length > 0) {
//       // 取得した選択肢をメンバへセット
//       const statusDivision = statusDivisions.find((status) => {
//         return status.text === this.rsConst.STATUS.ACCEPTED;
//       });

//       if (statusDivision === undefined) {
//         this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//         return false;
//       }
//       this.statusDivisionId = String(statusDivision.value);
//     } else {
//       this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//       return false;
//     }
//     // 精算ステータス区分取得
//     const settleStatusDivisions: SelectOption[] =
//       divisions[divisionConst.SETTLE_STATUS];
//     if (settleStatusDivisions.length > 0) {
//       // 取得した選択肢をメンバへセット
//       const settleStatusDivision = settleStatusDivisions.find((settle) => {
//         return (
//           settle.text === this.rsConst.SETTLE_STATUS_DIVISION.VALUE.UNSETTLED
//         );
//       });

//       if (settleStatusDivision === undefined) {
//         this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//         return false;
//       }
//       this.settleStatusDivisionId = String(settleStatusDivision.value);
//     } else {
//       this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//       return false;
//     }

//     // インシデントステータス区分取得
//     const incidentDivisions: SelectOption[] = divisions[divisionConst.INCIDENT];
//     if (incidentDivisions.length > 0) {
//       // 取得した選択肢をメンバへセット
//       const incidentDivision = incidentDivisions.find((incident) => {
//         return (
//           incident.text === this.rsConst.INCIDENT_DIVISION.VALUE.NO_INCIDENTS
//         );
//       });

//       if (incidentDivision === undefined) {
//         this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//         return false;
//       }
//       this.incidentDivisionId = String(incidentDivision.value);
//     } else {
//       this.handleError(400, this.errorModalTitle, modalConst.BODY.HAS_ERROR);
//       return false;
//     }
//     return true;
//   }

//   /**
//    * 選択肢初期化処理
//    */
//   initOptions() {
//     // ローディング開始
//     this.isDuringAcquisition = true;

//     // 選択肢作成
//     this.subscription.add(
//       forkJoin([
//         this.storeService.getAsSelectOptions(),
//         this.clientService.getAll(),
//         this.memberService.getAll(),
//         this.employeeService.getAsSelectOptions(),
//         this.divisionService.getAsSelectOptions(),
//       ])
//         .pipe(
//           finalize(() => (this.isDuringAcquisition = false)),
//           catchError((error) => {
//             return of(error);
//           })
//         )
//         .subscribe((res) => {
//           const hasError = this.detectErrors(res, 5);
//           if (hasError) {
//             return;
//           }
//           this.storeSuggests = res[0];
//           this.clients = res[1].data;
//           // 得意先選択肢
//           this.clientSuggests = res[1].data.map((client: Client) => {
//             const v = {
//               value: client.id,
//               text: client.name,
//             };
//             return v;
//           });
//           this.members = res[2].data;
//           // 会員選択肢
//           this.memberSuggests = res[2].data.map((member: Member) => {
//             const v = {
//               value: member.id,
//               text: member.last_name + ' ' + member.first_name,
//             };
//             return v;
//           });

//           // 受付担当者選択肢
//           this.employeeSuggests = res[3];

//           // ステータス選択肢を生成
//           this.generateStatusDivisions(res[4]);
//         })
//     );
//   }

//   /**
//    * キャンセルボタンが押させて場合の処理
//    * @returns void
//    */
//   handleClickCancel() {
//     // 入力があった場合はモーダルを表示
//     if (!this.form.pristine) {
//       const purpose: ModalPurpose = 'warning';
//       this.modalService.setModal(
//         this.cancelModalTitle,
//         modalConst.BODY.CANCEL,
//         purpose,
//         modalConst.BUTTON_TITLE.EXECUTION,
//         modalConst.BUTTON_TITLE.CANCEL
//       );
//     } else {
//       this.router.navigateByUrl(this.listPagePath);
//     }
//   }

//   /**
//    * 登録処理
//    */
//   handleClickSaveButton() {
//     // 送信ボタンを非活性にする
//     this.form.markAsPristine();
//     this.clientForm.markAsPristine();
//     this.memberForm.markAsPristine();

//     // ローディング開始
//     this.isDuringAcquisition = true;

//     const formVal = this.form.value;

//     // お客様タイプの値チェック
//     const customerTypeIdExists = this.customerTypes.some((type) => {
//       const customerTypeVal = Number(type.value);
//       const customerTypeId = Number(formVal.customer_type_division_id);
//       return customerTypeVal === customerTypeId;
//     });
//     if (!customerTypeIdExists) {
//       this.ctrls.customer_type_division_id.setValue('');
//       // ローディング終了
//       this.isDuringAcquisition = false;
//       return;
//     }

//     // 受付担当者の値チェック
//     const employeeIdExists = this.employeeSuggests.some((employee) => {
//       const employeeVal = Number(employee.value);
//       const employeeId = Number(formVal.reception_employee_id);
//       return employeeVal === employeeId;
//     });
//     if (!employeeIdExists) {
//       this.ctrls.reception_employee_id.setValue('');
//       // ローディング終了
//       this.isDuringAcquisition = false;
//       return;
//     }

//     // 店舗の値チェック
//     const storeIdExists = this.storeSuggests.some((store) => {
//       const storeVal = Number(store.value);
//       const storeId = Number(formVal.store_id);
//       return storeVal === storeId;
//     });
//     if (!storeIdExists) {
//       this.ctrls.store_id.setValue('');
//       // ローディング終了
//       this.isDuringAcquisition = false;
//       return;
//     }

//     // 受付日の値チェック
//     if (
//       formVal.reception_date === null ||
//       formVal.reception_date === undefined ||
//       formVal.reception_date === ''
//     ) {
//       this.ctrls.reception_date.setValue('');
//       // ローディング終了
//       this.isDuringAcquisition = false;
//       return;
//     }

//     // ポストデータ作成
//     const postData: { [key: string]: string | null | undefined } = {
//       store_id: formVal.store_id,
//       customer_type_division_id: formVal.customer_type_division_id,
//       status_division_id: this.statusDivisionId,
//       reception_employee_id: formVal.reception_employee_id,
//       reception_date: new Date(String(formVal.reception_date)).toLocaleString(),
//       settle_status_division_id: this.settleStatusDivisionId,
//       incident_division_id: this.incidentDivisionId,
//       shipping_address: formVal.shipping_address,
//       remarks_1: formVal.remarks_1,
//       remarks_2: formVal.remarks_2,
//     };

//     // お客様タイプによってフォームの値を取得
//     switch (this.customerType.text) {
//       case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.CLIENT:
//         // 得意先の値をチェック
//         const clientIdExists = this.clientSuggests.some((client) => {
//           const clientVal = Number(client.value);
//           const clientId = Number(this.clientForm.value.client_id);
//           return clientVal === clientId;
//         });
//         if (!clientIdExists) {
//           this.clientCtrls.client_id.setValue('');
//           // ローディング終了
//           this.isDuringAcquisition = false;
//           return;
//         }
//         // ポストデータへ得意先IDをセット
//         postData['client_id'] = this.clientForm.value.client_id;
//         postData['mobile_number'] = this.clientForm.value.mobile_number;
//         break;
//       case this.rsConst.CUSTOMER_TYPE_DIVISION.VALUE.MEMBER:
//         // 会員の値をチェック
//         const memberIdExists = this.memberSuggests.some((member) => {
//           const memberVal = Number(member.value);
//           const memberId = Number(this.memberForm.value.member_id);
//           return memberVal === memberId;
//         });
//         if (!memberIdExists) {
//           this.memberCtrls.member_id.setValue('');
//           // ローディング終了
//           this.isDuringAcquisition = false;
//           return;
//         }
//         // ポストデータへ会員IDをセット
//         postData['member_id'] = this.memberForm.value.member_id;
//         postData['mobile_number'] = this.memberForm.value.mobile_number;
//         break;
//       default:
//         break;
//     }

//     // 登録処理
//     this.subscription.add(
//       this.rsService
//         .add(postData)
//         .pipe(
//           finalize(() => (this.isDuringAcquisition = false)),
//           catchError((error) => {
//             return of(error);
//           })
//         )
//         .subscribe((res) => {
//           console.log(res);
//           if (res instanceof HttpErrorResponse) {
//             this.handleError(res.status, this.errorModalTitle, res.message);
//             return;
//           }
//           const purpose: FlashMessagePurpose = 'success';
//           this.flashMessageService.setFlashMessage(res.message, purpose, 15000);
//           this.router.navigateByUrl(this.listPagePath);
//         })
//     );
//   }

//   /**
//    * エラーサービスへエラーをセットする
//    * @param status
//    * @param message
//    */
//   handleError(status: number, title: string, message: string) {
//     // 親コンポーネントへエラー内容を送信
//     this.errorService.setError({
//       status: status,
//       title: title,
//       message: message,
//       redirectPath: this.listPagePath,
//     });
//   }
// }
