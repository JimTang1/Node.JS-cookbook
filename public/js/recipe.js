const getRecipe = (btn) => {
    let recipeId = btn.parentNode.querySelector("[name=recipeId]").value;
    let csrf = btn.parentNode.querySelector("[name=_csrf]").value;
    
    fetch("/recipe/" + recipeId, {
        method: "POST",
        headers: {
            'csrf-token': csrf,
            'Content-Type': 'application/json'
        }
    }).then(result => result.json())
    .then(data => {
        if (data.recipe) {
            // Set up new recipe data on page.
            // name, rating, image, basic info (prep time, cook time, servings), buttons, description, ingredients, steps
            
            // Change name
            document.getElementById("recipe-name").innerHTML = data.recipe.Name;

            // Change rating
            document.getElementById("recipe-rating").innerHTML = "Rating " + data.recipe.Rating + "/5";
            getRatingTest(data.recipe.Rating);

            //change image
            document.getElementById("recipe-image").src = data.hostName + data.recipe.ImageUrl;

            // change basic info
            document.getElementById("base-recipe-info").innerHTML = "Servings: " + data.recipe.Servings + " | Prep-Time: " +
                data.recipe.PrepTime + " | Cook-Time: " + data.recipe.CookTime;

            // change button recipe id
            document.getElementById("recipeIdData").value = data.recipe.Id;

            // change description // Currently not used
            //document.getElementById("recipe-description").innerHTML = data.recipe.Description;

            // change ingredients
            let tempHTML = "";

            data.recipe.Ingredients.forEach(ingredient => {
                tempHTML += '<div class="recipe-ingredient">' + ingredient.Quantity + " " + ingredient.Measurement + " " +
                    ingredient.Ingredient.toLowerCase() + '</div>';
            });

            document.getElementById("recipe-ingredients").innerHTML = tempHTML;

            // change steps.
            tempHTML = "<h4>Steps</h4>";

            for (direction of data.recipe.Directions.split('\n\n')) {
                tempHTML += '<div class="recipe-items-list">' + direction + '</div><br>';
            }

            document.getElementById("recipe-steps").innerHTML = tempHTML;

            // change copy recipe button. Currently unused.
            //document.getElementById("copy-recipe-btn").href = "recipe/builder?id=" + data.recipe.Id;
        } else {
            // Display error about recipe not being retrieved.
            console.log("Recipe was not retrieved. " + data.message);
        }
    }).catch(err => {
        console.log("Issue attempting to get copy. " + err);
    });
}

/*const createRecipeCopy = (btn) => {
    let recipeId = btn.parentNode.parentNode.querySelector("[name=recipeId]").value;
    
    fetch("/member/create-recipe-copy/" + recipeId, {
        method: "PUT",
        headers: {
            //
        }
    }).then(result => {
        if (result.copyCreated) {
            // Indicate recipe was added.
            console.log("Copy was created and added to book.");
        } else {
            // Indicate recipe was NOT deleted.
            console.log("Copy was not created. " + result.message);
        }
    }).catch(err => {
        console.log("Issue attempting to create copy.");
        if (result.copyCreated) {
            console.log("Copy was created, but could not be saved to your cookbook.");
        }
    });
}*/


const addRecipeToCookbook = (btn) => {
    let recipeId = btn.parentNode.parentNode.querySelector("[name=recipeId]").value;
    let csrf = btn.parentNode.parentNode.querySelector("[name=_csrf]").value;
    
    fetch("/member/add-to-cookbook/" + recipeId, {
        method: "PUT",
        headers: {
            'csrf-token': csrf,
            'Content-Type': 'application/json'
        }
    }).then(result => result.json())
    .then(data => {
        if (data.addedToBook) {
            // Indicate recipe was added.
            console.log("Recipe was added.");
        } else {
            // Indicate recipe was NOT deleted.
            console.log("Recipe was not added to book. " + data.message);
        }
    }).catch(err => {
        console.log("Issue attempting to add recipe to cookbook.");
    });
}


const removeRecipe = (btn) => {
    let recipeId = btn.parentNode.parentNode.querySelector("[name=recipeId]").value;
    let csrf = btn.parentNode.parentNode.querySelector("[name=_csrf]").value;
    
    fetch("/member/remove-from-cookbook/" + recipeId, {
        method: "GET",
        headers: {
            'csrf-token': csrf,
            'Content-Type': 'application/json'
        }
    }).then(result => result.json())
    .then(data => {
        if (data.removedFromBook) {
            // Indicate recipe was added.
            console.log("Recipe was removed.");
        } else {
            // Indicate recipe was NOT deleted.
            console.log("Recipe was not removed from book. " + data.message);
        }
    }).catch(err => {
        console.log("Issue attempting to remove recipe from cookbook.");
    });
}


const deleteRecipe = (btn) => {
    let recipeId = btn.parentNode.parentNode.querySelector("[name=recipeId]").value;
    let csrf = btn.parentNode.parentNode.querySelector("[name=_csrf]").value;
    
    fetch("/member/delete-recipe/" + recipeId, {
        method: "GET",
        headers: {
            'csrf-token': csrf,
            'Content-Type': 'application/json'
        }
    }).then(result => result.json())
    .then(data => {
        if (data.couldDelete) {
            location.assign('/member/');
            // Indicate recipe was deleted.
        } else {
            // Indicate recipe was NOT deleted.
            console.log("Recipe was not deleted. " + data.message);
        }
    }).catch(err => {
        console.log("Issue attempting to delete recipe. " + err);
    });
}