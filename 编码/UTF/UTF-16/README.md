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
|双字节|0x00\~0xD7, 0xE0\~0xFF|0x00\~0xFF|||63488|跳过 0xD8\~0xDF，留给 non-BMP 表示用。|
|四字节|0xD8\~0xDB|0x00\~0xFF|0xDC\~0xDF|0x00\~0xFF|1048576||

UTF-16 LE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00\~0xFF|0x00\~0xD7, 0xE0\~0xFF|||63488||
|四字节|0x00\~0xFF|0xD8\~0xDB|0x00\~0xFF|0xDC\~0xDF|1048576||

WTF-16 BE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00\~0xFF|0x00\~0xFF|||65536|存在 0xD8\~0xDF。|
|四字节|0xD8\~0xDB|0x00\~0xFF|0xDC\~0xDF|0x00\~0xFF|1048576||

WTF-16 LE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|双字节|0x00\~0xFF|0x00\~0xFF|||65536||
|四字节|0x00\~0xFF|0xD8\~0xDB|0x00\~0xFF|0xDC\~0xDF|1048576||

## 与 UCS 的对应关系（UTF-16 BE）
### BMP
直接将 UCS Code Point 存储为双字节。

### non-BMP
先将 UCS Code Point 减去 0x10000，存储为三字节。

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

拆开来看，就可以这么理解：

先将 UCS Code Point 减去 0x10000，记作 U。

将 U 除以 262144，取出商和余数，分别记作 a₁ 和 b₁（即：(0xFF-0x00+1)(0xDF-0xDC+1)(0xFF-0x00+1)=262144）

将 b₁ 除以 1024，取出商和余数，分别记作 a₂ 和 b₂（即：(0xDF-0xDC+1)(0xFF-0x00+1)=1024，也就相当于把二进制的后面 10 位和前面分离了）

将 b₂ 除以 256，取出商和余数，分别记作 a₃ 和 b₃（即：0xFF-0x00+1=256）

则四个字节分别是：
- a₁+0xD8（即：a₁ 表示是第几次 262144 循环）
- a₂（即：a₂ 表示是第几次 1024 循环）
- a₃+0xDC（即：a₃ 表示是第几次 256 循环）
- b₃（即：b₃ 表示 256 循环后的第几个）

由此就得到 non-BMP 的 UTF-16 BE。

### U+D800\~U+DFFF
这一块不会定义任何字符，仅仅拿来表示 non-BMP。

如果启用这一块，那这被叫作 WTF-16。

## 大端序和小端序
对于 UTF-16 LE，只需要把 UTF-16 BE 每两字节倒过来存储就好了。

例如：

|字符|UTF-16 BE|UTF-16 LE|
|-|-|-|
|一|0x4E00|0x004E|
|𠀀|0xD840DC00|0x40D800DC|
