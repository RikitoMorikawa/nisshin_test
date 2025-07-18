import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { PbFirstCategoryApiResponse } from '../models/pb-first-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class PbFirstCategoryService extends HttpService {
  // 商品ブック第1分類APIのエンドポイント
  readonly endpoint = protectedResources.productBookFirstCategoryApi.endpoint;

  /**
   * 商品ブック第1分類APIへ`GET`リクエストを送信。
   * @param params 商品ブック第1分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<PbFirstCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<PbFirstCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('商品ブック第1分類一覧の取得')));
  }

  /**
   * `商品ブック第1分類API/{商品ブック第1分類id}`へ`GET`リクエストを送信。
   * @param id 取得する商品ブック第1分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<PbFirstCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('商品ブック第1分類情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して社員APIへ`GET`リクエストを送信。
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
   * 商品ブック第1分類APIへ`POST`リクエストを送信。
   * @param pbFirstCategory 登録する商品ブック第1分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(pbFirstCategory: any): Observable<PbFirstCategoryApiResponse> {
    const formData = this.generateFormData(pbFirstCategory);
    return this.http
      .post<PbFirstCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('商品ブック第1分類情報の登録')));
  }

  /**
   * 商品ブック第1分類一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<PbFirstCategoryApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<PbFirstCategoryApiResponse>(this.endpoint, formData);
  }

  /**
   * `商品ブック第1分類API/{商品ブック第1分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新する商品ブック第1分類のレコードID。
   * @param pbFirstCategory 更新する商品ブック第1分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    pbFirstCategory: any
  ): Observable<PbFirstCategoryApiResponse> {
    const formData = this.generateFormData(pbFirstCategory);
    return this.http
      .patch<PbFirstCategoryApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('商品ブック第1分類情報の更新')));
  }

  /**
   * `商品ブック第1分類API/{商品ブック第1分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除する商品ブック第1分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<PbFirstCategoryApiResponse> {
    return this.http
      .delete<PbFirstCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('商品ブック第1分類情報の削除')));
  }

  /**
   * 商品ブック第1分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 第1分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns `SelectOption[]`の`Observable`。
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => res.data.map((x) => ({ value: x.id, text: x.name })))
    );
  }
}
