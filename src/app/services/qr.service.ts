import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { QrApiResponse } from '../models/qr';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class QrService extends HttpService {
  // クレジットのエンドポイント
  readonly endpoint = protectedResources.qrApi.endpoint;

  /**
   * クレジットAPIへGETリクエストを送信
   * @param params クレジットの絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<QrApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<QrApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('クレジット一覧の取得')));
  }

  /**
   * クレジットAPI/{クレジットid}へGETリクエストを送信
   * @param id 取得するクレジットレコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<QrApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('クレジット情報の取得')));
  }

  /**
   * クレジットAPIへPOSTリクエストを送信
   * @param qualityCustomer 登録するクレジット情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(qr: any): Observable<QrApiResponse> {
    const formData = this.generateFormData(qr);
    return this.http
      .post<QrApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('クレジット情報の登録')));
  }

  /**
   * クレジットAPI/{クレジットid}へPATCHリクエストを送信
   * @param id 更新するクレジットレコードのID
   * @param qualityCustomer 更新するクレジット情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(id: number, qr: any): Observable<QrApiResponse> {
    const formData = this.generateFormData(qr);
    return this.http
      .patch<QrApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('クレジット情報の更新')));
  }

  /**
   * クレジットAPI/{クレジットid}へDELETEリクエストを送信
   * @param id 削除するクレジットレコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<QrApiResponse> {
    return this.http
      .delete<QrApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('クレジット情報の削除')));
  }
}
