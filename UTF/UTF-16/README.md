# UTF-16 系列

## 所收编码
### 实际存在
- [UTF-16 BE](https://www.unicode.org/versions/Unicode10.0.0/ch03.pdf#G31699)
- [UTF-16 LE](https://www.unicode.org/versions/Unicode10.0.0/ch03.pdf#G31866)
- [WTF-16 BE](https://simonsapin.github.io/wtf-8/#wtf-16)
- [WTF-16 LE](https://simonsapin.github.io/wtf-8/#wtf-16)

## 解说
UTF-16 BE 为大端序存储的 UTF-16。常加 BOM「0xFEFF」。

UTF-16 LE 为小端序存储的 UTF-16。常加 BOM「0xFFFE」。

## 字节结构
UTF-16 BE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00\~0xD7, 0xE0\~0xFF|0x00~0xFF|||63488|跳过 0xD8~0xDF，留给 non-BMP 表示用。|
|四字节|0xD8~0xDB|0x00~0xFF|0xDC~0xDF|0x00~0xFF|1048576||

UTF-16 LE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00~0xFF|0x00\~0xD7, 0xE0\~0xFF|||63488||
|四字节|0x00~0xFF|0xD8~0xDB|0x00~0xFF|0xDC~0xDF|1048576||

WTF-16 BE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00~0xFF|0x00~0xFF|||65536|存在 0xD8~0xDF。|
|四字节|0xD8~0xDB|0x00~0xFF|0xDC~0xDF|0x00~0xFF|1048576||

WTF-16 LE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00~0xFF|0x00~0xFF|||65536||
|四字节|0x00~0xFF|0xD8~0xDB|0x00~0xFF|0xDC~0xDF|1048576||

## 与 Unicode 的对应关系（UTF-16 BE）
BMP 部分直接将 Unicode Code Point 存储为双字节。

### non-BMP 的转换公式
先将 Unicode Code Point 减去 0x10000，存储为三字节。

这时的结构为：
- 0000aaaa
- aaaaaabb
- bbbbbbbb

（a 和 b 分别代表一组二进制串）

将其代入此结构，形成四字节：
- 110110aa
- aaaaaaaa
- 110111bb
- bbbbbbbb

由此就得到 non-BMP 的 UTF-16 BE。

### U+D800~U+DFFF
这一块不会定义任何字符，仅仅拿来表示 non-BMP。

如果启用这一块，那这被叫作 WTF-16。

## 大端序和小端序
对于 UTF-16 LE，只需要把 UTF-16 BE 每两字节倒过来存储就好了。

例如：

|字符|UTF-16 BE|UTF-16 LE|
|-|-|-|
|一|0x4E00|0x004E|
|𠀀|0xD840DC00|0x40D800DC|
