let ingredients = [];
let fuse;

$('#btnAddIngredient').click(function() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "addIngredient",
            ingredient: $('#ingredient').val()
        },
        success: function (ingredient) {
            toastr.success(`${ingredient.Name} added.`, 'Success');
            $('#ingredient').val('');
            ingredients.push (ingredient);
            fuse = new Fuse(ingredients, fuseOptions);
            showIngredients(ingredients);
        }
    });
});

$('body').on('click','.ingredient',function() {
    // Determine if it is text or a textbox
    let ingredient = $(this).html();
    if (!ingredient.includes("<input")) {
       $(this).html(`<input type="text" size="30" value="${ingredient}" /><button class="updateIngredient">Update</button>&nbsp;&nbsp;&nbsp;<button class="deleteIngredient">Delete</button>`);
    }
});

$('body').on('click','.updateIngredient',function() {
    let ingredient = $(this).prev('input[type=text]').val();
    let id = $(this).parent().data('id');
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "updateIngredient",
            id: id,
            name: ingredient
        },
        success: function (ingredient) {
            toastr.success(`${ingredient.Name} updated.`, 'Success');
            // Loop through ingredients and make the change
            $.each(ingredients, function(k,v) {
                if (v.Id == ingredient.Id) {
                    ingredients[k] = ingredient;
                }
            });
            fuse = new Fuse(ingredients, fuseOptions);
            showIngredients(ingredients);
        }
    });    
});

$('body').on('click','.deleteIngredient',function() {
    let ingredient = $(this).prev('input[type=text]').val();
    let id = $(this).parent().data('id');
    let r = confirm("Are you sure you want to delete " + ingredient + "?");
    if (r == true) {
        $.ajax({
            cache: false,
            method: "get",
            url: "./ajax",
            dataType: "json",
            data: { 
                action: "deleteIngredient",
                id: id
            },
            success: function (data) {
                if(data.Message == "Success") {
                    toastr.success(`${data.Name} deleted.`, 'Success');
                    // Loop through ingredients and make the change
                    let index = -1;
                    $.each(ingredients, function(k,v) {
                        if (v.Id == data.Id) {
                            index = k;
                        }
                    }); 
                    if (index > -1) {
                        ingredients.splice(index, 1);
                    }
                    fuse = new Fuse(ingredients, fuseOptions);
                    showIngredients(ingredients);          
                } else {
                    toastr.error(data.Message, 'Error');
                }
            }
        });         
    }
});

function showIngredients(i) {
    $('#ingredients').html();
    let html = '';
    if(i.item == undefined) {
        i.sort(function(a, b) {
            if (a.Name > b.Name) {
                return 1;
            } else if (b.Name > a.Name) {
                return -1;
            }
            return 0;
        });
    }
    $.each(i, function(k,v) {
        if (v.item != undefined) v=v.item;
        html += `<div id="i${v.Id}" class="ingredient" data-id="${v.Id}">${v.Name}</div>`
    });
    $('#ingredients').html(html);
}

$('#ingredient').on('keyup mouseup', function() {
    if ($('#ingredient').val() == '') {
        showIngredients(ingredients);
    } else {
        const result = fuse.search($(this).val());
        showIngredients(result);
    }
    
});

function getAllIngredients() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "getAllIngredients"
        },
        success: function (data) {
            ingredients = data;
            fuse = new Fuse(data, fuseOptions);
            showIngredients(ingredients);
        }
    });       
}

const fuseOptions = {
    includeScore: false,
    threshold: .3,
    keys: ['Name']
}
  
  


getAllIngredients();