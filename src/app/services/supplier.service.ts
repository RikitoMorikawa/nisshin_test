import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, map, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { Supplier, SupplierApiResponse } from '../models/supplier';
import { HttpHeaders } from '@angular/common/http';
import { SelectOption } from '../components/atoms/select/select.component';

/**
 * 仕入先サービス
 */
@Injectable({
  providedIn: 'root',
})
export class SupplierService extends HttpService {
  // 仕入先APIのエンドポイント
  readonly endpoint = protectedResources.supplierApi.endpoint;

  /**
   * 仕入先APIへ`GET`リクエストを送信。
   * @param params 仕入先の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<SupplierApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<SupplierApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('仕入先一覧の取得')));
  }

  /**
   * `仕入先API/{仕入先id}`へ`GET`リクエストを送信。
   * @param id 取得する仕入先のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<SupplierApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入先情報の取得')));
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して仕入先APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv', params?: Partial<Supplier>) {
    const options: object = {
      params,
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
   * 仕入先APIへ`POST`リクエストを送信。
   * @param supplier 登録する仕入先情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(supplier: any): Observable<SupplierApiResponse> {
    const formData = this.generateFormData(supplier);
    return this.http
      .post<SupplierApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('仕入先情報の登録')));
  }

  /**
   * 仕入先APIへ`POST`リクエストを送信。
   * @param file 一括登録する仕入先情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<SupplierApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<SupplierApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('仕入先情報の一括登録')));
  }

  /**
   * `仕入先API/{仕入先id}`へ`PATCH`リクエストを送信。
   * @param id 更新する仕入先のレコードID。
   * @param supplier 更新する仕入先情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, supplier: any): Observable<SupplierApiResponse> {
    const formData = this.generateFormData(supplier);
    return this.http
      .patch<SupplierApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('仕入先情報の更新')));
  }

  /**
   * `仕入先API/{仕入先id}`へ`DELETE`リクエストを送信。
   * @param id 削除する仕入先のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<SupplierApiResponse> {
    return this.http
      .delete<SupplierApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('仕入先情報の削除')));
  }

  /**
   * 仕入先APIへGETリクエストを送信し、結果をSelectOptionの配列として返却
   * @returns SelectOption[]のObservable
   */
  getAsSelectOptions(): Observable<SelectOption[]> {
    return this.getAll({ $select: 'id,name' }).pipe(
      map((res) => {
        const ret = res.data.map((x) => ({
          value: x.id,
          text: x.name,
        }));
        return ret;
      })
    );
  }
}
