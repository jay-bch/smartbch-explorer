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

import { TransactionMethodChipComponent } from './components/ui/chips/transaction-method-chip/transaction-method-chip.component';
import { TransactionFromtoChipComponent } from './components/ui/chips/transaction-fromto-chip/transaction-fromto-chip.component';
import { SearchComponent } from './components/search/search.component';
import { BlockResultComponent } from './components/search/block-result/block-result/block-result.component';
import { TxResultComponent } from './components/search/tx-result/tx-result/tx-result.component';
import { AddressResultComponent } from './components/search/address-result/address-result/address-result.component';
import { EmptyResultComponent } from './components/search/empty-result/empty-result.component';
import { TransactionMethodComponent } from './components/transaction/transaction-method/transaction-method.component';
import { TransactionLogsComponent } from './components/transaction/transaction-logs/transaction-logs.component';
import { DecodedValuesComponent } from './components/transaction/decoded-values/decoded-values.component';
import { GeneralChipComponent } from './components/ui/chips/general-chip/general-chip.component';
import { EventLogComponent } from './components/address/event-log/event-log.component';
import { RichTooltipComponent } from './components/ui/rich-tooltip/rich-tooltip.component';
import { RichTooltipDirective } from './components/ui/rich-tooltip/richt-tooltip.directive';
import { TextAreaComponent } from './components/ui/text-area/text-area.component';
import { FooterComponent } from './componenents/common/footer/footer.component';


export function appInit(sessionApiService: SessionService) {
  return () => sessionApiService.bootstrapSession();
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
    TransactionFromtoChipComponent,
    SearchComponent,
    BlockResultComponent,
    TxResultComponent,
    AddressResultComponent,
    EmptyResultComponent,
    TransactionMethodComponent,
    TransactionLogsComponent,
    DecodedValuesComponent,
    GeneralChipComponent,
    EventLogComponent,
    RichTooltipComponent,
    RichTooltipDirective,
    TextAreaComponent,
    FooterComponent
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
    TimeElapsedPipe,
    ShorthashPipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
