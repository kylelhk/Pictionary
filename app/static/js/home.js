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

  // Function to fetch and display username
  function loadUsername() {
    $.ajax({
      url: "/user/info",
      method: "GET",
      success: function (data) {
        const welcomeMessageElement = $(".welcome-message");
        welcomeMessageElement.text(`Welcome back, ${data.username}!`);
      },
      error: function (error) {
        console.error("Failed to fetch user info:", error);
      },
    });
  }

  // Load username when the page loads
  loadUsername();

  // Function to fetch and display user points
  function loadUserPoints() {
    $.ajax({
      url: "/user/points",
      method: "GET",
      success: function (data) {
        if (
          data.points_as_creator !== undefined &&
          data.points_as_guesser !== undefined
        ) {
          // Display the total points in the .points span
          const totalPoints = data.points_as_creator + data.points_as_guesser;
          $(".points").text(totalPoints);

          // Prepare data for the pie chart below
          const pieData = [
            {
              value: data.points_as_guesser,
              name: "Guesser Points",
              itemStyle: { color: "Blue" },
            },
            {
              value: data.points_as_creator,
              name: "Drawer Points",
              itemStyle: { color: "Orange" },
            },
          ];

          // Initialise the pie chart
          initPieChart(pieData);
        }
      },
      error: function (error) {
        console.error("Failed to fetch user points:", error);
      },
    });
  }

  // Pie chart implemented using ECharts library
  // Reference: https://echarts.apache.org/handbook/en/how-to/chart-types/pie/basic-pie/
  // Function to initialise the pie chart using ECharts
  function initPieChart(pieData) {
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
            data: pieData,
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
  }

  // Call the function to load user points and pie chart when the page loads
  loadUserPoints();

  // Function to fetch and display leaderboard data
  function loadLeaderboard() {
    $.ajax({
      url: "/leaderboard",
      method: "GET",
      success: function (data) {
        // Update the leaderboard table with the fetched data
        data.forEach((user, index) => {
          const rankClass = `.rank-${index + 1}`;
          const usernameElement = $(`${rankClass}`)
            .closest(".row")
            .find(".board-username");
          const pointsElement = $(`${rankClass}`)
            .closest(".row")
            .find(".board-points");

          usernameElement.text(user.username);
          pointsElement.text(user.total_points);
        });
      },
      error: function (error) {
        console.error("Failed to fetch leaderboard:", error);
      },
    });
  }

  // Load leaderboard when the page loads
  loadLeaderboard();

  // Function to fetch and display the latest 4 drawings
  function loadLatestDrawings() {
    $.ajax({
      url: "/latest-drawings",
      method: "GET",
      success: function (data) {
        const tableBody = $("#content-item1-new tbody");
        tableBody.empty();

        data.forEach((drawing) => {
          const row = `<tr>
            <td>${drawing.username}</td>
            <td>${drawing.category}</td>
            <td>${drawing.status}</td>
            <td>${drawing.created_at}</td>
          </tr>`;
          tableBody.append(row);
        });
      },
      error: function (error) {
        console.error("Failed to fetch latest drawings:", error);
      },
    });
  }

  // Load the latest drawings when the page loads
  loadLatestDrawings();

  // Function to fetch and display the latest 4 guess attempts
  function loadGuessHistory() {
    $.ajax({
      url: "/guess-history",
      method: "GET",
      success: function (data) {
        const tableBody = $("#content-item1-history tbody");
        tableBody.empty();

        data.forEach((guess) => {
          const row = `<tr>
          <td>${guess.username}</td>
          <td>${guess.category}</td>
          <td>${guess.result}</td>
          <td>${guess.guessed_at}</td>
        </tr>`;
          tableBody.append(row);
        });
      },
      error: function (error) {
        console.error("Failed to fetch guess history:", error);
      },
    });
  }

  // Load the guess history when the page loads
  loadGuessHistory();
});
