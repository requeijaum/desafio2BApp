import { HeroService } from './../../services/hero.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.page.html',
  styleUrls: ['./comic-details.page.scss'],
})

export class ComicDetailsPage implements OnInit {

  information = null;

  /**
   * Constructor of our details page
   * @param activatedRoute Information about the route we are on
   * @param heroService The Hero Service to get data
   */
  constructor(private activatedRoute: ActivatedRoute, private heroService: HeroService) { }

  ngOnInit() {
    // Get the ID that was passed with the URL
    const id = this.activatedRoute.snapshot.paramMap.get('id'); // const or id ? tslint complains...
    const type = 'characters' ; // hardcoded, heh - not SearchType

    // Get the information from the API
    this.heroService.getDetails(id, type).subscribe(results => {
      this.information = results;
    });
  }

  openWebsite() {
    window.open(this.information.urls[0][`url`], '_blank'); // is it right?
  }
}
