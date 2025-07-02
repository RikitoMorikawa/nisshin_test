import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { CustomLargeCategoryApiResponse } from '../models/custom-large-category';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class CustomLargeCategoryService extends HttpService {
  // カスタム大分類APIのエンドポイント
  readonly endpoint = protectedResources.customLargeCategoryApi.endpoint;

  /**
   * カスタム大分類APIへ`GET`リクエストを送信。
   * @param params カスタム大分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<CustomLargeCategoryApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<CustomLargeCategoryApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('カスタム大分類一覧の取得')));
  }

  /**
   * `カスタム大分類API/{カスタム大分類id}`へ`GET`リクエストを送信。
   * @param id 取得するカスタム大分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<CustomLargeCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタム大分類情報の取得')));
  }

  /**
   * カスタム大分類APIへ`POST`リクエストを送信。
   * @param customLargeCategory 登録するカスタム大分類情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(customLargeCategory: any): Observable<CustomLargeCategoryApiResponse> {
    const formData = this.generateFormData(customLargeCategory);
    return this.http
      .post<CustomLargeCategoryApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('カスタム大分類情報の登録')));
  }

  /**
   * `カスタム大分類API/{カスタム大分類id}`へ`PATCH`リクエストを送信。
   * @param id 更新するカスタム大分類のレコードID。
   * @param customLargeCategory 更新するカスタム大分類情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    customLargeCategory: any
  ): Observable<CustomLargeCategoryApiResponse> {
    const formData = this.generateFormData(customLargeCategory);
    return this.http
      .patch<CustomLargeCategoryApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('カスタム大分類情報の更新')));
  }

  /**
   * `カスタム大分類API/{カスタム大分類id}`へ`DELETE`リクエストを送信。
   * @param id 削除するカスタム大分類のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<CustomLargeCategoryApiResponse> {
    return this.http
      .delete<CustomLargeCategoryApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('カスタム大分類情報の削除')));
  }

  /**
   * カスタム大分類APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params カスタム大分類の絞り込みに使用するパラメータのオブジェクト。
   * @returns `SelectOption[]`の`Observable`。
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => res.data.map((x) => ({ value: x.id, text: x.name })))
    );
  }
}
