'use strict';

const path = require('path');
const fs = require('fs');

let inputFile = process.argv.slice(2)[0];
if (!inputFile) {
    throw 'node rom2bmp.js <input font.rom> <output font.bmp>';
};
let outputFile = process.argv.slice(2)[1] || `${inputFile.substring(0, inputFile.length - path.extname(inputFile).length)}.bmp`;

let rom = fs.readFileSync(inputFile);

// 8×8
let quarter = rom.slice(0, 2048);
// 8×16
let half = rom.slice(2048, 6144);
// 16×16
let full = rom.slice(6144, 288768);

let bmpHeader = Buffer.from([0x42, 0x4D, 0x3E, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00]);
let bmpQuarter = Buffer.alloc(2048, 0xFF);
let bmpHalf = Buffer.alloc(4096, 0xFF);
let bmpFull = Buffer.alloc(393216, 0xFF);

quarter.forEach((value, index) => {
    let offset = index >> 3;
    // BMP 从下到上扫描，因此行数要倒过来
    let line = 7 - index % 8;
    bmpQuarter[(line << 8) + offset] = ~value;
});
half.forEach((value, index) => {
    let offset = index >> 4;
    let line = 15 - index % 16;
    bmpHalf[(line << 8) + offset] = ~value;
});
full.forEach((value, index) => {
    // font.bmp 中 16×16 部分是竖排的 92×96，而非横排的 96×92
    // 当然这转置的算法太暴力了 www
    index = (Math.floor((index >> 5) / 96) + (index >> 5) % 96 * 92) * 32 + index % 32;
    // 前方有 16 px 的空白
    let offset = (index >> 4) % 184 + 2;
    let line = 1535 - (Math.floor(index / 2944)) * 16 - index % 16;
    bmpFull[(line << 8) + offset] = ~value;
});

let bmp = Buffer.concat([bmpHeader, bmpFull, Buffer.alloc(62464, 0xFF), bmpQuarter, Buffer.alloc(62464, 0xFF), bmpHalf]);
fs.writeFileSync(outputFile, bmp);
