import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasicInformation } from 'src/app/models/basic-information';
import { BasicInformationService } from 'src/app/services/basic-information.service';

@Component({
  selector: 'app-footer-org',
  templateUrl: './footer-org.component.html',
  styleUrls: ['./footer-org.component.scss'],
})
export class FooterOrgComponent implements OnInit, OnDestroy {
  constructor(private biService: BasicInformationService) {}

  subscription = new Subscription();

  bi?: BasicInformation;

  ngOnInit(): void {
    if (this.biService.bi) {
      this.bi = this.biService.bi;
    } else {
      this.subscription.add(
        this.biService.bi$.subscribe((bi) => {
          this.bi = bi;
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
