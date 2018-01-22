# GB 2312 系列

## 所收编码
### 实际存在
- EUC-CN
- CP 20936

## 解说
GB 2312 是当时大陆模仿 JIS 的区位方法创建的字符集，拥有多种表示方式。其中最常见的是 EUC-CN。

对于其后续 GBK、GB 18030，请参考 [GBK](https://github.com/mrhso/IshisashiEncoding/tree/master/GBK)、[GB 18030](https://github.com/mrhso/IshisashiEncoding/tree/master/UTF/GB%2018030)。

CP 20936 是微软对 GB 2312 EUC-CN 的实现。

## 字节结构
EUC-CN 和 CP 20936 如下：

|字节数|第一字节|第二字节|码位数|注释|
|-|-|-|-|-|
|单字节|0x00~0x7F||128||
|双字节|0xA1~0xF7|0xA1~0xFE|8178||

虽然码位数摆在这里，实际上很难用这么多。
