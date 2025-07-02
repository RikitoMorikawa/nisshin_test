import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { OrderApiResponse } from 'src/app/models/order';
import { HttpHeaders } from '@angular/common/http';

/**
 * 発注サービス
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService extends HttpService {
  // 発注APIのエンドポイント
  readonly endpoint = protectedResources.orderApi.endpoint;

  /**
   * 発注APIへ`GET`リクエストを送信。
   * @param params 発注の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<OrderApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<OrderApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('発注一覧の取得')));
  }

  /**
   * `発注API/{発注id}`へ`GET`リクエストを送信。
   * @param id 取得する発注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<OrderApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('発注情報の取得')));
  }

  /**
   * 発注APIへ`POST`リクエストを送信。
   * @param order 登録する発注情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(order: any): Observable<OrderApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .post<OrderApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('発注情報の登録')));
  }

  /**
   * 発注APIへ`POST`リクエストを送信。
   * @param file 一括登録する発注情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<OrderApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<OrderApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('発注情報の一括登録')));
  }

  /**
   * `発注API/{発注id}`へ`PATCH`リクエストを送信。
   * @param id 更新する発注のレコードID。
   * @param order 更新する発注情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, order: any): Observable<OrderApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<OrderApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('発注情報の更新')));
  }

  /**
   * `発注API/{発注id}`へ`DELETE`リクエストを送信。
   * @param id 削除する発注のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<OrderApiResponse> {
    return this.http
      .delete<OrderApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('発注情報の削除')));
  }

  /**
   * `発注API/?delete_id={発注id1,発注id2}`へ`DELETE`リクエストを送信。
   * @param id 削除する発注書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  listremove(id_list: string): Observable<OrderApiResponse> {
    return this.http
      .delete<OrderApiResponse>(`${this.endpoint}/?delete_id=${id_list}`)
      .pipe(catchError(this.setErrorMessage('発注の削除')));
  }
}
