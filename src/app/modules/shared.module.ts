import { NgModule } from '@angular/core';
//import { CommonModule } from "@angular/common";

import { nl2brPipe } from 'src/app/pipes/nl2br.pipe';
@NgModule({
  declarations: [nl2brPipe],
  imports: [],
  exports: [nl2brPipe],
})
export class SharedModule {}
