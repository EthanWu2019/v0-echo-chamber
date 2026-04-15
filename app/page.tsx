"use client"

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
import type { Post, Comment, AICommentResponse, AccountStats } from "@/lib/types"
import { PERSONALITY_CONFIG, getAvatarInitials } from "@/lib/types"
import { translations, type Language } from "@/lib/i18n"
import { getPersonalityLabel } from "@/lib/i18n"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Analyze content sentiment - keyword-based analysis
function analyzeContentSentiment(content: string, lang: Language): number {
  const positiveWordsZh = ["开心", "快乐", "感谢", "幸福", "爱", "喜欢", "成功", "努力", "加油", "美好", "温暖", "希望", "祝福", "分享", "帮助", "善良", "正能量", "棒", "好", "太棒了", "感动", "暖心", "可爱", "优秀"]
  const negativeWordsZh = ["烦", "累", "讨厌", "恶心", "傻", "蠢", "垃圾", "滚", "死", "骂", "吐槽", "怒", "生气", "愤怒", "失望", "抱怨", "无语", "崩溃", "丧", "烂", "坑", "骗"]
  
  const positiveWordsEn = ["happy", "love", "thanks", "grateful", "excited", "amazing", "wonderful", "beautiful", "hope", "success", "proud", "blessed", "kind", "help", "share", "positive", "great", "awesome", "fantastic", "incredible", "lovely", "sweet", "cute"]
  const negativeWordsEn = ["hate", "angry", "annoyed", "frustrated", "upset", "sad", "depressed", "rant", "complain", "suck", "worst", "terrible", "awful", "stupid", "idiot", "damn", "crap", "ugh", "trash", "scam", "fake"]
  
  const positiveWords = lang === "zh" ? positiveWordsZh : positiveWordsEn
  const negativeWords = lang === "zh" ? negativeWordsZh : negativeWordsEn
  
  const lowerContent = content.toLowerCase()
  let score = 0
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 4
  })
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 4
  })
  
  return Math.max(-15, Math.min(15, score))
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
  deletedUsername = ""
): Promise<AICommentResponse[]> {
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
        deletedUsername
      }),
    })

    if (!response.ok) throw new Error("API request failed")
    const data = await response.json()
    return data.comments || []
  } catch (error) {
    console.error("[v0] Failed to fetch AI comments:", error)
    return [{
      username: lang === "en" ? "System" : "系统提示",
      personality: "hater" as const,
      content: lang === "en" ? "Failed to load comments" : "评论加载失败",
      sentiment_impact: 0,
      delay: 0,
    }]
  }
}

// Fetch trending topics
async function fetchTrendingTopics(lang: Language): Promise<TrendingTopic[]> {
  try {
    const response = await fetch("/api/generate-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_topics", lang }),
    })
    if (!response.ok) throw new Error("Failed to fetch topics")
    const data = await response.json()
    return data.data || []
  } catch {
    return lang === "en" ? [
      { tag: "monday blues", count: "89K", hot: true },
      { tag: "adulting is hard", count: "67K", hot: false },
      { tag: "hot takes only", count: "123K", hot: true },
      { tag: "3am thoughts", count: "45K", hot: false },
      { tag: "work life balance", count: "78K", hot: true },
    ] : [
      { tag: "今天不想上班", count: "8.9万", hot: true },
      { tag: "成年人太难了", count: "6.7万", hot: false },
      { tag: "来点争议的", count: "12.3万", hot: true },
      { tag: "凌晨emo", count: "4.5万", hot: false },
      { tag: "工作生活平衡", count: "7.8万", hot: true },
    ]
  }
}

// Fetch topic posts
async function fetchTopicPosts(topic: string, lang: Language): Promise<Post[]> {
  try {
    const response = await fetch("/api/generate-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_posts", lang, topic }),
    })
    if (!response.ok) throw new Error("Failed to fetch posts")
    const data = await response.json()
    return (data.data || []).map((p: { username: string; content: string; likes: number; reposts: number; views: number }) => ({
      id: generateId(),
      content: p.content,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      likes: p.likes || Math.floor(Math.random() * 500),
      reposts: p.reposts || Math.floor(Math.random() * 100),
      views: p.views || Math.floor(Math.random() * 10000),
      comments: [],
      username: p.username,
    }))
  } catch {
    return []
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
  const [notifications, setNotifications] = useState<Comment[]>([])
  const [allNotifications, setAllNotifications] = useState<Comment[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
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
  const [otherUserPosts, setOtherUserPosts] = useState<Post[]>([])
  
  const otherPostTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Load initial topics
  useEffect(() => {
    fetchTrendingTopics(lang).then(setTrendingTopics)
  }, [lang])

  // Update follower history
  useEffect(() => {
    setFollowerHistory(prev => [...prev.slice(1), accountStats.followers])
  }, [accountStats.followers])

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
        const atRepostCap = post.reposts >= statsCap.reposts
        
        return {
          ...post,
          likes: atLikeCap ? post.likes : post.likes + (Math.random() < 0.15 ? Math.floor(Math.random() * 3 * growthMultiplier) : 0),
          reposts: atRepostCap ? post.reposts : post.reposts + (Math.random() < 0.05 ? 1 : 0),
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

  // Generate other user posts periodically
  useEffect(() => {
    const generateOtherPost = async () => {
      if (posts.length === 0) return
      
      const topics = trendingTopics.length > 0 
        ? trendingTopics 
        : [{ tag: lang === "en" ? "random thoughts" : "随便聊聊", count: "10K", hot: false }]
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      const topicPostsData = await fetchTopicPosts(randomTopic.tag, lang)
      if (topicPostsData.length > 0) {
        const randomPost = topicPostsData[Math.floor(Math.random() * topicPostsData.length)]
        
        // Generate comments for this post
        const aiResponses = await fetchAIComments(randomPost.content, lang)
        const comments = aiResponses.map(responseToComment)
        
        setOtherUserPosts(prev => [{
          ...randomPost,
          id: generateId(),
          comments,
          timestamp: new Date(),
        }, ...prev].slice(0, 5))
      }
    }

    // Generate first other post after user posts something
    if (posts.length > 0 && otherUserPosts.length === 0) {
      setTimeout(generateOtherPost, 30000) // 30 seconds after first post
    }

    // Then every 2-4 minutes
    otherPostTimerRef.current = setInterval(() => {
      if (posts.length > 0) {
        generateOtherPost()
      }
    }, 120000 + Math.random() * 120000)

    return () => {
      if (otherPostTimerRef.current) clearInterval(otherPostTimerRef.current)
    }
  }, [posts.length, trendingTopics, lang, responseToComment, otherUserPosts.length])

  // Language switch
  const handleLanguageSwitch = useCallback(() => {
    const newLang = lang === "zh" ? "en" : "zh"
    setLang(newLang)
    setPosts([])
    setNotifications([])
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
    setTrendingTopics([])
    setSelectedTopic(null)
    setTopicPosts([])
    setOtherUserPosts([])
    fetchTrendingTopics(newLang).then(setTrendingTopics)
  }, [lang])

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

  // Handle new post
  const handlePost = useCallback(async (content: string) => {
    setIsPosting(true)
    
    const contentScore = analyzeContentSentiment(content, lang)
    setContentSentimentBonus(prev => Math.max(-20, Math.min(20, prev + contentScore)))
    
    if (contentScore > 0) {
      handleSentimentChange(Math.floor(contentScore / 2))
    } else if (contentScore < 0) {
      handleSentimentChange(Math.floor(contentScore / 3))
    }

    const newPost: Post = {
      id: generateId(),
      content,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      views: Math.floor(Math.random() * 20) + 5,
      comments: [],
      isGenerating: true,
    }

    setPosts(prev => [newPost, ...prev])

    try {
      const aiResponses = await fetchAIComments(content, lang)
      const sortedResponses = [...aiResponses].sort((a, b) => a.delay - b.delay)
      
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
        const personalityDelay = response.personality === "stan" ? 800 : 1500 + response.delay * 1000
        await new Promise(resolve => setTimeout(resolve, personalityDelay))

        const comment = responseToComment(response)
        
        setPosts(prev => prev.map(p => {
          if (p.id !== newPost.id) return p
          return {
            ...p,
            comments: [...p.comments.filter(c => !c.isTyping), comment],
            isGenerating: i < sortedResponses.length - 1
          }
        }))

        handleSentimentChange(response.sentiment_impact)

        if (response.sentiment_impact < 0) {
          setNotifications(prev => [comment, ...prev].slice(0, 10))
          setAllNotifications(prev => [comment, ...prev].slice(0, 50))
          setNotificationCount(prev => prev + 1)
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
  }, [handleSentimentChange, responseToComment, lang])

  // Get post content
  const getPostContent = useCallback((postId: string) => {
    const userPost = posts.find(p => p.id === postId)
    if (userPost) return userPost.content
    const otherPost = otherUserPosts.find(p => p.id === postId)
    return otherPost?.content || ""
  }, [posts, otherUserPosts])

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

    // Check both user posts and other user posts
    const isUserPost = posts.some(p => p.id === postId)
    const targetPosts = isUserPost ? posts : otherUserPosts
    const setTargetPosts = isUserPost ? setPosts : setOtherUserPosts
    
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
      const responses = await fetchAIComments(
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
        setNotifications(prev => [aiReply, ...prev].slice(0, 10))
        setAllNotifications(prev => [aiReply, ...prev].slice(0, 50))
        setNotificationCount(prev => prev + 1)
      }
    }
  }, [posts, otherUserPosts, handleSentimentChange, getPostContent, responseToComment, lang, t.me])

  // Handle delete comment
  const handleDeleteComment = useCallback(async (
    postId: string,
    commentId: string,
    personality: string,
    username: string
  ) => {
    const isOwnComment = username === t.me
    const isUserPost = posts.some(p => p.id === postId)
    const setTargetPosts = isUserPost ? setPosts : setOtherUserPosts

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
      
      const responses = await fetchAIComments(
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
          setNotifications(prev => [angryResponse, ...prev].slice(0, 10))
          setAllNotifications(prev => [angryResponse, ...prev].slice(0, 50))
          setNotificationCount(prev => prev + 1)
        }
      }
    }
  }, [t.me, posts, getPostContent, lang, responseToComment, handleSentimentChange])

  // Dismiss toast notification (doesn't affect all notifications)
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Navigation
  const handleNavClick = useCallback((label: string) => {
    setActiveNav(label)
    setSelectedTopic(null)
    if (label === t.notifications) {
      setNotificationCount(0)
    }
  }, [t.notifications])

  // Topic click
  const handleTopicClick = useCallback(async (topic: TrendingTopic) => {
    setSelectedTopic(topic)
    setActiveNav(t.home)
    const topicPostsData = await fetchTopicPosts(topic.tag, lang)
    
    // Generate comments for each post
    const postsWithComments = await Promise.all(topicPostsData.map(async (post) => {
      const aiResponses = await fetchAIComments(post.content, lang)
      return { ...post, comments: aiResponses.map(responseToComment) }
    }))
    
    setTopicPosts(postsWithComments)
  }, [lang, responseToComment, t.home])

  // Load more topics
  const handleLoadMoreTopics = useCallback(async () => {
    setIsLoadingTopics(true)
    const newTopics = await fetchTrendingTopics(lang)
    setTrendingTopics(prev => [...prev, ...newTopics].slice(0, 15))
    setIsLoadingTopics(false)
  }, [lang])

  // All posts combined for home feed
  const allPosts = [...posts, ...otherUserPosts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
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
        notifications={notifications} 
        onDismiss={dismissNotification}
        lang={lang}
      />

      <ScrollToTop />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen">
        <Sidebar 
          notificationCount={notificationCount} 
          onNavClick={handleNavClick}
          activeNav={activeNav}
          lang={lang}
          t={t}
          onLanguageSwitch={handleLanguageSwitch}
        />
      </div>

      {/* Main Content */}
      <main className="ml-64 mr-80">
        <div className="max-w-2xl mx-auto py-6 px-4">
          <motion.h1 
            className="text-xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeNav + (selectedTopic?.tag || "")}
          >
            {selectedTopic ? `#${selectedTopic.tag}` : activeNav}
          </motion.h1>

          {/* Topic View */}
          {selectedTopic && (
            <TopicView
              topic={selectedTopic}
              posts={topicPosts}
              onBack={() => setSelectedTopic(null)}
              onPostClick={() => {}}
              lang={lang}
              t={t}
            />
          )}

          {/* Home View */}
          {!selectedTopic && activeNav === t.home && (
            <>
              <PostBox onPost={handlePost} isLoading={isPosting} t={t} />

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
                        replyingCommentIds={replyingCommentIds}
                        lang={lang}
                        t={t}
                        isOtherUser={isOtherUser}
                        username={(post as Post & { username?: string }).username}
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
                        replyingCommentIds={replyingCommentIds}
                        lang={lang}
                        t={t}
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
      <aside className="fixed right-0 top-0 h-screen w-80 border-l border-border overflow-y-auto">
        <div className="p-6 space-y-6">
          <SentimentWidget sentiment={sentiment} trend={sentimentTrend} t={t} />
          <AccountWidget stats={accountStats} t={t} />
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
    </div>
  )
}
