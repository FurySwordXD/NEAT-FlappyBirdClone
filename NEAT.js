const NODE_TYPES = ['INPUT', 'HIDDEN', 'OUTPUT'];
const PERTURBING_PROBABILITY = 0.9;
const C1 = 1, C2 = 1, C3 = 0.4, DT = 10;

class InnovationGenerator 
{
    constructor()
    {
        this.lastConnectionInnovation = 0;
        this.lastNodeInnovation = 0;
        this.connectionInnovations = [];
    }

    getConnectionInnovation(nodeIn, nodeOut)
    {
        for (let i = 0; i < this.connectionInnovations.length; i++)
        {
            if (this.connectionInnovations[i].in == nodeIn && this.connectionInnovations[i].out == nodeOut)
                return this.connectionInnovations[i].innovationNumber;
        }

        this.lastConnectionInnovation += 1;
        this.connectionInnovations.push({
            in: nodeIn, out: nodeOut, innovationNumber: this.lastConnectionInnovation
        });
        return this.lastConnectionInnovation;
    }

    getNodeInnovation()
    {
        this.lastNodeInnovation += 1;
    }
}
const innovationGenerator = new InnovationGenerator();

Math.sigmoid = function (x) {
    return 1 / (1 + Math.exp(-1 * x));
}

class Node
{
    constructor(type, id)
    {
        this.type = type;
        this.id = id;
        this.output = 0;
    }

    feedForward(genome)
    {
        let nodes = genome.nodes;
        let connections = genome.connections;
        for (let key in connections)
        {
            let con = connections[key];
            if (con.status == true && con.outputNode == this.id)
            {
                if (nodes[con.inputNode].output == 0)
                    nodes[con.inputNode].feedForward(nodes, connections);

                this.output += nodes[con.inputNode].output * con.weight;
            }
        }

        this.output = Math.sigmoid(this.output);
    }

    copy()
    {
        return new Node(this.type, this.id);
    }
}

class Connection
{
    constructor(inputNode, outputNode, weight, status, innovatioNumber)
    {
        this.inputNode = inputNode;
        this.outputNode = outputNode;
        this.weight = weight;
        this.status = status;
        this.innovatioNumber = innovatioNumber;
    }

    copy()
    {
        return new Connection(this.inputNode, this.outputNode, this.weight, this.status, this.innovatioNumber);
    }
}

class Genome
{
    constructor(inputs, outputs)
    {
        this.connections = {};
        this.nodes = {};

        for (let i = 0; i < inputs; i++)
            this.addNode(new Node("INPUT", this.getLength(this.nodes)+1));

        for (let j = 0; j < outputs; j++)
            this.addNode(new Node("OUTPUT", this.getLength(this.nodes)+1));
    }

    getRandomIndex(length) { return 1 + Math.round(Math.random() * (length-1)); }

    getRandomWeight() { return (Math.random() - 0.5) * 2; }

    addConnection(connection) { this.connections[connection.innovatioNumber] = connection; }

    addNode(node) { this.nodes[node.id] = node; }

    getLength(object) { return Object.keys(object).length; }

    addConnectionMutation()
    {
        let r1 = this.getRandomIndex(this.getLength(this.nodes));
        let node1 = this.nodes[r1];

        let r2;
        let node2;
        do {
            r2 = this.getRandomIndex(this.getLength(this.nodes));
            node2 = this.nodes[r2];
        } while ( r1 == r2 || ((node2.type == node1.type) && node2.type != "HIDDEN") );

        let reversed = false;
        if (NODE_TYPES.indexOf(node1.type) > NODE_TYPES.indexOf(node2.type))
            reversed = true;

        let connectionExists = false;
        for (let key in this.connections)
        {
            let connection = this.connections[key];
            if ( (connection.inputNode == node1.id && connection.outputNode == node2.id) || 
                (connection.inputNode == node2.id && connection.outputNode == node1.id))
            {
                this.addConnectionMutation();
            }
        }

        let newConnection;
        if (reversed)
            newConnection = new Connection(node2.id, node1.id, this.getRandomWeight(), true, innovationGenerator.getConnectionInnovation(node2.id, node1.id));
        else
            newConnection = new Connection(node1.id, node2.id, this.getRandomWeight(), true, innovationGenerator.getConnectionInnovation(node1.id, node2.id));

        this.addConnection(newConnection);
    }

    feedForward()
    {
        for (let key in this.nodes)
        {
            let node = this.nodes[key];
            if (node.type != "INPUT")
                node.feedForward(this);
        }
    }

    predict(inputs)
    {   
        for (let key in this.nodes)
            this.nodes[key].output = 0;

        for (let i = 0; i < inputs.length; i++)
        {
            this.nodes[i+1].output = inputs[i]; // 1 indexed
        }
            
        this.feedForward();

        let outputs = [];
        for (let key in this.nodes)
        {
            let node = this.nodes[key];
            if (node.type == "OUTPUT")
                outputs.push(node.output);
        }
        return outputs;
    }

    addNodeMutation() {
        if (this.getLength(this.connections) <= 0)
            return;
        
        let r = this.getRandomIndex(this.getLength(this.connections));
        let con = this.connections[Object.keys(this.connections)[r-1]];

        let inputNode = this.nodes[con.inputNode];
        let outputNode = this.nodes[con.outputNode];

        con.status = false;

        let newNode = new Node('HIDDEN', this.getLength(this.nodes)+1);
        let inToNew = new Connection(inputNode.id, newNode.id, 1, true, innovationGenerator.getConnectionInnovation(inputNode.id, newNode.id));
        let newToOut = new Connection(newNode.id, outputNode.id, con.weight, true, innovationGenerator.getConnectionInnovation(newNode.id, outputNode.id));

        this.addNode(newNode);
        this.addConnection(inToNew);
        this.addConnection(newToOut);
    }

    mutateWeights()
    {
        for (let key in this.connections)
        {
            let connection = this.connections[key];
            if (Math.random() < PERTURBING_PROBABILITY)
                connection.weight *= this.getRandomWeight() * 2;
            else
                connection.weight = this.getRandomWeight() * 2;
        }
    }

    static compatibilityDistance(genome1, genome2, c1, c2, c3, n = 1)
    {
        const {matchingGenes, netMatchingGeneWeightDifference, excessGenes, disjointGenes} = Genome.countGenes(genome1, genome2);
        return excessGenes * c1 / n + disjointGenes * c2 / n + netMatchingGeneWeightDifference / matchingGenes * c3;
    }

    static crossover(parent1, parent2, fitness1, fitness2) //parent1 more fit than parent2
    {
        let child = new Genome();

        for (let key in parent1.nodes)
        {
            let node = parent1.nodes[key].copy();
            child.addNode(node);
        }

        let fitnessSum = fitness1 + fitness2;
        for (let key1 in parent1.connections)
        {
            let connection1 = parent1.connections[key1];
            if (key1 in parent2.connections) // matching genes
            {
                let connection2 = parent2.connections[key1];
                
                let childConnection;
    
                if (Math.random() >= 0.5)
                {
                    childConnection = connection1.copy();
                    childConnection.weight *= fitness1 / fitnessSum;
                    childConnection.weight += connection2.weight * fitness2;
                }
                else 
                {
                    childConnection = connection2.copy();
                    childConnection.weight *= fitness2 / fitnessSum;
                    childConnection.weight += connection1.weight * fitness1;
                }

                child.addConnection(childConnection);
            }
            else //disjoint or excess
            {
                let childConnection = connection1.copy();
                child.addConnection(childConnection);
            }
        }
        
        return child;
    }

    static countGenes(genome1, genome2)
    {
        let matchingGenes = 0;
        let netMatchingGeneWeightDifference = 0;
        let disjointGenes = 0;
        let excessGenes = 0;

        let genome1Nodes = Object.keys(genome1.nodes);
        let genome2Nodes = Object.keys(genome2.nodes);

        let highestInnovation1 = genome1Nodes[genome1Nodes.length];
        let highestInnovation2 = genome1Nodes[genome2Nodes.length];
        let indices = Math.max(highestInnovation1, highestInnovation2);

        for (let i = 0; i <= indices; i++)
        {
            let node1 = genome1.nodes[i];
            let node2 = genome2.nodes[i];
            //if (node1 != undefined && node2 != undefined)
                //matchingGenes += 1;

            if (node1 == undefined && highestInnovation1 > i && node2 != undefined)
                disjointGenes += 1;
            else if (node2 == undefined && highestInnovation2 > i && node1 != undefined)
                disjointGenes += 1;

            if (node1 == undefined && highestInnovation1 < i && node2 != undefined)
                excessGenes += 1;
            else if (node2 == undefined && highestInnovation2 < i && node1 != undefined)
                excessGenes += 1;
        }

        let genome1Conns = Object.keys(genome1.connections);
        let genome2Conns = Object.keys(genome2.connections);

        highestInnovation1 = genome1Conns[genome1Conns.length];
        highestInnovation2 = genome2Conns[genome2Conns.length];
        indices = Math.max(highestInnovation1, highestInnovation2);

        for (let i = 0; i <= indices; i++)
        {
            let con1 = genome1.connections[i];
            let con2 = genome2.connections[i];
            
            if (con1 != undefined && con2 != undefined)
            {
                matchingGenes += 1;
                netMatchingGeneWeightDifference += Math.abs(con1.weight - con2.weight);
            }
                

            if (con1 == undefined && highestInnovation1 > i && con2 != undefined)
                disjointGenes += 1;
            else if (con2 == undefined && highestInnovation2 > i && con1 != undefined)
                disjointGenes += 1;

            if (con1 == undefined && highestInnovation1 < i && con2 != undefined)
                excessGenes += 1;
            else if (con2 == undefined && highestInnovation2 < i && con1 != undefined)
                excessGenes += 1;
        }

        return {matchingGenes: matchingGenes, netMatchingGeneWeightDifference: netMatchingGeneWeightDifference, 
            disjointGenes: disjointGenes, excessGenes: excessGenes};
    }
}
