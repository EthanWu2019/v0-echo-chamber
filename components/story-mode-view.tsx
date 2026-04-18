"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, Trophy, RotateCcw } from "lucide-react"
import { PostBox } from "@/components/post-box"
import { PostCard } from "@/components/post-card"
import { SentimentWidget } from "@/components/sentiment-widget"
import { ScreenEffects } from "@/components/screen-effects"
import type { Post, Comment, AICommentResponse, StoryScenario, Poll, BlockedUser } from "@/lib/types"
import { PERSONALITY_CONFIG, getAvatarInitials, generateNewUsername } from "@/lib/types"
import type { Translations, Language } from "@/lib/i18n"
import { getPersonalityLabel } from "@/lib/i18n"

const generateId = () => Math.random().toString(36).substring(2, 9)

interface StoryModeViewProps {
  scenario: StoryScenario
  onExit: () => void
  t: Translations
  lang: Language
}

// Call API to generate comments
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

    if (!response.ok) throw new Error("API request failed")
    const data = await response.json()
    return data.comments || []
  } catch (error) {
    console.error("[v0] Failed to fetch AI comments:", error)
    return []
  }
}

export function StoryModeView({ scenario, onExit, t, lang }: StoryModeViewProps) {
  // Isolated state for story mode
  const [posts, setPosts] = useState<Post[]>([])
  const [sentiment, setSentiment] = useState(50) // Start at 50 for more drama
  const [sentimentTrend, setSentimentTrend] = useState<"up" | "down" | "stable">("stable")
  const [isLowSentiment, setIsLowSentiment] = useState(false)
  const [totalNegativeComments, setTotalNegativeComments] = useState(0)
  const [replyingCommentIds, setReplyingCommentIds] = useState<Set<string>>(new Set())
  const [isPosting, setIsPosting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [showNegativeFlash, setShowNegativeFlash] = useState(false)

  const previousSentimentRef = useRef(sentiment)

  // Convert API response to Comment
  const responseToComment = useCallback((res: AICommentResponse): Comment => {
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

  // Handle sentiment change
  const handleSentimentChange = useCallback((impact: number) => {
    setSentiment(prev => {
      const newValue = Math.max(0, Math.min(100, prev + impact))
      if (impact < 0) {
        setShowNegativeFlash(true)
        setTimeout(() => setShowNegativeFlash(false), 300)
      }
      return newValue
    })
    if (impact < 0) {
      setTotalNegativeComments(prev => prev + 1)
    }
  }, [])

  // Update sentiment trend
  useEffect(() => {
    if (sentiment > previousSentimentRef.current + 5) {
      setSentimentTrend("up")
    } else if (sentiment < previousSentimentRef.current - 5) {
      setSentimentTrend("down")
    } else {
      setSentimentTrend("stable")
    }
    previousSentimentRef.current = sentiment
    setIsLowSentiment(sentiment < 30)
  }, [sentiment])

  // Initialize with scenario's initial post
  useEffect(() => {
    const initScenario = async () => {
      const initialContent = lang === "zh" ? scenario.initialPost.zh : scenario.initialPost.en
      
      const newPost: Post = {
        id: generateId(),
        content: initialContent,
        timestamp: new Date(),
        likes: Math.floor(Math.random() * 50) + 10,
        reposts: Math.floor(Math.random() * 10),
        views: Math.floor(Math.random() * 500) + 100,
        comments: [],
        isGenerating: true,
      }

      setPosts([newPost])

      // Generate initial comments based on scenario difficulty
      const commentCount = scenario.difficulty === "hard" ? 5 : scenario.difficulty === "medium" ? 4 : 3
      const responses = await fetchAIComments(initialContent, lang)
      
      // Add comments with delays
      for (let i = 0; i < Math.min(commentCount, responses.length); i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))
        const comment = responseToComment(responses[i])
        
        setPosts(prev => prev.map(p => {
          if (p.id !== newPost.id) return p
          return { ...p, comments: [...p.comments, comment], isGenerating: i < commentCount - 1 }
        }))

        handleSentimentChange(responses[i].sentiment_impact)
      }

      setPosts(prev => prev.map(p => ({ ...p, isGenerating: false })))
    }

    initScenario()
  }, [scenario, lang, responseToComment, handleSentimentChange])

  // Handle new post
  const handlePost = useCallback(async (content: string, imageUrl?: string, poll?: Poll) => {
    if (!content.trim()) return
    setIsPosting(true)

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

    // Generate AI comments
    const responses = await fetchAIComments(content, lang)
    
    for (const response of responses) {
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))
      const comment = responseToComment(response)
      
      setPosts(prev => prev.map(p => {
        if (p.id !== newPost.id) return p
        return { ...p, comments: [...p.comments, comment] }
      }))

      handleSentimentChange(response.sentiment_impact)
    }

    setPosts(prev => prev.map(p => 
      p.id === newPost.id ? { ...p, isGenerating: false } : p
    ))

    setIsPosting(false)
  }, [lang, responseToComment, handleSentimentChange])

  // Handle reply to comment
  const handleReplyToComment = useCallback(async (postId: string, commentId: string, content: string) => {
    // Add user reply
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

    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, userReply] }
        }
        if (c.replies.length > 0) {
          return { ...c, replies: addReplyToComment(c.replies) }
        }
        return c
      })
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return { ...p, comments: addReplyToComment(p.comments) }
    }))

    setReplyingCommentIds(prev => {
      const next = new Set(prev)
      next.add(commentId)
      return next
    })

    // Generate AI response
    const originalComment = posts.find(p => p.id === postId)?.comments.find(c => c.id === commentId)
    const originalPost = posts.find(p => p.id === postId)
    
    if (originalComment && originalPost) {
      const responses = await fetchAIComments(
        content, 
        lang, 
        true, 
        originalComment.content,
        originalPost.content,
        content
      )

      if (responses.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500))
        const aiReply = responseToComment(responses[0])

        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          return { ...p, comments: addReplyToComment(p.comments).map(c => {
            if (c.id === commentId) {
              return { ...c, replies: [...c.replies, aiReply] }
            }
            return c
          })}
        }))

        handleSentimentChange(responses[0].sentiment_impact)
      }
    }

    setReplyingCommentIds(prev => {
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }, [posts, t.me, lang, responseToComment, handleSentimentChange])

  // Get result message based on final sentiment
  const getResultMessage = () => {
    if (sentiment >= 70) {
      return {
        title: lang === "zh" ? "危机化解!" : "Crisis Averted!",
        desc: lang === "zh" ? "你成功地处理了这次舆论危机，公众形象得到恢复。" : "You successfully handled the PR crisis and restored your public image.",
        icon: "🎉",
        color: "text-green-400"
      }
    } else if (sentiment >= 40) {
      return {
        title: lang === "zh" ? "勉强过关" : "Barely Survived",
        desc: lang === "zh" ? "你的处理中规中矩，舆论没有进一步恶化。" : "Your response was mediocre, but things didn't get worse.",
        icon: "😐",
        color: "text-yellow-400"
      }
    } else {
      return {
        title: lang === "zh" ? "社会性死亡" : "Social Death",
        desc: lang === "zh" ? "你的处理方式让事态进一步恶化，账号被彻底攻陷。" : "Your response made things worse. Your account is ruined.",
        icon: "💀",
        color: "text-red-400"
      }
    }
  }

  const result = getResultMessage()

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{scenario.icon}</span>
              <h1 className="font-bold">
                {lang === "zh" ? scenario.titleZh : scenario.titleEn}
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                scenario.difficulty === "hard" ? "bg-red-500/20 text-red-400" :
                scenario.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-green-500/20 text-green-400"
              }`}>
                {scenario.difficulty === "hard" ? (lang === "zh" ? "困难" : "Hard") :
                 scenario.difficulty === "medium" ? (lang === "zh" ? "中等" : "Medium") :
                 (lang === "zh" ? "简单" : "Easy")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "zh" ? scenario.descZh : scenario.descEn}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SentimentWidget sentiment={sentiment} trend={sentimentTrend} t={t} />
          <button
            onClick={() => setShowResult(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {lang === "zh" ? "结束剧情" : "End Story"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Post box */}
          <PostBox 
            onPost={handlePost} 
            isPosting={isPosting} 
            t={t} 
            lang={lang}
          />

          {/* Posts */}
          <AnimatePresence>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onReplyToComment={handleReplyToComment}
                onCommentOnPost={() => {}}
                replyingCommentIds={replyingCommentIds}
                blockedUsers={blockedUsers}
                lang={lang}
                t={t}
                autoExpand={true}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Screen effects */}
      <ScreenEffects
        isLowSentiment={isLowSentiment}
        isCritical={sentiment < 20}
        showFlash={showNegativeFlash}
      />

      {/* Result modal */}
      <AnimatePresence>
        {showResult && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60]"
              onClick={() => setShowResult(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-card border border-border rounded-2xl p-6 z-[61] text-center"
            >
              <div className="text-6xl mb-4">{result.icon}</div>
              <h2 className={`text-2xl font-bold mb-2 ${result.color}`}>
                {result.title}
              </h2>
              <p className="text-muted-foreground mb-4">{result.desc}</p>
              
              <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{sentiment}%</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "zh" ? "最终好感度" : "Final Sentiment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{posts.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "zh" ? "发帖数" : "Posts"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalNegativeComments}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "zh" ? "负面评论" : "Flames"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResult(false)
                    // Reset and restart
                    setPosts([])
                    setSentiment(50)
                    setTotalNegativeComments(0)
                    // Re-initialize will happen via useEffect
                  }}
                  className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {lang === "zh" ? "重新开始" : "Try Again"}
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {lang === "zh" ? "退出剧情" : "Exit Story"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
