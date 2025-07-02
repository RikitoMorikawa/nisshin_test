import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { CustomMediumCategoryApiResponse } from '../models/custom-medium-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class CustomMediumCategoryService extends HttpService {
  // カスタム中分類APIのエンドポイント
  readonly endpoint = protectedResources.customMediumCategoryApi.endpoint;

  /**
   * カスタム中分類APIへ`GET`リクエストを送信。
   * @param params カスタム中分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<CustomMediumCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CustomMediumCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('カスタム中分類一覧の取得')));
  }

  /**
   * `カスタム中分類API/{カスタム中分類id}`へ`GET`リクエストを送信。
   * @param id 取得するカスタム中分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<CustomMediumCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタム中分類情報の取得')));
  }

  /**
   * カスタム中分類APIへ`POST`リクエストを送信。
   * @param customMediumCategory 登録するカスタム中分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(customMediumCategory: any): Observable<CustomMediumCategoryApiResponse> {
    const formData = this.generateFormData(customMediumCategory);
    return this.http
      .post<CustomMediumCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('カスタム中分類情報の登録')));
  }

  /**
   * `カスタム中分類API/{カスタム中分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新するカスタム中分類のレコードID。
   * @param customMediumCategory 更新するカスタム中分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    customMediumCategory: any
  ): Observable<CustomMediumCategoryApiResponse> {
    const formData = this.generateFormData(customMediumCategory);
    return this.http
      .patch<CustomMediumCategoryApiResponse>(
        `${this.endpoint}/${id}`,
        formData
      )
      .pipe(catchError(this.setErrorMessage('カスタム中分類情報の更新')));
  }

  /**
   * `カスタム中分類API/{カスタム中分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除するカスタム中分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<CustomMediumCategoryApiResponse> {
    return this.http
      .delete<CustomMediumCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタム中分類情報の削除')));
  }

  /**
   * カスタム中分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params カスタム中分類の絞り込みに使用するパラメータのオブジェクト。
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
