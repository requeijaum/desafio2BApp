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

  response: Observable<any>;
  searchTerm: ''; // string = '' ?
  type: SearchType = SearchType.characters;

  searchSubscription: Subscription;

  searchObserver = {
    next: x => {
      console.log('searchObserver got a next value: ' + x);
    },
    error: err => {
      console.error('searchObserver got an error: ' + err);
      this.presentAlert('Error', 'An error occurred while processing your request.');
    },
    complete: () => {
      console.log('searchObserver got a complete notification');
      delay(3000); // I don't think it's working
      this.loadingController.dismiss();
    }
  };


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

  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  searchChanged() {
    // Call our service function which returns an Observable
    this.response = this.heroService.searchData(this.searchTerm, this.type);

    // Create observer object, outside this function.
    this.searchSubscription = this.response.subscribe(this.searchObserver);
    this.presentLoadingWithOptions();

  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      // spinner: null,
      // duration: 3000,
      message: 'Please wait...',
      translucent: true,
      showBackdrop: true,
      backdropDismiss: false
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

}
