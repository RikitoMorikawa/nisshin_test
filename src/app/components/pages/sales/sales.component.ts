import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
// import { SalesCommonService } from './sales-common.service';
import { CommonService } from 'src/app/services/shared/common.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
})
export class SalesComponent implements OnInit, OnDestroy {
  loading = false;
  private subscription?: Subscription;

  constructor(private common: CommonService) {}

  ngOnInit(): void {
    this.subscription = this.common.loading$.subscribe((x) => {
      // Angular のライフサイクルに逆行する(警告が出る)ため非同期化
      setTimeout(() => (this.loading = x));
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
