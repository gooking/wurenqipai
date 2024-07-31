# 无人棋牌室（兼容微信、支付宝全平台小程序和app）

本项目基于 uni-app 开发，运行和使用本项目，需要安装 uni-app 的开发工具 [HBuilderX](https://hx.dcloud.net.cn/Tutorial/install/windows)

uni-app 主要是基于 vue 技术，所以你要对 vue 有一定的基础，才能更好的使用以及对本项目做二次开发

[码云镜像，国内用户加速下载地址](https://gitee.com/javazj/wurenqipai)

## 扫码体验

请选择 “杭州西湖” 店，有测试包厢数据，可下单体验

<img src="https://dcdn.it120.cc/2023/10/08/b44c0900-bd54-4251-b0a8-0648e772b487.jpg" width="200px">

## 其他优秀开源模板推荐
- [天使童装](https://github.com/EastWorld/wechat-app-mall)   /  [码云镜像](https://gitee.com/javazj/wechat-app-mall)
- [天使童装（uni-app版本）](https://github.com/gooking/uni-app-mall)  /   [码云镜像](https://gitee.com/javazj/uni-app-mall)
- [简约精品商城（uni-app版本）](https://github.com/gooking/uni-app--mini-mall)  /   [码云镜像](https://gitee.com/javazj/uni-app--mini-mall)
- [舔果果小铺（升级版）](https://github.com/gooking/TianguoguoXiaopu)
- [面馆风格小程序](https://gitee.com/javazj/noodle_shop_procedures)
- [AI名片](https://github.com/gooking/visitingCard)
- [仿海底捞订座排队 (uni-app)](https://github.com/gooking/dingzuopaidui)  /   [码云镜像](https://gitee.com/javazj/dingzuopaidui)
- [H5版本商城/餐饮](https://github.com/gooking/vueMinishop)  /  [码云镜像](https://gitee.com/javazj/vueMinishop)
- [餐饮点餐](https://github.com/woniudiancang/bee)  / [码云镜像](https://gitee.com/woniudiancang/bee)
- [企业微展](https://github.com/gooking/qiyeweizan)  / [码云镜像](https://gitee.com/javazj/qiyeweizan)
- [无人棋牌室](https://github.com/gooking/wurenqipai)  / [码云镜像](https://gitee.com/javazj/wurenqipai)
- [酒店客房服务小程序](https://github.com/gooking/hotelRoomService)  / [码云镜像](https://gitee.com/javazj/hotelRoomService)
- [朋友圈发圈素材小程序](https://github.com/gooking/moments)  / [码云镜像](https://gitee.com/javazj/moments)

## 加我好友

| 微信 | 企微 |
| :------: | :------: |
| <img src="https://dcdn.it120.cc/2021/09/13/61a80363-9085-4a10-9447-e276a3d40ab3.jpeg" width="200px"> | <img src="https://dcdn.it120.cc/2023/08/19/d834dda1-b618-4a82-818d-05cd13fedddd.png" width="200px"> |

## 关于硬件的说明

无人棋牌室，需要硬件支持，用户在小程序预约后，可通过智能硬件的方式，远程控制包厢门锁开门，手机上即可控制包厢内电器使用，例如开灯、开空调等

硬件可以自行到 “api工厂” 购买，最便宜的一路控制的电路板只要49元

[IoT设备连接及使用教程](https://www.yuque.com/apifm/doc/yzrzn79c61h092vi)

## 使用教程

### 安装好 `HBuilderX` 后，将本项目文件夹直接拖进开发工具
只需要拖最里面那一层文件夹即可，有的用户拖了外面的文件夹，文件夹里面还有文件夹，导致最终项目无法运行
### 修改专属域名，和“api工厂”中台后台连接
`config.js` 文件，`subDomain` 改为你自己的专属域名 【登录后台，首页拉到底，就能看到你自己的专属域名了】
### 修改微信小程序的appid
`manifest.json` 文件，双击打开后，左侧选择 `微信小程序配置` ，把里面的 appid 改成你自己的appid，同时需要注意你要有这个小程序的开发权限哦~

### 后台测试数据克隆

登录后台 (如果没有“api工厂”账号，可以 [免费注册](https://admin.it120.cc/) 一个)，左侧菜单 “工厂设置” --> “数据克隆” --> “将别人的数据克隆给我”

对方商户ID填写 `117` 点击 “立即克隆”，克隆成功后，F5 刷新一下后台

### 后台配置小程序的 appid 和 appSecret

[《如何查看我的小程序的 APPID，在哪里看我的小程序的 APPID？》](https://jingyan.baidu.com/article/642c9d340305e3644a46f795.html)

登录后台，左侧菜单 “微信设置” --> “小程序设置”， 把你自己的 appId 和 appSecret 信息填进去

### 配置微信支付

左侧菜单，系统设置 -->  在线支付配置，填写您自己的微信支付的信息

微信支付需要你自己去微信支付申请开通： https://pay.weixin.qq.com/

### 配置小程序合法域名，这一步如果不做，手机上访问看不到任何数据

[《设置小程序合法服务器域名》](https://www.yuque.com/apifm/doc/tvpou9)

## 底部icon图标

https://www.iconfont.cn/collections/detail?spm=a313x.search_index.0.da5a778a4.3ddb3a81bZdTQT&cid=317

颜色色号： `#f3a73f` `#f9d39f`


## 常见问题

大家在使用过程中如果有遇到什么问题，可以提交 ISSUES ，我们会把大家都会遇到的问题，整理成常见问题后列到这里 
