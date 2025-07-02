import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from 'src/app/services/shared/http.service';
import { Client, ClientApiResponse } from 'src/app/models/client';
import { HttpHeaders } from '@angular/common/http';
import { SelectOption } from '../components/atoms/select/select.component';

/**
 * 得意先サービス
 */
@Injectable({
  providedIn: 'root',
})
export class ClientService extends HttpService {
  /**
   * 得意先APIのエンドポイント
   */
  readonly endpoint: string = protectedResources.clientApi.endpoint;

  /**
   * 得意先APIへ`GET`リクエストを送信
   * @param params 得意先の絞り込みに使用するパラメータのオブジェクト
   * @return レスポンスの`Observable`
   */
  getAll(params: any = {}): Observable<ClientApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<ClientApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('得意先一覧の取得')));
  }

  /**
   * `得意先API/{得意先id}`へ`GET`リクエストを送信
   * @param {number} id 取得する得意先のレコードID
   * @return レスポンスの`Observable`
   */
  find(id: number) {
    return this.http
      .get<ClientApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('得意先情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して得意先APIへ`GET`リクエストを送信
   * @param type 取得するCSVテキストのタイプ
   * @returns CSV形式のテキストを返すObservable
   */
  getCsv(type: 'template' | 'csv', params?: Partial<Client>) {
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
   * 得意先APIへ`POST`リクエストを送信
   * @param {Client} client 登録する得意先情報を格納したオブジェクト
   * @return レスポンスの`Observable`
   */
  add(client: any): Observable<ClientApiResponse> {
    const formData = this.generateFormData(client);
    return this.http
      .post<ClientApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('得意先情報の登録')));
  }

  /**
   * 得意先APIへ`POST`リクエストを送信
   * @param file 一括登録する得意先情報のCSVファイル
   * @returns レスポンスの`Observable`
   */
  bulkAdd(file: Blob): Observable<ClientApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<ClientApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('得意先情報の一括登録')));
  }

  /**
   * `得意先API/{得意先id}`へ`PATCH`リクエストを送信
   * @param {number} id 更新する得意先のレコードID
   * @param {Client} client 更新する得意先情報を格納したオブジェクト
   * @return レスポンスの`Observable`
   */
  update(id: number, client: any): Observable<ClientApiResponse> {
    const formData = this.generateFormData(client);
    return this.http
      .patch<ClientApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('得意先情報の更新')));
  }

  /**
   * `得意先API/{得意先id}`へ`DELETE`リクエストを送信
   * @param {number} id 削除する得意先のレコードID
   * @return レスポンスの`Observable`
   */
  remove(id: number): Observable<ClientApiResponse> {
    return this.http
      .delete<ClientApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('得意先情報の削除')));
  }

  /**
   * 得意先APIへGETリクエストを送信し、結果をSelectOptionの配列として返却
   * @param params 得意先の絞り込みに使用するパラメータのオブジェクト（列指定を想定）
   * @returns SelectOption[]のObservable
   */
  getAsSelectOptions(
    params: any = {},
    mapFn?: (client: Client) => SelectOption
  ): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => {
        const ret = res.data.map(
          mapFn ||
            ((x) => ({
              value: x.id,
              text: x.name,
            }))
        );
        return ret;
      })
    );
  }
}
