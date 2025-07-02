import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeTableOrgComponent } from './employee-table-org.component';
import { TableContainerModule } from 'src/app/components/molecules/table-container/table-container.module';
import { LinkModule } from '../../../atoms/link/link.module';
import { TableWithPaginationModule } from 'src/app/components/molecules/table-with-pagination/table-with-pagination.module';

@NgModule({
  declarations: [EmployeeTableOrgComponent],
  exports: [EmployeeTableOrgComponent],
  imports: [
    CommonModule,
    TableContainerModule,
    LinkModule,
    TableWithPaginationModule,
  ],
})
export class EmployeeTableOrgModule {}
