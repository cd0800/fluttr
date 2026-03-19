const form = document.getElementById("signupForm");
const errorEl = document.getElementById("signupError");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const emailFeedback = document.getElementById("emailFeedback");
const confirmFeedback = document.getElementById("confirmFeedback");

// Basic email format check before sending to the server.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Inline email feedback to guide the user.
function updateEmailFeedback() {
  const email = emailInput.value.trim();
  if (!email) {
    emailFeedback.textContent = "";
    return false;
  }
  if (!isValidEmail(email)) {
    emailFeedback.textContent = "Please enter a valid email address.";
    return false;
  }
  emailFeedback.textContent = "";
  return true;
}

// Inline password match feedback.
function updateConfirmFeedback() {
  const password = passwordInput.value;
  const confirm = confirmInput.value;
  if (!confirm) {
    confirmFeedback.textContent = "";
    return false;
  }
  if (password !== confirm) {
    confirmFeedback.textContent = "Passwords do not match.";
    return false;
  }
  confirmFeedback.textContent = "";
  return true;
}

emailInput.addEventListener("input", updateEmailFeedback);
passwordInput.addEventListener("input", updateConfirmFeedback);
confirmInput.addEventListener("input", updateConfirmFeedback);

// Submit the form to create a new account.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";

  const name = document.getElementById("name").value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const emailOk = updateEmailFeedback();
  const confirmOk = updateConfirmFeedback();

  if (!emailOk || !confirmOk) {
    errorEl.textContent = "Please fix the highlighted fields.";
    return;
  }

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      errorEl.textContent = data.error || "Sign up failed. Please try again.";
      return;
    }

    window.location.href = "signin.html";
  } catch (error) {
    errorEl.textContent = "Network error. Please try again.";
  }
});
