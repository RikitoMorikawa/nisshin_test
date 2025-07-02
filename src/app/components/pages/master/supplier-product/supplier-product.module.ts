import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { TemplateModule } from '../template/template.module';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { BackToLinkOrgModule } from 'src/app/components/organisms/back-to-link-org/back-to-link-org.module';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { DetailComponent } from './detail/detail.component';

@NgModule({
  declarations: [ListComponent, DetailComponent],
  imports: [
    CommonModule,
    TemplateModule,
    FormPartsModule,
    BackToLinkOrgModule,
    TableWithPaginationModule,
  ],
})
export class SupplierProductModule {}
