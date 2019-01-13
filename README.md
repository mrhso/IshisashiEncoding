# IshisashiEncoding
本项目收集各个编码与 Unicode 的对应关系，以及关于 Unicode 的那些事儿。

仓库很大，谨慎 Clone。（正论）

正由于仓库过大，网页分化到 [IshisashiEncoding-Website](https://github.com/mrhso/IshisashiEncoding-Website)，以便于进行部署。

## 术语说明
### UCS/Unicode
在 ISO/IEC 10646 中，字符集部分称作为「UCS」。

但是在 Unicode 中，字符集部分被称为「Unicode」。

本项目为了保持中立，称字符集部分为「UCS」。

### GB 与 GB/T
部分 GB 强制标准在现在已经降级为了 GB/T，因此本项目内称为 GB/T。如 GB/T 2312。

### 区位表示
在 JIS X 0208 等标准中，区位的表示在一个标准内都显得不够统一。

本项目采取 GB/T 2312 的表示，将区位表示成「(X)X-XX」格式。

对于面区位，由于是区位扩展而来，因此表示成「(X)X-(X)X-XX」格式。

## 所收编码
- [UTF](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF)
    - [UTF-8](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-8)
    - [UTF-16](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-16)
    - [UTF-32](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-32)
    - [UTF-1](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-1)
    - [UTF-7](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-7)
    - [UTF-EBCDIC](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-EBCDIC)
    - [UTF-VLQ](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/UTF-VLQ)
    - [GB 18030](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/GB%2018030)
    - [屁牌兼容 1 字节 ASCII、2 字节陆港台日常用、单码最多 3 字节、全覆盖 UCS 编码](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/Farter)
    - [屁牌兼容 1 字节 ASCII，2 字节 GB/T 2312 核心强化，单码最多 3 字节，全覆盖 UCS，自同步编码](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/UTF/Farter%202312)
- [GBK](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/GBK)
- [GB/T 2312](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/GB%EF%BC%8FT%202312)
- [GB/T 12345](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/GB%EF%BC%8FT%2012345)
- [JIS X 0201](https://github.com/mrhso/IshisashiEncoding/tree/master/%E7%BC%96%E7%A0%81/JIS%20X%200201)

## 远程仓库总表
- [GitHub](https://github.com/mrhso/IshisashiEncoding)
- [GitLab](https://gitlab.com/mrhso/IshisashiEncoding)
- [码云](https://gitee.com/mrhso/IshisashiEncoding)
- [Bitbucket](https://bitbucket.org/mrhso/ishisashiencoding)
- [Visual Studio Team Services](https://mrhso.visualstudio.com/IshisashiEncoding)

## 项目官方讨论群组
- QQ 群组 [609486016](https://jq.qq.com/?_wv=1027&k=5UoCrbI)
- Freenode IRC 频道 [#ezinput](https://webchat.freenode.net/?channels=%23ezinput)
- Telegram 群组 [@ezinput](https://t.me/ezinput)
