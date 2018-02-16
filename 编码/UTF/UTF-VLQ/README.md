# UTF-VLQ 系列

## 所收编码
### 架空编码
- UTF-VLQ

## 解说
UTF-VLQ 是使用 VLQ 的 Unicode 实作编码。

## 字节结构
## 与 Unicode 的对应关系
### U+D800~U+DFFF
这一块不会定义任何字符，都拿来给 UTF-16 表示 non-BMP。

如果启用这一块，那这被叫作 WTF-VLQ。
