import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import {
  RentalProduct,
  RentalProductApiResponse,
  RentalProductChangeStatus,
} from '../models/rental-product';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class RentalProductService extends HttpService {
  // APIのエンドポイント
  readonly endpoint = protectedResources.rentalProductApi.endpoint;

  /**
   * APIへ`GET`リクエストを送信。
   * @param params 絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params = {}): Observable<RentalProductApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<RentalProductApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('レンタル商品一覧の取得')));
  }

  /**
   * `API/{id}`へ`GET`リクエストを送信。
   * @param id 取得するのレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<RentalProductApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('レンタル商品情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して仕入先APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv', params?: Partial<RentalProduct>) {
    const options: object = {
      params,
      responseType: 'text',
      headers: new HttpHeaders({ 'X-Download': type }),
    };
    return this.http
      .get<string>(this.endpoint, options)
      .pipe(
        catchError(this.setErrorMessage('一括登録用テンプレートファイルの取得'))
      );
  }

  /**
   * APIへ`POST`リクエストを送信。
   * @param data 登録する情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(data: Partial<RentalProduct>): Observable<RentalProductApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<RentalProductApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('レンタル書品情報の登録')));
  }

  /**
   * APIへ`POST`リクエストを送信。
   * @param file 一括登録するCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<RentalProductApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<RentalProductApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の一括登録')));
  }

  /**
   * `API/{id}`へ`PATCH`リクエストを送信。
   * @param id 更新するのレコードID。
   * @param data 更新する情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    data: Partial<RentalProduct>
  ): Observable<RentalProductApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<RentalProductApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の更新')));
  }

  /**
   * `発注書API/{発注書id}`へ`update`リクエストを送信。
   * @param id 削除する発注書のレコードID。
   * @returns レスポンスの`Observable`。
   */
  listchangee(
    id_list: string,
    data: Partial<RentalProductChangeStatus>
  ): Observable<RentalProductApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<RentalProductApiResponse>(
        `${this.endpoint}/?update_id=${id_list}`,
        formData
      )
      .pipe(catchError(this.setErrorMessage('商品ステータスの一括変更')));
  }

  /**
   * `API/{id}`へ`DELETE`リクエストを送信。
   * @param id 削除するのレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<RentalProductApiResponse> {
    return this.http
      .delete<RentalProductApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('レンタル伝票情報の削除')));
  }
}
