import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { CustomTagApiResponse } from '../models/custom-tag';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CustomTagService extends HttpService {
  // カスタムタグAPIのエンドポイント
  readonly endpoint = protectedResources.customTagApi.endpoint;

  /**
   * カスタムタグAPIへ`GET`リクエストを送信。
   * @param params カスタムタグの絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<CustomTagApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CustomTagApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('カスタムタグ一覧の取得')));
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
   * `カスタムタグAPI/{カスタムタグid}`へ`GET`リクエストを送信。
   * @param id 取得するカスタムタグのレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<CustomTagApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタムタグ情報の取得')));
  }

  /**
   * カスタムタグAPIへ`POST`リクエストを送信。
   * @param customTag 登録するカスタムタグ情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(customTag: any): Observable<CustomTagApiResponse> {
    const formData = this.generateFormData(customTag);
    return this.http
      .post<CustomTagApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('カスタムタグ情報の登録')));
  }

  /**
   * カスタムタグAPIへ`POST`リクエストを送信。
   * @param file 一括登録するカスタムタグ情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<CustomTagApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<CustomTagApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('カスタムタグ情報の一括登録')));
  }

  /**
   * `カスタムタグAPI/{カスタムタグid}`へ`PATCH`リクエストを送信。
   * @param id 更新するカスタムタグのレコードID。
   * @param customTag 更新するカスタムタグ情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, customTag: any): Observable<CustomTagApiResponse> {
    const formData = this.generateFormData(customTag);
    return this.http
      .patch<CustomTagApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('カスタムタグ情報の更新')));
  }

  /**
   * `カスタムタグAPI/{カスタムタグid}`へ`DELETE`リクエストを送信。
   * @param id 削除するカスタムタグのレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<CustomTagApiResponse> {
    return this.http
      .delete<CustomTagApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタムタグ情報の削除')));
  }
}
