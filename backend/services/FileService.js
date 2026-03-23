const fs = require('fs-extra');
const path = require('path');

class FileService {
    constructor() {
        // 使用桌面目录作为文件存储位置，确保用户可以在文件管理器中找到
        this.desktopDir = path.resolve(process.env.USERPROFILE, 'Desktop');
        this.uploadDir = path.resolve(this.desktopDir, 'OpenClawFiles');
        console.log('Upload directory:', this.uploadDir);
        // 确保上传目录存在
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            console.log('Created upload directory');
        }
        // 确保StartItUp目录存在
        this.startItUpDir = path.resolve(this.uploadDir, 'StartItUp');
        console.log('StartItUp directory:', this.startItUpDir);
        if (!fs.existsSync(this.startItUpDir)) {
            fs.mkdirSync(this.startItUpDir, { recursive: true });
            console.log('Created StartItUp directory');
        }
    }

    // 列出所有文件
    async listFiles() {
        try {
            const files = await fs.readdir(this.startItUpDir);
            const fileInfos = [];
            
            for (const file of files) {
                const filePath = path.join(this.startItUpDir, file);
                const stats = await fs.stat(filePath);
                
                fileInfos.push({
                    name: file,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                });
            }
            
            return fileInfos;
        } catch (error) {
            console.error('Error listing files:', error);
            throw new Error('Failed to list files');
        }
    }

    // 读取文件内容
    async readFile(fileName) {
        try {
            const filePath = path.join(this.startItUpDir, fileName);
            
            // 检查文件是否存在
            if (!await fs.exists(filePath)) {
                throw new Error('File not found');
            }
            
            const content = await fs.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    // 写入文件
    async writeFile(fileName, content) {
        try {
            const filePath = path.join(this.startItUpDir, fileName);
            await fs.writeFile(filePath, content, 'utf8');
            return { success: true, message: 'File written successfully' };
        } catch (error) {
            console.error('Error writing file:', error);
            throw new Error('Failed to write file');
        }
    }

    // 删除文件
    async deleteFile(fileName) {
        try {
            const filePath = path.join(this.startItUpDir, fileName);
            
            // 检查文件是否存在
            if (!await fs.exists(filePath)) {
                throw new Error('File not found');
            }
            
            await fs.unlink(filePath);
            return { success: true, message: 'File deleted successfully' };
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // 创建新文件
    async createFile(fileName, content = '') {
        try {
            // 确保StartItUp目录存在
            if (!fs.existsSync(this.startItUpDir)) {
                fs.mkdirSync(this.startItUpDir, { recursive: true });
                console.log('Created StartItUp directory');
            }
            
            const filePath = path.resolve(this.startItUpDir, fileName);
            console.log('Creating file at:', filePath);
            
            // 检查文件是否已存在
            if (await fs.exists(filePath)) {
                throw new Error('File already exists');
            }
            
            // 使用fs-extra的ensureFile方法，确保文件路径存在
            await fs.ensureFile(filePath);
            await fs.writeFile(filePath, content, 'utf8');
            return { success: true, message: 'File created successfully' };
        } catch (error) {
            console.error('Error creating file:', error);
            throw error;
        }
    }
}

module.exports = new FileService();