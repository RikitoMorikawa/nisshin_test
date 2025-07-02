import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { BillApiResponse } from '../models/bill';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class BillService extends HttpService {
  // 請求のエンドポイント
  readonly endpoint = protectedResources.billApi.endpoint;

  /**
   * 請求情報APIへ`GET`リクエストを送信。
   * @param params 請求情報の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<BillApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<BillApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('請求一覧の取得')));
  }

  /**
   * 請求情報を取得
   *
   * @param {number} id 請求ID
   * @return Observable<BillApiResponse>
   */
  find(id: number): Observable<BillApiResponse> {
    return this.http.get<BillApiResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * 請求情報を削除
   *
   * @param {number} id 請求ID
   * @return Observable<BillApiResponse>
   */
  remove(id: number): Observable<BillApiResponse> {
    return this.http.delete<BillApiResponse>(
      `${this.endpoint}/${id}`,
      this.httpOptions
    );
  }
}
