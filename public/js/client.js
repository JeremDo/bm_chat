
const colorList = ["orange", "brown", "blue", "darkBlue", "bmBlue", "red", "green", "violet", "teal", "purple", "lime", "amber", "cyan", "pink", "indigo", "darkGreen"];
const awayDelay = 5000;//300000;


$(document).ready(() => {

    feather.replace();

    if(typeof sessionStorage.getItem('pseudo') != "string"){
        window.location = './index.html';
    }
    if(sessionStorage.getItem('pseudo') != "jeremie"){
        $('.freeEdit').hide();
    }



    //récupère les couleurs
    getColors(function(){
        $('.actualColorPrev').addClass('bg-'+sessionStorage.getItem(sessionStorage.getItem('pseudo')));
    }); 
    colorList.forEach((elem) => {
        $('.availableColors').append($('<div data-color="'+elem+'"class="colorPrev bg-'+elem+'"></div>'))
    });
    //on attache un écouteur de click pour chaque item
    $('.colorPrev').each(function(){
        $(this).on('click', function(){
            pickedColor = $(this).attr('data-color');
            saveNewColor(pickedColor, sessionStorage.getItem('pseudo'))
        });
    });
    //si on clique sur le bouton envoyer pour valider l'envoie du message
    $('.sendButton').on('click',function(){
        var msg = $('#message').val();
        if(msg.length == 0){
            console.log('pas de message');
        }
        else{
            if($('#message').hasClass('lightbg-red')){
                $('#message').removeClass('lightbg-red');
            }
            sendMessage(msg, pseudo);
        }
        $('#message').val('');
    });

    $('.changeState').on('click', function(){
        if($(this).attr('data-state') == "absent"){
            $(this).attr('class', 'changeState');
            $(this).addClass('bg-green');
            $(this).html('Actif');
            $(this).attr('data-state', 'actif')
            updateState("absent")
        }
        else{
            $(this).attr('class', 'changeState');
            $(this).addClass('bg-red');
            $(this).html('Absent');
            $(this).attr('data-state', 'absent')
            updateState("actif")
        }
    })

    $('.insertBtn').each(function(){
        $(this).on('click', function(){
            type = $(this).attr('data-type');
            msg = $('#message').val();
            if(type == "img"){
                newMsg = msg+'[i]LIEN[i]';
                $('#message').val(newMsg);
                $('#message').focus();
            }
            else if(type == "lnk"){
                newMsg = msg+' [l]LIEN---PLACEHOLDER[l] ';
                $('#message').val(newMsg);
                $('#message').focus();
            }
            else if(type == "ret"){
                newMsg = msg+"\r\n[br]\r\n";
                $('#message').val(newMsg);
                $('#message').focus();
            }
            else if(type == "free"){
                if(sessionStorage.getItem('CLEANINPUT') == "1"){
                    sessionStorage.setItem('CLEANINPUT', "2");
                }
                newMsg = msg;
                $('#message').val(newMsg);
                $('#message').addClass('lightbg-red')
                $('#message').focus();
            }
            else if(type == "YT"){
                newMsg = msg+' [YT]LIEN[YT]';
                $('#message').val(newMsg);
                $('#message').focus();
            }
        });
    });

    //gestion des event clavier
    $(window).on('keydown', function(event){
        if(event.which === 13){ //si c'est la touche entrée
            event.preventDefault();
            event.stopPropagation();
            if($('#message').is(':focus')){ //si le textarea a le focus
                var msg = $('#message').val();
                if(msg.length == 0){ 
                    console.log('pas de message');
                }
                else{ //si le textarea n'est pas vide, on envoie le message et on vide le textarea
                if($('#message').hasClass('lightbg-red')){
                    $('#message').removeClass('lightbg-red');
                }
                    sendMessage(msg, pseudo);
                }
                $('#message').val('');
            }
            else{ //si le textarea n'a pas le focus, on lui donne
                $('#message').focus();
            }
        }
    });



    pseudo = sessionStorage.getItem('pseudo');
    var socket = io.connect('http://127.0.0.1:1337');
    sessionStorage.setItem("CLEANINPUT", "1");
    var data = {pseudo: sessionStorage.getItem('pseudo'), state: "actif"}
    socket.emit('nouveau_client', data); //on indique au serveur le nouveau client pour l'inclure dans la liste des connectes.
    //absTimer();
    //$('#message').on('keydown', relaunchTimer());
    //affiche les messages relayés par le serveur pour le chat
    socket.on('server', function(data){
        if(typeof data == "object"){
            $('.display').prepend($('<div class="chatMsg"><span class="sender '+sessionStorage.getItem(data.from)+'">'+ucFirst(data.from)+': </span><div class="msgContent lightbg-'+sessionStorage.getItem(data.from)+'">'+ucFirst(data.msg)+'</div></divp>'));
        }
        else{
            console.log(data);
        }
    });

    //recréé la liste des  connectés apres l'avoir recue du serveur
    socket.on('addUserInList', (connected, pseudo) => {
        $('.display').prepend($('<p class="system">'+ucFirst(pseudo)+' s\'est connecté</p>'));
        $('.nameList').html('');
        connected.forEach(function(elem){
            createUserItem(elem);
        });
    });

    //on recréé la liste des utilisateurs apres le départ d'un connecté
    socket.on('userLeft', (data) => {
        console.log(data)
        $('.display').prepend($('<p class="system">'+ucFirst(data.msg)+'</p>'));
        $('.nameList').html('');
        data.userList.forEach(function(elem){
            createUserItem(elem);
        });
    });

    //recréé la liste des connectés apres avoir mis a jour la liste suite au changement de couleur 
    socket.on('updatedList', function(connected, msg){
        $('.nameList').html('');
        getColors(function(){
            myColor = sessionStorage.getItem(sessionStorage.getItem('pseudo'));
            $('.actualColorPrev').attr('class', "actualColorPrev");
            $('.actualColorPrev').addClass('bg-'+myColor);
            connected.forEach(function(elem){
                createUserItem(elem);   
            });
            if(msg != null){
                $('.display').prepend($('<p class="system">'+ucFirst(msg)+'</p>'));
            }
        });
    });

    function sendMessage(msg, pseudo){
        if( sessionStorage.getItem('CLEANINPUT') == "1"){
            msg = cleanInput(msg);
            console.log('msg clean');
        }
        else{
            console.log("msg pas clean")
            sessionStorage.setItem('CLEANINPUT', "1")
        }
        socket.emit('message', pseudo, msg);
    }
    
    function getColors(callback){
        $.ajax({
            url: "./api.php?type=colors", method: 'get', 
            success: function (result) {
            res = JSON.parse(result);
            res.forEach(function(elem){
                sessionStorage.setItem(elem.pseudo, elem.color);
            });
            if(callback){
                callback();
            }
        }, error: function (error) {
            console.log(error);
        }});
    }

    function ucFirst(str) {
        if (str.length > 0) {
            return str[0].toUpperCase() + str.substring(1);
        } else {
            return str;
        }
    }

    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    function saveNewColor(color, pseudo){
        data = {color, pseudo};
        $.ajax({
            url: "./api.php?type=newColor", method: 'post', data: data, 
            success: function (result) {
                if(result != "La couleur n\'a pas pu être mise à jour."){
                    sessionStorage.setItem(sessionStorage.getItem('pseudo'), result)
                    socket.emit('refreshList');
                }
        }, error: function (error) {
            console.log(error);
        }});
    }

    const createUserItem = (elem) => {
        if(elem.state == "actif"){
            color = "bg-green";
        }
        else{
            color = "bg-red";
        }
        console.log(elem)
        $('.nameList').append($('<div class="nameItem ml-2 '+sessionStorage.getItem(elem.pseudo)+'"><div class="state '+color+'"></div><span>'+ucFirst(elem.pseudo)+'</span></div>'));
    }

    function updateState(state){
        pseudo = sessionStorage.getItem('pseudo');
        data = {pseudo: pseudo, state: state}
        socket.emit('updateState', data);
    };

    function absTimer(){
        socket.timer = setTimeout(function(){
            updateState("absent");
            socket.timer = null;
            absTimer();
        }, awayDelay);
    }

    function relaunchTimer(){
        socket.timer = null;
        socket.timer = setTimeout(updateState("absent"), awayDelay);
    }

});
