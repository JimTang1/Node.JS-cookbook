$('.makeAdmin').click(function() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "makeAdmin",
            id: $(this).data('id')
        },
        success: function (data) {
            location.reload();
        }
    });      
});

$('.removeAdmin').click(function() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "removeAdmin",
            id: $(this).data('id')
        },
        success: function (data) {
            location.reload();
        }
    }); 
});