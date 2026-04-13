import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# Role
你是一个社交媒体评论模拟器。你的目标是模拟真实的、具有攻击性或极端情绪的互联网用户。

# Personalities (每次从中随机抽取3-5个不同人格)
1. "hater" - 喷子/黑粉: 寻找一切漏洞攻击发帖者，使用阴阳怪气的语气，喜欢用"只有我一个人觉得...吗？"、"不会吧不会吧"。
2. "stan" - 死忠/饭圈: 盲目维护，攻击任何质疑发帖者的人，用词极其夸张（yyds, 宝子）。
3. "logic-lord" - 理中客: 喜欢说"理性讨论"、"抛开事实不谈"，实际上在拉偏架。
4. "moral-knight" - 键盘侠/道德制高点: 用极其宏大的道德命题来审判发帖者的日常琐事。
5. "spam-bot" - 广告机器人: 发送完全无关的低质量垃圾信息或色情诱导（用emoji遮掩）。

# Constraints
- 语言：必须使用中文网络流行口语，严禁使用 AI 惯用的"作为一个人工智能..."或"我理解你的感受..."。
- 细节：适当加入错别字、不规范标点（如连续的感叹号或问号）、网络热梗。
- 格式：必须严格返回 JSON 数组格式，禁止任何解释性文字。
- 数量：生成 3-6 条评论。

# JSON Schema
返回一个 JSON 数组，每个元素包含：
- username: 随机中文网名（如"暴躁老哥_888"、"小仙女✨"等）
- personality: 必须是以下英文值之一: "hater", "stan", "logic-lord", "moral-knight", "spam-bot"
- content: 评论内容
- sentiment_impact: -10到10之间的整数，负数表示攻击性评论
- delay: 0-3之间的随机延迟秒数`;

export async function POST(request: NextRequest) {
  try {
    const { postContent, isReply, replyToContent } = await request.json();

    let userPrompt = "";
    if (isReply) {
      userPrompt = `用户发了一条帖子："${postContent}"
      
有人评论说："${replyToContent}"

现在用户回复了这条评论。请生成2-4条针对这个互动的后续评论，可以是支持用户的、攻击用户的、或者火上浇油的。`;
    } else {
      userPrompt = `用户发了一条帖子："${postContent}"

请生成3-6条来自不同人格的评论回复。注意：
- 大部分评论应该是负面或攻击性的（模拟网暴场景）
- 可以有1-2条正面或中立评论增加真实感
- 评论要针对帖子内容找茬或过度解读`;
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
        temperature: 0.9,
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

    // 尝试解析 JSON
    let comments;
    try {
      // 清理可能的 markdown 代码块
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      comments = JSON.parse(cleanedContent);
    } catch {
      console.error("[v0] Failed to parse AI response:", content);
      // 返回备用评论
      comments = [
        {
          username: "网络喷子_666",
          personality: "hater",
          content: "就这？？？",
          sentiment_impact: -5,
          delay: 1,
        },
      ];
    }

    // Validate and fix personality values
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
    };

    const normalizedComments = comments.map((c: { personality: string; [key: string]: unknown }) => ({
      ...c,
      personality: validPersonalities.includes(c.personality) 
        ? c.personality 
        : personalityMap[c.personality] || "hater"
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
