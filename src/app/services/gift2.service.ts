import { Injectable } from '@angular/core';
import { observable, catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { Gift2ApiResponse } from '../models/gift2';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class Gift2Service extends HttpService {
  // ギフト２のエンドポイント
  readonly endpoint = protectedResources.gift2Api.endpoint;

  /**
   * ギフト２APIへGETリクエストを送信
   * @param params ギフト２の絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<Gift2ApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<Gift2ApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('ギフト２一覧の取得')));
  }

  /**
   * ギフト２API/{ギフト２id}へGETリクエストを送信
   * @param id 取得するギフト２レコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<Gift2ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('ギフト２情報の取得')));
  }

  /**
   * ギフト２APIへPOSTリクエストを送信
   * @param qualityCustomer 登録するギフト２情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(gift2: any): Observable<Gift2ApiResponse> {
    const formData = this.generateFormData(gift2);
    return this.http
      .post<Gift2ApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('ギフト２情報の登録')));
  }

  /**
   * ギフト２API/{ギフト２id}へPATCHリクエストを送信
   * @param id 更新するギフト２レコードのID
   * @param qualityCustomer 更新するギフト２情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(id: number, gift2: any): Observable<Gift2ApiResponse> {
    const formData = this.generateFormData(gift2);
    return this.http
      .patch<Gift2ApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('ギフト２情報の更新')));
  }

  /**
   * ギフト２API/{ギフト２id}へDELETEリクエストを送信
   * @param id 削除するギフト２レコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<Gift2ApiResponse> {
    return this.http
      .delete<Gift2ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('ギフト２情報の削除')));
  }
}
