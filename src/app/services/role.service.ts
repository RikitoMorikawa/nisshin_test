import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { RoleApiResponse } from '../models/role';

/**
 * ロールサービス
 */
@Injectable({
  providedIn: 'root',
})
export class RoleService extends HttpService {
  /**
   * ロール エンドポイント
   */
  roleEndpoint: string = protectedResources.roleApi.endpoint;

  /**
   * ロール情報一覧を取得
   *
   * @param params ページネーションと絞り込みに使用するパラメータのオブジェクト
   * @return Observable
   */
  getAll(params: object = {}): Observable<RoleApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<RoleApiResponse>(this.roleEndpoint, this.httpOptions);
  }

  /**
   * ロール情報を取得
   *
   * @param {number} id ロールID
   * @return Observable
   */
  find(id: number) {
    return this.http.get<RoleApiResponse>(`${this.roleEndpoint}/${id}`);
  }

  /**
   * ロール情報を登録
   *
   * @param {Store} store フォームデータ
   * @return Observable
   */
  add(store: any): Observable<RoleApiResponse> {
    const formData = this.generateFormData(store);
    return this.http.post<RoleApiResponse>(this.roleEndpoint, formData);
  }

  /**
   * ロール情報を更新
   *
   * @param {number} id ロールID
   * @param {Store} store フォームデータ
   * @return Observable
   */
  update(id: number, store: any): Observable<RoleApiResponse> {
    const formData = this.generateFormData(store);
    return this.http.patch<RoleApiResponse>(
      `${this.roleEndpoint}/${id}`,
      formData
    );
  }

  /**
   * ロール情報を削除
   *
   * @param {number} id ロールID
   * @return Observable
   */
  remove(id: number): Observable<RoleApiResponse> {
    return this.http.delete<RoleApiResponse>(`${this.roleEndpoint}/${id}`);
  }
}
