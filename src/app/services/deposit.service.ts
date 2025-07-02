import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { DepositApiResponse } from '../models/deposit';
import { HttpService } from './shared/http.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DepositService extends HttpService {
  // 入金のエンドポイント
  readonly endpoint = protectedResources.depositApi.endpoint;

  /**
   * 入金情報APIへ`GET`リクエストを送信。
   * @param params 入金情報の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<DepositApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<DepositApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('入金一覧の取得')));
  }

  /**
   * `入金情報API/{入金情報id}`へ`GET`リクエストを送信。
   * @param id 取得する入金情報のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<DepositApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('入金情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して配送APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv', params: object = {}) {
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
   * 入金APIへ`POST`リクエストを送信
   * @param {Deposit} deposit 登録する入金情報を格納したオブジェクト
   * @return レスポンスの`Observable`
   */
  add(deposit: any): Observable<DepositApiResponse> {
    const formData = this.generateFormData(deposit);
    return this.http
      .post<DepositApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('入金情報の登録')));
  }

  /**
   * `入金API/{入金id}`へ`PATCH`リクエストを送信。
   * @param id 更新する入金のレコードID。
   * @param deposit 更新する入金情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, deposit: any): Observable<DepositApiResponse> {
    const formData = this.generateFormData(deposit);
    return this.http.patch<DepositApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * `入金API/{入金id}`へ`DELETE`リクエストを送信。
   * @param id 削除する入金伝票のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<DepositApiResponse> {
    return this.http
      .delete<DepositApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('入金伝票の削除')));
  }
}
