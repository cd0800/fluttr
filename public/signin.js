const form = document.getElementById("signinForm");
const errorEl = document.getElementById("signinError");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!isValidEmail(email)) {
    errorEl.textContent = "Please enter a valid email address.";
    return;
  }

  try {
    const response = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      errorEl.textContent = data.error || "Sign in failed. Please try again.";
      return;
    }

    window.location.href = "index.html";
  } catch (error) {
    errorEl.textContent = "Network error. Please try again.";
  }
});
