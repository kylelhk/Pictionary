import { CountdownTimer } from './timer.js'

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
    let userBubble = createBubble(inputText.value, "bubble-dark");
    let userMessage = createMessage(userBubble, "message-right");
    chatRoom.appendChild(userMessage);

    let responseText = data.is_correct ? "You guessed correctly!" : "Oops! Wrong guess or guessed already.";
    let responseBubbleColor = data.is_correct ? "bubble-light" : "bubble-red";
    let responseBubble = createBubble(responseText, responseBubbleColor);
    let responseMessage = createMessage(responseBubble, "message-left");
    chatRoom.appendChild(responseMessage);

    inputText.value = '';
    // Optionally disable the button if the guess is correct or if a condition is met
    // if (data.is_correct) btnSend.disabled = true;
}

window.addEventListener("DOMContentLoaded", function () {
    const inputText = document.getElementById('inputText');
    const btnSend = document.querySelector('.button-send');
    const chatRoom = document.querySelector('.chat-room');
    const drawingId = document.querySelector('.guess-image').dataset.drawingId;

    btnSend.addEventListener('click', function () {
        let guessedWord = inputText.value.trim();
        if (guessedWord) {
            postGuess(drawingId, guessedWord)
                .then(data => handleGuessResponse(inputText, chatRoom, data))
                .catch(error => console.error('Error:', error));
        }
    });

    // Create a timer and start it
    const timer = new CountdownTimer(60, 30, 10); // TODO: Add a call back function to exit once time runs out
    timer.startTimer();
});
