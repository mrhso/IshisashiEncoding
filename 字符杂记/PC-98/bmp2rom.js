// 输入必须为单色 BMP
'use strict';

const path = require('path');
const fs = require('fs');

let inputFile = process.argv.slice(2)[0];
if (!inputFile) {
    throw 'node bmp2rom.js <input font.bmp> <output font.rom>';
};
let outputFile = process.argv.slice(2)[1] || `${inputFile.substring(0, inputFile.length - path.extname(inputFile).length)}.rom`;

let bmp = fs.readFileSync(inputFile);

let quarter = bmp.slice(455742, 457790);
let half = bmp.slice(520254, 524350);
let full = bmp.slice(62, 393278);

let romQuarter = Buffer.alloc(2048);
let romHalf = Buffer.alloc(4096);
let romFull = Buffer.alloc(282624);

quarter.forEach((value, index) => {
    let line = 7 - (index >> 8);
    let offset = index % 256;
    romQuarter[(offset << 3) + line] = ~value;
});
half.forEach((value, index) => {
    let line = 15 - (index >> 8);
    let offset = index % 256;
    romHalf[(offset << 4) + line] = ~value;
});
full.forEach((value, index) => {
    let line = 1535 - (index >> 8);
    let offset = index % 256 - 2;
    if (0 <= offset && offset <= 183) {
        let i = (line >> 4) * 2944 + offset * 16 + line % 16;
        let row = Math.floor(i / 2944);
        let col = (i >> 5) % 92;
        romFull[col * 3072 + row * 32 + i % 32] = ~value;
    };
});

let rom = Buffer.concat([romQuarter, romHalf, romFull]);
fs.writeFileSync(outputFile, rom);
