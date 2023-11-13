# UTF-32
## 所收编码
### 实际存在
- [UTF-32BE](https://www.unicode.org/versions/Unicode15.0.0/ch03.pdf#G28875)
- [UTF-32LE](https://www.unicode.org/versions/Unicode15.0.0/ch03.pdf#G36145)

## 解说
UTF-32BE 为大端序存储的 UTF-32。常加 BOM 0x0000FEFF。

UTF-32LE 为小端序存储的 UTF-32。常加 BOM 0xFFFE0000。

## 字节结构
以下码位数统计剔除过剩码位。

UTF-32BE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|四字节|0x00|0x00\~0x10|0x00\~0xFF|0x00\~0xFF|1112064||

UTF-32LE 如下：

|字节数|第一字节|第二字节|第三字节|第四字节|码位数|注释|
|-|-|-|-|-|-|-|
|四字节|0x00\~0xFF|0x00\~0xFF|0x00\~0x10|0x00|1112064||

## 与 UCS 的对应关系（UTF-32BE）
### U+0000\~U+10FFFF（以及废案 U+110000\~U+7FFFFFFF）
直接将 UCS Code Point 表示成四字节。

## 大端序和小端序
对于 UTF-32LE，只需要把 UTF-32BE 每四字节倒过来存储就好了。

例如：

|字符|UTF-16BE|UTF-16LE|
|-|-|-|
|一|0x00004E00|0x004E0000|
|𠀀|0x00020000|0x00000200|
