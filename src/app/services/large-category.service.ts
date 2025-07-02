import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { LargeCategoryApiResponse } from '../models/large-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class LargeCategoryService extends HttpService {
  // 大分類APIのエンドポイント
  readonly endpoint = protectedResources.largeCategoryApi.endpoint;

  /**
   * 大分類APIへ`GET`リクエストを送信。
   * @param params 大分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<LargeCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<LargeCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('大分類一覧の取得')));
  }

  /**
   * `大分類API/{大分類id}`へ`GET`リクエストを送信。
   * @param id 取得する大分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<LargeCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('大分類情報の取得')));
  }

  /**
   * 大分類APIへ`POST`リクエストを送信。
   * @param largeCategory 登録する大分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(largeCategory: any): Observable<LargeCategoryApiResponse> {
    const formData = this.generateFormData(largeCategory);
    return this.http
      .post<LargeCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('大分類情報の登録')));
  }

  /**
   * `大分類API/{大分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新する大分類のレコードID。
   * @param largeCategory 更新する大分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, largeCategory: any): Observable<LargeCategoryApiResponse> {
    const formData = this.generateFormData(largeCategory);
    return this.http
      .patch<LargeCategoryApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('大分類情報の更新')));
  }

  /**
   * `大分類API/{大分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除する大分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<LargeCategoryApiResponse> {
    return this.http
      .delete<LargeCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('大分類情報の削除')));
  }

  /**
   * 大分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 大分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns `SelectOption[]`の`Observable`。
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => res.data.map((x) => ({ value: x.id, text: x.name })))
    );
  }
}
