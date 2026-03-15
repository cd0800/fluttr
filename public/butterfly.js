const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const detailName = document.getElementById("detailName");
const detailImage = document.getElementById("detailImage");
const detailScientific = document.getElementById("detailScientific");
const detailFamily = document.getElementById("detailFamily");
const detailTribe = document.getElementById("detailTribe");
const detailGenus = document.getElementById("detailGenus");
const detailLocation = document.getElementById("detailLocation");
const detailSize = document.getElementById("detailSize");
const detailFoodPlant = document.getElementById("detailFoodPlant");
const detailColouring = document.getElementById("detailColouring");

async function loadButterfly() {
    if (!id) {
        detailName.textContent = "Butterfly not found";
        return;
    }

    const response = await fetch(`/api/butterflies/${id}`);
    if (!response.ok) {
        detailName.textContent = "Butterfly not found";
        return;
    }

    const b = await response.json();
    const imageSrc = b.image || "/images/ulysses.jpg";

    detailName.textContent = b.common_name || "Butterfly";
    detailImage.src = imageSrc;
    detailImage.alt = b.common_name || "Butterfly";
    detailScientific.textContent = b.scientific_name ? `Scientific: ${b.scientific_name}` : "";
    detailFamily.textContent = b.family ? `Family: ${b.family}` : "";
    detailTribe.textContent = b.tribe || "—";
    detailGenus.textContent = b.genus || "—";
    detailLocation.textContent = b.location || "—";
    detailSize.textContent = b.size || "—";
    detailFoodPlant.textContent = b.food_plant || "—";
    detailColouring.textContent = b.colouring || "—";
}

loadButterfly();
