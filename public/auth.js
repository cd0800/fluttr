const signinLink = document.getElementById("signinLink");
const signoutBtn = document.getElementById("signoutBtn");
const heroGreeting = document.getElementById("heroGreeting");

// Fetch the current session user and update the header and hero.
async function loadUser() {
  if (!signinLink || !signoutBtn) {
    return;
  }

  try {
    const response = await fetch("/api/me", { credentials: "same-origin" });
    const data = await response.json();

    if (data.user) {
      if (heroGreeting) {
        heroGreeting.textContent = `Hello, ${data.user.name}!`;
      }
      signoutBtn.style.display = "inline-block";
      signinLink.style.display = "none";
    } else {
      signoutBtn.style.display = "none";
      signinLink.style.display = "inline-block";
      if (heroGreeting) {
        heroGreeting.textContent = "Discover butterflies.";
      }
    }
  } catch (error) {
    signoutBtn.style.display = "none";
    if (signinLink) {
      signinLink.style.display = "inline-block";
    }
    if (heroGreeting) {
      heroGreeting.textContent = "Discover butterflies.";
    }
  }
}

// Sign out clears the session and returns to the homepage.
if (signoutBtn) {
  signoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/signout", { method: "POST" });
    } finally {
      window.location.href = "index.html";
    }
  });
}

loadUser();
