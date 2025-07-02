import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { HttpHeaders } from '@angular/common/http';
import {
  ClientWorkingField,
  ClientWorkingFieldApiResponse,
} from '../models/client-working-field';

@Injectable({
  providedIn: 'root',
})
export class ClientWorkingFieldService extends HttpService {
  // 得意先現場のエンドポイント
  readonly endpoint = protectedResources.clientWorkingFieldApi.endpoint;

  /**
   * 得意先現場APIへ`GET`リクエストを送信。
   * @param params 得意先現場の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<ClientWorkingFieldApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<ClientWorkingFieldApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('得意先現場一覧の取得')));
  }

  /**
   * `得意先現場API/{得意先現場id}`へ`GET`リクエストを送信。
   * @param id 取得する得意先現場のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<ClientWorkingFieldApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('得意先現場の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して得意先APIへ`GET`リクエストを送信
   * @param type 取得するCSVテキストのタイプ
   * @returns CSV形式のテキストを返すObservable
   */
  getCsv(type: 'template' | 'csv', params?: Partial<ClientWorkingField>) {
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
   * 得意先現場APIへ`POST`リクエストを送信。
   * @param order 登録する得意先現場情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(field: any): Observable<ClientWorkingFieldApiResponse> {
    const formData = this.generateFormData(field);
    return this.http
      .post<ClientWorkingFieldApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('得意先現場の登録')));
  }

  /**
   * `得意先現場API/{発注書id}`へ`PATCH`リクエストを送信。
   * @param id 更新する得意先現場のレコードID。
   * @param order 更新する得意先現場を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, field: any): Observable<ClientWorkingFieldApiResponse> {
    const formData = this.generateFormData(field);
    return this.http
      .patch<ClientWorkingFieldApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('得意先現場の更新')));
  }
  /**
   * 得意先現場APIへ`POST`リクエストを送信
   * @param file 一括登録する得意先現場情報のCSVファイル
   * @returns レスポンスの`Observable`
   */
  bulkAdd(file: Blob): Observable<ClientWorkingFieldApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<ClientWorkingFieldApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('得意先現場情報の一括登録')));
  }

  /**
   * `得意先現場API/{得意先現場id}`へ`DELETE`リクエストを送信。
   * @param id 削除する得意先現場のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<ClientWorkingFieldApiResponse> {
    return this.http
      .delete<ClientWorkingFieldApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('得意先現場の削除 ')));
  }
}
