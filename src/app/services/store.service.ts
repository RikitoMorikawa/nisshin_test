import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { StoreApiResponse } from '../models/store';
import { SelectOption } from '../components/atoms/select/select.component';

/**
 * 店舗サービス
 */
@Injectable({
  providedIn: 'root',
})
export class StoreService extends HttpService {
  /**
   * 店舗 エンドポイント
   */
  storeEndpoint: string = protectedResources.storeApi.endpoint;

  /**
   * 店舗情報一覧を取得
   *
   * @param params ページネーションと絞り込みに使用するパラメータのオブジェクト
   * @return Observable
   */
  getAll(params: object = {}): Observable<StoreApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<StoreApiResponse>(
      this.storeEndpoint,
      this.httpOptions
    );
  }

  /**
   * 店舗情報を取得
   *
   * @param {number} id 店舗ID
   * @return Observable
   */
  find(id: number) {
    return this.http.get<StoreApiResponse>(`${this.storeEndpoint}/${id}`);
  }

  /**
   * 店舗情報を登録
   *
   * @param {Store} store フォームデータ
   * @return Observable
   */
  add(store: any): Observable<StoreApiResponse> {
    const formData = this.generateFormData(store);
    return this.http.post<StoreApiResponse>(this.storeEndpoint, formData);
  }

  /**
   * 店舗情報を更新
   *
   * @param {number} id 店舗ID
   * @param {Store} store フォームデータ
   * @return Observable
   */
  update(id: number, store: any): Observable<StoreApiResponse> {
    const formData = this.generateFormData(store);
    return this.http.patch<StoreApiResponse>(
      `${this.storeEndpoint}/${id}`,
      formData
    );
  }

  /**
   * 店舗情報を削除
   *
   * @param {number} id 店舗ID
   * @return Observable
   */
  remove(id: number): Observable<StoreApiResponse> {
    return this.http.delete<StoreApiResponse>(`${this.storeEndpoint}/${id}`);
  }

  /**
   * 店舗APIへGETリクエストを送信し、結果をSelectOptionの配列として返却
   * @returns SelectOption[]のObservable
   */
  getAsSelectOptions(): Observable<SelectOption[]> {
    return this.getAll().pipe(
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
