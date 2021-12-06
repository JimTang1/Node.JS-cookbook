
$('#btnAddMeasurement').click(function() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "addMeasurement",
            measurement: $('#measurement').val()
        },
        success: function (data) {
            console.log(data);
            toastr.success(`${data.Name} added.`, 'Success');
            $('#measurement').val('');
            getAllMeasurements();
        }
    });
});


function getAllMeasurements() {
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "getAllMeasurements"
        },
        success: function (measurements) {
            $('#measurements').html('');
            let html = '';
            $.each(measurements, function(k,v) {
                html += `<div id="i${v.Id}" class="measurement" data-id="${v.Id}">${v.Name}</div>`;
            });
            $('#measurements').html(html);
        }
    });       
}

$('body').on('click','.measurement',function() {
    // Determine if it is text or a textbox
    let measurement = $(this).html();
    let id = $(this).data('id');
    if (!measurement.includes("<input")) {
       $(this).html(`<input type="text" size="30" value="${measurement}" /><button class="updateMeasurement" data-id="${id}">Update</button>&nbsp;&nbsp;&nbsp;<button class="deleteMeasurement" data-id="${id}">Delete</button>`);
    }
});

$('body').on('click','.updateMeasurement',function() {
    let measurement = $(this).prev('input[type=text]').val();
    let id = $(this).data('id');
    $.ajax({
        cache: false,
        method: "get",
        url: "./ajax",
        dataType: "json",
        data: { 
            action: "updateMeasurement",
            id: id,
            name: measurement
        },
        success: function (measurement) {
            toastr.success(`${measurement.Name} updated.`, 'Success');
            getAllMeasurements();
        }
    });    
});

$('body').on('click','.deleteMeasurement',function() {
    let measurement = $(this).prev('input[type=text]').val();
    let id = $(this).data('id');
    let r = confirm("Are you sure you want to delete " + measurement + "?");
    if (r == true) {
        $.ajax({
            cache: false,
            method: "get",
            url: "./ajax",
            dataType: "json",
            data: { 
                action: "deleteMeasurement",
                id: id
            },
            success: function (data) {
                if(data.Message == "Success") {
                    toastr.success(`${data.Name} deleted.`, 'Success');
                    getAllMeasurements();        
                } else {
                    toastr.error(data.Message, 'Error');
                }
            }
        });         
    }
});

getAllMeasurements();