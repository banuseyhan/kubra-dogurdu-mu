const answer = document.querySelector("#answer");
const updated = document.querySelector("#updated");
const menuButton = document.querySelector("#menuButton");
const closeDrawer = document.querySelector("#closeDrawer");
const drawer = document.querySelector("#adminDrawer");
const overlay = document.querySelector("#overlay");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#adminMessage");
const buttons = [document.querySelector("#noButton"), document.querySelector("#yesButton")];
const musicButton = document.querySelector("#musicButton");
const musicPlayer = document.querySelector("#musicPlayer");
let currentStatus = null;
let musicStarted = false;

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function loadStatus() {
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    if (!response.ok) throw new Error("Status alinamadi");

    const status = await response.json();
    const nextAnswer = status.dogurdu ? "Evet" : "Hayır";
    const nextClass = status.dogurdu ? "yes" : "no";
    const shouldAnimate = currentStatus !== null && currentStatus !== status.dogurdu;

    currentStatus = status.dogurdu;
    document.body.dataset.status = nextClass;
    answer.textContent = nextAnswer;
    answer.className = nextClass;

    if (shouldAnimate) {
      answer.classList.remove("bump");
      window.requestAnimationFrame(() => {
        answer.classList.add("bump");
      });
    }

    updated.textContent = status.updatedAt ? `Son güncelleme: ${formatDate(status.updatedAt)}` : "";
  } catch (error) {
    answer.textContent = "?";
    answer.className = "";
    updated.textContent = "Durum yüklenemedi.";
  }
}

function openDrawer() {
  overlay.hidden = false;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  passwordInput.focus();
}

function closeAdminDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    if (!drawer.classList.contains("open")) {
      overlay.hidden = true;
    }
  }, 180);
}

async function setStatus(dogurdu) {
  message.textContent = "Güncelleniyor...";
  buttons.forEach((button) => {
    button.disabled = true;
  });

  try {
    const response = await fetch("/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dogurdu,
        password: passwordInput.value,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Güncellenemedi");

    message.textContent = `Durum "${dogurdu ? "Evet" : "Hayır"}" olarak güncellendi.`;
    await loadStatus();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

menuButton.addEventListener("click", openDrawer);
closeDrawer.addEventListener("click", closeAdminDrawer);
overlay.addEventListener("click", closeAdminDrawer);
document.querySelector("#noButton").addEventListener("click", () => setStatus(false));
document.querySelector("#yesButton").addEventListener("click", () => setStatus(true));
musicButton.addEventListener("click", () => {
  if (!musicStarted) {
    musicPlayer.innerHTML = '<iframe width="1" height="1" src="https://www.youtube.com/embed/Yn3h0CeB_pY?autoplay=1&loop=1&playlist=Yn3h0CeB_pY&playsinline=1" title="Müzik" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    musicStarted = true;
  }

  musicButton.setAttribute("aria-pressed", "true");
  musicButton.querySelector("span:last-child").textContent = "Çalıyor";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAdminDrawer();
  }
});

loadStatus();
setInterval(loadStatus, 2000);
