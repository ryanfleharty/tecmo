document.getElementById("start-button").addEventListener("click", function(){
    document.getElementById("start-button").remove();
    setUpPlay();
})
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const game = {
    "players": [],
    "offense": [],
    "defense": [],
    "ballCarrier" : null,
    "eligibleReceivers": [],
    "targetedReceiver": null,
    "ballIsThrown": false,
    "playIsChosen": false,
    "endZoneLocation": 2250,
    "down": 1,
    "yardsToGo": 10,
    "keysPressed": [],
    "throwButton": 83, //the throw button is "s"
    "changeReceiverButton" : 65, // the change receiver button is "a"
    "frameRate" : 50,
}
//PLAYER CLASSES. Offense detects collisions.
class Player{
    constructor(x,y, speed, name, position){
        this.xCoordinate = x;
        this.yCoordinate = y;
        this.speed = speed;
        game.players.push(this);
        this.name = name;
        this.width = 25;
        this.height = 25;
        this.position = position;
    }
    render(){
        ctx.beginPath();
        ctx.rect(this.xCoordinate - this.width/2, this.yCoordinate + this.height/2, this.width, this.height)
        if(this.side == "offense"){
            ctx.fillStyle = "orange";
        } else {
            ctx.fillStyle = "brown";
        }
        ctx.fill()
        ctx.closePath();
        //SHOW THE BALLCARRIER WITH THE BALL
        if(game.ballCarrier == this){
            ctx.beginPath();
            ctx.rect(game.ballCarrier.xCoordinate, game.ballCarrier.yCoordinate, 10, 10);
            ctx.fillStyle = "brown"
            ctx.fill()
            ctx.closePath();
        }
    }
    move(direction){
        if(direction == "right"){
            if(this == game.ballCarrier && (game.keysPressed.includes(38) || game.keysPressed.includes(40))){
                this.xCoordinate += this.speed / 1.5
                scrimmage += this.speed / 1.5;
            } else {
                this.xCoordinate += this.speed;
                if(this == game.ballCarrier){
                    scrimmage += this.speed;
                }
            }
        } else if(direction == "left"){
            this.xCoordinate -= this.speed;
            if(this == game.ballCarrier){
                scrimmage -= this.speed;
            }
        } else if(direction == "up"){
            this.yCoordinate += this.speed;
        } else if(direction == "down"){
            this.yCoordinate -= this.speed;
        }
    }
}
class OffensivePlayer extends Player {
    constructor(x,y,speed,name, position){
        super(x,y,speed,name, position);
        game.offense.push(this);
        this.canBlock = true;
        this.side = "offense";
    }
    detectCollision(){
        game.defense.forEach((player)=>{
            if(player.xCoordinate - player.width/2 <= this.xCoordinate + this.width/2 && this.xCoordinate - this.width/2 <= player.xCoordinate + player.width/2 ){
                if(player.yCoordinate - player.width/2 <= this.yCoordinate + this.width/2 && this.yCoordinate - this.width/2 <= player.yCoordinate + player.width/2 ){
                    if(this == game.ballCarrier){
                        ballCarrierIsTackled();
                    }else if(!player.blocked && !this.blocking && this.canBlock){
                        this.block(player);
                    }
                } 
            }
        })
    }
    runRoute(){
        const runningRoute = setInterval(()=>{
            if(ballInPlay && game.ballCarrier != game.targetedReceiver){
                this.move("right");
            } else {
                clearInterval(runningRoute);
            }
        }, game.frameRate)
    }
    block(player){
        player.blocked = true;
        this.blocking = true;
        setTimeout(()=>{
            player.blocked = false;
            this.blocking = false;
            this.canBlock = false;
        }, 2000)
        setTimeout(()=>{
            this.canBlock = true;
        }, 4000)
    }

}
class DefensivePlayer extends Player {
    constructor(x, y, speed, name, position){
        super(x, y, speed, name, position);
        game.defense.push(this);
        this.side = "defense";
    }
    pursueBallCarrier(){
        if(!this.blocked){
            if(game.ballCarrier.xCoordinate < this.xCoordinate - 2){
                this.xCoordinate -= this.speed;
            } else if(game.ballCarrier.xCoordinate > this.xCoordinate + 2) {
                if(game.keysPressed.includes(38) || game.keysPressed.includes(40)){
                    this.xCoordinate += this.speed / 2.25;
                    if(Math.random() >= .5){ //defenders have a random speed boost
                        this.xCoordinate += this.speed * .5;
                    }
                } else {
                    if(Math.random() >= .5){ //defenders have a random speed boost
                        this.xCoordinate += this.speed * .75;
                    }
                    this.xCoordinate += this.speed;
                }  
            }
            if(game.ballCarrier.yCoordinate < this.yCoordinate - 2){
                this.yCoordinate -= this.speed;
            } else if(game.ballCarrier.yCoordinate > this.yCoordinate + 2){
                this.yCoordinate += this.speed;
            }
        }
    }
}
//CREATE PLAYERS
const deionSanders = new DefensivePlayer(600, 600, 7, "deion sanders", "cb");
const brianUrlacher = new DefensivePlayer(500, 500, 5, "brian urlacher", "lb");
const jamesHarrison = new DefensivePlayer(400, 500, 6, "james harrison", "olb")
const fatAss = new DefensivePlayer(500, 400, 2, "fatass", "de");
const fatAss2 = new DefensivePlayer(500, 300, 2, "fatass", "de2");
const galeSayers = new OffensivePlayer(100,250, 8, "gale sayers", "rb")
const zachMartin = new OffensivePlayer(200, 400, 4, "Zach Martin", "lt");
const tyronSmith = new OffensivePlayer(200, 400, 4, "Tyron smith", "rt");
const maurkicePouncey = new OffensivePlayer(200, 400, 4, "Maurkice Pouncey", "c");
const julioJones = new OffensivePlayer(175, 600, 7, "JULIO JONES", "wr");
const drewBrees = new OffensivePlayer(150, 500, 4, "drew brees", "qb");
game.targetedReceiver = julioJones;
game.ballCarrier = drewBrees;
let playProceeds = null;
let ballInPlay = false;
let scrimmage = 280;
// KEY PRESS EVENT LISTENERS
addEventListener("keydown", (e)=>{
    if(!game.keysPressed.includes(e.which) && 36 < e.which < 41){
        game.keysPressed.push(e.which);
    }
    if(e.which == 32){ //snap the ball!!! play starts logic here.
        e.preventDefault();
        if(!ballInPlay && game.playIsChosen){
            snapTheBall();
        }
    } else if(e.which == game.throwButton && ballInPlay && game.ballCarrier.position == "qb"){ //THROW THE BALL 
        throwBall();
    } else if(e.which == game.changeReceiverButton && ballInPlay){ //CHANGE RECEIVER
        let receiverIndex = game.eligibleReceivers.indexOf(game.targetedReceiver);
        if(receiverIndex == game.eligibleReceivers.length - 1){
            game.targetedReceiver = game.eligibleReceivers[0];
        } else {
            game.targetedReceiver = game.eligibleReceivers[receiverIndex+1]
        }
    }
})
addEventListener("keyup", (e)=>{
    game.keysPressed.splice(game.keysPressed.indexOf(e.which), 1);
})
//DEFINE ANIMATION FUNCTIONS
function drawField(){
    let startingLine = canvas.width/2 - scrimmage;
    let tenYards = 195;
    ctx.beginPath();
    ctx.rect(0, 0, tenYards - scrimmage + 300, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
    // DRAW GREEN FIELD AND WHITE LINES
    for(let i = 0; i < 20; i++){
        ctx.beginPath();
        ctx.rect(startingLine, 0, tenYards, canvas.height);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
        startingLine += tenYards;
    
        ctx.beginPath();
        ctx.rect(startingLine, 0, 5, canvas.width);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
        startingLine += 5;
    }
    // DRAW YARD LINES
    let yardLine = 5;
    for(let i = canvas.width/2 - scrimmage + 200; i < 2400; i+= 200){
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(yardLine, i, 50);
        yardLine += 5;
        ctx.closePath();
    }


    ctx.beginPath();
    ctx.rect(startingLine, 0, tenYards * 3, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
    if(game.ballIsThrown){
        ctx.beginPath()
        ctx.fillStyle = "brown"
        ctx.arc(game.ballXCoordinate, game.targetedReceiver.yCoordinate, 10, 0, 2*Math.PI)
        ctx.fill();
        ctx.closePath()
    }
}
function drawAll(){
    ctx.clearRect(0, 0, canvas.width+scrimmage, canvas.height);
    if(scrimmage - game.playStartedAt > 250 ){
        if(game.ballCarrier){
            ctx.translate(-game.ballCarrier.speed, 0);
            game.playStartedAt += game.ballCarrier.speed
        } else {
            ctx.translate(-3, 0);
            game.playStartedAt += 3;
        }
        
    }
    console.log("DRAWING EVERTYTHING");
    console.log(scrimmage);
    drawField();
    game.keysPressed.forEach(function(keyCode){
        activateMovement(keyCode);
    })
    game.players.forEach(function(player){
        player.render();
    });
    game.offense.forEach(function(player){
        player.detectCollision();
    })
    game.defense.forEach(function(player){
        player.pursueBallCarrier();
    })
    //ARROW OVER SELECTED RECEIVER
    highlightSelectedReceiver();
    //CHECK FOR TOUCHDOWN
    if(game.ballCarrier.xCoordinate >= game.endZoneLocation){
        touchDown();
        console.log("TOUCHDOWN!!!!")
    }
}
function activateMovement(keyCode){
    if(!game.ballIsThrown){
        if(keyCode == 39){
            game.ballCarrier.move("right");
        }
        if(keyCode == 37){
            game.ballCarrier.move("left");
        }
        if(keyCode == 38){
            game.ballCarrier.move("down")
        }
        if(keyCode == 40){
            game.ballCarrier.move("up")
        }
    }

}
//DEFINE GAME FUNCTIONS
function setUpPlay(){
    game.ballCarrier = drewBrees;
    resetPlayerAttributes();
    choosePlay(function(offensiveFormation){
        console.log("PLAY IS CHOSEN");
        console.log(offensiveFormation);
        resetFormations(offensiveFormation);
        drawAll();
    });
}
function snapTheBall(){
    game.ballCarrier = drewBrees;
    game.startingYard = scrimmage;
    game.playStartedAt = scrimmage;
    playProceeds = setInterval(drawAll, game.frameRate)
    ballInPlay = true;
    game.offense.forEach((player)=>{
        if(player.position == "rb" || player.position == "wr"){
            game.eligibleReceivers.push(player);
        }
    })
    julioJones.runRoute();
}
function throwBall(){
        game.ballXCoordinate = game.ballCarrier.xCoordinate;
        game.ballIsThrown = true;
        game.ballCarrier = null;
        const ballInFlight = setInterval(()=>{
            game.ballXCoordinate += 10
            scrimmage += 10
            if(game.ballXCoordinate >= game.targetedReceiver.xCoordinate){
                clearInterval(ballInFlight);
                scrimmage = game.targetedReceiver.xCoordinate;
                game.ballCarrier = game.targetedReceiver;
                game.ballIsThrown = false;
            }
        },20)
}
function ballCarrierIsTackled(){
    clearInterval(playProceeds);
    calculateAndDisplayDown();
    game.playIsChosen = false;
    game.playEndedAt = game.ballCarrier.xCoordinate;
    let yardsGained = game.playEndedAt - game.playStartedAt;
    ballInPlay = false;
    scrimmage = game.ballCarrier.xCoordinate;
    ctx.translate(-yardsGained, 0)
    setTimeout(setUpPlay, 1000)
}
function calculateAndDisplayDown(){
    game.endingYard = game.ballCarrier.xCoordinate;
    game.yardsToGo = Math.ceil(game.yardsToGo - (game.endingYard - game.startingYard) / 20);
    if(game.yardsToGo < 1){
        game.yardsToGo = 10;
        game.down = 1;
    } else {
        game.down++;
    }
    game.currentYardLine = Math.floor((game.ballCarrier.xCoordinate - 240 ) / 20)
    $('#score-board').text(`${game.down} DOWN AND ${game.yardsToGo} YARDS TO GO FROM THE ${game.currentYardLine}`)
}
function touchDown(){
    clearInterval(playProceeds);
    game.playEndedAt = scrimmage;
    ballInPlay = false;
    $('#score-board').text("TOUCHDOWN!!!")
}
function resetFormations(offensiveFormation){
    let formation2 = {
        "de": { x: scrimmage + 50, y: canvas.height/2 + 50},
        "lb": { x: scrimmage + 100, y: canvas.height/2},
        "de2": { x: scrimmage + 50, y: canvas.height/2 - 50}, 
        "cb": { x: scrimmage + 125, y: canvas.height/2 + 200},
        "olb": { x: scrimmage + 100, y: canvas.height/2 + 100}
    }
    setOffensiveFormation(offensiveFormation);
    setDefensiveFormation(formation2);
}
function resetPlayerAttributes(){
    game.defense.forEach((player)=>{
        player.blocked = false;
    })
    game.offense.forEach((player)=>{
        player.blocking = false;
    })
}
function setOffensiveFormation(formation){
    game.offense.forEach((player)=>{
        let position = player.position;
        player.xCoordinate = formation[position]["x"];
        player.yCoordinate = formation[position]["y"];
        if(player.position == "wr"){
            game.targetedReceiver = player;
        }
    })
}
function setDefensiveFormation(formation){
    game.defense.forEach((player)=>{
        let position = player.position;
        player.xCoordinate = formation[position]["x"];
        player.yCoordinate = formation[position]["y"];
    })
}
function highlightSelectedReceiver(){
    if(game.ballCarrier.position == "qb"){
        ctx.beginPath();
        ctx.rect(game.targetedReceiver.xCoordinate, game.targetedReceiver.yCoordinate - game.targetedReceiver.height, 10, 10);
        ctx.fillStyle = "yellow"
        ctx.fill()
        ctx.closePath();
    }
}
function choosePlay(callback){
    $('body').append("<div class='play-choices'><button play='one'>Pass 1</button><button play='two'>Play 2</button></div>");
    $('canvas').hide();
    $('.play-choices button').click(function(){
        $('.play-choices').remove()
        let formationChoice = $(this).attr("play");
        $('canvas').show()
        game.playIsChosen = true;
        if(formationChoice == "one"){
            callback({
                "rb": {x: scrimmage - 50, y: canvas.height/2 - 50},
                "wr": {x: scrimmage, y: canvas.height - 50},
                "lt": {x: scrimmage, y: canvas.height/2 + 50},
                "c": {x: scrimmage, y: canvas.height/2},
                "rt": {x: scrimmage, y: canvas.height/2 - 50},
                "qb": {x: scrimmage - 75, y: canvas.height/2}
            })
        } else if(formationChoice == "two"){
            callback({
                "rb": {x: scrimmage, y: canvas.height/2 - 150},
                "wr": {x: scrimmage, y: canvas.height - 50},
                "lt": {x: scrimmage, y: canvas.height/2 + 50},
                "c": {x: scrimmage, y: canvas.height/2},
                "rt": {x: scrimmage, y: canvas.height/2 - 50},
                "qb": {x: scrimmage - 100, y: canvas.height/2}
            })
        }
    })
}
