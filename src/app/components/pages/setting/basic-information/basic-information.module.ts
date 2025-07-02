import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicInformationRoutingModule } from './basic-information-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BasicInformationComponent } from './basic-information.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from 'src/app/components/organisms/edit-link-org/edit-link-org.module';
import { LastUpdaterOrgModule } from 'src/app/components/organisms/last-updater-org/last-updater-org.module';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { CancelLinkOrgModule } from 'src/app/components/organisms/cancel-link-org/cancel-link-org.module';
import { FileModule } from 'src/app/components/atoms/file/file.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { SelectContainerModule } from 'src/app/components/molecules/select-container/select-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [BasicInformationComponent, DetailComponent, EditComponent],
  imports: [
    CommonModule,
    BasicInformationRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
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
export class BasicInformationModule {}
