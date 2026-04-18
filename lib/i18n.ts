export type Language = "zh" | "en"

export const translations = {
  zh: {
    // Navigation
    home: "首页",
    notifications: "通知",
    profile: "个人主页",
    messages: "私信",
    achievements: "成就",
    storyMode: "剧情模式",
    
    // Post box
    postPlaceholder: "在想什么？发条动态试试...",
    postButton: "广播",
    friendlyReminder: "请友善互动喵~ 文明发言，从我做起",
    catEmoji: "(=^･ω･^=)",
    addImage: "添加图片",
    addPoll: "发起投票",
    
    // Poll
    pollQuestion: "投票问题",
    pollOption: "选项",
    addOption: "添加选项",
    createPoll: "创建投票",
    votesCount: "票",
    pollEnded: "投票已结束",
    
    // Feed
    noPostsYet: "还没有动态",
    tryPosting: "发一条试试，体验社交媒体的「另一面」",
    
    // Notifications
    noNotifications: "暂无通知",
    notificationsHint: "发布动态后，这里会显示收到的评论通知",
    commentedOnYourPost: "评论了你的动态",
    mentionedYou: "在话题中@了你",
    
    // DM - Direct Messages
    directMessages: "私信",
    noDMs: "暂无私信",
    dmHint: "发布动态后可能会收到陌生人的私信",
    newMessage: "新消息",
    markAllRead: "全部已读",
    
    // Profile
    simulatedUser: "模拟用户",
    simulatedHandle: "@simulated_user",
    profileBio: "这是一个用于体验网络暴力模拟的虚拟账户",
    posts: "动态",
    following: "关注",
    followers: "粉丝",
    myPosts: "我的动态",
    noPostsPublished: "还没有发布任何动态",
    dayCount: "运营第",
    days: "天",
    
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
    
    // Report & Block
    report: "举报",
    block: "拉黑",
    reported: "已举报",
    blocked: "已拉黑",
    reportReceived: "举报已收到",
    reportDesc: "我们会尽快处理您的举报",
    blockSuccess: "已将该用户拉黑",
    blockDesc: "但ta可能会换个马甲继续评论哦~",
    userBlocked: "该用户已被拉黑",
    
    // Repost
    repost: "转发",
    reposted: "已转发",
    repostBy: "转发自",
    quoteRepost: "引用转发",
    repostComment: "说点什么...",
    
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
      "normal": "路人",
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
    pin: "置顶",
    unpin: "取消置顶",
    pinned: "已置顶",
    
    // Confirm
    confirmLanguageSwitch: "确定要切换语言吗？",
    confirmLanguageSwitchDesc: "切换语言后，所有帖子和会话记录将被清空",
    confirm: "确定",
    cancel: "取消",
    
    // Theme
    darkMode: "深色模式",
    lightMode: "浅色模式",
    
    // Achievements
    achievementsTitle: "成就徽章",
    achievementUnlocked: "解锁成就",
    noAchievements: "还没有解锁任何成就",
    achievementHint: "继续互动来解锁更多成就吧！",
    
    // Story Mode
    storyModeTitle: "剧情模式",
    storyModeDesc: "选择一个场景，体验特定情境下的舆论风暴",
    startScenario: "开始挑战",
    difficulty: "难度",
    difficultyEasy: "简单",
    difficultyMedium: "中等",
    difficultyHard: "困难",
    exitStoryMode: "退出剧情模式",
    
    // Sentiment Analysis
    sentimentAnalysis: "舆情分析",
    sentimentTrend: "情感走势",
    hotWords: "热词云",
    heatCurve: "热度曲线",
    
    // Relationship
    relationshipMap: "关系图谱",
    fansNetwork: "粉丝网络",
    hatersNetwork: "黑粉网络",
    
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
    messages: "Messages",
    achievements: "Achievements",
    storyMode: "Story Mode",
    
    // Post box
    postPlaceholder: "What's on your mind? Share something...",
    postButton: "Post",
    friendlyReminder: "Please be kind and respectful~",
    catEmoji: ":3",
    addImage: "Add Image",
    addPoll: "Create Poll",
    
    // Poll
    pollQuestion: "Poll Question",
    pollOption: "Option",
    addOption: "Add Option",
    createPoll: "Create Poll",
    votesCount: "votes",
    pollEnded: "Poll ended",
    
    // Feed
    noPostsYet: "No posts yet",
    tryPosting: "Try posting something to experience the 'other side' of social media",
    
    // Notifications
    noNotifications: "No notifications",
    notificationsHint: "Comment notifications will appear here after you post",
    commentedOnYourPost: "commented on your post",
    mentionedYou: "mentioned you in a topic",
    
    // DM - Direct Messages
    directMessages: "Direct Messages",
    noDMs: "No messages",
    dmHint: "You may receive DMs from strangers after posting",
    newMessage: "New message",
    markAllRead: "Mark all read",
    
    // Profile
    simulatedUser: "Simulated User",
    simulatedHandle: "@simulated_user",
    profileBio: "A virtual account for experiencing cyberbullying simulation",
    posts: "Posts",
    following: "Following",
    followers: "Followers",
    myPosts: "My Posts",
    noPostsPublished: "No posts published yet",
    dayCount: "Day",
    days: "",
    
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
    
    // Report & Block
    report: "Report",
    block: "Block",
    reported: "Reported",
    blocked: "Blocked",
    reportReceived: "Report received",
    reportDesc: "We'll review your report shortly",
    blockSuccess: "User blocked",
    blockDesc: "But they might come back with a new account~",
    userBlocked: "This user is blocked",
    
    // Repost
    repost: "Repost",
    reposted: "Reposted",
    repostBy: "Reposted from",
    quoteRepost: "Quote Repost",
    repostComment: "Add a comment...",
    
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
      "normal": "Regular User",
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
    pin: "Pin",
    unpin: "Unpin",
    pinned: "Pinned",
    
    // Confirm
    confirmLanguageSwitch: "Switch language?",
    confirmLanguageSwitchDesc: "All posts and conversations will be cleared",
    confirm: "Confirm",
    cancel: "Cancel",
    
    // Theme
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    
    // Achievements
    achievementsTitle: "Achievements",
    achievementUnlocked: "Achievement Unlocked",
    noAchievements: "No achievements unlocked yet",
    achievementHint: "Keep interacting to unlock more achievements!",
    
    // Story Mode
    storyModeTitle: "Story Mode",
    storyModeDesc: "Choose a scenario to experience a specific online storm",
    startScenario: "Start Challenge",
    difficulty: "Difficulty",
    difficultyEasy: "Easy",
    difficultyMedium: "Medium",
    difficultyHard: "Hard",
    exitStoryMode: "Exit Story Mode",
    
    // Sentiment Analysis
    sentimentAnalysis: "Sentiment Analysis",
    sentimentTrend: "Sentiment Trend",
    hotWords: "Word Cloud",
    heatCurve: "Heat Curve",
    
    // Relationship
    relationshipMap: "Relationship Map",
    fansNetwork: "Fans Network",
    hatersNetwork: "Haters Network",
    
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
