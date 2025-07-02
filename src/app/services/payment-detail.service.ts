import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { PaymentDetailApiResponse } from '../models/payment-detail';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PaymentDetailService extends HttpService {
  // 支払明細APIのエンドポイント
  readonly endpoint = protectedResources.paymentDetailApi.endpoint;

  /**
   * 支払明細APIへ`GET`リクエストを送信。
   * @param params 支払明細の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PaymentDetailApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PaymentDetailApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('支払明細一覧の取得')));
  }

  /**
   * `支払明細API/{支払明細id}`へ`GET`リクエストを送信。
   * @param id 取得する支払明細のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PaymentDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('支払明細情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して支払明細APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv', params: object = {}) {
    const options: object = {
      params,
      responseType: 'text',
      headers: new HttpHeaders({ 'X-Download': type }),
    };
    return this.http
      .get<string>(this.endpoint, options)
      .pipe(
        catchError(this.setErrorMessage('一括登録用テンプレートファイルの取得'))
      );
  }

  /**
   * 支払明細APIへ`POST`リクエストを送信。
   * @param paymentDetail 登録する支払明細情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(paymentDetail: any): Observable<PaymentDetailApiResponse> {
    const formData = this.generateFormData(paymentDetail);
    return this.http
      .post<PaymentDetailApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('支払明細情報の登録')));
  }

  /**
   * `支払明細API/{支払明細id}`へ`PATCH`リクエストを送信。
   * @param id 更新する支払明細のレコードID。
   * @param paymentDetail 更新する支払明細情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, paymentDetail: any): Observable<PaymentDetailApiResponse> {
    const formData = this.generateFormData(paymentDetail);
    return this.http
      .patch<PaymentDetailApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('支払明細情報の更新')));
  }

  /**
   * `支払明細API/{支払明細id}`へ`DELETE`リクエストを送信。
   * @param id 削除する支払明細のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: string | null): Observable<PaymentDetailApiResponse> {
    return this.http
      .delete<PaymentDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('支払明細情報の削除')));
  }
}
