import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { observable, catchError, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { MemberApiResponse } from '../models/member';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class MemberService extends HttpService {
  // 会員のエンドポイント
  readonly endpoint = protectedResources.memberApi.endpoint;

  /**
   * 会員APIへGETリクエストを送信
   * @param params 会員の絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスのObservable
   */
  getAll(params: object = {}): Observable<MemberApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<MemberApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('会員一覧の取得')));
  }

  /**
   * 会員API/{会員id}へGETリクエストを送信
   * @param id 取得する会員レコードのID
   * @returns レスポンスのObservable
   */
  find(id: number) {
    return this.http
      .get<MemberApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('会員情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して会員APIへ`GET`リクエストを送信。
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
   * 会員情報一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<MemberApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<MemberApiResponse>(this.endpoint, formData);
  }

  /**
   * 会員APIへPOSTリクエストを送信
   * @param qualityCustomer 登録する会員情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  add(member: any): Observable<MemberApiResponse> {
    const formData = this.generateFormData(member);
    return this.http
      .post<MemberApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('会員情報の登録')));
  }

  /**
   * 会員API/{会員id}へPATCHリクエストを送信
   * @param id 更新する会員レコードのID
   * @param qualityCustomer 更新する会員情報を格納したオブジェクト
   * @returns レスポンスのObservable
   */
  update(id: number, member: any): Observable<MemberApiResponse> {
    const formData = this.generateFormData(member);
    return this.http
      .patch<MemberApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('会員情報の更新')));
  }

  /**
   * 会員API/{会員id}へDELETEリクエストを送信
   * @param id 削除する会員レコードID
   * @returns レスポンスのObservable
   */
  remove(id: number): Observable<MemberApiResponse> {
    return this.http
      .delete<MemberApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('会員情報の削除')));
  }
}
