# Picture to Text Converter

This is an image text extraction service developed using Node.js and Tesseract.js. It can extract text from sequentially named images and keep the text format.

这是一个使用 Node.js 和 Tesseract.js 开发的图片文字提取服务。它可以从按顺序命名的图片中提取文本，并保持文本格式。

## 功能特点

- 支持从多个图片按顺序提取文本
- 可选择是否保留文本格式（如段落布局）
- 支持中文和英文识别
- 自动按文件名数字顺序处理图片
- 将所有提取的文本保存到单个文本文件中

## 安装

1. 确保已安装 Node.js
2. 克隆或下载此仓库
3. 在项目目录中运行：
   ```bash
   npm install
   ```

## 使用方法

基本用法：
```bash
node index.js <输入图片目录> <输出文本文件> [是否保留格式]
```

例如：
```bash
node index.js ./images output.txt true
```

参数说明：
- 输入图片目录：包含要处理的图片的文件夹路径
- 输出文本文件：提取的文本将保存到的文件路径
- 是否保留格式：可选参数，默认为 true。设置为 false 则会将文本转换为简单的块状格式

## 支持的图片格式

- JPG/JPEG
- PNG
- GIF
- BMP

## 注意事项

1. 图片文件名建议包含数字以便排序（例如：1.jpg, 2.jpg, 3.jpg）
2. 程序会自动按文件名中的数字顺序处理图片
3. 每个图片的文本之间会用分隔符分开
