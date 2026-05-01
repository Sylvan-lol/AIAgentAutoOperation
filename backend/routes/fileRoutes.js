const express = require('express');
const router = express.Router();
const fileService = require('../services/FileService');

/**
 * GET /api/files/roots
 * 获取安全根目录列表
 */
router.get('/roots', (req, res) => {
    try {
        const roots = fileService.getAllowedRoots();
        res.status(200).json({ status: 'success', roots });
    } catch (error) {
        res.status(500).json({ status: 'error', message: '获取根目录列表失败' });
    }
});

/**
 * GET /api/files/list?path=xxx
 * 列出文件/目录
 */
router.get('/list', async (req, res) => {
    try {
        const { path: dirPath } = req.query;
        if (!dirPath) return res.status(400).json({ status: 'error', message: '路径不能为空' });
        const result = await fileService.listFiles(dirPath);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '列出文件失败' });
    }
});

/**
 * GET /api/files/content?path=xxx
 * 读取文本文件内容
 */
router.get('/content', async (req, res) => {
    try {
        const { path: filePath } = req.query;
        if (!filePath) return res.status(400).json({ status: 'error', message: '文件路径不能为空' });
        const content = await fileService.readFile(filePath);
        res.status(200).json({ status: 'success', content, path: filePath });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '读取文件失败' });
    }
});

/**
 * GET /api/files/preview?path=xxx
 * 获取文件 base64 预览数据（图片、PDF、Office等）
 */
router.get('/preview', async (req, res) => {
    try {
        const { path: filePath } = req.query;
        if (!filePath) return res.status(400).json({ status: 'error', message: '文件路径不能为空' });
        const result = await fileService.readFileBase64(filePath);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '预览失败' });
    }
});

/**
 * POST /api/files/write
 * 写入文件
 */
router.post('/write', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        if (!filePath) return res.status(400).json({ status: 'error', message: '文件路径不能为空' });
        if (content === undefined) return res.status(400).json({ status: 'error', message: '文件内容不能为空' });
        const result = await fileService.writeFile(filePath, content);
        res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '写入文件失败' });
    }
});

/**
 * POST /api/files/directory
 * 创建目录
 */
router.post('/directory', async (req, res) => {
    try {
        const { path: dirPath } = req.body;
        if (!dirPath) return res.status(400).json({ status: 'error', message: '目录路径不能为空' });
        const result = await fileService.createDirectory(dirPath);
        res.status(201).json({ status: 'success', message: result.message });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '创建目录失败' });
    }
});

/**
 * DELETE /api/files?path=xxx
 * 删除
 */
router.delete('/', async (req, res) => {
    try {
        const { path: itemPath } = req.query;
        if (!itemPath) return res.status(400).json({ status: 'error', message: '路径不能为空' });
        const result = await fileService.deleteItem(itemPath);
        res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '删除失败' });
    }
});

/**
 * PUT /api/files/rename
 * 重命名
 */
router.put('/rename', async (req, res) => {
    try {
        const { oldPath, newPath } = req.body;
        if (!oldPath || !newPath) return res.status(400).json({ status: 'error', message: '旧路径和新路径都不能为空' });
        const result = await fileService.renameItem(oldPath, newPath);
        res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '重命名失败' });
    }
});

// 旧接口兼容
router.get('/', async (req, res) => {
    try {
        const { path: dirPath } = req.query;
        const targetPath = dirPath || fileService.getAllowedRoots()[0]?.path || process.env.USERPROFILE + '\\Desktop';
        const result = await fileService.listFiles(targetPath);
        res.status(200).json({ status: 'success', files: result.items, currentPath: result.currentPath, breadcrumbs: [] });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message || '列出文件失败' });
    }
});

module.exports = router;
