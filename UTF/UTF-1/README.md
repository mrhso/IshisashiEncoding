# UTF-1 系列

## 所收编码
### 实际存在
- [UTF-1](https://web.archive.org/web/20130423014856/http://www.itscj.ipsj.or.jp/ISO-IR/178.pdf)

### 架空编码
- WTF-1

## 解说
UTF-1 是一种兼容 ISO/IEC 2022 的 UTF，曾在 Unicode 1.0/1.1 中为推荐八位编码，但是在 Unicode 2.0 中被 UTF-8 [取代](https://www.unicode.org/versions/Unicode2.0.0/appC.pdf)。

## 字节结构
UTF-1 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|第五字节|码位数|注释|
|-|-|-|-|-|-|-|-|
|单字节|0x00~0x9F|||||160||
|双字节|0xA0~0xF5|0x21~0xFF||||16246||
|三字节|0xF6~0xFB|0x21~0xFF|0x21~0xFF|||214552|0xF72FC4~0xF73A78 通常不认为是合法码位。|
|五字节|0xFC|0x21|0x21~0x39|0x21~0xFF|0x21~0xFF|881106||

WTF-1 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|第五字节|码位数|注释|
|-|-|-|-|-|-|-|-|
|单字节|0x00~0x9F|||||160||
|双字节|0xA0~0xF5|0x21~0xFF||||16246||
|三字节|0xF6~0xFB|0x21~0xFF|0x21~0xFF|||216600|0xF72FC4~0xF73A78 被启用。|
|五字节|0xFC|0x21|0x21~0x39|0x21~0xFF|0x21~0xFF|881106||

## 与 Unicode 的对应关系（UTF-1）
### U+0000~U+009F
直接表示成单字节。

### U+00A0~U+00FF
表示成单字节，然后在前面加上一个字节「0xA0」。

如「¾」表示成「0xA0BE」。

### U+0100~U+4015 的转换公式
定义「/」为整除（保留整数部分）、「%」为取余，取余和乘除定义为同级运算。

定义函数 T：

|输入 z|函数 T(z)|输出 T(z)|
|-|-|-|
|0x00~0x5D|z+0x21|0x21~0x7E|
|0x5E~0xBD|z+0x42|0xA0~0xFF|
|0xBE~0xDE|z-0xBE|0x00~0x20|
|0xDF~0xFF|z-0x60|0x7F~0x9F|

Unicode Code Point 记作 U。

则公式为：

0x100((U-0x100)/0xBE+0xA1)+T((U-0x100)%0xBE)

拆开来看，就可以这么理解：

先将 Unicode Code Point 减去 0x100，记作 U₀。

然后将 U₀ 除以 0xBE，取出商和余数，分别记作 a₁ 和 b₁。

设 t₁=T(b₁)。

则两个字节分别是：
- a₁+0xA1
- t₁

### U+4016~U+38E2D 的转换公式
Unicode Code Point 记作 U。

则公式为：

0x10000((U-0x4016)/0xBE²+0xF6)+0x100(T((U-0x4016)/0xBE%0xBE))+T((U-0x4016)%0xBE)

拆开来看，就可以这么理解：

先将 Unicode Code Point 减去 0x4016，记作 U₀。

然后将 U₀ 除以 0xBE²，取出商，记作 a₁。

将 U₀ 除以 0xBE，取出商和余数，分别记作 a₂ 和 b₂。

将 a₂ 除以 0xBE，取出余数，记作 b₃。

设 t₂=T(b₃)、t₃=T(b₂)。

则三个字节分别是：
- a₁+0xF6
- t₂
- t₃

### U+38E2E\~U+10FFFF（以及废案 U+110000\~U+7FFFFFFF）的转换公式
Unicode Code Point 记作 U。

则公式为：

0x100000000((U-0x38E2E)/0xBE⁴+0xFC)+0x1000000(T((U-0x38E2E)/0xBE³%0xBE))+0x10000(T((U-0x38E2E)/0xBE²%0xBE))+0x100(T((U-0x38E2E)/0xBE%0xBE))+T((U-0x38E2E)%0xBE)

拆开来看，就可以这么理解：

先将 Unicode Code Point 减去 0x38E2E，记作 U₀。

然后将 U₀ 除以 0xBE⁴，取出商，记作 a₁。

将 U₀ 除以 0xBE³，取出商，记作 a₂。

将 U₀ 除以 0xBE²，取出商，记作 a₃。

将 U₀ 除以 0xBE，取出商和余数，分别记作 a₄ 和 b₄。

将 a₂、a₃、a₄ 都除以 0xBE，取出余数，分别记作 b₅、b₆、b₇。

设 t₂=T(b₅)、t₃=T(b₆)、t₄=T(b₇)、t₅=T(b₄)。

则五个字节分别是：
- a₁+0xFC
- t₂
- t₃
- t₄
- t₅

### U+D800~U+DFFF
这一块不会定义任何字符，都拿来给 UTF-16 表示 non-BMP。

如果启用这一块，那这被叫作 WTF-1。
