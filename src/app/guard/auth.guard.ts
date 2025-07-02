import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private msalService: MsalService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return new Observable((observer) => {
      // イベントコールバックを定義します。
      const eventCallback = (event: EventMessage) => {
        if (event.eventType === EventType.LOGIN_SUCCESS) {
          if (this.msalService.instance.getAllAccounts().length > 0) {
            observer.next(this.router.parseUrl('/home'));
            observer.complete();
          }
        } else if (event.eventType === EventType.LOGIN_FAILURE) {
          observer.next(true);
          observer.complete();
        }
      };

      // addEventCallbackを使用して、Msalサービスのイベントを購読します。
      // addEventCallbackは一意の識別子を返します。
      const callbackId =
        this.msalService.instance.addEventCallback(eventCallback);

      // 既存のアカウント情報をチェックします。
      if (this.msalService.instance.getAllAccounts().length > 0) {
        observer.next(this.router.parseUrl('/home'));
        observer.complete();
      }

      // オブザーバーが完了したら、イベントコールバックの購読を解除します。
      return () => {
        if (callbackId) {
          this.msalService.instance.removeEventCallback(callbackId);
        }
      };
    });
  }
}
