var canvas = document.getElementById('nn');
var ctx = canvas.getContext('2d');

const neuralNetCanvasScreenWidth = 400;
const neuralNetCanvasScreenHeight = 500;

ctx.canvas.width = neuralNetCanvasScreenWidth;
ctx.canvas.height = neuralNetCanvasScreenHeight;

let circles = [];

function createCircle(x, y, r) {
    circles.push({x:x,y:y,r:r});
}

function drawLines(circleIndex1, circleIndex2) {
    ctx.strokeStyle = '#475a6d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(circles[circleIndex1].x, circles[circleIndex1].y);
    ctx.lineTo(circles[circleIndex2].x, circles[circleIndex2].y);
    ctx.stroke(); 
}

function drawCircles() {
    ctx.fillStyle = '#4A8';
    for (let i = 0; i < circles.length; i++) {
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, circles[i].r, 0, 6.282);
        ctx.fill();
    }
}

// createCircle(50, 100, 20);
// createCircle(300, 100, 20);
// drawLines(0, 1);
// drawCircles();


function drawDebugNeuralNet(genome)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles = [];

    let nodes = genome.nodes;
    let connections = genome.connections;

    // const midHeight = screenHeight / 2;
    // let drawnCircles = 1;
    let inputs = 0, hiddens = 0, outputs = 0;
    for (let key in nodes)
    {
        let node = nodes[key];
        if (node.type == "INPUT")
        {
            createCircle(50, (inputs++ + 1) * 100, 20);
        }
        if (node.type == "OUTPUT")
        {
            createCircle(350, (outputs++ + 1) * 100, 20);
        }
        if (node.type == "HIDDEN")
        {
            createCircle(200, (hiddens++ + 1) * 100 + 50, 20);
        }
    }

    for (let key2 in connections)
    {
        let con = connections[key2];
        if (con.status == true)
        {
            //console.log(nodes[con.inputNode].id, nodes[con.outputNode].id);
            drawLines(nodes[con.inputNode].id - 1, nodes[con.outputNode].id - 1);
        }

    }

    drawCircles();
}