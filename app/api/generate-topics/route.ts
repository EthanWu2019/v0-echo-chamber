import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT_ZH = `你是一个社交媒体热门话题生成器。生成真实的、有争议性或引发共鸣的话题标签。

# 话题类型
1. 职场/打工人话题（今天也想辞职、老板pua了、加班到凌晨）
2. 情感/人际关系（社恐日常、被相亲了、前任又来找我）
3. 生活吐槽（又熬夜了、外卖太贵、房租涨价）
4. 时事热点（xx出新政策、某某翻车了）
5. 娱乐八卦（xx恋情实锤、新剧翻车）

# 格式
返回 JSON 数组，每个元素包含：
- tag: 话题标签（不带#号，2-8个字）
- count: 讨论数量（如"12.3万"、"8.7万"）
- hot: 是否热门（布尔值，大约30%为true）

生成5-8个话题，要有多样性。`;

const SYSTEM_PROMPT_EN = `You are a social media trending topic generator. Generate realistic, controversial, or relatable hashtags.

# Topic Types
1. Work/Career (quiet quitting, office politics, burnout)
2. Relationships/Social (dating horror stories, friendship drama)
3. Life complaints (rent prices, adulting is hard)
4. Current events (controversial takes, news reactions)
5. Entertainment (celeb drama, show reviews)

# Format
Return JSON array, each element contains:
- tag: Topic tag (no #, 2-5 words)
- count: Discussion count (like "123K", "87K")
- hot: Whether hot (boolean, about 30% true)

Generate 5-8 topics with variety.`;

const TOPIC_POST_PROMPT_ZH = `你是一个社交媒体用户模拟器。给定一个话题，生成3-5个不同用户关于这个话题的帖子。

# 要求
- 每个帖子来自不同的用户，有不同的观点和风格
- 有的是吐槽、有的是分享经历、有的是提问、有的是玩梗
- 帖子长度50-200字
- 语言要像真实的中文网友

# 格式
返回 JSON 数组，每个元素包含：
- username: 用户名
- content: 帖子内容
- likes: 点赞数（100-5000）
- reposts: 转发数（10-500）
- views: 浏览数（1000-50000）`;

const TOPIC_POST_PROMPT_EN = `You are a social media user simulator. Given a topic, generate 3-5 posts from different users about this topic.

# Requirements
- Each post from different user, different viewpoints and styles
- Some are complaints, some share experiences, some ask questions, some make jokes
- Post length 50-200 characters
- Language should sound like real internet users

# Format
Return JSON array, each element contains:
- username: Username
- content: Post content in English
- likes: Like count (100-5000)
- reposts: Repost count (10-500)
- views: View count (1000-50000)`;

export async function POST(request: NextRequest) {
  try {
    const { action, lang = "en", topic } = await request.json();

    let systemPrompt: string;
    let userPrompt: string;

    if (action === "generate_posts") {
      systemPrompt = lang === "en" ? TOPIC_POST_PROMPT_EN : TOPIC_POST_PROMPT_ZH;
      userPrompt = lang === "en" 
        ? `Generate 3-5 posts about the topic: #${topic}`
        : `生成3-5条关于话题 #${topic} 的帖子`;
    } else {
      systemPrompt = lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ZH;
      userPrompt = lang === "en"
        ? "Generate 5-8 trending topics for a social media platform."
        : "为社交媒体平台生成5-8个热门话题。";
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.0,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";

    let result;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanedContent);
    } catch {
      // Fallback
      if (action === "generate_posts") {
        result = lang === "en" ? [
          { username: "SomeUser123", content: `Just my thoughts on #${topic}...`, likes: 234, reposts: 45, views: 5600 },
          { username: "RealTalk99", content: `Can we talk about #${topic}?? This is getting out of hand`, likes: 567, reposts: 89, views: 12000 },
        ] : [
          { username: "吃瓜群众", content: `关于#${topic}，我有话说...`, likes: 234, reposts: 45, views: 5600 },
          { username: "热心网友", content: `#${topic} 这个话题也太离谱了吧`, likes: 567, reposts: 89, views: 12000 },
        ];
      } else {
        result = lang === "en" ? [
          { tag: "mondayblues", count: "89K", hot: true },
          { tag: "adulting is hard", count: "67K", hot: false },
          { tag: "hot takes only", count: "123K", hot: true },
        ] : [
          { tag: "今天不想上班", count: "8.9万", hot: true },
          { tag: "成年人太难了", count: "6.7万", hot: false },
          { tag: "说点争议的", count: "12.3万", hot: true },
        ];
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[v0] Topics API error:", error);
    return NextResponse.json(
      { error: "Failed to generate topics" },
      { status: 500 }
    );
  }
}
