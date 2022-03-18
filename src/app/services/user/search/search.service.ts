import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISearchResult, ISearchResultAddress, ISearchResultBlock, ISearchResultEnsName } from 'src/app/components/search/search.component';
import Web3 from 'web3';
import { AddressResourceService } from '../../resources/address/address-resource.service';
import { BlockResourceService } from '../../resources/block/block-resource.service';
import { TransactionResourceService } from '../../resources/transaction/transaction-resource.service';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { NodeApiService } from '../../api/node-api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchHistory$ = new BehaviorSubject<ISearchResult[]>([]);
  currentResult$ = new BehaviorSubject<ISearchResult | undefined>(undefined);

  constructor(
    private blockResource: BlockResourceService,
    private transactionResource: TransactionResourceService,
    private addressService: AddressResourceService,
    private apiService: NodeApiService,
  ) {

  }

  addResult(result?: ISearchResult) {
    const history = this.searchHistory$.getValue();
    const current = this.currentResult$.getValue();

    if(current && current.type !== 'empty-result' && current.type !== 'undefined') {
      history.unshift(current);
    }
    // console.log('>>', result ?? {type: 'undefined'});
    this.searchHistory$.next(history);
    this.currentResult$.next(result ?? {type: 'undefined'});
  }

  async query(query: string): Promise<ISearchResult[]> {
    const blockHeight = this.blockResource.blockHeight$.getValue() ?? 0;

    const txRegex = /^0x([A-Fa-f0-9]{64})$/; //64 char hex with prefix
    const blockRegex = /^\d+$/; // positive number

    let isAddress = false;
    try {
      isAddress = Web3.utils.isAddress(toChecksumAddress(query));
    } catch {}

    let isEnsName = false;
    let ensAddress = "";
    try {
      ensAddress = await this.apiService.ensAddressLookup(query.toLowerCase());
      isEnsName = !!ensAddress;
    } catch {}

    let isTx = txRegex.test(query);

    let blocknumber = blockRegex.test(query) ? parseInt(query, 10) : undefined;
    if (!blocknumber && Web3.utils.isHexStrict(query) && query.length < 8) {
       blocknumber = Web3.utils.hexToNumber(query);
    }

    if(!isAddress && !isEnsName && !isTx && !blocknumber) {
      const emptyResult: ISearchResult = {
        query,
        type: 'empty-result'
      }

      this.addResult(emptyResult);
    }

    if(isAddress) {
      const address = toChecksumAddress(query);
      const addressResult: ISearchResultAddress = {
        query: address,
        type: 'address',
        url: `/address/${address}`,
        data: await this.addressService.getAddressInfo(address)
      }
      this.addResult(addressResult);
    }

    if (isEnsName) {
      const addressResult: ISearchResultEnsName = {
        query: query,
        type: 'ensName',
        url: `/address/${ensAddress}`,
        data: { ensName: query, ensAddress: ensAddress }
      }
      this.addResult(addressResult);
    }

    if(isTx) {
      this.addResult({
        query,
        type: 'tx',
        url: `/tx/${query}`,
        data: await this.transactionResource.getTxByHash(query, true)
      });
    }


    if(blocknumber && blocknumber > 0 && blocknumber < blockHeight) {
      const blockResult: ISearchResultBlock = {
        query,
        type: 'block',
        url: `/block/${blocknumber}`,
        data: await this.blockResource.getBlock(blocknumber)
      }
      this.addResult(blockResult);
    }

    const lastResult = this.currentResult$.getValue();
    if (lastResult) {
      // console.log('RESULTS', lastResult);
      return [lastResult]
    }

    return [];
  }
}
