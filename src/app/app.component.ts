import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, filter, takeUntil, zipWith } from 'rxjs/operators';

import {
  MsalService,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import {
  InteractionStatus,
  AuthenticationResult,
  EventMessage,
  EventType,
  RedirectRequest,
} from '@azure/msal-browser';

import { ModalComponent } from './components/atoms/modal/modal.component';
import { ModalService } from './services/modal.service';
import { FlashMessageComponent } from './components/atoms/flash-message/flash-message.component';
import { FlashMessageService } from './services/flash-message.service';
import { AuthorService } from './services/author.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BasicInformationService } from './services/basic-information.service';
import { EmployeeService } from './services/employee.service';
import { ClientService } from './services/client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Microsoft identity platform';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  modal: any;
  flashMessage: any;
  isDuringAcquisition = false;
  private subscription = new Subscription();

  constructor(
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private modalService: ModalService,
    private flashMessageService: FlashMessageService,
    private authorService: AuthorService,
    //private biService: BasicInformationService,
    private employeeService: EmployeeService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    // 未ログイン時に強制的にログイン画面に遷移するため、protectedリソースにアクセス
    //this.subscription.add(this.clientService.getAll().subscribe((res) => {}));

    // モーダルの開閉イベントをサブスクライブ
    this.modalService.openEventObservable$.subscribe(
      (_) => (this.modal = ModalComponent)
    );
    this.modalService.closeEventObservable$.subscribe(
      (_) => (this.modal = null)
    );

    // フラッシュメッセージの開閉イベントを購読
    this.flashMessageService.openEventObservable$.subscribe(
      (_) => (this.flashMessage = FlashMessageComponent)
    );
    this.flashMessageService.closeEventObservable$.subscribe(
      (_) => (this.flashMessage = null)
    );

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });

    /**
     * You can subscribe to MSAL events as shown below. For more info,
     * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/events.md
     */
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
        const claim =
          this.authService.instance.getActiveAccount()?.idTokenClaims;
        if (claim) {
          this.isDuringAcquisition = true;
          this.subscription.add(
            this.authorService
              .getAuthorWithId(claim['extension_user_id'])
              .pipe(
                zipWith(this.employeeService.signin()),
                //zipWith(this.biService.find()),
                catchError((error: HttpErrorResponse) => {
                  return of(error);
                })
              )
              .subscribe((res) => {
                this.isDuringAcquisition = false;
                if (res instanceof HttpErrorResponse) {
                  // ログイン中ユーザーが取得できない場合ログアウトさせる
                  this.logout();
                  return;
                }

                if (!Array.isArray(res)) {
                  this.logout();
                  return;
                }

                if (res.length !== 2) {
                  this.logout();
                  return;
                }

                const authorApiRes = res[0];
                if (
                  authorApiRes &&
                  Array.isArray(authorApiRes.data) &&
                  authorApiRes.data.length > 0
                ) {
                  this.authorService.onNotifyAuthorChanged(
                    authorApiRes.data[0]
                  );
                } else {
                  // 取得したデータに異常がある場合はログアウトさせる
                  this.logout();
                  return;
                }

                // const biApiRes = res[1];
                // if (
                //   biApiRes &&
                //   Array.isArray(biApiRes.data) &&
                //   biApiRes.data.length > 0
                // ) {
                //   this.biService.onNotifyBiChanged(biApiRes.data[0]);
                // } else {
                //   // 取得したデータに異常がある場合はログアウトさせる
                //   this.logout();
                //   return;
                // }
              })
          );
        }
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  logout() {
    this.authService.logoutRedirect();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
    this.subscription.unsubscribe();
  }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }
}
