import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import {
  Observable,
  of,
  catchError,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { HttpService } from 'src/app/services/shared/http.service';
import { Product, ProductApiResponse } from 'src/app/models/product';
import { HttpHeaders } from '@angular/common/http';
import { SelectOption } from '../components/atoms/select/select.component';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * 商品サービス
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService extends HttpService {
  /**
   * 商品 エンドポイント
   */
  endpoint: string = protectedResources.productApi.endpoint;

  /**
   * 商品APIへ`GET`リクエストを送信。
   * @param params 商品の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<ProductApiResponse> {
    this.httpOptions.params = params;
    return this.http
      .get<ProductApiResponse>(this.endpoint, this.httpOptions)
      .pipe(catchError(this.setErrorMessage('商品一覧の取得')));
  }

  /**
   * 仕入先IDを指定して`getAll`メソッドを実行。
   * @param supplierId 取得対象の仕入先ID。
   * @param params 仕入先商品の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  get(supplierId: number, params: object = {}) {
    return this.getAll({ ...params, supplier_id: supplierId });
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して仕入先APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @param params 商品の絞り込みに使用するパラメータのオブジェクト。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv', params?: Partial<Product>) {
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
   * `商品API/{商品id}`へ`GET`リクエストを送信。
   * @param id 取得する商品のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http
      .get<ProductApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('商品情報の取得')));
  }

  /**
   * 商品APIへ`POST`リクエストを送信。
   * @param data 登録する商品情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(data: any): Observable<ProductApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .post<ProductApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('商品情報の登録')));
  }

  /**
   * 商品APIへ`POST`リクエストを送信。
   * @param file 一括登録する商品情報のCSVファイル。
   * @return レスポンスの`Observable`。
   */
  bulkAdd(file: Blob): Observable<ProductApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http
      .put<ProductApiResponse>(this.endpoint, formData)
      .pipe(catchError(this.setErrorMessage('商品情報の一括登録')));
  }

  /**
   * `商品API/{商品id}`へ`PATCH`リクエストを送信。
   * @param id 更新する商品のレコードID。
   * @param data 更新する商品情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, data: any): Observable<ProductApiResponse> {
    const formData = this.generateFormData(data);
    return this.http
      .patch<ProductApiResponse>(`${this.endpoint}/${id}`, formData)
      .pipe(catchError(this.setErrorMessage('商品情報の更新')));
  }

  /**
   * `商品API/{商品id}`へ`DELETE`リクエストを送信。
   * @param id 削除する商品のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<ProductApiResponse> {
    return this.http
      .delete<ProductApiResponse>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.setErrorMessage('商品情報の削除')));
  }

  /**
   * 商品APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 区分の絞り込みに使用するパラメータのオブジェクト。
   * @returns `{ text: 商品名, value: 商品ID }[]`の`Observable`。
   */
  getAsSelectOptions(params?: Partial<Product>): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((x) => x.data.map((y) => ({ text: y.name + '', value: y.id })))
    );
  }

  /**
   * 絞り込みなどでnameで選択肢が必要な場合に利用
   * @param params
   * @returns
   */
  getAsSelectOptionsForNameSearch(
    params?: Partial<Product>
  ): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((x) => x.data.map((y) => ({ text: y.name + '', value: y.name })))
    );
  }

  /**
   * 商品マスタから商品IDを検索して商品名を設定する
   *
   * @param obsFormCtrl 商品IDのFormControl
   * @param setValueFormCtrl obsFormCtrlの結果を設定するFormControl
   * @param common ローディング用
   *
   */
  observableProductId(
    obsFormCtrl: FormControl,
    setValueFormCtrl: FormControl,
    common: CommonService
  ) {
    common.loading = false;
    obsFormCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value) =>
          this.observableSetProductName(String(value), setValueFormCtrl, common)
        )
      )
      .subscribe();
  }

  /**
   * 商品IDから商品を検索して商品名をFormにセット
   *
   * @param id 商品ID
   * @param formCtrl obsFormCtrlの結果を設定するFormControl
   * @param common ローディング用
   */
  observableSetProductName(
    id: string,
    formCtrl: FormControl,
    common: CommonService
  ): Observable<void | HttpErrorResponse> {
    if (id === null || id === undefined || id === '') {
      formCtrl.setValue('', { emitEvent: false });
      return of();
    }

    common.loading = true;
    return this.find(Number(id)).pipe(
      map((res: ProductApiResponse) => {
        const product = res.data[0];
        common.loading = false;
        formCtrl.setValue(product?.name, { emitEvent: false });
      }),
      catchError((error: HttpErrorResponse) => {
        common.loading = false;
        return this.handleErrorModal<HttpErrorResponse>()(error);
      })
    );
  }
}
