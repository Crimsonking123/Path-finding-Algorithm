///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
//
//  Assignment       COMP3200 - Assignment 2
//  Professor:       David Churchill
//  Year / Term:     2022-09
//  File Name:       Search_Student.js
// 
//  Student Name:    Ekuyik Essien
//  Student User:    enessien
//  Student Email:   enessien@mun.ca
//  Student ID:      202023347
//  Group Member(s): Matthew Keough #201800737 mkeough18@mun.ca, Ekuyik Essien #202023347 enessien@mun.ca
//
///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
                   
// Search_Student.js 
// Computer Science 3200 - Assignment 2
// Author(s): Ekuyik Essien & Matthew Keough
//    Course: 3200
//
// All of your Assignment code should be in this file, it is the only file submitted.
// You may create additional functions / member variables within this class, but do not
// rename any of the existing variables or function names, since they are used by the
// GUI to perform specific functions.

// minor issue: sometimes the closed tiles are not being shown correctly visually
class Search_Student
{
    constructor(grid, config) 
    {
        this.config = config;       // search configuration object
                                    //   config.actions = array of legal [x, y] actions
                                    //   config.actionCosts[i] = cost of config.actions[i]
                                    //   config.heuristic = 'diag', 'card', 'dist', or 'zero'
        this.name = "Student";
        this.grid = grid;           // the grid we are using to search
        this.sx = -1;               // x location of the start state
        this.sy = -1;               // y location of the start state
        this.gx = -1;               // x location of the goal state
        this.gy = -1;               // y location of the goal state
        this.size = 1;              // the square side length (size) of the agent
        this.maxSize = 3;           // the maximum size of an agent
                
        this.inProgress = false;    // whether the search is in progress
        this.expanded = 0;          // number of nodes expanded (drawn in GUI)

        this.path = [];             // the path, if the search found one
        this.open = [];             // the current open list of the search (stores Nodes)
        this.closed = [];           // the current closed list of the search
        this.cost = 'Search Not Completed'; // the cost of the path found, -1 if no path
        this.sectors = [];
        this.computeSectors();
        
    }

    // This function should return whether or not an object of a given size can 'fit' at
    // the given (x,y) location. An object can fit if the following are true:
    //    - the object lies entirely within the boundary of the map
    //    - all tiles occupied by the object have the same grid value
    canFit(x, y, size)
    {
        //check if the object is placed in an OOB location
        if(this.grid.isOOB(x,y,size))
        {
            return false;
        }
        //check if all the colors of the chosen object location match
        let value = this.grid.get(x,y);
        for(let i = 0; i<size; i++)
        {
            for(let j = 0; j<size; j++)
            {
                if(!(this.grid.get(x+i,y+j) === value))
                {
                    return false;
                }
            }
        }
        return true;
    }

    //This function computes and stores the connected sectors
    computeSectors()
    {   
        //create a 3d array by looping through 3 loops for size,x and y
        let sectors = this.sectors;
        for(let a = 0;a<3;a++)
        {
            sectors.push([]);
            for(let x = 0; x<this.grid.width; x++)
            {
                sectors[a].push([]);
                for(let y = 0; y<this.grid.height; y++)
                {
                    sectors[a][x].push(0);
                }
            }
        }
        //Run a BFS on each individual grid tile for each size of object
        for(let a = 0;a<3;a++)
        {
            let sectorNumber = 0;
            for(let x = 0; x<this.grid.width; x++)
            {
                for(let y = 0; y<this.grid.height; y++)
                {   
                    if(this.canFit(x,y,a+1)){
                        sectorNumber+=1;
                        this.cardinalBFS(x,y,sectorNumber,sectors,a+1);
                    }
                }
            }
        }
    } 

    // checking to see if a value is already in an array
    check(x,y,array)
    {
        for(let i = 0;i<array.length;i++)
        {
            if(x == array[i][0] && y == array[i][1])
            {
                return true;
            }
        }
        return false; 
    }

    //this runs a cardinalBFS on a given location and object size
    cardinalBFS(x,y,sectorNumber,arr,size)
    {
        let unexpanded = [];
        let expanded = [];
        let current =  new Node(0,0,null,null);
        let start = new Node(x,y,null,null);
        unexpanded.push(start);

        while(unexpanded.length>0)
        {
            current = unexpanded.shift();
            if(arr[size-1][current.x][current.y] == 0){
                //set the grid tile to the given sector number
                arr[size-1][current.x][current.y] = sectorNumber;
                if(this.check(current.x,current.y,expanded))
                {
                    continue;
                }
                //add all expanded nodes to the expanded array
                else{
                    expanded.push([current.x,current.y]);
                }
                //add children nodes of the current location to the unexpanded array
                for(let i = 0; i<this.config.actions.length; i++)
                { 
                    let action = this.config.actions[i];
                    if(!this.isLegalAction(current.x,current.y,size,action))
                    {
                        continue;
                    }
                    else
                    {
                        let dx = current.x + action[0];
                        let dy = current.y + action[1];
                        let dNode = new Node(dx,dy,action,this.current);
                        unexpanded.push(dNode);
                    }
                }
            } 
        }
    }    

    // This function should return whether or not the two given locations are connected.
    // Two locations are connected if a path is possible between them. For this assignment,
    // keep in mine that 4D connectedness is equivalent to 8D connectedness because you
    // cannot use a diagonal move to jump over a tile.
    isConnected(x1, y1, x2, y2, size)
    {
        if(this.sectors[size-1][x1][y1] == 0 || this.sectors[size-1][x2][y2] == 0){
            return false;
        }
        return this.sectors[size-1][x1][y1] == this.sectors[size-1][x2][y2];
    }

    
    // checks if the proposed move is legal for horizontal or vertical movements
    isLegalMovement(x,y,nx,ny,size)
    {   
        //this checks if each color tile in the object's current location is the same as the target location
        let value = this.grid.get(x,y); 
        for(let i = 0; i<size; i++){
            for(let j = 0; j<size; j++)
            {
                if(!(this.grid.get(nx+i,ny+j) === value))
                {
                    return false;
                }
            }
        }
        return true;
    }

    // This function should compute and return whether or not the given action is able
    // to be performed from the given (x,y) location.
    isLegalAction(x, y, size, action) 
    {
        let diag = false;
        let nx = x + action[0];
        let ny = y + action[1];
        //check if the object can fit in the new location
        if(!(this.canFit(nx,ny,size)))
        {
            return false;
        }
        let xrange = x - nx;
        let yrange = y - ny;
        //check if the movement is diagonal or not
        if(Math.abs(xrange) > 0 || Math.abs(yrange) > 0)
        {
            diag = true;
        }
        //if the action is not diagonal simply check if the action is legal
        if(diag == false)
        {
            if(!(this.isLegalMovement(x,y,nx,ny,size)))
            {
                return false;
            }
        }
        //if the action is diagonal, check if it jumps over an illegal tile while "moving" diagonally
        else if(diag == true)
        {
            let test = false;
            if(this.isLegalMovement(x,y,nx,y,size))
            {
                if(this.isLegalMovement(nx,y,nx,ny,size))
                {
                    test = true;
                }
                else{
                    test = false;
                }
            }
            if(test == true){
                if(this.isLegalMovement(x,y,x,ny,size))
                {
                    if(this.isLegalMovement(x,ny,nx,ny,size))
                    {
                        test = true;
                    }
                    else{
                        test = false;
                    }
                }
                else{
                    test = false;
                }
            }
            if(test == false)
            {
                return false;
            }
        }
        return true;
    }            
                   
    // This function should set up all the necessary data structures to begin a new search
    // This includes, but is not limited to: setting the start and goal locations, resetting
    // the open and closed lists, and resetting the path.W
    startSearch(sx, sy, gx, gy, size) 
    {
        // deals with an edge-case with the GUI, leave this line here
        if (sx == -1 || gx == -1) { return; }

        this.inProgress = true;     // the search is now considered started
        this.sx = sx;               // set the x,y location of the start state
        this.sy = sy;
        this.gx = gx;               // set the x,y location of the goal state
        this.gy = gy;
        this.size = size;           // the size of the agent
        
        this.path = [];             // set an empty path

        // reset open and closed lists
        this.open = [];
        this.closed = [];

        // put in root node
        let rootNode = new Node(sx, sy, null, null, null, this.estimateCost(this.sx, this.sy, this.gx, this.gy));
        this.open.push(rootNode);
    }

    // This function should compute and return the heuristic function h(n) of a given
    // start location to a given goal location. This function should return one of
    // four different values, based on the this.config.heuristic option
    estimateCost(x, y, gx, gy) 
    {
        // compute and return the diagonal manhattan distance heuristic
        if (this.config.heuristic == 'diag')
        {
            // differance in x's + diff in y's
            let xDiff = (x - gx);
            let yDiff = (y - gy);
            let estimate = (xDiff + yDiff) * 100;
            return estimate;
        // compute and return the 4 directional (cardinal) manhattan distance
        } else if (this.config.heuristic == 'card')
        {
            // diff in x & y
            // amount of diagonal moves the smaller one
            let xDiff = (x - gx);
            let yDiff = (y - gy);
            if (xDiff <= yDiff)
            {
                let yDistance = yDiff - xDiff
                let estimate = (xDiff * 141) + (yDistance * 100);
                return estimate;
            }
            else if (yDiff <= xDiff)
            {
                let xDistance = xDiff - yDiff
                let estimate = (yDiff * 141) + (xDistance * 100);
                return estimate;
            }
        // compute and return the 2D euclidian distance (Pythagorus)
        } else if (this.config.heuristic == 'dist')
        {
            let xDis = gx - x;
            let yDis = gy - y;
            let xVal = xDis * xDis;
            let yVal = yDis * yDis;
            let distance = Math.sqrt(xVal + yVal);
            let estimate = distance * 100;
            return estimate;
        // return zero heuristic
        } else if (this.config.heuristic == 'zero')
        {
            return 0;
        }
    }
            
    // This function performs one iteration of search.
    // The only difference being that when a path is found, we set the internal path variable
    // rather than return it from the function. When expanding the current node, you must 
    // use the this.isLegalAction function above.
    searchIteration() 
    {
        
        // if we've already finished the search, do nothing
        if (!this.inProgress) { return; }

        // we can do a quick check to see if the start and end goals are connected
        // if they aren't, then we can end the search before it starts
        if (!this.isConnected(this.sx, this.sy, this.gx, this.gy, this.size))
        { 
            this.inProgress = false; // we don't need to search any more
            this.cost = -1; // no path was possible, so the cost is -1
            return; 
        }

        // operation for A*
        let minIndex = this.findMin();
        let node = this.open[minIndex];
        // remove from open list. pop did not work great for some reason
        this.open.splice(minIndex, 1);

        // if (node.state is goal) return solution
        if((node.x === this.gx) && (node.y === this.gy))
        {
            // compute the path!
            this.cost = node.g;
            let nextNode = node;
            while (nextNode.parent != null)
            {
                this.path.push(nextNode.action);
                nextNode = nextNode.parent;
            }
            this.path.reverse();
            this.inProgress = false;
            return;
        }

        // if (node.state in closed) continue
        if (this.checkInClosed(node.x, node.y))
        {
            return;
        }

        // closed.add(node.state)
        this.closed.push([node.x, node.y]);

        // open.add(Expand(node, problem))
        for (let a = 0; a<this.config.actions.length; a++)
        {
            let action = this.config.actions[a];
            if (!this.isLegalAction(node.x, node.y, this.size, action))
            {
                continue;
            }
            let cost = this.actionCost(action);
            // generate the nx ny next state
            let nx = node.x + action[0];
            let ny = node.y + action[1];
            // generate the new node(nx, ny, action, parent, g, h)
            let childG = node.g + cost;
            // for some reason orginal node losses it's parent action and G at some point
            let newNode = new Node(nx, ny, node, action, childG, this.estimateCost(nx, ny, this.gx, this.gy));
            // add that new node to the open list
            this.open.push(newNode)
        }

        // if the search ended and no path was found, set this.cost = -1
        if (this.open.length < 1)
        {
            this.inProgress = false;
            this.cost = -1;
            return;
        }
    }

        // returns the cost of a given action
        actionCost(action)
        {
            if (action[0] === 1 & (action[1] === 1 || action[1] === -1) || action[0] === -1 & (action[1] === 1 || action[1] === -1))
            {
                return 141;
            }
            else
            {
                return 100;
            }
        }

        // function to find the min value for A*
        // this function returns the index for that value
        findMin()
        {
            let minimumValue = 90000;
            let minimumIndex = 0;
            for (let i = 0; i<this.open.length; i++)
            {
                // get the sum of g & h for a node
                let curr = this.open[i].g + this.open[i].h;
                if (curr < minimumValue)
                {
                    minimumValue = curr;
                    minimumIndex = i;
                }
            }
            return minimumIndex;
        }

        // function just to check if the node is already in the closed list
        checkInClosed(x, y)
        {
            for (let i=0; i<this.closed.length; i++)
            {
                if((x === this.closed[i][0]) && (y === this.closed[i][1]))
                {
                    return true;
                }
            }
            return false;
        }

    // This function returns the current open list states in a given format
    getOpen() 
    {
        let openStates = [];
        for (let i = 0; i<this.open.length; i++)
        {
            openStates.push([this.open[i].x, this.open[i].y])
        }
        return openStates;
    }

    // This function returns the current closed list in a given format
    getClosed() 
    {
        return this.closed;
    }
}
               
// The Node class to be used in your search algorithm.
// This should not need to be modified to complete the assignment
// Note: child.g = parent.g + cost(action)
class Node 
{
    constructor(x, y, parent, action, g, h) 
    {
        this.x = x;
        this.y = y;
        this.action = action;
        this.parent = parent;
        this.g = g;
        this.h = h;
    }
}
                   
// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2022-09 - Assignment 2
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
