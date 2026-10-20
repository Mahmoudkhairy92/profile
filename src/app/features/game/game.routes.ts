import { EnvironmentProviders, Provider } from '@angular/core';
import { Routes } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';
import { GameService } from '../../core/services/game.service';
import { GameComponent } from './game.component';

/**
 * The game is the only feature that uses Firebase (its leaderboard), so Firebase is provided on
 * this lazily loaded route and downloaded with the game instead of on every page.
 */
export const GAME_PROVIDERS: (Provider | EnvironmentProviders)[] = [
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  provideFirestore(() => getFirestore()),
  GameService
];

export const GAME_ROUTES: Routes = [
  {
    path: '',
    component: GameComponent,
    title: 'Tech Stack Snake - Play & Learn | Mahmoud Khairy',
    providers: GAME_PROVIDERS
  }
];
