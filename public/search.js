const searchBox = document.getElementById("searchBox");
const results = document.getElementById("results");
const familyFilter = document.getElementById("familyFilter");
const tribeFilter = document.getElementById("tribeFilter");
const genusFilter = document.getElementById("genusFilter");
const locationFilter = document.getElementById("locationFilter");
const sizeFilter = document.getElementById("sizeFilter");
const foodPlantFilter = document.getElementById("foodPlantFilter");
const colouringFilter = document.getElementById("colouringFilter");

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

loadFilters();

async function loadFilters() {
    const response = await fetch("/api/filters");
    const data = await response.json();

    filterControls.forEach(({ key, el }) => {
        const values = data[key] || [];
        values.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            el.appendChild(option);
        });
    });

    searchButterflies();
}

async function searchButterflies(){

    const query = searchBox.value;
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (familyFilter.value) params.set("family", familyFilter.value);
    if (tribeFilter.value) params.set("tribe", tribeFilter.value);
    if (genusFilter.value) params.set("genus", genusFilter.value);
    if (locationFilter.value) params.set("location", locationFilter.value);
    if (sizeFilter.value) params.set("size", sizeFilter.value);
    if (foodPlantFilter.value) params.set("food_plant", foodPlantFilter.value);
    if (colouringFilter.value) params.set("colouring", colouringFilter.value);

    const response = await fetch(`/api/butterflies?${params.toString()}`);
    const butterflies = await response.json();

    displayResults(butterflies);
}

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
