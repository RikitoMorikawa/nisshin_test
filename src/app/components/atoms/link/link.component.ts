import { Component, OnInit, Input } from '@angular/core';

export type LinkParameter = {
  path: string;
  pathParameter?: string | number;
  queryParameter?: string;
};

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
})
export class LinkComponent implements OnInit {
  @Input() linkParameter!: LinkParameter;

  constructor() {}

  linkPath: string = '';

  ngOnInit(): void {
    if (this.linkParameter.pathParameter === undefined) {
      // パスパラメータがなければパスのみ
      this.linkPath = this.linkParameter.path;
    } else {
      // パスパラメータがあればパスと結合
      this.linkPath =
        this.linkParameter.path + '/' + this.linkParameter.pathParameter;
      if (this.linkParameter.queryParameter) {
        // クエリパラメータがあれば上記のパスと結合
        this.linkPath = this.linkPath + '?' + this.linkParameter.queryParameter;
      }
    }
  }
}
