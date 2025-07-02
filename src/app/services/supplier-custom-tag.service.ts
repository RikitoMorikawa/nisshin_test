import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { SupplierCustomTagApiResponse } from '../models/supplier-custom-tag';

@Injectable({
  providedIn: 'root',
})
export class SupplierCustomTagService extends HttpService {
  // 仕入先カスタムタグ関連のエンドポイント
  readonly endpoint = protectedResources.supplierCustomTagApi.endpoint;

  /**
   * 仕入先カスタムタグ関連APIへ`GET`リクエストを送信。
   * @param params 仕入先カスタムタグ関連の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<SupplierCustomTagApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<SupplierCustomTagApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('カスタムタグ関連テーブルの取得')));
  }

  /**
   * 仕入先IDを指定して`getAll`メソッドを実行。
   * @param supplierId 取得対象の仕入先ID。
   * @returns レスポンスの`Observable`。
   */
  getRelatedCustomTags(supplierId: number) {
    const params = { supplier_id: supplierId };
    return this.getAll(params);
  }
}
