import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularComponent } from './components/test/angular/angular.component';
import { AddressComponent } from './pages/address/address.component';
import { BlockComponent } from './pages/block/block.component';
import { ConnectComponent } from './pages/connect/connect.component';
import { HomeComponent } from './pages/home/home.component';
import { TransactionComponent } from './pages/transaction/transaction.component';
import { SessionRouteGuard } from './services/session.route-guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [ SessionRouteGuard ]

  },
  {
    path: 'test',
    component: AngularComponent
  },
  {
    path: 'address/:addressId',
    component: AddressComponent,
    canActivate: [ SessionRouteGuard ]
  },
  {
    path: 'block/:blockId',
    component: BlockComponent,
    canActivate: [ SessionRouteGuard ]
  },
  {
    path: 'transaction/:transactionId',
    component: TransactionComponent,
    canActivate: [ SessionRouteGuard ]

  },
  {
    path: 'connect',
    component: ConnectComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
