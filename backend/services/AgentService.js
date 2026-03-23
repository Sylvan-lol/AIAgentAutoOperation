const OpenAI = require('openai');
const fileService = require('./FileService');

// 延迟加载邮件服务，避免初始化时的错误
let mailService;
try {
  mailService = require('./MailService');
} catch (error) {
  console.error('Error loading MailService:', error);
  mailService = null;
}

class AgentService {
    constructor() {
        console.log('LLM_API_KEY:', process.env.LLM_API_KEY ? 'Set' : 'Not set');
        console.log('LLM_BASE_URL:', process.env.LLM_BASE_URL);
        console.log('LLM_MODEL:', process.env.LLM_MODEL);
        this.openai = new OpenAI({
            apiKey: process.env.LLM_API_KEY,
            baseURL: process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1'
        });
    }

    // 处理用户消息
    async handleMessage(message, conversationHistory = []) {
        try {
            const tools = [
                {
                    type: "function",
                    function: {
                        name: "list_files",
                        description: "列出所有文件",
                        parameters: {
                            type: "object",
                            properties: {},
                            required: []
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "read_file",
                        description: "读取文件内容",
                        parameters: {
                            type: "object",
                            properties: {
                                fileName: {
                                    type: "string",
                                    description: "文件名"
                                }
                            },
                            required: ["fileName"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "write_file",
                        description: "写入文件内容",
                        parameters: {
                            type: "object",
                            properties: {
                                fileName: {
                                    type: "string",
                                    description: "文件名"
                                },
                                content: {
                                    type: "string",
                                    description: "文件内容"
                                }
                            },
                            required: ["fileName", "content"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "create_file",
                        description: "创建新文件",
                        parameters: {
                            type: "object",
                            properties: {
                                fileName: {
                                    type: "string",
                                    description: "文件名"
                                },
                                content: {
                                    type: "string",
                                    description: "文件内容，默认为空",
                                    default: ""
                                }
                            },
                            required: ["fileName"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "delete_file",
                        description: "删除文件",
                        parameters: {
                            type: "object",
                            properties: {
                                fileName: {
                                    type: "string",
                                    description: "文件名"
                                }
                            },
                            required: ["fileName"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "send_email",
                        description: "发送邮件",
                        parameters: {
                            type: "object",
                            properties: {
                                to: {
                                    type: "string",
                                    description: "收件人邮箱"
                                },
                                subject: {
                                    type: "string",
                                    description: "邮件主题"
                                },
                                text: {
                                    type: "string",
                                    description: "邮件正文"
                                }
                            },
                            required: ["to", "subject", "text"]
                        }
                    }
                }
            ];

            // 构建消息列表，包含系统消息、对话历史和当前消息
            const messages = [
                {
                    role: "system",
                    content: "你是一个企业级AI助手，名为Open Claw。你可以帮助用户管理文件和发送邮件。当用户请求需要执行文件操作或发送邮件时，你应该使用相应的工具函数。如果信息不足，你需要向用户询问缺失的信息。"
                },
                ...conversationHistory,
                {
                    role: "user",
                    content: message
                }
            ];

            const response = await this.openai.chat.completions.create({
                model: process.env.LLM_MODEL || "nvidia/nemotron-3-nano-30b-a3b:free",
                messages: messages,
                tools: tools,
                tool_choice: "auto"
            });

            const assistantMessage = response.choices[0].message;

            // 检查是否需要调用工具
            if (assistantMessage.tool_calls) {
                const toolCalls = assistantMessage.tool_calls;
                const toolResults = [];

                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    let toolResult;

                    try {
                        switch (functionName) {
                            case "list_files":
                                toolResult = await fileService.listFiles();
                                break;
                            case "read_file":
                                toolResult = await fileService.readFile(functionArgs.fileName);
                                break;
                            case "write_file":
                                toolResult = await fileService.writeFile(functionArgs.fileName, functionArgs.content);
                                break;
                            case "create_file":
                                toolResult = await fileService.createFile(functionArgs.fileName, functionArgs.content || "");
                                break;
                            case "delete_file":
                                toolResult = await fileService.deleteFile(functionArgs.fileName);
                                break;
                            case "send_email":
                                if (mailService) {
                                    toolResult = await mailService.sendEmail(functionArgs.to, functionArgs.subject, functionArgs.text);
                                } else {
                                    toolResult = { error: "Email service is not available" };
                                }
                                break;
                            default:
                                toolResult = { error: "Unknown function" };
                        }

                        toolResults.push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: functionName,
                            content: JSON.stringify(toolResult)
                        });
                    } catch (error) {
                        toolResults.push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: functionName,
                            content: JSON.stringify({ error: error.message })
                        });
                    }
                }

                // 再次调用 LLM 获取最终响应
                const finalResponse = await this.openai.chat.completions.create({
                    model: process.env.LLM_MODEL || "nvidia/nemotron-3-nano-30b-a3b:free",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个企业级AI助手，名为Open Claw。你可以帮助用户管理文件和发送邮件。当用户请求需要执行文件操作或发送邮件时，你应该使用相应的工具函数。如果信息不足，你需要向用户询问缺失的信息。"
                        },
                        ...conversationHistory,
                        {
                            role: "user",
                            content: message
                        },
                        assistantMessage,
                        ...toolResults
                    ]
                });

                return finalResponse.choices[0].message.content;
            } else {
                // 直接返回 AI 响应
                return assistantMessage.content;
            }
        } catch (error) {
            console.error('Error in AgentService:', error);
            return "Sorry, I encountered an error. Please try again later.";
        }
    }
}

module.exports = new AgentService();