import { Injectable } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  EventMessage,
  EventType,
  InteractionStatus,
} from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * Claimサービス
 */
@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  /**
   * claim
   */
  dataSource: Claim[] = [];

  /**
   * claim
   */
  claim!: any;

  /**
   * Subject
   */
  private readonly _destroying$ = new Subject<void>();

  /**
   * コンストラクタ
   *
   * @param {MsalService} authService
   * @param {msalBroadcastService} MsalBroadcastService
   */
  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  /**
   * 初期化
   */
  init(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) =>
            status === InteractionStatus.None ||
            status === InteractionStatus.HandleRedirect
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
        this.getClaims(
          this.authService.instance.getActiveAccount()?.idTokenClaims
        );
      });
  }

  /**
   * アクティブアカウントのチェックとセット
   */
  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  /**
   * Claimの取得
   *
   * @param {any} claims
   */
  getClaims(claims: any) {
    let list: Claim[] = new Array<Claim>();
    //console.log(claims);
    this.claim = claims;

    Object.keys(claims).forEach(function (k, v) {
      let c = new Claim();
      c.id = v;
      c.claim = k;
      c.value = claims ? claims[k] : null;
      list.push(c);
    });
    this.dataSource = list;
  }
}

/**
 * The Claim class
 */
export class Claim {
  /**
   * ID
   */
  id!: number;
  /**
   * claim
   */
  claim!: string;
  /**
   * value
   */
  value!: string;
}
