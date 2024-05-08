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

  /* Pie chart implemented using ECharts library */
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
        formatter: "{a} <br/>{b} : {c} ({d}%)",
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
          center: ["35%", "54%"], // 30% from left, 54% from top
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
    pieChart.setOption(pieOption);
  }
});
