import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable, Subject } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AccountsReceivableAggregateApiResponse } from '../models/accounts-receivable-aggregate';

export type PaymentData = {
  id: number;
  payment_date: string;
  payment_amount: string;
};

@Injectable({
  providedIn: 'root',
})
export class AccountsReceivableAggregateService extends HttpService {
  /**
   * 売掛集計 エンドポイント
   */
  endpoint: string = protectedResources.accountsReceivableAggregateApi.endpoint;

  /**
   * 売掛集計情報を取得（一覧）
   *11
   * @return Observable<AccountsReceivableAggregateApiResponse>
   */
  getAll(
    params: object = {}
  ): Observable<AccountsReceivableAggregateApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<AccountsReceivableAggregateApiResponse>(
      this.endpoint,
      this.httpOptions
    );
  }

  /**
   * 売掛集計情報を取得
   *
   * @param {number} id 売掛集計ID
   * @return Observable<AccountsReceivableAggregateApiResponse>
   */
  find(id: number): Observable<AccountsReceivableAggregateApiResponse> {
    return this.http.get<AccountsReceivableAggregateApiResponse>(
      `${this.endpoint}/${id}`
    );
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して売掛集計APIへ`GET`リクエストを送信。
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
   * ヘッダに`X-Download`のパラメータを指定して売掛集計APIへ`GET`リクエストを送信。
   * @param type 取得するPDFのタイプ。
   * @returns PDF形式のファイルを返す`Observable`。
   */
  getPdf(type: 'bulk-pdf', params: object = {}) {
    const options: object = {
      params,
      responseType: 'blob',
      headers: new HttpHeaders({ 'X-Download': type }),
    };
    return this.http
      .get<string>(this.endpoint, options)
      .pipe(catchError(this.setErrorMessage('請求書PDF一括ダウンロード')));
  }

  /**
   * 売掛集計情報を登録
   * @param accountsReceivableAggregate
   * @returns
   */
  add(
    accountsReceivableAggregate: any
  ): Observable<AccountsReceivableAggregateApiResponse> {
    const formData = this.generateFormData(accountsReceivableAggregate);
    return this.http.post<AccountsReceivableAggregateApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   *  売掛集計(月指定)
   * @param aggregate
   * @returns
   */
  aggregate(
    aggregate_data: any
  ): Observable<AccountsReceivableAggregateApiResponse> {
    const formData = this.generateFormData(aggregate_data);
    return this.http.post<AccountsReceivableAggregateApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   * 売掛集計一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<AccountsReceivableAggregateApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<AccountsReceivableAggregateApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   * 売掛集計情報を更新
   * @param id
   * @param accountsReceivableAggregate
   * @returns
   */
  update(
    id: number,
    accountsReceivableAggregate: any
  ): Observable<AccountsReceivableAggregateApiResponse> {
    const formData = this.generateFormData(accountsReceivableAggregate);
    return this.http.patch<AccountsReceivableAggregateApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * 売掛集計情報を削除
   *
   * @param {number} id 売掛集計ID
   * @return Observable<AccountsReceivableAggregateApiResponse>
   */
  remove(id: number): Observable<AccountsReceivableAggregateApiResponse> {
    return this.http.delete<AccountsReceivableAggregateApiResponse>(
      `${this.endpoint}/${id}`,
      this.httpOptions
    );
  }

  // 入金登録用のイベントソース
  private _paymentEventSource = new Subject<PaymentData>();
  // 入金登録用のイベントソースを公開する
  paymentEvent$ = this._paymentEventSource.asObservable();

  // 入金登録用のイベントソースを発火する
  sendPaymentEvent(data: PaymentData) {
    // 入金登録用のイベントソースにデータを流す
    this._paymentEventSource.next(data);
  }

  /**
   * `発注書API/{発注書id}`へ`DELETE`リクエストを送信。
   * @param id 削除する発注書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  listremove(
    id_list: string
  ): Observable<AccountsReceivableAggregateApiResponse> {
    return this.http
      .delete<AccountsReceivableAggregateApiResponse>(
        `${this.endpoint}/?delete_id=${id_list}`
      )
      .pipe(catchError(this.setErrorMessage('請求の削除')));
  }
}
