// 1. API ADDRESS AND HTML ELEMENTS
// The final "1" in this URL is TheMealDB's shared development/education API key.
// Students do not need an account or a personal key for this example.
// It is a public test key, not a secret. Public production apps should use
// a supporter key according to https://www.themealdb.com/docs_api_guide.php.
const apiUrl = "https://www.themealdb.com/api/json/v1/1/";

// querySelector() finds an HTML element using a CSS selector.
// These variables hold references to elements we will read or update.
// The script is at the bottom of <body>, so these elements already exist.
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const surpriseButton = document.querySelector("#surprise-button");
const statusMessage = document.querySelector("#status");
const recipe = document.querySelector("#recipe");
const recipeOptions = document.querySelector("#recipe-options");
const results = document.querySelector(".results");
// These are the two buttons in the original HTML. Recipe-choice buttons are
// created later and removed whenever a new request starts.
const buttons = document.querySelectorAll("button");

// 2. RESPOND TO A SEARCH
// The submit event runs when the user clicks Search or presses Enter in the form.
searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Keep the form from reloading the page.
  // .value reads the input; .trim() removes surrounding whitespace.
  const searchTerm = searchInput.value.trim();
  // Spaces alone should not start a request. return exits this event handler.
  if (!searchTerm) {
    statusMessage.textContent = "Enter a dish name, such as pasta or curry.";
    searchInput.focus();
    return;
  }
  // encodeURIComponent() encodes spaces and special characters for a URL.
  // For "pasta", the full request URL will be:
  // https://www.themealdb.com/api/json/v1/1/search.php?s=pasta
  // "s" is the query parameter TheMealDB uses for a dish-name search.
  loadRecipe("search.php?s=" + encodeURIComponent(searchTerm));
});

// Both buttons use loadRecipe(). Only the endpoint (the URL's ending) changes.
// random.php asks the API to choose a single random meal.
surpriseButton.addEventListener("click", function () {
  loadRecipe("random.php", false);
});

// 3. REQUEST DATA ASYNCHRONOUSLY
// async allows us to use await inside this function.
// await pauses this function while a Promise is pending, not the whole browser.
// The page can still respond to other activity while the network request runs.
// showChoices defaults to true for searches. Pass false to open a meal directly.
async function loadRecipe(endpoint, showChoices = true) {
  // Show that work is in progress and hide the previous recipe.
  statusMessage.textContent = "Finding a little dinner inspiration…";
  recipe.hidden = true;
  // Clear the previous choices so they cannot select stale results while loading.
  recipeOptions.replaceChildren();
  recipeOptions.hidden = true;
  // aria-busy communicates the loading state to assistive technology.
  results.setAttribute("aria-busy", "true");
  // Disable both buttons to prevent overlapping requests.
  buttons.forEach(function (button) { button.disabled = true; });

  // try/catch lets us handle request or data-reading failures gracefully.
  try {
    // fetch() starts an HTTP request and returns a Promise.
    // This await gives us a Response object once the response is available.
    const response = await fetch(apiUrl + endpoint);
    // fetch() does not automatically throw for HTTP errors such as 404 or 500.
    // response.ok is true for a successful HTTP status (200-299).
    // Throwing here sends execution to the catch block below.
    if (!response.ok) {
      throw new Error("The API request failed.");
    }

    // Reading the response body also takes time, so we await it separately.
    // .json() reads JSON text and converts it into a JavaScript value.
    // This API returns an object whose "meals" property holds the results.
    const data = await response.json();
    // No matches is a valid response, not necessarily a network error.
    // Check for a missing/null meals value or an empty array before using [0].
    if (!data.meals || data.meals.length === 0) {
      statusMessage.textContent = "No recipe found. Try another dish, or let us surprise you.";
      return;
    }

    if (showChoices) {
      // Searches show every match, even when there is only one result.
      showRecipeOptions(data.meals);
      const label = data.meals.length === 1 ? " recipe found." : " recipes found.";
      statusMessage.textContent = data.meals.length + label + " Choose one below.";
    } else {
      // Random requests return one meal. [0] reads the first item in the array.
      showRecipe(data.meals[0]);
      statusMessage.textContent = "A little inspiration, served fresh.";
    }
  } catch (error) {
    // Show a helpful message on the page and technical details in the console.
    statusMessage.textContent = "We couldn't load a recipe. Check your connection and try again.";
    console.error(error);
  } finally {
    // finally runs on success, errors, and the early return for no results.
    // Restore the controls so the user can make another request.
    results.setAttribute("aria-busy", "false");
    buttons.forEach(function (button) { button.disabled = false; });
  }
}

// 4. BUILD A LIST OF RECIPE CHOICES
function showRecipeOptions(meals) {
  // forEach() runs this function once for each recipe returned by the API.
  meals.forEach(function (meal) {
    // Create a list item containing a real button, usable by mouse or keyboard.
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = meal.strMeal;
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
      // The search already returned the full recipe, so no second fetch is needed.
      showRecipe(meal);
      // Mark the chosen button and clear the selection on the other buttons.
      recipeOptions.querySelectorAll("button").forEach(function (choice) {
        choice.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
      statusMessage.textContent = "Showing " + meal.strMeal + ". Choose another recipe anytime.";
      // Move focus to the new recipe so keyboard and screen-reader users can read it.
      document.querySelector("#meal-name").focus();
    });

    item.append(button);
    recipeOptions.append(item);
  });
  recipeOptions.hidden = false;
}

// 5. UPDATE THE PAGE WITH THE API DATA
// "meal" is one recipe object. strMeal, strCategory, etc. are field names
// defined by TheMealDB; we use those exact names to read its data.
function showRecipe(meal) {
  // textContent replaces an element's text without treating it as HTML.
  document.querySelector("#meal-name").textContent = meal.strMeal;
  // || supplies fallback text if the API field is empty, null, or missing.
  document.querySelector("#meal-category").textContent = meal.strCategory || "Recipe inspiration";
  // Use the cuisine when present; otherwise display a general description.
  document.querySelector("#meal-area").textContent = meal.strArea ? "From the " + meal.strArea + " kitchen" : "From kitchens around the world";
  document.querySelector("#meal-instructions").textContent = meal.strInstructions || "No instructions are available for this recipe.";
  const image = document.querySelector("#meal-image");
  // src tells the browser which photo to load; alt describes the image.
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;
  // Reveal the populated card. No page reload is needed.
  recipe.hidden = false;
}

// 6. LOAD AN INITIAL RECIPE
// This runs once when the script reaches this line, without a button click.
// It uses the same request function as the search and Surprise Me buttons.
loadRecipe("search.php?s=Arrabiata", false);
