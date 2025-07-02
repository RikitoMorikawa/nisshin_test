import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomMediumCategoryRoutingModule } from './custom-medium-category-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomMediumCategoryComponent } from './custom-medium-category.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { SearchOrgModule } from 'src/app/components/organisms/medium-category-org/search-org/search-org.module';
import { TableOrgModule } from 'src/app/components/organisms/custom-medium-category-org/table-org/table-org.module';
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
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { CommonService } from 'src/app/services/shared/common.service';
@NgModule({
  declarations: [
    CustomMediumCategoryComponent,
    ListComponent,
    DetailComponent,
    EditComponent,
    AddComponent,
  ],
  imports: [
    CommonModule,
    CustomMediumCategoryRoutingModule,
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
    SelectContainerModule,
  ],
  providers: [CommonService],
})
export class CustomMediumCategoryModule {}
