const buttons = document.querySelectorAll(".toggleButton");

const previewItems = document.querySelectorAll(".previewItem");
const statusMessage = document.getElementById("statusMessage");
const addPairingButton = document.getElementById("AddPairingBtn");

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
