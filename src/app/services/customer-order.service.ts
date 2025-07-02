import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { CustomerOrderApiResponse } from '../models/customer-order';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerOrderService extends HttpService {
  // 客注APIのエンドポイント
  readonly endpoint = protectedResources.CustomerOrderApi.endpoint;

  /**
   * 客注APIへ`GET`リクエストを送信。
   * @param params 客注の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<CustomerOrderApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CustomerOrderApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('客注一覧の取得')));
  }

  /**
   * `客注API/{客注id}`へ`GET`リクエストを送信。
   * @param id 取得する客注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<CustomerOrderApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('客注情報の取得')));
  }

  /**
   * 客注APIへ`POST`リクエストを送信。
   * @param data 登録する客注情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(data: any): Observable<CustomerOrderApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<CustomerOrderApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('客注情報の登録')));
  }

  /**
   * 客注APIへ`POST`リクエストを送信。
   * @param file 一括登録する客注情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<CustomerOrderApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<CustomerOrderApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('客注情報の一括登録')));
  }

  /**
   * `客注API/{客注id}`へ`PATCH`リクエストを送信。
   * @param id 更新する客注のレコードID。
   * @param data 更新する客注情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, data: any): Observable<CustomerOrderApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<CustomerOrderApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('客注情報の更新')));
  }

  /**
   * `客注API/{客注id}`へ`DELETE`リクエストを送信。
   * @param id 削除する客注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<CustomerOrderApiResponse> {
    return this.http
      .delete<CustomerOrderApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('客注情報の削除')));
  }
}
