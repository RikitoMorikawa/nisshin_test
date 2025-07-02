import { Injectable } from '@angular/core';

export interface SelectOption {
  value: number | string;
  text: string;
  code: number;
}

/**
 * 料金計算サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PriceService {
  /**
   * 売価の取得
   *
   * @param costPrice コスト
   * @param grossProfitRate 粗利率
   * @param taxCode 税率区分コード 1: 外税10% / 2: 内税10% / 4: 外税 8%
   *
   * @return salesPrice 売価
   */
  public getSalesPrice(
    costPrice: number,
    grossProfitRate: number,
    taxCode: number
  ): number {
    const taxRate = this._getTaxRate(taxCode);

    const tmpSalesPrice =
      (Number(costPrice) / (1 - Number(grossProfitRate) / 100)) * taxRate;
    const salesPrice = this._roundPrice(tmpSalesPrice);

    return salesPrice;
  }

  /**
   * 粗利率の取得
   *
   * @param costPrice コスト
   * @param salesPrice 売価
   * @param taxCode 税率区分コード 1: 外税10% / 2: 内税10% / 4: 外税 8%
   *
   * @return grossProfitRate 粗利率
   */
  public getGrossProfitRate(
    costPrice: number,
    salesPrice: number,
    taxCode: number
  ): number {
    const taxRate = this._getTaxRate(taxCode);

    //const tmpSalesPrice = (Number(costPrice) / (1 - Number(grossProfitRate) / 100)) * taxRate;
    const tmpSalesPrice = salesPrice / taxRate;
    const grossProfitRate = ((tmpSalesPrice - costPrice) / tmpSalesPrice) * 100;
    return grossProfitRate;
  }

  /**
   * 税区分コードの取得
   *
   * @param taxCode 税率区分コード 1: 外税10% / 2: 内税10% / 4: 外税 8%
   * @return salesPrice 売価
   */
  //public getTaxCode(taxDivision: SelectOption[], taxDivisionId: number): number {
  public getTaxCode(taxDivision: any[], taxDivisionId: number): number {
    const index = taxDivision.findIndex((v) => v.value === taxDivisionId);
    const selectData: SelectOption = taxDivision[index];
    return selectData.code;
    //return this.options.tax_division[index];
  }

  /**
   * 丸め処理
   *
   * @param salesPrice 売価
   * @return salesPrice 売価
   */
  private _roundPrice(salesPcice: number): number {
    if (salesPcice < 3000) {
      return Math.round(salesPcice);
    }

    if (salesPcice < 10000) {
      return Math.round(salesPcice);
    }
    return Math.round(salesPcice / 100) * 100;
  }

  /**
   * 税率の取得
   *
   * @param taxCode 税率区分コード 1: 外税10% / 2: 内税10% / 4: 外税 8%
   * @return salesPrice 売価
   */
  private _getTaxRate(taxCode: number): number {
    // 外税10％
    if (taxCode === 1) {
      return 1.1;
    }

    // 外税8％
    if (taxCode === 4) {
      return 1.08;
    }

    // 非課税 内税8％ 内税10％
    return 1;
  }
}
