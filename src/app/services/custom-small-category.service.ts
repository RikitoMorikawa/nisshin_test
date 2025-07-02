import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { CustomSmallCategoryApiResponse } from '../models/custom-small-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class CustomSmallCategoryService extends HttpService {
  // カスタム小分類APIのエンドポイント
  readonly endpoint = protectedResources.customSmallCategoryApi.endpoint;

  /**
   * カスタム小分類APIへ`GET`リクエストを送信。
   * @param params カスタム小分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<CustomSmallCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CustomSmallCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('カスタム小分類一覧の取得')));
  }

  /**
   * `カスタム小分類API/{カスタム小分類id}`へ`GET`リクエストを送信。
   * @param id 取得するカスタム小分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<CustomSmallCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタム小分類情報の取得')));
  }

  /**
   * カスタム小分類APIへ`POST`リクエストを送信。
   * @param customSmallCategory 登録するカスタム小分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(customSmallCategory: any): Observable<CustomSmallCategoryApiResponse> {
    const formData = this.generateFormData(customSmallCategory);
    return this.http
      .post<CustomSmallCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('カスタム小分類情報の登録')));
  }

  /**
   * `カスタム小分類API/{カスタム小分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新するカスタム小分類のレコードID。
   * @param mediumCategory 更新するカスタム小分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    customSmallCategory: any
  ): Observable<CustomSmallCategoryApiResponse> {
    const formData = this.generateFormData(customSmallCategory);
    return this.http
      .patch<CustomSmallCategoryApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('カスタム小分類情報の更新')));
  }

  /**
   * `カスタム小分類API/{カスタム小分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除するカスタム小分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<CustomSmallCategoryApiResponse> {
    return this.http
      .delete<CustomSmallCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタム小分類情報の削除')));
  }

  /**
   * カスタム小分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params カスタム小分類の絞り込みに使用するパラメータのオブジェクト。
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
