import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { protectedResources } from 'src/environments/environment';
import { SelectOption } from '../components/atoms/select/select.component';
import { RepairApiResponse } from '../models/repair';
import { HttpService } from './shared/http.service';

/**
 * 修理サービス
 */
@Injectable({
  providedIn: 'root',
})
export class RepairService extends HttpService {
  /**
   * 修理 エンドポイント
   */
  endpoint: string = protectedResources.repairApi.endpoint;

  /**
   * 修理情報を取得（一覧）
   *
   * @return Observable<RepairApiResponse>
   */
  getAll(params: object = {}): Observable<RepairApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<RepairApiResponse>(this.endpoint, this.httpOptions);
  }

  /**
   * 修理情報を取得
   *
   * @param {number} id 修理ID
   * @return Observable<RepairApiResponse>
   */
  find(id: number): Observable<RepairApiResponse> {
    return this.http.get<RepairApiResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して修理APIへ`GET`リクエストを送信。
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
   * 修理情報を登録
   *
   * @param {Repair} repair 登録情報
   * @return Observable<RepairApiResponse>
   */
  add(repair: any): Observable<RepairApiResponse> {
    const formData = this.generateFormData(repair);
    return this.http.post<RepairApiResponse>(this.endpoint, formData);
  }

  /**
   * 修理一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<RepairApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<RepairApiResponse>(this.endpoint, formData);
  }

  /**
   * 修理情報を更新
   *
   * @param {Repair} repair 登録情報
   * @return Observable<RepairApiResponse>
   */
  update(id: number, repair: any): Observable<RepairApiResponse> {
    const formData = this.generateFormData(repair);
    return this.http.patch<RepairApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * 修理情報を削除
   *
   * @param {number} id 修理ID
   * @return Observable<RepairApiResponse>
   */
  remove(id: number): Observable<RepairApiResponse> {
    return this.http.delete<RepairApiResponse>(
      `${this.endpoint}/${id}`,
      this.httpOptions
    );
  }
}
