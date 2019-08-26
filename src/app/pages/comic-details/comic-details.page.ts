import { HeroService } from './../../services/hero.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.page.html',
  styleUrls: ['./comic-details.page.scss'],
})

export class ComicDetailsPage implements OnInit {

  information = null;

  // presets some dates because we need to convert them
  focDate = '';
  onSaleDate = '';

  /**
   * Constructor of our details page
   * @param activatedRoute Information about the route we are on
   * @param heroService The Hero Service to get data
   */
  constructor(private activatedRoute: ActivatedRoute, private heroService: HeroService) { }

  ngOnInit() {
    // Get the ID that was passed with the URL
    const id = this.activatedRoute.snapshot.paramMap.get('id'); // const or id ? tslint complains...
    const type = 'comics' ; // hardcoded, heh - not SearchType

    // Get the information from the API
    this.heroService.getDetails(id, type).subscribe(results => {
      this.information = results;
    });
  }

  ionViewDidEnter() {
    this.onSaleDate   = this.dateFormat(this.information.dates[0].date);
    this.focDate      = this.dateFormat(this.information.dates[1].date);
  }

  openWebsite() {
    window.open(this.information.urls[0][`url`], '_blank'); // is it right?
  }


  dateFormat(date) {
    // we speak 'murica and are on -5 UTC timezone
    // will use Angular's default locale -> https://angular.io/guide/i18n
    return formatDate(date, 'yyyy/MM/dd', 'en-US', '-0500');
  }

}

