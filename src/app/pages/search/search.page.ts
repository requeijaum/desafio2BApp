import { HeroService, SearchType, QueryType } from './../../services/hero.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, from } from 'rxjs';

import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { delay, concat } from 'rxjs/operators';

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
  type: SearchType = SearchType.comics; // preseting the default type for the list
  oldType: SearchType ; // track previous search type - for searchChanged() returning to the first page

  searchSubscription: Subscription;
  resultsSubscription: Subscription;

  comicsAuthors: string;
  tempArray: Array<any>;

  searchObserver = {
    next: x => {
      console.log('searchObserver got a next value: ');
      console.log(x);
    },
    error: err => {
      console.error('searchObserver got an error: ' + err);

      setTimeout(() => { // will this be enough for network errors?
        this.dismissLoading();

        this.presentAlert('Error', 'An error occurred while processing your request.');
      }, 5000);

      // clean previous results? nah.
      // set this.oldType to be equal as this.type?
      this.resultsToShow = [] ; // we also clear from searchChanged()...

    },
    complete: () => {
      console.log('searchObserver got a complete notification');

      // clean previous results!
      this.resultsToShow = [] ; // we also clear from searchChanged()...

      this.resultsSubscription = this.heroService.results.subscribe(this.resultsObserver); // bug here?
      console.log('searchObserver - got results... from this.heroService.results');
      delay(3000); // I don't think it's working
      // dismissLoading();

      // something usable here
      this.oldType = this.type;

    }
  };

  resultsObserver = {
    next: x => {
      console.log('resultsObserver got a next value:');
      console.log(x);

      if ((this.type === 'comics')) {
        // we need to process the response...
        // first: get all the writers on new property inside the received object "comic.creators.writers"
        // get all of them on x[`creators`][`items`] where that.role = "writer"
        this.tempArray = [];

        x[`creators`][`items`].forEach(element => {

          if (element[`role`] === 'writer') {
            this.tempArray = this.tempArray.concat(element[`name`]);
          }

        });

        this.resultsToShow = this.resultsToShow.concat(x);
      }

      if (this.type === 'characters') {
        // simple as that
        this.resultsToShow = this.resultsToShow.concat(x);
      }

      if (this.type === 'cwac') {
        // get the comics key and concat it's objects inside the array
        // this.resultsToShow = this.resultsToShow.concat(x[`comics`][`items`]);

        // we need to process the response...
        // first: get all the comicIDs after doing a REGEX
        // on new property inside the received object "comics.items.resourceURI"
        this.tempArray = [];

        x[`comics`][`items`].forEach(element => {

          if (/.public.comics./g.test(element[`resourceURI`])) { // test for valid URLs
            const comicID = element[`resourceURI`].match(/(?:\d)(\d{1,})/g); // https://i.imgur.com/Sya5ahU.png
            this.tempArray = this.tempArray.concat(comicID);
            element[`injectedId`] = comicID;
            // console.log('searchPage: cwac got comicID = ' + comicID);
          } else {
            console.log('searchPage: the REGEX for finding comicIDs in cwac failed!');
          }

        });

        console.log('searchPage: the REGEX found this comicIDs = ');
        console.log(this.tempArray); // we need to know how to add for our routerLinks
        this.resultsToShow = this.resultsToShow.concat(x[`comics`][`items`]);

        // if the routerLinks are failing... I can inject the ID's through Observable sorcery

      }

    },
    error: err => {
      console.error('resultsObserver got an error: ' + err);
      this.presentAlert('Error', 'An error occurred while processing your request.');
    },
    complete: () => {
      console.log('resultsObserver got a complete notification');
      // delay(3000); // I don't think it's working

      if (this.type === 'comics') {
        // x[`creators`][`stringWriters`] = "Testing";
        this.comicsAuthors = this.tempArray.join(', ');
      }

      if (this.type === 'cwac') {
        // x[`creators`][`stringWriters`] = "Testing";
        // this.comicIDs = this.tempArray.join(', ');
        console.log('searchPage: look for the injected IDs!');
      }

      // calculate the number stuff
      // this.pageStart = Math.floor(this.heroService.offset / this.heroService.offset);
      // this.pageEnd = Math.floor(this.resultsToShow.length / this.heroService.offset);
      this.currentPage = Math.ceil((this.heroService.offset + this.heroService.limit) / this.heroService.limit);
      this.pageCount =  Math.ceil(this.heroService.total / this.heroService.limit);
      // this.pages = this.pagination(currentPage, pageCount);

      // console.log('Here is the pagination:');
      // console.log(this.pages);
      console.log('currentPage: ' + this.currentPage + ', pageCount: ' + this.pageCount);

      this.dismissLoading();

    }
  };

  // pages: Array<any>;
  currentPage: number;
  pageCount: number;

  loadingAppears: boolean;

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

    // preset some stuff that we really need

    this.resultsToShow = [];
    // this.pages = [];
    this.currentPage = 0;
    this.pageCount = 0;

    console.log(this.getOldType());

    this.search = new Observable<any>(); // since searchData now uses Promises...

    // we need to fire up something to trigger the default search
    // that shows all the comics
    this.searchChanged();
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.resultsSubscription.unsubscribe();
  }

  searchChanged() {
    let done = false;

    if (this.oldType !== this.type) { // Will this be set before calling searchData() ?
      console.log('The SearchType has changed! The offset needs to be 0!');
      this.heroService.offset = 0;
      done = true;

    } else {
      done = true;
    }

    const isItDoneYet = new Promise((resolve, reject) => {
      if (done) {
        const workDone = 'searchChanged: oldType = ' + this.oldType + '; type = ' + this.type;
        resolve(workDone);

      } else {
        const why = 'searchChanged: Still working on something else. That\'s sad.';
        reject(why);
      }

    });

    const checkIfItsDone = () => {
      isItDoneYet
        .then(ok => {
          console.log('searchPage: checkIfItsDone - got OK');
          console.log(ok);
          setTimeout( () => this.searchEvent() , 1000 ); // let's delay it a little because
                                                         // heroService.dataObserver needs some time
        })
        .catch(err => {
          console.log('searchPage: checkIfItsDone - the promise got an error');
          console.error(err);
        });
    };

    checkIfItsDone();

  }

  searchEvent() {
    // do we really need to clear the previous results?
    this.results = from([]);

    console.log(this.getOldType());

    // Call our service function which returns an Observable
    // this.search = this.heroService.searchData(this.searchTerm, this.type); // can we call this after some stuff?
    // this.results = this.heroService.results; // not here!

    this.search = this.heroService.searchData(this.searchTerm, this.type); // we may get an error for this

    // trigger something to show or hide in the search page?
    this.loadingAppears = false; // we need presentLoadingWithOptions() to put "true" on this ONLY

    // Create observer object, outside this function.
    // this.searchSubscription = this.search.subscribe(this.searchObserver);
    // but... can we pause our observable?
    setTimeout(() => {
      this.searchSubscription = this.search.subscribe(this.searchObserver);

      // I think I may change that
      console.log('searchEvent: Outputting this.search:');
      console.log(this.search);

    } , 3000);


    // this.resultsSubscription = this.results.subscribe(this.resultsObserver); // there is a bug here

    // now spin up the loader
    this.presentLoadingWithOptions();


  }

  async presentLoadingWithOptions() {

    this.loadingAppears = true;

    /*
    const loading = await this.loadingController.create({
      // spinner: null,
      // duration: 3000,
      message: 'Please wait...',
      translucent: true,
      showBackdrop: true,
      backdropDismiss: true // may I change this?
      // cssClass: 'custom-class custom-loading'
    });
    */
    return await 0 ; // loading.present();
  }

  dismissLoading() {
    // this.loadingController.dismiss();
    this.loadingAppears = false;
  }

  async presentAlert(msg: string, sub: string) { // do I need to set it on some variables?

    const alert = await this.alertController.create({
      header: msg,
      // subHeader: sub,
      message: sub,
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

    if (this.heroService.offset > (this.heroService.total - this.heroService.limit)) { // verify this later
      console.log('nextResults: you don\'t have any more data to show!');

    } else {
      if (this.heroService.offset < this.heroService.total) {
        console.log('nextResults: add more offset!');
        this.heroService.offset += this.heroService.limit; // skip through more offsets!

        // fire up an event?
        console.log('offset: ' + this.heroService.offset);
        console.log('total: ' + this.heroService.total);
        this.searchChanged();

      }
    }
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

  async getOldType() {
    this.oldType = this.type; // track previous searchType
    return await 'getOldType: got it!';
  }

}


