// SL 9821 所用的 font.dat
'use strict';

const path = require('path');
const fs = require('fs');

let inputFile = process.argv.slice(2)[0];
if (!inputFile) {
    throw 'node rom2dat.js <input font.rom> <output font.dat>';
};
let outputFile = process.argv.slice(2)[1] || `${inputFile.substring(0, inputFile.length - path.extname(inputFile).length)}.dat`;

let rom = fs.readFileSync(inputFile);

let quarter = rom.slice(0, 2048);
let half = rom.slice(2048, 6144);
let full = rom.slice(6144, 288768);

let datFull = Buffer.alloc(282624);

full.forEach((value, index) => {
    let row = Math.floor(index / 3072);
    let col = (index >> 5) % 96;
    datFull[col * 2944 + row * 32 + index % 32] = value;
});

let dat = Buffer.concat([quarter, half, datFull]);
fs.writeFileSync(outputFile, dat);
