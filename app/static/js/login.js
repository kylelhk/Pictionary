$(function () {
  // Nav link control access via AJAX
  function checkAuthentication(e) {
    e.preventDefault(); // Prevent the default link navigation
    const targetUrl = $(this).attr("href"); // Store the URL to navigate to

    $.ajax({
      url: "/check-authentication", // Flask route to check if user is logged in
      method: "GET",
      success: function (response) {
        // Navigate to the link if authenticated
        if (response.isAuthenticated) {
          window.location.href = targetUrl;
        } else {
          // Show an error message if not authenticated
          displayAjaxMessage(
            "You must be logged in to access this page.",
            "error"
          );
        }
      },

      // Show an error message if the AJAX request fails
      error: function () {
        displayAjaxMessage("Error checking authentication status.", "error");
      },
    });
  }

  $(".nav-link").on("click", checkAuthentication);

  // Display AJAX alert message (for nav link access control)
  function displayAjaxMessage(message, category) {
    const alertHtml = `<div class="alert alert-${category}">${message}</div>`;
    $(".alert-container").html(alertHtml).show().delay(3000).fadeOut("slow");
  }

  // Display Flask flash message (for successful registration)
  $(".flash-message-container").show().delay(3000).fadeOut("slow");

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

  // Function to handle form-level error messages
  function handleFormResponse(response) {
    if (response.errors) {
      // Clear previous error messages
      $(".invalid-feedback").text("").hide();

      // Display new error messages
      for (let field in response.errors) {
        let fieldError = response.errors[field];
        let feedbackId = `#${field}Feedback`; // Ensure the IDs match your input error display containers
        if (Array.isArray(fieldError)) {
          $(feedbackId).text(fieldError.join(", ")).show(); // Join array of messages with comma
        } else {
          $(feedbackId).text(fieldError).show();
        }
      }
    }
  }

  // Handle AJAX request for form submissions and field validations
  function handleFormSubmission(form, formData) {
    // TODO: Perform client-side validation before submission
    /* if (form.attr("id") === "loginForm" && !validateLoginForm(formData)) {
      return; // Stop the submission if validation fails
    } */

    // Submit the form data via AJAX for server-side validation
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

  // Handle signup form submission
  $("#signupForm").submit(function (e) {
    e.preventDefault();

    let formData = {
      "signup-csrf_token": $(this).find('input[name="csrf_token"]').val(),
      "signup-username": $("#signupUsername").val(),
      "signup-email": $("#signupEmail").val(),
      "signup-password": $("#signupPassword").val(),
      "signup-confirm_password": $("#signupConfirmPassword").val(),
      action: "Sign Up",
    };

    // Perform client-side validation before submission
    if (!validateSignupForm(formData)) {
      // Show errors and stop submission if invalid
      return;
    }

    handleFormSubmission($(this), formData);
  });

  // Function to handle error messages in various formats
  function handleErrorMessage(error) {
    // Check if the error is in JSON format and parse it
    try {
      // This try block handles cases where error messages are JSON strings
      if (typeof error === "string") {
        error = JSON.parse(error); // Parse JSON string to remove extra quotes
      }
    } catch (e) {
      // If JSON.parse fails, it means it's not a JSON string, handle normally
    }

    // If it's an object, get the message property or stringify it
    if (typeof error === "object" && error !== null) {
      return error.message || JSON.stringify(error);
    }

    // Ensure it's a string and trim any residual quotes
    return String(error).replace(/^"|"$/g, "").trim();
  }

  // Handle AJAX request for field validations
  function handleAjaxRequest(actionUrl, data, feedbackSelector) {
    $.ajax({
      url: actionUrl,
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function (response) {
        let inputBox = $(feedbackSelector).closest(".input-box");
        if (response.error) {
          $(feedbackSelector).text(handleErrorMessage(response.error)).show();
          inputBox.css("border-bottom", "2px solid Red"); // Change border color on error
        } else {
          $(feedbackSelector).hide();
          inputBox.css("border-bottom", "2px solid White"); // Revert border color when no error
        }
      },
      error: function (xhr) {
        let inputBox = $(feedbackSelector).closest(".input-box");
        $(feedbackSelector)
          .text(
            handleErrorMessage(xhr.responseText) || "Error processing request"
          )
          .show();
        inputBox.css("border-bottom", "2px solid Red"); // Change border color on AJAX error
      },
    });
  }

  // Function to validate password strength
  function validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const errors = [];

    if (password.length < minLength) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!hasUppercase) {
      errors.push("Password must include at least one uppercase letter.");
    }
    if (!hasLowercase) {
      errors.push("Password must include at least one lowercase letter.");
    }
    if (!hasNumbers) {
      errors.push("Password must include at least one number.");
    }
    return errors.length > 0 ? errors.join(" ") : "";
  }

  // Function to validate the signup form
  function validateSignupForm(formData) {
    let isValid = true;
    let errors = {};

    // Check if username field is empty
    if (!formData["signup-username"].trim()) {
      errors["signup-username"] = "No username provided";
      isValid = false;
    }

    // Check if email field is empty
    if (!formData["signup-email"].trim()) {
      errors["signup-email"] = "No email provided";
      isValid = false;
    }

    // Email format validation using regex
    if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(
        formData["signup-email"]
      )
    ) {
      errors["signup-email"] = "Invalid email format";
      isValid = false;
    }

    // Password validations
    const passwordErrors = validatePassword(formData["signup-password"]);
    if (passwordErrors) {
      errors["signup-password"] = passwordErrors;
      isValid = false;
    }

    // Confirm password match
    if (formData["signup-password"] !== formData["signup-confirm_password"]) {
      errors["signup-confirm_password"] = "Passwords do not match";
      isValid = false;
    }

    // Display errors
    if (!isValid) {
      for (let field in errors) {
        let feedbackId = `#${field}Feedback`;
        $(feedbackId).text(errors[field]).show();
      }
    }

    return isValid;
  }

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

  // Fade out invalid feedback when user starts editing any field
  $("input, select, textarea").on("input focus", function () {
    $(".invalid-feedback").fadeOut("slow");
  });
});
