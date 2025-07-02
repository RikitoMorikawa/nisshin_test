import { Injectable } from '@angular/core';
import { HttpService } from './shared/http.service';
import { protectedResources } from 'src/environments/environment';
import { DeliveryApiResponse } from '../models/delivery';
import { catchError, Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService extends HttpService {
  /**
   * 配送 エンドポイント
   */
  endpoint: string = protectedResources.deliveryApi.endpoint;

  /**
   * 配送情報を取得（一覧）
   *
   * @return Observable<DeliveryApiResponse>
   */
  getAll(params: object = {}): Observable<DeliveryApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<DeliveryApiResponse>(this.endpoint, this.httpOptions);
  }

  /**
   * 配送情報を取得
   *
   * @param {number} id 配送ID
   * @return Observable<DeliveryApiResponse>
   */
  find(id: number): Observable<DeliveryApiResponse> {
    return this.http.get<DeliveryApiResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して配送APIへ`GET`リクエストを送信。
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
   * 配送情報を登録
   *
   * @param {Delivery} delivery 登録情報
   * @return Observable<DeliveryApiResponse>
   */
  add(delivery: any): Observable<DeliveryApiResponse> {
    const formData = this.generateFormData(delivery);
    return this.http.post<DeliveryApiResponse>(this.endpoint, formData);
  }

  /**
   * 配送一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<DeliveryApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<DeliveryApiResponse>(this.endpoint, formData);
  }

  /**
   * 配送情報を更新
   *
   * @param {Delivery} delivery 登録情報
   * @return Observable<DeliveryApiResponse>
   */
  update(id: number, delivery: any): Observable<DeliveryApiResponse> {
    const formData = this.generateFormData(delivery);
    return this.http.patch<DeliveryApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * 配送情報を削除
   *
   * @param {number} id 配送ID
   * @return Observable<DeliveryApiResponse>
   */
  remove(id: number): Observable<DeliveryApiResponse> {
    return this.http.delete<DeliveryApiResponse>(
      `${this.endpoint}/${id}`,
      this.httpOptions
    );
  }
}
