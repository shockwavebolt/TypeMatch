/* =========================
   STATE & GLOBALS
========================= */

let allFonts = []; // This will hold the 1,500+ font names

let currentFonts = {
  heading: "Inter",
  subheading: "Inter",
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

  button.classList.add("hidden");
  pairing.classList.add("hidden");
  emptyState.classList.remove("hidden");
  emptyState.classList.add("flex");
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
