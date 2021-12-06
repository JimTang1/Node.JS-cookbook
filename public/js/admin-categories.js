
$('#btnAddCategory').click(function() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "addCategory",
            category: $('#category').val(),
            parentId: $('#selCategories').val()
        },
        success: function (data) {
            toastr.success(`${data.category.Name} added.`, 'Success');
            $('#category').val('');
            loadRootCategories();
            getAllCategories();
        }
    });
});

function loadRootCategories(cats) {
    if(!cats) {
        $.ajax({
            cache: false,
            method: "get",
            url: "./ajax",
            dataType: "json",
            data: { 
                action: "getRootCategories"
            },
            success: function (categories) {
                buildRootCategories(categories)
            }
        });       
    } else {
        buildRootCategories(cats)
    }
}

function buildRootCategories(cats) {
   //Clear the select box
   $('#selCategories').html('<option value="0">Root Category</option>');
   $.each(cats, function(k,v) {
       if(v.ParentId == 0) {
            $('#selCategories').append(`<option value="${v.Id}">${v.Name}</option>`);
       }
   });
}

function getAllCategories() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "getAllCategories"
        },
        success: function (categories) {
            $('#categories').html('');
            $.each(categories, function(k,v) {
                $('#categories').append(`${v.Name}<br>`);
                $.each(v.subcategories, function(k2,v2) {
                    $('#categories').append(`----- ${v2.Name}<br>`);
                });
            });
        }
    });       
}


loadRootCategories();

getAllCategories();