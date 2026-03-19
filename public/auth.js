const signinLink = document.getElementById("signinLink");
const userGreeting = document.getElementById("userGreeting");
const signoutBtn = document.getElementById("signoutBtn");
const heroGreeting = document.getElementById("heroGreeting");

async function loadUser() {
  if (!signinLink || !userGreeting || !signoutBtn) {
    return;
  }

  try {
    const response = await fetch("/api/me", { credentials: "same-origin" });
    const data = await response.json();

    if (data.user) {
      if (userGreeting) {
        userGreeting.textContent = `Hello, ${data.user.name}!`;
        userGreeting.style.display = "inline-block";
      }
      if (heroGreeting) {
        heroGreeting.textContent = `Hello, ${data.user.name}!`;
      }
      signoutBtn.style.display = "inline-block";
      signinLink.style.display = "none";
    } else {
      if (userGreeting) {
        userGreeting.style.display = "none";
      }
      signoutBtn.style.display = "none";
      signinLink.style.display = "inline-block";
      if (heroGreeting) {
        heroGreeting.textContent = "Discover butterflies.";
      }
    }
  } catch (error) {
    if (userGreeting) {
      userGreeting.style.display = "none";
    }
    signoutBtn.style.display = "none";
    if (signinLink) {
      signinLink.style.display = "inline-block";
    }
    if (heroGreeting) {
      heroGreeting.textContent = "Discover butterflies.";
    }
  }
}

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
