import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { ProductCustomTagApiResponse } from '../models/product-custom-tag';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class ProductCustomTagService extends HttpService {
  // 商品カスタムタグ関連APIのエンドポイント
  readonly endpoint = protectedResources.productCustomTagApi.endpoint;

  /**
   * 商品カスタムタグ関連APIへ`GET`リクエストを送信。
   * @param params 商品カスタムタグ関連の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}) {
    this.httpOptions.params = params;
    return this.http
      .get<ProductCustomTagApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('カスタムタグ関連テーブルの取得')));
  }

  /**
   * 仕入先IDを指定して`getAll`メソッドを実行。
   * @param productId 取得対象の仕入先ID。
   * @returns レスポンスの`Observable`。
   */
  getRelatedCustomTags(productId: number) {
    const params = { product_id: productId };
    return this.getAll(params);
  }
}
