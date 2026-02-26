const POSTS_KEY = 'community_posts'
const RECRUITS_KEY = 'community_recruits'
const COMMENTS_KEY_PREFIX = 'community_comments_'
const METHOD_RANK_KEY = 'community_method_ranks'
const USER_METRIC_KEY = 'community_user_metrics'
const CHAT_THREADS_KEY = 'community_chat_threads'
const CHAT_MSG_PREFIX = 'community_chat_msgs_'

const defaultPosts = []

const defaultRecruits = []

const defaultCommentsMap = {}

const clone = (value) => JSON.parse(JSON.stringify(value))

export const getPosts = () => {
  const saved = uni.getStorageSync(POSTS_KEY)
  if (Array.isArray(saved) && saved.length > 0) {
    return saved
  }
  uni.setStorageSync(POSTS_KEY, clone(defaultPosts))
  return clone(defaultPosts)
}

export const savePosts = (posts) => {
  uni.setStorageSync(POSTS_KEY, posts)
}

export const getPostById = (id) => {
  const posts = getPosts()
  return posts.find(item => item.id === Number(id)) || null
}

export const prependPost = (post) => {
  const posts = getPosts()
  const next = [post, ...posts]
  savePosts(next)
  return next
}

export const updatePost = (id, updater) => {
  const posts = getPosts()
  const next = posts.map(item => {
    if (item.id !== Number(id)) return item
    return typeof updater === 'function' ? updater(item) : item
  })
  savePosts(next)
  return next
}

export const deletePost = (id) => {
  const posts = getPosts()
  const next = posts.filter(item => item.id !== Number(id))
  savePosts(next)
  // 同时删除该帖子的评论
  uni.removeStorageSync(`${COMMENTS_KEY_PREFIX}${id}`)
  return next
}

const commentKey = (postId) => `${COMMENTS_KEY_PREFIX}${postId}`

export const getComments = (postId) => {
  const key = commentKey(postId)
  const saved = uni.getStorageSync(key)
  if (Array.isArray(saved)) {
    return saved
  }
  const defaults = clone(defaultCommentsMap[postId] || [])
  uni.setStorageSync(key, defaults)
  return defaults
}

export const saveComments = (postId, list) => {
  uni.setStorageSync(commentKey(postId), list)
}

export const getRecruits = () => {
  const saved = uni.getStorageSync(RECRUITS_KEY)
  if (Array.isArray(saved) && saved.length > 0) {
    return saved
  }
  uni.setStorageSync(RECRUITS_KEY, clone(defaultRecruits))
  return clone(defaultRecruits)
}

export const saveRecruits = (recruits) => {
  uni.setStorageSync(RECRUITS_KEY, recruits)
}

export const prependRecruit = (recruit) => {
  const list = getRecruits()
  const next = [recruit, ...list]
  saveRecruits(next)
  return next
}

const defaultMethodRanks = {
  plan: [],
  recipe: [],
  sport: []
}

const defaultUserMetrics = []

export const getMethodRanks = () => {
  const saved = uni.getStorageSync(METHOD_RANK_KEY)
  if (saved && typeof saved === 'object') {
    return saved
  }
  const defaults = clone(defaultMethodRanks)
  uni.setStorageSync(METHOD_RANK_KEY, defaults)
  return defaults
}

export const saveMethodRanks = (data) => {
  uni.setStorageSync(METHOD_RANK_KEY, data)
}

export const getUserMetrics = () => {
  const saved = uni.getStorageSync(USER_METRIC_KEY)
  if (Array.isArray(saved) && saved.length > 0) {
    return saved
  }
  const defaults = clone(defaultUserMetrics)
  uni.setStorageSync(USER_METRIC_KEY, defaults)
  return defaults
}

export const saveUserMetrics = (list) => {
  uni.setStorageSync(USER_METRIC_KEY, list)
}

const defaultChatThreads = [
  {
    id: 'service',
    name: '轻跃小客服',
    avatar: '🤖',
    lastText: '你好呀，有什么训练问题都可以问我～',
    updatedAt: Date.now() - 60000,
    unread: 1
  }
]

const serviceDefaultMessages = [
  {
    id: 1,
    sender: '轻跃小客服',
    content: '你好呀，有什么训练问题都可以问我～',
    time: Date.now() - 60000
  }
]

const chatMsgKey = (threadId) => `${CHAT_MSG_PREFIX}${threadId}`

export const getChatThreads = () => {
  const saved = uni.getStorageSync(CHAT_THREADS_KEY)
  if (Array.isArray(saved) && saved.length > 0) {
    const normalized = saved.map(item => ({
      ...item,
      unread: Number(item.unread || 0)
    }))
    return normalized.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  }
  const defaults = clone(defaultChatThreads)
  uni.setStorageSync(CHAT_THREADS_KEY, defaults)
  return defaults
}

export const saveChatThreads = (threads) => {
  uni.setStorageSync(CHAT_THREADS_KEY, threads)
}

export const getChatMessages = (threadId) => {
  const saved = uni.getStorageSync(chatMsgKey(threadId))
  if (Array.isArray(saved)) {
    return saved
  }
  if (threadId === 'service') {
    const defaults = clone(serviceDefaultMessages)
    uni.setStorageSync(chatMsgKey(threadId), defaults)
    return defaults
  }
  uni.setStorageSync(chatMsgKey(threadId), [])
  return []
}

export const saveChatMessages = (threadId, messages) => {
  uni.setStorageSync(chatMsgKey(threadId), messages)
}

export const upsertChatThread = (thread) => {
  const list = getChatThreads()
  const index = list.findIndex(item => item.id === thread.id)
  if (index > -1) {
    list[index] = { ...list[index], ...thread }
  } else {
    list.push(thread)
  }
  saveChatThreads(list)
  return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export const openOrCreateChatThread = (targetName, targetAvatar = '🙂') => {
  const threadId = `user_${encodeURIComponent(targetName)}`
  const threads = getChatThreads()
  const found = threads.find(item => item.id === threadId)

  if (found) {
    return found
  }

  const created = {
    id: threadId,
    name: targetName,
    avatar: targetAvatar,
    lastText: '开始聊天吧',
    updatedAt: Date.now(),
    unread: 0
  }
  upsertChatThread(created)
  return created
}

export const appendChatMessage = (threadId, sender, content) => {
  const list = getChatMessages(threadId)
  const next = [
    ...list,
    {
      id: Date.now(),
      sender,
      content,
      time: Date.now()
    }
  ]
  saveChatMessages(threadId, next)
  return next
}

export const markChatThreadRead = (threadId) => {
  const list = getChatThreads()
  const index = list.findIndex(item => item.id === threadId)
  if (index === -1) return list

  list[index] = {
    ...list[index],
    unread: 0
  }
  saveChatThreads(list)
  return list
}