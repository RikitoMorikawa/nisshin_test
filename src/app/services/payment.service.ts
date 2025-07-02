import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { PaymentApiResponse } from '../models/payment';
import { HttpService } from './shared/http.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PaymentService extends HttpService {
  // 支払伝票のエンドポイント
  readonly endpoint = protectedResources.paymentApi.endpoint;

  /**
   * 支払伝票情報APIへ`GET`リクエストを送信。
   * @param params 支払伝票情報の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PaymentApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PaymentApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('支払伝票一覧の取得')));
  }

  /**
   * `支払伝票情報API/{支払伝票情報id}`へ`GET`リクエストを送信。
   * @param id 取得する支払伝票情報のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PaymentApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('支払伝票情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して配送APIへ`GET`リクエストを送信。
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
   * 支払伝票APIへ`POST`リクエストを送信
   * @param {Deposit} deposit 登録する支払伝票情報を格納したオブジェクト
   * @return レスポンスの`Observable`
   */
  add(payment: any): Observable<PaymentApiResponse> {
    const formData = this.generateFormData(payment);
    return this.http
      .post<PaymentApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('支払伝票情報の登録')));
  }

  /**
   * `支払伝票API/{支払伝票id}`へ`PATCH`リクエストを送信。
   * @param id 更新する支払伝票のレコードID。
   * @param payment 更新する支払伝票情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, payment: any): Observable<PaymentApiResponse> {
    const formData = this.generateFormData(payment);
    return this.http.patch<PaymentApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * `支払伝票API/{支払伝票id}`へ`DELETE`リクエストを送信。
   * @param id 削除する支払伝票のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PaymentApiResponse> {
    return this.http
      .delete<PaymentApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('支払伝票の削除')));
  }
}
