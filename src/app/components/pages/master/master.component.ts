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
@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
})
export class MasterComponent implements OnInit, OnDestroy {
  // 各種パラメータ
  loading = false;
  private subscription = new Subscription();
  breadcrumbList: BreadcrumbList[] = [];

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
    const paths = url.replace(/.*\/master\/?/, '').split('/');
    const pageName = [
      { name: 'supplier', name_jp: '仕入先' },
      { name: 'product', name_jp: '商品' },
      { name: 'client', name_jp: '得意先' },
    ].find((x) => x.name === paths[0])?.name_jp;

    const breadcrumbList: BreadcrumbList[] = [
      { path: `/master/${paths[0]}`, text: `${pageName}一覧` },
    ];
    switch (paths[1]) {
      case 'add':
        breadcrumbList.push({ text: `${pageName}新規登録` });
        break;
      case 'bulk-add':
        breadcrumbList.push({ text: `${pageName}一括登録` });
        break;
      case 'detail':
        breadcrumbList.push({ text: `${pageName}詳細` });
        break;
      case 'edit':
        breadcrumbList.push(
          {
            path: `/master/${paths[0]}/detail/${paths[2]}`,
            text: `${pageName}詳細`,
          },
          { text: `${pageName}編集` }
        );
        break;
      default:
        delete breadcrumbList[0].path;
    }

    // 仕入先の孫コンポーネント対応
    if (paths[0] === 'supplier' && paths.length > 3) {
      breadcrumbList[1].path = `/master/${paths[0]}/detail/${paths[2]}`;
      breadcrumbList.push({ text: '仕入先商品一覧' });
      if (paths.length > 4) {
        breadcrumbList[2].path = `${breadcrumbList[1].path}/products`;
        breadcrumbList.push({ text: '仕入先商品詳細' });
      }
    }

    return breadcrumbList;
  }
}
