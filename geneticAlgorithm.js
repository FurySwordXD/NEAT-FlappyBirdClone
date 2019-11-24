let generation = 1;

const MUTATION_RATE = 0.4;
const ADD_CONNECTION_MUTATION_RATE = 0.3;
const ADD_NODE_MUTATION_RATE = 0.2;

function nextGeneration() {
    calculateFitness();
   

    while (rectangles.length < populationSize)
    {
        let parent1 = savedRectangles[pickOne()];
        let parent2 = savedRectangles[pickOne()];

        let childGenome;

        if (parent1.fitness > parent2.fitness)
            childGenome = Genome.crossover(parent1.brain, parent2.brain, parent1.fitness, parent2.fitness);
        else
            childGenome = Genome.crossover(parent2.brain, parent1.brain, parent2.fitness, parent1.fitness);
        
        //console.log(JSON.parse(JSON.stringify(parent1)));
        //console.log(JSON.parse(JSON.stringify(parent2)));
        //console.log(JSON.parse(JSON.stringify(childGenome)));
        
        if (Math.random() < MUTATION_RATE)
            childGenome.mutateWeights();

        if(Math.random() < ADD_CONNECTION_MUTATION_RATE)
            childGenome.addConnectionMutation();

        if (Math.random() < ADD_NODE_MUTATION_RATE)
            childGenome.addNodeMutation();


        rectangles.push(new Rectangle(childGenome));

    }

    savedRectangles = [];
    generation++;
    
    console.log(`Generation${generation} - Nodes: ${rectangles[0].brain.getLength(rectangles[0].brain.nodes)} Connections: ${rectangles[0].brain.getLength(rectangles[0].brain.connections)}`);
    console.log(JSON.parse(JSON.stringify(rectangles[0].brain)));
    document.getElementById("generation").innerHTML = generation;
    drawDebugNeuralNet(rectangles[0].brain);

}

function pickOne() {
    var r = Math.random();

    index = 0;
    while (r > 0) {
        r = r - savedRectangles[index].fitness;
        index++;
    }
    index--;

    return index; 
}


function calculateFitness() {
    let sum = 0;

    for (var i = 0; i < savedRectangles.length; i++) {
        sum += savedRectangles[i].score;
    }

    for (var i = 0; i < savedRectangles.length; i++) {
        savedRectangles[i].fitness = sum > 0 ? savedRectangles[i].score / sum : 0.5;
    }
}
