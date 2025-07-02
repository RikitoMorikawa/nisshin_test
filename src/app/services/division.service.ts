import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { Observable, map, catchError } from 'rxjs';
import { HttpService } from './shared/http.service';
import { Division, DivisionApiResponse } from '../models/division';
import { SelectOption } from '../components/atoms/select/select.component';
import { HttpHeaders } from '@angular/common/http';

/**
 * 区分サービス
 */
@Injectable({
  providedIn: 'root',
})
export class DivisionService extends HttpService {
  // 区分APIのエンドポイント
  readonly endpoint = protectedResources.divisionApi.endpoint;

  /**
   * 区分APIへ`GET`リクエストを送信。
   * @param params 区分の絞り込みに使用するパラメータのオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  getAll(params: object = {}): Observable<DivisionApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<DivisionApiResponse>(this.endpoint, this.httpOptions);
  }

  /**
   * `区分API/{区分id}`へ`GET`リクエストを送信。
   * @param id 取得する区分のレコードID。
   * @returns レスポンスの`Observable`。
   */
  find(id: number) {
    return this.http.get<DivisionApiResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して区分APIへ`GET`リクエストを送信。
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
   * 区分APIへ`POST`リクエストを送信。
   * @param division 登録する区分情報を格納したオブジェクト。
   * @return レスポンスの`Observable`。
   */
  add(division: any): Observable<DivisionApiResponse> {
    const formData = this.generateFormData(division);
    return this.http.post<DivisionApiResponse>(this.endpoint, formData);
  }

  /**
   * 区分情報一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<DivisionApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<DivisionApiResponse>(this.endpoint, formData);
  }

  /**
   * `区分API/{区分id}`へ`PATCH`リクエストを送信。
   * @param id 更新する区分のレコードID。
   * @param division 更新する区分情報を格納したオブジェクト。
   * @returns レスポンスの`Observable`。
   */
  update(id: number, division: any): Observable<DivisionApiResponse> {
    const formData = this.generateFormData(division);
    return this.http.patch<DivisionApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * `区分API/{区分id}`へ`DELETE`リクエストを送信。
   * @param id 削除する区分のレコードID。
   * @returns レスポンスの`Observable`。
   */
  remove(id: number): Observable<DivisionApiResponse> {
    return this.http.delete<DivisionApiResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * 区分APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 区分の絞り込みに使用するパラメータのオブジェクト。
   * @returns `{ 区分名: SelectOption[] }`の`Observable`。
   * @example 戻り値の例: { '区分更新サンプル': [ { text: '値002', value:59 } ] }
   */
  getAsSelectOptions(
    params?: object
  ): Observable<Record<string, SelectOption[]>> {
    return this.getAll(params).pipe(
      map((res) => {
        const ret = {} as Record<string, SelectOption[]>;
        const names = new Set(res.data.map((x) => x.name));
        for (const name of names) {
          ret[name] = this.generateSelectOptions(res.data, name);
        }
        return ret;
      })
    );
  }

  /**
   * 区分APIのレスポンスから`SelectOption`オブジェクトの配列を生成。
   * @param divisions 元となる`Division`オブジェクトの配列。
   * @param divisionName 生成対象の区分名。
   * @returns 生成された`SelectOption`オブジェクトの配列。存在しない`divisionName`が指定された場合は空の配列。
   */
  generateSelectOptions(divisions: Division[], divisionName: string) {
    const filterd = divisions.filter((x) => x.name === divisionName);
    return filterd.map(({ id, value, division_code }) => ({
      value: id,
      text: value,
      code: division_code,
    })) as SelectOption[];
  }
}
