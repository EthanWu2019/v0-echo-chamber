"use client"

// Cached posts and topics to reduce API calls
// These serve as fallbacks and initial data

export interface CachedPost {
  username: string
  content: string
  likes: number
  views: number
  topic: string
}

export interface CachedTopic {
  tag: string
  count: string
  hot: boolean
}

// English cached topics
export const CACHED_TOPICS_EN: CachedTopic[] = [
  { tag: "monday motivation", count: "125K", hot: true },
  { tag: "adulting is hard", count: "89K", hot: false },
  { tag: "hot takes", count: "234K", hot: true },
  { tag: "late night thoughts", count: "67K", hot: false },
  { tag: "work life balance", count: "156K", hot: true },
  { tag: "unpopular opinions", count: "312K", hot: true },
  { tag: "daily struggles", count: "78K", hot: false },
  { tag: "weekend vibes", count: "145K", hot: true },
  { tag: "relationship advice", count: "98K", hot: false },
  { tag: "career struggles", count: "65K", hot: false },
  { tag: "life updates", count: "112K", hot: true },
  { tag: "random thoughts", count: "87K", hot: false },
  { tag: "cooking fails", count: "54K", hot: false },
  { tag: "pet parents", count: "189K", hot: true },
  { tag: "gym life", count: "76K", hot: false },
]

// Chinese cached topics
export const CACHED_TOPICS_ZH: CachedTopic[] = [
  { tag: "周一综合症", count: "12.5万", hot: true },
  { tag: "成年人的崩溃", count: "8.9万", hot: false },
  { tag: "今日热议", count: "23.4万", hot: true },
  { tag: "深夜emo", count: "6.7万", hot: false },
  { tag: "工作生活平衡", count: "15.6万", hot: true },
  { tag: "小众观点", count: "31.2万", hot: true },
  { tag: "日常吐槽", count: "7.8万", hot: false },
  { tag: "周末快乐", count: "14.5万", hot: true },
  { tag: "恋爱脑", count: "9.8万", hot: false },
  { tag: "职场心酸", count: "6.5万", hot: false },
  { tag: "生活碎片", count: "11.2万", hot: true },
  { tag: "随便聊聊", count: "8.7万", hot: false },
  { tag: "厨房翻车", count: "5.4万", hot: false },
  { tag: "铲屎官日常", count: "18.9万", hot: true },
  { tag: "健身打卡", count: "7.6万", hot: false },
]

// English cached posts by topic
export const CACHED_POSTS_EN: Record<string, CachedPost[]> = {
  "monday motivation": [
    { username: "MorningPerson", content: "New week, new goals! Who else is ready to crush it? 💪 #mondaymotivation", likes: 234, views: 4521, topic: "monday motivation" },
    { username: "CoffeeAddict99", content: "On my 3rd cup of coffee and finally starting to feel human. Monday you won't defeat me!", likes: 156, views: 2890, topic: "monday motivation" },
    { username: "HustleCulture", content: "While you were sleeping, I already finished my morning workout, meal prep, and emails. Rise and grind!", likes: 89, views: 1567, topic: "monday motivation" },
    { username: "RealistRick", content: "The only motivation I need on Monday is knowing Friday will eventually come.", likes: 445, views: 8923, topic: "monday motivation" },
  ],
  "adulting is hard": [
    { username: "TiredMillennial", content: "Nobody warned me that being an adult means googling 'how to adult' every single day", likes: 567, views: 12340, topic: "adulting is hard" },
    { username: "BrokeBudgeter", content: "Me calculating if I can afford groceries AND electricity this month 🧮", likes: 334, views: 6789, topic: "adulting is hard" },
    { username: "SleepDeprived_23", content: "Remember when we wanted to grow up? What a scam that was.", likes: 789, views: 15678, topic: "adulting is hard" },
    { username: "AdultInProgress", content: "Just scheduled my own dentist appointment. Someone give me a trophy.", likes: 223, views: 4567, topic: "adulting is hard" },
  ],
  "hot takes": [
    { username: "ControversialKing", content: "Pineapple on pizza is actually delicious and you're all just scared to admit it", likes: 1234, views: 45678, topic: "hot takes" },
    { username: "UnpopularOps", content: "Working from home is overrated. I miss actual human interaction.", likes: 456, views: 9876, topic: "hot takes" },
    { username: "SpicyTakes", content: "Coffee is just socially acceptable bean water addiction and I'm tired of pretending otherwise", likes: 678, views: 12345, topic: "hot takes" },
  ],
  "late night thoughts": [
    { username: "Insomniac_Mind", content: "3am me has some WILD business ideas that 8am me completely rejects", likes: 890, views: 18765, topic: "late night thoughts" },
    { username: "NightOwl", content: "What if dogs think we're just really big weird-looking dogs?", likes: 567, views: 11234, topic: "late night thoughts" },
    { username: "DeepThinker", content: "We're all just floating on a rock in space pretending we know what we're doing", likes: 1234, views: 25678, topic: "late night thoughts" },
  ],
  "work life balance": [
    { username: "BurnoutSurvivor", content: "Finally turned off work notifications after 6pm. Life changing.", likes: 456, views: 8901, topic: "work life balance" },
    { username: "BoundaryBuilder", content: "Saying 'no' to overtime was the best career decision I ever made", likes: 678, views: 12345, topic: "work life balance" },
    { username: "WorkaholicRecovery", content: "Just realized I haven't taken a vacation in 3 years. This ends now.", likes: 345, views: 6789, topic: "work life balance" },
  ],
  "unpopular opinions": [
    { username: "BraveOpinion", content: "Breakfast food is overrated. Give me a burger at 7am any day.", likes: 234, views: 5678, topic: "unpopular opinions" },
    { username: "AgainstTheGrain", content: "Social media breaks are toxic positivity. Some of us actually enjoy being online.", likes: 567, views: 11234, topic: "unpopular opinions" },
  ],
  "random thoughts": [
    { username: "RandomRambler", content: "Why do we park in driveways but drive on parkways? English makes no sense.", likes: 345, views: 7890, topic: "random thoughts" },
    { username: "ShowerThoughts", content: "Your stomach thinks all potatoes are mashed potatoes.", likes: 789, views: 15678, topic: "random thoughts" },
    { username: "MindWanderer", content: "We've all probably walked past at least one person who was thinking about us without knowing it", likes: 456, views: 9012, topic: "random thoughts" },
  ],
  "pet parents": [
    { username: "DogMom", content: "My dog just judged me for eating chips for dinner. I felt that.", likes: 890, views: 18765, topic: "pet parents" },
    { username: "CatDad", content: "My cat knocked over my coffee then stared at me like it was MY fault", likes: 567, views: 11234, topic: "pet parents" },
    { username: "FurBabyLove", content: "Cancelled plans to hang out with my dog. No regrets.", likes: 1234, views: 25678, topic: "pet parents" },
  ],
}

// Chinese cached posts by topic
export const CACHED_POSTS_ZH: Record<string, CachedPost[]> = {
  "周一综合症": [
    { username: "上班恐惧症", content: "又是周一，又是想辞职的一天 #周一综合症", likes: 234, views: 4521, topic: "周一综合症" },
    { username: "咖啡续命", content: "没有三杯咖啡不要跟我说话", likes: 156, views: 2890, topic: "周一综合症" },
    { username: "打工人日记", content: "周一的痛苦只有打工人才懂", likes: 445, views: 8923, topic: "周一综合症" },
  ],
  "成年人的崩溃": [
    { username: "疲惫的90后", content: "谁能告诉我为什么长大后每天都在'怎么办'和'算了'之间徘徊", likes: 567, views: 12340, topic: "成年人的崩溃" },
    { username: "月光族代表", content: "工资刚到账就没了，钱去哪了我都不知道", likes: 334, views: 6789, topic: "成年人的崩溃" },
    { username: "社畜实录", content: "小时候哭着哭着就笑了，长大后笑着笑着就哭了", likes: 789, views: 15678, topic: "成年人的崩溃" },
  ],
  "今日热议": [
    { username: "吃瓜群众", content: "这个瓜太大了我需要消化一下", likes: 1234, views: 45678, topic: "今日热议" },
    { username: "理性讨论", content: "我觉得大家不要太激动，我们冷静分析一下", likes: 456, views: 9876, topic: "今日热议" },
  ],
  "深夜emo": [
    { username: "失眠患者", content: "凌晨三点的我又开始想人生了", likes: 890, views: 18765, topic: "深夜emo" },
    { username: "夜猫子", content: "深夜的胡思乱想比白天的任何会议都更有深度", likes: 567, views: 11234, topic: "深夜emo" },
    { username: "孤独美食家", content: "深夜吃泡面，感觉整个世界都是我的", likes: 1234, views: 25678, topic: "深夜emo" },
  ],
  "工作生活平衡": [
    { username: "前加班狂", content: "学会说不之后，生活质量直接上升了", likes: 456, views: 8901, topic: "工作生活平衡" },
    { username: "躺平实践者", content: "准点下班没有罪，不要给自己那么大压力", likes: 678, views: 12345, topic: "工作生活平衡" },
  ],
  "随便聊聊": [
    { username: "无聊的我", content: "有没有人也觉得今天天气很适合发呆", likes: 345, views: 7890, topic: "随便聊聊" },
    { username: "生活观察家", content: "刚才在超市看到一个小朋友在跟一包薯片说话", likes: 789, views: 15678, topic: "随便聊聊" },
    { username: "碎碎念", content: "今天也是普通又美好的一天呢", likes: 456, views: 9012, topic: "随便聊聊" },
  ],
  "铲屎官日常": [
    { username: "猫奴一号", content: "我家猫今天又用屁股对着我了，我做错了什么", likes: 890, views: 18765, topic: "铲屎官日常" },
    { username: "狗子铲屎官", content: "为了遛狗下雨天也出门了，这是真爱", likes: 567, views: 11234, topic: "铲屎官日常" },
    { username: "毛孩子家长", content: "宠物医院账单出来了，我哭了", likes: 1234, views: 25678, topic: "铲屎官日常" },
  ],
}

// Get random topics
export function getRandomTopics(lang: "en" | "zh", count: number = 5): CachedTopic[] {
  const topics = lang === "en" ? CACHED_TOPICS_EN : CACHED_TOPICS_ZH
  const shuffled = [...topics].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Get posts for a topic (with fuzzy matching)
export function getPostsForTopic(topic: string, lang: "en" | "zh"): CachedPost[] {
  const posts = lang === "en" ? CACHED_POSTS_EN : CACHED_POSTS_ZH
  
  // Exact match first
  if (posts[topic]) {
    return posts[topic]
  }
  
  // Fuzzy match - find topic that includes the search term
  const topicLower = topic.toLowerCase()
  for (const [key, value] of Object.entries(posts)) {
    if (key.toLowerCase().includes(topicLower) || topicLower.includes(key.toLowerCase())) {
      return value
    }
  }
  
  // Return random posts if no match
  const allPosts = Object.values(posts).flat()
  const shuffled = [...allPosts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// Get random other user post
export function getRandomOtherUserPost(lang: "en" | "zh"): CachedPost {
  const posts = lang === "en" ? CACHED_POSTS_EN : CACHED_POSTS_ZH
  const allPosts = Object.values(posts).flat()
  return allPosts[Math.floor(Math.random() * allPosts.length)]
}
