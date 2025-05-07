const BOARD_SIZE = 20;
const cellSize = calculateCellSize();
let board;
let player;
let ghosts = [];
let ghostSpeed = 2149;
let  isGameRunning = false;
let ghostInterval;
let score = 0;
let ghostNumber = 1;

document.getElementById('intro-screen').addEventListener('click',startGame)
document.addEventListener('keydown',(event)=>{
    if(!isGameRunning){
        return;
    }
    switch(event.key){
        case 'ArrowUp':
            player.move(0,-1);//liikutaan ylöspäin
        break;

        case 'ArrowDown':
            player.move(0, 1);
        break;

        case 'ArrowLeft':
            player.move(-1, 0);
        break;

        case 'ArrowRight':
            player.move(1,0);
        break;  
        
        case'w':
            shootAt(player.x,player.y -1);
        break;

        case's':
            shootAt(player.x, player.y + 1)
        break;

        case 'a':
            shootAt(player.x - 1, player.y);
        break;

        case 'd':
            shootAt(player.x + 1, player.y);
        break;

            
    }
    event.preventDefault();
})

function startGame(){
    console.log('Klikattu')
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    player = new Player(0,0);
    
    board = generateRandomBoard();

    drawBoard(board);

    setTimeout(()=>{
        ghostInterval = setInterval(moveGhosts,ghostSpeed);
    }, 1000);

    isGameRunning = true;
    score = 0
    updateScoreBoard(0);
}

function generateRandomBoard(){
    const newBoard = Array.from({length:BOARD_SIZE},()=>Array(BOARD_SIZE).fill(''));

    for(let y = 0; y <BOARD_SIZE; y++){
        for(let x = 0; x <BOARD_SIZE; x++){
            if(y === 0 || y === BOARD_SIZE -1 || x === 0 || x === BOARD_SIZE -1 ){
                    newBoard[y][x] = 'W'; //W tarkoittaa seinää
                }
            }
        }
    

    console.log(newBoard);
    generateObstacles(newBoard);

    const [playerX, playerY] = randomEmptyPosition(newBoard);
    setCell(newBoard,playerX,playerY, 'P');
    player.x = playerX
    player.y = playerY

    ghosts = [];
    for(let i = 0; i < ghostNumber; i++){
        const [ghostX, ghostY] = randomEmptyPosition(newBoard);
        setCell(newBoard,ghostX, ghostY, 'G');
        ghosts.push(new Ghost(ghostX,ghostY));
    }
    
    return newBoard;

}

function drawBoard(board){
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;
    gameBoard.innerHTML = "";

    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.width = cellSize + "px"
            cell.style.height = cellSize + "px"
            if(getCell(board,x,y) === 'W'){
                cell.classList.add('wall');
                }else if (getCell(board,x,y) === 'P'){
                    cell.classList.add('player');
                }else if(getCell(board,x,y) === 'G'){
                    cell.classList.add('ghost');
                    
            }
            else if (getCell(board,x,y)==='B'){
                cell.classList.add('bullet');
                setTimeout(()=>{
                    setCell(board,x,y,'');
                    drawBoard(board);
                },400);
            }

            gameBoard.appendChild(cell);
        }  
    }
}


function getCell(board,x,y){
    return board[y][x];
}

function calculateCellSize(){
    const screenSize = Math.min(window.innerWidth,window.innerHeight);
    const gameBoardSize = 0.95 * screenSize;
    return gameBoardSize / BOARD_SIZE;

}

function generateObstacles(board){

    const obstacles = [
        [[0,0],[0,1],[1,0],[1,1]], //neliö
        [[0,0],[0,1],[0,2],[0,3]],//I
        [[0,0],[1,0],[2,0],[1,1]],//T
    ];

    const positions = [

        {startX: 2, startY: 2},
        {startX: 8, startY: 2},
        {startX: 4, startY: 8},
        {startX: 10, startY: 10},
        {startX: 3, startY: 16},
        
    ];

    positions.forEach(pos =>{
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        placeObstacle(board,randomObstacle,pos.startX,pos.startY);
    })

}

function placeObstacle(board, obstacle, startX, startY){
    for(coordinatePair of obstacle){
        [x,y] = coordinatePair;
        board[startY + y][startX + x] = 'W';

    }
}

function randomInt(min,max){
    return Math.floor(Math.random() * (max-min + 1)) +min;
}

function randomEmptyPosition(board){
    x = randomInt(1,BOARD_SIZE -2);
}

function randomEmptyPosition(board){
    x = randomInt(1,BOARD_SIZE -2);
    y = randomInt(1,BOARD_SIZE -2);
    if(getCell(board, x, y,) === ''){
       return [x,y]; 
    }
    else{
        return randomEmptyPosition(board);
    }
    

}

function setCell(board, x, y, value){
    board[y][x] = value;
}

function shootAt(x,y){
    if(getCell(board,x,y) === 'W'){
        return;
    }

    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y);

    if(ghostIndex !== -1){
        ghosts.splice(ghostIndex,1);
        updateScoreBoard(20);
    }

    setCell(board,x,y,'B');
    drawBoard(board);

    if(ghosts.length === 0){
        //endGame();
        startNextLevel();
    }
}

function moveGhosts(){
    const oldGhosts = ghosts.map(ghost =>({x:ghost.x, y:ghost.y}));

    ghosts.forEach(ghost =>{
        const newPosition = ghost.moveGhostTowardsPLayer(player,board);
        ghost.x = newPosition.x;
        ghost.y = newPosition.y;

        setCell(board,ghost.x, ghost.y,'G');

        oldGhosts.forEach(ghost =>{
            setCell(board,ghost.x,ghost.y,'');
        });
        
        ghosts.forEach(ghost =>{
            setCell(board,ghost.x,ghost.y,'G')
        })


        drawBoard(board);

        if(ghost.x === player.x && ghost.y === player.y){
            endGame();
            return;
        }
    });
}

function endGame(){
    alert('Game Over!');
    isGameRunning = false;
    document.getElementById('intro-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    clearInterval(ghostInterval);
}

function updateScoreBoard(points){
    const ScoreBoard = document.getElementById('score-board');
    score += points 
    ScoreBoard.textContent = `pisteet:${score}`;

}

function startNextLevel(){
    alert('Level up! ghosts speed is going crazy!');
    ghostNumber ++;
    board = generateRandomBoard();
    drawBoard(board)
    ghostSpeed *= 0.9;
    clearInterval(ghostInterval);
    setTimeout(()=>{
    ghostInterval = setInterval(moveGhosts,ghostSpeed);    
    },1000);
    
}

class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    move(deltaX,deltaY ){
        
        //missä pelaaja on tällä hetkellä
        const currentX = player.x;
        const currentY = player.y;

        //Uusi sijainti pelaajalle
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;

        if(getCell(board, newX, newY) === ''){
       //Annetaan pelaajalle uusi sijainti
        player.x = newX;
        player.y = newY;

        //poistetaan vanha pelaaja pelilaudalta
        setCell(board,currentX,currentY,'');
        //asetetaan pelaaja pelilaudalle
        setCell(board,newX,newY,'P');
        //piirretään pelilauta uusiksi
        drawBoard(board);

        }    
    }
}

class Ghost{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    moveGhostTowardsPLayer(player,board){
        let dx = player.x - this.x;
        let dy = player.y - this.y;

        let moves = [];

        if(Math.abs(dx) > Math.abs(dy)){
            if(dx > 0) moves.push({x:this.x +1, y:this.y});
            else moves.push({x:this.x -1, y:this.y});

            if(dy > 0) moves.push({x:this.x, y:this.y +1});
            else moves.push({x:this.x, y:this.y -1});
        }
        else
        {
            if(dy > 0) moves.push({x:this.x, y:this.y +1});
            else moves.push({x:this.x, y:this.y -1});

            if(dx > 0) moves.push({x:this.x +1, y:this.y});
            else moves.push({x:this.x -1, y:this.y});

        }

        for(let move of moves){
            if(getCell(board,move.x, move.y) === '' || getCell(board, move.x,move.y) === 'P'){
                return move;
            }
        }

        return{x:this.x, y:this.y};
        
    }
}