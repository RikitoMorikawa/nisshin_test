import { Injectable } from '@angular/core';
import { observable, catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { Gift1ApiResponse } from '../models/gift1';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class Gift1Service extends HttpService {
  // ギフト１のエンドポイント
  readonly endpoint = protectedResources.gift1Api.endpoint;

  /**
   * ギフト１APIへGETリクエストを送信
   * @param params ギフト１の絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<Gift1ApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<Gift1ApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('ギフト１一覧の取得')));
  }

  /**
   * ギフト１API/{ギフト１id}へGETリクエストを送信
   * @param id 取得するギフト１レコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<Gift1ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('ギフト１情報の取得')));
  }

  /**
   * ギフト１APIへPOSTリクエストを送信
   * @param qualityCustomer 登録するギフト１情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(gift1: any): Observable<Gift1ApiResponse> {
    const formData = this.generateFormData(gift1);
    return this.http
      .post<Gift1ApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('ギフト１情報の登録')));
  }

  /**
   * ギフト１API/{ギフト１id}へPATCHリクエストを送信
   * @param id 更新するギフト１レコードのID
   * @param qualityCustomer 更新するギフト１情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(id: number, gift1: any): Observable<Gift1ApiResponse> {
    const formData = this.generateFormData(gift1);
    return this.http
      .patch<Gift1ApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('ギフト１情報の更新')));
  }

  /**
   * ギフト１API/{ギフト１id}へDELETEリクエストを送信
   * @param id 削除するギフト１レコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<Gift1ApiResponse> {
    return this.http
      .delete<Gift1ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('ギフト１情報の削除')));
  }
}
