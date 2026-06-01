# ChatGPT Question Navigator

一个最小可用的 Chrome / Edge 扩展：在 ChatGPT 网页右侧显示一列问题锚点，点击圆点跳转到对应的用户问题，鼠标悬停时显示问题内容。

## 安装

1. 打开 Chrome 或 Edge 的扩展管理页。
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择这个目录：`D:\Users\lenovo\Documents\Playground\chatgpt-question-nav`。
5. 打开或刷新 ChatGPT 页面。

## 功能

- 自动扫描当前会话中的用户提问。
- 右侧只显示点状按钮，不显示标题栏。
- 鼠标悬停到圆点上时显示具体问题。
- 点击圆点后平滑滚动到对应位置。
- 滚动时自动高亮当前附近的问题。
- 对话内容变化时自动刷新锚点。

## 当前实现说明

扩展主要依赖 ChatGPT 页面里的 `data-message-author-role="user"` 属性来识别用户消息。这个选择器比较直接，但 ChatGPT 网页结构未来可能变动；如果锚点突然失效，优先检查 `content.js` 里的 `collectUserQuestions()`。
