import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable, Subject } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AccountsPayableAggregateApiResponse } from '../models/accounts-payable-aggregate';

export type PaymentData = {
  id: number;
  payment_date: string;
  payment_amount: string;
};

@Injectable({
  providedIn: 'root',
})
export class AccountsPayableAggregateService extends HttpService {
  /**
   * 買掛集計 エンドポイント
   */
  endpoint: string = protectedResources.accountsPayableAggregateApi.endpoint;

  /**
   * 買掛集計情報を取得（一覧）
   *
   * @return Observable<AccountsPayableAggregateApiResponse>
   */
  getAll(params: object = {}): Observable<AccountsPayableAggregateApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<AccountsPayableAggregateApiResponse>(
      this.endpoint,
      this.httpOptions
    );
  }

  /**
   * 買掛集計情報を取得
   *
   * @param {number} id 買掛集計ID
   * @return Observable<AccountsPayableAggregateApiResponse>
   */
  find(id: number): Observable<AccountsPayableAggregateApiResponse> {
    return this.http.get<AccountsPayableAggregateApiResponse>(
      `${this.endpoint}/${id}`
    );
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して買掛集計APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv') {
    const options: object = {
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
   * 買掛集計情報を登録
   * @param accountsPayableAggregate
   * @returns
   */
  add(
    accountsPayableAggregate: any
  ): Observable<AccountsPayableAggregateApiResponse> {
    const formData = this.generateFormData(accountsPayableAggregate);
    return this.http.post<AccountsPayableAggregateApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   *  買掛集計(月指定)
   * @param aggregate
   * @returns
   */
  aggregate(
    aggregate_data: any
  ): Observable<AccountsPayableAggregateApiResponse> {
    const formData = this.generateFormData(aggregate_data);
    return this.http.post<AccountsPayableAggregateApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   * 買掛集計一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<AccountsPayableAggregateApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<AccountsPayableAggregateApiResponse>(
      this.endpoint,
      formData
    );
  }

  /**
   * 買掛集計情報を更新
   * @param id
   * @param accountsPayableAggregate
   * @returns
   */
  update(
    id: number,
    accountsPayableAggregate: any
  ): Observable<AccountsPayableAggregateApiResponse> {
    const formData = this.generateFormData(accountsPayableAggregate);
    return this.http.patch<AccountsPayableAggregateApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * 買掛集計情報を削除
   *
   * @param {number} id 買掛集計ID
   * @return Observable<AccountsPayableAggregateApiResponse>
   */
  remove(id: number): Observable<AccountsPayableAggregateApiResponse> {
    return this.http.delete<AccountsPayableAggregateApiResponse>(
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
}
