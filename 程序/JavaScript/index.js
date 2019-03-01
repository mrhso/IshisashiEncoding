'use strict';

const map = require('./map.js');

const str2ucp = (str) => {
    let ucp = [];
    for (let chr of str) {
        ucp.push(chr.codePointAt());
    };
    return ucp;
};

const ucp2str = (ucp) => {
    let str = '';
    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x10FFFF) {
            str += String.fromCodePoint(point);
        } else {
            // 用「�」将超出现今 UCS 的字符处理掉
            str += '�';
        };
    };
    return str;
};

const toLF = (str) => {
    return str.replace(/\r\n/gu, '\n').replace(/\r/gu, '\n');
};

const toCR = (str) => {
    return toLF(str).replace(/\n/gu, '\r');
};

const toCRLF = (str) => {
    return toLF(str).replace(/\n/gu, '\r\n');
};

const reverseMap = (map) => {
    let rMap = new Map();
    for (let [key, value] of map) {
        rMap.set(value, key);
    };
    return rMap;
};

const arrayIndexMap = (arr) => {
    let map = new Map();
    arr.forEach((value, index) => {
        if (value !== undefined) {
            map.set(index, value);
        };
    });
    return map;
};

// 将兼容字转化为 SVS
const CJKCI2SVS = (str) => {
    let mapCI = arrayIndexMap(map['CJK CI']);
    let mapCIS = arrayIndexMap(map['CJK CIS']);
    return str.replace(/([\u{F900}-\u{FAFF}\u{2F800}-\u{2FA1F}])/gu, (_, CI) => {
        let point = CI.codePointAt();
        if (0xF900 <= point && point <= 0xFAFF) {
            let index = point - 0xF900;
            if (mapCI.has(index)) {
                return mapCI.get(index);
            } else {
                return CI;
            };
        } else if (0x2F800 <= point && point <= 0x2FA1F) {
            let index = point - 0x2F800;
            if (mapCIS.has(index)) {
                return mapCIS.get(index);
            } else {
                return CI;
            };
        };
    });
};

// 将 SVS 转化为兼容字
const CJKSVS2CI = (str) => {
    let mapCI = reverseMap(arrayIndexMap(map['CJK CI']));
    let mapCIS = reverseMap(arrayIndexMap(map['CJK CIS']));
    return str.replace(/([\u{3400}-\u{4DBF}\u{4E00}-\u{9FFF}\u{20000}-\u{2A6DF}\u{20000}-\u{2A6DF}][\u{FE00}-\u{FE0F}])/gu, (_, SVS) => {
        if (mapCI.has(SVS)) {
            return String.fromCodePoint(mapCI.get(SVS) + 0xF900);
        } else if (mapCIS.has(SVS)) {
            return String.fromCodePoint(mapCIS.get(SVS) + 0x2F800);
        } else {
            return SVS;
        };
    });
};

// 智能移除兼容字、SVS、IVD
// 会处理历史遗留，故称「智能」
const removeSVS = (str) => {
    let SVSh = new Map(map['CJK SVS history']);
    return CJKCI2SVS(str).replace(/([\u{3400}-\u{4DBF}\u{4E00}-\u{9FFF}\u{20000}-\u{2A6DF}\u{20000}-\u{2A6DF}][\u{FE00}-\u{FE0F}])/gu, (_, SVS) => {
        if (SVSh.has(SVS)) {
            return SVSh.get(SVS);
        } else {
            return SVS;
        };
    }).replace(/[\u{FE00}-\u{FE0F}]/gu, '').replace(/[\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}]/gu, '');
};

// 将名称标准化，避免漏匹配
// 要是能乖乖给「GB 18030-2005」、「UTF-8」这样的名称，也就不用做这个了
const stdName = (str) => {
    return str.replace(/([A-ZＡ-Ｚａ-ｚ０-９－])/gu, (_, variant) => {
        let point = variant.codePointAt();
        if (0x0041 <= point && point <= 0x005A) {
            point += 0x0020;
        } else if (0xFF21 <= point && point <= 0xFF3A) {
            point -= 0xFEC0;
        } else if (0xFF41 <= point && point <= 0xFF5A) {
            point -= 0xFEE0;
        } else if (0xFF10 <= point && point <= 0xFF19) {
            point -= 0xFEE0;
        } else if (point === 0xFF0D) {
            point = 0x002D;
        };
        return String.fromCodePoint(point);
    })
    .replace(/[^a-z0-9-]/gu, '')
    .replace(/([a-z])-([0-9])/gu, '$1$2')
    .replace(/^utf([0-9])/gu, 'UTF-$1')
    .replace(/^cesu([0-9])/gu, 'CESU-$1')
    .replace(/^mutf([0-9])/gu, 'MUTF-$1')
    .replace(/^gb([0-9])/gu, 'GB $1')
    .replace(/([0-9])be$/gu, '$1 BE')
    .replace(/([0-9])le$/gu, '$1 LE')
    .replace(/^cp([0-9])/gu, 'CP $1')
    .replace(/^utf-vlq$/gu, 'UTF-VLQ');
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

    for (let point of input) {
        if (type !== 'MUTF-8' && point === 0x0000 || 0x0001 <= point && point <= 0x007F) {
            output.push(point);
        } else if (type === 'MUTF-8' && point === 0x0000 || 0x0080 <= point && point <= 0x07FF) {
            let b1 = (point >> 6) + 0xC0;
            let b2 = (point & 0x3F) + 0x80;
            output.push(b1, b2);
        } else if (0x0800 <= point && point <= 0xFFFF) {
            let b1 = (point >> 12) + 0xE0;
            let b2 = (point >> 6 & 0x3F) + 0x80;
            let b3 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3);
        } else if (0x10000 <= point && point <= 0x1FFFFF) {
            let b1 = (point >> 18) + 0xF0;
            let b2 = (point >> 12 & 0x3F) + 0x80;
            let b3 = (point >> 6 & 0x3F) + 0x80;
            let b4 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3, b4);
        } else if (0x200000 <= point && point <= 0x3FFFFFF) {
            let b1 = (point >> 24) + 0xF8;
            let b2 = (point >> 18 & 0x3F) + 0x80;
            let b3 = (point >> 12 & 0x3F) + 0x80;
            let b4 = (point >> 6 & 0x3F) + 0x80;
            let b5 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3, b4, b5);
        } else if (0x4000000 <= point && point <= 0x7FFFFFFF) {
            let b1 = (point >> 30) + 0xFC;
            let b2 = (point >> 24 & 0x3F) + 0x80;
            let b3 = (point >> 18 & 0x3F) + 0x80;
            let b4 = (point >> 12 & 0x3F) + 0x80;
            let b5 = (point >> 6 & 0x3F) + 0x80;
            let b6 = (point & 0x3F) + 0x80;
            output.push(b1, b2, b3, b4, b5, b6);
        } else {
            output.push(0xEF, 0xBF, 0xBD);
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
                output.push(p1 + p2);
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
                output.push(p1 + p2 + p3);
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
                output.push(p1 + p2 + p3 + p4);
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
                output.push(p1 + p2 + p3 + p4 + p5);
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
                output.push(p1 + p2 + p3 + p4 + p5 + p6);
                offset += 6;
            };
        } else {
            output.push(0xFFFD);
            offset += 1;
        };
    };

    return output;
};

const UTF16Encoder = (ucp, bigEndian) => {
    let input = [];
    let output = [];

    for (let point of ucp) {
        if (0x10000 <= point && point <= 0x10FFFF) {
            point -= 0x10000;
            let s1 = (point >> 10) + 0xD800;
            let s2 = (point & 0x3FF) + 0xDC00;
            input.push(s1, s2);
        } else {
            input.push(point);
        };
    };

    for (let point of input) {
        if (0x0000 <= point && point <= 0xFFFF) {
            let b1 = point >> 8;
            let b2 = point & 0xFF;
            if (bigEndian) {
                output.push(b1, b2);
            } else {
                output.push(b2, b1);
            };
        } else {
            if (bigEndian) {
                output.push(0xFF, 0xFD);
            } else {
                output.push(0xFD, 0xFF);
            };
        };
    };

    return output;
};

const UTF16Decoder = (buf, bigEndian) => {
    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        let b2 = buf[offset + 1];
        if (!(0x00 <= b2 && b2 <= 0xFF)) {
            output.push(0xFFFD);
            offset += 1;
        } else {
            let p1;
            let p2;
            if (bigEndian) {
                p1 = b1 << 8;
                p2 = b2;
            } else {
                p1 = b2 << 8;
                p2 = b1;
            };
            output.push(p1 + p2);
            offset += 2;
        };
    };

    return output;
};

const UTF32Encoder = (ucp, bigEndian) => {
    let output = [];

    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x7FFFFFFF) {
            let b1 = point >> 24;
            let b2 = point >> 16 & 0xFF;
            let b3 = point >> 8 & 0xFF;
            let b4 = point & 0xFF;
            if (bigEndian) {
                output.push(b1, b2, b3, b4);
            } else {
                output.push(b4, b3, b2, b1);
            };
        } else {
            if (bigEndian) {
                output.push(0x00, 0x00, 0xFF, 0xFD);
            } else {
                output.push(0xFD, 0xFF, 0x00, 0x00);
            };
        };
    };

    return output;
};

const UTF32Decoder = (buf, bigEndian) => {
    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        let b2 = buf[offset + 1];
        let b3 = buf[offset + 2];
        let b4 = buf[offset + 3];
        if (!(0x00 <= b2 && b2 <= 0xFF)) {
            output.push(0xFFFD);
            offset += 1;
        } else if (!(0x00 <= b3 && b3 <= 0xFF)) {
            output.push(0xFFFD);
            offset += 2;
        } else if (!(0x00 <= b4 && b4 <= 0xFF)) {
            output.push(0xFFFD);
            offset += 3;
        } else {
            let p1;
            let p2;
            let p3;
            let p4;
            if (bigEndian) {
                p1 = b1 << 24;
                p2 = b2 << 16;
                p3 = b3 << 8;
                p4 = b4;
            } else {
                p1 = b4 << 24;
                p2 = b3 << 16;
                p3 = b2 << 8;
                p4 = b1;
            };
            let point = p1 + p2 + p3 + p4;
            if (0x0000 <= point && point <= 0x7FFFFFFF) {
                output.push(point);
            } else {
                output.push(0xFFFD);
            };
            offset += 4;
        };
    };

    return output;
};

const UTF1Encoder = (ucp) => {
    // 根据 GB 13000.1-1993 附录 G 原文编写
    const T = (z) => {
        if (0x00 <= z && z <= 0x5D) {
            z += 0x21;
        } else if (0x5E <= z && z <= 0xBD) {
            z += 0x42;
        } else if (0xBE <= z && z <= 0xDE) {
            z -= 0xBE;
        } else if (0xDF <= z && z <= 0xFF) {
            z -= 0x60;
        };
        return z;
    };

    let output = [];

    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x009F) {
            output.push(point);
        } else if (0x00A0 <= point && point <= 0x00FF) {
            output.push(0xA0, point);
            offset += 1;
        } else if (0x0100 <= point && point <= 0x4015) {
            point -= 0x0100;
            let b1 = Math.floor(point / 190) + 0xA1;
            let b2 = T(point % 190);
            output.push(b1, b2);
        } else if (0x4016 <= point && point <= 0x38E2D) {
            point -= 0x4016;
            let b1 = Math.floor(point / 36100) + 0xF6;
            let b2 = T(Math.floor(point / 190) % 190);
            let b3 = T(point % 190);
            output.push(b1, b2, b3);
        } else if (0x38E2E <= point && point <= 0x7FFFFFFF) {
            point -= 0x38E2E;
            let b1 = Math.floor(point / 1303210000) + 0xFC;
            let b2 = T(Math.floor(point / 6859000) % 190);
            let b3 = T(Math.floor(point / 36100) % 190);
            let b4 = T(Math.floor(point / 190) % 190);
            let b5 = T(point % 190);
            output.push(b1, b2, b3, b4, b5);
        } else {
            output.push(0xF7, 0x65, 0xAD);
        };
    };

    return output;
};

const UTF1Decoder = (buf) => {
    const U = (z) => {
        if (0x00 <= z && z <= 0x20) {
            z += 0xBE;
        } else if (0x21 <= z && z <= 0x7E) {
            z -= 0x21;
        } else if (0x7F <= z && z <= 0x9F) {
            z += 0x60;
        } else if (0xA0 <= z && z <= 0xFF) {
            z -= 0x42;
        };
        return z;
    };

    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        if (0x00 <= b1 && b1 <= 0x9F) {
            output.push(b1);
            offset += 1;
        } else if (b1 === 0xA0) {
            let b2 = buf[offset + 1];
            if (!(0xA0 <= b2 && b2 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 1;
            } else {
                output.push(b2);
                offset += 2;
            };
        } else if (0xA1 <= b1 && b1 <= 0xF5) {
            let b2 = buf[offset + 1];
            if (!(0x21 <= b2 && b2 <= 0x7E || 0xA0 <= b2 && b2 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 1;
            } else {
                let p1 = (b1 - 0xA1) * 190;
                let p2 = U(b2);
                output.push(p1 + p2 + 0x0100);
                offset += 2;
            };
        } else if (0xF6 <= b1 && b1 <= 0xFB) {
            let b2 = buf[offset + 1];
            let b3 = buf[offset + 2];
            if (!(0x21 <= b2 && b2 <= 0x7E || 0xA0 <= b2 && b2 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (!(0x21 <= b3 && b3 <= 0x7E || 0xA0 <= b3 && b3 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 2;
            } else {
                let p1 = (b1 - 0xF6) * 36100;
                let p2 = U(b2) * 190;
                let p3 = U(b3);
                let p4 = 0x4016;
                output.push(p1 + p2 + p3 + 0x4016);
                offset += 3;
            };
        } else if (0xFC <= b1 && b1 <= 0xFF) {
            let b2 = buf[offset + 1];
            let b3 = buf[offset + 2];
            let b4 = buf[offset + 3];
            let b5 = buf[offset + 4];
            if (!(0x21 <= b2 && b2 <= 0x7E || 0xA0 <= b2 && b2 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (!(0x21 <= b3 && b3 <= 0x7E || 0xA0 <= b3 && b3 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 2;
            } else if (!(0x21 <= b4 && b4 <= 0x7E || 0xA0 <= b4 && b4 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 3;
            } else if (!(0x21 <= b5 && b5 <= 0x7E || 0xA0 <= b5 && b5 <= 0xFF)) {
                output.push(0xFFFD);
                offset += 4;
            } else {
                let p1 = (b1 - 0xFC) * 1303210000;
                let p2 = U(b2) * 6859000;
                let p3 = U(b3) * 36100;
                let p4 = U(b4) * 190;
                let p5 = U(b5);
                let p6 = 0x38E2E;
                let point = p1 + p2 + p3 + p4 + p5 + p6;
                if (0x0000 <= point && point <= 0x7FFFFFFF) {
                    output.push(point);
                } else {
                    output.push(0xFFFD);
                };
                offset += 5;
            };
        } else {
            output.push(0xFFFD);
            offset += 1;
        };
    };

    return output;
};

const GB18030Encoder = (ucp, type = 'GB 18030-2005') => {
    let map2 = new Map();
    let map4 = new Map(map['GB 18030-2000 4']);
    let map4D = new Map();
    if (type === 'GB 18030-2000') {
        map2 = reverseMap(arrayIndexMap(map['GB 18030-2000 2']));
    } else if (type === 'GB 18030-2005') {
        map2 = reverseMap(arrayIndexMap(map['GB 18030-2005 2']));
        map4D = reverseMap(new Map(map['GB 18030-2005 4D']));
    };

    let output = [];

    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x007F) {
            output.push(point);
        } else if (map2.has(point)) {
            let index = map2.get(point);
            let b1 = Math.floor(index / 190) + 0x81;
            let b2 = index % 190;
            if (0x00 <= b2 && b2 <= 0x3E) {
                b2 += 0x40;
            } else if (0x3F <= b2 && b2 <= 0xBD) {
                b2 += 0x41;
            };
            output.push(b1, b2);
        } else if (0x0080 <= point && point <= 0x10FFFF) {
            let o1;
            let o2;
            let index;
            if (map4D.has(point)) {
                index = map4D.get(point);
            } else {
                for (let [key, value] of map4) {
                    if (point >= value) {
                        // o1 为 o2 相对 0x81308130 的码位数，即 o2 之 Index
                        // 连续的区块只保留第一组
                        o1 = key;
                        o2 = value;
                    } else {
                        break;
                    };
                };
                // 循环停止后，o1 与 o2 均对应 Point 所在连续区块的第一个字符
                // 从而 Point 与 o2 之差等于 Index 与 o1 之差，即 Point - o2 = Index - o1
                // 移项得 Index = Point - o2 + o1
                index = point - o2 + o1;
            };
            let b1 = Math.floor(index / 12600) + 0x81;
            let b2 = Math.floor(index / 1260) % 10 + 0x30;
            let b3 = Math.floor(index / 10) % 126 + 0x81;
            let b4 = index % 10 + 0x30;
            output.push(b1, b2, b3, b4);
        } else {
            output.push(0x84, 0x31, 0xA4, 0x37);
        };
    };

    return output;
};

const GB18030Decoder = (buf, type = 'GB 18030-2005') => {
    let map2 = new Map();
    let map4 = new Map(map['GB 18030-2000 4']);
    let map4D = new Map();
    if (type === 'GB 18030-2000') {
        map2 = arrayIndexMap(map['GB 18030-2000 2']);
    } else if (type === 'GB 18030-2005') {
        map2 = arrayIndexMap(map['GB 18030-2005 2']);
        map4D = new Map(map['GB 18030-2005 4D']);
    };

    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        if (0x00 <= b1 && b1 <= 0x7F) {
            output.push(b1);
            offset += 1;
        } else if (0x81 <= b1 && b1 <= 0xFE) {
            let b2 = buf[offset + 1];
            if (!(0x40 <= b2 && b2 <= 0x7E || 0x80 <= b2 && b2 <= 0xFE || 0x30 <= b2 && b2 <= 0x39)) {
                output.push(0xFFFD);
                offset += 1;
            } else if (0x40 <= b2 && b2 <= 0x7E || 0x80 <= b2 && b2 <= 0xFE) {
                let i1 = (b1 - 0x81) * 190;
                let i2 = b2;
                if (0x40 <= i2 && i2 <= 0x7E) {
                    i2 -= 0x40;
                } else if (0x80 <= i2 && i2 <= 0xFE) {
                    i2 -= 0x41;
                };
                output.push(map2.get(i1 + i2));
                offset += 2;
            } else {
                let b3 = buf[offset + 2];
                let b4 = buf[offset + 3];
                if (!(0x81 <= b3 && b3 <= 0xFE)) {
                    output.push(0xFFFD);
                    offset += 2;
                } else if (!(0x30 <= b4 && b4 <= 0x39)) {
                    output.push(0xFFFD);
                    offset += 3;
                } else if (0x81 <= b1 && b1 <= 0x84 || 0x90 <= b1 && b1 <= 0xE3) {
                    let i1 = (b1 - 0x81) * 12600;
                    let i2 = (b2 - 0x30) * 1260;
                    let i3 = (b3 - 0x81) * 10;
                    let i4 = b4 - 0x30;
                    let index = i1 + i2 + i3 + i4;
                    let o1;
                    let o2;
                    let point;
                    if (map4D.has(index)) {
                        point = map4D.get(index);
                    } else {
                        for (let [key, value] of map4) {
                            if (index >= key) {
                                o1 = key;
                                o2 = value;
                            } else {
                                break;
                            };
                        };
                        point = index - o1 + o2;
                    };
                    if (0x0080 <= point && point <= 0x10FFFF) {
                        output.push(point);
                    // 超出 U+10FFFF 无效
                    } else {
                        output.push(0xFFFD);
                    };
                    offset += 4;
                // 符合四字节格式，但未定义
                } else {
                    output.push(0xFFFD);
                    offset += 4;
                };
            };
        } else {
            output.push(0xFFFD);
            offset += 1;
        };
    };

    return output;
};

const UTFVLQEncoder = (ucp) => {
    let output = [];

    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x007F) {
            output.push(point);
        // 理论上 UTF-VLQ 长度不限，但因为 UCS 历史上最大也只到 U+7FFFFFFF（而且现在还只有 U+10FFFF），所以限制
        } else if (0x0080 <= point && point <= 0x7FFFFFFF) {
            let buf1 = [];
            let buf2 = [];
            while (point > 0) {
                buf1.push(point & 0x3F);
                point >>= 6;
            };
            buf2.push(buf1[0] + 0x80);
            for (let b of buf1.slice(1)) {
                buf2.push(b + 0xC0);
            };
            buf2.reverse();
            output.push(...buf2);
        } else {
            output.push(0xCF, 0xFF, 0xBD);
        };
    };

    return output;
};

const UTFVLQDecoder = (buf) => {
    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        if (0x00 <= b1 && b1 <= 0x7F) {
            output.push(b1);
            offset += 1;
        // 0xC0 为过剩容错
        } else if (0xC0 <= b1 && b1 <= 0xFF) {
            let bs = [];
            while (0xC0 <= buf[offset] && buf[offset] <= 0xFF) {
                bs.push(buf[offset]);
                offset += 1;
            };
            if (0x80 <= buf[offset] && buf[offset] <= 0xBF) {
                let point = 0;
                bs.push(buf[offset]);
                bs.reverse();
                bs.forEach((value, index) => {
                    point += (value & 0x3F) << index * 6;
                });
                if (0x0000 <= point && point <= 0x7FFFFFFF) {
                    output.push(point);
                } else {
                    output.push(0xFFFD);
                };
                offset += 1;
            } else {
                output.push(0xFFFD);
            };
        } else {
            output.push(0xFFFD);
            offset += 1;
        };
    };

    return output;
};

const GBKEncoder = (ucp) => {
    let map2 = reverseMap(arrayIndexMap(map['GBK 2']));

    let output = [];

    for (let point of ucp) {
        if (0x0000 <= point && point <= 0x007F) {
            output.push(point);
        } else if (map2.has(point)) {
            let index = map2.get(point);
            let b1 = Math.floor(index / 190) + 0x81;
            let b2 = index % 190;
            if (0x00 <= b2 && b2 <= 0x3E) {
                b2 += 0x40;
            } else if (0x3F <= b2 && b2 <= 0xBD) {
                b2 += 0x41;
            };
            output.push(b1, b2);
        } else {
            // GBK 没有「�」，用「?」代替
            output.push(0x3F);
        };
    };

    return output;
};

const GBKDecoder = (buf) => {
    let map2 = arrayIndexMap(map['GBK 2']);

    let output = [];

    let offset = 0;
    while (offset < buf.length) {
        let b1 = buf[offset];
        if (0x00 <= b1 && b1 <= 0x7F) {
            output.push(b1);
            offset += 1;
        } else if (0x81 <= b1 && b1 <= 0xFE) {
            let b2 = buf[offset + 1];
            if (!(0x40 <= b2 && b2 <= 0x7E || 0x80 <= b2 && b2 <= 0xFE)) {
                output.push(0xFFFD);
                offset += 1;
            } else {
                let i1 = (b1 - 0x81) * 190;
                let i2 = b2;
                if (0x40 <= i2 && i2 <= 0x7E) {
                    i2 -= 0x40;
                } else if (0x80 <= i2 && i2 <= 0xFE) {
                    i2 -= 0x41;
                };
                output.push(map2.get(i1 + i2));
                offset += 2;
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
        let input;
        if (Object.prototype.toString.call(str) === '[object String]') {
            input = str2ucp(str);
        } else {
            input = [];
        };
        let output = [];

        switch (this._encoding) {
            case 'UTF-8':
                output = UTF8Encoder(input, 'UTF-8');
                break;

            case 'CESU-8':
                output = UTF8Encoder(input, 'CESU-8');
                break;

            case 'MUTF-8':
                output = UTF8Encoder(input, 'MUTF-8');
                break;

            case 'UTF-16 BE':
                output = UTF16Encoder(input, true);
                break;

            case 'UTF-16 LE':
                output = UTF16Encoder(input, false);
                break;

            case 'UTF-16':
                output = UTF16Encoder([0xFEFF].concat(input));
                break;

            case 'UTF-32 BE':
                output = UTF32Encoder(input, true);
                break;

            case 'UTF-32 LE':
                output = UTF32Encoder(input, false);
                break;

            case 'UTF-32':
                output = UTF32Encoder([0xFEFF].concat(input));
                break;

            case 'UTF-1':
                output = UTF1Encoder(input);
                break;

            case 'GB 18030-2000':
                output = GB18030Encoder(input, 'GB 18030-2000');
                break;

            case 'GB 18030-2005':
                output = GB18030Encoder(input, 'GB 18030-2005');
                break;

            case 'GB 18030':
                output = GB18030Encoder(input);
                break;

            case 'CP 54936':
                output = GB18030Encoder(input, 'GB 18030-2000');
                break;

            case 'UTF-VLQ':
                output = UTFVLQEncoder(input);
                break;

            case 'GBK':
                output = GBKEncoder(input);
                break;

            default:
                break;
        };

        return new Uint8Array(output);;
    };
};

class TextDecoder {
    constructor (encoding = 'UTF-8') {
        this._encoding = stdName(encoding);
    };

    decode(buf) {
        let input;
        if (Object.prototype.toString.call(buf) === '[object Uint8Array]') {
            input = [...buf];
        } else {
            input = [];
        };
        let output = [];

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

            case 'UTF-16 BE':
                output = UTF16Decoder(input, true);
                break;

            case 'UTF-16 LE':
                output = UTF16Decoder(input, false);
                break;

            case 'UTF-16':
                if (input[0] === 0xFE && input[1] === 0xFF) {
                    output = UTF16Decoder(input.slice(2), true);
                } else if (input[0] === 0xFF && input[1] === 0xFE) {
                    output = UTF16Decoder(input.slice(2), false);
                };
                break;

            case 'UTF-32 BE':
                output = UTF32Decoder(input, true);
                break;

            case 'UTF-32 LE':
                output = UTF32Decoder(input, false);
                break;

            case 'UTF-32':
                if (input[0] === 0x00 && input[1] === 0x00 && input[2] === 0xFE && input[3] === 0xFF) {
                    output = UTF32Decoder(input.slice(4), true);
                } else if (input[0] === 0xFF && input[1] === 0xFE && input[2] === 0x00 && input[3] === 0x00) {
                    output = UTF32Decoder(input.slice(4), false);
                };
                break;

            case 'UTF-1':
                output = UTF1Decoder(input);
                break;

            case 'GB 18030-2000':
                output = GB18030Decoder(input, 'GB 18030-2000');
                break;

            case 'GB 18030-2005':
                output = GB18030Decoder(input, 'GB 18030-2005');
                break;

            case 'GB 18030':
                output = GB18030Decoder(input);
                break;

            case 'CP 54936':
                output = GB18030Decoder(input, 'GB 18030-2000');
                break;

            case 'UTF-VLQ':
                output = UTFVLQDecoder(input);
                break;

            case 'GBK':
                output = GBKDecoder(input);
                break;

            default:
                break;
        };

        return ucp2str(output);
    };
};

module.exports = {
    TextEncoder,
    TextDecoder,
    str2ucp,
    ucp2str,
    toLF,
    toCR,
    toCRLF,
    CJKCI2SVS,
    CJKSVS2CI,
    removeSVS,
};
