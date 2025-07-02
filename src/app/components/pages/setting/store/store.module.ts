import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreRoutingModule } from './store-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreComponent } from './store.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from 'src/app/components/organisms/new-registration-link-org/new-registration-link-org.module';
import { StoreTableOrgModule } from 'src/app/components/organisms/store-org/store-table-org/store-table-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from 'src/app/components/organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    StoreComponent,
    ListComponent,
    DetailComponent,
    EditComponent,
    AddComponent,
  ],
  imports: [
    CommonModule,
    StoreRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    NewRegistrationLinkOrgModule,
    StoreTableOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    LastUpdaterOrgModule,
    CancelLinkOrgModule,
    FileModule,
    IconModule,
    TextContainerModule,
    SelectContainerModule,
    ButtonModule,
  ],
  providers: [CommonService],
})
export class StoreModule {}
