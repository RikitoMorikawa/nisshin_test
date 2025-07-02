import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLargeCategoryRoutingModule } from './custom-large-category-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomLargeCategoryComponent } from './custom-large-category.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { SearchOrgModule } from 'src/app/components/organisms/large-category-org/search-org/search-org.module';
import { TableOrgModule } from 'src/app/components/organisms/custom-large-category-org/table-org/table-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { CommonService } from 'src/app/services/shared/common.service';
@NgModule({
  declarations: [
    CustomLargeCategoryComponent,
    ListComponent,
    DetailComponent,
    EditComponent,
    AddComponent,
  ],
  imports: [
    CommonModule,
    CustomLargeCategoryRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    SearchOrgModule,
    TableOrgModule,
    NewRegistrationLinkOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    LastUpdaterOrgModule,
    IconModule,
    CancelLinkOrgModule,
    TextContainerModule,
    ButtonModule,
  ],
  providers: [CommonService],
})
export class CustomLargeCategoryModule {}
