import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { StorePriceApiResponse } from '../models/store-price';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class StorePriceService extends HttpService {
  // 店舗売価APIのエンドポイント
  readonly endpoint = protectedResources.StorePriceApi.endpoint;

  /**
   * 店舗売価APIへ`GET`リクエストを送信。
   * @param params 店舗売価の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<StorePriceApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<StorePriceApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('店舗売価一覧の取得')));
  }

  /**
   * `店舗売価API/{店舗売価id}`へ`GET`リクエストを送信。
   * @param id 取得する店舗売価のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<StorePriceApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('店舗売価情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して店舗売価APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv') {
    const options: object = {
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
   * 店舗売価APIへ`POST`リクエストを送信。
   * @param data 登録する店舗売価情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(data: any): Observable<StorePriceApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<StorePriceApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('店舗売価情報の登録')));
  }

  /**
   * 店舗売価APIへ`POST`リクエストを送信。
   * @param file 一括登録する店舗売価情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<StorePriceApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<StorePriceApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('店舗売価情報の一括登録')));
  }

  /**
   * `店舗売価API/{店舗売価id}`へ`PATCH`リクエストを送信。
   * @param id 更新する店舗売価のレコードID。
   * @param data 更新する店舗売価情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, data: any): Observable<StorePriceApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<StorePriceApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('店舗売価情報の更新')));
  }

  /**
   * `店舗売価API/{店舗売価id}`へ`DELETE`リクエストを送信。
   * @param id 削除する店舗売価のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<StorePriceApiResponse> {
    return this.http
      .delete<StorePriceApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('店舗売価情報の削除')));
  }
}
