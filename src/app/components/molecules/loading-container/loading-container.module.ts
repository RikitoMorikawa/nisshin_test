import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingContainerComponent } from './loading-container.component';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';

@NgModule({
  declarations: [LoadingContainerComponent],
  imports: [CommonModule, SpinnerModule],
  exports: [LoadingContainerComponent],
})
export class LoadingContainerModule {}
