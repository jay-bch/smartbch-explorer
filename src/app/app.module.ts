import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbDialogModule, NbCardModule, NbInputModule, NbSpinnerModule, NbButtonModule, NbTabsetModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { ConnectToNodeComponent } from './components/connect-to-node/connect-to-node.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TopNavigationComponent } from './components/common/top-navigation/top-navigation.component';
import { BchTickerComponent } from './components/bch-ticker/bch-ticker.component';
import { HomeComponent } from './pages/home/home.component';
import { BlockComponent } from './pages/block/block.component';
import { LatestBlocksComponent } from './components/latest-blocks/latest-blocks.component';
import { AddressComponent } from './pages/address/address.component';
import { BlockInformationComponent } from './components/block-information/block-information.component';
import { TransactionsListComponent } from './components/block-transactions-list/block-transactions-list.component';
import { HextointPipe } from './pipes/hextoint/hextoint.pipe';
import { HextodatePipe } from './pipes/hextodate/hextodate.pipe';
import { TransactionComponent } from './pages/transaction/transaction.component';
import { TimeElapsedPipe } from './pipes/time-elapsed/time-elapsed.pipe';
import { HextostringPipe } from './pipes/hextostring/hextostring.pipe';
import { WeiPipe } from './pipes/wei/wei.pipe';
import { ShorthashPipe } from './pipes/shorthash/shorthash.pipe';
import { AddressTransactionsListComponent } from './components/address-transactions-list/address-transactions-list.component';
import { TransactionDetailsComponent } from './components/address-transaction-details/transaction-details.component';
import { SessionService } from './services/session.service';
import { ConnectComponent } from './pages/connect/connect.component';

import config from '../assets/config/config-empty.json';
import { SessionRouteGuard } from './services/session.route-guard';
import { DefaultRowComponent } from './components/address-transactions-list/row/default-row/default-row.component';
import { Erc20RowComponent } from './components/address-transactions-list/row/erc20-row/erc20-row.component';
import { ContractCreateRowComponent } from './components/address-transactions-list/row/contract-create-row/contract-create-row.component';
import { ContractCallRowComponent } from './components/address-transactions-list/row/contract-call-row/contract-call-row.component';
import { AddressEcr20ListComponent } from './components/address-ecr20-list/address-ecr20-list.component';

export function appInit(sessionApiService: SessionService) {
  return () => sessionApiService.bootstrapSession( config );
}

@NgModule({
  declarations: [
    AppComponent,
    ConnectToNodeComponent,
    TopNavigationComponent,
    BchTickerComponent,
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
    AddressTransactionsListComponent,
    TransactionDetailsComponent,
    ConnectComponent,
    DefaultRowComponent,
    Erc20RowComponent,
    ContractCreateRowComponent,
    ContractCallRowComponent,
    AddressEcr20ListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbDialogModule.forRoot({}),
    NbCardModule,
    NbInputModule,
    NbSpinnerModule,
    NbButtonModule,
    NbTabsetModule
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
    SessionRouteGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
