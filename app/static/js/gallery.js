document.addEventListener("DOMContentLoaded", function () {
  fetchAndDisplayGallery();
});

let currentData = []; // Store fetched data
let displayedData = []; // Data currently displayed
let currentPage = 1;
const perPage = 10;

// Function to fetch gallery data from the server
function fetchAndDisplayGallery() {
  const apiUrl = `/get-gallery-data`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Sort data by date_created in descending order (newest first)
      data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
      currentData = data; // Store fetched data
      displayedData = data;
      displayPage(currentPage); // Display first page
    })
    .catch((error) => console.error("Error loading the gallery data:", error));
}

// Function to display a specific page of data
function displayPage(page) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageData = displayedData.slice(startIndex, endIndex);
  updateGalleryTable(pageData);
  updatePagination(page, Math.ceil(displayedData.length / perPage));
}

// Function to update the gallery table with the provided data
function updateGalleryTable(data) {
  const tableBody = document.getElementById("galleryTableBody");
  tableBody.innerHTML = "";
  data.forEach((item) => {
    const row = createTableRow(item);
    tableBody.innerHTML += row;
  });
}

// Function to create a table row based on the provided item
function createTableRow(item) {
  return `<tr>  
                <td>${item.creator}</td>
                <td>${item.category}</td>
                <td>${item.status}</td>
                <td>${item.date_created}</td>
                <td><button class="btn btn-light btn-sm" onclick="openDrawing(${item.drawing_id})">Open</button></td>
            </tr>`;
}

// Function to redirect user to the Guess page
function openDrawing(drawingId) {
  window.location.href = `/drawings/${drawingId}`;
}

/* Set dynamic button colors and hover effects for gallery table buttons */
$(document).ready(function () {
  var colors = [
    "#FF4500", // OrangeRed
    "#FF7F00", // Orange
    "#008000", // DarkGreen
    "#0000FF", // Blue
    "#8B00FF", // Violet
  ];

  // Add event listener to the gallery table body to update button colors and hover effects
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

// Add sorting function to the gallery table (case insensitive)
document.addEventListener("DOMContentLoaded", function () {
  fetchAndDisplayGallery();

  let currentSortColumn = null;
  let currentSortDirection = 1; // 1 for ascending, -1 for descending

  // Add event listeners to the sortable headers
  document.querySelectorAll(".sortable").forEach((header, index) => {
    header.addEventListener("click", () => {
      sortAllData(index); // Sort all data
      toggleSortIcon(header, index);
    });
  });

  // Function to sort all data based on the selected column
  function sortAllData(columnIndex) {
    if (currentSortColumn === columnIndex) {
      currentSortDirection *= -1; // Reverse direction if same column
    } else {
      currentSortDirection = 1;
      currentSortColumn = columnIndex;
    }

    // Sort the data based on the column index
    currentData.sort((a, b) => {
      let cellA = getColumnValue(a, columnIndex);
      let cellB = getColumnValue(b, columnIndex);

      if (columnIndex === 3) {
        // Date column
        return (new Date(cellA) - new Date(cellB)) * currentSortDirection;
      }

      const valueA = parseFloat(cellA);
      const valueB = parseFloat(cellB);

      if (!isNaN(valueA) && !isNaN(valueB)) {
        // Numeric columns
        return (valueA - valueB) * currentSortDirection;
      } else {
        // String columns
        return cellA.localeCompare(cellB) * currentSortDirection;
      }
    });

    displayedData = currentData; // Update displayed data
    displayPage(currentPage); // Re-render current page
  }

  // Function to get the value of a cell in a row based on the column index
  function getColumnValue(item, columnIndex) {
    switch (columnIndex) {
      case 0:
        return item.creator;
      case 1:
        return item.category;
      case 2:
        return item.status;
      case 3:
        return item.date_created;
      default:
        return "";
    }
  }

  // Function to toggle the sort icon based on the current sort direction
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

// Function to update the pagination based on the current page and total pages
function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  // Add Previous button
  paginationContainer.innerHTML += `<li class="page-item ${
    currentPage === 1 ? "disabled" : ""
  }">
        <a class="page-link" href="#" onclick="${
          currentPage > 1
            ? "navigatePage(" + (currentPage - 1) + ")"
            : "event.preventDefault()"
        }">Previous</a>
    </li>`;

  // Add page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `<li class="page-item ${
      i === currentPage ? "active" : ""
    }">
            <a class="page-link" href="#" onclick="navigatePage(${i})">${i}</a>
        </li>`;
  }

  // Add Next button
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

// Function to navigate to a specific page
function navigatePage(page) {
  currentPage = page;
  displayPage(page);
  window.scrollTo(0, 0); // Scroll to the top of the page after navigating
}

// Function to filter data based on search query (case insensitive)
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
          item.date_created.includes(term)
      )
    );
  }
  currentPage = 1; // Reset to first page after filtering
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
