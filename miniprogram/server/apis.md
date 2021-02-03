# 北航生活服务小程序通信接口

## `/account/login`
### 请求方式：`POST`
请求参数
```json
{
    code: String, // 微信提供的登录凭证
    userInfo：Object // 微信getUserInfo得到的UserInfo
}
```