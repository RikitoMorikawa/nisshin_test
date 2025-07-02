import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SpecialSaleApiResponse } from '../models/special-sale';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class SpecialSaleService extends HttpService {
  // 特売APIのエンドポイント
  readonly endpoint = protectedResources.SpecialSaleApi.endpoint;

  /**
   * 特売APIへ`GET`リクエストを送信。
   * @param params 特売の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<SpecialSaleApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<SpecialSaleApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('特売一覧の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して仕入先APIへ`GET`リクエストを送信。
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
   * `特売API/{特売id}`へ`GET`リクエストを送信。
   * @param id 取得する特売のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<SpecialSaleApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('特売情報の取得')));
  }

  /**
   * 特売APIへ`POST`リクエストを送信。
   * @param data 登録する特売情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(data: any): Observable<SpecialSaleApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<SpecialSaleApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('特売情報の登録')));
  }

  /**
   * 特売APIへ`POST`リクエストを送信。
   * @param file 一括登録する特売情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<SpecialSaleApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<SpecialSaleApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('特売情報の一括登録')));
  }

  /**
   * `特売API/{特売id}`へ`PATCH`リクエストを送信。
   * @param id 更新する特売のレコードID。
   * @param data 更新する特売情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, data: any): Observable<SpecialSaleApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<SpecialSaleApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('特売情報の更新')));
  }

  /**
   * `特売API/{特売id}`へ`DELETE`リクエストを送信。
   * @param id 削除する特売のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<SpecialSaleApiResponse> {
    return this.http
      .delete<SpecialSaleApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('特売情報の削除')));
  }
}
