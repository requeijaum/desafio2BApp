import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'search',   pathMatch: 'full' },
  { path: 'home',                   loadChildren: './home/home.module#HomePageModule' },
  { path: 'search',                 loadChildren: './pages/search/search.module#SearchPageModule' },
  { path: 'comics',                 loadChildren: './pages/comics/comics.module#ComicsPageModule' },
  { path: 'comics/:id',             loadChildren: './pages/comic-details/comic-details.module#ComicDetailsPageModule' },
  { path: 'characters',             loadChildren: './pages/characters/characters.module#CharactersPageModule' },
  { path: 'characters/:id',         loadChildren: './pages/character-details/character-details.module#CharacterDetailsPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
