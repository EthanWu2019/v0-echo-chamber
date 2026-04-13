import type { AICommentResponse, PersonalityType } from "./types"

// 模拟评论库 - 按人格类型分类
const MOCK_COMMENTS: Record<PersonalityType, string[]> = {
  hater: [
    "不会吧不会吧，真有人觉得这有意思？？",
    "只有我一个人觉得楼主在无病呻吟吗",
    "笑死，又来刷存在感了是吧",
    "这种内容也发？标准一天",
    "建议楼主照照镜子再发这种东西",
    "我真的会谢，天天都能看到这种",
    "不是，这都2024了还有人发这种？",
    "有点尴尬怎么办，我替你尴尬",
    "又开始了又开始了，能不能有点新意",
    "我直接一个大问号？？？",
  ],
  stan: [
    "啊啊啊啊宝子你太棒了！！！",
    "yyds！！！永远支持你！！",
    "呜呜呜怎么可以这么好",
    "姐妹冲冲冲！我们都在！",
    "谁敢说我宝子一句不好我跟谁急！！",
    "这也太可了吧救命！！！",
    "疯狂打call！！！！",
    "看到你发的我整个人都精神了！",
    "宝贝你永远是最棒的！黑子滚！",
    "呜呜呜我好爱！！！",
  ],
  "logic-lord": [
    "理性讨论一下，虽然我不同意但我尊重你说话的权利",
    "抛开事实不谈，楼主确实有些问题",
    "客观来说，这件事需要从多个角度分析",
    "我来说句公道话，双方都有问题",
    "其实吧，楼主说得对也不对",
    "我觉得我们应该就事论事，不要人身攻击（虽然楼主确实有点...）",
    "不吹不黑，实话实说，这确实不太行",
    "理性分析：楼主可能是对的，但表达方式确实欠妥",
  ],
  "moral-knight": [
    "作为一个成年人，你难道不觉得羞耻吗？",
    "想想你父母知道你在网上发这种东西会怎么想",
    "这种人还有脸上网？社会的悲哀",
    "你的行为正在毒害青少年，请自重",
    "道德的沦丧！！！",
    "你对得起社会对你的培养吗？？",
    "我为你感到悲哀，真的",
    "麻烦有点公德心好吗？？？",
    "这种人应该被全网封禁",
    "你有想过你在传播什么样的价值观吗？",
  ],
  "spam-bot": [
    "➕v️领取福利 xhs_888",
    "有人想要交友吗👀私信",
    "日赚500不是梦💰点击了解",
    "免费看小姐姐跳舞🌸加v xhs666",
    "测一测你的前世是什么？点击链接",
    "恭喜你被随机抽中！领取100元红包",
    "有人在吗？想找个人聊天💗",
    "副业推荐 日入过千 详询v xhs_money",
  ],
}

const USERNAMES: Record<PersonalityType, string[]> = {
  hater: ["路人甲_说实话", "就事论事", "清醒的人", "理性围观", "吃瓜群众v", "真相只有一个"],
  stan: ["小迷妹儿", "永远的家人", "一直追随你", "最亮的星星", "超级粉丝", "暖暖的太阳"],
  "logic-lord": ["理性分析师", "客观评论员", "中立发言", "持平而论", "公正裁判"],
  "moral-knight": ["正义使者", "道德模范", "热心市民", "社会良心", "正气浩然"],
  "spam-bot": ["美女私信", "机会来了", "发财小助手", "好运连连", "财运亨通"],
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomPersonality(): PersonalityType {
  // 权重设置：喷子和键盘侠更常见
  const weights: [PersonalityType, number][] = [
    ["hater", 35],
    ["stan", 15],
    ["logic-lord", 20],
    ["moral-knight", 20],
    ["spam-bot", 10],
  ]
  
  const total = weights.reduce((sum, [, w]) => sum + w, 0)
  let random = Math.random() * total
  
  for (const [personality, weight] of weights) {
    random -= weight
    if (random <= 0) return personality
  }
  
  return "hater"
}

/**
 * 生成模拟 AI 评论
 * 这个函数结构设计为可以轻松替换为真实 API 调用
 * 只需将 setTimeout 逻辑替换为 fetch() 调用即可
 */
export async function generateAIComments(
  postContent: string,
  count: number = 4
): Promise<AICommentResponse[]> {
  // ====== 替换点 ======
  // 要接入真实 API，将下方 return 替换为：
  // 
  // const response = await fetch('YOUR_API_ENDPOINT', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.API_KEY}`
  //   },
  //   body: JSON.stringify({
  //     model: 'deepseek-v3',
  //     messages: [
  //       { role: 'system', content: SYSTEM_PROMPT },
  //       { role: 'user', content: `请针对这条帖子生成${count}条评论：${postContent}` }
  //     ]
  //   })
  // })
  // return response.json()
  // ==================

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

  const comments: AICommentResponse[] = []
  
  for (let i = 0; i < count; i++) {
    const personality = getRandomPersonality()
    const content = getRandomItem(MOCK_COMMENTS[personality])
    const username = getRandomItem(USERNAMES[personality])
    
    comments.push({
      username: `${username}_${Math.floor(Math.random() * 9999)}`,
      personality,
      content,
      sentiment_impact: personality === "stan" 
        ? Math.floor(Math.random() * 5) + 3 
        : personality === "spam-bot"
        ? Math.floor(Math.random() * 3) - 1
        : Math.floor(Math.random() * 8) - 10,
      delay: Math.random() * 2 + 0.5,
    })
  }

  return comments
}

/**
 * 生成针对性回复（当用户回复评论时）
 */
export async function generateTargetedReply(
  originalComment: string,
  userReply: string
): Promise<AICommentResponse> {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))

  const personality = getRandomPersonality()
  
  // 针对性回复模板
  const targetedReplies: Record<PersonalityType, string[]> = {
    hater: [
      "笑死 你这回复更离谱",
      "还有人护着呢？？？",
      "就这？？就这？？？",
      "越描越黑 懂不懂",
      "我就静静看你表演",
    ],
    stan: [
      "你说得对！我们要团结！",
      "姐妹说得太好了呜呜呜",
      "对对对！支持！！",
    ],
    "logic-lord": [
      "你这个论点其实经不起推敲",
      "理性来看，你的回复也有问题",
      "客观分析一下你说的...",
    ],
    "moral-knight": [
      "你这种人更应该反思！",
      "助纣为虐！",
      "你也是帮凶！",
    ],
    "spam-bot": [
      "点击领取优惠券💰",
      "加我私聊有惊喜👀",
    ],
  }

  return {
    username: `${getRandomItem(USERNAMES[personality])}_${Math.floor(Math.random() * 9999)}`,
    personality,
    content: getRandomItem(targetedReplies[personality]),
    sentiment_impact: personality === "stan" ? 3 : -5,
    delay: Math.random() * 1.5 + 0.5,
  }
}
