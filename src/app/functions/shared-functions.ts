import { SelectOption } from '../components/atoms/select/select.component';
import { BasicInformationApiResponse } from '../models/basic-information';
import { DivisionApiResponse } from '../models/division';
import { EmployeeApiResponse } from '../models/employee';
import { ProductApiResponse } from '../models/product';
import { RoleApiResponse } from '../models/role';
import { StoreApiResponse } from '../models/store';
import { SupplierApiResponse } from '../models/supplier';
import { LargeCategoryApiResponse } from '../models/large-category';
import { MediumCategoryApiResponse } from '../models/medium-category';
import { SmallCategoryApiResponse } from '../models/small-category';
import { CustomLargeCategoryApiResponse } from '../models/custom-large-category';
import { CustomMediumCategoryApiResponse } from '../models/custom-medium-category';
import { CustomSmallCategoryApiResponse } from '../models/custom-small-category';
import { QualityCustomerApiResponse } from '../models/quality-customer';
import { CreditApiResponse } from '../models/credit';
import { RepairApiResponse } from '../models/repair';
import { MemberApiResponse } from '../models/member';
import { DeliveryApiResponse } from '../models/delivery';
import { CustomerOrderApiResponse } from '../models/customer-order';
import { CustomerOrderReceptionSlipApiResponse } from '../models/customer-order-reception-slip';
import { RentalSlipApiResponse } from '../models/rental-slip';
import { taxFractionConst } from '../const/tax-fraction.const';
import { RepairSlipApiResponse } from '../models/repair-slip';
import { RentalApiResponse } from '../models/rental';
import { PurchaseOrderApiResponse } from '../models/purchase-order';
import { AccountsReceivableAggregateApiResponse } from '../models/accounts-receivable-aggregate';
import { BillApiResponse } from '../models/bill';
import { BillDetailApiResponse } from '../models/bill-detail';
import { DepositApiResponse } from '../models/deposit';
import { DepositDetailApiResponse } from '../models/deposit-detail';
import { PaymentApiResponse } from 'src/app/models/payment';
import { PaymentDetailApiResponse } from 'src/app/models/payment-detail';
import { AccountsPayableAggregateApiResponse } from 'src/app/models/accounts-payable-aggregate';
import { PurchaseApiResponse } from 'src/app/models/purchase';
import { PurchaseDetailApiResponse } from 'src/app/models/purchase-detail';
import { StockTransferApiResponse } from 'src/app/models/stock-transfer';
/**
 * APIレスポンスの値チェック
 * @param arg
 * @returns boolean
 */
export function ApiResponseIsInvalid(
  arg:
    | BasicInformationApiResponse
    | EmployeeApiResponse
    | StoreApiResponse
    | RoleApiResponse
    | ProductApiResponse
    | DivisionApiResponse
    | SupplierApiResponse
    | LargeCategoryApiResponse
    | MediumCategoryApiResponse
    | SmallCategoryApiResponse
    | CustomLargeCategoryApiResponse
    | CustomMediumCategoryApiResponse
    | CustomSmallCategoryApiResponse
    | QualityCustomerApiResponse
    | CreditApiResponse
    | RepairApiResponse
    | DeliveryApiResponse
    | MemberApiResponse
    | CustomerOrderApiResponse
    | CustomerOrderReceptionSlipApiResponse
    | RentalSlipApiResponse
    | RepairSlipApiResponse
    | RentalApiResponse
    | PurchaseOrderApiResponse
    | AccountsReceivableAggregateApiResponse
    | BillApiResponse
    | BillDetailApiResponse
    | DepositApiResponse
    | DepositDetailApiResponse
    | PaymentApiResponse
    | PaymentDetailApiResponse
    | AccountsPayableAggregateApiResponse
    | PurchaseApiResponse
    | PurchaseDetailApiResponse
    | StockTransferApiResponse
): boolean {
  // argそのものがnull undefinedか？
  if (arg === null || arg === undefined) return true;
  // レスポンスのdataがnull undefined 配列ではない？
  if (arg.data === null || arg.data === undefined || !Array.isArray(arg.data))
    return true;
  // dataが空の配列か？
  if (!arg.data.length) return true;
  return false;
}

/**
 * 区分データ取得時の値チェック
 * @param arg
 * @returns boolean
 */
export function DivisionApiResponseIsInvalid(
  arg: Record<string, SelectOption[]>,
  key: string
): boolean {
  // argそのものがnull undefinedか？
  if (arg === null || arg === undefined) return true;
  // 表示区分名で取得した結果がnull undefined 配列ではない？
  if (arg[key] === null || arg[key] === undefined || !Array.isArray(arg[key]))
    return true;
  // 表示区分名で取得した結果が空の配列？
  if (!arg[key].length) return true;
  return false;
}

/**
 * 文字列からCSVとなるBLOBデータを生成し、URLを発行する。
 * @param csv CSV形式の文字列。
 * @returns 生成されたBLOB URL。
 */
export function generateBlobUrl(csv: string) {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  return URL.createObjectURL(new Blob([bom, csv], { type: 'text/csv' }));
}

/**
 * 文字列からCSVとなるBLOBデータを生成し、URLを発行する。
 * @param csv CSV形式の文字列。
 * @returns 生成されたBLOB URL。
 */
export function generatePdfBlobUrl(data: any) {
  return URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
}

/**
 * 空のaタグを発行しファイルのダウンロード処理を実行する。
 * @param url ダウンロードファイルのBLOB URL。
 * @param filename ダウンロードファイルのファイル名。
 */
export function download(url: string, filename?: string) {
  const link = document.createElement('a');
  link.download = filename ?? '';
  link.href = url;
  link.click();
}

/**
 * 日付形式の文字列を下記のような年月日形式の文字列にして返す
 * 年月日の中に半角スペースを含みます
 * y + ' ' + '年' + ' ' + m + ' ' + '月' + ' ' + d + ' ' + '日'
 *
 * @param date
 * @returns string
 */
export function convertToJpDate(date: string | undefined): string {
  if (date === undefined || date === null || date === '') {
    return '';
  }
  const dateObj = new Date(date);
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  return y + ' ' + '年' + ' ' + m + ' ' + '月' + ' ' + d + ' ' + '日';
}

/**
 * 数字のみの電話番号をハイフン付きの電話番号へ変換
 *
 * 前3桁、中、後4桁をハイフンで結合して返す（03から始まる場合は前2桁）
 * 空文字、undefined、nullの場合は空文字を返す
 *
 * @param phoneNumber 9 ~ 14 桁の半角数字
 * @returns string
 */
export function phoneNumberFormatter(phoneNumber: string | undefined): string {
  // 空文字、undefined、nullの場合は空文字を返す
  if (phoneNumber === undefined || phoneNumber === null || phoneNumber === '') {
    return '';
  }

  const regex = /^\d{9,14}$/;
  if (!regex.test(phoneNumber)) {
    return '';
  }

  let front = null;
  let inside = null;

  if (phoneNumber.startsWith('03')) {
    front = phoneNumber.slice(0, 2);
    inside = phoneNumber.slice(2, phoneNumber.length - 4);
  } else {
    front = phoneNumber.slice(0, 3);
    inside = phoneNumber.slice(3, phoneNumber.length - 4);
  }
  const later = phoneNumber.slice(-4);

  return front + '-' + inside + '-' + later;
}

/**
 * 数字のみ郵便番号をハイフン付きの郵便番号に変換
 *
 * 前3桁、後4桁をハイフンで結合して返す
 * 空文字、undefined、nullの場合は空文字を返す
 *
 * @param postalCode 9 桁の半角数字
 * @returns string
 */
export function postalCodeFormatter(postalCode: string | undefined): string {
  // 空文字、undefined、nullの場合は空文字を返す
  if (postalCode === undefined || postalCode === null || postalCode === '') {
    return '';
  }

  const regex = /^\d{7}$/;
  if (!regex.test(postalCode)) {
    return '';
  }
  const front = postalCode.slice(0, 3);
  const later = postalCode.slice(-4);

  return front + '-' + later;
}

/**
 * オブジェクトの配列をCSVデータのBlobに変換します。
 * @param data - CSVに変換されるオブジェクトの配列。
 * @returns - CSVデータの Blob オブジェクト。
 */
export function convertArrayToCsvBlob(data: any[]): Blob {
  // 配列の中身を行単位で格納する配列の宣言と初期化
  const csvRows: string[] = [];
  // 1行目のデータからタイトル行（ヘッダー）を作成
  const headers = Object.keys(data[0]);
  // タイトル行（ヘッダー）をカンマ区切りにして追加
  csvRows.push(headers.join(','));
  // 配列を1行単位で処理
  for (const row of data) {
    // タイトル（ヘッダー）の文字列から値を取り出しダブルクォーテーションをエスケープ
    const values = headers.map((header) => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    // カンマ区切りにして配列に追加
    csvRows.push(values.join(','));
  }
  // 各行を改行文字で区切ってcsvデータにする
  const csvData = csvRows.join('\n');
  // mimeTypeを指定
  const mimeType = 'text/csv';
  // Blobに変換して返す
  return new Blob([csvData], { type: mimeType });
}

/**
 * オブジェクトから`null`と空文字、未定義の項目を除外する処理。
 * 再帰的なチェックは行われません。
 * @param obj 対象となるオブジェクト（JSON）
 * @returns 空文字、`null`、`undefined`の項目が除外された`obj`
 */
export function removeNullsAndBlanks(obj: object) {
  const ret = {} as any;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      ret[key] = value;
    }
  }
  return ret as object;
}

/**
 * 絞り込み用フォームにて、グループとして定義された`created_at`と`updated_at`を展開して、
 * 親コンポーネントへの返却用オブジェクトへ変換する処理。
 * @param formValue フォームに設定された値のオブジェクト。
 * @returns 親コンポーネントへの返却用オブジェクト。
 */
export function flattingFormValue(formValue: object) {
  const ret = {} as any;
  for (const [key, value] of Object.entries(formValue)) {
    if (
      value !== null &&
      !(value instanceof Date) &&
      typeof value === 'object'
    ) {
      for (const [cKey, cValue] of Object.entries(flattingFormValue(value))) {
        ret[`${cKey}_${key}`] =
          cValue instanceof Date ? cValue.toLocaleDateString() : cValue;
      }
      continue;
    }
    ret[key] = value;
  }
  return ret as object;
}

/**
 * string型の数字のパスパラメータ・クエリパラメータを受け取り正当性を確認
 * @param parameter
 * @returns
 */
export function isParameterInvalid(parameter: string): boolean {
  if (parameter === null) {
    // パラメータ取得エラー
    return true;
  } else if (isNaN(Number(parameter))) {
    // number型へのキャストエラー
    return true;
  }
  return false;
}

// 端数処理のタイプ定義
export type RoundingMethod = 'floor' | 'ceil' | 'round';

/**
 * 端数処理区分コードから端数処理に利用するMathオブジェクトのメソッド名を返す
 *
 * @param salesFractionDivisionCode
 * @returns RoundingMethod 型のMathオブジェクトのメソッド名 引数が不正な場合は切り下げを返す
 */
export function getFractionMethod(salesFractionDivisionCode: number) {
  let fractionMethod: RoundingMethod;
  switch (salesFractionDivisionCode) {
    case taxFractionConst.FRACTION_DIVISION_CODE.ROUND_DOWN: // 切り下げ
      fractionMethod = taxFractionConst.FRACTION_DIVISION_METHOD
        .ROUND_DOWN as RoundingMethod;
      break;
    case taxFractionConst.FRACTION_DIVISION_CODE.ROUND_UP: // 切り上げ
      fractionMethod = taxFractionConst.FRACTION_DIVISION_METHOD
        .ROUND_UP as RoundingMethod;
      break;
    case taxFractionConst.FRACTION_DIVISION_CODE.ROUND: // 四捨五入
      fractionMethod = taxFractionConst.FRACTION_DIVISION_METHOD
        .ROUND as RoundingMethod;
      break;
    default: // デフォルトで切り下げ
      fractionMethod = taxFractionConst.FRACTION_DIVISION_METHOD
        .ROUND_DOWN as RoundingMethod;
      break;
  }
  return fractionMethod;
}

/**
 * 消費税区分コードから税率と税込・税抜のフラグを生成
 *
 * @param salesTaxDivisionCode
 * @returns - { taxRate: 税率, isTaxIncluded: true:税込 or false:税抜 } 引数が不正な場合は内税10%を返す
 */
export function getTaxRateAndTaxIncludedFlag(salesTaxDivisionCode: number) {
  let taxRate: number;
  let isTaxIncluded: boolean;
  switch (salesTaxDivisionCode) {
    case taxFractionConst.TAX_STATUS_CODE.TAX_EXCLUDED_10: // 外税10%
      taxRate = taxFractionConst.TAX.TAX_EXCLUDED_10;
      isTaxIncluded = false;
      break;
    case taxFractionConst.TAX_STATUS_CODE.TAX_INCLUDED_10: // 内税10%
      taxRate = taxFractionConst.TAX.TAX_INCLUDED_10;
      isTaxIncluded = true;
      break;
    case taxFractionConst.TAX_STATUS_CODE.TAX_EXCLUDED_8: // 外税8%
      taxRate = taxFractionConst.TAX.TAX_EXCLUDED_8;
      isTaxIncluded = false;
      break;
    case taxFractionConst.TAX_STATUS_CODE.TAX_INCLUDED_8: // 内税8%
      taxRate = taxFractionConst.TAX.TAX_INCLUDED_8;
      isTaxIncluded = true;
      break;
    case taxFractionConst.TAX_STATUS_CODE.NO_TAX: // 非課税含む
      taxRate = taxFractionConst.TAX.NO_TAX;
      isTaxIncluded = true;
      break;
    default: // デフォルトは税込10%
      taxRate = taxFractionConst.TAX.TAX_INCLUDED_10;
      isTaxIncluded = true;
      break;
  }
  return { taxRate: taxRate, isTaxIncluded: isTaxIncluded };
}

// 税込み価格、税抜き価格、税金を計算する関数
/**
 * 価格、税率、内税・外税、端数処理タイプから税込価格・税抜価格・消費税を計算する
 * @param basePrice - 価格
 * @param taxRate - 税率
 * @param isTaxIncluded - 税込：true、税抜：false
 * @param roundingMethod - RoundingMethod型 'floor' | 'ceil' | 'round'
 * @returns - 税込価格・税抜価格・消費税額
 */
export function calculatePrice(
  basePrice: number,
  taxRate: number,
  isTaxIncluded: boolean,
  roundingMethod: RoundingMethod
) {
  try {
    // 税額
    let taxAmount: number = 0;
    // 税込価格
    let priceWithTax: number = 0;
    // 税抜価格
    let priceWithoutTax: number = 0;

    // 税込価格または税抜価格をisTaxIncludedで判断して計算する
    if (isTaxIncluded) {
      // 税抜価格を計算
      priceWithoutTax = basePrice / (1 + taxRate / 100);
      // 税額を計算
      taxAmount = basePrice - priceWithoutTax;
    } else {
      // 税額を計算
      taxAmount = basePrice * (taxRate / 100);
      // 税込価格を計算
      priceWithTax = basePrice + taxAmount;
    }

    // 端数処理の適用
    switch (roundingMethod) {
      case 'floor':
        taxAmount = Math.floor(taxAmount);
        break;
      case 'ceil':
        taxAmount = Math.ceil(taxAmount);
        break;
      case 'round':
        taxAmount = Math.round(taxAmount);
        break;
    }

    // 端数処理後の税込み価格と税抜き価格の計算
    if (isTaxIncluded) {
      // 税抜価格
      priceWithoutTax = Math[roundingMethod](priceWithoutTax);
      // 税込価格
      priceWithTax = basePrice;
    } else {
      // 税込価格
      priceWithTax = Math[roundingMethod](priceWithTax);
      // 税抜価格
      priceWithoutTax = basePrice;
    }

    // 結果をオブジェクトとして返す
    return {
      priceWithTax,
      priceWithoutTax,
      taxAmount,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    } else {
      return new Error('An unknown error occurred.');
    }
  }
}

/**
 * 価格を丸める（ニッシン様売価まるめ指示）
 * ・3桁丸めない(小数点以下は四捨五入)
 * ・税込み1,000円以上9,999以下 1の位を丸める（5円以上は10円に四捨五入）
 * ・税込み10,000円以上 10の位を丸める(50円以上は100円に四捨五入)
 * @param price
 * @returns
 */
export function roundPrice(price: number): number {
  let roundedPrice = price;

  if (price < 1000) {
    // 3桁以下なので丸めない(小数点以下は四捨五入)
    roundedPrice = Math.round(price);
  } else if (price >= 1000 && price < 10000) {
    // 税込み1,000円以上9,999以下の場合、1の位を丸める
    roundedPrice = Math.round(price / 10) * 10;
  } else if (price >= 10000) {
    // 税込み10,000円以上の場合、10の位を丸める
    roundedPrice = Math.round(price / 100) * 100;
  }
  return roundedPrice;
}

/**
 * 2つの日付の差分を日数で返す
 * @param date1
 * @param date2
 * @returns
 */
export function daysBetweenDates(date1: Date, date2: Date): number {
  // 1日のミリ秒数 (24 * 60 * 60 * 1000)
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  // 日付をミリ秒に変換し、差分を計算
  const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());

  // ミリ秒を日数に変換
  const days = Math.round(differenceInMilliseconds / oneDayInMilliseconds);

  return days;
}

/**
 * 値がnull、またはundefined、または空文字かどうかを判定する
 * @param value any
 * @returns boolean true: null、またはundefined、または空文字 false: それ以外
 */
export function isEmptyOrNull(value: any): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * オブジェクトがnull、またはundefined、または空オブジェクトかどうかを判定する
 * @param obj any
 * @returns boolean true: null、またはundefined、または空オブジェクト false: それ以外
 */
export function isObjectEmptyOrNull(obj: any): boolean {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
}

/**
 * マスタ名と拡張子を受け取って、ファイル名を作成して返す。
 * 例：商品マスタ → 商品マスタ_20210901_1200.csv
 * @param fileNamePrefix マスタ名
 * @param fileExtension 拡張子（デフォルト：csv）
 * @returns string
 */
export function createFileNameWithDate(
  fileNamePrefix: string,
  fileExtension: string = 'csv'
): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hour = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');

  const fullFileName = `${fileNamePrefix}_${year}${month}${day}_${hour}${minutes}.${fileExtension}`;
  return fullFileName;
}
