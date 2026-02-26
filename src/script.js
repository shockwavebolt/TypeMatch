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
const missingMessage = document.getElementById("missingPreviewMessage");
const fullMessage = document.getElementById("slotsFullMessage");
const addPairingButton = document.getElementById("AddPairingBtn");
const headingPreview = document.getElementById("headingPreview");

const pairingAButton = document.getElementById("pairingAbtn");
const pairingBButton = document.getElementById("pairingBbtn");

const inputs = document.querySelectorAll(".font-input");

const mobileMenuButton = document.getElementById("mobileMenuBtn");
const mobileControls = document.getElementById("controls-mobile");
const closeMenuButton = document.getElementById("closeMenuBtn");

const resetFontButtons = document.querySelectorAll(".resetFontBtn");
const fontSelectButtons = document.querySelectorAll(".fontSelectBtn");

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
    // 1. Identify the Target
    const previewTarget = button.getAttribute("data-target");
    const previewElement = document.getElementById(previewTarget);
    if (!previewElement) return;

    // 2. Toggle visibility and capture the state
    previewElement.classList.toggle("hidden");
    const isHidden = previewElement.classList.contains("hidden");

    // 3. Update the Toggle Button SVGs (Plus/Minus)
    const svgMinus = button.querySelector(".svgMinus");
    const svgPlus = button.querySelector(".svgPlus");
    if (svgMinus && svgPlus) {
      svgMinus.classList.toggle("hidden", isHidden);
      svgPlus.classList.toggle("hidden", !isHidden);
    }

    // 4. Update the sibling elements within the same field
    const field = button.closest(".field");
    const input = field.querySelector(".font-input");
    const fontSelectionBtn = field.querySelector(".fontSelectBtn");
    const resetFontBtn = field.querySelector(".resetFontBtn");

    // Change field text color
    field.classList.toggle("text-[#C2C2C2]", isHidden);

    // Disable/Enable Input
    if (input) {
      input.disabled = isHidden;
    }

    // Disable/Enable Reset Button
    if (resetFontBtn) {
      resetFontBtn.disabled = isHidden;
      resetFontBtn.classList.toggle("text-[#C2C2C2]", isHidden);
      resetFontBtn.classList.toggle("text-[#00639B]", !isHidden);
    }

    // Disable/Enable the Arrow Button and change its color
    if (fontSelectionBtn) {
      fontSelectionBtn.disabled = isHidden;
      // This ensures the color stays in sync with the disabled state
      fontSelectionBtn.classList.toggle("text-[#C2C2C2]", isHidden);
      fontSelectionBtn.classList.toggle("text-[#00639B]", !isHidden);
    }

    missingPreviewMessage();
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
      input.placeholder = fontName;
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

// Selected Font buttons
fontSelectButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const field = btn.closest(".field");
    const input = field.querySelector(".font-input");

    // Don't do anything if disabled or empty
    if (input.disabled || !input.value.trim()) return;

    const fontName = input.value.trim();
    const previewTarget = input.getAttribute("data-target"); // Get target from sibling input
    const previewElement = document.getElementById(previewTarget);

    changeFont(fontName, previewElement);

    // Update placeholder and clear like we did before
    input.placeholder = fontName;
    input.value = "";
  });
});

// Reset Font buttons (
resetFontButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // 1. Get the context of the field
    const field = btn.closest(".field");
    const input = field.querySelector(".font-input");

    // Prevent action if the field is currently toggled off/disabled
    if (btn.disabled) return;

    // 2. Identify the target preview element
    const previewTarget = input.getAttribute("data-target");
    const previewElement = document.getElementById(previewTarget);

    if (!previewElement) return;

    // 3. Reset the font using your existing core function
    changeFont("Inter", previewElement);

    // 4. Reset the input UI to reflect the default state
    input.value = "";
    input.placeholder = "Inter";
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

/* =========================
   CORE FUNCTIONS
========================= */

function missingPreviewMessage() {
  const allHidden = [...previewItems].every((item) =>
    item.classList.contains("hidden"),
  );

  if (allHidden) {
    missingMessage.classList.remove("hidden");
    missingMessage.classList.add("flex");

    addPairingButton.classList.add("hidden");
  } else {
    missingMessage.classList.add("hidden");

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

  slotsFullMessage(); // Check if we need to show/hide the "slots full" message
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
    slotsFullMessage();
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

function slotsFullMessage() {
  const pairingA = document.getElementById("pairingA");
  const pairingB = document.getElementById("pairingB");

  // A slot is "Full" if it is NOT hidden
  const isA_Full = !pairingA.classList.contains("hidden");
  const isB_Full = !pairingB.classList.contains("hidden");

  // We only show the message if BOTH are full
  if (isA_Full && isB_Full) {
    // SHOW MESSAGE
    fullMessage.classList.replace("hidden", "flex"); // Show the wrapper/icon

    // HIDE BUTTON
    addPairingButton.classList.replace("flex", "hidden");
  } else {
    // HIDE MESSAGE
    fullMessage.classList.replace("flex", "hidden");

    // Show the button if either slot is empty
    addPairingButton.classList.replace("hidden", "flex");
  }
}
