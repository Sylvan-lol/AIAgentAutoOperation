const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class FileService {
    constructor() {
        console.log('[FileService] Initialized');
        this.allowedRoots = this.getSystemAllowedRoots();
        console.log('[FileService] Allowed roots:', this.allowedRoots);
        
        this.blockedPaths = [
            /^[a-zA-Z]:\\windows/i,
            /^[a-zA-Z]:\\winnt/i,
            /^[a-zA-Z]:\\program files/i,
            /^[a-zA-Z]:\\program files \(x86\)/i,
            /^[a-zA-Z]:\\programdata/i,
            /^[a-zA-Z]:\\system volume information/i,
            /^[a-zA-Z]:\\recycler/i,
            /^[a-zA-Z]:\\\$recycle\.bin/i,
            /^[a-zA-Z]:\\boot/i,
            /^[a-zA-Z]:\\system32/i,
            /^[a-zA-Z]:\\windows\.old/i,
            /^[a-zA-Z]:\\perflogs/i,
            /^[a-zA-Z]:\\config\.msi/i
        ];
    }

    getSystemAllowedRoots() {
        const home = os.homedir();
        const roots = [];
        roots.push({ label: '桌面', path: path.join(home, 'Desktop') });
        roots.push({ label: '文档', path: path.join(home, 'Documents') });
        roots.push({ label: '下载', path: path.join(home, 'Downloads') });
        roots.push({ label: '图片', path: path.join(home, 'Pictures') });
        roots.push({ label: '音乐', path: path.join(home, 'Music') });
        roots.push({ label: '视频', path: path.join(home, 'Videos') });
        roots.push({ label: '用户目录', path: home });
        try {
            const drives = this.getAvailableDrives();
            for (const drive of drives) {
                const dl = drive.toUpperCase();
                if (dl !== (process.env.SystemDrive || 'C:').toUpperCase()) {
                    roots.push({ label: `${dl} 盘`, path: drive + '\\' });
                }
            }
        } catch(e) {}
        return roots;
    }

    getAvailableDrives() {
        const drives = [];
        if (process.platform === 'win32') {
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                try {
                    fs.accessSync(letter + ':\\', fs.constants.R_OK);
                    drives.push(letter + ':');
                } catch(e) {}
            }
        }
        return drives;
    }

    isPathBlocked(absPath) {
        const normalized = path.resolve(absPath);
        for (const pattern of this.blockedPaths) {
            if (pattern.test(normalized)) return true;
        }
        const parts = normalized.split(path.sep);
        for (const part of parts) {
            if (part.startsWith('$') || part === 'System Volume Information') return true;
        }
        return false;
    }

    isPathAllowed(absPath) {
        const normalized = path.resolve(absPath);
        if (this.isPathBlocked(normalized)) return false;
        for (const root of this.allowedRoots) {
            const rootPath = path.resolve(root.path);
            if (normalized === rootPath || normalized.startsWith(rootPath + path.sep)) return true;
        }
        return false;
    }

    resolveAndVerify(absPath) {
        if (!absPath || typeof absPath !== 'string') throw new Error('路径不能为空');
        const resolvedPath = path.resolve(absPath);
        if (!this.isPathAllowed(resolvedPath)) throw new Error('无权访问该路径（系统保护目录）');
        return resolvedPath;
    }

    async listFiles(absPath) {
        try {
            const dirPath = this.resolveAndVerify(absPath);
            if (!await fs.exists(dirPath)) throw new Error('路径不存在');
            const stat = await fs.stat(dirPath);
            if (!stat.isDirectory()) throw new Error('路径不是一个目录');
            
            const entryNames = await fs.readdir(dirPath);
            const items = [];
            for (const name of entryNames) {
                if (name.startsWith('.')) continue;
                const fullPath = path.join(dirPath, name);
                try {
                    const stats = await fs.stat(fullPath);
                    const isDir = stats.isDirectory();
                    items.push({
                        name,
                        path: fullPath,
                        size: isDir ? 0 : stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime,
                        isDirectory: isDir,
                        isFile: !isDir
                    });
                } catch(e) {}
            }
            items.sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
            const parentPath = path.dirname(dirPath);
            return { items, currentPath: dirPath, parentPath: this.isPathAllowed(parentPath) ? parentPath : null, canGoUp: parentPath !== dirPath && this.isPathAllowed(parentPath) };
        } catch(error) {
            console.error('[FileService] Error listing files:', error);
            throw error;
        }
    }

    async readFile(absPath) {
        try {
            const filePath = this.resolveAndVerify(absPath);
            if (!await fs.exists(filePath)) throw new Error(`文件不存在`);
            const stats = await fs.stat(filePath);
            if (!stats.isFile()) throw new Error(`不是文件`);
            if (stats.size > 10 * 1024 * 1024) throw new Error('文件过大（超过10MB）');
            
            const ext = path.extname(filePath).toLowerCase();
            const binaryExts = ['.exe','.dll','.so','.dylib','.bin','.dat'];
            if (binaryExts.includes(ext)) throw new Error('不支持读取此文件类型');
            
            return await fs.readFile(filePath, 'utf8');
        } catch(error) {
            console.error('[FileService] Error reading file:', error);
            throw error;
        }
    }

    /**
     * 获取文件的 base64 数据（用于预览图片/PDF 等）
     */
    async readFileBase64(absPath) {
        try {
            const filePath = this.resolveAndVerify(absPath);
            if (!await fs.exists(filePath)) throw new Error(`文件不存在`);
            const stats = await fs.stat(filePath);
            if (!stats.isFile()) throw new Error(`不是文件`);
            if (stats.size > 50 * 1024 * 1024) throw new Error('文件过大（超过50MB），无法预览');
            
            const ext = path.extname(filePath).toLowerCase();
            const data = await fs.readFile(filePath);
            const base64 = data.toString('base64');
            
            // 根据扩展名确定 MIME 类型
            const mimeMap = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.xls': 'application/vnd.ms-excel',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.ppt': 'application/vnd.ms-powerpoint',
                '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                '.mp4': 'video/mp4',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.zip': 'application/zip',
                '.rar': 'application/x-rar-compressed',
                '.7z': 'application/x-7z-compressed'
            };
            
            const mime = mimeMap[ext] || 'application/octet-stream';
            return { base64, mime, size: stats.size, name: path.basename(filePath) };
        } catch(error) {
            console.error('[FileService] Error reading file base64:', error);
            throw error;
        }
    }

    async writeFile(absPath, content) {
        try {
            const filePath = this.resolveAndVerify(absPath);
            const ext = path.extname(filePath).toLowerCase();
            const binaryExts = ['.exe','.dll','.so','.dylib','.bin','.dat'];
            if (binaryExts.includes(ext)) throw new Error('不支持写入此文件类型');
            const contentSize = Buffer.byteLength(content, 'utf8');
            if (contentSize > 10 * 1024 * 1024) throw new Error('文件内容过大（超过10MB）');
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf8');
            return { success: true, message: '文件保存成功' };
        } catch(error) {
            console.error('[FileService] Error writing file:', error);
            throw error;
        }
    }

    async createDirectory(absPath) {
        const dirPath = this.resolveAndVerify(absPath);
        if (await fs.exists(dirPath)) throw new Error(`目录已存在`);
        await fs.ensureDir(dirPath);
        return { success: true, message: '目录创建成功' };
    }

    async deleteItem(absPath) {
        const itemPath = this.resolveAndVerify(absPath);
        if (!await fs.exists(itemPath)) throw new Error(`文件不存在`);
        for (const root of this.allowedRoots) {
            if (path.resolve(root.path) === path.resolve(itemPath)) throw new Error('不允许删除安全根目录');
        }
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) { await fs.remove(itemPath); return { success: true, message: '目录已删除' }; }
        else { await fs.unlink(itemPath); return { success: true, message: '文件已删除' }; }
    }

    async renameItem(absOldPath, absNewPath) {
        const oldPath = this.resolveAndVerify(absOldPath);
        const newPath = this.resolveAndVerify(absNewPath);
        if (!await fs.exists(oldPath)) throw new Error(`文件不存在`);
        if (await fs.exists(newPath)) throw new Error(`新路径已存在`);
        await fs.rename(oldPath, newPath);
        return { success: true, message: '重命名成功' };
    }

    getAllowedRoots() {
        return this.allowedRoots.map(r => ({ label: r.label, path: r.path }));
    }
}

module.exports = new FileService();
