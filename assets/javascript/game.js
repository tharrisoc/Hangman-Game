var letters = 
[ ' ', '&', "'", '-', '.', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
  'Z' ];

// *********************************************************************
// replace a character in a string at a particular index
// adapted from: https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
function replaceChar( origString, newChar, index ) {
  var changed = setCharAt(origString, index, newChar );
  return changed;
}

function setCharAt( str, index, chr ) {
  if ( index > str.length-1 ) return str;
  return str.substr(0, index) + chr + str.substr(index+1);
}
// *********************************************************************

// the game object
var hangmanGame = {
  // object attributes
  wins : 0,                    // how many games has the user won?
  losses : 0,                  // how many games has the user lost?
  gameStarted : false,         // whether user has pressed an initial key
  keyPressed : null,           // the most recent key pressed
  wrongGuesses : 0,            // count
  guessesLeft : undefined,     // count
  wrongGuessList : '',         // list of incorrectly-guessed letters
  lettersGuessed : '',         // correct guesses string
  wordSubscript : -1,          // subscript of current target word
  targetWord : '',             // the word to be guessed
  targetLength : 0,            // the number of characters in the word
  targetLetters : new Array(), // the unique letters that are in the word
  correctTotal : 0,            // the number of correctly-guessed positions 

  // a small subset of thoroughbred racing vocabulary
  themeWords : [
      null,
      "thoroughbred",
      "jockey",
      "trainer",
      "owner",
      "saddle",
      "lasix",
      "paddock",
      "stable",
      "route",
      "sprint",
      "furlong",
      "filly",
      "colt",
      "mare",
      "gelding",
      "distaff",
      "toteboard",
      "favorite",
      "stakes",
      "claiming",
      "handicap",
      "allowance",
      "maiden",
      "breeder",
      "butazolidin",
      "exacta",
      "quinella",
      "trifecta",
      "stretch",
      "breakage"
  ],

  lossMessage : 
    "Sorry, you have used all of your guesses.",

  winMessage :
    "Congratulations! You have correctly guessed the word: ",

  newGameMessage : "\nStarting new game.",

  // object methods

  // choose a random integer between 1 and the number of words
  // in the vocabulary
  chooseRandomWordSubscript : function() {
    // Note: the zeroth element of the array contains null
    var numWords = this.themeWords.length - 1 ;
    var subscript = Math.floor(Math.random() * numWords) + 1;
    return subscript;
  },

  // initialize the object's properties to select a new word to guess
  initNewGame : function() {
    this.keyPressed = null;
    this.guessesLeft = 10;
    this.wrongGuesses = 0;
    this.wrongGuessList = "";
    this.wordSubscript = this.chooseRandomWordSubscript();
    this.targetWord = this.themeWords[this.wordSubscript];
    this.targetLength = this.targetWord.length;

    // Set up "unique letters within the word" structure

    this.targetLetters = new Array();
    for (var j = 0; j < letters.length; j++) {
      this.targetLetters[letters[j]] = false;
    }

    for (var i = 0; i < this.targetLength; i++) {
      var letter = this.targetWord.charAt(i);
      letter = letter.toUpperCase(); 
      this.targetLetters[letter] = true;
    }

    this.correctTotal = 0;
    this.updateDisplayTotals();
    this.lettersGuessed = this.drawWordBlanks(this.targetLength);
  },

  // create the string that shows how many letters are in the word
  // that is to be guessed
  drawWordBlanks : function( size ) {
    var dest = document.getElementById( "word-blanks" );
    var blanks = "";

    for ( i = 0; i < size; i++ ) {
      blanks += "_ ";
    }

    dest.innerHTML = blanks;
    return blanks;
  },

  // when the user makes a correct letter selection,
  // update the display to show all positions where
  // that letter appears
  addToWord : function ( letter, currentString ) {
    var dispSubs = 0;
    var newString = '';

    newString = currentString;

    for (var i = 0; i < this.targetLength; i++) {
      if ( letter === this.targetWord.charAt(i).toUpperCase()) {
        ++this.correctTotal;
        newString = replaceChar( newString, letter, dispSubs );
      }

      dispSubs += 2;
    }

    this.lettersGuessed = newString;
    var dest = document.getElementById( "word-blanks" );
    dest.innerHTML = this.lettersGuessed;
  },

  // make sure that the screen shows the most recent values
  // of the internal variables
  updateDisplayTotals : function() {
    var currentState = document.getElementById( "word-blanks");
    currentState.innerHTML = this.lettersGuessed;

    var currentWrong = document.getElementById( "wrong-guesses");
    currentWrong.innerHTML = this.wrongGuessList;

    currentLeft = document.getElementById( "guesses-left");
    currentLeft.innerHTML = this.guessesLeft.toString();

    currentWins = document.getElementById( "win-counter");
    currentWins.innerHTML = this.wins.toString();

    currentLosses = document.getElementById( "loss-counter");
    currentLosses.innerHTML = this.losses.toString();
  }
};

// Execute this function whenever a key is released
document.onkeyup = function(event) {
  var keyChar = event.key;

  // do this when the first key is pressed
  if ( hangmanGame.gameStarted === false ) {
    hangmanGame.initNewGame();
    hangmanGame.gameStarted = true;
    return;      
  }

  // keyChar is of type String
  hangmanGame.keyPressed = keyChar.toUpperCase();

  // if the key is a valid letter character and the letter is in the word
  if ( (hangmanGame.keyPressed in hangmanGame.targetLetters)
   &&  (hangmanGame.targetLetters[hangmanGame.keyPressed] === true) ) {
    // This letter is included in the word
    hangmanGame.addToWord( hangmanGame.keyPressed, hangmanGame.lettersGuessed );
    if ( hangmanGame.correctTotal === hangmanGame.targetLength ) {
      // The user has correctly guessed the word
      ++hangmanGame.wins;
      hangmanGame.updateDisplayTotals();

      /* For some reason, the LAST letter guessed is not displayed before
         the alert box pops up.
         The following are unsuccessful attempts to fix that bug:

      document.getElementById( "blanks-div" ).style.display = 'none';
      document.getElementById( "blanks-div" ).style.display = 'block';

      $(window).trigger('resize');

      $("#word-blanks").hide().show();

      $("#blanks-div").hide().show();

      $.fn.redraw = function() {
        $(this).each(function(){
          var redraw = this.offsetHeight;
        });
      };
      $('#word-blanks').redraw(); */

      // play the call to the post
      var audio = new Audio("assets/audio/first_call.mp3");
      audio.play();

      alert( hangmanGame.winMessage + hangmanGame.targetWord  
           + hangmanGame.newGameMessage );

      hangmanGame.initNewGame();
    }
  } else {
    // this is NOT one of the letters in the word
    --hangmanGame.guessesLeft;
    if ( hangmanGame.guessesLeft <= 0 ) {
      alert( hangmanGame.lossMessage + hangmanGame.newGameMessage );
      ++hangmanGame.losses;
      hangmanGame.initNewGame();
    } else {
      // add the letter to the list of incorrect guesses
      ++hangmanGame.wrongGuesses;
      hangmanGame.wrongGuessList += (hangmanGame.keyPressed + " ");
    }
  } 
  hangmanGame.updateDisplayTotals();
};
