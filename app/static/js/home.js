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

  // Initialise tabs
  function initialiseTabs() {
    $(".tabs .tab").click(function () {
      const containerId = $(this).closest(".feed-container").attr("id");
      const tabId = $(this).data("tab");
      switchTab(containerId, tabId);
    });
  }

  initialiseTabs();

  // Pie chart implemented using ECharts library
  // Reference: https://echarts.apache.org/handbook/en/how-to/chart-types/pie/basic-pie/
  var pieContainer = document.querySelector(".pie-container");
  if (pieContainer) {
    var pieChart = echarts.init(pieContainer);
    var pieOption = {
      title: {
        text: "Points Distribution",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{b} : {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "right",
        top: "center",
        data: ["Guesser Points", "Drawer Points"],
      },
      series: [
        {
          name: "Points",
          type: "pie",
          radius: "75%", // Increase the radius to make the pie bigger
          center: ["35%", "54%"], // 35% from left, 54% from top
          data: [
            { value: 53, name: "Guesser Points", itemStyle: { color: "Blue" } },
            {
              value: 47,
              name: "Drawer Points",
              itemStyle: { color: "Orange" },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            show: false,
          },
        },
      ],
    };

    // Function to adjust legend visibility based on screen size
    function adjustLegendVisibility() {
      pieChart.setOption({
        legend: {
          show: window.innerWidth >= 1085,
        },
      });
    }

    // Function to adjust title font size based on screen size
    function adjustTitleFontSize() {
      var newFontSize = window.innerWidth < 775 ? 12 : 20; // Change font size to 10px if window width is less than 775px
      pieChart.setOption({
        title: {
          textStyle: {
            fontSize: newFontSize,
          },
        },
      });
    }

    // Add event listener to resize chart, adjust legend visibility, and title font size when window is resized
    window.addEventListener("resize", function () {
      pieChart.resize();
      adjustLegendVisibility();
      adjustTitleFontSize();
    });

    // Initialise the chart with the configured options
    pieChart.setOption(pieOption);

    // Set initial configurations based on the window size
    adjustLegendVisibility();
    adjustTitleFontSize();
  }
});
