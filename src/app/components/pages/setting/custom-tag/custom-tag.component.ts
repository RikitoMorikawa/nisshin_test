import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { CustomTagCommonService } from './custom-tag-common.service';
import { CommonService } from 'src/app/services/shared/common.service';
/**
 * パンくずリストオブジェクトの型
 */
type BreadcrumbList = {
  path?: string;
  text: string;
};

/**
 * カスタムタグコンポーネント（ルートコンポーネント）
 */
@Component({
  selector: 'app-custom-tag',
  templateUrl: './custom-tag.component.html',
  styleUrls: ['./custom-tag.component.scss'],
})
export class CustomTagComponent implements OnInit, OnDestroy {
  // 各種パラメータ
  isLoading = false;
  private subscription = new Subscription();
  breadcrumbList: BreadcrumbList[] = [];

  /**
   * コンストラクタ
   */
  constructor(
    private cucommon: CustomTagCommonService,
    private router: Router,
    public common: CommonService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // ページ遷移イベントを購読
    this.subscription.add(
      this.router.events
        .pipe(
          filter((x) => x instanceof NavigationEnd),
          map((x) => x as NavigationEnd)
        )
        .subscribe(
          (x) => (this.breadcrumbList = this.createBreadcrumbList(x.url))
        )
    );
    // 初期状態のパンくずリストを設定
    this.breadcrumbList = this.createBreadcrumbList(this.router.url);

    // ローディング状況を購読
    this.subscription.add(
      this.common.loading$.subscribe((x) => {
        setTimeout(() => (this.isLoading = x));
      })
    );
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
    const paths = url.replace(/.*\/custom-tag\/?/, '').split('/');
    const breadcrumbList: BreadcrumbList[] = [
      { path: '/setting/menu', text: '設定一覧' },
      { path: './', text: 'カスタムタグ一覧' },
    ];
    switch (paths[0]) {
      case 'add':
        breadcrumbList.push({ text: 'カスタムタグ新規登録' });
        break;
      case 'bulk-add':
        breadcrumbList.push({ text: 'カスタムタグ一括登録' });
        break;
      case 'detail':
        breadcrumbList.push({ text: 'カスタムタグ詳細' });
        break;
      case 'edit':
        breadcrumbList.push(
          { path: `./detail/${paths[1]}`, text: 'カスタムタグ詳細' },
          { text: 'カスタムタグ編集' }
        );
        break;
      default:
        delete breadcrumbList[1].path;
    }
    return breadcrumbList;
  }
}
