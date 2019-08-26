import { HeroService } from './../../services/hero.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.page.html',
  styleUrls: ['./comic-details.page.scss'],
})

export class ComicDetailsPage implements OnInit {

  information = null;
  id: string;
  type: string;

  // presets some dates because we need to convert them
  focDate = '';
  onSaleDate = '';

  heroServiceSubscription: Subscription;

  heroServiceObserver = {
    next:     x => {
      console.log('heroServiceObserver: got next result = ');
      console.log(x);
    },
    error:    err => {
      console.log('heroServiceObserver: got an error!');
      console.error(err);
    },
    complete: () => {
      console.log('heroServiceObserver: completed!');
    }
  };

  /**
   * Constructor of our details page
   * @param activatedRoute Information about the route we are on
   * @param heroService The Hero Service to get data
   */
  constructor(private activatedRoute: ActivatedRoute, private heroService: HeroService) { }

  ngOnInit() {
    // Get the ID that was passed with the URL
    this.id = this.activatedRoute.snapshot.paramMap.get('id'); // const or id ? tslint complains...
    this.type = 'comics' ; // hardcoded, heh - not SearchType

    // Get the information from the API
    this.getInfo(this.id, this.type);

  }

  OnDestroy() {
    this.heroServiceSubscription.unsubscribe();
  }

  ionViewDidEnter() {
    if (this.information === null) {
      console.error('this.information is null! We won\'t be able to read dates and characters information...');
      this.getInfo(this.id, this.type);

    } else {
      this.onSaleDate   = this.dateFormat(this.information.dates[0].date);
      this.focDate      = this.dateFormat(this.information.dates[1].date);
      this.heroServiceSubscription.unsubscribe();
    }
  }

  openWebsite() {
    window.open(this.information.urls[0][`url`], '_blank'); // is it right?
  }


  dateFormat(date) {
    // we speak 'murica and are on -5 UTC timezone
    // will use Angular's default locale -> https://angular.io/guide/i18n
    let formattedDate: string;

    if ( // if the date isn't a string...
      typeof(formatDate(date, 'yyyy/MM/dd', 'en-US', '-0500')) !== typeof('')
    ) {
      console.log('comicDetailsPage: formatDate got an error for converting ' + date);

    } else {
      formattedDate = formatDate(date, 'yyyy/MM/dd', 'en-US', '-0500') ;
    }
    return formattedDate;
  }

  getInfo(id, type) {
    this.heroServiceSubscription = this.heroService.getDetails(id, type).subscribe(results => {
      this.information = results;
    });
  }
}

