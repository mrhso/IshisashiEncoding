# UTF-8 系列

## 所收编码
### 实际存在
- [UTF-8](https://www.unicode.org/versions/Unicode10.0.0/ch03.pdf#G31703)
- [CESU-8](https://www.unicode.org/reports/tr26/)
- [MUTF-8](https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html#modified-utf-8)

## 解说
UTF-8 兼容 ASCII。通常不加 BOM「0xEFBBBF」，也有常常加的情形。

CESU-8 基本同 UTF-8，但将 non-BMP 以 UTF-16 代理对表示。

MUTF-8 也基本同 CESU-8，但是将 U+0000 表示成「0xC080」。

## 字节结构
以下码位数统计剔除过剩码位。

UTF-8 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|单字节|0x00~0x7F||||128||
|双字节|0xC2~0xDF|0x80~0xBF|||1920|0xC0~0xC1 属于过剩码位。|
|三字节|0xE0~0xEF|0x80~0xBF|0x80~0xBF||61440|0xEDA080~0xEDBFBF 通常不认为是合法码位。|
|四字节|0xF0~0xF4|0x80~0xBF|0x80~0xBF|0x80~0xBF|1048576||

CESU-8 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|第五字节|第六字节|码位数|注释|
|-|-|-|-|-|-|-|-|-|
|单字节|0x00~0x7F||||||128||
|双字节|0xC2~0xDF|0x80~0xBF|||||1920||
|三字节|0xE0~0xEF|0x80~0xBF|0x80~0xBF||||61440|0xEDA080~0xEDBFBF 留给 non-BMP。|
|六字节|0xED|0xA0~0xAF|0x80~0xBF|0xED|0xB0~0xBF|0x80~0xBF|1048576|以 UTF-16 代理对表示 non-BMP。|

MUTF-8 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|第五字节|第六字节|码位数|注释|
|-|-|-|-|-|-|-|-|-|
|单字节|0x01~0x7F||||||127||
|双字节|0xC0, 0xC2~0xDF|0x80~0xBF|||||1921|使用 0xC080 表示 U+0000。|
|三字节|0xE0~0xEF|0x80~0xBF|0x80~0xBF||||61440||
|六字节|0xED|0xA0~0xAF|0x80~0xBF|0xED|0xB0~0xBF|0x80~0xBF|1048576||

## 与 Unicode 的对应关系（UTF-8）
U+0000~U+007F 直接表示成单字节。

### U+0080~U+07FF 的转换公式
先将 Unicode Code Point 存储为双字节。

这时的结构为：
- 00000aaa
- aabbbbbb

（a 和 b 分别代表一组二进制串）

将其代入此结构，形成双字节：
- 110aaaaa
- 10bbbbbb

由此就得到 U+0000~U+007F 的 UTF-8。

### U+0800~U+FFFF 的转换公式
先将 Unicode Code Point 存储为双字节。

这时的结构为：
- aaaabbbb
- bbcccccc

将其代入此结构，形成三字节：
- 1110aaaa
- 10bbbbbb
- 10cccccc

由此就得到 U+0800~U+FFFF 的 UTF-8。

### non-BMP 的转换公式
先将 Unicode Code Point 存储为三字节。

这时的结构为：
- 000aaabb
- bbbbcccc
- ccdddddd

将其代入此结构，形成四字节：
- 11110aaa
- 10bbbbbb
- 10cccccc
- 10dddddd

由此就得到 non-BMP 的 UTF-8。

### U+D800~U+DFFF
尽管表格列出来了，但是这一块不会定义任何字符，都是拿来给 UTF-16 表示 non-BMP 的。

## 与 Unicode 的对应关系（CESU-8）
基本同 UTF-8 一致，但是 non-BMP 使用 UTF-16 代理对表示。

详见 [UTF-16](https://github.com/mrhso/IshisashiEncoding/blob/master/UTF/UTF-16/Note.md#non-bmp-的转换公式)。

## 与 Unicode 的对应关系（MUTF-8）
基本同 CESU-8 一致，但是 U+0000 表示成「0xC080」。
