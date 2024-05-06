// Sidebar toggle
document.addEventListener("DOMContentLoaded", function () {
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
});
