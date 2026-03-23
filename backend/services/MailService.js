const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true, // 使用 SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // 验证邮件配置
        this.verifyConfig();
    }

    // 验证邮件配置
    async verifyConfig() {
        try {
            await this.transporter.verify();
            console.log('Email configuration is valid');
        } catch (error) {
            console.error('Email configuration error:', error);
        }
    }

    // 发送邮件
    async sendEmail(to, subject, text, html = null) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

    // 发送带有附件的邮件
    async sendEmailWithAttachment(to, subject, text, attachments, html = null) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html,
                attachments
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email with attachment sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email with attachment:', error);
            throw new Error('Failed to send email with attachment');
        }
    }
}

module.exports = new MailService();