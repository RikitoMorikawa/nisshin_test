import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RentalProductRoutingModule } from './rental-product-routing.module';
import { RentalProductComponent } from './rental-product.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { TableModule } from '../../organisms/rental-product-org/table/table.module';
import { SearchModule } from '../../organisms/rental-product-org/search/search.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { FormPartsModule } from '../../organisms/form-parts/form-parts.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    RentalProductComponent,
    ListComponent,
    DetailComponent,
    AddComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RentalProductRoutingModule,
    BreadcrumbOrgModule,
    TableModule,
    SearchModule,
    NewRegistrationLinkOrgModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    TextContainerModule,
    SelectContainerModule,
    SelectSuggestContainerModule,
    FormPartsModule,
    ButtonModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
  ],
  providers: [CommonService],
})
export class RentalProductModule {}
