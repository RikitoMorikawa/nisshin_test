import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { QualityCustomerApiResponse } from '../models/quality-customer';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class QualityCustomerService extends HttpService {
  // 客層のエンドポイント
  readonly endpoint = protectedResources.qualityCustomerApi.endpoint;

  /**
   * 客層APIへGETリクエストを送信
   * @param params 客層の絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<QualityCustomerApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<QualityCustomerApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('客層一覧の取得')));
  }

  /**
   * 客層API/{客層id}へGETリクエストを送信
   * @param id 取得する客層レコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<QualityCustomerApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('客層情報の取得')));
  }

  /**
   * 客層APIへPOSTリクエストを送信
   * @param qualityCustomer 登録する客層情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(qualityCustomer: any): Observable<QualityCustomerApiResponse> {
    const formData = this.generateFormData(qualityCustomer);
    return this.http
      .post<QualityCustomerApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('客層情報の登録')));
  }

  /**
   * 客層API/{客層id}へPATCHリクエストを送信
   * @param id 更新する客層レコードのID
   * @param qualityCustomer 更新する客層情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(
    id: number,
    qualityCustomer: any
  ): Observable<QualityCustomerApiResponse> {
    const formData = this.generateFormData(qualityCustomer);
    return this.http
      .patch<QualityCustomerApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('客先情報の更新')));
  }

  /**
   * 客層API/{客層id}へDELETEリクエストを送信
   * @param id 削除する客層レコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<QualityCustomerApiResponse> {
    return this.http
      .delete<QualityCustomerApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('客層情報の削除')));
  }
}
