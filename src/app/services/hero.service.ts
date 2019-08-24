import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, empty, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';

// Typescript custom enum for search types (optional)
export enum SearchType {
  comics      = 'comics',
  characters  = 'characters'
}

export enum QueryType {
  comics      = 'titleStartsWith',
  characters  = 'nameStartsWith'
}

export enum QuickDescriptionType {
  comics      = 'title',
  characters  = 'name'
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

    console.log('searchData: title = ' + title);

    if (title.length <= 0) {
      console.log(`Busca vazia para ${type}`);
      return ; // nothing ? not even an empty Array?

    } else {

      return this.http.get(`${this.url}${type}?${QueryType[type]}=${encodeURI(title)}` +
        `&limit=${this.limit}&offset=${this.offset}` +
        `&ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}`
      )
      .pipe(
        map(response => {
          // what to do with the received response?
          console.log('searchData: Got an response!');
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
    return this.http.get(`
        ${this.url}${type}/${id}?ts=${this.ts}&apikey=${this.publicKey}&hash=${this.hash}
      `)
      .pipe(
        map(response => response[`data`][`results`][0])  // catch the first object from the array - we match an ID !
      );
  }

}
