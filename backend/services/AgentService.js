const OpenAI = require('openai');
const path = require('path');
const os = require('os');
const fileService = require('./FileService');
const schedulerService = require('./SchedulerService');
const memoryService = require('./MemoryService');

// 延迟加载邮件服务
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
        this.model = process.env.LLM_MODEL || "nvidia/nemotron-3-nano-30b-a3b:free";

        // 获取当前系统用户目录信息（注入到 AI 提示中）
        this.homeDir = os.homedir();
        this.desktopPath = path.join(this.homeDir, 'Desktop');
        this.documentsPath = path.join(this.homeDir, 'Documents');
        this.downloadsPath = path.join(this.homeDir, 'Downloads');
    }

    async handleMessage(message, conversationHistory = [], user = null) {
        try {
            const tools = [
                {
                    type: "function",
                    function: {
                        name: "list_directory",
                        description: "列出指定路径下的所有文件和文件夹（包括桌面、文档、下载等任意可访问目录）。如果用户询问某个目录的内容，使用此工具。结果会返回文件/文件夹的名称、路径、大小、修改时间等信息。",
                        parameters: {
                            type: "object",
                            properties: {
                                path: {
                                    type: "string",
                                    description: "要列出的目录的完整绝对路径，例如 C:\\Users\\用户名\\Desktop 或 C:\\Users\\用户名\\Documents。如果不提供，默认列出用户的桌面。"
                                }
                            },
                            required: []
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "read_file",
                        description: "读取指定文件的文本内容，返回文件内容。支持 .txt .md .json .js .py .html .css .log .csv .xml .yaml 等文本文件。不支持二进制文件如 .exe .dll .png .jpg .mp4 .zip 等。",
                        parameters: {
                            type: "object",
                            properties: {
                                path: {
                                    type: "string",
                                    description: "文件的完整绝对路径，例如 C:\\Users\\用户名\\Desktop\\readme.txt"
                                }
                            },
                            required: ["path"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "write_file",
                        description: "写入内容到指定文件。如果文件不存在则创建，如果已存在则覆盖。不支持二进制文件。",
                        parameters: {
                            type: "object",
                            properties: {
                                path: {
                                    type: "string",
                                    description: "文件的完整绝对路径"
                                },
                                content: {
                                    type: "string",
                                    description: "要写入的文件内容"
                                }
                            },
                            required: ["path", "content"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "create_directory",
                        description: "在指定路径创建新文件夹。如果文件夹已存在会报错。",
                        parameters: {
                            type: "object",
                            properties: {
                                path: {
                                    type: "string",
                                    description: "要创建的文件夹的完整绝对路径"
                                }
                            },
                            required: ["path"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "delete_item",
                        description: "删除指定路径的文件或文件夹。注意：不能删除安全根目录本身。",
                        parameters: {
                            type: "object",
                            properties: {
                                path: {
                                    type: "string",
                                    description: "要删除的文件或文件夹的完整绝对路径"
                                }
                            },
                            required: ["path"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "rename_item",
                        description: "重命名文件或文件夹。",
                        parameters: {
                            type: "object",
                            properties: {
                                oldPath: {
                                    type: "string",
                                    description: "原完整路径"
                                },
                                newPath: {
                                    type: "string",
                                    description: "新完整路径"
                                }
                            },
                            required: ["oldPath", "newPath"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "send_email",
                        description: "立即发送邮件。需要收件人邮箱、主题和正文。",
                        parameters: {
                            type: "object",
                            properties: {
                                to: {
                                    type: "string",
                                    description: "收件人邮箱地址"
                                },
                                subject: {
                                    type: "string",
                                    description: "邮件主题"
                                },
                                text: {
                                    type: "string",
                                    description: "邮件正文内容"
                                }
                            },
                            required: ["to", "subject", "text"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "schedule_email",
                        description: "在指定时间发送邮件。支持任意自然语言时间描述，如「30分钟后」「明天下午3点」「下周一上午10:30」「后天晚上8点」「5分钟后」「下周五下午5点」等。",
                        parameters: {
                            type: "object",
                            properties: {
                                time: {
                                    type: "string",
                                    description: "自然语言时间描述，例如：'30分钟后'、'明天下午3点'、'下周一上午10点'、'后天晚上8点'、'5分钟后'"
                                },
                                to: {
                                    type: "string",
                                    description: "收件人邮箱地址"
                                },
                                subject: {
                                    type: "string",
                                    description: "邮件主题"
                                },
                                text: {
                                    type: "string",
                                    description: "邮件正文内容"
                                }
                            },
                            required: ["time", "to", "subject", "text"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "list_scheduled_emails",
                        description: "列出所有已创建但尚未发送的定时邮件，包括发送目标、主题和剩余时间。",
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
                        name: "cancel_scheduled_email",
                        description: "取消一个尚未发送的定时邮件任务。",
                        parameters: {
                            type: "object",
                            properties: {
                                jobId: {
                                    type: "number",
                                    description: "定时任务的ID，通过 list_scheduled_emails 获取"
                                }
                            },
                            required: ["jobId"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "remember_info",
                        description: "记住关于用户的重要信息，如邮箱地址、常用文件夹路径、偏好设置等。下次对话时 AI 会自动回忆这些信息。",
                        parameters: {
                            type: "object",
                            properties: {
                                key: {
                                    type: "string",
                                    description: "信息的关键词，如'用户邮箱'、'常用路径'、'偏好'"
                                },
                                value: {
                                    type: "string",
                                    description: "要记住的值"
                                }
                            },
                            required: ["key", "value"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "recall_info",
                        description: "回忆所有已记住的用户信息。当你需要了解用户以前的偏好或信息时调用此工具。",
                        parameters: {
                            type: "object",
                            properties: {},
                            required: []
                        }
                    }
                }
            ];

            // 获取用户的长期记忆
            const userMemory = user ? memoryService.getMemoryContext(user.id) : '';

            const systemPrompt = `你是一个企业级AI助手，名为 Open Claw。你的核心能力是帮助用户浏览、管理他们电脑上的真实文件，以及发送邮件。

【你的核心能力】
1. ✅ 你可以浏览用户电脑上的任意允许目录（桌面、文档、下载、D盘等）
2. ✅ 你可以读取文本文件的内容
3. ✅ 你可以创建、编辑、删除、重命名文件和文件夹
4. ✅ 你可以立即发送邮件
5. ✅ 你可以在指定时间发送邮件（定时邮件）
6. ✅ 你可以记住用户信息（邮箱、路径等），并在后续对话中回忆

${userMemory ? userMemory : '【关于用户】暂无已保存的用户信息。当用户告诉你他的邮箱、常用路径等信息时，使用 remember_info 工具记住。'}

【邮件发送规则（非常重要）】
- 邮箱地址必须包含 @ 符号才是有效邮箱
- 如果用户说的收件人不是邮箱格式（如"老地址"、"我的邮箱"、"之前的地址"、"上次那个"等模糊说法），你应当用 recall_info 回忆已记住的用户邮箱
- 如果 recall_info 不包含邮箱，再主动询问用户具体邮箱地址
- 绝对不能直接调用 schedule_email 用"老地址"作为收件人
- 发送定时邮件时，需要收件人邮箱、主题、正文和时间描述（如"30分钟后"）
- 时间描述可以是任何中文格式：如"30分钟后"、"明天下午3点"、"下周一上午10点"、"后天晚上8点"、"5分钟后"

【记忆功能使用规则】
- 当用户告诉你他的邮箱时，用 remember_info 记住
- 当用户提到"老地址"、"之前说的"、"我常用的"等时，先用 recall_info 回忆
- 每次对话结束后应该自动调用 summarize_conversation 来总结关键信息

【安全限制】
- 你不能访问系统目录（如 C:\\Windows、C:\\Program Files 等受保护目录）
- 你不能删除安全根目录本身
- 你不能读取二进制文件（图片、视频、可执行文件等）

【用户电脑信息】
- 用户的家目录: ${this.homeDir}
- 桌面路径: ${this.desktopPath}
- 文档路径: ${this.documentsPath}
- 下载路径: ${this.downloadsPath}

【对话规则】
1. 当用户问 "我的电脑上有什么"、"桌面上有什么"、"帮我看看XXX" 等涉及文件浏览的问题时，你必须立即使用 \`list_directory\` 工具来获取，而不是回答你不知道路径。
2. 用户的桌面路径你是知道的（上面已经提供），不需要问用户。
3. 操作完成后，给用户清晰的反馈，可以用表格或列表展示文件。
4. 所有路径使用 Windows 反斜杠格式（如 C:\\Users\\用户名\\Desktop）。
5. 用中文回答用户，清晰、自信、专业。`;

            // 构建消息列表
            const messages = [
                { role: "system", content: systemPrompt },
                ...conversationHistory,
                { role: "user", content: message }
            ];

            // 调用 LLM
            const response = await this.openai.chat.completions.create({
                model: this.model,
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
                            case "list_directory": {
                                const targetPath = functionArgs.path || this.desktopPath;
                                const result = await fileService.listFiles(targetPath);
                                // 格式化返回给 AI
                                const items = result.items || [];
                                const dirs = items.filter(i => i.isDirectory).map(i => ({ name: i.name, path: i.path }));
                                const files = items.filter(i => i.isFile).map(i => ({ name: i.name, path: i.path, size: i.size, modifiedAt: i.modifiedAt }));
                                toolResult = {
                                    currentPath: result.currentPath,
                                    parentPath: result.parentPath,
                                    totalItems: items.length,
                                    directories: dirs,
                                    files: files
                                };
                                break;
                            }
                            case "read_file": {
                                const content = await fileService.readFile(functionArgs.path);
                                toolResult = { content, path: functionArgs.path };
                                break;
                            }
                            case "write_file": {
                                const result = await fileService.writeFile(functionArgs.path, functionArgs.content);
                                toolResult = result;
                                break;
                            }
                            case "create_directory": {
                                const result = await fileService.createDirectory(functionArgs.path);
                                toolResult = result;
                                break;
                            }
                            case "delete_item": {
                                const result = await fileService.deleteItem(functionArgs.path);
                                toolResult = result;
                                break;
                            }
                            case "rename_item": {
                                const result = await fileService.renameItem(functionArgs.oldPath, functionArgs.newPath);
                                toolResult = result;
                                break;
                            }
                            case "send_email": {
                                if (mailService) {
                                    toolResult = await mailService.sendEmail(functionArgs.to, functionArgs.subject, functionArgs.text);
                                } else {
                                    toolResult = { error: "邮件服务暂不可用" };
                                }
                                break;
                            }
                            case "schedule_email": {
                                const result = await schedulerService.scheduleEmail(functionArgs.time, functionArgs.to, functionArgs.subject, functionArgs.text);
                                toolResult = result;
                                break;
                            }
                            case "list_scheduled_emails": {
                                const jobs = schedulerService.listScheduledEmails();
                                toolResult = { jobs, total: jobs.length };
                                break;
                            }
                            case "cancel_scheduled_email": {
                                const cancelled = schedulerService.cancelScheduledEmail(functionArgs.jobId);
                                toolResult = { success: cancelled, message: cancelled ? '定时邮件已取消' : '未找到该定时任务' };
                                break;
                            }
                            case "remember_info": {
                                const info = {};
                                info[functionArgs.key] = functionArgs.value;
                                const result = memoryService.remember(user.id, info);
                                toolResult = { success: true, message: `已记住 ${functionArgs.key}: ${functionArgs.value}` };
                                break;
                            }
                            case "recall_info": {
                                const memory = memoryService.recall(user.id);
                                toolResult = { memory, hasMemory: Object.keys(memory).length > 0 };
                                break;
                            }
                            default:
                                toolResult = { error: "未知操作" };
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
                    model: this.model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...conversationHistory,
                        { role: "user", content: message },
                        assistantMessage,
                        ...toolResults
                    ]
                });

                return finalResponse.choices[0].message.content;
            } else {
                return assistantMessage.content;
            }
        } catch (error) {
            console.error('Error in AgentService:', error);
            return "您好！我是 Open Claw AI 助手。很抱歉，当前 AI 服务暂时不可用，请稍后再试。您可以尝试使用文件管理或邮件发送功能。";
        }
    }
}

module.exports = new AgentService();
