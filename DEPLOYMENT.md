# 部署指南

## 项目结构

```
├── src/             # 前端源代码
├── weapp/           # 微信小程序代码
├── index.html       # H5页面入口
├── package.json     # 项目配置
└── vite.config.js   # Vite配置
```

## 部署步骤

### 1. 前置条件

- GitHub账号
- 微信云开发环境（已配置）
- Node.js环境（用于本地构建）

### 2. 构建项目

在本地运行以下命令构建项目：

```bash
npm run build
```

构建完成后，会生成一个 `dist` 目录，包含所有静态资源。

### 3. 创建GitHub仓库

1. 登录GitHub，创建一个新的仓库
2. 将本地项目推送到GitHub仓库

### 4. 配置GitHub Pages

1. 在GitHub仓库页面，点击 `Settings` -> `Pages`
2. 在 `Build and deployment` 部分，选择 `Deploy from a branch`
3. 在 `Branch` 部分，选择 `main` 分支，`/docs` 目录，然后点击 `Save`
4. 等待部署完成，GitHub会提供一个访问URL

### 5. 部署到GitHub Pages

将构建产物复制到 `docs` 目录：

```bash
mkdir -p docs
cp -r dist/* docs/
```

然后提交并推送到GitHub：

```bash
git add docs/
git commit -m "Deploy to GitHub Pages"
git push
```

### 6. 配置微信云开发

1. 确保微信云函数 `bookings` 已经部署成功
2. 在云函数控制台，开启 `允许匿名访问` 选项
3. 确保云数据库 `bookings` 集合已经创建

### 7. 访问H5页面

部署完成后，可以通过GitHub Pages提供的URL访问H5页面，例如：

```
https://<username>.github.io/<repository-name>
```

## 技术说明

### 前端架构

- 框架：Vue 3
- 构建工具：Vite
- 样式：Tailwind CSS
- 日期处理：dayjs

### 后端架构

- 微信云开发（云函数 + 云数据库）
- 云函数名称：`bookings`
- 云数据库集合：`bookings`

### API调用

H5页面通过微信云开发的HTTP API调用云函数：

```javascript
fetch('https://api.weixin.qq.com/tcb/invokecloudfunction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    env: 'cloud1-2gs6ioay8f351f18',
    name: 'bookings',
    data: JSON.stringify({ action: 'getBookings' })
  })
})
```

### 注意事项

1. **跨域问题**：由于GitHub Pages是静态网站，调用微信云开发的HTTP API可能会遇到跨域问题。解决方案是在云函数中配置CORS，或者使用微信云开发的HTTP API的合法域名配置。

2. **权限问题**：确保云函数允许匿名访问，否则H5页面无法调用。

3. **部署环境**：GitHub Pages只支持静态网站，所以所有后端逻辑都需要通过微信云开发来处理。

4. **性能优化**：对于频繁的预约查询，可以考虑使用缓存策略，减少API调用次数。

## 故障排查

### 1. 云函数调用失败

- 检查云函数是否部署成功
- 检查云函数的环境ID是否正确
- 检查云函数的权限设置

### 2. 数据库操作失败

- 检查云数据库集合是否存在
- 检查数据库权限设置
- 检查云函数的错误日志

### 3. 跨域问题

- 检查浏览器控制台的错误信息
- 配置云函数的CORS设置

### 4. 部署失败

- 检查GitHub Pages的配置是否正确
- 检查构建产物是否正确复制到docs目录
- 检查GitHub仓库的分支设置
