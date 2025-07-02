import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SalesDetailApiResponse } from '../models/sales-detail';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class SalesDetailService extends HttpService {
  // 売上明細のエンドポイント
  readonly endpoint = protectedResources.salesDetailApi.endpoint;

  /**
   * 売上明細APIへ`GET`リクエストを送信。
   * @param params 売上明細の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<SalesDetailApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<SalesDetailApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('売上明細一覧の取得')));
  }

  /**
   * 売上伝票API/{売上伝票id}へ`PATCH`リクエストを送信。
   * @param id 更新する売上伝票のレコードID。
   * @param order 更新する売上伝票を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   **/

  update(id: number, order: any): Observable<SalesDetailApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<SalesDetailApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('売上伝票の更新')));
  }

  /**
   * `売上明細API/{売上明細id}`へ`GET`リクエストを送信。
   * @param id 取得する売上明細のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number): Observable<SalesDetailApiResponse> {
    return this.http
      .get<SalesDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('売上明細情報の取得')));
  }
}
