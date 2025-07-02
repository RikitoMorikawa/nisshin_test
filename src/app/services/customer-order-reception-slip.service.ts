import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { CustomerOrderReceptionSlipApiResponse } from '../models/customer-order-reception-slip';
@Injectable({
  providedIn: 'root',
})
export class CustomerOrderReceptionSlipService extends HttpService {
  readonly endpoint = protectedResources.customerOrderReceptionSlipApi.endpoint;
  readonly issueEndpoint =
    protectedResources.customerOrderReceptionSlipIssueQuotationApi.endpoint;

  /**
   * 客注受付票APIへ`GET`リクエストを送信。
   * @param params 発注書の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(
    params: object = {}
  ): Observable<CustomerOrderReceptionSlipApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CustomerOrderReceptionSlipApiResponse>(
        this.endpoint,
        this.httpOptions
      )
      .pipe(catchError(this.setErrorMessage('客注受付票一覧の取得')));
  }

  /**
   * `客注受付票API/{客注受付票id}`へ`GET`リクエストを送信。
   * @param id 取得する発注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<CustomerOrderReceptionSlipApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('客注受付票の取得')));
  }

  /**
   * 客注受付票APIへ`POST`リクエストを送信。
   * @param order 登録する客注受付票情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(order: any): Observable<CustomerOrderReceptionSlipApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .post<CustomerOrderReceptionSlipApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('客注受付票の登録')));
  }

  /**
   * `客注受付票API/{客注受付票id}`へ`PATCH`リクエストを送信。
   * @param id 更新する客注受付票のレコードID。
   * @param order 更新する客注受付票を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    order: any
  ): Observable<CustomerOrderReceptionSlipApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<CustomerOrderReceptionSlipApiResponse>(
        `${this.endpoint}/${id}`,
        formData
      )
      .pipe(catchError(this.setErrorMessage('客注受付票の更新')));
  }

  /**
   * `客注受付票API/{客注受付票id}`へ`DELETE`リクエストを送信。
   * @param id 削除する客注受付票のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<CustomerOrderReceptionSlipApiResponse> {
    return this.http
      .delete<CustomerOrderReceptionSlipApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('客注受付票の削除')));
  }

  createPdf(id: number) {
    return this.http
      .get<CustomerOrderReceptionSlipApiResponse>(
        `${this.issueEndpoint}/${id}/1`
      )
      .pipe(catchError(this.setErrorMessage('客注見積書の作成')));
  }

  /**
   * `客注受付票API/{客注受付票id}/to-purchase-order`へ`GET`リクエストを送信。
   * @param id 取得する発注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  toPurchaseOrder(id: number) {
    return this.http
      .get<CustomerOrderReceptionSlipApiResponse>(
        `${this.endpoint}/${id}/to-purchase-order`
      )
      .pipe(catchError(this.setErrorMessage('発注データ作成')));
  }
}
