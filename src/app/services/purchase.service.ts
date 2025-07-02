import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { PurchaseApiResponse } from '../models/purchase';
/**
 * 仕入書サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseService extends HttpService {
  // 仕入書APIのエンドポイント
  readonly endpoint = protectedResources.purchaseApi.endpoint;
  /**
   * 仕入書APIへ`GET`リクエストを送信。
   * @param params 仕入書の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PurchaseApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PurchaseApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('仕入書一覧の取得')));
  }

  /**
   * `仕入書API/{発注書id}`へ`GET`リクエストを送信。
   * @param id 取得する仕入のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PurchaseApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入書の取得')));
  }

  /**
   * 仕入書APIへ`POST`リクエストを送信。
   * @param order 登録する仕入書情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(order: any): Observable<PurchaseApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .post<PurchaseApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('仕入書の登録')));
  }
  /**
   * `仕入書API/`へ`PUT`リクエストを送信。
   * @param order 仕入データの取得範囲の日時を格納したオブジェクト
   * @returns レスポンスの`Observable`。
   */
  put(order: any): Observable<PurchaseApiResponse> {
    console.log(order);
    const formData2 = this.generateFormData(order);
    const formData = new FormData();
    formData.append('from_date_of_sale', order.from_date_of_sale);
    formData.append('to_date_of_sale', order.to_date_of_sale);
    console.log(formData.get('from_date_of_sale'));
    console.log(formData.get('to_date_of_sale'));
    console.log(formData2.get('from_date_of_sale'));
    console.log(formData2.get('to_date_of_sale'));

    return this.http.put<PurchaseApiResponse>(this.endpoint, formData);
  }

  /**
   * `仕入書API/{仕入書id}`へ`PATCH`リクエストを送信。
   * @param id 更新する仕入書のレコードID。
   * @param order 更新する仕入書を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, order: any): Observable<PurchaseApiResponse> {
    const formData = this.generateFormData(order);
    return this.http
      .patch<PurchaseApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('仕入書の更新')));
  }

  /**
   * `仕入書API/{仕入書id}`へ`DELETE`リクエストを送信。
   * @param id 削除する仕入書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PurchaseApiResponse> {
    return this.http
      .delete<PurchaseApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入書の削除')));
  }

  /**
   * `仕入書API/{仕入書id}`へ`DELETE`リクエストを送信。
   * @param id 削除する仕入書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  listremove(id_list: string): Observable<PurchaseApiResponse> {
    return this.http
      .delete<PurchaseApiResponse>(`${this.endpoint}/?delete_id=${id_list}`)
      .pipe(catchError(this.setErrorMessage('仕入書の削除')));
  }
}
