import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { Gift4ApiResponse } from '../models/gift4';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class Gift4Service extends HttpService {
  // クレジットのエンドポイント
  readonly endpoint = protectedResources.gift4Api.endpoint;

  /**
   * クレジットAPIへGETリクエストを送信
   * @param params クレジットの絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<Gift4ApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<Gift4ApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('クレジット一覧の取得')));
  }

  /**
   * クレジットAPI/{クレジットid}へGETリクエストを送信
   * @param id 取得するクレジットレコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<Gift4ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('クレジット情報の取得')));
  }

  /**
   * クレジットAPIへPOSTリクエストを送信
   * @param qualityCustomer 登録するクレジット情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(gift4: any): Observable<Gift4ApiResponse> {
    const formData = this.generateFormData(gift4);
    return this.http
      .post<Gift4ApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('クレジット情報の登録')));
  }

  /**
   * クレジットAPI/{クレジットid}へPATCHリクエストを送信
   * @param id 更新するクレジットレコードのID
   * @param qualityCustomer 更新するクレジット情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(id: number, gift4: any): Observable<Gift4ApiResponse> {
    const formData = this.generateFormData(gift4);
    return this.http
      .patch<Gift4ApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('クレジット情報の更新')));
  }

  /**
   * クレジットAPI/{クレジットid}へDELETEリクエストを送信
   * @param id 削除するクレジットレコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<Gift4ApiResponse> {
    return this.http
      .delete<Gift4ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('クレジット情報の削除')));
  }
}
