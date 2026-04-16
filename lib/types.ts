export type PersonalityType = "hater" | "stan" | "logic-lord" | "moral-knight" | "spam-bot" | "normal"

export interface Comment {
  id: string
  username: string
  avatar?: string // 头像字母或 URL
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
  followers: number      // 粉丝数
  following: number      // 关注数
  haters: number         // 黑粉数量
  totalPosts: number     // 发帖数
  totalLikes: number     // 总获赞
  reputation: number     // 声誉值 0-100
  controversy: number    // 争议度 0-100
  influence: number      // 影响力 0-100
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

// 获取用户名首字母
export function getAvatarInitials(username: string): string {
  // 提取中文或英文首字母
  const cleaned = username.replace(/[_\d✨💕🌟⭐️🔥💫]/g, "").trim()
  if (!cleaned) return "?"
  
  // 如果是中文，取前一个字
  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    return cleaned.charAt(0)
  }
  // 英文取首字母大写
  return cleaned.charAt(0).toUpperCase()
}
