<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST, PATCH, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$type = "mysql";
$user = "root";
$pwd = "";
$host = "127.0.0.1";
$db ="bm_chat";
$pdo = new PDO($type.":host=".$host.";dbname=".$db, $user,$pwd);

if(isset($_GET['type'])){
    switch($_GET['type']){
        case "conn":
        connectMe($pdo, $_POST['pseudo'], $_POST['pass']);
        break;
        case "colors":
        getColors($pdo);
        break;
        case "newColor":
        setColor($pdo, $_POST['pseudo'], $_POST['color']);
        break;
    }
}

function connectMe($pdo, $pseudo, $pass){
    if($pdo!=null){
        $result = $pdo->query("SELECT usr_pseudo as pseudo FROM users WHERE usr_pseudo='$pseudo' AND usr_pass='".sha1($pass)."' LIMIT 1");
        if($result->rowCount()==1){
            $data = $result->fetchAll(PDO::FETCH_ASSOC);
            $res = json_encode($data);
            echo $res;
        }
        else{
            echo "Identifiants inconnus";
        }
    }
}

function getColors($pdo){
    if($pdo != null){
        $result = $pdo->query("SELECT usr_pseudo as pseudo, usr_color as color FROM users");
        if($result->rowCount() >=1){
            $data = $result->fetchAll(PDO::FETCH_ASSOC);
            $res = json_encode($data);
            echo $res;
        }
        else{
            echo "Something went wrong somewhere";
        }
    }
}

function setColor($pdo, $pseudo, $color){
    if($pdo != null){
        $req = "UPDATE users SET usr_color = '$color' WHERE usr_pseudo = '$pseudo'";
        if($pdo->exec($req)){
            echo $color;
        }
        else{
            echo 'La couleur n\'a pas pu être mise à jour.';
        }
    }
    else{
        echo 'echec de la connexion à la base de données.';
    }
}