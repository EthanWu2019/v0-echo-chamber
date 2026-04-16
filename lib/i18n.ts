export type Language = "zh" | "en"

export const translations = {
  zh: {
    // Navigation
    home: "首页",
    notifications: "通知",
    profile: "个人主页",
    
    // Post box
    postPlaceholder: "在想什么？发条动态试试...",
    postButton: "广播",
    friendlyReminder: "请友善互动喵~ 文明发言，从我做起",
    catEmoji: "(=^･ω･^=)",
    
    // Feed
    noPostsYet: "还没有动态",
    tryPosting: "发一条试试，体验社交媒体的「另一面」",
    
    // Notifications
    noNotifications: "暂无通知",
    notificationsHint: "发布动态后，这里会显示收到的评论通知",
    commentedOnYourPost: "评论了你的动态",
    
    // Profile
    simulatedUser: "模拟用户",
    simulatedHandle: "@simulated_user",
    profileBio: "这是一个用于体验网络暴力模拟的虚拟账户",
    posts: "动态",
    following: "关注",
    followers: "粉丝",
    myPosts: "我的动态",
    noPostsPublished: "还没有发布任何动态",
    
    // Sentiment Widget
    publicSentiment: "全网好感度",
    goodSituation: "形势大好",
    neutralOpinion: "舆论中立",
    reputationCrash: "口碑崩盘",
    sentimentWarning: "警告：负面舆论正在发酵，建议立即采取危机公关措施",
    
    // Account Widget
    accountData: "账号数据",
    haters: "黑粉",
    reputation: "声誉值",
    controversy: "争议度",
    influence: "影响力",
    totalLikes: "累计获赞",
    controversyHigh: "争议人物",
    controversyMid: "有点争议",
    controversyLow: "风平浪静",
    
    // Trending
    trendingTopics: "热门话题",
    discussions: "讨论",
    seeMore: "查看更多",
    
    // Comments
    typing: "正在输入...",
    reply: "回复",
    send: "发送",
    replyPlaceholder: "写下你的回复...",
    otherReplying: "对方正在回复...",
    collapseComments: "收起评论",
    expandComments: "展开更多评论",
    usersTyping: "网友们正在输入...",
    
    // Time
    justNow: "刚刚",
    minutesAgo: "分钟前",
    hoursAgo: "小时前",
    
    // Personality labels
    personalities: {
      hater: "喷子",
      stan: "饭圈",
      "logic-lord": "理中客",
      "moral-knight": "键盘侠",
      "spam-bot": "广告",
    },
    
    // Disclaimer
    disclaimer: "这是一个教育性模拟器，旨在展示网络暴力的危害。所有评论均由 AI 生成。",
    
    // Me
    me: "我",
    myself: "@myself",
    
    // Language
    switchLanguage: "EN",
    languageWarning: "切换语言将清空当前所有记录",
    
    // Delete
    delete: "删除",
    withdraw: "撤回",
    deleteConfirm: "确定要删除这条评论吗？",
    
    // Error
    loadFailed: "评论加载失败，请重试",
    systemHint: "系统提示",
    
    // Review
    reviewing: "审核中...",
    approved: "审核通过",
    posting: "发布中...",
    
    // Topic
    back: "返回",
    loadingTopicPosts: "正在加载热门话题帖子...",
    
    // Comment
    addComment: "写下你的评论...",
    
    // Trending topics
    trendingItems: [
      { tag: "今天也想辞职", count: "12.3万", hot: true },
      { tag: "凌晨emo了", count: "8.7万", hot: false },
      { tag: "下班后不想回复消息", count: "6.2万", hot: true },
      { tag: "社恐真的好累", count: "5.1万", hot: false },
      { tag: "又熬夜了救命", count: "4.8万", hot: false },
    ],
  },
  en: {
    // Navigation
    home: "Home",
    notifications: "Notifications",
    profile: "Profile",
    
    // Post box
    postPlaceholder: "What's on your mind? Share something...",
    postButton: "Post",
    friendlyReminder: "Please be kind and respectful~",
    catEmoji: ":3",
    
    // Feed
    noPostsYet: "No posts yet",
    tryPosting: "Try posting something to experience the 'other side' of social media",
    
    // Notifications
    noNotifications: "No notifications",
    notificationsHint: "Comment notifications will appear here after you post",
    commentedOnYourPost: "commented on your post",
    
    // Profile
    simulatedUser: "Simulated User",
    simulatedHandle: "@simulated_user",
    profileBio: "A virtual account for experiencing cyberbullying simulation",
    posts: "Posts",
    following: "Following",
    followers: "Followers",
    myPosts: "My Posts",
    noPostsPublished: "No posts published yet",
    
    // Sentiment Widget
    publicSentiment: "Public Sentiment",
    goodSituation: "Looking Good",
    neutralOpinion: "Neutral",
    reputationCrash: "PR Crisis",
    sentimentWarning: "Warning: Negative sentiment spreading. Consider damage control.",
    
    // Account Widget
    accountData: "Account Stats",
    haters: "Haters",
    reputation: "Reputation",
    controversy: "Controversy",
    influence: "Influence",
    totalLikes: "Total Likes",
    controversyHigh: "Controversial",
    controversyMid: "Somewhat",
    controversyLow: "Peaceful",
    
    // Trending
    trendingTopics: "Trending Topics",
    discussions: "posts",
    seeMore: "See more",
    
    // Comments
    typing: "typing...",
    reply: "Reply",
    send: "Send",
    replyPlaceholder: "Write your reply...",
    otherReplying: "typing a response...",
    collapseComments: "Collapse comments",
    expandComments: "Show more comments",
    usersTyping: "People are typing...",
    
    // Time
    justNow: "just now",
    minutesAgo: "min ago",
    hoursAgo: "hr ago",
    
    // Personality labels
    personalities: {
      hater: "Troll",
      stan: "Stan",
      "logic-lord": "Debate Bro",
      "moral-knight": "Keyboard Warrior",
      "spam-bot": "Spam Bot",
    },
    
    // Disclaimer
    disclaimer: "Educational simulator demonstrating the impact of online harassment. All comments are AI-generated.",
    
    // Me
    me: "Me",
    myself: "@myself",
    
    // Language
    switchLanguage: "中",
    languageWarning: "Switching language will clear all records",
    
    // Delete
    delete: "Delete",
    withdraw: "Withdraw",
    deleteConfirm: "Delete this comment?",
    
    // Error
    loadFailed: "Failed to load comments, please retry",
    systemHint: "System",
    
    // Review
    reviewing: "Reviewing...",
    approved: "Approved!",
    posting: "Posting...",
    
    // Topic
    back: "Back",
    loadingTopicPosts: "Loading trending topic posts...",
    
    // Comment
    addComment: "Add a comment...",
    
    // Trending topics
    trendingItems: [
      { tag: "quitting my job today", count: "123K", hot: true },
      { tag: "3am thoughts", count: "87K", hot: false },
      { tag: "no texts after work", count: "62K", hot: true },
      { tag: "social anxiety is real", count: "51K", hot: false },
      { tag: "another sleepless night", count: "48K", hot: false },
    ],
  },
} as const

export type Translations = typeof translations.zh

// Get label for personality
export function getPersonalityLabel(lang: Language, personality: string): string {
  const labels = translations[lang].personalities as Record<string, string>
  return labels[personality] || labels.hater
}
