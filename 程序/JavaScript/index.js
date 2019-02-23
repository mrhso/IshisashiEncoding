'use strict';

const str2ucp = (str) => {
    let chrs = [...str];
    let ucp = [];
    for (let chr of chrs) {
        ucp.push(chr.codePointAt());
    };
    return ucp;
};

const ucp2str = (ucp) => {
    let chrs = [];
    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x10FFFF) {
            chrs.push(String.fromCodePoint(point));
        } else {
            // 用「�」将超出现今 UCS 规定之最大值 U+10FFFF 的字符处理掉
            chrs.push('�');
        };
    };
    let chr = chrs.join('');
    return chr;
};

// 将名称标准化，避免漏匹配
// 要是能乖乖给「GB 18030-2005」、「UTF-8」这样的名称，也就不用做这个了
const stdName = (str) => {
    let std = str;
    std = std.replace(/([A-ZＡ-Ｚａ-ｚ０-９－])/gu, (_, variant) => {
        let point = variant.codePointAt();
        if (0x0041 <= point && point <= 0x005A) {
            point += 32;
        } else if (0xFF21 <= point && point <= 0xFF3A) {
            point -= 65216;
        } else if (0xFF41 <= point && point <= 0xFF5A) {
            point -= 65248;
        } else if (0xFF10 <= point && point <= 0xFF19) {
            point -= 65248;
        } else if (point === 0xFF0D) {
            point = 0x002D;
        };
        return String.fromCodePoint(point);
    });
    std = std.replace(/[^a-z0-9-]/gu, '');
    // 将形如「utf-8」之名称化为「utf8」
    std = std.replace(/([a-z])-([0-9])/gu, '$1$2');
    // 将归一的名称化为规范化的名称
    std = std.replace(/^utf([0-9])/gu, 'UTF-$1')
             .replace(/^cesu([0-9])/gu, 'CESU-$1')
             .replace(/^mutf([0-9])/gu, 'MUTF-$1')
             .replace(/^gb([0-9])/gu, 'GB $1');
    return std;
};

const UTF8Encoder = (ucp, type = 'UTF-8') => {
    let input = [];
    let output = [];

    for (let point of ucp) {
        if ((type === 'CESU-8' || type === 'MUTF-8') && 0x10000 <= point && point <= 0x10FFFF) {
            point -= 0x10000;
            let s1 = (point >> 10) + 0xD800;
            let s2 = (point & 0x3FF) + 0xDC00;
            input.push(s1, s2);
        } else {
            input.push(point);
        };
    };

    let offset = 0;
    while (offset < input.length) {
        let point = input[offset];
        if (type === 'MUTF-8' && point === 0x0000) {
            output.push(0xC0, 0x80);
            offset += 1;
        } else if (0x0000 <= point && point <= 0x007F) {
            output.push(point);
            offset += 1;
        } else if (0x0080 <= point && point <= 0x07FF) {
            let b1 = (point >> 6) + 0xC0;
            let b2 = (point & 0x3F) + 0x80;
            output.push(b1, b2);
            offset += 1;
        } else if (0x0800 <= point && point <= 0xFFFF) {
            let b1 = (point >> 12) + 0xE0;
            let b2 = (point >> 6 & 0x3F) + 0x80;
            let b3 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3);
            offset += 1;
        } else if (0x10000 <= point && point <= 0x1FFFFF) {
            let b1 = (point >> 18) + 0xF0;
            let b2 = (point >> 12 & 0x3F) + 0x80;
            let b3 = (point >> 6 & 0x3F) + 0x80;
            let b4 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3, b4);
            offset += 1;
        } else if (0x200000 <= point && point <= 0x3FFFFFF) {
            let b1 = (point >> 24) + 0xF8;
            let b2 = (point >> 18 & 0x3F) + 0x80;
            let b3 = (point >> 12 & 0x3F) + 0x80;
            let b4 = (point >> 6 & 0x3F) + 0x80;
            let b5 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3, b4, b5);
            offset += 1;
        } else if (0x4000000 <= point && point <= 0x7FFFFFFF) {
            let b1 = (point >> 30) + 0xFC;
            let b2 = (point >> 24 & 0x3F) + 0x80;
            let b3 = (point >> 18 & 0x3F) + 0x80;
            let b4 = (point >> 12 & 0x3F) + 0x80;
            let b5 = (point >> 6 & 0x3F) + 0x80;
            let b6 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3, b4, b5, b6);
            offset += 1;
        } else {
            output.push(0xEF, 0xBF, 0xBD);
            offset += 1;
        };
    };

    return output;
};

const UTF8Decoder = (buf) => {
    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        if (0x00 <= b1 && b1 <= 0x7F) {
            output.push(b1);
            offset += 1;
        } else if (0xC0 <= b1 && b1 <= 0xDF) {
            let b2 = buf[offset + 1];
            if (!(0x80 <= b2 && b2 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 1;
            } else {
                let p1 = b1 << 6 & 0x7C0;
                let p2 = b2 & 0x3F;
                let point = p1 + p2;
                output.push(point);
                offset += 2;
            };
        } else if (0xE0 <= b1 && b1 <= 0xEF) {
            let b2 = buf[offset + 1];
            let b3 = buf[offset + 2];
            if (!(0x80 <= b2 && b2 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (!(0x80 <= b3 && b3 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 2;
            } else {
                let p1 = b1 << 12 & 0xF000;
                let p2 = b2 << 6 & 0xFC0;
                let p3 = b3 & 0x3F;
                let point = p1 + p2 + p3;
                output.push(point);
                offset += 3;
            };
        } else if (0xF0 <= b1 && b1 <= 0xF7) {
            let b2 = buf[offset + 1];
            let b3 = buf[offset + 2];
            let b4 = buf[offset + 3];
            if (!(0x80 <= b2 && b2 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (!(0x80 <= b3 && b3 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 2;
            } else if (!(0x80 <= b4 && b4 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 3;
            } else {
                let p1 = b1 << 18 & 0x1C0000;
                let p2 = b2 << 12 & 0x3F000;
                let p3 = b3 << 6 & 0xFC0;
                let p4 = b4 & 0x3F;
                let point = p1 + p2 + p3 + p4;
                output.push(point);
                offset += 4;
            };
        } else if (0xF8 <= b1 && b1 <= 0xFB) {
            let b2 = buf[offset + 1];
            let b3 = buf[offset + 2];
            let b4 = buf[offset + 3];
            let b5 = buf[offset + 4];
            if (!(0x80 <= b2 && b2 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (!(0x80 <= b3 && b3 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 2;
            } else if (!(0x80 <= b4 && b4 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 3;
            } else if (!(0x80 <= b5 && b5 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 4;
            } else {
                let p1 = b1 << 24 & 0x3000000;
                let p2 = b2 << 18 & 0xFC0000;
                let p3 = b3 << 12 & 0x3F000;
                let p4 = b4 << 6 & 0xFC0;
                let p5 = b5 & 0x3F;
                let point = p1 + p2 + p3 + p4 + p5;
                output.push(point);
                offset += 5;
            };
        } else if (0xFC <= b1 && b1 <= 0xFD) {
            let b2 = buf[offset + 1];
            let b3 = buf[offset + 2];
            let b4 = buf[offset + 3];
            let b5 = buf[offset + 4];
            let b6 = buf[offset + 5];
            if (!(0x80 <= b2 && b2 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (!(0x80 <= b3 && b3 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 2;
            } else if (!(0x80 <= b4 && b4 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 3;
            } else if (!(0x80 <= b5 && b5 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 4;
            } else if (!(0x80 <= b6 && b6 <= 0xBF)) {
                output.push(0xFFFD);
                offset += 5;
            } else {
                let p1 = b1 << 30 & 0x40000000;
                let p2 = b2 << 24 & 0x3F000000;
                let p3 = b3 << 18 & 0xFC0000;
                let p4 = b4 << 12 & 0x3F000;
                let p5 = b5 << 6 & 0xFC0;
                let p6 = b6 & 0x3F;
                let point = p1 + p2 + p3 + p4 + p5 + p6;
                output.push(point);
                offset += 6;
            };
        } else {
            output.push(0xFFFD);
            offset += 1;
        };
    };

    return output;
};

class TextEncoder {
    constructor (encoding = 'UTF-8') {
        this._encoding = stdName(encoding);
    };

    encode(str) {
        let input = str2ucp(str);
        let output;

        switch (this._encoding) {
            case 'UTF-8':
                output = UTF8Encoder(input);
                break;

            case 'CESU-8':
                output = UTF8Encoder(input, 'CESU-8');
                break;

            case 'MUTF-8':
                output = UTF8Encoder(input, 'MUTF-8');
                break;

            default:
                break;
        };

        output = new Uint8Array(output);
        return output;
    };
};

class TextDecoder {
    constructor (encoding = 'UTF-8') {
        this._encoding = stdName(encoding);
    };

    decode(buf) {
        let input = [...buf];
        let output;

        switch (this._encoding) {
            case 'UTF-8':
                output = UTF8Decoder(input);
                break;

            case 'CESU-8':
                output = UTF8Decoder(input);
                break;

            case 'MUTF-8':
                output = UTF8Decoder(input);
                break;

            default:
                break;
        };

        output = ucp2str(output);
        return output;
    };
};

module.exports = { TextEncoder, TextDecoder };
