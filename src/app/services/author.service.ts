import { Injectable } from '@angular/core';
import { protectedResources } from 'src/environments/environment';
import { Employee, EmployeeApiResponse } from '../models/employee';
import { Observable, Subject } from 'rxjs';
import { HttpService } from './shared/http.service';

/**
 * ログイン中ユーザー取得サービス
 */
@Injectable({
  providedIn: 'root',
})
export class AuthorService extends HttpService {
  // 社員 エンドポイント
  private employeeEndpoint: string = protectedResources.employeeApi.endpoint;

  // ログイン中ユーザー取得を購読させる
  private _author = new Subject<Employee>();
  author$ = this._author.asObservable();

  author?: Employee;

  /**
   * AppComponent.tsのログイン中ユーザー取得用
   * @param id
   * @returns
   */
  getAuthorWithId(id: any): Observable<EmployeeApiResponse> {
    return this.http.get<EmployeeApiResponse>(`${this.employeeEndpoint}/${id}`);
  }

  /**
   * AppComponent.tsからログイン中ユーザーが取得できらた流されるストリーム
   * @param author
   */
  onNotifyAuthorChanged(author: Employee) {
    this.author = author;
    this._author.next(author);
  }
}
