import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, forkJoin } from 'rxjs';
import { map, combineAll } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';

// Typescript custom enum for search types (optional)
export enum SearchType {
  comics      = 'comics',
  characters  = 'characters',
  cwac        = 'cwac'    // we need to get the unique character - was 'characters' instead of 'cwac'
}

export enum QueryType {
  comics      = 'titleStartsWith',
  characters  = 'nameStartsWith',
  cwac        = 'name'
}

export enum QuickDescriptionType {
  comics      = 'title',
  characters  = 'name',
  cwac        = 'title'         // because still comics
}

@Injectable({
  providedIn: 'root'
})

export class HeroService {

  // let's setup the credentials
  url            = 'https://gateway.marvel.com:443/v1/public/'; // the endpoint, heh
  searchURL      = '' ;

  publicKey      = '2cd1ebaefe46822d59015b3091622ac5';
  privateKey     = 'bb2906192e9b7ace69bbe1cbcad33964054950bd';

  ts = Number(new Date()); // timestamp
  // hash = Md5.hashStr(this.ts + 'ebd407c102ea3f1262b8dd370cfa04d4a132a867d8b23f3429d72898aaffd1a321761b4a');
  hash = Md5.hashStr(this.ts + this.privateKey + this.publicKey , false);

  // accordingly to this project's requirements
  limit = 10;
  offset = 0; // we need to modify this using buttons! - take care of not getting negative values!
  total = 0;

  // may I change them to Observables?
  response: Observable<any>;
  results: Observable<any>; // or Array?

  attributionText: string;

  characterID: number; // need it for CWAC queries
  clockSource: any;


  /**
   * Constructor of the Service with Dependency Injection
   * @param http The standard Angular HttpClient to make requests
   */
  constructor(private http: HttpClient) { }

  /**
   * Get data from the Marvel Comics Public API
   * map the result to return only the results that we need
   *
   * @returns Observable with the search results
   */

  searchData(title: string, type: SearchType): Observable<any> {
    let toReturn;

    if (title === undefined) {
      title = '';
      console.log('heroService.searchData: title was undefined...');
    }

    if (title.length <= 0 && type !== 'comics') { // lets add an AND logic for showing all comics
                                                  // when the user don't input a title

      console.log('heroService.searchData: Empty search for: ' + type);
      this.offset = 0;
      this.total = 0;
      return new Observable<any>() ; // nothing ? not even an empty Array?

    } else {

      console.log('heroService.searchData: title = ' + title);
      let url = '', url2 = '';

      // we need to get comics with a character
      // the "comics" endpoint offer the following:
      // data.results[index].characters (CharacterList, optional): A resource list containing the characters which appear in this comic.
      // fire up a comics SearchType but get something when this.results.length = 1;

      console.log('heroService: The great type test: type = ' + type);

      // I may need a promise here to return 'toReturn' when all of the stuff below finishes running

      if (type === 'cwac') {   // or cwac ? the SearchType or the string ? - I modified the enum...
                               // notice that we need to write 'characters' to access the right endpoint
                               // instead of 'SearchType[type]' that returns 'cwac'

        console.log('heroService: Doing 2 requests - get the characterID and all the comics with it');

        // notice the hardcoded "limit" param - Marvel authorizes us to take 100 items per request
        // but I may not use this - does offset work at all?

        url = `${this.url}characters?${QueryType[type]}=${encodeURI(title)}` +
        `&limit=${this.limit}&offset=${this.offset}` +
        `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`;

        console.log('heroService: working on url = ' + url);

        // we need the characterID of the first (and only result) after querying for it.
        /*
        const data = this.http.get(url).subscribe(
          (x) => {
            console.log('subscribe: ');
            console.log(x);
          }
        );
        */

        const received = this.http.get(url)
        .pipe(
          map(response => response)
        );

        const dataObserver = {
          next: x => {
            console.log('heroService CWAC\'s dataObserver got: ');
            console.log(x);
            if (x[`data`][`results`][0] !== undefined) {
              this.characterID = x[`data`][`results`][0][`id`];
            } else {
              this.characterID = null;
            }

          },
          error: err => {
            console.log(err);
          },
          complete: () => {
            console.log('heroService: characterID = ' + this.characterID);

            // then: do a new request using the ID on:
            // http://gateway.marvel.com/v1/public/characters/${characterID}/comics?ts=&apiKey=&hash=
            // characters 		Return only comics which feature the specified characters
            // (accepts a comma-separated list of ids). 	int query
            // let's remove the HTTP param 'name' because we won't need it since we will pass the characterID

            console.log('heroService CWAC\'s dataObserver completed!');

            // now that we messed with characterID... let's use it!
            url2 = `${this.url}comics?characters=${this.characterID}` +
            `&limit=${this.limit}&offset=${this.offset}` +
            `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`;

            console.log('heroService: working on url2 = ' + url2);

            // https://stackoverflow.com/questions/53260269/angular-6-add-items-into-observable
            forkJoin(toReturn, this.http.get(url2));

          }
        };

        const dataSubscription = received.subscribe(dataObserver);

        // setTimeout( () => dataSubscription.unsubscribe() , 5000 ); // do I really need this?

      } else { // type !== 'cwac' - but 'comics' or 'characters'

        console.log('heroService: now normally grabbing stuff with only 1 request');

        // I will use SearchType[type] now for specifyng the endpoint - since 'server/v1/public/cwac' doesn't exist :^)
        url = `${this.url}${SearchType[type]}?${QueryType[type]}=${encodeURI(title)}` +
        `&limit=${this.limit}&offset=${this.offset}` +
        `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`;

      }

      // I may need a Promise here for setting the right url for the HTTP GET

      // now we need to return our observable
      // this may break all the things...
      // because we are assigning it to a variable instead of using Promises
      // toReturn = this.http.get(url);

      // but what about a query with type='comics' with no title?
      // we need to unset the "titleStartsWith" parameter
      // why I am sure about this? because 'comics' is the only type that can GET something without title
      // check line 79 on this document

      if (title === '') {
        toReturn = this.http.get(url.replace(QueryType[type], ''));

      } else {
        toReturn = this.http.get(url);
      }

      return toReturn.pipe(
        // combineAll(this.http.get(url2)),
        map(response => {
          // what to do with the received response?
          console.log('heroService.searchData: Got an response!');
          console.log(response);

          this.total = response[`data`][`total`];
          this.attributionText = response[`attributionText`];

          // create an Observable from the Array of Objects in response.data.results
          const stuff = response[`data`][`results`]; // since response isn't declared: we need to pass the key names in Array-like fashion

          if ((stuff.length > 0) && (typeof(stuff) === typeof([]))) {
            this.results = from(stuff);
          } else {
            this.results = from([]);
          }

          console.log('heroService: changed some directives.');

        })
      );
    }

  }

  /**
   * Get the detailed information for a comic passing an ID with "i" parameter
   *
   * @returns Observable with detailed information
   */

   getDetails(id: any, type: string) {  // not using SearchType here!

    /* - For Comic, you have:
     *
     * > creators (writer, penciler, cover artist),
     * > characters, description, events, series, stories.
     * > prices[0].price , urls[0].url
     * > example  = https://www.marvel.com/comics/issue/71169/spider-mandeadpool_2016_50
     * > endpoint = http://gateway.marvel.com/v1/public/comics/71169
     * > ?ts=1566725920&apikey=2cd1ebaefe46822d59015b3091622ac5&hash=fe8c206cf850db9133d107a025f7baae
     *
     * - For Character, you have:
     *
     * > name, description,
     * > comics.items.available, comics.items.join(', '),
     * > series.available, series.items.join(', '),
     * > stories.available, stories.items[name , type].join(', '),
     * > events.available, events.items.join(', ')
     *
     * - For Comics With a Character, you have:
     *
     * > Check this 'comics' endpoint for a character:
     * > http://gateway.marvel.com/v1/public/characters/1009157/comics
     * > ?ts=1566523976808&apikey=2cd1ebaefe46822d59015b3091622ac5&hash=cd049b0831c044852564c71b3aec5ad8
     *
     * > or you can fetch a comic normally and specify a characterId
     * > characters 		Return only comics which feature the specified characters (accepts a comma-separated list of ids).
     *
     * > find a character ID - after some suggestions - and fetch a list of comics with him in it (as seen above)
     * > I saw it in: https://github.com/fiveisprime/marvel-api
     * > use findByName - param 'name' in the URL
     * > try it on "Spider-Man"
     *
     *
     */

    console.log('heroService.getDetails: id = ' + id + ', type = ' + type);

    return this.http.get(`
        ${this.url}${SearchType[type]}/${id}?ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}
      `)
      .pipe(
        map(response => response[`data`][`results`][0])  // catch the first object from the array - we match an ID !
      );
  }

}
