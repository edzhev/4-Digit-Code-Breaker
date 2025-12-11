/*
4 Digit Code Breaker Game - JavaScript
Banner ID: 001501763
Name: Edzhe_Veli
Course ID:COMP1950
*/

//==== GAME VARIABLES ====
// Current game state
var secretCode = []; // The 4 digit code that player needs to guess
var currentGuess = [0, 0, 0, 0]; // Current player guess
var attempts = []; // List of all attempts
var gameOver = false; // Is the game finished or not?
var score = 0;  // Players score
var max_attempts = 10; // maximum number of guesses allowed

//==== HTML ELEMENTS ====
// Get references to elements on the page
var attemptsCount = document.getElementById("attempts-count");
var scoreDisplay = document.getElementById("score-display");
var secretCodeBox = document.getElementById("secret-code-container");
var secretCodeDisplay = document.getElementById("secret-code-display");
var checkButton = document.getElementById("check-btn");
var resetButton = document.getElementById("reset-btn");
var saveButton = document.getElementById("save-btn");
var messageBox = document.getElementById("game-message");
var attemptsList = document.getElementById("attempts-list");
var highScoreList = document.getElementById("highscores-list");
var modal = document.getElementById("save-score-modal");
var finalScoreText = document.getElementById("final-score-text");
var playerNameInput = document.getElementById("player-name");
var saveScoreButton = document.getElementById("save-score-btn");
var closeModalButton = document.getElementById("close-modal-btn");

// Digit Picker Element
var digitPickers = document.querySelectorAll(".digit-picker");


//FUNCTION 1: generateCode() - Creates a random 4 digit secret code
function generateCode() {
    var code = []; // empty array to store number
    for (var i = 0; i < 4; i++) {  // loops 4 times to create 4 digits
        var randomDigit = Math.floor(Math.random() * 10); // generate random number 0-9
        code.push(randomDigit);  //add it to the code array
    }
    return code; // return the 4 digit code
}

//FUNCTION 2: checkGuess() - Compares player's guess to the secret code, returns the number as a black pegs and white pegs
function checkGuess(guess, code) {
    var blackPegs = 0; //correct position
    var whitePegs = 0; //wrong position
    
    var codeCopy = [];
    var guessCopy = [];
    for (var i = 0; i < 4; i++) {
        codeCopy[i] = code[i];
        guessCopy[i] = guess[i];
    }

    //FIRST: Find exact black peg matches 
    // Loop through all 4 positions
    for (var i = 0; i < 4; i++) {
        if (guessCopy[i] === codeCopy[i]) {
            blackPegs = blackPegs + 1;  //add a black peg
            codeCopy[i] = -1;           //mark used in code
            guessCopy[i] = -2;          //mark used in guess
        }
    }

    //SECOND: Find digits in wrong positions - white pegs
    for (var i = 0; i < 4; i++) {
        if (guessCopy[i] === -2) { //skip if already matched
            continue;
        }
        for (var j = 0; j < 4; j++) {
            if (guessCopy[i] === codeCopy[j]) {
                whitePegs = whitePegs + 1; //adds a white peg
                codeCopy[j] = -1; //mark as used
                break; //stop searching
            }
        }
    }
    return { //result as an object
        blackPegs: blackPegs,
        whitePegs: whitePegs
    };
}

//FUNCTION 3: updateBoard()- Adds a new attempt row to the game board
function updateBoard(attempt, attemptNumber) {
    // create main container
    var row = document.createElement("div");
    row.className = "attempt-row";

    // create attempt number section
    var numberLabel = document.createElement("span");
    numberLabel.className = "attempt-number";
    numberLabel.textContent = "#" + attemptNumber;
    row.appendChild(numberLabel);

    // create container for 4 digits
    var digitsBox = document.createElement("div");
    digitsBox.className = "attempt-digits";

    // add each digit to the digits box
    for (var i = 0; i < 4; i++) {
        var digitBox = document.createElement("div");
        digitBox.className = "attempt-digit";
        digitBox.textContent = attempt.guess[i];
        digitsBox.appendChild(digitBox);
    }
    row.appendChild(digitsBox);

    // create container for pegs
    var pegsBox = document.createElement("div");
    pegsBox.className = "pegs-container";

    // build array for pegs
    var pegs = [];
    for (var i = 0; i < attempt.blackPegs; i++) {
        pegs.push("black");
    }
    for (var i = 0; i < attempt.whitePegs; i++) {
        pegs.push("white");
    }
    // fill remaining with empty pegs
    while (pegs.length < 4) {
        pegs.push("empty"); 
    }

    //creating peg elements
    for (var i = 0; i < 4; i++) {
        var peg = document.createElement("div");
        peg.className = "peg peg-" + pegs[i];
        pegsBox.appendChild(peg);
    }
    row.appendChild(pegsBox);
    
    //the row of top of the list
    if (attemptsList.firstChild) {
        attemptsList.insertBefore(row, attemptsList.firstChild);
    } else {
        attemptsList.appendChild(row);
    }
}

//SCORING
function calculateScore(attemptsList, won) {
    // if player didn't win = 0 score
    if (won === false) {
        return 0;
    }
    //base score 1000
    var finalScore = 1000;
    //find best attempt with the black pegs
    var maxBlackPegs = 0;
    for (var i = 0; i < attemptsList.length; i++) {
        if (attemptsList[i].blackPegs > maxBlackPegs) {
            maxBlackPegs = attemptsList[i].blackPegs;
        }
    }

    //add bonus 
    finalScore = finalScore + (maxBlackPegs * 100);
    finalScore = finalScore - ((attemptsList.length - 1) * 50);
    return finalScore;
}

//HIGH SCORE - using localStorage
//get high scores from localStorage
function getHighScores() {
    var scores = [];
    //saving data
    var savedData = localStorage.getItem("codebreaker_highscores");

    if (savedData !== null) {
        scores = JSON.parse(savedData);

        //show highest data first
        for (var i = 0; i < scores.length - 1; i++) {
            for (var j = i + 1; j < scores.length; j++) {
                if (scores[j].score > scores[i].score) {
                    var temp = scores[i];
                    scores[i] = scores[j];
                    scores[j] = temp;
                }
            }
        }
    }
    return scores;
}

//save, get and create new high scores
function saveHighScore(name, playerScore, attemptCount) {
    var scores = getHighScores();
    var newScore = {
        name: name,
        score: playerScore,
        attempts: attemptCount,
        date: new Date().toLocaleDateString()
    };

    //add to array and sort by highest score
    scores.push(newScore);

    for (var i = 0; i < scores.length - 1; i++) {
        for (var j = i + 1; j < scores.length; j++) {
            if (scores[j].score > scores[i].score) {
                var temp = scores[i];
                scores[i] = scores[j];
                scores[j] = temp;
            }
        }
    }

    //keep only top 10 scores
    if (scores.length > 10) {
        scores = scores.slice(0, 10);
    }

    //save to localStorage
    localStorage.setItem("codebreaker_highscores", JSON.stringify(scores));
}

//display highScores on the page
function displayHighScores() {
    var scores = getHighScores();

    //clear current display
    highScoreList.innerHTML = "";

    //show message if there is no any scores achieved
    if (scores.length === 0) {
        highScoreList.innerHTML = '<div class="empty-scores">' +
            '<p>CONGRATS!</p>' +
            '<p>No high scores yet!</p>' +
            '<p>Be the first one! </p>' +
            '</div>';
        return;
    }

    //row for each score and the row element
    for (var i = 0; i < scores.length; i++) {
        var scoreData = scores[i];

        var row = document.createElement("div");
        row.className = "highscore-row";

        //rank styling
        var rankClass = "";
        var rankText = (i + 1);
        if (i === 0) { rankClass = "gold"; rankText = "1st"; }
        else if (i === 1) { rankClass = "silver"; rankText = "2nd"; }
        else if (i === 2) { rankClass = "bronze"; rankText = "3rd"; }

        //build row HTML
        row.innerHTML = '<span class="highscore-rank ' + rankClass + '">' + rankText + '</span>' +
            '<div class="highscore-info">' +
            '<div class="highscore-name">' + scoreData.name + '</div>' +
            '<div class="highscore-details">' + scoreData.attempts + ' attempts . ' + scoreData.date + '</div>' +
            '</div>' +
            '<span class="highscore-score">' + scoreData.score + '</span>';
        highScoreList.appendChild(row);
    }
}

//SAVE AND LOAD GAME FUNCTIONS

//save current game to localStorage
function saveGame() {
    var gameData = {
        secretCode: secretCode,
        attempts: attempts,
        currentGuess: currentGuess,
        savedAt: new Date().toISOString()
    };
    localStorage.setItem("codebreaker_savedgame", JSON.stringify(gameData));
    showMessage("Game saved!", "success");
}

//load saved game from localStorage
function loadSavedGame() {
    var savedData = localStorage.getItem("codebreaker_savedgame");
    if (savedData !== null) {
        return JSON.parse(savedData);
    }
    return null;
}

//delete saved game
function clearSavedGame() {
    localStorage.removeItem("codebreaker_savedgame");
}

//UPDATE FUNCTIONS
//update attempts
function updateAttemptsDisplay() {
    attemptsCount.textContent = attempts.length + "/" + max_attempts;
}

//update score
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

//when game ends, reveal the secret code
function revealSecretCode() {
    secretCodeBox.classList.remove("hidden");
    secretCodeDisplay.innerHTML = "";

    for (var i = 0; i < 4; i++) {
        var digitBox = document.createElement("div");
        digitBox.className = "code-digit";
        digitBox.textContent = secretCode[i];
        secretCodeDisplay.appendChild(digitBox);
    }
}

//show a message to the player
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = "game-message " + type;
    messageBox.classList.remove("hidden");
}

//hide message
function hideMessage() {
    messageBox.classList.add("hidden");
}

//update digit displays
function updateDigitPickers() {
    for (var i = 0; i < digitPickers.length; i++) {
        var picker = digitPickers[i];
        var display = picker.querySelector(".digit-display");
        display.textContent = currentGuess[i];
    }
}

//game controls
function setControlsDisabled(disabled) {
    checkButton.disabled = disabled;
    saveButton.disabled = disabled;
    for (var i = 0; i < digitPickers.length; i++) {
        var buttons = digitPickers[i].querySelectorAll(".picker-btn");
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].disabled = disabled;
        }
    }
}

//MAIN GAME FUNCTIONS
//handle when player submits a guess
function submitGuess() {
    if (gameOver === true) {
        return;
    }
    //check the guess secret code
    var result = checkGuess(currentGuess, secretCode);
    //create attempt record
    var attempt = {
        guess: [currentGuess[0], currentGuess[1], currentGuess[2], currentGuess[3]],
        blackPegs: result.blackPegs,
        whitePegs: result.whitePegs
    };
    //add attempts list
    attempts.push(attempt);

    //display
    updateBoard(attempt, attempts.length);
    updateAttemptsDisplay();

    //check if player win - 4 black pegs = all correct
    if (result.blackPegs === 4) {
        gameOver = true;
        score = calculateScore(attempts, true);
        updateScoreDisplay();
        showMessage("YOU CRACKED THE CODE!! " + attempts.length + " attempts!", "success");
        setControlsDisabled(true);
        revealSecretCode();
        clearSavedGame();

        //show save score modal
        finalScoreText.textContent = score;
        modal.classList.remove("hidden");
        return;
    }

    //check if player lost with the all attempts
    if (attempts.length >= max_attempts) {
        gameOver = true;
        showMessage("GAME OVER :(", "error");
        setControlsDisabled(true);
        revealSecretCode();
        clearSavedGame();
        return;
    }

    //reset the guess section for next attempt
    currentGuess = [0, 0, 0, 0];
    updateDigitPickers();
}

//start a new game
function resetGame() {
    //generate new secret code
    secretCode = generateCode();
    //reset all game variables
    currentGuess = [0, 0, 0, 0];
    attempts = [];
    gameOver = false;
    score = 0;
    //reset display
    attemptsList.innerHTML = "";
    secretCodeBox.classList.add("hidden");
    hideMessage();
    updateAttemptsDisplay();
    updateScoreDisplay();
    updateDigitPickers();
    setControlsDisabled(false);
    clearSavedGame();

    //for debug
    console.log("New game! Secret Code:", secretCode);
}

//restore saved game
function restoreGame(savedGame) {
    secretCode = savedGame.secretCode;
    attempts = savedGame.attempts;
    currentGuess = savedGame.currentGuess;
    gameOver = false;
    score = 0;

    //clear and rebuild attempts and other display
    attemptsList.innerHTML = "";
    for (var i = 0; i < attempts.length; i++) {
        updateBoard(attempts[i], i + 1);
    }
    updateAttemptsDisplay();
    updateScoreDisplay();
    updateDigitPickers();
    setControlsDisabled(false);
    showMessage("Game restored!", "success");
    //hide message after 2 sec
    setTimeout(function() {
        hideMessage();
    }, 2000);
}

//USER INTERACTIONS
//digit picker buttons
for (var i = 0; i < digitPickers.length; i++) {
    (function(index) {
        var picker = digitPickers[index];
        var upButton = picker.querySelector(".picker-btn.up");
        var downButton = picker.querySelector(".picker-btn.down");
        var display = picker.querySelector(".digit-display");

        //increase digit
        upButton.addEventListener("click", function() {
            if (gameOver === false) {
                currentGuess[index] = (currentGuess[index] + 1) % 10;
                display.textContent = currentGuess[index];
            }
        });

        //decrease digit
        downButton.addEventListener("click", function() {
            if (gameOver === false) {
                currentGuess[index] = (currentGuess[index] - 1 + 10) % 10;
                display.textContent = currentGuess[index];
            }
        });

        //click digit to increase
        display.addEventListener("click", function() {
            if (gameOver === false) {
                currentGuess[index] = (currentGuess[index] + 1) % 10;
                display.textContent = currentGuess[index];
            }
        });
    })(i);
}

//check button
checkButton.addEventListener("click", function() {
    submitGuess();
});

//reset button
resetButton.addEventListener("click", function() {
    resetGame();
});

//save button
saveButton.addEventListener("click", function() {
    saveGame();
});

//save score button
saveScoreButton.addEventListener("click", function() {
    var name = playerNameInput.value.trim();
    //'anonymous' if no name entered
    if (name === "") {
        name = "Anonymous";
    }
    saveHighScore(name, score, attempts.length);
    modal.classList.add("hidden");
    playerNameInput.value = "";
    displayHighScores();
});

//close modal button
closeModalButton.addEventListener("click", function() {
    modal.classList.add("hidden");
    playerNameInput.value = "";
});

//keyboard support
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && gameOver === false) {
        submitGuess();
    }
});

//INITIALIZATION
function init() {
    //check if there is a saved game
    var savedGame = loadSavedGame();
    if (savedGame !== null) {
        //ask player if they want to continue 
        var wantToContinue = confirm("Saved game found. Would you like to continue?");
        if (wantToContinue) {
            restoreGame(savedGame);
        } else {
            resetGame();
        }
    } else {
        //no saved game
        resetGame();
    }
    //display high scores
    displayHighScores();
}

//wait for the page load to start
document.addEventListener("DOMContentLoaded", function() {
    init();
});
