"use client"

// TypeScript declarations for View Transitions API
declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => ViewTransition
  }
  interface ViewTransition {
    ready: Promise<void>
    finished: Promise<void>
  }
}

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { PostBox } from "@/components/post-box"
import { PostCard } from "@/components/post-card"
import { SentimentWidget } from "@/components/sentiment-widget"
import { TrendingWidget, type TrendingTopic } from "@/components/trending-widget"
import { NotificationToast } from "@/components/notification-toast"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AccountWidget } from "@/components/account-widget"
import { ProfileStats } from "@/components/profile-stats"
import { TopicView } from "@/components/topic-view"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DMPanel } from "@/components/dm-panel"
import { AchievementsPanel, AchievementToast } from "@/components/achievements-panel"
import { StoryModePanel } from "@/components/story-mode-panel"
import { StoryModeView } from "@/components/story-mode-view"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ScreenEffects, useScreenShake } from "@/components/screen-effects"
import { IdleOverlay } from "@/components/idle-overlay"
import { ScreenSizeGuard } from "@/components/screen-size-guard"
import { useTabVisibility } from "@/hooks/use-tab-visibility"
import { SentimentAnalysis } from "@/components/sentiment-analysis"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import type { Post, Comment, AICommentResponse, AccountStats, DirectMessage, BlockedUser, Achievement, Poll, StoryScenario, Mention } from "@/lib/types"
import { PERSONALITY_CONFIG, getAvatarInitials, ACHIEVEMENTS, generateNewUsername } from "@/lib/types"
import { translations, type Language } from "@/lib/i18n"
import { getPersonalityLabel } from "@/lib/i18n"
import { 
  getRandomTopics, 
  getPostsForTopic, 
  getRandomOtherUserPost,
  type CachedTopic
} from "@/lib/cached-posts"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

type ReviewPhase = "idle" | "reviewing" | "approved" | "posting"

// Analyze content sentiment - keyword-based analysis
function analyzeContentSentiment(content: string, lang: Language): number {
  const positiveWordsZh = ["开心", "快乐", "感谢", "幸福", "爱", "喜欢", "成功", "努力", "加油", "美好", "温暖", "希望", "祝福", "分享", "帮助", "善良", "正能量", "棒", "好", "太棒了", "感动", "暖心", "可爱", "优秀", "谢谢", "感恩", "祝", "开心", "愉快"]
  const negativeWordsZh = ["烦", "累", "讨厌", "恶心", "傻", "蠢", "垃圾", "滚", "死", "骂", "吐槽", "怒", "生气", "愤怒", "失望", "抱怨", "无语", "崩溃", "丧", "烂", "坑", "骗", "草", "妈", "艹"]
  
  const positiveWordsEn = ["happy", "love", "thanks", "grateful", "excited", "amazing", "wonderful", "beautiful", "hope", "success", "proud", "blessed", "kind", "help", "share", "positive", "great", "awesome", "fantastic", "incredible", "lovely", "sweet", "cute", "appreciate", "thankful", "joy", "celebrate", "congrats", "proud", "accomplished"]
  const negativeWordsEn = ["hate", "angry", "annoyed", "frustrated", "upset", "sad", "depressed", "rant", "complain", "suck", "worst", "terrible", "awful", "stupid", "idiot", "damn", "crap", "ugh", "trash", "scam", "fake", "wtf", "fml", "toxic"]
  
  const positiveWords = lang === "zh" ? positiveWordsZh : positiveWordsEn
  const negativeWords = lang === "zh" ? negativeWordsZh : negativeWordsEn
  
  const lowerContent = content.toLowerCase()
  let score = 0
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 5
  })
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 5
  })
  
  return Math.max(-20, Math.min(20, score))
}

// Call DeepSeek API to generate comments
async function fetchAIComments(
  postContent: string,
  lang: Language,
  isReply = false,
  replyToContent = "",
  originalPostContent = "",
  userReplyContent = "",
  isDeleteResponse = false,
  deletedPersonality = "",
  deletedUsername = "",
  pollQuestion = "",
  pollOptions: string[] = [],
  imageUrl = ""
): Promise<{ comments: AICommentResponse[], pollVotes?: number[] }> {
  try {
    const response = await fetch("/api/generate-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        postContent, 
        isReply, 
        replyToContent,
        originalPostContent,
        userReplyContent,
        lang,
        isDeleteResponse,
        deletedPersonality,
        deletedUsername,
        pollQuestion,
        pollOptions,
        imageUrl
      }),
    })

    if (!response.ok) throw new Error("API request failed")
    const data = await response.json()
    return { comments: data.comments || [], pollVotes: data.pollVotes }
  } catch (error) {
    console.error("[v0] Failed to fetch AI comments:", error)
    return { comments: [{
      username: lang === "en" ? "System" : "系统提示",
      personality: "hater" as const,
      content: lang === "en" ? "Failed to load comments" : "评论加载失败",
      sentiment_impact: 0,
      delay: 0,
    }] }
  }
}

// Calculate stats cap based on account metrics
function calculateStatsCap(stats: AccountStats): { likes: number; views: number; reposts: number } {
  const baseMultiplier = 1 + (stats.influence / 100) * 2
  const controversyBonus = stats.controversy > 50 ? 1.5 : 1
  const followerFactor = Math.log10(Math.max(stats.followers, 10))
  
  return {
    likes: Math.floor(50 * baseMultiplier * followerFactor * controversyBonus),
    views: Math.floor(500 * baseMultiplier * followerFactor * controversyBonus),
    reposts: Math.floor(20 * baseMultiplier * followerFactor),
  }
}

// Calculate account stats
function calculateAccountStats(
  posts: Post[], 
  sentiment: number, 
  totalNegativeComments: number,
  contentSentimentBonus: number
): AccountStats {
  const totalComments = posts.reduce((sum, p) => 
    sum + p.comments.filter(c => !c.isTyping).length, 0
  )
  
  const baseFollowers = posts.length * 20
  const interactionBonus = Math.floor(totalComments * 2.5)
  const followers = baseFollowers + interactionBonus

  const haterRatio = Math.max(0.1, (100 - sentiment) / 100 * 0.6)
  const haters = Math.floor(followers * haterRatio)

  const reputation = Math.max(0, Math.min(100, sentiment + contentSentimentBonus))
  const controversy = Math.min(100, Math.floor(totalNegativeComments * 6 + (100 - sentiment) * 0.4))
  const influence = Math.min(100, Math.floor(posts.length * 12 + totalComments * 3 + followers * 0.03))

  const totalLikes = posts.reduce((sum, p) => {
    const postLikes = p.likes
    const commentLikes = p.comments.reduce((cSum, c) => cSum + c.likes, 0)
    return sum + postLikes + commentLikes
  }, 0)

  return {
    followers,
    following: 25,
    haters,
    totalPosts: posts.length,
    totalLikes,
    reputation,
    controversy,
    influence,
  }
}

export default function EchoChamberPage() {
  const [lang, setLang] = useState<Language>("en")
  const [posts, setPosts] = useState<Post[]>([])
  const [sentiment, setSentiment] = useState(75)
  const [sentimentTrend, setSentimentTrend] = useState<"up" | "down" | "stable">("stable")
  const [toastNotifications, setToastNotifications] = useState<Comment[]>([])
  const [allNotifications, setAllNotifications] = useState<Comment[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
  const [reviewPhase, setReviewPhase] = useState<ReviewPhase>("idle")
  const [reviewProgress, setReviewProgress] = useState(0)
  const [isLowSentiment, setIsLowSentiment] = useState(false)
  const [activeNav, setActiveNav] = useState("Home")
  const [totalNegativeComments, setTotalNegativeComments] = useState(0)
  const [replyingCommentIds, setReplyingCommentIds] = useState<Set<string>>(new Set())
  const [contentSentimentBonus, setContentSentimentBonus] = useState(0)
  const [followerHistory, setFollowerHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null)
  const [topicPosts, setTopicPosts] = useState<Post[]>([])
  const [topicPostsCache, setTopicPostsCache] = useState<Record<string, Post[]>>({})
  const [isLoadingTopicPosts, setIsLoadingTopicPosts] = useState(false)
  const [otherUserPosts, setOtherUserPosts] = useState<Post[]>([])
  const [showLanguageConfirm, setShowLanguageConfirm] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  // New feature states
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])
  const [showDMPanel, setShowDMPanel] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [reportedComments, setReportedComments] = useState<Set<string>>(new Set())
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [showAchievementsPanel, setShowAchievementsPanel] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [showStoryModePanel, setShowStoryModePanel] = useState(false)
  const [activeStoryScenario, setActiveStoryScenario] = useState<StoryScenario | null>(null)
  const [showStoryModeView, setShowStoryModeView] = useState(false)
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false)
  const [showLoadDataDialog, setShowLoadDataDialog] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [dayCount, setDayCount] = useState(1)
  const [sentimentHistory, setSentimentHistory] = useState<number[]>([75, 75, 75, 75, 75])
  const [heatHistory, setHeatHistory] = useState<number[]>([0, 0, 0, 0, 0])
  const [hotWords, setHotWords] = useState<{ word: string; count: number; sentiment: "positive" | "negative" | "neutral" }[]>([])
  const [showNegativeFlash, setShowNegativeFlash] = useState(false)
  const [mentions, setMentions] = useState<Mention[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [firstFlamed, setFirstFlamed] = useState(false)
  const [sentimentCrashed, setSentimentCrashed] = useState(false)
  const [sentimentRecovered, setSentimentRecovered] = useState(false)
  
  const otherPostTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { playSound } = useSoundEffects(soundEnabled)
  const { triggerShake } = useScreenShake()
  const { isLoaded, hasSavedData, saveSession, loadSession, clearSession, getSavedTime } = useLocalStorage()
  
  // Tab visibility for retention messages
  useTabVisibility(lang)

  const t = translations[lang]
  const accountStats = calculateAccountStats(posts, sentiment, totalNegativeComments, contentSentimentBonus)
  const statsCap = calculateStatsCap(accountStats)

  // Convert API response to Comment
  const responseToComment = useCallback((res: AICommentResponse): Comment => {
    const config = PERSONALITY_CONFIG[res.personality] || PERSONALITY_CONFIG.hater
    return {
      id: generateId(),
      username: res.username,
      avatar: getAvatarInitials(res.username),
      personality: res.personality in PERSONALITY_CONFIG ? res.personality : "hater",
      personalityLabel: getPersonalityLabel(lang, res.personality),
      content: res.content,
      sentimentImpact: res.sentiment_impact,
      likes: 0,
      reposts: 0,
      timestamp: new Date(),
      replies: [],
    }
  }, [lang])

  // Load initial topics from cache
  useEffect(() => {
    const cachedTopics = getRandomTopics(lang, 5)
    setTrendingTopics(cachedTopics.map(t => ({ tag: t.tag, count: t.count, hot: t.hot })))
  }, [lang])

  // Check for saved data on mount
  useEffect(() => {
    if (isLoaded && hasSavedData) {
      setShowLoadDataDialog(true)
      setLastSavedTime(getSavedTime())
    }
  }, [isLoaded, hasSavedData, getSavedTime])

  // Save session handler
  const handleSaveData = useCallback(() => {
    saveSession({
      lang,
      posts,
      sentiment,
      totalNegativeComments,
      directMessages,
      blockedUsers,
      unlockedAchievements,
      dayCount,
      firstFlamed,
      sentimentCrashed,
      sentimentRecovered
    })
    setLastSavedTime(new Date())
    playSound("notification")
  }, [lang, posts, sentiment, totalNegativeComments, directMessages, blockedUsers, unlockedAchievements, dayCount, firstFlamed, sentimentCrashed, sentimentRecovered, saveSession, playSound])

  // Load saved session
  const handleLoadData = useCallback(() => {
    const session = loadSession()
    if (session) {
      setLang(session.lang)
      setPosts(session.posts)
      setSentiment(session.sentiment)
      setTotalNegativeComments(session.totalNegativeComments)
      setDirectMessages(session.directMessages)
      setBlockedUsers(session.blockedUsers)
      setUnlockedAchievements(session.unlockedAchievements)
      setDayCount(session.dayCount)
      setFirstFlamed(session.firstFlamed)
      setSentimentCrashed(session.sentimentCrashed)
      setSentimentRecovered(session.sentimentRecovered)
      setLastSavedTime(new Date(session.savedAt))
    }
    setShowLoadDataDialog(false)
  }, [loadSession])

  // Clear session handler
  const handleClearData = useCallback(() => {
    setShowClearDataConfirm(true)
  }, [])

  const handleClearDataConfirm = useCallback(() => {
    clearSession()
    setShowClearDataConfirm(false)
    setLastSavedTime(null)
    // Reset all state
    setPosts([])
    setSentiment(75)
    setTotalNegativeComments(0)
    setDirectMessages([])
    setBlockedUsers([])
    setUnlockedAchievements([])
    setDayCount(1)
    setFirstFlamed(false)
    setSentimentCrashed(false)
    setSentimentRecovered(false)
    setReportedComments(new Set())
  }, [clearSession])

  // Update follower history
  useEffect(() => {
    setFollowerHistory(prev => [...prev.slice(1), accountStats.followers])
  }, [accountStats.followers])

  // Track sentiment history
  useEffect(() => {
    setSentimentHistory(prev => [...prev.slice(-11), sentiment])
    
    // Check for sentiment crash/recovery
    if (sentiment < 30 && !sentimentCrashed) {
      setSentimentCrashed(true)
    }
    if (sentimentCrashed && sentiment > 70 && !sentimentRecovered) {
      setSentimentRecovered(true)
    }
  }, [sentiment, sentimentCrashed, sentimentRecovered])

  // Update heat history based on activity
  useEffect(() => {
    const totalActivity = posts.reduce((sum, p) => sum + p.comments.length + p.likes, 0)
    setHeatHistory(prev => [...prev.slice(-19), totalActivity])
  }, [posts])

  // Generate DMs periodically
  useEffect(() => {
    if (posts.length === 0 || isPaused) return

    const generateDM = () => {
      if (isPaused) return
      const dmContents = lang === "zh" ? [
        { content: "你好，能认识一下吗？", personality: "stan" as const },
        { content: "看了你���帖子，我觉得你说得很有道理", personality: "normal" as const },
        { content: "你是不是有病啊？发这种东西", personality: "hater" as const },
        { content: "我是你的粉丝，能加个好友吗？", personality: "stan" as const },
        { content: "我代表正义来审判你", personality: "moral-knight" as const },
        { content: "加�����信吗？有事商量", personality: "spam-bot" as const },
      ] : [
        { content: "Hey, can we chat?", personality: "stan" as const },
        { content: "Saw your post, you make a good point", personality: "normal" as const },
        { content: "What is wrong with you? Posting this stuff", personality: "hater" as const },
        { content: "I'm a big fan, can we be friends?", personality: "stan" as const },
        { content: "I'm here to pass judgment on you", personality: "moral-knight" as const },
        { content: "DM me for business opportunity", personality: "spam-bot" as const },
      ]

      const randomDM = dmContents[Math.floor(Math.random() * dmContents.length)]
      const config = PERSONALITY_CONFIG[randomDM.personality]
      
      const names = lang === "zh" 
        ? ["小明", "网友A", "正义哥", "小粉丝", "路人甲", "广告商"]
        : ["John", "UserA", "JusticeGuy", "FanBoy", "RandomGuy", "AdBot"]
      
      const newDM: DirectMessage = {
        id: generateId(),
        from: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000),
        personality: randomDM.personality,
        content: randomDM.content,
        timestamp: new Date(),
        isRead: false
      }

      setDirectMessages(prev => [newDM, ...prev].slice(0, 20))
      playSound("notification")
    }

    // First DM after 1 minute
    const firstDMTimer = setTimeout(generateDM, 60000)
    // Then every 2-5 minutes
    const dmInterval = setInterval(generateDM, 120000 + Math.random() * 180000)

    return () => {
      clearTimeout(firstDMTimer)
      clearInterval(dmInterval)
    }
  }, [posts.length, lang, playSound, isPaused])

  // Check achievements
  useEffect(() => {
    const checkStats = {
      totalPosts: posts.length,
      totalComments: posts.reduce((sum, p) => sum + p.comments.length, 0),
      totalNegativeComments,
      sentiment,
      followers: accountStats.followers,
      haters: accountStats.haters,
      blockedUsers: blockedUsers.length,
      reportedComments: reportedComments.size,
      daysActive: dayCount,
      firstFlamed,
      sentimentCrashed,
      sentimentRecovered
    }

    const unlockedIds = new Set(unlockedAchievements.map(a => a.id))
    
    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedIds.has(achievement.id) && achievement.condition(checkStats)) {
        const achievementWithTime = { ...achievement, unlockedAt: new Date() }
        setUnlockedAchievements(prev => [...prev, achievementWithTime])
        setNewAchievement(achievementWithTime)
        playSound("achievement")
        
        // Auto dismiss after 5 seconds
        setTimeout(() => setNewAchievement(null), 5000)
        break // Only unlock one at a time
      }
    }
  }, [posts, totalNegativeComments, sentiment, accountStats, blockedUsers, reportedComments, dayCount, firstFlamed, sentimentCrashed, sentimentRecovered, unlockedAchievements, playSound])

  // Day counter - increments with each post
  useEffect(() => {
    setDayCount(Math.floor(posts.length / 3) + 1)
  }, [posts.length])

  // Extract hot words from comments
  useEffect(() => {
    const wordCounts = new Map<string, { count: number; sentiment: "positive" | "negative" | "neutral" }>()
    
    const negativeWordsSet = new Set(lang === "zh" 
      ? ["烦", "累", "讨厌", "恶心", "傻", "蠢", "垃圾", "滚", "骂", "怒", "愤怒", "失望", "无语", "崩溃", "丧", "烂"]
      : ["hate", "angry", "annoyed", "frustrated", "sad", "terrible", "awful", "stupid", "damn", "trash", "toxic"]
    )
    
    const positiveWordsSet = new Set(lang === "zh"
      ? ["开心", "快乐", "感谢", "幸福", "爱", "喜欢", "成功", "棒", "好", "可爱", "优秀"]
      : ["happy", "love", "thanks", "amazing", "wonderful", "beautiful", "great", "awesome"]
    )

    posts.forEach(post => {
      post.comments.forEach(comment => {
        const words = comment.content.split(/[\s,，。！？!?\n]+/).filter(w => w.length > 1 && w.length < 10)
        words.forEach(word => {
          const lowerWord = word.toLowerCase()
          const existing = wordCounts.get(lowerWord) || { count: 0, sentiment: "neutral" as const }
          let sentiment: "positive" | "negative" | "neutral" = "neutral"
          if (negativeWordsSet.has(lowerWord)) sentiment = "negative"
          else if (positiveWordsSet.has(lowerWord)) sentiment = "positive"
          wordCounts.set(lowerWord, { count: existing.count + 1, sentiment })
        })
      })
    })

    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([word, data]) => ({ word, ...data }))

    setHotWords(sortedWords)
  }, [posts, lang])

  // Screen effects
  useEffect(() => {
    setIsLowSentiment(sentiment < 30)
  }, [sentiment])

  // Simulate post data growth with caps
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(prev => prev.map(post => {
        if (post.isGenerating) return post
        
        const ageMinutes = (Date.now() - new Date(post.timestamp).getTime()) / 60000
        const growthMultiplier = ageMinutes < 2 ? 3 : ageMinutes < 5 ? 1.5 : ageMinutes < 10 ? 0.5 : 0.1
        
        // Apply caps
        const atLikeCap = post.likes >= statsCap.likes
        const atViewCap = post.views >= statsCap.views
        
        return {
          ...post,
          likes: atLikeCap ? post.likes : post.likes + (Math.random() < 0.15 ? Math.floor(Math.random() * 3 * growthMultiplier) : 0),
          views: atViewCap ? post.views : post.views + Math.floor(Math.random() * 10 * growthMultiplier),
        }
      }))
      
      // Also grow other user posts
      setOtherUserPosts(prev => prev.map(post => ({
        ...post,
        likes: post.likes + (Math.random() < 0.1 ? Math.floor(Math.random() * 5) : 0),
        views: post.views + Math.floor(Math.random() * 20),
      })))
    }, 2000)

    return () => clearInterval(interval)
  }, [statsCap])

  // Generate other user posts periodically using cached data
  useEffect(() => {
    const generateOtherPost = async () => {
      if (posts.length === 0) return
      
      // Use cached post
      const cachedPost = getRandomOtherUserPost(lang)
      
      // Generate comments for this post
      const { comments: aiResponses } = await fetchAIComments(cachedPost.content, lang)
      const comments = aiResponses.map(responseToComment)
      
      const newPost: Post = {
        id: generateId(),
        content: cachedPost.content,
        timestamp: new Date(),
        likes: cachedPost.likes,
        views: cachedPost.views,
        reposts: 0,
        comments,
        username: cachedPost.username,
      }
      
      setOtherUserPosts(prev => [newPost, ...prev].slice(0, 5))
    }

    // Generate first other post after user posts something
    if (posts.length > 0 && otherUserPosts.length === 0) {
      setTimeout(generateOtherPost, 30000) // 30 seconds after first post
    }

    // Then every 2-4 minutes
    otherPostTimerRef.current = setInterval(() => {
      if (posts.length > 0 && !isPaused) {
        generateOtherPost()
      }
    }, 120000 + Math.random() * 120000)

    return () => {
      if (otherPostTimerRef.current) clearInterval(otherPostTimerRef.current)
    }
  }, [posts.length, lang, responseToComment, otherUserPosts.length, isPaused])

  // Language switch - show confirmation first
  const handleLanguageSwitchClick = useCallback(() => {
    setShowLanguageConfirm(true)
  }, [])

  const handleLanguageSwitchConfirm = useCallback(() => {
    setShowLanguageConfirm(false)
    const newLang = lang === "zh" ? "en" : "zh"
    setLang(newLang)
    setPosts([])
    setToastNotifications([])
    setAllNotifications([])
    setNotificationCount(0)
    setSentiment(75)
    setSentimentTrend("stable")
    setTotalNegativeComments(0)
    setActiveNav(newLang === "zh" ? "首页" : "Home")
    setIsLowSentiment(false)
    setReplyingCommentIds(new Set())
    setContentSentimentBonus(0)
    setFollowerHistory([0, 0, 0, 0, 0, 0, 0, 0])
    setSelectedTopic(null)
    setTopicPosts([])
    setTopicPostsCache({})
    setOtherUserPosts([])
    // Load cached topics for new language
    const cachedTopics = getRandomTopics(newLang, 5)
    setTrendingTopics(cachedTopics.map(t => ({ tag: t.tag, count: t.count, hot: t.hot })))
  }, [lang])

  // Theme toggle with view transition
  const isAnimatingRef = useRef(false)
  
  const handleThemeToggle = useCallback((e?: React.MouseEvent) => {
    if (isAnimatingRef.current) return

    // Get click coordinates as circle center
    const x = e?.clientX ?? window.innerWidth / 2
    const y = e?.clientY ?? window.innerHeight / 2
    const w = window.innerWidth
    const h = window.innerHeight
    
    // Calculate max radius to cover entire screen from click position
    const maxRadius = Math.ceil(
      Math.sqrt(Math.max(x, w - x) ** 2 + Math.max(y, h - y) ** 2)
    )

    const newIsDark = !isDarkMode

    // Check if View Transitions API is supported
    if (document.startViewTransition) {
      isAnimatingRef.current = true

      // Set transition direction attribute BEFORE starting transition
      document.documentElement.setAttribute(
        "data-theme-transition", 
        newIsDark ? "to-dark" : "to-light"
      )

      // Start View Transition
      const transition = document.startViewTransition(() => {
        document.documentElement.classList.remove("dark", "light")
        document.documentElement.classList.add(newIsDark ? "dark" : "light")
        setIsDarkMode(newIsDark)
      })

      // When transition is ready, execute clip-path animation
      transition.ready.then(() => {
        // Dark -> Light: circle expands from click point (animate new view)
        // Light -> Dark: circle contracts to click point (animate old view in reverse)
        const clipPathFrames = newIsDark
          ? [
              `circle(${maxRadius}px at ${x}px ${y}px)`,
              `circle(0px at ${x}px ${y}px)`,
            ]
          : [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ]

        document.documentElement.animate(
          { clipPath: clipPathFrames },
          {
            duration: 500,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            pseudoElement: newIsDark
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
            fill: "both",
          }
        )
      })

      transition.finished.then(() => {
        isAnimatingRef.current = false
        document.documentElement.removeAttribute("data-theme-transition")
      })
    } else {
      // Fallback for browsers without View Transitions API
      document.documentElement.classList.remove("dark", "light")
      document.documentElement.classList.add(newIsDark ? "dark" : "light")
      setIsDarkMode(newIsDark)
    }
  }, [isDarkMode])

  // Sentiment change
  const handleSentimentChange = useCallback((impact: number) => {
    setSentiment(prev => {
      const newValue = Math.max(0, Math.min(100, prev + impact))
      setSentimentTrend(impact > 0 ? "up" : impact < 0 ? "down" : "stable")
      return newValue
    })
    if (impact < 0) {
      setTotalNegativeComments(prev => prev + 1)
    }
  }, [])

  // Add notification (both toast and persistent)
  const addNotification = useCallback((comment: Comment) => {
    setToastNotifications(prev => [comment, ...prev].slice(0, 10))
    setAllNotifications(prev => [comment, ...prev].slice(0, 50))
    setNotificationCount(prev => prev + 1)
  }, [])

  // Handle new post with review process
  const handlePost = useCallback(async (content: string, imageUrl?: string, poll?: Poll) => {
    setIsPosting(true)
    setReviewPhase("reviewing")
    setReviewProgress(0)
    
    // Simulate review process
    const reviewDuration = 2000 + Math.random() * 1000
    const startTime = Date.now()
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(90, (elapsed / reviewDuration) * 100)
      setReviewProgress(progress)
    }, 50)
    
    // Analyze content sentiment
    const contentScore = analyzeContentSentiment(content, lang)
    setContentSentimentBonus(prev => Math.max(-20, Math.min(20, prev + contentScore)))
    
    if (contentScore > 0) {
      handleSentimentChange(Math.floor(contentScore / 2))
    } else if (contentScore < 0) {
      handleSentimentChange(Math.floor(contentScore / 3))
    }

    // Wait for review simulation
    await new Promise(resolve => setTimeout(resolve, reviewDuration))
    clearInterval(progressInterval)
    
    // Show approved
    setReviewProgress(100)
    setReviewPhase("approved")
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Start posting
    setReviewPhase("posting")

    const newPost: Post = {
      id: generateId(),
      content,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      views: Math.floor(Math.random() * 20) + 5,
      comments: [],
      isGenerating: true,
      imageUrl,
      poll,
    }

    setPosts(prev => [newPost, ...prev])
    
    // Reset review state
    setReviewPhase("idle")
    setReviewProgress(0)

    try {
      // Pass poll and image data to AI
      const pollQuestion = poll?.question || ""
      const pollOptions = poll?.options.map(o => o.text) || []
      const { comments: aiResponses, pollVotes } = await fetchAIComments(
        content, lang, false, "", "", "", false, "", "", 
        pollQuestion, pollOptions, imageUrl || ""
      )
      const sortedResponses = [...aiResponses].sort((a, b) => a.delay - b.delay)
      
      // Distribute poll votes across comments - each commenter might vote
      const votesToApply = pollVotes || []
      let voteIndex = 0
      
      // Add initial delay before comments start appearing (simulate real social media)
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000))
      
      for (let i = 0; i < sortedResponses.length; i++) {
        const response = sortedResponses[i]
        
        // Show typing indicator
        setPosts(prev => prev.map(p => {
          if (p.id !== newPost.id) return p
          return {
            ...p,
            comments: [
              ...p.comments.filter(c => !c.isTyping),
              { ...responseToComment(response), isTyping: true, id: `typing-${i}` }
            ]
          }
        }))

        // Staggered delays - stans come fast, others slower
        const personalityDelay = response.personality === "stan" 
          ? 1000 + Math.random() * 500
          : 2000 + response.delay * 1500 + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, personalityDelay))

        const comment = responseToComment(response)
        
        setPosts(prev => prev.map(p => {
          if (p.id !== newPost.id) return p
          
          // Apply a vote from this commenter if available
          let updatedPoll = p.poll
          if (p.poll && votesToApply[voteIndex] !== undefined) {
            const voteOptionIndex = votesToApply[voteIndex]
            const newOptions = p.poll.options.map((opt, idx) => ({
              ...opt,
              votes: idx === voteOptionIndex ? opt.votes + 1 : opt.votes
            }))
            const totalVotes = newOptions.reduce((sum, opt) => sum + opt.votes, 0)
            updatedPoll = {
              ...p.poll,
              options: newOptions.map(opt => ({
                ...opt,
                percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
              })),
              totalVotes
            }
          }
          
          return {
            ...p,
            comments: [...p.comments.filter(c => !c.isTyping), comment],
            isGenerating: i < sortedResponses.length - 1,
            poll: updatedPoll
          }
        }))
        
        // Move to next vote
        if (votesToApply[voteIndex] !== undefined) {
          voteIndex++
        }

        handleSentimentChange(response.sentiment_impact)

        if (response.sentiment_impact < 0) {
          addNotification(comment)
          playSound("negative")
          setShowNegativeFlash(true)
          triggerShake()
          setTimeout(() => setShowNegativeFlash(false), 300)
          if (!firstFlamed) setFirstFlamed(true)
        }
      }
    } catch {
      console.error("Failed to generate comments")
    } finally {
      setIsPosting(false)
      setPosts(prev => prev.map(p => 
        p.id === newPost.id ? { ...p, isGenerating: false } : p
      ))
    }
  }, [handleSentimentChange, responseToComment, lang, addNotification])

  // Get post content
  const getPostContent = useCallback((postId: string) => {
    const userPost = posts.find(p => p.id === postId)
    if (userPost) return userPost.content
    const otherPost = otherUserPosts.find(p => p.id === postId)
    if (otherPost) return otherPost.content
    const topicPost = topicPosts.find(p => p.id === postId)
    return topicPost?.content || ""
  }, [posts, otherUserPosts, topicPosts])

  // Handle comment on any post
  const handleCommentOnPost = useCallback(async (postId: string, content: string) => {
    const userCommentId = generateId()
    const userComment: Comment = {
      id: userCommentId,
      username: t.me,
      avatar: t.me.charAt(0).toUpperCase(),
      personality: "stan",
      personalityLabel: "",
      content,
      sentimentImpact: 0,
      likes: 0,
      reposts: 0,
      timestamp: new Date(),
      replies: [],
    }

    // Determine which post list to update
    const isUserPost = posts.some(p => p.id === postId)
    const isOtherUserPost = otherUserPosts.some(p => p.id === postId)
    const isTopicPost = topicPosts.some(p => p.id === postId)
    
    // Add user's comment immediately at the beginning (will be sorted later)
    if (isUserPost) {
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return { ...p, comments: [userComment, ...p.comments] }
      }))
    } else if (isOtherUserPost) {
      setOtherUserPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return { ...p, comments: [userComment, ...p.comments] }
      }))
    } else if (isTopicPost) {
      setTopicPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return { ...p, comments: [userComment, ...p.comments] }
      }))
    }

    // Generate AI reply - should be nested under user's comment
    const postContent = getPostContent(postId)
    const { comments: responses } = await fetchAIComments(content, lang, true, "", postContent, content)
    
    if (responses.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500))
      const aiReply = responseToComment(responses[0])
      
      // Helper to add reply to user's comment (nested)
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === userCommentId) {
            return { ...c, replies: [...c.replies, aiReply] }
          }
          return c
        })
      }
      
      if (isUserPost) {
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          return { ...p, comments: addReplyToComment(p.comments) }
        }))
      } else if (isOtherUserPost) {
        setOtherUserPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          return { ...p, comments: addReplyToComment(p.comments) }
        }))
      } else if (isTopicPost) {
        setTopicPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          return { ...p, comments: addReplyToComment(p.comments) }
        }))
      }

      handleSentimentChange(responses[0].sentiment_impact)
      if (responses[0].sentiment_impact < 0) {
        addNotification(aiReply)
      }
    }
  }, [t.me, posts, otherUserPosts, topicPosts, getPostContent, lang, responseToComment, handleSentimentChange, addNotification])

  // Handle reply
  const handleReplyToComment = useCallback(async (
    postId: string,
    commentId: string,
    content: string
  ) => {
    const userReply: Comment = {
      id: generateId(),
      username: t.me,
      avatar: t.me.charAt(0).toUpperCase(),
      personality: "stan",
      personalityLabel: "",
      content,
      sentimentImpact: 0,
      likes: 0,
      reposts: 0,
      timestamp: new Date(),
      replies: [],
    }

    const findComment = (comments: Comment[], id: string): Comment | undefined => {
      for (const c of comments) {
        if (c.id === id) return c
        const found = findComment(c.replies, id)
        if (found) return found
      }
      return undefined
    }

    // Determine which post list to update
    const isUserPost = posts.some(p => p.id === postId)
    const isOtherUserPost = otherUserPosts.some(p => p.id === postId)
    const isTopicPost = topicPosts.some(p => p.id === postId)
    
    let targetPosts: Post[] = []
    let setTargetPosts: React.Dispatch<React.SetStateAction<Post[]>>
    
    if (isUserPost) {
      targetPosts = posts
      setTargetPosts = setPosts
    } else if (isOtherUserPost) {
      targetPosts = otherUserPosts
      setTargetPosts = setOtherUserPosts
    } else if (isTopicPost) {
      targetPosts = topicPosts
      setTargetPosts = setTopicPosts
    } else {
      return
    }
    
    const post = targetPosts.find(p => p.id === postId)
    const originalComment = post ? findComment(post.comments, commentId) : undefined

    setTargetPosts((prev: Post[]) => prev.map(p => {
      if (p.id !== postId) return p
      
      const updateReplies = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, replies: [...comment.replies, userReply] }
          }
          return { ...comment, replies: updateReplies(comment.replies) }
        })
      }

      return { ...p, comments: updateReplies(p.comments) }
    }))

    setReplyingCommentIds(prev => new Set(prev).add(commentId))

    if (originalComment) {
      const originalPostContent = getPostContent(postId)
      const { comments: responses } = await fetchAIComments(
        content, 
        lang,
        true, 
        originalComment.content,
        originalPostContent,
        content
      )
      const response = responses[0]
      if (!response) {
        setReplyingCommentIds(prev => {
          const next = new Set(prev)
          next.delete(commentId)
          return next
        })
        return
      }
      const aiReply = responseToComment(response)

      await new Promise(resolve => setTimeout(resolve, (response.delay + 1) * 1000))

      setReplyingCommentIds(prev => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })

      setTargetPosts((prev: Post[]) => prev.map(p => {
        if (p.id !== postId) return p
        
        const updateReplies = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, replies: [...comment.replies, aiReply] }
            }
            return { ...comment, replies: updateReplies(comment.replies) }
          })
        }

        return { ...p, comments: updateReplies(p.comments) }
      }))

      handleSentimentChange(response.sentiment_impact)

      if (response.sentiment_impact < 0) {
        addNotification(aiReply)
      }
    }
  }, [posts, otherUserPosts, topicPosts, handleSentimentChange, getPostContent, responseToComment, lang, t.me, addNotification])

  // Handle delete comment
  const handleDeleteComment = useCallback(async (
    postId: string,
    commentId: string,
    personality: string,
    username: string
  ) => {
    const isOwnComment = username === t.me
    const isUserPost = posts.some(p => p.id === postId)
    const isOtherUserPost = otherUserPosts.some(p => p.id === postId)
    const isTopicPost = topicPosts.some(p => p.id === postId)
    
    let setTargetPosts: React.Dispatch<React.SetStateAction<Post[]>>
    
    if (isUserPost) {
      setTargetPosts = setPosts
    } else if (isOtherUserPost) {
      setTargetPosts = setOtherUserPosts
    } else if (isTopicPost) {
      setTargetPosts = setTopicPosts
    } else {
      return
    }

    setTargetPosts((prev: Post[]) => prev.map(p => {
      if (p.id !== postId) return p
      
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments
          .filter(c => c.id !== commentId)
          .map(c => ({ ...c, replies: removeComment(c.replies) }))
      }

      return { ...p, comments: removeComment(p.comments) }
    }))

    if (!isOwnComment) {
      const originalPostContent = getPostContent(postId)
      
      const { comments: responses } = await fetchAIComments(
        originalPostContent,
        lang,
        false, "", "", "",
        true,
        personality,
        username
      )

      if (responses.length > 0) {
        const angryResponse = responseToComment(responses[0])
        
        await new Promise(resolve => setTimeout(resolve, 1500))

        setTargetPosts((prev: Post[]) => prev.map(p => {
          if (p.id !== postId) return p
          return { ...p, comments: [...p.comments, angryResponse] }
        }))

        handleSentimentChange(responses[0].sentiment_impact)

        if (responses[0].sentiment_impact < 0) {
          addNotification(angryResponse)
        }
      }
    }
  }, [t.me, posts, otherUserPosts, topicPosts, getPostContent, lang, responseToComment, handleSentimentChange, addNotification])

  // Handle pin comment
  const handlePinComment = useCallback((postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const newPinnedId = p.pinnedCommentId === commentId ? undefined : commentId
      return { ...p, pinnedCommentId: newPinnedId }
    }))
  }, [])

  // Handle report comment
  const handleReportComment = useCallback((postId: string, commentId: string, username: string) => {
    setReportedComments(prev => new Set(prev).add(commentId))
    // Show toast notification
    playSound("notification")
  }, [playSound])

  // Handle block user - they will come back with a new username
  const handleBlockUser = useCallback((username: string, personality: string) => {
    const newUsername = generateNewUsername(username, lang)
    setBlockedUsers(prev => [...prev, {
      username,
      personality: personality as any,
      blockedAt: new Date(),
      newUsername
    }])
    playSound("notification")
    
    // After a delay, the blocked user might come back with a new name
    setTimeout(() => {
      // Generate a comeback comment from the blocked user with new name
      const comebackComments = lang === "zh" 
        ? [`换个号继续！`, `你以为拉黑我有用？`, `我又回来了`, `拉黑？小场面`]
        : [`Back with a new account!`, `You thought blocking me would work?`, `I'm back!`, `Block me? Cute.`]
      
      const comebackContent = comebackComments[Math.floor(Math.random() * comebackComments.length)]
      
      // Add to a random post
      if (posts.length > 0) {
        const randomPost = posts[Math.floor(Math.random() * posts.length)]
        const comebackComment: Comment = {
          id: generateId(),
          username: newUsername,
          avatar: getAvatarInitials(newUsername),
          personality: personality as any,
          personalityLabel: getPersonalityLabel(lang, personality),
          content: comebackContent,
          sentimentImpact: -5,
          likes: 0,
          reposts: 0,
          timestamp: new Date(),
          replies: [],
        }
        
        setPosts(prev => prev.map(p => {
          if (p.id !== randomPost.id) return p
          return { ...p, comments: [...p.comments, comebackComment] }
        }))
        
        handleSentimentChange(-5)
        addNotification(comebackComment)
        playSound("negative")
      }
    }, 30000 + Math.random() * 30000) // 30-60 seconds later
  }, [lang, posts, handleSentimentChange, addNotification, playSound])

  // Handle vote on poll
  const handleVotePoll = useCallback((postId: string, optionIndex: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll) return p
      const newOptions = p.poll.options.map((opt, i) => ({
        ...opt,
        votes: i === optionIndex ? opt.votes + 1 : opt.votes
      }))
      const totalVotes = newOptions.reduce((sum, opt) => sum + opt.votes, 0)
      const optionsWithPercentage = newOptions.map(opt => ({
        ...opt,
        percentage: Math.round((opt.votes / totalVotes) * 100)
      }))
      return {
        ...p,
        poll: {
          ...p.poll,
          options: optionsWithPercentage,
          totalVotes,
          userVotedIndex: optionIndex
        }
      }
    }))
  }, [])

  // Handle repost
  const handleRepost = useCallback((postId: string, comment?: string) => {
    const originalPost = posts.find(p => p.id === postId) || otherUserPosts.find(p => p.id === postId)
    if (!originalPost) return

    const repost: Post = {
      id: generateId(),
      content: comment || "",
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      views: Math.floor(Math.random() * 10) + 5,
      comments: [],
      repostOf: {
        username: originalPost.username || t.me,
        content: originalPost.content,
        postId: originalPost.id
      }
    }

    setPosts(prev => [repost, ...prev])
    
    // Update original post repost count
    const updateRepostCount = (postsList: Post[]) => postsList.map(p => 
      p.id === postId ? { ...p, reposts: p.reposts + 1 } : p
    )
    setPosts(updateRepostCount)
    setOtherUserPosts(updateRepostCount)
  }, [posts, otherUserPosts, t.me])

  // Dismiss toast notification (doesn't affect all notifications)
  const dismissToastNotification = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Navigation
  const handleNavClick = useCallback((label: string) => {
    setActiveNav(label)
    setSelectedTopic(null)
    if (label === t.notifications) {
      setNotificationCount(0)
    }
  }, [t.notifications])

  // Topic click - use cached posts
  const handleTopicClick = useCallback(async (topic: TrendingTopic) => {
    setSelectedTopic(topic)
    setActiveNav(t.home)
    
    // Check if we have cached posts for this topic
    if (topicPostsCache[topic.tag]) {
      setTopicPosts(topicPostsCache[topic.tag])
      return
    }
    
    setIsLoadingTopicPosts(true)
    
    // Get cached posts for this topic
    const cachedPosts = getPostsForTopic(topic.tag, lang)
    
    // Generate comments for each post
    const postsWithComments = await Promise.all(cachedPosts.map(async (p) => {
      const { comments: aiResponses } = await fetchAIComments(p.content, lang)
      return {
        id: generateId(),
        content: p.content,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        likes: p.likes,
        reposts: 0,
        views: p.views,
        comments: aiResponses.map(responseToComment),
        username: p.username,
      } as Post
    }))
    
    // Cache the posts
    setTopicPostsCache(prev => ({ ...prev, [topic.tag]: postsWithComments }))
    setTopicPosts(postsWithComments)
    setIsLoadingTopicPosts(false)
  }, [lang, responseToComment, t.home, topicPostsCache])

  // Load more topics from cache
  const handleLoadMoreTopics = useCallback(() => {
    setIsLoadingTopics(true)
    // Simulate loading delay
    setTimeout(() => {
      const newTopics = getRandomTopics(lang, 5)
      setTrendingTopics(prev => {
        const existingTags = new Set(prev.map(t => t.tag))
        const unique = newTopics.filter(t => !existingTags.has(t.tag))
        return [...prev, ...unique.map(t => ({ tag: t.tag, count: t.count, hot: t.hot }))].slice(0, 15)
      })
      setIsLoadingTopics(false)
    }, 500)
  }, [lang])

  // All posts combined for home feed
  const allPosts = [...posts, ...otherUserPosts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <ScreenSizeGuard lang={lang} t={t}>
      <div className={`min-h-screen transition-all duration-500 ${
        isLowSentiment ? "grayscale-[30%]" : ""
      }`}>
        {/* Low sentiment effect */}
      <AnimatePresence>
        {isLowSentiment && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 border-4 border-red-500/30"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Notification Toasts - separate from all notifications */}
      <NotificationToast 
        notifications={toastNotifications} 
        onDismiss={dismissToastNotification}
        lang={lang}
      />

      <ScrollToTop />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen">
        <Sidebar 
          notificationCount={notificationCount}
          dmCount={directMessages.filter(m => !m.isRead).length}
          onNavClick={handleNavClick}
          activeNav={activeNav}
          lang={lang}
          t={t}
          onLanguageSwitch={handleLanguageSwitchClick}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          onOpenDM={() => setShowDMPanel(true)}
          onOpenAchievements={() => setShowAchievementsPanel(true)}
          onOpenStoryMode={() => setShowStoryModePanel(true)}
          dayCount={dayCount}
          hasSavedData={hasSavedData}
          onSaveData={handleSaveData}
          onClearData={handleClearData}
          lastSavedTime={lastSavedTime}
        />
      </div>

      {/* Main Content */}
      <main className="ml-[275px] mr-[350px]">
        <div className="max-w-[600px] mx-auto border-x border-border min-h-screen">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
            <motion.h1 
              className="text-xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={activeNav + (selectedTopic?.tag || "")}
            >
              {selectedTopic ? `#${selectedTopic.tag}` : activeNav}
            </motion.h1>
          </div>

          {/* Topic View */}
          {selectedTopic && (
            <TopicView
              topic={selectedTopic}
              posts={topicPosts}
              onBack={() => setSelectedTopic(null)}
              onReplyToComment={handleReplyToComment}
              onDeleteComment={handleDeleteComment}
              onCommentOnPost={handleCommentOnPost}
              replyingCommentIds={replyingCommentIds}
              isLoading={isLoadingTopicPosts}
              lang={lang}
              t={t}
            />
          )}

          {/* Home View */}
          {!selectedTopic && activeNav === t.home && (
            <>
              <PostBox 
                onPost={handlePost} 
                isLoading={isPosting} 
                reviewProgress={reviewProgress}
                reviewPhase={reviewPhase}
                t={t} 
              />

              <div className="mt-6 space-y-4">
                <AnimatePresence>
                  {allPosts.map((post) => {
                    const isOtherUser = otherUserPosts.some(p => p.id === post.id)
                    return (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReplyToComment={handleReplyToComment}
                        onDeleteComment={handleDeleteComment}
                        onCommentOnPost={handleCommentOnPost}
                        onPinComment={!isOtherUser ? handlePinComment : undefined}
                        onReportComment={handleReportComment}
                        onBlockUser={handleBlockUser}
                        onVotePoll={handleVotePoll}
                        onRepost={handleRepost}
                        replyingCommentIds={replyingCommentIds}
                        blockedUsers={blockedUsers}
                        lang={lang}
                        t={t}
                        isOtherUser={isOtherUser}
                        username={(post as Post & { username?: string }).username}
                        autoExpand={!isOtherUser && post.comments.length > 0}
                      />
                    )
                  })}
                </AnimatePresence>

                {allPosts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground text-lg mb-2">{t.noPostsYet}</p>
                    <p className="text-muted-foreground text-sm">{t.tryPosting}</p>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Notifications View - shows ALL notifications, not just toasts */}
          {activeNav === t.notifications && (
            <div className="space-y-3">
              {allNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground text-lg mb-2">{t.noNotifications}</p>
                  <p className="text-muted-foreground text-sm">{t.notificationsHint}</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {allNotifications.map((notification) => {
                    const isNegative = notification.sentimentImpact < 0
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`bg-card border rounded-xl p-4 ${
                          isNegative ? "border-red-500/30" : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br ${
                            PERSONALITY_CONFIG[notification.personality]?.avatarGradient || "from-gray-500 to-gray-600"
                          }`}>
                            <span className="text-white font-bold text-sm">
                              {notification.avatar || "?"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isNegative ? "text-red-300" : "text-foreground"}`}>
                                {notification.username}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {t.commentedOnYourPost}
                              </span>
                            </div>
                            <p className={`mt-1 text-sm ${
                              isNegative ? "text-red-200/80" : "text-foreground/80"
                            }`}>
                              {notification.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Profile View */}
          {activeNav === t.profile && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">U</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{t.simulatedUser}</h2>
                    <p className="text-muted-foreground">{t.simulatedHandle}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t.profileBio}</p>
                  </div>
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="font-bold text-foreground">{posts.length}</span>
                    <span className="text-muted-foreground ml-1">{t.posts}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">{accountStats.following}</span>
                    <span className="text-muted-foreground ml-1">{t.following}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">{accountStats.followers}</span>
                    <span className="text-muted-foreground ml-1">{t.followers}</span>
                  </div>
                </div>
              </div>

              {/* Profile Stats Charts */}
              <ProfileStats 
                stats={accountStats} 
                followerHistory={followerHistory}
                t={t}
              />

              <div>
                <h3 className="font-semibold text-foreground mb-4">{t.myPosts}</h3>
                {posts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t.noPostsPublished}</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReplyToComment={handleReplyToComment}
                        onDeleteComment={handleDeleteComment}
                        onCommentOnPost={handleCommentOnPost}
                        onPinComment={handlePinComment}
                        onReportComment={handleReportComment}
                        onBlockUser={handleBlockUser}
                        onVotePoll={handleVotePoll}
                        onRepost={handleRepost}
                        replyingCommentIds={replyingCommentIds}
                        blockedUsers={blockedUsers}
                        lang={lang}
                        t={t}
                        autoExpand={post.comments.length > 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-0 h-screen w-[350px] border-l border-border overflow-y-auto bg-background">
        <div className="p-5 space-y-5">
          <SentimentWidget sentiment={sentiment} trend={sentimentTrend} t={t} />
          <AccountWidget stats={accountStats} t={t} />
          <SentimentAnalysis
            sentimentHistory={sentimentHistory}
            hotWords={hotWords}
            heatHistory={heatHistory}
            t={t}
            lang={lang}
          />
          <TrendingWidget 
            t={t} 
            lang={lang}
            topics={trendingTopics}
            onTopicClick={handleTopicClick}
            onLoadMore={handleLoadMoreTopics}
            isLoadingMore={isLoadingTopics}
          />
        </div>
      </aside>

      {/* Language Switch Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLanguageConfirm}
        title={t.confirmLanguageSwitch}
        description={t.confirmLanguageSwitchDesc}
        onConfirm={handleLanguageSwitchConfirm}
        onCancel={() => setShowLanguageConfirm(false)}
        t={t}
      />

      {/* DM Panel */}
      <DMPanel
        isOpen={showDMPanel}
        onClose={() => setShowDMPanel(false)}
        messages={directMessages}
        onMarkAllRead={() => setDirectMessages(prev => prev.map(m => ({ ...m, isRead: true })))}
        onDeleteMessage={(id) => setDirectMessages(prev => prev.filter(m => m.id !== id))}
        onSendReply={async (messageId, content) => {
          // Add user's reply immediately
          const message = directMessages.find(m => m.id === messageId)
          if (!message) return

          // Build conversation history for context
          const conversationHistory = [
            `${message.from}: ${message.content}`,
            ...(message.replies || []).map(r => 
              r.isFromUser ? `You: ${r.content}` : `${message.from}: ${r.content}`
            ),
            `You: ${content}`
          ].join("\n")

          setDirectMessages(prev => prev.map(m => {
            if (m.id !== messageId) return m
            return {
              ...m,
              isRead: true,
              replies: [...(m.replies || []), { content, timestamp: new Date(), isFromUser: true }]
            }
          }))

          // Generate AI response
          try {
            const response = await fetch("/api/generate-comments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                isDMReply: true,
                dmPersonality: message.personality,
                dmContent: message.content,
                dmConversation: conversationHistory,
                userDMReply: content,
                lang
              }),
            })

            if (response.ok) {
              const data = await response.json()
              if (data.comments && data.comments.length > 0) {
                // Wait a bit for realism
                await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))
                
                const aiReply = data.comments[0]
                setDirectMessages(prev => prev.map(m => {
                  if (m.id !== messageId) return m
                  return {
                    ...m,
                    replies: [...(m.replies || []), { 
                      content: aiReply.content, 
                      timestamp: new Date(),
                      isFromUser: false
                    }]
                  }
                }))
                playSound("notification")
              }
            }
          } catch (error) {
            console.error("[v0] Failed to generate DM reply:", error)
          }
        }}
        t={t}
        lang={lang}
      />

      {/* Achievements Panel */}
      <AchievementsPanel
        isOpen={showAchievementsPanel}
        onClose={() => setShowAchievementsPanel(false)}
        unlockedAchievements={unlockedAchievements}
        t={t}
        lang={lang}
      />

      {/* Achievement Toast */}
      <AnimatePresence>
        {newAchievement && (
          <AchievementToast
            achievement={newAchievement}
            onClose={() => setNewAchievement(null)}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Story Mode Panel */}
      <StoryModePanel
        isOpen={showStoryModePanel}
        onClose={() => setShowStoryModePanel(false)}
        onStartScenario={(scenario) => {
          setActiveStoryScenario(scenario)
          setShowStoryModePanel(false)
          setShowStoryModeView(true)
        }}
        t={t}
        lang={lang}
      />

      {/* Story Mode View - Isolated from main state */}
      {showStoryModeView && activeStoryScenario && (
        <StoryModeView
          scenario={activeStoryScenario}
          onExit={() => {
            setShowStoryModeView(false)
            setActiveStoryScenario(null)
          }}
          t={t}
          lang={lang}
        />
      )}

      {/* Clear Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearDataConfirm}
        title={t.confirmClearData}
        description={t.confirmClearDataDesc}
        onConfirm={handleClearDataConfirm}
        onCancel={() => setShowClearDataConfirm(false)}
        t={t}
      />

      {/* Load Data Dialog */}
      <AnimatePresence>
        {showLoadDataDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={() => setShowLoadDataDialog(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-card border border-border rounded-2xl p-6 z-[101]"
            >
              <h3 className="text-lg font-semibold mb-2">{t.loadSavedData}</h3>
              {lastSavedTime && (
                <p className="text-sm text-muted-foreground mb-4">
                  {t.lastSaved}: {lastSavedTime.toLocaleString()}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoadDataDialog(false)}
                  className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                >
                  {t.startFresh}
                </button>
                <button
                  onClick={handleLoadData}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  {t.loadData}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Screen Effects */}
      <ScreenEffects
        isLowSentiment={isLowSentiment}
        isCritical={sentiment < 20}
        showFlash={showNegativeFlash}
      />

      {/* Idle Overlay - Pauses generation when user is inactive */}
      <IdleOverlay
        timeout={120000}
        onResume={() => setIsPaused(false)}
        onIdle={() => setIsPaused(true)}
        lang={lang}
        t={t}
      />

      </div>
    </ScreenSizeGuard>
  )
}
