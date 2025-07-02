import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { AccountsReceivableBalanceApiResponse } from '../models/accounts-receivable-balance';
import { HttpService } from './shared/http.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AccountsReceivableBalanceService extends HttpService {
  // 売上残高のエンドポイント
  readonly endpoint = protectedResources.accountsReceivableBalanceApi.endpoint;

  /**
   * 売上残高APIへ`GET`リクエストを送信。
   * @param params 売上残高の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(
    params: object = {}
  ): Observable<AccountsReceivableBalanceApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<AccountsReceivableBalanceApiResponse>(
        this.endpoint,
        this.httpOptions
      )
      .pipe(catchError(this.setErrorMessage('売上残高一覧の取得')));
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
   *  売掛残高集計
   * @param aggregate
   * @returns
   */
  aggregate(
    aggregate_data: any
  ): Observable<AccountsReceivableBalanceApiResponse> {
    const formData = this.generateFormData(aggregate_data);
    return this.http.post<AccountsReceivableBalanceApiResponse>(
      `${this.endpoint}/aggregate`,
      formData
    );
  }
}
