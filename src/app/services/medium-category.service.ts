import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { MediumCategoryApiResponse } from '../models/medium-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class MediumCategoryService extends HttpService {
  // 中分類APIのエンドポイント
  readonly endpoint = protectedResources.mediumCategoryApi.endpoint;

  /**
   * 中分類APIへ`GET`リクエストを送信。
   * @param params 中分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<MediumCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<MediumCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('中分類一覧の取得')));
  }

  /**
   * `中分類API/{中分類id}`へ`GET`リクエストを送信。
   * @param id 取得する中分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<MediumCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('中分類情報の取得')));
  }

  /**
   * 中分類APIへ`POST`リクエストを送信。
   * @param mediumCategory 登録する中分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(mediumCategory: any): Observable<MediumCategoryApiResponse> {
    const formData = this.generateFormData(mediumCategory);
    return this.http
      .post<MediumCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('中分類情報の登録')));
  }

  /**
   * `中分類API/{中分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新する中分類のレコードID。
   * @param mediumCategory 更新する中分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    mediumCategory: any
  ): Observable<MediumCategoryApiResponse> {
    const formData = this.generateFormData(mediumCategory);
    return this.http
      .patch<MediumCategoryApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('中分類情報の更新')));
  }

  /**
   * `中分類API/{中分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除する中分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<MediumCategoryApiResponse> {
    return this.http
      .delete<MediumCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('中分類情報の削除')));
  }

  /**
   * 中分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 中分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns `SelectOption[]`の`Observable`。
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => res.data.map((x) => ({ value: x.id, text: x.name })))
    );
  }

  /**
   * 大分類IDを指定して`getAll`メソッドを実行。
   * @param largeCategoryId 取得対象の大分類ID。
   * @returns レスポンスの`Observable`。
   */
  getSibling(largeCategoryId: number) {
    const params = { large_category_id: largeCategoryId };
    return this.getAll(params);
  }
}
