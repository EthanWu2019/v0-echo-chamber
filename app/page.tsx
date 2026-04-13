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
import { translations, type Language } from "@/lib/i18n"
import { getPersonalityLabel } from "@/lib/i18n"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Call DeepSeek API to generate comments
async function fetchAIComments(
  postContent: string,
  lang: Language,
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
        userReplyContent,
        lang
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
        username: lang === "en" ? "System" : "系统提示",
        personality: "hater" as const,
        content: lang === "en" ? "Failed to load comments, please retry" : "评论加载失败，请重试",
        sentiment_impact: 0,
        delay: 0,
      },
    ]
  }
}

// Calculate account stats - deterministic calculation to avoid hydration mismatch
function calculateAccountStats(
  posts: Post[], 
  sentiment: number, 
  totalNegativeComments: number
): AccountStats {
  const totalComments = posts.reduce((sum, p) => 
    sum + p.comments.filter(c => !c.isTyping).length, 0
  )
  
  // Use deterministic values instead of Math.random()
  const baseFollowers = posts.length * 20
  const interactionBonus = Math.floor(totalComments * 2.5)
  const followers = baseFollowers + interactionBonus

  const haterRatio = Math.max(0.1, (100 - sentiment) / 100 * 0.6)
  const haters = Math.floor(followers * haterRatio)

  // Reputation directly tied to sentiment
  const reputation = Math.max(0, Math.min(100, sentiment))

  const controversy = Math.min(100, Math.floor(totalNegativeComments * 8 + (100 - sentiment) * 0.3))

  const influence = Math.min(100, Math.floor(
    posts.length * 10 + totalComments * 2 + followers * 0.05
  ))

  const totalLikes = posts.reduce((sum, p) => {
    const postLikes = p.likes
    const commentLikes = p.comments.reduce((cSum, c) => cSum + c.likes, 0)
    return sum + postLikes + commentLikes
  }, 0)

  return {
    followers,
    following: 25, // Fixed value
    haters,
    totalPosts: posts.length,
    totalLikes,
    reputation,
    controversy,
    influence,
  }
}

export default function EchoChamberPage() {
  const [lang, setLang] = useState<Language>("zh")
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

  // Get translations
  const t = translations[lang]

  // Convert API response to Comment object
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
      likes: Math.floor(Math.random() * 50),
      reposts: Math.floor(Math.random() * 10),
      timestamp: new Date(),
      replies: [],
    }
  }, [lang])

  // Calculate account stats
  const accountStats = calculateAccountStats(posts, sentiment, totalNegativeComments)

  // Update screen effects based on sentiment
  useEffect(() => {
    setIsLowSentiment(sentiment < 30)
  }, [sentiment])

  // Simulate post data growth
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(prev => prev.map(post => {
        if (post.isGenerating) return post
        
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

  // Handle language switch - reset everything
  const handleLanguageSwitch = useCallback(() => {
    const newLang = lang === "zh" ? "en" : "zh"
    setLang(newLang)
    // Reset all state
    setPosts([])
    setNotifications([])
    setNotificationCount(0)
    setSentiment(75)
    setSentimentTrend("stable")
    setTotalNegativeComments(0)
    setActiveNav(newLang === "zh" ? "首页" : "Home")
    setIsLowSentiment(false)
    setReplyingCommentIds(new Set())
  }, [lang])

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

    try {
      const aiResponses = await fetchAIComments(content, lang)
      
      for (let i = 0; i < aiResponses.length; i++) {
        const response = aiResponses[i]
        
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

        await new Promise(resolve => setTimeout(resolve, (response.delay + 0.5) * 1000))

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

        handleSentimentChange(response.sentiment_impact)

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
  }, [handleSentimentChange, responseToComment, lang])

  // Get post content for context
  const getPostContent = useCallback((postId: string) => {
    return posts.find(p => p.id === postId)?.content || ""
  }, [posts])

  // Handle reply to comment
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

    const post = posts.find(p => p.id === postId)
    const originalComment = post ? findComment(post.comments, commentId) : undefined

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
  }, [posts, handleSentimentChange, getPostContent, responseToComment, lang, t.me])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Handle navigation
  const handleNavClick = useCallback((label: string) => {
    setActiveNav(label)
    if (label === t.notifications) {
      setNotificationCount(0)
    }
  }, [t.notifications])

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
        lang={lang}
      />

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Sidebar - sticky */}
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
          {activeNav === t.home && (
            <>
              {/* Post Box */}
              <PostBox onPost={handlePost} isLoading={isPosting} t={t} />

              {/* Posts Feed */}
              <div className="mt-6 space-y-4">
                <AnimatePresence>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onReplyToComment={handleReplyToComment}
                      replyingCommentIds={replyingCommentIds}
                      lang={lang}
                      t={t}
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
                      {t.noPostsYet}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t.tryPosting}
                    </p>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Notifications View */}
          {activeNav === t.notifications && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground text-lg mb-2">
                    {t.noNotifications}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t.notificationsHint}
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
              {/* Profile Header */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">U</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{t.simulatedUser}</h2>
                    <p className="text-muted-foreground">{t.simulatedHandle}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t.profileBio}
                    </p>
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

              {/* User Posts */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">{t.myPosts}</h3>
                {posts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t.noPostsPublished}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onReplyToComment={handleReplyToComment}
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

      {/* Right Sidebar - sticky */}
      <aside className="fixed right-0 top-0 h-screen w-80 border-l border-border bg-card overflow-y-auto">
        <div className="p-6 space-y-6">
          <SentimentWidget sentiment={sentiment} trend={sentimentTrend} t={t} />
          <AccountWidget stats={accountStats} t={t} />
          <TrendingWidget t={t} />
        </div>
      </aside>
    </div>
  )
}
