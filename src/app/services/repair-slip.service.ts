import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { HttpService } from './shared/http.service';
import { RepairSlipApiResponse } from '../models/repair-slip';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepairSlipService extends HttpService {
  /**
   * 修理受付票 エンドポイント
   */
  endpoint: string = protectedResources.repairSlipApi.endpoint;

  /**
   * 修理受付票一覧を取得
   *
   * @return Observable<RepairSlipApiResponse>
   */
  getAll(params: object = {}): Observable<RepairSlipApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<RepairSlipApiResponse>(
      this.endpoint,
      this.httpOptions
    );
  }

  /**
   * 修理受付票詳細を取得
   *
   * @param {number} id 修理受付票ID
   * @return Observable<RepairSlipApiResponse>
   */
  find(id: number): Observable<RepairSlipApiResponse> {
    return this.http.get<RepairSlipApiResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * 修理修理受付票を登録
   *
   * @param {RepairSlip} repairSlip 登録情報
   * @return Observable<RepairSlipApiResponse>
   */
  add(repairSlip: any): Observable<RepairSlipApiResponse> {
    const formData = this.generateFormData(repairSlip);
    return this.http.post<RepairSlipApiResponse>(this.endpoint, formData);
  }

  /**
   * 修理受付票を更新
   *
   * @param {RepairSlip} repairSlip 更新情報
   * @return Observable<RepairSlipApiResponse>
   */
  update(id: number, repairSlip: any): Observable<RepairSlipApiResponse> {
    const formData = this.generateFormData(repairSlip);
    return this.http.patch<RepairSlipApiResponse>(
      `${this.endpoint}/${id}`,
      formData
    );
  }

  /**
   * 修理受付票を削除
   *
   * @param {number} id 修理受付票ID
   * @return Observable<RepairSlipApiResponse>
   */
  remove(id: number): Observable<RepairSlipApiResponse> {
    return this.http.delete<RepairSlipApiResponse>(
      `${this.endpoint}/${id}`,
      this.httpOptions
    );
  }
}
