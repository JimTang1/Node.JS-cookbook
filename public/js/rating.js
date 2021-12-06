window.onload = (event) => {
    rating = parseFloat(document.getElementById("recipe-rating").textContent);
    rating = roundToHalf(rating)
    rating = rating * 2

    if (rating != 0){

        for( let i = 0; i < rating; i++){
            r = i + 1;
            let changeID = "rating" + r;
            document.getElementById(changeID).checked = true;    
        }
    }
    
};

function getRatingTest(rating){

    rating = roundToHalf(rating)
    rating = rating * 2

    if (rating != 0){

        for( let i = 0; i < rating; i++){
            r = i + 1;
            let changeID = "rating" + r;
            document.getElementById(changeID).checked = true;    
        }
    }
    
}


function roundToHalf(value) {
    var decimal = (value - parseInt(value, 10));
    decimal = Math.round(decimal * 10);
    if (decimal == 5) { return (parseInt(value, 10)+0.5); }
    if ( (decimal < 3) || (decimal > 7) ) {
       return Math.round(value);
    } else {
       return (parseInt(value, 10)+0.5);
    }
};

function sendRating(){

    let userRating;
    var ratings = document.getElementsByName("rating");
    var token = document.getElementById("_csrf").value;

    ratings.forEach((rating) => {
        if (rating.checked){
            userRating = rating.value;
            userRating = userRating / 2;
        }
    });

    if (userRating != undefined){
            $.ajax({
                cache: false,
                method: "post",
                url: "member/recipeRating",
                dataType: "json",
                data: { 
                    _csrf: token,
                    rating: userRating, 
                    id: $('#recipeIdData').val()
                },
                success: function (data) {
                }
            });   
    }  
}