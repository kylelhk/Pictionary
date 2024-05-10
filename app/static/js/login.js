$(function () {
  // Function for dynamic typing effect
  function dynamicTypingEffect(element, speed = 30, callback = null) {
    const $container = $(element);
    const text = $container.text().trim(); // Extract text from the element
    $container.empty().append(
      '<span class="typing-text"></span><span class="typing-cursor">\u2588</span>' // Append a cursor
    );
    const $typingText = $container.find(".typing-text");
    const $cursor = $container.find(".typing-cursor");
    let index = 0;

    // Function to type out each character sequentially
    function typeNext() {
      if (index < text.length) {
        $typingText.append(text[index++]);
        setTimeout(typeNext, speed);
      } else {
        setTimeout(() => $cursor.remove(), 2250); // Remove cursor after completion
        if (callback) callback(); // Trigger next function if a callback is provided
      }
    }

    typeNext();
  }

  // Start typing effects sequentially
  function initialiseSequentialTyping() {
    const firstLine = $(".first-line");
    const secondLine = $(".second-line");

    // First line types first, then reveal and type the second line
    dynamicTypingEffect(firstLine, 30, function () {
      secondLine.removeClass("hidden");
      dynamicTypingEffect(secondLine, 30);
    });
  }

  // Initialise the typing effects sequentially
  initialiseSequentialTyping();

  // Function to toggle login and signup forms
  function toggleForms() {
    const loginSection = document.querySelector(".form");
    const loginLink = document.querySelector(".login-link");
    const signupLink = document.querySelector(".signup-link");

    signupLink?.addEventListener("click", () =>
      loginSection.classList.add("active")
    );
    loginLink?.addEventListener("click", () =>
      loginSection.classList.remove("active")
    );
  }

  // Function to toggle password visibility
  function togglePasswordVisibility(toggleButtonId, inputFieldId) {
    const toggleButton = document.getElementById(toggleButtonId);
    const passwordInput = document.getElementById(inputFieldId);

    if (toggleButton && passwordInput) {
      toggleButton.addEventListener("click", function () {
        const toggleIcon = this.querySelector("i");

        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          toggleIcon.classList.remove("bi-eye");
          toggleIcon.classList.add("bi-eye-slash");
        } else {
          passwordInput.type = "password";
          toggleIcon.classList.remove("bi-eye-slash");
          toggleIcon.classList.add("bi-eye");
        }
      });
    }
  }

  // Initialise form toggle and password visibility functions
  toggleForms();
  togglePasswordVisibility("togglePassword", "loginPassword");
  togglePasswordVisibility("toggleSignupPassword", "signupPassword");
  togglePasswordVisibility("toggleConfirmPassword", "signupConfirmPassword");

  // Set up CSRF token for AJAX requests
  $.ajaxSetup({
    beforeSend: function (xhr, settings) {
      if (
        !/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) &&
        !this.crossDomain
      ) {
        const csrfToken = $('input[name="csrf_token"]').val();
        xhr.setRequestHeader("X-CSRFToken", csrfToken);
      }
    },
  });

  // Prevent the traditional form submission and handle it via AJAX
  $("#loginForm").submit(function (e) {
    e.preventDefault();
    let form = $(this);
    let formData = form.serializeArray().reduce(function (obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    handleFormSubmission(form, formData);
  });

  $("#signupForm").submit(function (e) {
    e.preventDefault();
    let formData = {
      "signup-csrf_token": $(this).find('input[name="csrf_token"]').val(),
      "signup-username": $("#signupUsername").val(),
      "signup-email": $("#signupEmail").val(),
      "signup-password": $("#signupPassword").val(),
      "signup-confirm_password": $("#signupConfirmPassword").val(),
      action: "Sign Up", // Ensure this is correctly set
    };
    handleFormSubmission($(this), formData);
  });

  // Blur event handlers for field validation
  $(
    "#signupUsername, #signupEmail, #signupPassword, #signupConfirmPassword"
  ).blur(function () {
    let fieldId = $(this).attr("id");
    let actionUrl = `/validate-${fieldId.split("signup")[1].toLowerCase()}`; // Creates the endpoint URL dynamically based on the field ID
    let data = { value: $(this).val() };

    if (fieldId === "signupConfirmPassword") {
      data.password = $("#signupPassword").val(); // Add password for confirm password validation
    }

    handleAjaxRequest(actionUrl, data, `#${fieldId}Feedback`);
  });

  // Handle AJAX request for form submissions and field validations
  function handleFormSubmission(form, formData) {
    console.log(formData); // This should show an object with keys matching your model fields
    const actionUrl = form.attr("action");
    $.ajax({
      url: actionUrl,
      type: "POST",
      data: JSON.stringify(formData),
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        if (!response.error && response.redirect) {
          window.location.href = response.redirect; // Redirect if needed
        } else if (response.error) {
          handleFormResponse(response); // Handle form-level error feedback
        }
      },
      error: function (xhr) {
        console.error("Submission failed:", xhr.status, xhr.responseText);
      },
    });
  }

  function handleAjaxRequest(actionUrl, data, feedbackSelector) {
    $.ajax({
      url: actionUrl,
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function (response) {
        if (response.error) {
          $(feedbackSelector).text(response.error).show();
        } else {
          $(feedbackSelector).hide();
        }
      },
      error: function (xhr) {
        $(feedbackSelector).text("Error processing request").show();
      },
    });
  }

  function handleFormResponse(response) {
    // Iterate over the errors and update UI
    if (response.errors) {
      for (let field in response.errors) {
        let feedbackId = "#" + field + "Feedback";
        $(feedbackId).text(response.errors[field]).show();
      }
    }
  }

  // Fade out alerts after 4 seconds
  setTimeout(function () {
    $(".alert").fadeOut("slow");
  }, 4000);

  // Fade out invalid feedback when user starts editing the fields again
  $("input, select, textarea").on("input focus", function () {
    $(".invalid-feedback").fadeOut("slow");
  });
});
