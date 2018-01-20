# UTF-1 系列

## 所收编码
### 实际存在
- [UTF-8](https://web.archive.org/web/20130423014856/http://www.itscj.ipsj.or.jp/ISO-IR/178.pdf)

## 解说
UTF-1 是一种兼容 ISO/IEC 2022 的 UTF，曾在 Unicode 1.0 中为推荐八位编码，但是现在已被 UTF-8 取代。

## 字节结构

## 与 Unicode 的对应关系（UTF-1）
U+0000~U+009F 直接表示成单字节。

### U+D800~U+DFFF
这一块不会定义任何字符，都拿来给 UTF-16 表示 non-BMP。
