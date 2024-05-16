import { CountdownTimer } from './timer.js'

let isWordCatModalVisible = false;
let wordCatModal;
let confirmModal;

// Fetch a random word from the chosen category
function fetchWord(category) {
    fetch(`/get-random-word?category=${category}`)
        .then(response => response.json())
        .then(data => {
            const wordContainer = document.getElementById('word-to-draw');
            wordContainer.innerHTML = data.word; // Display the word
            wordContainer.setAttribute('data-word-id', data.word_id); // Store word_id in data attribute for saving in database
            wordCatModal.hide(); // Close the modal
            const timer = new CountdownTimer(120, 30, 10, saveDrawing); // Start a timer
            timer.startTimer();
        })
        .catch(error => console.error("Error fetching word:", error));
}

// Display modal to select the category of word to draw when window loads
window.addEventListener('load', () => {
    wordCatModal = new bootstrap.Modal('#word-category-modal');
    confirmModal = new bootstrap.Modal(document.getElementById('confirm-modal'));

    wordCatModal.show();
    isWordCatModalVisible = true;

    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute('data-category');
            fetchWord(category);
            isWordCatModalVisible = false;
        });
    });

    document.getElementById('word-category-modal').addEventListener('hidden.bs.modal', () => {
        if (isWordCatModalVisible) {
            confirmModal.show();
        }
    });
});

// Show a confirmation modal when the user wants to quit the drawing
document.querySelectorAll("#exit-modal, #quit-drawing").forEach((element) => {
    element.addEventListener("click", function () {
        let confirmModal = new bootstrap.Modal(document.getElementById('confirm-modal'));
        confirmModal.show();
    })
});

// Redirect to the home page if the user confirms they want to quit
document.getElementById("confirm-yes").addEventListener("click", function () {
    window.location.href = homeUrl;
});

// Show the category modal or the canvas if the user cancels quitting
document.getElementById("confirm-cancel").addEventListener("click", function () {
    if (isWordCatModalVisible) {
        wordCatModal.show();
    }
});

// Get canvas element and its context
const canvas = document.getElementById("drawing-canvas");
const context = canvas.getContext("2d");
let isDrawing = false;

// Set the internal resolution of the canvas
canvas.width = 1000;
canvas.height = 600;

// Function to initiate drawing
function startDrawing(event) {
    isDrawing = true;
    draw(event);
}

// Function to handle the drawing as the mouse moves
function draw(event) {
    if (!isDrawing) return;
    let canvasBounds = canvas.getBoundingClientRect(); // get canvas size and position
    // Calculate x and y coords by normalising and scaling them
    let x = (event.pageX - canvasBounds.left - scrollX) / canvasBounds.width * canvas.width;
    let y = (event.pageY - canvasBounds.top - scrollY) / canvasBounds.height * canvas.height;
    context.lineTo(x, y);
    context.stroke();
}

// Function to end drawing
function stopDrawing() {
    isDrawing = false;
    context.beginPath();
}

// Event listeners to handle mouse actions
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Change brush size upon selection
function updateBrushSize() {
    context.lineWidth = document.querySelector('input[name="brush-size"]:checked').value;
}

updateBrushSize(); // set initial brush size

const brushSizes = document.querySelectorAll('input[name="brush-size"]');
brushSizes.forEach((size) => {
    size.addEventListener("change", updateBrushSize);
});

// Change brush colour upon selection
function updateBrushColour() {
    context.strokeStyle = document.querySelector('input[name="brush-colour"]:checked').value;
}

const brushColours = document.querySelectorAll('input[name="brush-colour"]');
brushColours.forEach((colour) => {
    colour.addEventListener("change", updateBrushColour);
});

// Toggle eraser on and off
const eraserToggle = document.getElementById('eraser');

eraserToggle.addEventListener('change', () => {
    if (eraserToggle.checked) {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = 20;
    } else {
        context.globalCompositeOperation = 'source-over';
        updateBrushSize();
        updateBrushColour();
    }
});

// Clear the canvas
const clearButton = document.getElementById("clear-all")
clearButton.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// Submit drawing
function saveDrawing() {
    const drawingData = canvas.toDataURL();
    const wordId = document.getElementById('word-to-draw').getAttribute('data-word-id');
    fetch('/submit-drawing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            drawingData: drawingData,
            wordId: wordId,
        })
    })
        .then(response => response.json())
        .then(data => {
            alert('Success: ' + data.message)
            window.location.href = homeUrl;
        })
        .catch((error) => console.error('Error:', error));
}

const submitButton = document.getElementById("submit-drawing");
submitButton.addEventListener("click", saveDrawing);