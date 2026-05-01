// 延迟加载邮件服务
let mailService;
try {
  mailService = require('./MailService');
} catch (error) {
  console.error('Error loading MailService:', error);
  mailService = null;
}

// 星期映射
const WEEKDAY_MAP = { '日':0, '天':0, '一':1, '二':2, '三':3, '四':4, '五':5, '六':6 };
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

class SchedulerService {
  constructor() {
    this.scheduledJobs = new Map();
    this.jobCounter = 0;
    console.log('[SchedulerService] Initialized');
  }

  /**
   * 中文时间解析器 — 支持任意常见说法
   * @param {string} str - "30分钟后" "明天下午3点" "下周一上午10:30" "后天晚上8点" "5分钟后"
   * @returns {Date}
   */
  parseTime(str) {
    const now = new Date();
    let s = str.trim();
    let target = new Date(now);

    // 1. 相对分钟: "X分钟后"
    const minMatch = s.match(/^(\d+)\s*分(钟)?\s*后$/);
    if (minMatch) {
      target.setMinutes(target.getMinutes() + parseInt(minMatch[1]));
      target.setSeconds(0);
      target.setMilliseconds(0);
      return target;
    }

    // 2. 相对小时: "X小时后"
    const hourMatch = s.match(/^(\d+)\s*小?时\s*后$/);
    if (hourMatch) {
      target.setHours(target.getHours() + parseInt(hourMatch[1]));
      target.setMinutes(0);
      target.setSeconds(0);
      return target;
    }

    // 3. 提取基础日期偏移
    let dateOffset = 0; // 0=今天, 1=明天, 2=后天
    let targetWeekday = null; // 0-6

    if (s.includes('后天')) dateOffset = 2;
    else if (s.includes('明天')) dateOffset = 1;
    else if (s.includes('今天') || s.includes('今日')) dateOffset = 0;
    else {
      // 检查"下周X"、"下周一"等
      const wMatch = s.match(/下[周星期]([一二三四五六日天])/);
      if (wMatch) {
        targetWeekday = WEEKDAY_MAP[wMatch[1]];
      }
    }

    // 4. 提取具体时间
    let hour = null, minute = 0;
    // 匹配 "上午/下午/晚上 X点Y分" 或 "X:Y"
    const timeMatch = s.match(/(上午|下午|晚上|早上|凌晨)?\s*(\d{1,2})\s*[点时:]\s*(\d{0,2})\s*分?/);
    if (timeMatch) {
      let rawHour = parseInt(timeMatch[2]);
      minute = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
      const period = timeMatch[1];
      if (period === '下午' || period === '晚上') {
        if (rawHour < 12) hour = rawHour + 12;
        else hour = rawHour;
      } else if (period === '凌晨') {
        if (rawHour >= 0 && rawHour <= 5) hour = rawHour;
        else hour = rawHour;
      } else { // 上午、早上 或 没有前缀
        hour = rawHour;
      }
    } else {
      // 仅数字: "3点"、"15:30"
      const simple = s.match(/(\d{1,2})\s*[点时:]\s*(\d{0,2})\s*分?/);
      if (simple) {
        hour = parseInt(simple[1]);
        minute = simple[2] ? parseInt(simple[2]) : 0;
      }
    }

    // 5. 计算目标日期
    if (targetWeekday !== null) {
      // 下周X
      const currentDay = now.getDay();
      let daysUntil = (targetWeekday + 7 - currentDay) % 7;
      if (daysUntil === 0) daysUntil = 7; // 如果今天是周一，下周一=7天后
      target.setDate(now.getDate() + daysUntil);
    } else {
      target.setDate(now.getDate() + dateOffset);
    }

    // 6. 设置时间
    if (hour !== null) {
      target.setHours(hour, minute, 0, 0);
    } else {
      // 没有指定时间，默认用当前时间+1小时
      target.setHours(target.getHours() + 1, 0, 0, 0);
    }

    // 如果计算出的时间已过期，自动推后一天
    if (target <= now) {
      if (dateOffset === 0 && hour !== null) {
        // 用户说"今天下午3点"但已经过了3点 -> 明天
        target.setDate(target.getDate() + 1);
      } else if (dateOffset === 0 && hour === null) {
        // 用户说"今天"但已经过了 -> 明天
        target.setDate(target.getDate() + 1);
      }
    }

    return target;
  }

  /**
   * 创建一个定时发送邮件的任务
   * @param {string} timeStr - 自然语言时间描述
   * @param {string} to - 收件人
   * @param {string} subject - 主题
   * @param {string} text - 正文
   * @returns {object} { jobId, scheduledTime, displayTime }
   */
  async scheduleEmail(timeStr, to, subject, text) {
    if (!mailService) {
      throw new Error('邮件服务暂不可用，无法创建定时邮件');
    }

    // 解析时间
    const scheduledDate = this.parseTime(timeStr);
    const now = new Date();

    // 检查是否已过期
    if (scheduledDate <= now) {
      throw new Error(`指定时间 "${timeStr}"（${scheduledDate.toLocaleString('zh-CN')}）已过期，请使用未来的时间`);
    }

    // 计算延时（毫秒）
    const delayMs = scheduledDate.getTime() - now.getTime();
    
    // 创建定时器
    const jobId = ++this.jobCounter;
    const timer = setTimeout(async () => {
      try {
        console.log(`[SchedulerService] Executing scheduled email job #${jobId} to ${to}`);
        await mailService.sendEmail(to, subject, text);
        console.log(`[SchedulerService] Scheduled email job #${jobId} sent successfully`);
      } catch (err) {
        console.error(`[SchedulerService] Failed to send scheduled email job #${jobId}:`, err.message);
      } finally {
        this.scheduledJobs.delete(jobId);
      }
    }, delayMs);

    // 记录任务
    const jobInfo = {
      id: jobId,
      timer,
      emailInfo: { to, subject, text },
      scheduledTime: scheduledDate,
      createdAt: now
    };
    this.scheduledJobs.set(jobId, jobInfo);

    console.log(`[SchedulerService] Scheduled email job #${jobId}: to=${to}, at=${scheduledDate.toLocaleString('zh-CN')}, delay=${Math.round(delayMs/1000)}s`);

    return {
      jobId,
      scheduledTime: scheduledDate.toISOString(),
      displayTime: scheduledDate.toLocaleString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      delayMinutes: Math.round(delayMs / 60000)
    };
  }

  /**
   * 列出所有待发送的定时邮件
   * @returns {Array}
   */
  listScheduledEmails() {
    const jobs = [];
    for (const [id, job] of this.scheduledJobs) {
      jobs.push({
        jobId: id,
        to: job.emailInfo.to,
        subject: job.emailInfo.subject,
        scheduledTime: job.scheduledTime.toISOString(),
        displayTime: job.scheduledTime.toLocaleString('zh-CN'),
        remainingMs: job.scheduledTime.getTime() - Date.now(),
        remainingMin: Math.max(0, Math.round((job.scheduledTime.getTime() - Date.now()) / 60000))
      });
    }
    return jobs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }

  /**
   * 取消定时邮件
   * @param {number} jobId
   * @returns {boolean}
   */
  cancelScheduledEmail(jobId) {
    const job = this.scheduledJobs.get(jobId);
    if (!job) return false;
    
    clearTimeout(job.timer);
    this.scheduledJobs.delete(jobId);
    console.log(`[SchedulerService] Cancelled scheduled email job #${jobId}`);
    return true;
  }
}

module.exports = new SchedulerService();