import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConnectToNodeComponent } from './components/connect-to-node/connect-to-node.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TopNavigationComponent } from './components/common/top-navigation/top-navigation.component';
import { HeightTickerComponent } from './components/height-ticker/height-ticker.component';
import { HomeComponent } from './pages/home/home.component';
import { BlockComponent } from './pages/block/block.component';
import { LatestBlocksComponent } from './components/latest/blocks/blocks.component';
import { AddressComponent } from './pages/address/address.component';
import { BlockInformationComponent } from './components/block/information/information.component';
import { TransactionsListComponent } from './components/block/transactions/transactions.component';
import { HextointPipe } from './pipes/hextoint/hextoint.pipe';
import { HextodatePipe } from './pipes/hextodate/hextodate.pipe';
import { TransactionComponent } from './pages/transaction/transaction.component';
import { TimeElapsedPipe } from './pipes/time-elapsed/time-elapsed.pipe';
import { HextostringPipe } from './pipes/hextostring/hextostring.pipe';
import { WeiPipe } from './pipes/wei/wei.pipe';
import { ShorthashPipe } from './pipes/shorthash/shorthash.pipe';
import { TransactionDetailsComponent } from './components/transaction/details/details.component';
import { SessionService } from './services/session.service';

import { SessionRouteGuard } from './services/session.route-guard';
import { AddressSEP20ListComponent } from './components/address/tokens/sep20-list/sep20-list.component';
import { MetaMaskConnectComponent } from './components/metamask/meta-mask-connect/meta-mask-connect.component';
import { LayoutModule } from '@angular/cdk/layout';

import { AngularMaterialModule } from './angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TokenIconComponent } from './components/ui/token-icon/token-icon.component';
import { HashIconComponent } from './components/ui/hash-icon/hash-icon.component';
import { AddressTransactionsListComponent } from './components/address/transactions/list/list.component';
import { LatestTransactionsComponent } from './components/latest/transactions/transactions.component';


import config from '../assets/config/config.json';
import { TransactionMethodChipComponent } from './components/ui/chips/transaction-method-chip/transaction-method-chip.component';
import { TransactionFromtoChipComponent } from './components/ui/chips/transaction-fromto-chip/transaction-fromto-chip.component';

export function appInit(sessionApiService: SessionService) {
  return () => sessionApiService.bootstrapSession( config );
}

@NgModule({
  declarations: [
    AppComponent,
    ConnectToNodeComponent,
    TopNavigationComponent,
    HeightTickerComponent,
    HomeComponent,
    BlockComponent,
    LatestBlocksComponent,
    AddressComponent,
    BlockInformationComponent,
    TransactionsListComponent,
    HextointPipe,
    HextodatePipe,
    TransactionComponent,
    TimeElapsedPipe,
    HextostringPipe,
    WeiPipe,
    ShorthashPipe,
    TransactionDetailsComponent,
    AddressSEP20ListComponent,
    MetaMaskConnectComponent,
    TokenIconComponent,
    HashIconComponent,
    AddressTransactionsListComponent,
    LatestTransactionsComponent,
    TransactionMethodChipComponent,
    TransactionFromtoChipComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    LayoutModule,
  ],
  providers: [
    SessionService,
    SessionService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [SessionService]
    },
    SessionRouteGuard,
    TimeElapsedPipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
