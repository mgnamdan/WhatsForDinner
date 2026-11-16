# What's for Dinner?

A small classroom example of `fetch()`, `async` / `await`, JSON, and DOM updates. No frameworks, packages, or build step.

## Run it

Open `dist/index.html` with VS Code Live Server, or run `py -3.11 -m http.server 5500 --directory dist` from this folder and visit http://localhost:5500. An internet connection is needed for recipes and photos.

## Files

- `dist/index.html`: the page structure and an initially hidden recipe card.
- `dist/style.css`: responsive styling; independent of the API lesson.
- `dist/script.js`: events, a single async request function, and a function that updates the card.

## Walk through the JavaScript

1. The form handler prevents a reload and reads the search box.
2. `loadRecipe()` shows a loading message and disables buttons during the request.
3. `await fetch()` requests data. `response.ok` checks for an HTTP error.
4. `await response.json()` reads the JSON into a JavaScript object.
5. `data.meals[0]` selects the first matching recipe. Search can return several; the status tells the user when it does.
6. `showRecipe()` uses `textContent` and image properties to update the page.
7. `catch` handles network or response failures, and `finally` restores the buttons.

Open browser developer tools → Network → Fetch/XHR to inspect the request and response. Network throttling makes the loading state easier to see; offline mode demonstrates the error message. No artificial delay is added.

Try `pasta`, `curry`, an invented dish name, and the Surprise Me button. The initial request uses `Arrabiata`.

## Keep the first lesson small

The card shows the meal's name, photo, category, cuisine, and instructions. A separate ingredient list is intentionally left as an exercise: TheMealDB uses fields `strIngredient1`–`strIngredient20` with corresponding `strMeasure1`–`strMeasure20`. Other extensions: show all search matches, or add a recipe selector.

API documentation: https://www.themealdb.com/docs_api_guide.php. The key `1` is their public development/education test key, not a secret. For a public production app, consult their supporter-key requirements. Recipes and photography are provided by TheMealDB; no recipe data is bundled or fabricated.
