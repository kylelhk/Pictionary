$(function () {
  // Function to switch between tabs in Activity Feed
  function switchTab(containerId, activeTab) {
    // Select the container based on passed ID
    const container = $("#" + containerId);

    // Reset all tabs to inactive state and hide all content
    container.find(".tab").removeClass("active");
    container.find(".content").addClass("hidden");

    // Activate the selected tab and show its associated content
    container.find(`.tab[data-tab="${activeTab}"]`).addClass("active");
    container.find(`.content[id$="${activeTab}"]`).removeClass("hidden");
  }

  function initialiseTabs() {
    $(".tabs .tab").click(function () {
      const containerId = $(this).closest(".feed-container").attr("id");
      const tabId = $(this).data("tab");
      switchTab(containerId, tabId);
    });
  }

  // Initialise the tabs
  initialiseTabs();
});
