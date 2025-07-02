import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { PurchaseDetailApiResponse } from 'src/app/models/purchase-detail';
import { HttpHeaders } from '@angular/common/http';

/**
 * 仕入サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseDetailService extends HttpService {
  // 発注APIのエンドポイント
  readonly endpoint = protectedResources.purchaseDetailApi.endpoint;

  /**
   * 仕入APIへ`GET`リクエストを送信。
   * @param params 仕入の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PurchaseDetailApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PurchaseDetailApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('仕入一覧の取得')));
  }

  /**
   * `仕入API/{仕入id}`へ`GET`リクエストを送信。
   * @param id 取得する仕入のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PurchaseDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入情報の取得')));
  }

  /**
   * 仕入APIへ`POST`リクエストを送信。
   * @param order 登録する仕入情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(order: any): Observable<PurchaseDetailApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .post<PurchaseDetailApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('仕入情報の登録')));
  }

  /**
   * 仕入APIへ`POST`リクエストを送信。
   * @param file 一括登録する仕入情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<PurchaseDetailApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<PurchaseDetailApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('仕入情報の一括登録')));
  }

  /**
   * `仕入API/{仕入id}`へ`PATCH`リクエストを送信。
   * @param id 更新する仕入のレコードID。
   * @param order 更新する仕入情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, order: any): Observable<PurchaseDetailApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<PurchaseDetailApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('仕入情報の更新')));
  }

  /**
   * `仕入API/{仕入id}`へ`DELETE`リクエストを送信。
   * @param id 削除する仕入のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PurchaseDetailApiResponse> {
    return this.http
      .delete<PurchaseDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入情報の削除')));
  }
}
