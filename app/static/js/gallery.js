document.addEventListener("DOMContentLoaded", function () {
  fetchAndDisplayGallery();
});

let currentData = []; // Store fetched data
let displayedData = []; // Data currently displayed, could be filtered
let currentPage = 1;
const perPage = 10; // Drawings per page

function fetchAndDisplayGallery() {
  const apiUrl = `/get-gallery-data`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Sort data by date_created in descending order (newest first)
      data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
      currentData = data; // Store data
      displayedData = data; // Initially displayed data is all data
      displayPage(currentPage); // Display first page
    })
    .catch((error) => console.error("Error loading the gallery data:", error));
}

function displayPage(page) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageData = displayedData.slice(startIndex, endIndex);
  updateGalleryTable(pageData);
  updatePagination(page, Math.ceil(displayedData.length / perPage));
}

function updateGalleryTable(data) {
  const tableBody = document.getElementById("galleryTableBody");
  tableBody.innerHTML = "";
  data.forEach((item) => {
    const row = createTableRow(item);
    tableBody.innerHTML += row;
  });
}

function createTableRow(item) {
  return `<tr>  
                <td>${item.creator}</td>
                <td>${item.category}</td>
                <td>${item.status}</td>
                <td>${item.date_created}</td>
                <td><button class="btn btn-light btn-sm" onclick="openDrawing(${item.drawing_id})">Open</button></td>
            </tr>`;
}

function openDrawing(drawingId) {
  // Assuming the drawing detail page URL pattern is "/drawings/{id}"
  window.location.href = `/drawings/${drawingId}`;
}

/* Set dynamic background color and hover effect for gallery table buttons */
$(document).ready(function () {
  var colors = [
    "#FF4500", // OrangeRed
    "#FF7F00", // Orange
    "#008000", // DarkGreen
    "#0000FF", // Blue
    "#8B00FF", // Violet
  ];

  $("#galleryTableBody").on("DOMSubtreeModified", function () {
    $("#galleryTableBody tr").each(function (index) {
      var button = $(this).find("button");
      var originalColor = colors[index % colors.length];
      var originalTextColor = "#fff";
      button.css("background-color", originalColor);
      button.css("color", originalTextColor);

      button.hover(
        function () {
          // On mouse enter
          $(this).css("background-color", originalTextColor);
          $(this).css("color", originalColor);
        },
        function () {
          // On mouse leave
          $(this).css("background-color", originalColor);
          $(this).css("color", originalTextColor);
        }
      );
    });
  });
});

// Add sorting function to the gallery table
document.addEventListener("DOMContentLoaded", function () {
  fetchAndDisplayGallery();

  let currentSortColumn = null;
  let currentSortDirection = 1; // 1 for ascending, -1 for descending

  document.querySelectorAll(".sortable").forEach((header, index) => {
    header.addEventListener("click", () => {
      sortTable(index);
      toggleSortIcon(header, index);
    });
  });

  function sortTable(columnIndex) {
    const rows = document.querySelectorAll("#galleryTableBody tr");

    // If we click the column that's already being sorted, reverse the direction.
    if (currentSortColumn === columnIndex) {
      currentSortDirection *= -1;
    } else {
      currentSortDirection = 1;
      currentSortColumn = columnIndex;
    }

    const sortedRows = Array.from(rows).sort((rowA, rowB) => {
      let cellA = rowA.querySelectorAll("td")[columnIndex].textContent.trim();
      let cellB = rowB.querySelectorAll("td")[columnIndex].textContent.trim();

      // Detect if the column is the "Date Created" column
      if (columnIndex === 3) {
        // Parse dates
        const dateA = Date.parse(cellA);
        const dateB = Date.parse(cellB);

        if (!isNaN(dateA) && !isNaN(dateB)) {
          return (dateA - dateB) * currentSortDirection;
        }
      }

      // Detect if the column contains numbers
      const valueA = parseFloat(cellA);
      const valueB = parseFloat(cellB);

      if (!isNaN(valueA) && !isNaN(valueB)) {
        // Compare numbers
        return (valueA - valueB) * currentSortDirection;
      } else {
        // Compare strings
        return cellA.localeCompare(cellB) * currentSortDirection;
      }
    });

    // Clear out the current rows in the table body
    const tbody = document.querySelector("#galleryTableBody");
    tbody.innerHTML = "";

    // Append the sorted rows
    sortedRows.forEach((row) => {
      tbody.appendChild(row);
    });
  }

  function toggleSortIcon(header, columnIndex) {
    document.querySelectorAll(".sort-icon").forEach((icon) => {
      icon.classList.remove("bi-caret-up-fill", "bi-caret-down-fill");
      icon.classList.add("bi-caret-down-fill");
    });

    const icon = header.querySelector(".sort-icon");
    if (currentSortColumn === columnIndex && currentSortDirection === 1) {
      icon.classList.remove("bi-caret-down-fill");
      icon.classList.add("bi-caret-up-fill");
    } else {
      icon.classList.remove("bi-caret-up-fill");
      icon.classList.add("bi-caret-down-fill");
    }
  }
});

function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  paginationContainer.innerHTML += `<li class="page-item ${
    currentPage === 1 ? "disabled" : ""
  }">
        <a class="page-link" href="#" onclick="${
          currentPage > 1
            ? "navigatePage(" + (currentPage - 1) + ")"
            : "event.preventDefault()"
        }">Previous</a>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `<li class="page-item ${
      i === currentPage ? "active" : ""
    }">
            <a class="page-link" href="#" onclick="navigatePage(${i})">${i}</a>
        </li>`;
  }

  paginationContainer.innerHTML += `<li class="page-item ${
    currentPage === totalPages ? "disabled" : ""
  }">
        <a class="page-link" href="#" onclick="${
          currentPage < totalPages
            ? "navigatePage(" + (currentPage + 1) + ")"
            : "event.preventDefault()"
        }">Next</a>
    </li>`;
}

function navigatePage(page) {
  currentPage = page;
  displayPage(page);
  window.scrollTo(0, 0); // Scroll to the top of the page on page change
}

// Function to filter data based on search query
function filterGalleryData() {
  const searchTerm = document
    .querySelector(".search-bar input")
    .value.toLowerCase();
  if (!searchTerm) {
    displayedData = currentData; // Reset to all data if search term is empty
  } else {
    const terms = searchTerm.split(" "); // Split search term into individual words
    displayedData = currentData.filter((item) =>
      terms.some(
        (term) =>
          item.creator.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term) ||
          item.date_created.includes(term) // Include date in the search
      )
    );
  }
  currentPage = 1; // Reset to first page
  displayPage(currentPage);
}

// Adding an event listener to the search button
document.getElementById("search-btn").addEventListener("click", function () {
  filterGalleryData();
  window.scrollTo(0, 0); // Scroll to the top of the page after filtering
});

// Adding an event listener for the Enter key to trigger the search button click
document
  .getElementById("search-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default form submission
      document.getElementById("search-btn").click(); // Trigger the button click
    }
  });

// Adding an event listener to the reset button for search function
document.getElementById("reset-btn").addEventListener("click", function () {
  document.getElementById("search-input").value = ""; // Clear search input
  displayedData = currentData; // Reset to all data
  currentPage = 1;
  displayPage(currentPage);
  window.scrollTo(0, 0); // Scroll to the top of the page after resetting
});
