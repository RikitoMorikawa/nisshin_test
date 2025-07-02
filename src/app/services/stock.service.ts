import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { StockApiResponse } from '../models/stock';
import { HttpHeaders } from '@angular/common/http';

/**
 * 仕入先サービス
 */
@Injectable({
  providedIn: 'root',
})
export class StockService extends HttpService {
  // 仕入先APIのエンドポイント
  readonly endpoint = protectedResources.stockApi.endpoint;

  /**
   * 仕入先APIへ`GET`リクエストを送信。
   * @param params 仕入先の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<StockApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<StockApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('仕入先一覧の取得')));
  }

  /**
   * `仕入先API/{仕入先id}`へ`GET`リクエストを送信。
   * @param id 取得する仕入先のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<StockApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入先情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して仕入先APIへ`GET`リクエストを送信。
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
}
