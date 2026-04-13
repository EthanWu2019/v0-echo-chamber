export type PersonalityType = "hater" | "stan" | "logic-lord" | "moral-knight" | "spam-bot"

export interface Comment {
  id: string
  username: string
  personality: PersonalityType
  personalityLabel: string
  content: string
  sentimentImpact: number
  likes: number
  timestamp: Date
  replies: Comment[]
  isTyping?: boolean
}

export interface Post {
  id: string
  content: string
  timestamp: Date
  likes: number
  reposts: number
  comments: Comment[]
  isGenerating?: boolean
}

export interface AICommentResponse {
  username: string
  personality: PersonalityType
  content: string
  sentiment_impact: number
  delay: number
}

export const PERSONALITY_CONFIG: Record<PersonalityType, { label: string; color: string; bgColor: string }> = {
  hater: { label: "喷子", color: "text-red-400", bgColor: "bg-red-500/20" },
  stan: { label: "饭圈", color: "text-pink-400", bgColor: "bg-pink-500/20" },
  "logic-lord": { label: "理中客", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  "moral-knight": { label: "键盘侠", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  "spam-bot": { label: "广告", color: "text-gray-400", bgColor: "bg-gray-500/20" },
}
