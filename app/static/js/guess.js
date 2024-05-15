import {CountdownTimer} from './timer.js'

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
    let guessedWord = inputText.value.trim() || "XXXXXX";

    let userBubble = createBubble(guessedWord, "bubble-dark");
    let userMessage = createMessage(userBubble, "message-right");
    chatRoom.appendChild(userMessage);

    let responseText = data.is_correct ? "You guessed correctly!" : "Oops! Wrong guess or guessed already.";
    let responseBubbleColor = data.is_correct ? "bubble-light" : "bubble-red";
    let responseBubble = createBubble(responseText, responseBubbleColor);
    let responseMessage = createMessage(responseBubble, "message-left");
    chatRoom.appendChild(responseMessage);

    inputText.value = '';
    disableInputAndButton(inputText)
}

function disableInputAndButton(inputText) {
    const btnSend = document.querySelector('.button-send');
    inputText.disabled = true;
    btnSend.disabled = true;
    btnSend.style.backgroundColor = 'grey';
}


function submitGuess(inputText, chatRoom, drawingId) {
    // SUBMIT XXXXXX IF USER does not submit anything within the time
    let guessedWord = inputText.value.trim() || 'XXXXXX';

    postGuess(drawingId, guessedWord)
        .then(data => handleGuessResponse(inputText, chatRoom, data))
        .catch(error => console.error('Error:', error));
}


window.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById('inputText');
    const btnSend = document.querySelector('.button-send');
    const chatRoom = document.querySelector('.chat-room');
    const drawingId = document.querySelector('.guess-image').dataset.drawingId;

    btnSend.addEventListener('click', function () {
        submitGuess(inputText, chatRoom, drawingId);
    });

    // Create a timer and start it
    const timer = new CountdownTimer(30, 15, 10, () => submitGuess(inputText, chatRoom, drawingId));
    timer.startTimer();

    // Logic to submit the guess when the user abruptly leaves the page
    // TODO: ADD LOGIC TO HANDLE THE PAGE REFRESH AND TAB CLOSE
    window.addEventListener('beforeunload', (event) => {
        if (timer.timePassed > 2) {
            submitGuess(inputText, chatRoom, drawingId);
        }
    });
});
