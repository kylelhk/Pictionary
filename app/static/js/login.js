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

  // Function to fade out flash message
  $(document).ready(function () {
    setTimeout(function () {
      $(".alert").fadeOut("slow");
    }, 4000); // 4 seconds
  });

  // Initialise form toggle and password visibility functions
  toggleForms();
  togglePasswordVisibility("togglePassword", "password"); // Login password
  togglePasswordVisibility("toggleSignupPassword", "signup-password"); // Signup password
  togglePasswordVisibility("toggleConfirmPassword", "confirm-password"); // Confirm password
});
