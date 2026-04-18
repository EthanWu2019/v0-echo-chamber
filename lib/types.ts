export type PersonalityType = "hater" | "stan" | "logic-lord" | "moral-knight" | "spam-bot" | "normal"

export interface Comment {
  id: string
  username: string
  avatar?: string
  personality: PersonalityType
  personalityLabel: string
  content: string
  sentimentImpact: number
  likes: number
  reposts: number
  timestamp: Date
  replies: Comment[]
  isTyping?: boolean
  likedByUser?: boolean
  isReported?: boolean
}

export interface Post {
  id: string
  content: string
  timestamp: Date
  likes: number
  reposts: number
  views: number
  comments: Comment[]
  isGenerating?: boolean
  pinnedCommentId?: string
  username?: string
  imageUrl?: string  // 图片帖子
  poll?: Poll        // 投票
  repostOf?: {       // 转发
    username: string
    content: string
    postId: string
  }
}

// 投票系统
export interface Poll {
  question: string
  options: PollOption[]
  totalVotes: number
  endsAt?: Date
  userVotedIndex?: number
}

export interface PollOption {
  text: string
  votes: number
  percentage: number
}

// 私信系统
export interface DirectMessage {
  id: string
  from: string
  personality: PersonalityType
  content: string
  timestamp: Date
  isRead: boolean
}

// 成就系统
export interface Achievement {
  id: string
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  icon: string
  unlockedAt?: Date
  condition: (stats: AchievementCheckStats) => boolean
}

export interface AchievementCheckStats {
  totalPosts: number
  totalComments: number
  totalNegativeComments: number
  sentiment: number
  followers: number
  haters: number
  blockedUsers: number
  reportedComments: number
  daysActive: number
  firstFlamed: boolean
  sentimentCrashed: boolean
  sentimentRecovered: boolean
}

// 拉黑用户
export interface BlockedUser {
  username: string
  personality: PersonalityType
  blockedAt: Date
  newUsername?: string  // 换马甲后的新名字
}

// @提及
export interface Mention {
  id: string
  fromUsername: string
  topicTag: string
  postContent: string
  timestamp: Date
  isRead: boolean
}

export interface AICommentResponse {
  username: string
  avatar?: string
  personality: PersonalityType
  content: string
  sentiment_impact: number
  delay: number
}

// 账号系统数据
export interface AccountStats {
  followers: number
  following: number
  haters: number
  totalPosts: number
  totalLikes: number
  reputation: number
  controversy: number
  influence: number
}

// 剧情模式场景
export interface StoryScenario {
  id: string
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  initialPost: {
    zh: string
    en: string
  }
  difficulty: "easy" | "medium" | "hard"
  icon: string
}

export const PERSONALITY_CONFIG: Record<PersonalityType, { 
  label: string
  color: string
  bgColor: string
  avatarGradient: string
}> = {
  hater: { 
    label: "喷子", 
    color: "text-red-400", 
    bgColor: "bg-red-500/20",
    avatarGradient: "from-red-600 to-orange-600"
  },
  stan: { 
    label: "饭圈", 
    color: "text-pink-400", 
    bgColor: "bg-pink-500/20",
    avatarGradient: "from-pink-500 to-purple-500"
  },
  "logic-lord": { 
    label: "理中客", 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/20",
    avatarGradient: "from-blue-500 to-cyan-500"
  },
  "moral-knight": { 
    label: "键盘侠", 
    color: "text-yellow-400", 
    bgColor: "bg-yellow-500/20",
    avatarGradient: "from-yellow-500 to-amber-500"
  },
  "spam-bot": { 
    label: "广告", 
    color: "text-gray-400", 
    bgColor: "bg-gray-500/20",
    avatarGradient: "from-green-500 to-teal-500"
  },
  "normal": { 
    label: "路人", 
    color: "text-slate-400", 
    bgColor: "bg-slate-500/20",
    avatarGradient: "from-slate-500 to-zinc-500"
  },
}

// 预设成就列表
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_post",
    titleZh: "初出茅庐",
    titleEn: "First Steps",
    descZh: "发布第一条动态",
    descEn: "Published your first post",
    icon: "🎉",
    condition: (s) => s.totalPosts >= 1
  },
  {
    id: "first_flame",
    titleZh: "初尝被喷",
    titleEn: "First Flame",
    descZh: "第一次收到负面评论",
    descEn: "Received your first negative comment",
    icon: "🔥",
    condition: (s) => s.firstFlamed
  },
  {
    id: "reputation_crash",
    titleZh: "口碑崩盘",
    titleEn: "PR Crisis",
    descZh: "好感度跌至30%以下",
    descEn: "Sentiment dropped below 30%",
    icon: "📉",
    condition: (s) => s.sentimentCrashed
  },
  {
    id: "comeback",
    titleZh: "绝地翻盘",
    titleEn: "Comeback King",
    descZh: "好感度从30%以下恢复到70%以上",
    descEn: "Recovered sentiment from below 30% to above 70%",
    icon: "👑",
    condition: (s) => s.sentimentRecovered
  },
  {
    id: "influencer",
    titleZh: "小有名气",
    titleEn: "Rising Star",
    descZh: "获得100+粉丝",
    descEn: "Gained 100+ followers",
    icon: "⭐",
    condition: (s) => s.followers >= 100
  },
  {
    id: "hater_magnet",
    titleZh: "黑粉收割机",
    titleEn: "Hater Magnet",
    descZh: "拥有50+黑粉",
    descEn: "Gained 50+ haters",
    icon: "🎯",
    condition: (s) => s.haters >= 50
  },
  {
    id: "blocker",
    titleZh: "一键拉黑",
    titleEn: "Block Party",
    descZh: "拉黑5个用户",
    descEn: "Blocked 5 users",
    icon: "🚫",
    condition: (s) => s.blockedUsers >= 5
  },
  {
    id: "reporter",
    titleZh: "正义使者",
    titleEn: "Justice Warrior",
    descZh: "举报10条评论",
    descEn: "Reported 10 comments",
    icon: "⚖️",
    condition: (s) => s.reportedComments >= 10
  },
  {
    id: "week_survivor",
    titleZh: "一周幸存",
    titleEn: "Week Survivor",
    descZh: "账号运营满7天",
    descEn: "Operated account for 7 days",
    icon: "📅",
    condition: (s) => s.daysActive >= 7
  },
  {
    id: "controversy_king",
    titleZh: "争议之王",
    titleEn: "Controversy King",
    descZh: "收到100+负面评论",
    descEn: "Received 100+ negative comments",
    icon: "💢",
    condition: (s) => s.totalNegativeComments >= 100
  },
]

// 预设剧情场景
export const STORY_SCENARIOS: StoryScenario[] = [
  {
    id: "celebrity_scandal",
    titleZh: "明星塌房",
    titleEn: "Celebrity Scandal",
    descZh: "你是一位明星的经纪人，需要处理一场突发丑闻",
    descEn: "You're a celebrity's manager handling a sudden scandal",
    initialPost: {
      zh: "关于近期网上的传言，我想做出一些澄清...",
      en: "Regarding the recent rumors online, I'd like to clarify..."
    },
    difficulty: "hard",
    icon: "🌟"
  },
  {
    id: "product_launch",
    titleZh: "新品翻车",
    titleEn: "Product Fail",
    descZh: "你的公司新产品上市后收到大量差评",
    descEn: "Your company's new product received massive negative reviews",
    initialPost: {
      zh: "我们全新推出的产品已经上线啦！感谢大家的支持！",
      en: "Our brand new product is now live! Thank you for your support!"
    },
    difficulty: "medium",
    icon: "📦"
  },
  {
    id: "viral_moment",
    titleZh: "意外走红",
    titleEn: "Viral Moment",
    descZh: "你的一条普通动态突然爆火，各路人马纷纷涌入",
    descEn: "Your ordinary post suddenly went viral, attracting all kinds of people",
    initialPost: {
      zh: "今天在路边看到一只超可爱的猫咪！",
      en: "Saw the cutest cat on the street today!"
    },
    difficulty: "easy",
    icon: "🚀"
  },
  {
    id: "political_stance",
    titleZh: "站队风波",
    titleEn: "Taking Sides",
    descZh: "你无意中卷入了一场网络骂战",
    descEn: "You accidentally got involved in an online flame war",
    initialPost: {
      zh: "我觉得这件事情大家都有道理吧...",
      en: "I think everyone has a point in this matter..."
    },
    difficulty: "hard",
    icon: "⚔️"
  },
]

// 获取用户名首字母
export function getAvatarInitials(username: string): string {
  const cleaned = username.replace(/[_\d✨💕🌟⭐️🔥💫]/g, "").trim()
  if (!cleaned) return "?"
  
  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    return cleaned.charAt(0)
  }
  return cleaned.charAt(0).toUpperCase()
}

// 生成换马甲后的新用户名
export function generateNewUsername(oldUsername: string, lang: "zh" | "en"): string {
  const suffixesZh = ["_小号", "_新号", "2号", "_归来", "_复活", "_重生"]
  const suffixesEn = ["_alt", "_new", "_v2", "_returns", "_reborn", "_backup"]
  const suffixes = lang === "zh" ? suffixesZh : suffixesEn
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  return oldUsername.replace(/[_\d]+$/, "") + randomSuffix
}
