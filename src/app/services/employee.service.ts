import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable, map } from 'rxjs';
import { HttpService } from './shared/http.service';
import { Employee, EmployeeApiResponse } from '../models/employee';
import { SelectOption } from '../components/atoms/select/select.component';
import { HttpHeaders } from '@angular/common/http';

/**
 * 社員サービス
 */
@Injectable({
  providedIn: 'root',
})
export class EmployeeService extends HttpService {
  /**
   * 社員 エンドポイント
   */
  employeeEndpoint: string = protectedResources.employeeApi.endpoint;

  /**
   * 社員情報一覧を取得
   *
   * @param params ページネーションと絞り込みに使用するパラメータのオブジェクト
   * @return Observable
   */
  getAll(params: object = {}): Observable<EmployeeApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<EmployeeApiResponse>(
      this.employeeEndpoint,
      this.httpOptions
    );
  }

  /**
   * 社員情報を取得
   *
   * @param {number} id 社員ID
   * @return Observable
   */
  find(id: number) {
    return this.http.get<EmployeeApiResponse>(`${this.employeeEndpoint}/${id}`);
  }

  /**
   * ヘッダに`X-Download`のパラメータを指定して社員APIへ`GET`リクエストを送信。
   * @param type 取得するCSVテキストのタイプ。
   * @returns CSV形式のテキストを返す`Observable`。
   */
  getCsv(type: 'template' | 'csv') {
    const options: object = {
      responseType: 'text',
      headers: new HttpHeaders({ 'X-Download': type }),
    };
    return this.http
      .get<string>(this.employeeEndpoint, options)
      .pipe(
        catchError(this.setErrorMessage('一括登録用テンプレートファイルの取得'))
      );
  }

  /**
   * 社員情報を登録
   *
   * @param {Employee} employee フォームデータ
   * @return Observable
   */
  add(employee: any): Observable<EmployeeApiResponse> {
    const formData = this.generateFormData(employee);
    return this.http.post<EmployeeApiResponse>(this.employeeEndpoint, formData);
  }

  /**
   * 社員情報一括登録
   *
   * @param file
   * @returns Observable
   */
  bulkAdd(file: any): Observable<EmployeeApiResponse> {
    const formData = this.generateFormData({ file });
    return this.http.put<EmployeeApiResponse>(this.employeeEndpoint, formData);
  }

  /**
   * 社員情報を更新
   *
   * @param {number} id 社員ID
   * @param {Employee} employee フォームデータ
   * @return Observable
   */
  update(id: number, employee: any): Observable<EmployeeApiResponse> {
    const formData = this.generateFormData(employee);
    return this.http.patch<EmployeeApiResponse>(
      `${this.employeeEndpoint}/${id}`,
      formData
    );
  }

  signin(): Observable<EmployeeApiResponse> {
    const options: object = {
      headers: new HttpHeaders({ 'X-Signin': 'true' }),
    };

    return this.http.patch<EmployeeApiResponse>(
      this.employeeEndpoint,
      null,
      options
    );
  }

  /**
   * 社員情報を削除
   *
   * @param {number} id 社員ID
   * @return Observable
   */
  remove(id: number): Observable<EmployeeApiResponse> {
    return this.http.delete<EmployeeApiResponse>(
      `${this.employeeEndpoint}/${id}`
    );
  }

  /**
   * 社員APIへ`GET`リクエストを送信し、結果を`SelectOption`の配列として返却。
   * @param params 区分の絞り込みに使用するパラメータのオブジェクト。
   * @returns `{ 区分名: SelectOption[] }`の`Observable`。
   * @example 戻り値の例: { '区分更新サンプル': [ { text: '値002', value:59 } ] }
   */
  getAsSelectOptions(params?: object): Observable<SelectOption[]> {
    return this.getAll(params).pipe(
      map((res) => {
        const ret = res.data.map((x) => ({
          value: x.id,
          text: `${x.last_name} ${x.first_name}`,
          data: `${x.barcode}`,
        }));

        //options.province = provinces.map<SelectOption>((x) => ({
        //  value: x,
        //  text: x,
        //}));
        return ret;
      })
    );
  }
}
