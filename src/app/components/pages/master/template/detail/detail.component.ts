import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/components/organisms/export-link-org/export-link-org.component';
import { AuthorService } from 'src/app/services/author.service';

/**
 * 詳細画面テンプレートコンポーネント
 */
@Component({
  selector: 'app-template-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  @Input() remove$!: Observable<ApiResponse>;
  @Input() backToListPath = '../../';
  hasEditPage = false;
  id = this.route.snapshot.params['id'];

  /**
   * コンストラクタ
   */
  constructor(
    private route: ActivatedRoute,
    public authorService: AuthorService
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  ngOnInit(): void {
    // 兄弟ページに編集画面があるかを確認
    this.hasEditPage =
      !!this.route.snapshot.parent?.routeConfig?.children?.find(
        (x) => x.path === 'edit/:id'
      );
  }
}
