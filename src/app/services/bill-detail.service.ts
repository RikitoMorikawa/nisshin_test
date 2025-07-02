import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { BillDetailApiResponse } from '../models/bill-detail';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class BillDetailService extends HttpService {
  // 請求明細のエンドポイント
  readonly endpoint = protectedResources.billDetailApi.endpoint;

  /**
   * 請求明細情報APIへ`GET`リクエストを送信。
   * @param params 請求明細情報の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<BillDetailApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<BillDetailApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('請求明細一覧の取得')));
  }

  /**
   * 請求明細情報を取得
   *
   * @param {number} id 請求明細ID
   * @return Observable<BillDetailApiResponse>
   */
  find(id: number): Observable<BillDetailApiResponse> {
    return this.http.get<BillDetailApiResponse>(`${this.endpoint}/${id}`);
  }
}
