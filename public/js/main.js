//toggleMenu function
const menuToggle = document.getElementById('nav_items');
const menuList = document.getElementById('nav_menu');

function toggleMenu() {
    if (menuToggle.classList.contains("show")) {
        menuToggle.classList.toggle("hide");
        menuToggle.classList.remove("show");
        menuList.classList.toggle("hide");
        menuList.classList.remove("show");
    } else {
        menuToggle.classList.toggle("show");
        menuToggle.classList.remove("hide");
        menuList.classList.toggle("hide");
        menuList.classList.remove("show");
    }
}

// document.getElementById('nav_button').addEventListener('click', toggleMenu());

$('.main_category').click(function () {
    let id = $(this).data('id');
    let sc = $('#subcat' + id);
    $(sc).toggle();
});