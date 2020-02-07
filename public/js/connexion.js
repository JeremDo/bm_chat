$(document).ready(() => {
    $('#connSub').on('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if($('#pseudo').val() == "" || $('#pass').val() == ""){
            alert('Merci de remplir tous les champs');
        }
        else{
            pseudo =$('#pseudo').val();
            pass = $('#pass').val();
            data = {pseudo, pass};
            $.ajax({
                url: "./api.php?type=conn", method: 'post', data: data, 
                success: function (result) {
                res = JSON.parse(result);
                sessionStorage.setItem("pseudo", res[0].pseudo);
                window.location = './chat.html';
            }, error: function (error) {
                console.log(error);
                $('form').html('Erreur de login et/ou de mot de passe.');
            }});
        }
    })
});