"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { PostBox } from "@/components/post-box"
import { PostCard } from "@/components/post-card"
import { SentimentWidget } from "@/components/sentiment-widget"
import { TrendingWidget } from "@/components/trending-widget"
import { NotificationToast } from "@/components/notification-toast"
import type { Post, Comment, AICommentResponse } from "@/lib/types"
import { PERSONALITY_CONFIG } from "@/lib/types"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Call DeepSeek API to generate comments
async function fetchAIComments(
  postContent: string,
  isReply = false,
  replyToContent = ""
): Promise<AICommentResponse[]> {
  try {
    const response = await fetch("/api/generate-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postContent, isReply, replyToContent }),
    })

    if (!response.ok) {
      throw new Error("API request failed")
    }

    const data = await response.json()
    return data.comments || []
  } catch (error) {
    console.error("[v0] Failed to fetch AI comments:", error)
    // Fallback comment
    return [
      {
        username: "系统提示",
        personality: "troll" as const,
        content: "评论加载失败，请重试",
        sentiment_impact: 0,
        delay: 0,
      },
    ]
  }
}

// Convert API response to Comment object
const responseToComment = (res: AICommentResponse): Comment => ({
  id: generateId(),
  username: res.username,
  personality: res.personality,
  personalityLabel: PERSONALITY_CONFIG[res.personality].label,
  content: res.content,
  sentimentImpact: res.sentiment_impact,
  likes: Math.floor(Math.random() * 50),
  timestamp: new Date(),
  replies: [],
})

export default function EchoChamberPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sentiment, setSentiment] = useState(75)
  const [sentimentTrend, setSentimentTrend] = useState<"up" | "down" | "stable">("stable")
  const [notifications, setNotifications] = useState<Comment[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [isPosting, setIsPosting] = useState(false)
  const [isLowSentiment, setIsLowSentiment] = useState(false)

  // Update screen effects based on sentiment
  useEffect(() => {
    setIsLowSentiment(sentiment < 30)
  }, [sentiment])

  // Handle sentiment change
  const handleSentimentChange = useCallback((impact: number) => {
    setSentiment(prev => {
      const newValue = Math.max(0, Math.min(100, prev + impact))
      setSentimentTrend(impact > 0 ? "up" : impact < 0 ? "down" : "stable")
      return newValue
    })
  }, [])

  // Handle new post
  const handlePost = useCallback(async (content: string) => {
    setIsPosting(true)
    
    const newPost: Post = {
      id: generateId(),
      content,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
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
        await new Promise(resolve => setTimeout(resolve, response.delay * 1000))

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
      personality: "stan",
      personalityLabel: "",
      content,
      sentimentImpact: 0,
      likes: 0,
      timestamp: new Date(),
      replies: [],
    }

    // Find and update the comment
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post
      
      const updateReplies = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, replies: [...comment.replies, userReply] }
          }
          return { ...comment, replies: updateReplies(comment.replies) }
        })
      }

      return { ...post, comments: updateReplies(post.comments) }
    }))

    // Generate targeted response
    const originalComment = posts
      .find(p => p.id === postId)?.comments
      .find(c => c.id === commentId)

    if (originalComment) {
      const responses = await fetchAIComments(content, true, originalComment.content)
      const response = responses[0]
      if (!response) return
      const aiReply = responseToComment(response)

      await new Promise(resolve => setTimeout(resolve, response.delay * 1000))

      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post
        
        const updateReplies = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, replies: [...comment.replies, aiReply] }
            }
            return { ...comment, replies: updateReplies(comment.replies) }
          })
        }

        return { ...post, comments: updateReplies(post.comments) }
      }))

      handleSentimentChange(response.sentiment_impact)

      if (response.sentiment_impact < 0) {
        setNotifications(prev => [aiReply, ...prev].slice(0, 10))
        setNotificationCount(prev => prev + 1)
      }
    }
  }, [posts, handleSentimentChange])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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

      {/* Sidebar */}
      <Sidebar notificationCount={notificationCount} />

      {/* Main Content */}
      <main className="ml-64 mr-80">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Header */}
          <motion.h1 
            className="text-xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            首页
          </motion.h1>

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
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-0 h-screen w-80 border-l border-border bg-card p-6 space-y-6 overflow-y-auto">
        <SentimentWidget sentiment={sentiment} trend={sentimentTrend} />
        <TrendingWidget />
        
        {/* Stats */}
        <div className="bg-secondary/50 rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-3">统计数据</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">发布动态</span>
              <span className="text-foreground font-medium">{posts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">收到评论</span>
              <span className="text-foreground font-medium">
                {posts.reduce((sum, p) => sum + p.comments.filter(c => !c.isTyping).length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">负面评论</span>
              <span className="text-red-400 font-medium">
                {posts.reduce((sum, p) => 
                  sum + p.comments.filter(c => c.sentimentImpact < 0 && !c.isTyping).length, 0
                )}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
