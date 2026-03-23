const express = require('express');
const router = express.Router();
const fileService = require('../services/FileService');

// 列出所有文件
router.get('/', async (req, res) => {
    try {
        const files = await fileService.listFiles();
        res.status(200).json({
            status: 'success',
            files
        });
    } catch (error) {
        console.error('Error in file list route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to list files'
        });
    }
});

// 读取文件内容
router.get('/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const content = await fileService.readFile(fileName);
        res.status(200).json({
            status: 'success',
            content
        });
    } catch (error) {
        console.error('Error in file read route:', error);
        res.status(404).json({
            status: 'error',
            message: error.message
        });
    }
});

// 创建新文件
router.post('/', async (req, res) => {
    try {
        const { fileName, content } = req.body;
        
        if (!fileName) {
            return res.status(400).json({
                status: 'error',
                message: 'File name is required'
            });
        }
        
        const result = await fileService.createFile(fileName, content);
        res.status(201).json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        console.error('Error in file create route:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// 写入文件
router.put('/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({
                status: 'error',
                message: 'Content is required'
            });
        }
        
        const result = await fileService.writeFile(fileName, content);
        res.status(200).json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        console.error('Error in file write route:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// 删除文件
router.delete('/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const result = await fileService.deleteFile(fileName);
        res.status(200).json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        console.error('Error in file delete route:', error);
        res.status(404).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;