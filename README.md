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
VITE_API_URL=https://galalive-backend-hgvmv6jjb-harker1544.vercel.app/api
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

访问地址: `https://galalive-client-lutts11wq-harker1544.vercel.app`

## 测试账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| user1 | 123456 | 普通用户 |
| host1 | 123456 | 主播 |

## GitHub上传操作说明

### 1. 确保代码最新

```bash
# 查看当前状态
git status

# 添加所有修改
git add .

# 提交修改
git commit -m "描述你的修改"
```

### 2. 推送代码到GitHub

```bash
# 推送主分支
git push origin main
```

### 3. 部署到GitHub Pages

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 4. 部署到Vercel

```bash
# 安装Vercel CLI (首次)
npm install -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

### 5. 更新后端API地址

确保 `src/api/axios.js` 中的API地址正确指向Vercel后端：

```javascript
// 远程环境使用Vercel后端地址
return 'https://galalive-backend-hgvmv6jjb-harker1544.vercel.app/api';
```