// Get canvas element and its context
const canvas = document.getElementById("drawing-canvas");
const context = canvas.getContext("2d");
let isDrawing = false;

// Set the internal resolution of the canvas
canvas.width = 1200;
canvas.height = 1200;

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

// Brush size selector

// Colour selector

// Eraser

// Clear all
