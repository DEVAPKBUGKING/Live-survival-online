import './style.css';
import { Game } from './game/Game.js';
import { MainMenu } from './ui/MainMenu.js';

const app = document.getElementById('app');

const menu = new MainMenu(app, (mode) => {
  menu.hide();
  const game = new Game(app);
  game.start();
  window.__game = game;
});

menu.show();
