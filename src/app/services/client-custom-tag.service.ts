import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';
import { HttpService } from './shared/http.service';
import { ClientCustomTagApiResponse } from '../models/client-custom-tag';

@Injectable({
  providedIn: 'root',
})
export class ClientCustomTagService extends HttpService {
  // 得意先カスタムタグ関連のエンドポイント
  readonly endpoint = protectedResources.clientCustomTagApi.endpoint;

  /**
   * 得意先カスタムタグ関連APIへGETリクエストを送信
   * @param params 得意先カスタムタグ関連の絞り込みに使用するパラメータのオブジェクト
   * @returns レスポンスの`Observable`
   */
  getAll(params: object = {}): Observable<ClientCustomTagApiResponse> {
    this.httpOptions.params = params;
    return this.http.get<ClientCustomTagApiResponse>(
      this.endpoint,
      this.httpOptions
    );
    // .pipe(catchError(this.setErrorMessage('カスタムタグ関連テーブルの取得')))
  }

  /**
   * 得意先IDを指定してgetAll()メソッドを実行
   * @param clientID 取得対象の得意先ID
   * @returns レスポンスの`Observable1`
   */
  getRelatedCustomTags(clientID: number) {
    const params = { client_id: clientID };
    return this.getAll(params);
  }
}
