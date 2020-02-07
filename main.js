const app = require("express")();
const server = require("http").createServer(app);
const fs = require('fs');
const io = require("socket.io")(server, {origins:'127.0.0.1:*'});
server.listen(1337);

var connected = [];

io.on('connection', function (socket) {
    socket.on('message', function (from, msg) {
        msg = formatMsg(msg);
        io.emit('server', {
            from: from,
            msg: msg
        });
    });

    //On gere les nouveaux arrivants
    socket.on('nouveau_client', function(data){
        connected.push(data); //on l'ajoute a la liste des participants pour la liste des utilisateurs 
        socket.pseudo = data.pseudo; //on stock son pseudo
        io.emit('addUserInList', connected, socket.pseudo);//on renvoie le tout au client
    });

    //On gère les déconnexion
    socket.on('disconnect', function() {
        var ind = findSocketIndex(connected, socket.pseudo);
        connected.splice(ind, 1);
        io.emit('userLeft', {
            msg:  socket.pseudo+' s\'est déconnecté', //message de déconnexion
            userList: connected //Liste  des users
        })
    });

    socket.on('refreshList', function(){
        msg = null;
        io.emit('updatedList', connected, msg);
    });

    socket.on('updateState', function(data){
        var ind = findSocketIndex(connected, socket.pseudo);
        connected[ind] = data;
        console.log(connected)
        msg = socket.pseudo+" est maintenant "+connected[ind].state;
        io.emit('updatedList', connected, msg);
    });

    const findSocketIndex = (array, target) => {
        var userIndex = 0;
        array.forEach(function(elem, i){
            if(elem.pseudo == target){
                userIndex = i;
            }
        });
        return userIndex;
    }

    function formatMsg(msg){
        msgBr = msg.split('[br]');
        if(msgBr.length > 1){
            msg = msgBr.join('<br>');
        }
        msgImg = msg.split('[i]')
        if(msgImg.length > 1){
            msgImg.forEach(function(elem, i){
                if(i % 2 == 1){
                    msgImg[i] = '<div class="ytWrapper"><img class="img-fluid" src="'+elem+'"></div>';
                }
            });
            msg = msgImg.join('');
        }
        msgLnk = msg.split('[l]')
        if(msgLnk.length > 1){
            msgLnk.forEach(function(elem, i){
                if(i % 2 == 1){
                    tmpCut = elem.split('---');
                    if(tmpCut.length > 1){
                        msgLnk[i] = ' <a href="'+tmpCut[0]+'" target="__blank">&#9654 '+tmpCut[1]+' &#9664</a> '
                    }
                    else{
                        msgLnk[i] = ' <a href="'+elem+'" target="__blank"b>&#9654 lien &#9664</a> '
                    }
                }
            });
            msg = msgLnk.join('');
        }
        msgYt = msg.split('[YT]');
        if(msgYt.length > 1){
            msgYt.forEach(function(elem, i){
                if(i % 2 == 1){
                    if(elem.search('youtube') == "-1" && elem.search('youtu.be') == "-1"){ 
                        msgYt[i] = '<div class="ytWrapper"><iframe width="560" height="315" src="'+elem+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
                    }
                    else{
                        testEmbed = elem.search("embed");
                        if(testEmbed != "-1"){
                            msgYt[i] = '<div class="ytWrapper"><iframe width="560" height="315" src="'+elem+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
                        }
                        else{
                            testWatch = elem.search('watch');
                            if(testWatch != '-1'){
                                tmpElem = elem.split('watch?v=');
                                elem = tmpElem.join('embed/');
                                msgYt[i] = '<div class="ytWrapper"><iframe width="560" height="315" src="'+elem+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
                            }
                            else{
                                testYoutu = elem.search('youtu.be');
                                if(testYoutu != "-1"){
                                    tmpElem = elem.split('/')
                                    elem = "https://www.youtube.com/embed/"+tmpElem[tmpElem.length -1];
                                    msgYt[i] = '<div class="ytWrapper"><iframe width="560" height="315" src="'+elem+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
                                }
                            }
                        }
                    }
                }
            });
            msg = msgYt.join('');
        }
        return msg;
    }
});

