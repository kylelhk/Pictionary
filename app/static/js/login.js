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
                    displayAjaxMessage("You must be logged in to access this page.", "error");
                }
            },

            // Show an error message if the AJAX request fails
            error: function () {
                displayAjaxMessage("Error checking authentication status.", "error");
            },
        });
    }

    $(".nav-link").on("click", checkAuthentication);

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

        signupLink?.addEventListener("click", () => loginSection.classList.add("active"));
        loginLink?.addEventListener("click", () => loginSection.classList.remove("active"));
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
            // Add CSRF token to non-GET requests
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                // Get CSRF token value from meta tag and set it as request header
                const csrfToken = $('input[name="csrf_token"]').val();
                xhr.setRequestHeader("X-CSRFToken", csrfToken);
            }
        },
    });

    // Client-side validation for login form
    function validateLoginField(fieldId, fieldValue) {
        let error = "";

        // Check for empty fields
        if (fieldId === "loginUsername" && !fieldValue.trim()) {
            error = "Username is required.";
        } else if (fieldId === "loginPassword" && !fieldValue) {
            error = "Password is required.";
        }

        let feedbackSelector = `#${fieldId}Feedback`;
        handleAjaxRequest(null, error, feedbackSelector, false); // Display errors
        return !error; // Return true if no error, false otherwise
    }

    // Client-side validation for signup form
    function validateSignupField(fieldId, fieldValue, formData) {
        let error = "";

        switch (fieldId) {
            // Check for empty fields
            case "signupUsername":
                if (!fieldValue.trim()) error = "Username is required.";
                break;
            case "signupEmail":
                if (!fieldValue.trim()) {
                    error = "Email is required.";
                } else if (
                    // Validate email format
                    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(
                        fieldValue.trim()
                    )
                ) {
                    error = "Invalid email format.";
                }
                break;

            // Validate password strength
            case "signupPassword":
                error = validatePassword(fieldValue);
                break;

            // Confirm password match
            case "signupConfirmPassword":
                if (fieldValue !== formData["signup-password"]) {
                    error = "Passwords do not match.";
                }
                break;
        }

        let feedbackSelector = `#${fieldId}Feedback`;
        handleAjaxRequest(null, error, feedbackSelector, false); // Display errors
        return error === ""; // Returns true if no error, false otherwise
    }

    // Helper function for validating password strength
    function validatePassword(password) {
        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return "At least one uppercase, lowercase, and numeric character.";
        }
        return "";
    }

    // Perform client-side validation for login form on blur
    $("#loginUsername, #loginPassword").blur(function () {
        validateLoginField(this.id, $(this).val());
    });

    // Perform client-side validation for signup form on blur
    $("#signupUsername, #signupEmail, #signupPassword, #signupConfirmPassword").blur(function () {
        let formData = {
            "signup-password": $("#signupPassword").val(), // Needed for confirm password validation
        };
        validateSignupField(this.id, $(this).val(), formData);
    });

    // Function to display AJAX alert message (for nav link access control)
    function displayAjaxMessage(message, category) {
        const alertHtml = `<div class="alert alert-${category}">${message}</div>`;
        $(".alert-container").html(alertHtml).show().delay(3000).fadeOut("slow");
    }

    // Handle login form submission via AJAX
    $("#loginForm").submit(function (e) {
        e.preventDefault(); // Prevent the traditional form submission

        // Extract form data and store in an object
        let formData = {
            "login-csrf_token": $(this).find('input[name="csrf_token"]').val(),
            "login-username": $("#loginUsername").val(),
            "login-password": $("#loginPassword").val(),
            remember_me: $("#rememberMe").is(":checked"),
            action: "Login",
        };

        // Check client-side validation result for all fields
        const fieldsToValidate = [
            {id: "loginUsername", value: formData["login-username"]},
            {id: "loginPassword", value: formData["login-password"]},
        ];

        let allFieldsValid = true;
        for (const field of fieldsToValidate) {
            if (!validateLoginField(field.id, field.value)) {
                allFieldsValid = false;
                break; // Stop checking if any field fails
            }
        }

        // Only submit the form via AJAX if client-side validation passes
        // The server-side validation is performed by handle_login_ajax() in routes.py before commiting the form data
        if (allFieldsValid) {
            submitFormViaAjax($(this), formData);
        } else {
            displayAjaxMessage("Please correct the errors before submitting.", "error");
        }
    });

    // Handle signup form submission via AJAX
    $("#signupForm").submit(async function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Extract form data
        let formData = {
            "signup-csrf_token": $(this).find('input[name="csrf_token"]').val(),
            "signup-username": $("#signupUsername").val(),
            "signup-email": $("#signupEmail").val(),
            "signup-password": $("#signupPassword").val(),
            "signup-confirm_password": $("#signupConfirmPassword").val(),
            action: "Sign Up",
        };

        // Check client-side validation result for all fields
        const fieldsToValidate = [
            {id: "signupUsername", value: formData["signup-username"]},
            {id: "signupEmail", value: formData["signup-email"]},
            {id: "signupPassword", value: formData["signup-password"]},
            {
                id: "signupConfirmPassword",
                value: formData["signup-confirm_password"],
            },
        ];

        let allFieldsValid = true;
        for (const field of fieldsToValidate) {
            if (!validateSignupField(field.id, field.value, formData)) {
                allFieldsValid = false;
                break; // Stop checking if any field fails
            }
        }

        // Perform server-side validation (via four endpoints defined in routes.py) if client-side validation passes
        if (allFieldsValid) {
            const serverValidationPassed = await serverValidation(
                "#signupUsername, #signupEmail, #signupPassword, #signupConfirmPassword"
            );
            // Only submit the form via AJAX if both validations pass
            if (serverValidationPassed) {
                submitFormViaAjax($(this), formData);
            } else {
                displayAjaxMessage("Server-side validation failed. Please revise your input(s).", "error");
            }
        } else {
            displayAjaxMessage("Please revise your input(s) according to the error message(s).", "error");
        }
    });

    // Function for AJAX form submission
    function submitFormViaAjax(form, formData) {
        // 'form' parameter is the jQuery object of the form element and is needed for proper submission
        // Send the form data via AJAX
        $.ajax({
            url: "/login", // Flask route for both login and signup form submission
            type: "POST",
            data: JSON.stringify(formData),
            contentType: "application/json",
            dataType: "json",

            // Handle AJAX request success
            success: function (response) {
                if (!response.error && response.redirect) {
                    // Save the user ID to local storage
                    localStorage.setItem("userId", response.userId);
                    window.location.href = response.redirect; // Redirect if no errors
                } else if (response.errors) {
                    displayErrors(response.errors); // Display form-level error messages
                }
            },

            // Handle AJAX request errors
            error: function () {
                // Display the error message
                displayAjaxMessage("Server-side validation failed. Please revise your input(s).", "error");
            },
        });
    }

    // Function to display form-level error messages
    function displayErrors(response) {
        if (response.errors) {
            // Clear previous error messages
            $(".invalid-feedback").text("").hide();

            // Display new error messages
            for (let field in response.errors) {
                let fieldError = response.errors[field];
                let feedbackId = `#${field}Feedback`;
                if (Array.isArray(fieldError)) {
                    $(feedbackId).text(fieldError.join(", ")).show();
                } else {
                    $(feedbackId).text(fieldError).show();
                }
            }
        }
    }

    // Function to trigger AJAX requests for server-side validation via four endpoints defined in routes.py
    async function serverValidation(selectors) {
        let promises = [];

        $(selectors).each(function () {
            let fieldId = $(this).attr("id");
            let actionUrl = `/validate-${fieldId.split("signup")[1].toLowerCase()}`; // Creates the endpoint URL dynamically based on field ID
            let data = {value: $(this).val()};

            // Include password for confirm password validation
            if (fieldId === "signupConfirmPassword") {
                data.password = $("#signupPassword").val();
            }

            // Push the AJAX request to the promises array
            let feedbackSelector = `#${fieldId}Feedback`;
            promises.push(handleAjaxRequest(actionUrl, data, feedbackSelector));
        });

        // Wait for all promises to resolve and return the result
        try {
            await Promise.all(promises);
            return true; // Return true if all validations pass
        } catch (error) {
            console.error("Validation error:", error);
            return false; // Return false if any validation fails
        }
    }

    // Function for sending data to the server via AJAX and handling the resulting response or error
    function handleAjaxRequest(actionUrl, data, feedbackSelector, useAjax = true) {
        const inputBox = $(feedbackSelector).closest(".input-box");

        // Function to display or hide error message based on server response
        function displayError(message) {
            $(feedbackSelector).text(message).show();
            inputBox.css("border-bottom", "2px solid Red");
        }

        function clearError() {
            $(feedbackSelector).hide();
            inputBox.css("border-bottom", "2px solid White");
        }

        // Perform AJAX request or direct error handling
        if (useAjax) {
            // Send the data to the server via AJAX
            $.ajax({
                url: actionUrl,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",

                // Handle AJAX request success
                success: function (response) {
                    if (response.error) {
                        displayError(convertErrorMessage(response.error));
                    } else {
                        clearError();
                    }
                },

                // Handle AJAX request errors
                error: function (xhr) {
                    displayError(convertErrorMessage(xhr.responseText) || "Error processing request");
                },
            });
        } else {
            // Handle error messages for client-side validations
            if (typeof data === "string" && data.trim() !== "") {
                displayError(data);
            } else {
                clearError();
            }
        }
    }

    // Function for converting different forms of error message into a consistent format for user prompt
    function convertErrorMessage(error) {
        // Parse error if it is a JSON-formatted string
        try {
            if (typeof error === "string") {
                error = JSON.parse(error);
            }
        } catch (e) {
            // Silent failure - if JSON.parse fails, use the original error message
        }

        // If error is an object (not a string), attempt to find a message directly
        if (typeof error === "object" && error !== null) {
            return error.message || JSON.stringify(error);
        }

        // Convert error to string and remove any enclosing quotes
        return String(error).replace(/^"|"$/g, "").trim();
    }

    // Fade out error messages when user starts editing any field
    $("input, select, textarea").on("input focus", function () {
        $(this).closest(".form-group").find(".invalid-feedback").fadeOut("slow");
    });
});
