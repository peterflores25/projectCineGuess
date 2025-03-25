import readlineSync from 'readline-sync';
import chalk from 'chalk';
import { movies } from './movies.js';

function playGame() {
  console.clear();
  console.log(chalk.blue.bold('🎬 DEVINE LE FILM 🎬\n'));
  
  // Sélectionner un film aléatoire
  const movieToGuess = movies[Math.floor(Math.random() * movies.length)];
  let attempts = 0;
  let found = false;
  
  // Indices disponibles dans l'ordre
  const hints = [
    { name: 'Réalisateur', value: movieToGuess.director },
    { name: 'Année de sortie', value: movieToGuess.releaseYear },
    { name: 'Genre', value: movieToGuess.genre },
    { name: 'Casting', value: movieToGuess.cast.join(', ') },
    { name: 'Synopsis', value: movieToGuess.plot }
  ];
  
  let currentHintIndex = 0;
  
  console.log(chalk.yellow('Premier indice:'));
  console.log(chalk.green(`${hints[0].name}: ${hints[0].value}\n`));
  
  while (!found) {
    const guess = readlineSync.question(chalk.cyan('Quel est ce film ? ')).toLowerCase();
    attempts++;
    
    if (guess === movieToGuess.title.toLowerCase()) {
      found = true;
      console.log(chalk.green.bold(`\n🎉 BRAVO ! Vous avez trouvé en ${attempts} essais !`));
      console.log(chalk.yellow(`Le film était bien: ${movieToGuess.title}`));
    } else {
      console.log(chalk.red('\n❌ Ce n\'est pas le bon film.'));
      
      // Donner un nouvel indice tous les 5 essais
      if (attempts % 5 === 0 && currentHintIndex < hints.length - 1) {
        currentHintIndex++;
        console.log(chalk.yellow(`\nNouvel indice :`));
        console.log(chalk.green(`${hints[currentHintIndex].name}: ${hints[currentHintIndex].value}`));
      }
      
      // Récapitulatif des indices actuels
      console.log(chalk.yellow('\nIndices disponibles :'));
      for (let i = 0; i <= currentHintIndex; i++) {
        console.log(chalk.green(`${hints[i].name}: ${hints[i].value}`));
      }
      console.log('');
    }
  }
  
  // Demander si le joueur veut rejouer
  if (readlineSync.keyInYN('\nVoulez-vous rejouer ?')) {
    playGame();
  } else {
    console.log(chalk.blue.bold('\nMerci d\'avoir joué ! À bientôt ! 👋'));
  }
}

// Démarrer le jeu
playGame();