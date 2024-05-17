import {CountdownTimer} from './timer.js';

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
    disableInputAndButton(inputText);

    guessMade = true; // Set the flag to true after making a guess
}

function disableInputAndButton(inputText) {
    const btnSend = document.querySelector('.button-send');
    inputText.disabled = true;
    btnSend.disabled = true;
    btnSend.style.backgroundColor = 'grey';
}

function submitGuess(inputText, chatRoom, drawingId) {
    if (!guessMade) {
        let guessedWord = inputText.value.trim() || 'XXXXXX';

        postGuess(drawingId, guessedWord)
            .then(data => handleGuessResponse(inputText, chatRoom, data))
            .catch(error => console.error('Error:', error));
    }
}

function saveTimeToLocalStorage(drawingId, timeLeft) {
    const userId = getUserId();
    localStorage.setItem(`timer-${userId}-${drawingId}`, timeLeft);
}

function getTimeFromLocalStorage(drawingId) {
    const userId = getUserId();
    return parseInt(localStorage.getItem(`timer-${userId}-${drawingId}`)) || 30;
}

function getUserId() {
    // This function should return the unique identifier for the logged-in user
    // This can be retrieved from cookies, local storage, or any other method you use for user authentication
    return localStorage.getItem('userId');
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
        window.location.href = galleryUrl;
    });

    const initialTime = getTimeFromLocalStorage(drawingId);

    const timer = new CountdownTimer(initialTime, 15, 10, () => {
        submitGuess(inputText, chatRoom, drawingId);
        const userId = getUserId();
        localStorage.removeItem(`timer-${userId}-${drawingId}`);
    });

    timer.startTimer();

    const timerInterval = setInterval(() => {
        saveTimeToLocalStorage(drawingId, timer.timeLeft);
    }, 1000);
});
