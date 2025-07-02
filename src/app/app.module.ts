import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
} from '@azure/msal-browser';
import {
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService,
  MsalModule,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalRedirectComponent,
} from '@azure/msal-angular';
import {
  MSALInstanceFactory,
  MSALInterceptorConfigFactory,
  MSALGuardConfigFactory,
} from 'src/app/functions/app-msal';
import { HeaderOrgModule } from 'src/app/components/organisms/header-org/header-org.module';
import { FooterOrgModule } from 'src/app/components/organisms/footer-org/footer-org.module';
import { LinkModule } from 'src/app/components/atoms/link/link.module';
import { LoadingContainerModule } from './components/molecules/loading-container/loading-container.module';

import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { FlashMessageModule } from './components/atoms/flash-message/flash-message.module';
import { ModalModule } from './components/atoms/modal/modal.module';
import { BreadcrumbOrgModule } from './components/organisms/breadcrumb-org/breadcrumb-org.module';
import { BackToLinkOrgModule } from './components/organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from './components/organisms/edit-link-org/edit-link-org.module';
import { LastUpdaterOrgModule } from './components/organisms/last-updater-org/last-updater-org.module';

registerLocaleData(localeJa);
@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    HeaderOrgModule,
    FooterOrgModule,
    LinkModule,
    MsalModule,
    LoadingContainerModule,
    FlashMessageModule,
    ModalModule,
    BreadcrumbOrgModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    LastUpdaterOrgModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: LOCALE_ID,
      useValue: 'ja-JP',
    },
    //TodoService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule {}
