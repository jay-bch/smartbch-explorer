import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { SearchService } from 'src/app/services/user/search/search.service';

export interface ISearchResult {
  type: string;
  query?: string;
  url?: string;
  data?: any;
}

export interface ISearchResultBlock extends ISearchResult {
  data: any;
}

export interface ISearchResultTx extends ISearchResult {
  data: any;
}

export interface ISearchResultAddress extends ISearchResult {
  data: any;
}

export interface ISearchResultEnsName extends ISearchResult {
  data: any;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @ViewChild('autoCompleteInput') autoComplete: ElementRef | undefined;

  form = this.formBuilder.group({
    query: [null],
  });

  results$: BehaviorSubject<ISearchResult[]> = new BehaviorSubject<ISearchResult[]>([]);
  searchHistory$: BehaviorSubject<ISearchResult[]> = new BehaviorSubject<ISearchResult[]>([]);

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form.get('query')!.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      filter((query) => !!query),
    ).subscribe( async query => {
      this.searchService.query(query.replaceAll(/\s/g,''))
      // this.results$.next(await this.searchService.query(query.replaceAll(/\s/g,'')));
    })

    this.searchService.currentResult$.subscribe( result => {
      if(result) {
        this.results$.next([result]);
      }
    })

    this.searchHistory$ = this.searchService.searchHistory$;
  }

  optionSelected(event$: MatAutocompleteSelectedEvent) {
    this.searchService.addResult();

    this.form.patchValue({'query': null});

    if(event$.option.value.url) {
      this.router.navigate([event$.option.value.url]);
      this.autoComplete?.nativeElement.blur();

    }
  }

  displayFn(result: ISearchResult) {
    if(result && result.query) {
      return result.query;
    }
    return '';
  }

  // private async _filter(query: string): Promise<ISearchResult[]> {
  //   this.results = [];

  //   const blockHeight = this.blockResource.blockHeight$.getValue() ?? 0;

  //   const txRegex = /^0x([A-Fa-f0-9]{64})$/; //64 char hex with prefix
  //   const blockRegex = /^\d+$/; // positive number

  //   let isAddress = Web3.utils.isAddress(query);
  //   let isTx = txRegex.test(query);


  //   let blocknumber = blockRegex.test(query) ? parseInt(query, 10) : undefined;
  //   if (!blocknumber && Web3.utils.isHexStrict(query) && query.length < 8) {
  //      blocknumber = Web3.utils.hexToNumber(query);
  //   }

  //   if(!isAddress && !isTx && !blocknumber) {
  //     const emptyResult: ISearchResult = {
  //       query,
  //       type: 'empty-result'
  //     }

  //     this.results.push(emptyResult);
  //   }

  //   if(isAddress) {
  //     const addressResult: ISearchResult = {
  //       query,
  //       type: 'address',
  //       display: `Address: ${query}`,
  //       url: `/address/${query}`,
  //     }
  //     this.results.push(addressResult);
  //   }

  //   if(isTx) {
  //     this.results.push({
  //       query,
  //       type: 'tx',
  //       display: `Transaction: ${query}`,
  //       url: `/tx/${query}`,
  //       data: await this.transactionResource.getTxByHash(query)
  //     });
  //   }


  //   if(blocknumber && blocknumber > 0 && blocknumber < blockHeight) {
  //     console.log('BLOCKNO', blocknumber)
  //     const blockResult: ISearchResultBlock = {
  //       query,
  //       type: 'block',
  //       display: `Block: ${blocknumber}`,
  //       url: `/block/${blocknumber}`,
  //       data: await this.blockResource.getBlock(blocknumber)
  //     }
  //     this.results.push(blockResult);
  //   }

  //   console.log('RESULTS', this.results);
  //   return this.results;
  // }

}
