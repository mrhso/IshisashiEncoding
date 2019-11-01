'use strict';

const path = require('path');
const fs = require('fs');

let args = process.argv.slice(2);
let usage = 'node dat2rom.js <input font.dat> <output font.rom>';

let inputFile = args[0];
if (!inputFile) {
    console.error(usage);
    process.exit(1);
};
let outputFile = args[1] || `${inputFile.substring(0, inputFile.length - path.extname(inputFile).length)}.rom`;

let dat = fs.readFileSync(inputFile);

let quarter = dat.slice(0, 2048);
let half = dat.slice(2048, 6144);
let full = dat.slice(6144, 288768);

let romFull = Buffer.alloc(282624);

full.forEach((value, index) => {
    let row = Math.floor(index / 2944);
    let col = (index >> 5) % 92;
    romFull[col * 3072 + (row << 5) + index % 32] = value;
});

let rom = Buffer.concat([quarter, half, romFull]);
fs.writeFileSync(outputFile, rom);
