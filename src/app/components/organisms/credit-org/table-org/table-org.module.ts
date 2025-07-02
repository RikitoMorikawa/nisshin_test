import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableOrgComponent } from './table-org.component';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [TableOrgComponent],
  imports: [CommonModule, TableWithPaginationModule],
  exports: [TableOrgComponent],
  providers: [CommonService],
})
export class TableOrgModule {}
