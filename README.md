# Gala Live - App客户端

Gala Live 直播平台的用户端App，基于 React + Tailwind CSS 构建。

## 技术栈

- React 19.x
- Tailwind CSS 3.4.x
- Vite 6.x
- Axios (HTTP请求)
- Socket.io-client (实时通信)
- Lucide React (图标库)

## 功能模块

| 模块 | 说明 |
|------|------|
| 首页 | Banner轮播、热门直播、关注主播、分类浏览 |
| 直播间 | 弹幕聊天、礼物赠送、点赞关注 |
| 短视频 | 视频浏览、点赞收藏 |
| 消息 | 私信聊天、系统通知 |
| 个人中心 | 用户信息、充值提现、实名认证 |
| 排行榜 | 收入榜、消费榜 |
| 等级系统 | 用户等级、经验值 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 5180)
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

创建 `.env` 文件：

```
# 本地开发
VITE_API_URL=http://localhost:3002/api

# Vercel部署
VITE_API_URL=https://galalive-backend-ahzt3h38y-harker1544.vercel.app/api
```

## 部署

### GitHub Pages

```bash
# 配置 vite.config.js 中 base: '/Galalive-client/'
npm run build
npm run deploy
```

访问地址: `https://harker1544525153-lang.github.io/Galalive-client/`

### Vercel

1. 导入 GitHub 仓库 [Galalive-client](https://github.com/harker1544525153-lang/Galalive-client)
2. 配置环境变量 `VITE_API_URL`
3. 自动构建部署

访问地址: `https://galalive-client-mjckme0dh-harker1544.vercel.app`

## 测试账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| user1 | 123456 | 普通用户 |
| host1 | 123456 | 主播 |
| admin | 123456 | 管理员(后台) |