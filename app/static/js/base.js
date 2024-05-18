// Sidebar toggle
$(function () {
  const sidebar = document.getElementById("sidebar");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");

  hamburgerBtn.addEventListener("click", function () {
    sidebar.classList.toggle("sidebar-active");
  });

  closeBtn.addEventListener("click", function () {
    sidebar.classList.remove("sidebar-active");
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) {
      sidebar.classList.remove("sidebar-active");
    }
  });

  // Function to display flash messages (for form submission feedback and successful registration)
  function displayFlashMessage() {
    $(".flash-message-container").show().delay(3000).fadeOut("slow");
  }

  // Call displayFlashMessage on DOMContentLoaded
  displayFlashMessage();

  // Display a wavy line SVG element in nav links for hover effect
  const svgElement = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 10" width="100" height="10" class="wavy-line">
    <polyline class="draw" points="0,8 12,4 23,7 29,6 37,4 46,3 55,7 68,4 80,7 90,5 100,2" />
  </svg>`;

  document.querySelectorAll(".main-nav .nav-link").forEach((link) => {
    link.innerHTML += svgElement;
  });
});
