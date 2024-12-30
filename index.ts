import { createWorker, Worker } from 'tesseract.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chalk from 'chalk';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProcessConfig {
    inputDir: string;
    outputFile: string;
    preserveFormat: boolean;
}

async function processImages({ inputDir, outputFile, preserveFormat }: ProcessConfig): Promise<void> {
    let worker: Worker | null = null;
    try {
        console.log(chalk.blue('🚀 初始化 Tesseract worker...'));
        worker = await createWorker();
        
        // Initialize worker with Chinese and English language support
        console.log(chalk.yellow('📚 加载中文和英文语言支持...'));
        await worker.loadLanguage('chi_sim+eng');
        await worker.initialize('chi_sim+eng');
        
        // Set PSM mode based on format preservation preference
        console.log(chalk.cyan(`⚙️ 配置OCR参数 (${preserveFormat ? '保留' : '不保留'}文本格式)...`));
        await worker.setParameters({
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: preserveFormat ? '3' : '6'
        });

        // Read all files from input directory
        console.log(chalk.magenta('📂 读取图片目录...'));
        const files = await fs.readdir(inputDir);
        
        // Filter and sort image files
        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                return numA - numB;
            });

        if (imageFiles.length === 0) {
            console.log(chalk.red('❌ 未找到任何图片文件！'));
            return;
        }

        console.log(chalk.green(`📊 找到 ${imageFiles.length} 个图片文件`));
        let allText = '';

        // Process each image
        for (const [index, file] of imageFiles.entries()) {
            const progress = `[${index + 1}/${imageFiles.length}]`;
            console.log(chalk.yellow(`\n🔍 处理图片 ${progress}: ${file}`));
            
            const imagePath = path.join(inputDir, file);
            const startTime = Date.now();
            const { data: { text } } = await worker.recognize(imagePath);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            console.log(chalk.green(`✅ 完成处理 ${file} (用时: ${duration}s)`));
            
            // Add a separator between different images
            if (index > 0) {
                allText += '\n\n--- New Image ---\n\n';
            }
            
            allText += text;
        }

        // Write results to output file
        console.log(chalk.blue('\n💾 保存提取的文本...'));
        await fs.writeFile(outputFile, allText, 'utf8');
        
        console.log(chalk.green(`\n✨ 文本提取完成！结果已保存至: ${outputFile}`));
        
    } catch (error) {
        console.error(chalk.red('\n❌ 错误:'), error);
        throw error;
    } finally {
        if (worker) {
            console.log(chalk.yellow('🧹 清理资源...'));
            await worker.terminate();
        }
    }
}

async function main() {
    try {
        // 获取环境变量，如果命令行参数存在则优先使用命令行参数
        const args = process.argv.slice(2);
        const config: ProcessConfig = {
            inputDir: args[0] || process.env.INPUT_DIR || './images',
            outputFile: args[1] || process.env.OUTPUT_FILE || './output.txt',
            preserveFormat: args[2] !== undefined 
                ? args[2] !== 'false'
                : process.env.PRESERVE_FORMAT !== 'false'
        };

        // 创建输出目录（如果不存在）
        const outputDir = path.dirname(config.outputFile);
        await fs.mkdir(outputDir, { recursive: true }).catch(() => {});

        console.log(chalk.cyan('\n📋 OCR 配置信息:'));
        console.log(chalk.cyan('输入目录:'), config.inputDir);
        console.log(chalk.cyan('输出文件:'), config.outputFile);
        console.log(chalk.cyan('保留格式:'), config.preserveFormat);
        console.log(); // 空行

        await processImages(config);
    } catch (error) {
        console.error(chalk.red('\n❌ 程序执行失败:'), error);
        process.exit(1);
    }
}

main();
