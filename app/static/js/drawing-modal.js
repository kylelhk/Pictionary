// TODO: Combine with drawing.js once PR for issue #14 merged

// Display modal when window loads
window.onload = () => {
    let wordCatModal = new bootstrap.Modal('#word-category-modal');
    wordCatModal.show();
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute('data-category');
            fetchWord(category, wordCatModal);
        });
    });
};

// Fetch a random word from the chosen category
function fetchWord(category, modal) {
    const url = '/get-random-word?' + new URLSearchParams({ category: category }).toString()
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('word-to-draw').innerHTML = data.word; // Display the word
            const word_id = data.word_id; // TODO: Save this in database when word is submitted
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