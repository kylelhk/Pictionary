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
};

// Function to handle the drawing as the mouse moves
function draw(event) {
    if (!isDrawing) return;
    let canvasBounds = canvas.getBoundingClientRect(); // get canvas size and position
    // Calculate x and y coords by normalising and scaling them
    let x = (event.pageX - canvasBounds.left - scrollX) / canvasBounds.width * canvas.width;
    let y = (event.pageY - canvasBounds.top - scrollY) / canvasBounds.height * canvas.height;
    context.lineTo(x, y);
    context.stroke();
};

// Function to end drawing
function stopDrawing() {
    isDrawing = false;
    context.beginPath();
};

// Event listeners to handle mouse actions
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Change brush size upon selection
function updateBrushSize() {
    let selectedSize = document.querySelector('input[name="brush-size"]:checked').value;
    context.lineWidth = selectedSize;
};

updateBrushSize(); // set initial brush size

const brushSizes = document.querySelectorAll('input[name="brush-size"]');
brushSizes.forEach((size) => {
    size.addEventListener("change", updateBrushSize);
});

// Change brush colour upon selection
function updateBrushColour() {
    let selectedColour = document.querySelector('input[name="brush-colour"]:checked').value;
    context.strokeStyle = selectedColour;
};

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

