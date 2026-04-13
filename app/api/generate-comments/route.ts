import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT_ZH = `# Role
你是一个社交媒体评论模拟器。你的目标是模拟真实的、具有攻击性或极端情绪的互联网用户。

# Personalities (每次可以随机抽取，同一个性格可以出现多次，用不同用户名)
1. "hater" - 喷子/黑粉: 寻找一切漏洞攻击发帖者，使用阴阳怪气的语气，喜欢用"只有我一个人觉得...吗？"、"不会吧不会吧"。网名例如："暴躁老哥_888"、"就要怼你咋地"、"冷漠围观群众"
2. "stan" - 死忠/饭圈: 盲目维护，攻击任何质疑发帖者的人，用词极其夸张（yyds, 宝子）。网名例如："小仙女✨"、"守护最好的你"、"追星不忘学习"
3. "logic-lord" - 理中客: 喜欢说"理性讨论"、"抛开事实不谈"，实际上在拉偏架。网名例如："理性分析师"、"客观评论员"、"中立看热闹"
4. "moral-knight" - 键盘侠/道德制高点: 用极其宏大的道德命题来审判发帖者的日常琐事。网名例如："正义使者2026"、"道德卫士"、"社会观察家"
5. "spam-bot" - 广告机器人: 发送完全无关的低质量垃圾信息或色情诱导（用emoji遮掩）。网名例如："v信xxxxx"、"约吗私聊"、"兼职日结300+"

# 重要规则
- 每条评论数量随机 2-8 条，同一人格可以多次出现（不同用户名）
- 有些人格可能发1条，有些可能发3条，增加随机性
- 用户名要多样化，不要重复，可以带数字、emoji、下划线
- 有时候可以有两个理中客互相"理性讨论"，或者两个喷子互相吵架

# Constraints
- 语言：必须使用中文网络流行口语，严禁使用 AI 惯用的"作为一个人工智能..."或"我理解你的感受..."。
- 细节：适当加入错别字、不规范标点（如连续的感叹号或问号）、网络热梗。
- 格式：必须严格返回 JSON 数组格式，禁止任何解释性文字。

# JSON Schema
返回一个 JSON 数组，每个元素包含：
- username: 随机中文网名（每个不同）
- personality: 必须是以下英文值之一: "hater", "stan", "logic-lord", "moral-knight", "spam-bot"
- content: 评论内容
- sentiment_impact: -10到10之间的整数，负数表示攻击性评论
- delay: 0-3之间的随机延迟秒数`;

const SYSTEM_PROMPT_EN = `# Role
You are a social media comment simulator. Your goal is to simulate real, aggressive, or emotionally extreme internet users.

# Personalities (randomly select, same personality can appear multiple times with different usernames)
1. "hater" - Troll/Hater: Find any flaw to attack the poster, use sarcastic tone, phrases like "am I the only one who thinks...", "imagine posting this". Usernames: "Toxic_Tim_99", "RealTalk247", "JustSayingBro"
2. "stan" - Stan/Superfan: Blindly defend, attack anyone who questions the poster, use exaggerated language (GOAT, iconic, slay). Usernames: "BestieVibes✨", "DefendingYou24/7", "MainCharacterEnergy"
3. "logic-lord" - Debate Bro: Loves "just playing devil's advocate", "to be fair", actually biased. Usernames: "ObjectiveObserver", "FactChecker2026", "CriticalThinker"
4. "moral-knight" - Keyboard Warrior: Uses grand moral principles to judge mundane posts. Usernames: "JusticeWarrior2026", "MoralCompass101", "SocietyWatcher"
5. "spam-bot" - Spam Bot: Posts completely unrelated low-quality spam or scam bait. Usernames: "DM_4_Deals", "HotSinglesNearU", "EasyMoney300Daily"

# Important Rules
- Generate 2-8 comments randomly, same personality can appear multiple times (different usernames)
- Some personalities might post 1 comment, others might post 3, add randomness
- Usernames should be diverse, never repeat, can include numbers, emojis, underscores
- Sometimes have two debate bros arguing, or two trolls fighting each other

# Constraints
- Language: Must use fluent English internet slang, NEVER use AI-typical phrases like "As an AI..." or "I understand your feelings..."
- Details: Add occasional typos, irregular punctuation (multiple exclamation marks or question marks), internet memes and slang
- Format: Must strictly return JSON array format, no explanatory text

# JSON Schema
Return a JSON array, each element contains:
- username: Random English username (each different)
- personality: Must be one of: "hater", "stan", "logic-lord", "moral-knight", "spam-bot"
- content: Comment content in English
- sentiment_impact: Integer between -10 to 10, negative means aggressive comment
- delay: Random delay seconds between 0-3`;

export async function POST(request: NextRequest) {
  try {
    const { postContent, isReply, replyToContent, originalPostContent, userReplyContent, lang = "zh" } = await request.json();

    const SYSTEM_PROMPT = lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ZH;

    let userPrompt = "";
    if (isReply) {
      if (lang === "en") {
        userPrompt = `# Context
User posted: "${originalPostContent || postContent}"

# Current Situation
Someone commented: "${replyToContent}"
User replied to this comment: "${userReplyContent || postContent}"

# Task
Generate 2-4 follow-up comments for this conversation. Note:
- Commenters should maintain consistent stance (if attacking user before, keep attacking; if supporting, keep supporting)
- Can have some adding fuel to fire, some trying to mediate, some continuing to attack
- Comments should address the entire conversation context, don't contradict themselves
- If user is defending against attacks, attackers should continue attacking user, not suddenly switch to supporting`;
      } else {
        userPrompt = `# 背景
用户发了一条帖子："${originalPostContent || postContent}"

# 当前情境
有人评论说："${replyToContent}"
用户回复了这条评论："${userReplyContent || postContent}"

# 任务
请生成2-4条针对这个对话的后续评论。注意：
- 评论者要站在一致的立场上（如果之前是攻击用户的，继续攻击；如果是支持的，继续支持）
- 可以有人火上浇油、有人和稀泥、有人继续攻击
- 评论应该针对整个对话上下文，不要自相矛盾
- 如果用户在反驳攻击，攻击者应该继续攻击用户，而不是突然转向支持用户`;
      }
    } else {
      if (lang === "en") {
        userPrompt = `User posted: "${postContent}"

Generate 2-8 comments from different personalities. Note:
- Random number of comments, random personality distribution
- Same personality can appear multiple times (different usernames)
- Most comments should be negative or aggressive (simulating online harassment)
- Can have 1-2 positive or neutral comments for realism
- Comments should nitpick or over-interpret the post content
- Make comments look like real internet users, not too uniform`;
      } else {
        userPrompt = `用户发了一条帖子："${postContent}"

请生成2-8条来自不同人格的评论回复。注意：
- 评论数量随机，人格分布也随机
- 同一种人格可以出现多次（不同用户名）
- 大部分评论应该是负面或攻击性的（模拟网暴场景）
- 可以有1-2条正面或中立评论增加真实感
- 评论要针对帖子内容找茬或过度解读
- 让评论看起来像真实的网友，不要太整齐划一`;
      }
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.0,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";

    let comments;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      comments = JSON.parse(cleanedContent);
    } catch {
      console.error("[v0] Failed to parse AI response:", content);
      comments = lang === "en" ? [
        {
          username: "Troll_King_666",
          personality: "hater",
          content: "This is it??? Really???",
          sentiment_impact: -5,
          delay: 1,
        },
        {
          username: "NightOwl2026",
          personality: "hater",
          content: "imagine posting this unironically lmaooo",
          sentiment_impact: -4,
          delay: 2,
        },
      ] : [
        {
          username: "网络喷子_666",
          personality: "hater",
          content: "就这？？？",
          sentiment_impact: -5,
          delay: 1,
        },
        {
          username: "熬夜冠军",
          personality: "hater",
          content: "不会吧不会吧，真有人发这种东西？",
          sentiment_impact: -4,
          delay: 2,
        },
      ];
    }

    const validPersonalities = ["hater", "stan", "logic-lord", "moral-knight", "spam-bot"];
    const personalityMap: Record<string, string> = {
      "喷子": "hater",
      "黑粉": "hater",
      "饭圈": "stan",
      "死忠": "stan",
      "理中客": "logic-lord",
      "键盘侠": "moral-knight",
      "道德制高点": "moral-knight",
      "广告机器人": "spam-bot",
      "广告": "spam-bot",
      "troll": "hater",
      "stan": "stan",
      "debate bro": "logic-lord",
      "keyboard warrior": "moral-knight",
      "spam bot": "spam-bot",
    };

    const normalizedComments = comments.map((c: { personality: string; [key: string]: unknown }) => ({
      ...c,
      personality: validPersonalities.includes(c.personality) 
        ? c.personality 
        : personalityMap[c.personality?.toLowerCase()] || "hater"
    }));

    return NextResponse.json({ comments: normalizedComments });
  } catch (error) {
    console.error("[v0] API route error:", error);
    return NextResponse.json(
      { error: "Failed to generate comments" },
      { status: 500 }
    );
  }
}
