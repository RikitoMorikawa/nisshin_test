import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { SmallCategoryApiResponse } from '../models/small-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class SmallCategoryService extends HttpService {
  // 小分類APIのエンドポイント
  readonly endpoint = protectedResources.smallCategoryApi.endpoint;

  /**
   * 小分類APIへ`GET`リクエストを送信。
   * @param params 小分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<SmallCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<SmallCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('小分類一覧の取得')));
  }

  /**
   * `小分類API/{小分類id}`へ`GET`リクエストを送信。
   * @param id 取得する小分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<SmallCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('小分類情報の取得')));
  }

  /**
   * 小分類APIへ`POST`リクエストを送信。
   * @param smallCategory 登録する小分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(smallCategory: any): Observable<SmallCategoryApiResponse> {
    const formData = this.generateFormData(smallCategory);
    return this.http
      .post<SmallCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('小分類情報の登録')));
  }

  /**
   * `小分類API/{小分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新する小分類のレコードID。
   * @param smallCategory 更新する小分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, smallCategory: any): Observable<SmallCategoryApiResponse> {
    const formData = this.generateFormData(smallCategory);
    return this.http
      .patch<SmallCategoryApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('小分類情報の更新')));
  }

  /**
   * `小分類API/{小分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除する小分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<SmallCategoryApiResponse> {
    return this.http
      .delete<SmallCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('小分類情報の削除')));
  }

  /**
   * 小分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 小分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns `SelectOption[]`の`Observable`。
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => res.data.map((x) => ({ value: x.id, text: x.name })))
    );
  }

  /**
   * 中分類IDを指定して`getAll`メソッドを実行。
   * @param mediumCategoryId 取得対象の中分類ID。
   * @returns レスポンスの`Observable`。
   */
  getSibling(mediumCategoryId: number) {
    const params = { medium_category_id: mediumCategoryId };
    return this.getAll(params);
  }
}
