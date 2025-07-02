import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableWithPaginationModule } from '../../../molecules/table-with-pagination/table-with-pagination.module';

import { TableComponent } from './table.component';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '../../../atoms/button/button.module';
import { CancelLinkOrgModule } from '../../../organisms/cancel-link-org/cancel-link-org.module';
import { TitleModule } from 'src/app/components/atoms/title/title.module';
import { SelectModule } from 'src/app/components/atoms/select/select.module';
import { SpinnerModule } from 'src/app/components/atoms/spinner/spinner.module';
import { IconModule } from 'src/app/components/atoms/icon/icon.module';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';
import { TextContainerModule } from '../../../molecules/text-container/text-container.module';

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    TableWithPaginationModule,
    ReactiveFormsModule,
    ButtonModule,
    CancelLinkOrgModule,
    TitleModule,
    SelectModule,
    SpinnerModule,
    IconModule,
    IconContainerModule,
    NgxPaginationModule,
    RealTimeSuggestContainerModule,
    TextContainerModule,
  ],
  exports: [TableComponent],
})
export class TableModule {}
