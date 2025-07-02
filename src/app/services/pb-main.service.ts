import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { MainProductBookApiResponse } from '../models/pb-main';
import { HttpService } from './shared/http.service';

@Injectable({
  providedIn: 'root',
})
export class PbMainService extends HttpService {
  // メイン商品名ブックAPIのエンドポイント
  readonly endpoint = protectedResources.productBookThirdCategoryApi.endpoint;

  /**
   * メイン商品ブックAPIへ`GET`リクエストを送信。
   * @param params メイン商品ブックの絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<MainProductBookApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<MainProductBookApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('メイン商品ブック一覧の取得')));
  }

  /**
   * `メイン商品ブックAPI/{メイン商品ブックid}`へ`GET`リクエストを送信。
   * @param id 取得するメイン商品ブックのレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<MainProductBookApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('メイン商品ブック情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定してメイン商品ブックAPIへ`GET`リクエストを送信。
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
   * メイン商品ブックAPIへ`POST`リクエストを送信。
   * @param pbFirstCategory 登録するメイン商品ブック情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(pbFirstCategory: any): Observable<MainProductBookApiResponse> {
    const formData = this.generateFormData(pbFirstCategory);
    return this.http
      .post<MainProductBookApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('メイン商品ブック情報の登録')));
  }

  /**
   * メイン商品ブック一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<MainProductBookApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<MainProductBookApiResponse>(this.endpoint, formData);
  }

  /**
   * `メイン商品ブックAPI/{メイン商品ブックid}`へ`PATCH`リクエストを送信。
   * @param id 更新するメイン商品ブックのレコードID。
   * @param pbFirstCategory 更新するメイン商品ブック情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(
    id: number,
    pbFirstCategory: any
  ): Observable<MainProductBookApiResponse> {
    const formData = this.generateFormData(pbFirstCategory);
    return this.http
      .patch<MainProductBookApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('メイン商品ブック情報の更新')));
  }

  /**
   * `メイン商品ブックAPI/{メイン商品ブックid}`へ`DELETE`リクエストを送信。
   * @param id 削除するメイン商品ブックのレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<MainProductBookApiResponse> {
    return this.http
      .delete<MainProductBookApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('メイン商品ブック情報の削除')));
  }

  /**
   * メイン商品ブックAPIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params メイン商品ブックの絞り込みに使用するパラメータのオブジェクト。
   * @returns `SelectOption[]`の`Observable`。
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => res.data.map((x) => ({ value: x.id, text: x.name })))
    );
  }
}
