"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { PostBox } from "@/components/post-box"
import { PostCard } from "@/components/post-card"
import { SentimentWidget } from "@/components/sentiment-widget"
import { TrendingWidget } from "@/components/trending-widget"
import { NotificationToast } from "@/components/notification-toast"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AccountWidget } from "@/components/account-widget"
import type { Post, Comment, AICommentResponse, AccountStats } from "@/lib/types"
import { PERSONALITY_CONFIG, getAvatarInitials } from "@/lib/types"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Call DeepSeek API to generate comments
async function fetchAIComments(
  postContent: string,
  isReply = false,
  replyToContent = "",
  originalPostContent = "",
  userReplyContent = ""
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
        userReplyContent
      }),
    })

    if (!response.ok) {
      throw new Error("API request failed")
    }

    const data = await response.json()
    return data.comments || []
  } catch (error) {
    console.error("[v0] Failed to fetch AI comments:", error)
    return [
      {
        username: "系统提示",
        personality: "hater" as const,
        content: "评论加载失败，请重试",
        sentiment_impact: 0,
        delay: 0,
      },
    ]
  }
}

// Convert API response to Comment object
const responseToComment = (res: AICommentResponse): Comment => {
  const config = PERSONALITY_CONFIG[res.personality] || PERSONALITY_CONFIG.hater
  return {
    id: generateId(),
    username: res.username,
    avatar: getAvatarInitials(res.username),
    personality: res.personality in PERSONALITY_CONFIG ? res.personality : "hater",
    personalityLabel: config.label,
    content: res.content,
    sentimentImpact: res.sentiment_impact,
    likes: Math.floor(Math.random() * 50),
    reposts: Math.floor(Math.random() * 10),
    timestamp: new Date(),
    replies: [],
  }
}

// 计算账号数据
function calculateAccountStats(
  posts: Post[], 
  sentiment: number, 
  totalNegativeComments: number
): AccountStats {
  const totalComments = posts.reduce((sum, p) => 
    sum + p.comments.filter(c => !c.isTyping).length, 0
  )
  
  // 基础粉丝 = 帖子数 * 随机系数 + 评论互动带来的曝光
  const baseFollowers = posts.length * (15 + Math.floor(Math.random() * 10))
  const interactionBonus = Math.floor(totalComments * 2.5)
  const followers = baseFollowers + interactionBonus

  // 黑粉比例与好感度负相关
  const haterRatio = Math.max(0.1, (100 - sentiment) / 100 * 0.6)
  const haters = Math.floor(followers * haterRatio)

  // 声誉值主要由好感度决定
  const reputation = Math.max(0, Math.min(100, sentiment + Math.floor(Math.random() * 10) - 5))

  // 争议度：负面评论越多越争议
  const controversy = Math.min(100, Math.floor(totalNegativeComments * 8 + (100 - sentiment) * 0.3))

  // 影响力：发帖多、互动多则影响力大
  const influence = Math.min(100, Math.floor(
    posts.length * 10 + totalComments * 2 + followers * 0.05
  ))

  // 总获赞
  const totalLikes = posts.reduce((sum, p) => {
    const postLikes = p.likes
    const commentLikes = p.comments.reduce((cSum, c) => cSum + c.likes, 0)
    return sum + postLikes + commentLikes
  }, 0)

  return {
    followers,
    following: Math.floor(Math.random() * 50) + 10,
    haters,
    totalPosts: posts.length,
    totalLikes,
    reputation,
    controversy,
    influence,
  }
}

export default function EchoChamberPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sentiment, setSentiment] = useState(75)
  const [sentimentTrend, setSentimentTrend] = useState<"up" | "down" | "stable">("stable")
  const [notifications, setNotifications] = useState<Comment[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
  const [isLowSentiment, setIsLowSentiment] = useState(false)
  const [activeNav, setActiveNav] = useState("首页")
  const [totalNegativeComments, setTotalNegativeComments] = useState(0)
  const [replyingCommentIds, setReplyingCommentIds] = useState<Set<string>>(new Set())

  // 计算账号数据
  const accountStats = calculateAccountStats(posts, sentiment, totalNegativeComments)

  // Update screen effects based on sentiment
  useEffect(() => {
    setIsLowSentiment(sentiment < 30)
  }, [sentiment])

  // 模拟帖子数据增长
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(prev => prev.map(post => {
        // 只对不在生成中的帖子增长数据
        if (post.isGenerating) return post
        
        // 根据好感度决定增长速度
        const growthMultiplier = sentiment > 50 ? 1.5 : 0.5
        
        return {
          ...post,
          likes: post.likes + (Math.random() < 0.15 ? Math.floor(Math.random() * 3 * growthMultiplier) : 0),
          reposts: post.reposts + (Math.random() < 0.05 ? 1 : 0),
          views: post.views + Math.floor(Math.random() * 10 * growthMultiplier),
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [sentiment])

  // Handle sentiment change
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
    
    const newPost: Post = {
      id: generateId(),
      content,
      timestamp: new Date(),
      likes: Math.floor(Math.random() * 5),
      reposts: 0,
      views: Math.floor(Math.random() * 50) + 10,
      comments: [],
      isGenerating: true,
    }

    setPosts(prev => [newPost, ...prev])

    // Generate AI comments via DeepSeek API
    try {
      const aiResponses = await fetchAIComments(content)
      
      // Add comments one by one with delays
      for (let i = 0; i < aiResponses.length; i++) {
        const response = aiResponses[i]
        
        // Add typing indicator first
        setPosts(prev => prev.map(p => {
          if (p.id !== newPost.id) return p
          return {
            ...p,
            comments: [
              ...p.comments.filter(c => !c.isTyping),
              { ...responseToComment(response), isTyping: true }
            ]
          }
        }))

        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, (response.delay + 0.5) * 1000))

        // Replace typing with actual comment
        const comment = responseToComment(response)
        
        setPosts(prev => prev.map(p => {
          if (p.id !== newPost.id) return p
          return {
            ...p,
            comments: [
              ...p.comments.filter(c => !c.isTyping),
              comment
            ],
            isGenerating: i < aiResponses.length - 1
          }
        }))

        // Update sentiment
        handleSentimentChange(response.sentiment_impact)

        // Add to notifications if negative
        if (response.sentiment_impact < 0) {
          setNotifications(prev => [comment, ...prev].slice(0, 10))
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
  }, [handleSentimentChange])

  // Handle reply to comment - 获取帖子原文用于上下文
  const getPostContent = useCallback((postId: string) => {
    return posts.find(p => p.id === postId)?.content || ""
  }, [posts])

  // Handle reply to comment
  const handleReplyToComment = useCallback(async (
    postId: string,
    commentId: string,
    content: string
  ) => {
    // Add user reply
    const userReply: Comment = {
      id: generateId(),
      username: "我",
      avatar: "我",
      personality: "stan",
      personalityLabel: "",
      content,
      sentimentImpact: 0,
      likes: 0,
      reposts: 0,
      timestamp: new Date(),
      replies: [],
    }

    // Find the original comment
    const findComment = (comments: Comment[], id: string): Comment | undefined => {
      for (const c of comments) {
        if (c.id === id) return c
        const found = findComment(c.replies, id)
        if (found) return found
      }
      return undefined
    }

    const post = posts.find(p => p.id === postId)
    const originalComment = post ? findComment(post.comments, commentId) : undefined

    // Find and update the comment
    setPosts(prev => prev.map(p => {
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

    // Show typing indicator
    setReplyingCommentIds(prev => new Set(prev).add(commentId))

    if (originalComment) {
      const originalPostContent = getPostContent(postId)
      const responses = await fetchAIComments(
        content, 
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

      // Remove typing indicator
      setReplyingCommentIds(prev => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })

      setPosts(prev => prev.map(p => {
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
        setNotificationCount(prev => prev + 1)
      }
    }
  }, [posts, handleSentimentChange, getPostContent])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Handle navigation
  const handleNavClick = useCallback((label: string) => {
    setActiveNav(label)
    if (label === "通知") {
      setNotificationCount(0)
    }
  }, [])

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isLowSentiment ? "grayscale-[30%]" : ""
    }`}>
      {/* Low sentiment screen shake effect */}
      <AnimatePresence>
        {isLowSentiment && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 border-4 border-red-500/30"
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Notification Toasts */}
      <NotificationToast 
        notifications={notifications} 
        onDismiss={dismissNotification}
      />

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Sidebar - sticky */}
      <div className="fixed left-0 top-0 h-screen">
        <Sidebar 
          notificationCount={notificationCount} 
          onNavClick={handleNavClick}
          activeNav={activeNav}
        />
      </div>

      {/* Main Content */}
      <main className="ml-64 mr-80">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Header */}
          <motion.h1 
            className="text-xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeNav}
          >
            {activeNav}
          </motion.h1>

          {/* Home View */}
          {activeNav === "首页" && (
            <>
              {/* Post Box */}
              <PostBox onPost={handlePost} isLoading={isPosting} />

              {/* Posts Feed */}
              <div className="mt-6 space-y-4">
                <AnimatePresence>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onReplyToComment={handleReplyToComment}
                      replyingCommentIds={replyingCommentIds}
                    />
                  ))}
                </AnimatePresence>

                {posts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground text-lg mb-2">
                      还没有动态
                    </p>
                    <p className="text-muted-foreground text-sm">
                      发一条试试，体验社交媒体的「另一面」
                    </p>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Notifications View */}
          {activeNav === "通知" && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground text-lg mb-2">
                    暂无通知
                  </p>
                  <p className="text-muted-foreground text-sm">
                    发布动态后，这里会显示收到的评论通知
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification) => {
                    const isNegative = notification.sentimentImpact < 0
                    const config = PERSONALITY_CONFIG[notification.personality] || PERSONALITY_CONFIG.hater
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
                          <div className={`w-10 h-10 rounded-full shrink-0 bg-gradient-to-br ${config.avatarGradient} flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">
                              {getAvatarInitials(notification.username)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isNegative ? "text-red-300" : "text-foreground"}`}>
                                {notification.username}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                评论了你的动态
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
          {activeNav === "个人主页" && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">U</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">模拟用户</h2>
                    <p className="text-muted-foreground">@simulated_user</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      这是一个用于体验网络暴力模拟的虚拟账户
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="font-bold text-foreground">{posts.length}</span>
                    <span className="text-muted-foreground ml-1">动态</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">{accountStats.following}</span>
                    <span className="text-muted-foreground ml-1">关注</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">{accountStats.followers}</span>
                    <span className="text-muted-foreground ml-1">粉丝</span>
                  </div>
                </div>
              </div>

              {/* User Posts */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">我的动态</h3>
                {posts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    还没有发布任何动态
                  </p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReplyToComment={handleReplyToComment}
                        replyingCommentIds={replyingCommentIds}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - sticky */}
      <aside className="fixed right-0 top-0 h-screen w-80 border-l border-border bg-card overflow-y-auto">
        <div className="p-6 space-y-6">
          <SentimentWidget sentiment={sentiment} trend={sentimentTrend} />
          <AccountWidget stats={accountStats} />
          <TrendingWidget />
        </div>
      </aside>
    </div>
  )
}
