const searchBox = document.getElementById("searchBox");
const results = document.getElementById("results");
const filtersPanel = document.querySelector(".filters");
const familyFilter = document.getElementById("familyFilter");
const tribeFilter = document.getElementById("tribeFilter");
const genusFilter = document.getElementById("genusFilter");
const locationFilter = document.getElementById("locationFilter");
const sizeFilter = document.getElementById("sizeFilter");
const foodPlantFilter = document.getElementById("foodPlantFilter");
const colouringFilter = document.getElementById("colouringFilter");

// Map filter keys to their checkbox containers.
const filterControls = [
    { key: "family", el: familyFilter },
    { key: "tribe", el: tribeFilter },
    { key: "genus", el: genusFilter },
    { key: "location", el: locationFilter },
    { key: "size", el: sizeFilter },
    { key: "food_plant", el: foodPlantFilter },
    { key: "colouring", el: colouringFilter }
];

searchBox.addEventListener("keyup", searchButterflies);
filterControls.forEach(({ el }) => el.addEventListener("change", searchButterflies));

// Load filter options before the first search.
loadFilters();

// Fetch available filter values from the API.
async function loadFilters() {
    const response = await fetch("/api/filters");
    const data = await response.json();

    filterControls.forEach(({ key, el }) => {
        el.innerHTML = "";
        const values = data[key] || [];
        values.forEach((item, index) => {
            const value = typeof item === "string" ? item : item.value;
            const labelText = typeof item === "string" ? item : item.label;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = value;
            checkbox.id = `${key}-${index}`;

            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.append(labelText);
            el.appendChild(label);
        });
    });

    searchButterflies();
}

// Handle select all and clear buttons in each filter group.
filtersPanel.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const group = button.closest(".filter-group");
    if (!group) return;

    const checkboxes = group.querySelectorAll("input[type='checkbox']");
    const action = button.dataset.action;
    const shouldCheck = action === "select-all";

    checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldCheck;
    });

    searchButterflies();
});

// Build query params and request matching butterflies.
async function searchButterflies(){

    const query = searchBox.value;
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    filterControls.forEach(({ key, el }) => {
        const selected = Array.from(el.querySelectorAll("input[type='checkbox']:checked"))
            .map((input) => input.value);
        selected.forEach((value) => params.append(key, value));
    });

    const response = await fetch(`/api/butterflies?${params.toString()}`);
    const butterflies = await response.json();

    displayResults(butterflies);
}

// Render search results into cards.
function displayResults(butterflies){

    results.innerHTML = "";

    butterflies.forEach(b => {

        const card = document.createElement("div");
        card.className = "card";

        const imageSrc = b.image || "/images/ulysses.jpg";
        card.innerHTML = `
            <h3>${b.common_name}</h3>
            <img src="${imageSrc}" alt="${b.common_name}">
            <p><strong>Scientific:</strong> ${b.scientific_name}</p>
            <p><strong>Family:</strong> ${b.family}</p>
            <a class="card-link" href="butterfly.html?id=${b.id}">Read more</a>
        `;

        results.appendChild(card);
    });

}
