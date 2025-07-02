import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/shared/common.service';

/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};
type MenuList = {
  path?: string;
  text: string;
};
@Component({
  selector: 'app-accounts-payable-aggregate',
  templateUrl: './accounts-payable-aggregate.component.html',
  styleUrls: ['./accounts-payable-aggregate.component.scss'],
})
export class AccountsPayableAggregateComponent implements OnInit, OnDestroy {
  // 各種パラメータ
  loading = false;
  private subscription = new Subscription();
  breadcrumbList: BreadcrumbList[] = [];
  menuList: MenuList[] = [];

  /**
   * コンストラクタ
   */
  constructor(private common: CommonService, private router: Router) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // // ローディング状況を購読
    this.subscription = this.common.loading$.subscribe((x) => {
      // Angular のライフサイクルに逆行する(警告が出る)ため非同期化
      setTimeout(() => (this.loading = x));
    });

    // ページ遷移イベントを購読
    this.subscription.add(
      this.router.events
        .pipe(filter((x) => x instanceof NavigationEnd))
        .subscribe(
          (x) =>
            (this.breadcrumbList = this.createBreadcrumbList(
              (x as NavigationEnd).urlAfterRedirects
            ))
        )
    );

    // 初期状態のパンくずリストを設定
    this.breadcrumbList = this.createBreadcrumbList(this.router.url);
  }

  /**
   * コンポーネントの終了処理
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * URLに応じたパンくずリストオブジェクトを生成する。
   * @param url 表示されているページのURL。
   */
  private createBreadcrumbList(url: string) {
    const titleUrlPaths = url
      .replace(/.*\/accounts-payable-aggregate\/?/, '')
      .split('/');
    const titlePagePaths = [
      { name: 'payment-cutoff', name_jp: '支払データ', path: 'payment-slip' },
      { name: 'payment-slip', name_jp: '支払データ', path: 'payment-slip' },
      {
        name: 'payment-clearing',
        name_jp: '支払消込',
        path: 'payment-clearing',
      },
      {
        name: 'accounts-payable-balance',
        name_jp: '買掛残',
        path: 'accounts-payable-balance',
      },
    ];

    // 第一階層
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting/menu', text: '設定一覧' },
    ];
    const menuList: MenuList[] = [];

    // 第二階層
    const titlePagePath = titlePagePaths.find(
      (x) => x.name === titleUrlPaths[0]
    )?.path;
    const titlePageName = titlePagePaths.find(
      (x) => x.name === titleUrlPaths[0]
    )?.name_jp;
    breadcrumbList.push({
      path: `/setting/accounts-payable-aggregate/${titlePagePath}`,
      text: `${titlePageName}一覧`,
    });

    // 第三階層
    if (titleUrlPaths.length === 1) {
      switch (titleUrlPaths[0]) {
        case 'payment-cutoff':
          breadcrumbList.push({ text: `支払締めデータ作成` });
          menuList.push(breadcrumbList[2]);
          break;
        default:
          delete breadcrumbList[1].path;
          menuList.push(breadcrumbList[1]);
      }
    } else {
      menuList.push(breadcrumbList[1]);
      switch (titleUrlPaths[1]) {
        case 'list':
          delete breadcrumbList[1].path;
          break;
        default:
          const titlePageDetailName = [
            { name: 'slip-list', name_jp: '請求伝票一覧' },
            { name: 'slip-detail', name_jp: '請求伝票詳細' },
            { name: 'add', name_jp: '支払消込新規登録' },
            { name: 'detail-view', name_jp: '支払消込閲覧' },
            { name: 'detail-edit', name_jp: '支払消込編集' },
          ].find((x) => x.name === titleUrlPaths[1])?.name_jp;
          breadcrumbList.push({ text: `${titlePageDetailName}` });
          menuList.push(breadcrumbList[3]);
      }
    }
    this.menuList = menuList;
    return breadcrumbList;
  }
}
0;
