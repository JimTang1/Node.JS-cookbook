let ingredients = [];
let fuse;

$('#category').val($('#hvCategoryId').val());

function getAllIngredients() {
    $.ajax({
        cache: false,
        method: "get",
        url: "/admin/ajax",
        dataType: "json",
        data: {
            action: "getAllIngredients"
        },
        success: function (data) {
            ingredients = data;
            fuse = new Fuse(data, fuseOptions);
        }
    });
}

$('#ingredient').on('keyup mouseup', function () {
    if ($('#ingredient').val() == '') {
        $('#options').hide();
    } else {
        $('#options').show();
        const result = fuse.search($(this).val());
        showIngredients(result);
    }

});

$('body').on('click', '.ingredient', function () {
    $('#options').hide();
    $('#ingredient').val($(this).html());
    $('#ingredient-id').val($(this).data('id'));
});

$('body').on('click', function () {
    $('#options').hide();
});

function showIngredients(i) {
    $('#options').html();
    let html = '';
    if (i.item == undefined) {
        i.sort(function (a, b) {
            if (a.Name > b.Name) {
                return 1;
            } else if (b.Name > a.Name) {
                return -1;
            }
            return 0;
        });
    }
    $.each(i, function (k, v) {
        if (v.item != undefined) v = v.item;
        html += `<div id="i${v.Id}" class="ingredient" data-id="${v.Id}">${v.Name}</div>`
    });
    $('#options').html(html);
}

$('body').on('click', '.delete-ingredient', function () {
    let id = '#' + $(this).data('id');
    $(id).remove();
});

$('#addIngredient').click(function () {
    // Make sure the ingredient is valid
    $('#ingredient-id').val('0');
    $.each(ingredients, function (k, v) {
        if ($('#ingredient').val().toLowerCase() == v.Name.toLowerCase()) {
            $('#ingredient-id').val(v.Id);
        }
    });
    let error = false;
    if ($('#ingredient-id').val() == '0') {
        toastr.error(`You must select a valid ingredient from the list.`, 'Error');
        error = true;
    }
    if (isNaN($('#quantity').val()) || $('#quantity').val().trim() == '') {
        toastr.error(`You must enter the quantity as a decimal ie: 1/2 = .5`, 'Error');
        error = true;
    }
    if ($('#measurement').val() == '0') {
        toastr.error(`You must select a measurement.`, 'Error');
        error = true;
    }
    if (!error) {
        // Okay to proceed
        let time = Date.now();
        let html = `<div class="iTable" id="t${time}">
                <span class="quantity">${$('#quantity').val()}</span>
                <span class="measurement">${$('#measurement option:selected').text()}</span>
                <span class="ing">${$('#ingredient').val()}</span>
                <button type="button" class="delete-ingredient" data-id="t${time}"> X </button>
                <div class="recipe-ingredient" data-name="${$('#ingredient').val()}" data-quantity="${$('#quantity').val()}" data-measurement="${$('#measurement').val()}" data-ingredient="${$('#ingredient-id').val()}"></div>
            </div>`;
        $('#ingredientlist').append(html);
        $('#quantity').val('');
        $('#measurement').val('0');
        $('#ingredient').val('');
    }
});

$('#addupdate').click(function () {
    // Check for mission parts
    let error = false;
    if ($('#name').val().trim() == '' || $('#name').val().trim() == 'New Recipe') {
        toastr.error(`You must enter a valid recipe name.`, 'Error');
        error = true;
    }
    if ($('#category').val() == '0') {
        toastr.error(`You must select a subcategory.`, 'Error');
        error = true;
    }
    if ($('#ingredientlist').html().trim() == '') {
        toastr.error(`You must enter at least one ingredient.`, 'Error');
        error = true;
    }
    if ($('#directions').val().trim() == '') {
        toastr.error(`You must enter directions.`, 'Error');
        error = true;
    }
    if (!error) {
        // Build the ingredients
        let recipe_ingredients = []
        let ingredientsText = '';
        $.each($('.recipe-ingredient'), function () {
            let i = {
                IngredientId: $(this).data('ingredient'),
                Quantity: $(this).data('quantity'),
                MeasurementId: $(this).data('measurement'),
            }
            ingredientsText += $(this).data('name') + ' ';
            recipe_ingredients.push(i);
        });
        // Build the recipe
        let recipe = {
            Id: $('#recipeId').val(),
            Name: $('#name').val(),
            CategoryId: $('#category').val(),
            Ingredients: recipe_ingredients,
            Directions: $('#directions').val(),
            Description: $('#description').val(),
            PrepTime: $('#preptime').val(),
            CookTime: $('#cooktime').val(),
            Servings: $('#servings').val(),
            IngredientsText: ingredientsText
        }
        $('#recipe').val(JSON.stringify(recipe));
        $('#frmRecipe').submit();
    }
});

const fuseOptions = {
    includeScore: false,
    threshold: .3,
    keys: ['Name']
}
getAllIngredients();