document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayGallery();
});

let currentData = [];  // Store fetched data
let displayedData = []; // Data currently displayed, could be filtered
let currentPage = 1;
const perPage = 20;  // Items per page

function fetchAndDisplayGallery() {
    const apiUrl = `/get-gallery-data`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            currentData = data;  // Store data
            displayedData = data; // Initially displayed data is all data
            displayPage(currentPage);  // Display first page
        })
        .catch(error => console.error('Error loading the gallery data:', error));
}

function displayPage(page) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pageData = displayedData.slice(startIndex, endIndex);
    updateGalleryTable(pageData);
    updatePagination(page, Math.ceil(displayedData.length / perPage));
}

function updateGalleryTable(data) {
    const tableBody = document.getElementById('galleryTableBody');
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = createTableRow(item);
        tableBody.innerHTML += row;
    });
}

function createTableRow(item) {
    return `<tr>
                <td><button class="btn btn-primary btn-sm" onclick="openDrawing(${item.drawing_id})">Open</button></td>
                <td>${item.creator}</td>
                <td>${item.category}</td>
                <td>${item.status}</td>
                <td>${item.date_created}</td>
            </tr>`;
}

function openDrawing(drawingId) {
    // Assuming the drawing detail page URL pattern is "/drawings/{id}"
    window.location.href = `/drawings/${drawingId}`;
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    paginationContainer.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="${currentPage > 1 ? 'navigatePage(' + (currentPage - 1) + ')' : 'event.preventDefault()'}">Previous</a>
    </li>`;

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="navigatePage(${i})">${i}</a>
        </li>`;
    }

    paginationContainer.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="${currentPage < totalPages ? 'navigatePage(' + (currentPage + 1) + ')' : 'event.preventDefault()'}">Next</a>
    </li>`;
}

function navigatePage(page) {
    currentPage = page;
    displayPage(page);
    window.scrollTo(0, 0); // Scroll to the top of the page on page change
}

// Function to filter data based on search query
function filterGalleryData() {
    const searchTerm = document.querySelector('.search-bar input').value.toLowerCase();
    if (!searchTerm) {
        displayedData = currentData; // Reset to all data if search term is empty
    } else {
        const terms = searchTerm.split(' '); // Split search term into individual words
        displayedData = currentData.filter(item => terms.some(term => item.creator.toLowerCase().includes(term) || item.category.toLowerCase().includes(term) || item.status.toLowerCase().includes(term) || item.date_created.includes(term) // Include date in the search
        ));
    }
    currentPage = 1; // Reset to first page
    displayPage(currentPage);
}

// Adding an event listener to the search button
document.getElementById('button-addon2').addEventListener('click', function () {
    filterGalleryData();
    window.scrollTo(0, 0); // Scroll to the top of the page after filtering
});
