import { HeroService, SearchType, QueryType } from './../../services/hero.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})

export class SearchPage implements OnInit, OnDestroy {

  search: Observable<any>;
  results: Observable<any>;
  resultsToShow: Array<any>;

  searchTerm: ''; // string = '' ?
  type: SearchType = SearchType.characters;

  searchSubscription: Subscription;
  resultsSubscription: Subscription;

  searchObserver = {
    next: x => {
      console.log('searchObserver got a next value: ');
      console.log(x);
    },
    error: err => {
      console.error('searchObserver got an error: ' + err);
      this.loadingController.dismiss();
      this.presentAlert('Error', 'An error occurred while processing your request.');
    },
    complete: () => {
      console.log('searchObserver got a complete notification');

      // clean previous results!
      this.resultsToShow = [] ;

      this.resultsSubscription = this.heroService.results.subscribe(this.resultsObserver); // bug here?
      console.log('searchObserver - got results... from this.heroService.results');
      delay(3000); // I don't think it's working
      // this.loadingController.dismiss();
    }
  };

  resultsObserver = {
    next: x => {
      console.log('resultsObserver got a next value:');
      console.log(x);
      this.resultsToShow = this.resultsToShow.concat(x);
    },
    error: err => {
      console.error('resultsObserver got an error: ' + err);
      this.presentAlert('Error', 'An error occurred while processing your request.');
    },
    complete: () => {
      console.log('resultsObserver got a complete notification');
      // delay(3000); // I don't think it's working

      // calculate the number stuff
      // this.pageStart = Math.floor(this.heroService.offset / this.heroService.offset);
      // this.pageEnd = Math.floor(this.resultsToShow.length / this.heroService.offset);
      this.currentPage = Math.ceil((this.heroService.offset + this.heroService.limit) / this.heroService.limit);
      this.pageCount =  Math.ceil(this.heroService.total / this.heroService.limit);
      // this.pages = this.pagination(currentPage, pageCount);

      // console.log('Here is the pagination:');
      // console.log(this.pages);
      console.log('currentPage: ' + this.currentPage + ', pageCount: ' + this.pageCount);

      this.loadingController.dismiss();

    }
  };

  // pages: Array<any>;
  currentPage: number;
  pageCount: number;

  /**
   * Constructor of our first page
   * @param heroService The hero Service to get data
   */
  constructor(
    private heroService: HeroService,
    public loadingController: LoadingController,
    public alertController: AlertController

  ) { }

  ngOnInit() {
    console.log('ngOnInit: search page!');
    this.resultsToShow = [];
    // this.pages = [];
    this.currentPage = 0;
    this.pageCount = 0;
    // changed them on the service!
    // this.heroService.response = new Observable();
    // this.heroService.results = new Observable();

  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.resultsSubscription.unsubscribe();
  }

  searchChanged() {
    // Call our service function which returns an Observable
    this.search = this.heroService.searchData(this.searchTerm, this.type);
    // this.results = this.heroService.results; // not here!

    // I think I may change that
    console.log('searchChanged from search.page ! Outputting this.search:');
    console.log(this.search);

    // Create observer object, outside this function.
    this.searchSubscription = this.search.subscribe(this.searchObserver);
    // this.resultsSubscription = this.results.subscribe(this.resultsObserver); // there is a bug here

    // now spin up the loader
    this.presentLoadingWithOptions();

  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      // spinner: null,
      // duration: 3000,
      message: 'Please wait...',
      translucent: true,
      showBackdrop: true,
      backdropDismiss: true // may I change this?
      // cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

  async presentAlert(msg: string, sub: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: sub,
      message: msg,
      buttons: ['OK']
    });
  }

  // got more functions?

  // bugs
  // 1 - offset == 0 ? what happens?

  previousResults() {
    console.log('previousResults: memes');

    if (this.heroService.offset === 0 ) { // stop changing the offset!
      console.log('previousResults: offset = 0 !');
      // this.heroService.offset += 10; // compensation...

    } else {
      console.log('previousResults: subtract offset');
      this.heroService.offset -= this.heroService.limit; // skip through more data using offsets!

      // fire up an event?
      this.searchChanged();
    }

  }

  nextResults() {
    console.log('nextResults: memes');

    if (this.heroService.offset === this.heroService.total ) { // stop getting data!
      console.log('nextResults: offset = total-offset !');
      // this.heroService.total -= 10; // compensation...
    }

    if (this.heroService.offset > this.heroService.total - this.heroService.offset) {
      console.log('nextResults: you don\'t have any more data to show!');
    }

    if (this.heroService.offset < this.heroService.total) {
      console.log('nextResults: add more offset!');
      this.heroService.offset += this.heroService.limit; // skip through more offsets!
    }

    // fire up an event?
    console.log('offset: ' + this.heroService.offset);
    console.log('total: ' + this.heroService.total);
    this.searchChanged();
    }

    pagination(currentPage, pageCount) {  // found on GitHub - written for ES6
                                          // https://gist.github.com/kottenator/9d936eb3e4e3c3e02598#gistcomment-2011128
      const delta = 2,
          left = currentPage - delta,
          right = currentPage + delta + 1;

      let result = [];

      result = Array.from({length: pageCount}, (v, k) => k + 1)
          .filter(i => i && i >= left && i < right);

      return result;

    }


}


