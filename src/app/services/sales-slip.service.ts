import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SalesSlipApiResponse } from '../models/sales-slip';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class SalesSlipService extends HttpService {
  // 売上伝票のエンドポイント
  readonly endpoint = protectedResources.salesSlipApi.endpoint;

  /**
   * 売上伝票APIへ`GET`リクエストを送信。
   * @param params 売上伝票の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<SalesSlipApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<SalesSlipApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('売上伝票一覧の取得')));
  }

  /**
   * `売上伝票API/{売上伝票id}`へ`GET`リクエストを送信。
   * @param id 取得する売上伝票のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number): Observable<SalesSlipApiResponse> {
    return this.http
      .get<SalesSlipApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('売上伝票情報の取得')));
  }

  /**
   * 売上伝票API/{売上伝票id}へ`PATCH`リクエストを送信。
   * @param id 更新する売上伝票のレコードID。
   * @param order 更新する売上伝票を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   **/

  update(id: number, order: any): Observable<SalesSlipApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<SalesSlipApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('売上伝票の更新')));
  }

  remove(id: number): Observable<SalesSlipApiResponse> {
    return this.http
      .delete<SalesSlipApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('売上伝票の削除')));
  }
}
