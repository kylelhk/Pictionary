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


    // Function to display AJAX alert message (for nav link access control)
    function displayAjaxMessage(message, category) {
        const alertHtml = `<div class="alert alert-${category}">${message}</div>`;
        $(".alert-container").html(alertHtml).show().delay(3000).fadeOut("slow");
    }

    // Function to display flash messages (for form submission feedback and successful registration)
    function displayFlashMessage() {
        $(".flash-message-container").show().delay(3000).fadeOut("slow");
    }

    // Call displayFlashMessage on DOMContentLoaded
    displayFlashMessage();
});
