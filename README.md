# iDrone微信小程序后端

## 使用方法  

运行  
```node app.js```

测试  
```npm run test```  
*注意：请勿在线上环境运行测试用例!*


## 配置文件

配置文件存储在项目文件夹config目录下，environment.js包含各种变量，
例如MySQL服务器配置，redis服务器配置，文件存储地址等。
请务必修改这些配置文件以符合您的运行环境。  

environment.js中的```mode```字段可选项为```debug```和```product```，
两者的区别是```product```将使用HTTPS，请修改HTTPS相关设置以符合您的环境。  

## Session  

sessionId并未存储在cookies中，而是存储在HTTP请求头的ahthorization字段中。
格式为```Bearer token```

