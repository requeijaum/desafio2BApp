import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, empty, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';

// Typescript custom enum for search types (optional)
export enum SearchType {
  comics      = 'comics',
  characters  = 'characters',
  cwac        = 'characters'    // we need to get the unique character
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

    if ((title.length <= 0) || (title === undefined)) {
      console.log('heroService.searchData: Empty search for: ' + type);
      return ; // nothing ? not even an empty Array?

    } else {

      console.log('heroService.searchData: title = ' + title);
      let url = '';

      // we need to get comics with a character
      // the "comics" endpoint offer the following:
      // data.results[index].characters (CharacterList, optional): A resource list containing the characters which appear in this comic.
      // fire up a comics SearchType but get something when this.results.length = 1;

      // const cwac = QueryType[2];       // can't access in a intelligent way... put the absolute position in the enum (third element)
                                          // got "undefined"... crap.

      // console.log('heroService: The great cwac test: QueryType[2] = ' + cwac);

      console.log('heroService: The great type test: type = ' + type);
      /*
      if (type === SearchType.cwac) {   // or cwac ? the SearchType or the string ?

        url = `${this.url}${SearchType[type]}?${QueryType[type]}=${encodeURI(title)}` +
        `&limit=${this.limit}&offset=${this.offset}` +
        `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`;

        // we need the characterID after finding it.
        // do a new request using the ID on:
        // http://gateway.marvel.com/v1/public/characters/${characterID}/comics?ts=&apiKey=&hash=

      } else {
        url = `${this.url}${type}?${QueryType[type]}=${encodeURI(title)}` +
        `&limit=${this.limit}&offset=${this.offset}` +
        `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`;
      }
      */

      // I will use SearchType[type] now for specifyng the endpoint - since 'server/v1/public/cwac' doesn't exist :^)
      url = `${this.url}${SearchType[type]}?${QueryType[type]}=${encodeURI(title)}` +
      `&limit=${this.limit}&offset=${this.offset}` +
      `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`;

      return this.http.get(url)
      .pipe(
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


    return this.http.get(`
        ${this.url}${type}/${id}?ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}
      `)
      .pipe(
        map(response => response[`data`][`results`][0])  // catch the first object from the array - we match an ID !
      );
  }

}
