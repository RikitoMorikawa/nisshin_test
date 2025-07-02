import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { DepositDetailApiResponse } from '../models/deposit-detail';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DepositDetailService extends HttpService {
  // 入金明細APIのエンドポイント
  readonly endpoint = protectedResources.depositDetailApi.endpoint;

  /**
   * 入金明細APIへ`GET`リクエストを送信。
   * @param params 入金明細の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<DepositDetailApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<DepositDetailApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('入金明細一覧の取得')));
  }

  /**
   * `入金明細API/{入金明細id}`へ`GET`リクエストを送信。
   * @param id 取得する入金明細のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<DepositDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('入金明細情報の取得')));
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
   * 入金明細APIへ`POST`リクエストを送信。
   * @param customTag 登録する入金明細情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(customTag: any): Observable<DepositDetailApiResponse> {
    const formData = this.generateFormData(customTag);
    return this.http
      .post<DepositDetailApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('入金明細情報の登録')));
  }

  /**
   * `入金明細API/{入金明細id}`へ`PATCH`リクエストを送信。
   * @param id 更新する入金明細のレコードID。
   * @param customTag 更新する入金明細情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, customTag: any): Observable<DepositDetailApiResponse> {
    const formData = this.generateFormData(customTag);
    return this.http
      .patch<DepositDetailApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('入金明細情報の更新')));
  }

  /**
   * `入金明細API/{入金明細id}`へ`DELETE`リクエストを送信。
   * @param id 削除する入金明細のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: string | null): Observable<DepositDetailApiResponse> {
    return this.http
      .delete<DepositDetailApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('入金明細情報の削除')));
  }
}
