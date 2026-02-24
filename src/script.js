/* =========================
   STATE & GLOBALS
========================= */

let allFonts = []; // This will hold the 1,500+ font names

let currentFonts = {
  heading: "Inter",
  subHeading: "Inter",
  body: "Inter",
  caption: "Inter",
};

/* =========================
   DOM REFERENCES
========================= */

const buttons = document.querySelectorAll(".toggleButton");
const previewItems = document.querySelectorAll(".previewItem");
const statusMessage = document.getElementById("statusMessage");
const addPairingButton = document.getElementById("AddPairingBtn");
const headingPreview = document.getElementById("headingPreview");

const pairingAButton = document.getElementById("pairingAbtn");
const pairingBButton = document.getElementById("pairingBbtn");

const inputs = document.querySelectorAll(".font-input");

const mobileMenuButton = document.getElementById("mobileMenuBtn");
const mobileControls = document.getElementById("controls-mobile");
const closeMenuButton = document.getElementById("closeMenuBtn");
const myForm = document.querySelector("form");

/* =========================
   INITIALIZATION
========================= */

async function initApp() {
  console.log("Initializing App...");

  // Start fetching the fonts
  await fetchFontList();

  // Now that fonts are loaded, you could enable your inputs
  // or hide a loading spinner here
  console.log("App ready: Fonts loaded.");
  console.log("Font list fetched:", allFonts);

  const fontLoader = document.createElement("link");
  fontLoader.id = "dynamic-font-loader";
  fontLoader.rel = "stylesheet";
  document.head.appendChild(fontLoader);
}

// Call it immediately
initApp();

/* =========================
   API LOGIC
========================= */

async function fetchFontList() {
  const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
  const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    allFonts = data.items.map((font) => font.family);
  } catch (err) {
    console.error("Could not fetch font list", err);
  }
}

/* =========================
   EVENT LISTENERS
========================= */

// Toggle Sections
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    button.querySelector(".svgMinus").classList.toggle("hidden");
    button.querySelector(".svgPlus").classList.toggle("hidden");

    const previewTarget = button.getAttribute("data-target");
    const previewElement = document.getElementById(previewTarget);
    previewElement.classList.toggle("hidden");

    const field = button.closest(".field");
    const input = field.querySelector("#input");

    field.classList.toggle("text-[#C2C2C2]");
    input.disabled = !input.disabled;

    updateStatusMessage();
  });
});

// Font Input: Selection (Enter)
inputs.forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const fontName = input.value.trim();
      const previewTarget = input.getAttribute("data-target");
      const previewElement = document.getElementById(previewTarget);

      if (!fontName) return; // Don't do anything if input is empty
      changeFont(fontName, previewElement);
      input.value = "";
    }
  });
});

// Font Input: Search Suggestions (Input)
inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    // 'e.target' is the specific input being typed in
    const query = e.target.value.toLowerCase();
    const datalist = document.getElementById("font-names");

    if (query.length < 2) {
      datalist.innerHTML = "";
      return;
    }

    const matches = allFonts
      .filter((fontName) => fontName.toLowerCase().includes(query))
      .slice(0, 15);

    datalist.innerHTML = matches
      .map((font) => `<option value="${font}">`)
      .join("");
  });
});

// Reset Pairing Buttons
pairingAButton.addEventListener("click", () => {
  resetPairing("pairingA");
});

pairingBButton.addEventListener("click", () => {
  resetPairing("pairingB");
});

addPairingButton.addEventListener("click", () => {
  saveCurrentPairing();
});

mobileMenuButton.addEventListener("click", () => {
  mobileControls.classList.remove("hidden");
  mobileControls.classList.add("flex");
  document.body.style.overflow = "hidden";
});

closeMenuButton.addEventListener("click", () => {
  mobileControls.classList.add("hidden");
  mobileControls.classList.remove("flex");
  document.body.style.overflow = "auto";
});

myForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

/* =========================
   CORE FUNCTIONS
========================= */

function updateStatusMessage() {
  const allHidden = [...previewItems].every((item) =>
    item.classList.contains("hidden"),
  );

  if (allHidden) {
    statusMessage.classList.remove("hidden");
    addPairingButton.classList.add("hidden");
  } else {
    statusMessage.classList.add("hidden");
    addPairingButton.classList.remove("hidden");
  }
}

function resetPairing(pairingKey) {
  const button = document.getElementById(`${pairingKey}btn`);
  const pairing = document.getElementById(pairingKey);
  const emptyState = document.getElementById(`${pairingKey}Empty`);

  // 1. Hide the content and show the empty state
  button.classList.add("hidden");
  pairing.classList.add("hidden");
  emptyState.classList.remove("hidden");
  emptyState.classList.add("flex");

  // 2. Reset the internal labels back to default "Inter"
  const roles = ["heading", "subHeading", "body", "caption"];

  roles.forEach((role) => {
    const nameLabel = document.getElementById(`${pairingKey}-${role}-name`);
    if (nameLabel) {
      nameLabel.innerText = "Inter";
      nameLabel.classList.replace("text-zinc-400", "text-black");
    }

    // Also ensure the individual preview lines are visible for the next use
    const savedElement = document.getElementById(`${pairingKey}-${role}`);
    if (savedElement) {
      savedElement.classList.remove("hidden");
    }
  });
}
function changeFont(fontName, targetElement) {
  // 1. Identify which "role" this font is for (e.g., heading, body)
  const role = targetElement.id.replace("Preview", "").toLowerCase();
  currentFonts[role] = fontName;

  // 2. Build a combined URL for ALL active fonts
  const fontStrings = Object.values(currentFonts)
    .map((name) => name.replace(/ /g, "+"))
    .join("|");

  const newHref = `https://fonts.googleapis.com/css?family=${fontStrings}&display=swap`;

  // 3. Update the SINGLE link tag in the head
  const loader = document.getElementById("dynamic-font-loader");
  loader.href = newHref;

  // 4. Apply the style to the element
  targetElement.style.fontFamily = `'${fontName}', sans-serif`;
}

function saveCurrentPairing() {
  const pairingA = document.getElementById("pairingA");
  const pairingB = document.getElementById("pairingB");

  // Determine which slot to fill
  let targetKey = "";
  if (pairingA.classList.contains("hidden")) {
    targetKey = "pairingA";
  } else if (pairingB.classList.contains("hidden")) {
    targetKey = "pairingB";
  } else {
    alert("Both slots are full!");
    return;
  }

  const pairingContainer = document.getElementById(targetKey);
  const emptyState = document.getElementById(`${targetKey}Empty`);
  const resetBtn = document.getElementById(`${targetKey}btn`);

  pairingContainer.classList.remove("hidden");
  pairingContainer.classList.add("flex");

  resetBtn.classList.remove("hidden");
  emptyState.classList.add("hidden");
  emptyState.classList.remove("flex");

  // Loop through roles: heading, subheading, body, caption
  for (const [role, fontName] of Object.entries(currentFonts)) {
    const mainPreview = document.getElementById(`${role}Preview`);
    const savedElement = document.getElementById(`${targetKey}-${role}`);

    // Target the specific span we just created in the HTML
    const nameLabel = document.getElementById(`${targetKey}-${role}-name`);

    if (mainPreview && savedElement) {
      if (mainPreview.classList.contains("hidden")) {
        // 1. Role is toggled OFF
        savedElement.classList.add("hidden");
        if (nameLabel) {
          nameLabel.innerText = "N/A";
          nameLabel.classList.replace("text-black", "text-zinc-400"); // Visual cue for N/A
        }
      } else {
        // 2. Role is toggled ON
        savedElement.classList.remove("hidden");
        savedElement.style.fontFamily = `'${fontName}', sans-serif`;

        if (nameLabel) {
          nameLabel.innerText = fontName;
          nameLabel.classList.replace("text-zinc-400", "text-black"); // Restore black text
        }
      }
    }
  }
}
