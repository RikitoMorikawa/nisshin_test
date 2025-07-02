import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { PurchaseOrderApiResponse } from '../models/purchase-order';
import { PurchaseOrderCreationApiResponse } from '../models/purchase-order-creation';
/**
 * 発注書サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService extends HttpService {
  // 発注書APIのエンドポイント
  readonly endpoint = protectedResources.purchaseOrderApi.endpoint;
  // 発注書発行APIのエンドポイント
  readonly issueEndpoint =
    protectedResources.purchaseOrderIssueReceptionSlipApi.endpoint;

  /**
   * 発注書APIへ`GET`リクエストを送信。
   * @param params 発注書の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PurchaseOrderApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PurchaseOrderApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('発注書一覧の取得')));
  }

  /**
   * `発注書API/{発注書id}`へ`GET`リクエストを送信。
   * @param id 取得する発注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PurchaseOrderApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('発注書の取得')));
  }

  /**
   * 発注書APIへ`POST`リクエストを送信。
   * @param order 登録する発注書情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(order: any): Observable<PurchaseOrderApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .post<PurchaseOrderApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('発注書の登録')));
  }
  /**
   * `発注書API/`へ`PUT`リクエストを送信。
   * @param order 発注データの取得範囲の日時を格納したオブジェクト
   * @returns レスポンスの`Observable`。
   */
  put(order: any): Observable<PurchaseOrderCreationApiResponse> {
    console.log(order);
    const formData2 = this.generateFormData(order);
    const formData = new FormData();
    formData.append('from_date_of_sale', order.from_date_of_sale);
    formData.append('to_date_of_sale', order.to_date_of_sale);
    console.log(formData.get('from_date_of_sale'));
    console.log(formData.get('to_date_of_sale'));
    console.log(formData2.get('from_date_of_sale'));
    console.log(formData2.get('to_date_of_sale'));

    return this.http.put<PurchaseOrderCreationApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   * `発注書API/{発注書id}`へ`PATCH`リクエストを送信。
   * @param id 更新する発注書のレコードID。
   * @param order 更新する発注書を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, order: any): Observable<PurchaseOrderApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<PurchaseOrderApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('発注書の更新')));
  }

  /**
   * `発注書API/{発注書id}`へ`DELETE`リクエストを送信。
   * @param id 削除する発注書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PurchaseOrderApiResponse> {
    return this.http
      .delete<PurchaseOrderApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('発注書の削除')));
  }

  /**
   * `発注書API/{発注書id}`へ`DELETE`リクエストを送信。
   * @param id 削除する発注書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  listremove(id_list: string): Observable<PurchaseOrderApiResponse> {
    return this.http
      .delete<PurchaseOrderApiResponse>(
        `${this.endpoint}/?delete_id=${id_list}`
      )
      .pipe(catchError(this.setErrorMessage('発注書の削除')));
  }

  /**
   * `発注書発行API/{発注書id}`へ`GET`リクエストを送信。
   * @param id PDFを発行する発注書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  createPdf(id: number) {
    console.log(this.issueEndpoint);
    return this.http
      .get<PurchaseOrderApiResponse>(`${this.issueEndpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('発注書PDFの作成')));
  }
}
