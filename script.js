const gridElement = document.getElementById('grid');
const resultContainer = document.getElementById('result-container');
const playAgainBtn = document.getElementById('play-again');
const popup = document.getElementById('popup');

const wordLength = 5;
const guessAmount = 6;

let wordBank;
let word;
let lettersIndexes;
let currentRow = 0;
let currentCol = -1;
let gameOver = false;
let isFetchingDone = false;

// fetch a random five letter word
async function fetchWord() {
  const url = 'https://random-word-api.herokuapp.com/word?length=5&number=8885&lang=en';
  const res = await fetch(url)
  const data = await res.json();
  wordBank = data;
  isFetchingDone = true;
}

function getRandomWord() {
  return wordBank[Math.floor(Math.random() * wordBank.length)].toUpperCase();
}

// Get indexes of each letter in the word
function getLetterIndexes(randomWord) {
  const lettersIndexes = {};
  for (let i = 0; i < randomWord.length; i++) {
    const letter = randomWord[i];
    if (!(letter in lettersIndexes)) {
      lettersIndexes[letter] = [i];
    } else {
      lettersIndexes[letter].push(i);
    }
  }
  return lettersIndexes;
}

// Remove the last inserted letter
function removeLetterFromGrid() {
  currentCell().innerHTML='';
  if (currentCol >= 0) {
    currentCol--;
  }
}

// check if the letters in 'currentRow' are in the correct position
function checkRow() {
  
    let counter = 0;

    // get amount of each letter in the word with 'letterIndexes'
    const lettersAmounts = {};
    for (const letter in lettersIndexes) {
      lettersAmounts[letter] = lettersIndexes[letter].length;
    }


    for (let col = 0 ; col < wordLength; col++) {
      const cell = getCellByIndexes(currentRow, col);
      const guessedLetter = cell.innerText;

      // the guessed letter is not in the word
      console.log(guessedLetter, lettersIndexes, guessedLetter in lettersIndexes);
      if (!(guessedLetter in lettersIndexes) || lettersAmounts[guessedLetter] === 0) {
        cell.classList.add('wrong-letter');
      }

      // the guessed letter is in the word but in the wrong position
      else if (lettersIndexes[guessedLetter].indexOf(col) === -1 && lettersAmounts[guessedLetter] > 0) {
        cell.classList.add('wrong-position');
        lettersAmounts[guessedLetter]--;
      }

      // the guessed letter is in the word and in the correct position
      else {
        cell.classList.add('correct-letter');
        lettersAmounts[guessedLetter]--;
        counter++;
      }
    }
    
    if (counter === wordLength) {
      gameResult('You win ╰(*°▽°*)╯!');
    }
}

// Get the current cell
function currentCell() {
  return document.getElementById(`${(currentRow * wordLength) + currentCol}`);
}

function getCellByIndexes(row, col) {
  return document.getElementById(`${row * wordLength + col}`);
}

function isAWord() {
  const lettersAmounts = {};
  for (const letter in lettersIndexes) {
    lettersAmounts[letter] = lettersIndexes[letter].length;
  }

  let guessedWord = '';
  for (let col = 0 ; col < wordLength; col++) { 
    const cell = getCellByIndexes(currentRow, col);
    const guessedLetter = cell.innerText;
    guessedWord += guessedLetter;
  }
  return wordBank.includes(guessedWord.toLowerCase());
}

function popupNotAWord() {
  popup.classList.add('pop');
  setTimeout(() => popup.classList.remove('pop'), 3000);
}

function gameResult(message) {
  gameOver = true;
  resultContainer.getElementsByClassName('text-result')[0].innerHTML = message;
  resultContainer.style.display = 'flex';
}

function addLetterToGrid(key) {
  if (currentCol < wordLength - 1) {
    currentCol++;
    currentCell().innerHTML = key;
    if(currentCol === wordLength-1) {
      if (isAWord()) {
        checkRow();
        currentRow++;
        currentCol = -1;
        if (!gameOver && currentRow === guessAmount) {
          gameResult('You Lost (._.`) !');
        }
      }
      else {
        popupNotAWord();
      }
    }
  }
}

function updateGird(event) {
  if(!gameOver) {
    const key = event.key.toUpperCase();
    if (key === 'BACKSPACE' && currentCol >= 0) {
      removeLetterFromGrid();
    } else if (key.length === 1 && 'A' <= key && key <= 'Z') {
      addLetterToGrid(key);
    }
  }
}

// init the DOM grid
function initDOMGrid() {
    gridElement.innerHTML = '';
  for (let i = 0; i < guessAmount; i++) {
    for (let j = 0; j < wordLength; j++) {
      const cell = document.createElement('div');
      cell.classList = 'cell';
      cell.id = `${i * wordLength + j}`;
      gridElement.appendChild(cell);
    }
  }
}

// Start the game
async function startGame() {
  currentRow = 0;
  currentCol = -1;
  gameOver = false;
  initDOMGrid();

  resultContainer.style.display = 'none';

  if (!isFetchingDone) {
    await fetchWord();
  }
  
  const randomword = getRandomWord();
  lettersIndexes = getLetterIndexes(randomword);
  word = randomword
  const correctWord = document.querySelectorAll('.cell.correct-letter');
  correctWord.forEach((letterElement,index) => letterElement.innerHTML = word[index]);
}

// init game
startGame();

// Event Listeners
window.addEventListener('keydown', updateGird);
playAgainBtn.addEventListener('click', startGame);