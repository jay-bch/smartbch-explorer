import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressComponent } from './pages/address/address.component';
import { BlockComponent } from './pages/block/block.component';
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
    path: 'tx/:addressId',
    redirectTo: 'transaction/:addressId',
    pathMatch: 'full',
  },
  {
    path: 'transaction/:transactionId',
    component: TransactionComponent,
    canActivate: [ SessionRouteGuard ]

  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
