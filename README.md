# Chroma Vision - 色彩敏感度挑战

这是一个面向艺术生的色彩敏感度挑战网页游戏。玩家需要在 25 个极其相似的色块中找出差异的那一个。难度会随着关卡提升而增加。

## 🚀 部署到 Vercel

你可以轻松地将此项目部署到 Vercel：

1. **推送到 GitHub**:
   - 在 GitHub 上创建一个新的仓库。
   - 将此代码推送到你的仓库：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin <你的仓库地址>
     git branch -M main
     git push -u origin main
     ```

2. **连接到 Vercel**:
   - 登录 [Vercel 控制台](https://vercel.com)。
   - 点击 "Add New" -> "Project"。
   - 导入你的 GitHub 仓库。

3. **配置环境变量**:
   - 在 Vercel 的项目设置中，添加以下环境变量：
     - `GEMINI_API_KEY`: 你的 Google AI SDK 密钥（如果后续需要使用 AI 功能）。
   - Vercel 会自动识别 Vite 项目并配置构建命令 (`npm run build`) 和输出目录 (`dist`)。

## 🛠️ 技术栈

- **React 19** + **TypeScript**
- **Vite** (构建工具)
- **Tailwind CSS 4** (样式)
- **Motion** (动画)
- **Lucide React** (图标)
- **Canvas Confetti** (特效)

## 📝 开发说明

- `src/App.tsx`: 游戏核心逻辑和 UI。
- `src/index.css`: 全局样式和 Tailwind 配置。
- `vite.config.ts`: Vite 配置文件，处理环境变量注入。

## 📄 开源协议

Apache-2.0
