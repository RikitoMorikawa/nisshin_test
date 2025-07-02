import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { HttpService } from './shared/http.service';
import {
  BasicInformation,
  BasicInformationApiResponse,
} from '../models/basic-information';

@Injectable({
  providedIn: 'root',
})
export class BasicInformationService extends HttpService {
  /**
   * 基本情報 エンドポイント
   */
  basicInformationEndpoint: string =
    protectedResources.basicInformationApi.endpoint;

  // 基本情報取得を購読させる
  private _bi = new Subject<BasicInformation>();
  bi$ = this._bi.asObservable();

  bi?: BasicInformation;

  /**
   * 基本情報を取得
   * 基本情報は1レコードのみで運用
   * @return Observable
   */
  find() {
    return this.http.get<BasicInformationApiResponse>(
      this.basicInformationEndpoint + '/' + 1
    );
  }

  /**
   * 基本情報を更新
   *
   * @param {BasicInformation} basicInformation フォームデータ
   * @return Observable
   */
  update(basicInformation: any): Observable<BasicInformationApiResponse> {
    const formData = this.generateFormData(basicInformation);
    return this.http.patch<BasicInformationApiResponse>(
      this.basicInformationEndpoint + '/' + 1,
      formData
    );
  }

  /**
   * AppComponent.tsから基本情報が取得できらた流されるストリーム
   * @param bi
   */
  onNotifyBiChanged(bi: BasicInformation) {
    this.bi = bi;
    this._bi.next(bi);
  }
}
