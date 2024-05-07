// Display modal when window loads
window.addEventListener('load', () => {
    let wordCatModal = new bootstrap.Modal('#word-category-modal');
    wordCatModal.show();
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute('data-category');
            fetchWord(category, wordCatModal);
        });
    });
});

// Fetch a random word from the chosen category
function fetchWord(category, modal) {
    const url = '/get-random-word?' + new URLSearchParams({ category: category }).toString()
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const wordContainer = document.getElementById('word-to-draw')
            wordContainer.innerHTML = data.word; // Display the word
            wordContainer.setAttribute('data-word-id', data.word_id); // Store word_id in data attribute
            modal.hide(); // Close the modal
        })
        .catch(error => console.error("Error fetching word:", error));
}

// Redirect to the Home screen when the exit button is clicked
document.getElementById("exit-modal").addEventListener("click", function () {
    if (confirm("Are you sure you want to quit drawing?")) {
        window.location.href = homeUrl;
    }
})

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
            'Content-Type':'application/json',
        },
        body: JSON.stringify({
            drawingData: drawingData,
            wordId: wordId, // TODO: Add variable for word to draw
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

// TODO: Automatically save canvas when time runs out

// Redirect to Home screen when quit button clicked
document.getElementById("quit-drawing").addEventListener("click", function() {
    if (confirm("Are you sure you want to quit drawing?")) {
        window.location.href = homeUrl;
    }
});