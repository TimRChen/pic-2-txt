import { createWorker } from 'tesseract.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processImages(inputDir, outputFile, preserveFormat = true) {
    try {
        // Create Tesseract worker
        const worker = await createWorker();
        
        // Initialize worker with Chinese and English language support
        await worker.loadLanguage('chi_sim+eng');
        await worker.initialize('chi_sim+eng');
        
        // Set PSM mode based on format preservation preference
        // PSM 6 = Assume a uniform block of text
        // PSM 3 = Auto-detect, will try to preserve layout
        await worker.setParameters({
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: preserveFormat ? '3' : '6'
        });

        // Read all files from input directory
        const files = await fs.readdir(inputDir);
        
        // Filter and sort image files
        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file))
            .sort((a, b) => {
                // Extract numbers from filenames for natural sorting
                const numA = parseInt(a.match(/\d+/) || 0);
                const numB = parseInt(b.match(/\d+/) || 0);
                return numA - numB;
            });

        let allText = '';

        // Process each image
        for (const [index, file] of imageFiles.entries()) {
            console.log(`Processing image ${index + 1}/${imageFiles.length}: ${file}`);
            
            const imagePath = path.join(inputDir, file);
            const { data: { text } } = await worker.recognize(imagePath);
            
            // Add a separator between different images
            if (index > 0) {
                allText += '\n\n--- New Image ---\n\n';
            }
            
            allText += text;
        }

        // Write results to output file
        await fs.writeFile(outputFile, allText, 'utf8');
        
        // Terminate worker
        await worker.terminate();
        
        console.log(`Text extraction completed. Results saved to: ${outputFile}`);
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Check if directory arguments are provided
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node index.js <input_directory> <output_file> [preserve_format]');
    console.log('Example: node index.js ./images output.txt true');
    process.exit(1);
}

const inputDir = args[0];
const outputFile = args[1];
const preserveFormat = args[2] !== 'false'; // Default to true unless explicitly set to false

processImages(inputDir, outputFile, preserveFormat)
    .catch(console.error);
