// TheMealDB's free educational API key is "1". No account is needed.
const apiUrl = "https://www.themealdb.com/api/json/v1/1/";
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const surpriseButton = document.querySelector("#surprise-button");
const statusMessage = document.querySelector("#status");
const recipe = document.querySelector("#recipe");
const results = document.querySelector(".results");
const buttons = document.querySelectorAll("button");

// Both buttons use the same function; only the API endpoint changes.
searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Keep the form from reloading the page.
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    statusMessage.textContent = "Enter a dish name, such as pasta or curry.";
    searchInput.focus();
    return;
  }
  loadRecipe("search.php?s=" + encodeURIComponent(searchTerm));
});

surpriseButton.addEventListener("click", function () {
  loadRecipe("random.php");
});

// async/await lets us wait for the network without freezing the page.
async function loadRecipe(endpoint) {
  statusMessage.textContent = "Finding a little dinner inspiration…";
  recipe.hidden = true;
  results.setAttribute("aria-busy", "true");
  buttons.forEach(function (button) { button.disabled = true; });

  try {
    // 1. Request data from a real API.
    const response = await fetch(apiUrl + endpoint);
    if (!response.ok) {
      throw new Error("The API request failed.");
    }

    // 2. Convert the JSON response into a JavaScript object.
    const data = await response.json();
    if (!data.meals || data.meals.length === 0) {
      statusMessage.textContent = "No recipe found. Try another dish, or let us surprise you.";
      return;
    }

    // 3. Use the first match to update the existing page.
    showRecipe(data.meals[0]);
    statusMessage.textContent = data.meals.length > 1
      ? "Showing the first of " + data.meals.length + " matching recipes."
      : "A little inspiration, served fresh.";
  } catch (error) {
    statusMessage.textContent = "We couldn't load a recipe. Check your connection and try again.";
    console.error(error);
  } finally {
    // This runs on success, no results, and errors.
    results.setAttribute("aria-busy", "false");
    buttons.forEach(function (button) { button.disabled = false; });
  }
}

function showRecipe(meal) {
  document.querySelector("#meal-name").textContent = meal.strMeal;
  document.querySelector("#meal-category").textContent = meal.strCategory || "Recipe inspiration";
  document.querySelector("#meal-area").textContent = meal.strArea ? "From the " + meal.strArea + " kitchen" : "From kitchens around the world";
  document.querySelector("#meal-instructions").textContent = meal.strInstructions || "No instructions are available for this recipe.";
  const image = document.querySelector("#meal-image");
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;
  recipe.hidden = false;
}

// Start with a recognizable dish. Students can try other searches immediately.
loadRecipe("search.php?s=Arrabiata");
