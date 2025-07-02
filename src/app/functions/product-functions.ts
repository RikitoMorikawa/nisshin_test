import { Product } from '../models/product';

/**
 * 商品の発注単位に対応した税込売価を計算する
 * 発注対象バーコード、発注単位に対応した売価が設定されていない場合0を返す
 *
 * @param product
 * @param quantity
 * @returns
 */
export function CalcSalesPriceIncludingTax(
  product: Product,
  quantity: number
): number {
  // 商品の発注対象バーコードを取得
  const orderingTargetBarcode = product.ordering_target_barcode;
  // 税込売価初期化
  let salesPriceIncludingTax = null;
  // 発注対象バーコードの種類に応じた処理を実行
  switch (orderingTargetBarcode) {
    case product.barcode:
      console.log('単品');
      salesPriceIncludingTax = product.selling_price * quantity;
      break;
    case product.b_barcode:
      console.log('小分け');
      const b_selling_price = product.b_selling_price
        ? product.b_selling_price
        : 0;
      salesPriceIncludingTax = b_selling_price * quantity;
      break;
    case product.c_barcode:
      console.log('ケース');
      const c_selling_price = product.c_selling_price
        ? product.c_selling_price
        : 0;
      salesPriceIncludingTax = c_selling_price * quantity;
      break;
    default:
      console.log('設定なし');
      salesPriceIncludingTax = 0;
      break;
  }
  return salesPriceIncludingTax;
}
