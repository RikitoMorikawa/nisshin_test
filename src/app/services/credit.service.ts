import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { CreditApiResponse } from '../models/credit';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class CreditService extends HttpService {
  // クレジットのエンドポイント
  readonly endpoint = protectedResources.creditApi.endpoint;

  /**
   * クレジットAPIへGETリクエストを送信
   * @param params クレジットの絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<CreditApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CreditApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('クレジット一覧の取得')));
  }

  /**
   * クレジットAPI/{クレジットid}へGETリクエストを送信
   * @param id 取得するクレジットレコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<CreditApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('クレジット情報の取得')));
  }

  /**
   * クレジットAPIへPOSTリクエストを送信
   * @param qualityCustomer 登録するクレジット情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(credit: any): Observable<CreditApiResponse> {
    const formData = this.generateFormData(credit);
    return this.http
      .post<CreditApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('クレジット情報の登録')));
  }

  /**
   * クレジットAPI/{クレジットid}へPATCHリクエストを送信
   * @param id 更新するクレジットレコードのID
   * @param qualityCustomer 更新するクレジット情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(id: number, credit: any): Observable<CreditApiResponse> {
    const formData = this.generateFormData(credit);
    return this.http
      .patch<CreditApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('クレジット情報の更新')));
  }

  /**
   * クレジットAPI/{クレジットid}へDELETEリクエストを送信
   * @param id 削除するクレジットレコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<CreditApiResponse> {
    return this.http
      .delete<CreditApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('クレジット情報の削除')));
  }
}
