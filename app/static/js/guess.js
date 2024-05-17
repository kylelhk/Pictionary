import {CountdownTimer} from './timer.js'


let guessMade = false; // Flag to track if a guess has been made
function createBubble(text, className) {
    let bubble = document.createElement('div');
    bubble.className = "bubble " + className; // e.g., 'bubble-dark', 'bubble-light'
    bubble.textContent = text;
    return bubble;
}

function createMessage(bubble, className) {
    let message = document.createElement('div');
    message.className = 'message ' + className; // 'message-right' or 'message-left'
    message.appendChild(bubble);
    return message;
}

function postGuess(drawingId, guess) {
    return fetch(`/drawings/${drawingId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({guess})
    }).then(response => response.json());
}

function handleGuessResponse(inputText, chatRoom, data) {
    let guessedWord = inputText.value.trim();


    let userBubble = createBubble(guessedWord, "bubble-dark");
    let userMessage = createMessage(userBubble, "message-right");
    chatRoom.appendChild(userMessage);


    let responseText;
    if (!guessedWord) {
        responseText = "You did not guess";
    } else if (data.is_correct) {
        responseText = "You guessed correctly!";
    } else {
        responseText = "Oops! Wrong guess";
    }

    // let responseText = data.is_correct ? "You guessed correctly!" : "Oops! Wrong guess";
    let responseBubbleColor = data.is_correct ? "bubble-light" : "bubble-red";
    let responseBubble = createBubble(responseText, responseBubbleColor);
    let responseMessage = createMessage(responseBubble, "message-left");
    chatRoom.appendChild(responseMessage);

    if (!data.is_correct) {

        let correctWordBubble = createBubble(`The correct word is: ${data.correct_word}`, "bubble-light animate-fade-in");
        let correctWordMessage = createMessage(correctWordBubble, "message-left");
        chatRoom.appendChild(correctWordMessage);

    }


    inputText.value = '';
    disableInputAndButton(inputText)

    guessMade = true; // Set the flag to true after making a guess
}

function disableInputAndButton(inputText) {
    const btnSend = document.querySelector('.button-send');
    inputText.disabled = true;
    btnSend.disabled = true;
    btnSend.style.backgroundColor = 'grey';
}


function submitGuess(inputText, chatRoom, drawingId) {
    // SUBMIT XXXXXX IF USER does not submit anything within the time
    // Only submit if no guess has been made
    if (!guessMade) {
        let guessedWord = inputText.value.trim() || 'XXXXXX';

        postGuess(drawingId, guessedWord)
            .then(data => handleGuessResponse(inputText, chatRoom, data))
            .catch(error => console.error('Error:', error));
    }
}


window.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById('inputText');
    const btnSend = document.querySelector('.button-send');
    const btnQuit = document.querySelector('.btn-quit');
    const chatRoom = document.querySelector('.chat-room');
    const drawingId = document.querySelector('.guess-image').dataset.drawingId;

    btnSend.addEventListener('click', function () {
        submitGuess(inputText, chatRoom, drawingId);
    });

    btnQuit.addEventListener('click', function () {
        submitGuess(inputText, chatRoom, drawingId);

        window.location.href = galleryUrl;

    });


    // Create a timer and start it
    const timer = new CountdownTimer(30, 15, 10, () => submitGuess(inputText, chatRoom, drawingId));
    timer.startTimer();


});
