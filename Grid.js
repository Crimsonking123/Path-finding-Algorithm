///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
//
//  Assignment       COMP3200 - Assignment 2
//  Professor:       David Churchill
//  Year / Term:     2022-09
//  File Name:       Grid.js
// 
//  Student Name:    Ekuyik Essien
//  Student User:    enessien
//  Student Email:   enessien@mun.ca
//  Student ID:      202023347
//  Group Member(s): [enter student name(s)]
//
///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/

class Grid {

    constructor(mapText) {
        this.grid = mapText.split("\n");
        this.width =  this.grid.length;
        this.height = this.grid[0].length;
        this.maxSize = 3;
    }
                   
    get(x, y) {
        return this.grid[y][x];
    }
                   
    isOOB(x, y, size) {
        return x < 0 || y < 0 || (x + size) > this.width || (y + size) > this.height;
    }
}


// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2022-09 - Assignment 2
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
