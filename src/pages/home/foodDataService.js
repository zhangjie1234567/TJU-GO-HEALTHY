/**
 * 食物数据服务层
 * 为后续对接开源食物数据库（如中国食物成分表API）预留接口
 * 当前使用模拟数据，接口设计与真实API保持一致
 */

// ============ 标准食物数据结构（兼容中国食物成分表） ============
/**
 * 食物标准数据格式
 * @typedef {Object} FoodItem
 * @property {string} id - 食物唯一标识
 * @property {string} name - 食物名称
 * @property {string} category - 分类（水果/蔬菜/谷物/肉类/水产等）
 * @property {string} image - 图片URL
 * @property {number} energy - 能量(kcal/100g)
 * @property {Object} nutrition - 营养成分（每100g）
 * @property {string} effect - 功效作用
 * @property {string} feature - 食物特征
 * @property {Array} relatedRecipes - 相关菜品
 * @property {boolean} collected - 是否已收藏
 */

// ============ 模拟数据库 ============
const mockFoodDatabase = [
  // 水果类
  {
    id: 'fruit_001',
    name: '草莓',
    category: '水果',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=640&q=80',
    energy: 30,
    nutrition: {
      water: 91.3,
      protein: 1.0,
      fat: 0.2,
      carbohydrate: 7.1,
      fiber: 1.1,
      vitaminA: 5,
      vitaminB1: 0.02,
      vitaminB2: 0.03,
      vitaminC: 47,
      vitaminE: 0.71,
      calcium: 18,
      iron: 1.8,
      sodium: 4.2,
      cholesterol: 0
    },
    effect: '清热解毒、生津止渴、润肺化痰、健脾和胃',
    feature: '草莓外观呈心形，鲜美红嫩，果肉多汁，含有特殊的浓郁果香',
    relatedRecipes: ['草莓奶昔', '草莓沙拉', '草莓慕斯蛋糕', '草莓果酱'],
    tags: ['低热量', '高维C', '抗氧化']
  },
  {
    id: 'fruit_002',
    name: '橙子',
    category: '水果',
    image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=640&q=80',
    energy: 47,
    nutrition: {
      water: 87.4,
      protein: 0.8,
      fat: 0.2,
      carbohydrate: 11.1,
      fiber: 0.6,
      vitaminA: 18,
      vitaminB1: 0.05,
      vitaminB2: 0.04,
      vitaminC: 33,
      vitaminE: 0.56,
      calcium: 20,
      iron: 0.4,
      sodium: 1.2,
      cholesterol: 0
    },
    effect: '生津止渴、开胃下气、帮助消化、防治便秘',
    feature: '果实呈圆球形或长圆形，果皮橙黄色，油胞凸起，果肉酸甜可口',
    relatedRecipes: ['鲜榨橙汁', '橙子果冻', '橙香烤鸡', '橙子沙拉'],
    tags: ['富含维C', '开胃', '助消化']
  },
  {
    id: 'fruit_003',
    name: '海棠果',
    category: '水果',
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=640&q=80',
    energy: 73,
    nutrition: {
      water: 82.0,
      protein: 0.3,
      fat: 0.2,
      carbohydrate: 16.9,
      fiber: 1.8,
      vitaminA: 118,
      vitaminB1: 0.05,
      vitaminB2: 0.03,
      vitaminC: 20,
      vitaminE: 0.25,
      calcium: 15,
      iron: 0.7,
      sodium: 0.6,
      cholesterol: 0
    },
    effect: '生津止渴、健脾开胃、涩肠止痢',
    feature: '果实小而圆，色泽鲜艳，味道酸甜，具有独特的香味',
    relatedRecipes: ['海棠果酱', '冰糖海棠', '海棠果汁', '海棠蜜饯'],
    tags: ['开胃', '助消化', '传统果品']
  },
  {
    id: 'fruit_004',
    name: '柠檬',
    category: '水果',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=640&q=80',
    energy: 35,
    nutrition: {
      water: 89.0,
      protein: 1.1,
      fat: 1.2,
      carbohydrate: 6.2,
      fiber: 1.3,
      vitaminA: 0,
      vitaminB1: 0.05,
      vitaminB2: 0.02,
      vitaminC: 22,
      vitaminE: 1.14,
      calcium: 101,
      iron: 0.8,
      sodium: 1.1,
      cholesterol: 0
    },
    effect: '生津解暑、开胃醒脾、美白养颜、预防心血管疾病',
    feature: '椭圆形果实，两端略尖，果皮黄色，果肉酸味极强',
    relatedRecipes: ['柠檬水', '柠檬鸡翅', '柠檬蛋糕', '柠檬茶'],
    tags: ['美白', '高维C', '提神醒脑']
  },
  // 蔬菜类
  {
    id: 'veg_001',
    name: '西红柿',
    category: '蔬菜',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=640&q=80',
    energy: 18,
    nutrition: {
      water: 94.4,
      protein: 0.9,
      fat: 0.2,
      carbohydrate: 3.3,
      fiber: 1.2,
      vitaminA: 92,
      vitaminB1: 0.03,
      vitaminB2: 0.03,
      vitaminC: 19,
      vitaminE: 0.57,
      calcium: 10,
      iron: 0.5,
      sodium: 5.0,
      cholesterol: 0
    },
    effect: '生津止渴、健胃消食、清热解毒、凉血平肝、补血养血',
    feature: '果实多汁，可以生食也可烹调，含有丰富的番茄红素',
    relatedRecipes: ['番茄炒蛋', '番茄汤', '番茄牛腩', '番茄沙拉'],
    tags: ['低热量', '富含番茄红素', '抗氧化']
  },
  {
    id: 'veg_002',
    name: '黄瓜',
    category: '蔬菜',
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=80',
    energy: 16,
    nutrition: {
      water: 95.2,
      protein: 0.8,
      fat: 0.2,
      carbohydrate: 2.9,
      fiber: 0.5,
      vitaminA: 15,
      vitaminB1: 0.02,
      vitaminB2: 0.03,
      vitaminC: 9,
      vitaminE: 0.49,
      calcium: 24,
      iron: 0.5,
      sodium: 4.9,
      cholesterol: 0
    },
    effect: '清热利水、解毒消肿、生津止渴、美容养颜',
    feature: '表皮翠绿或深绿，有细刺，水分充足，口感清脆',
    relatedRecipes: ['拍黄瓜', '黄瓜炒蛋', '黄瓜沙拉', '凉拌黄瓜'],
    tags: ['超低热量', '补水', '美容']
  },
  {
    id: 'veg_003',
    name: '西兰花',
    category: '蔬菜',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=640&q=80',
    energy: 34,
    nutrition: {
      water: 90.6,
      protein: 4.1,
      fat: 0.6,
      carbohydrate: 4.3,
      fiber: 1.6,
      vitaminA: 1202,
      vitaminB1: 0.09,
      vitaminB2: 0.13,
      vitaminC: 51,
      vitaminE: 0.91,
      calcium: 67,
      iron: 1.0,
      sodium: 18.8,
      cholesterol: 0
    },
    effect: '增强免疫力、抗癌防癌、保护心血管、促进消化',
    feature: '花球表面小花蕾密集，呈绿色或深绿色，营养价值极高',
    relatedRecipes: ['清炒西兰花', '西兰花炒虾仁', '白灼西兰花', '西兰花沙拉'],
    tags: ['高蛋白', '抗癌', '低热量']
  },
  {
    id: 'veg_004',
    name: '胡萝卜',
    category: '蔬菜',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=640&q=80',
    energy: 41,
    nutrition: {
      water: 87.7,
      protein: 1.0,
      fat: 0.2,
      carbohydrate: 9.3,
      fiber: 3.2,
      vitaminA: 688,
      vitaminB1: 0.04,
      vitaminB2: 0.04,
      vitaminC: 13,
      vitaminE: 0.36,
      calcium: 32,
      iron: 1.0,
      sodium: 71.4,
      cholesterol: 0
    },
    effect: '明目养肝、增强免疫力、降血糖降血脂、美容养颜',
    feature: '根茎粗壮，橙红色或黄色，富含胡萝卜素',
    relatedRecipes: ['胡萝卜炒肉', '胡萝卜汁', '胡萝卜排骨汤', '胡萝卜丝'],
    tags: ['富含胡萝卜素', '明目', '养肝']
  },
  // 谷物类
  {
    id: 'grain_001',
    name: '燕麦',
    category: '谷物',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=640&q=80',
    energy: 367,
    nutrition: {
      water: 9.2,
      protein: 15.0,
      fat: 6.7,
      carbohydrate: 61.6,
      fiber: 5.3,
      vitaminA: 0,
      vitaminB1: 0.30,
      vitaminB2: 0.13,
      vitaminC: 0,
      vitaminE: 3.07,
      calcium: 186,
      iron: 7.0,
      sodium: 3.7,
      cholesterol: 0
    },
    effect: '降低胆固醇、控制血糖、促进消化、减肥瘦身',
    feature: '谷粒饱满，营养丰富，是优质的健康食品',
    relatedRecipes: ['燕麦粥', '燕麦牛奶', '燕麦饼干', '燕麦能量棒'],
    tags: ['高纤维', '控糖', '健身']
  },
  {
    id: 'grain_002',
    name: '糙米',
    category: '谷物',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80',
    energy: 348,
    nutrition: {
      water: 13.3,
      protein: 7.7,
      fat: 2.7,
      carbohydrate: 75.5,
      fiber: 3.9,
      vitaminA: 0,
      vitaminB1: 0.41,
      vitaminB2: 0.09,
      vitaminC: 0,
      vitaminE: 1.29,
      calcium: 13,
      iron: 1.6,
      sodium: 2.4,
      cholesterol: 0
    },
    effect: '改善肠胃功能、控制血糖、预防便秘、增强体质',
    feature: '保留了米糠层和胚芽，营养价值远高于精白米',
    relatedRecipes: ['糙米饭', '糙米粥', '糙米寿司', '糙米茶'],
    tags: ['全谷物', '高纤维', '控糖']
  }
];

// ============ 搜索相关功能 ============

/**
 * 搜索食物（支持模糊搜索）
 * @param {string} keyword - 搜索关键词
 * @param {string} category - 分类筛选（可选）
 * @returns {Promise<Array>} 搜索结果
 */
export async function searchFoods(keyword = '', category = '') {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let results = mockFoodDatabase;
  
  // 分类筛选
  if (category && category !== '全部') {
    results = results.filter(item => item.category === category);
  }
  
  // 关键词搜索（名称、标签、功效）
  if (keyword.trim()) {
    const lowerKeyword = keyword.toLowerCase().trim();
    results = results.filter(item => 
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)) ||
      item.effect.includes(keyword)
    );
  }
  
  return results;
}

/**
 * 获取搜索建议（实时提示）
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 建议列表
 */
export async function getSearchSuggestions(keyword) {
  if (!keyword.trim()) return [];
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const lowerKeyword = keyword.toLowerCase().trim();
  const suggestions = mockFoodDatabase
    .filter(item => item.name.toLowerCase().includes(lowerKeyword))
    .slice(0, 8)
    .map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      image: item.image
    }));
  
  return suggestions;
}

/**
 * 根据ID获取食物详情
 * @param {string} foodId - 食物ID
 * @returns {Promise<Object|null>} 食物详情
 */
export async function getFoodDetail(foodId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const food = mockFoodDatabase.find(item => item.id === foodId);
  return food || null;
}

/**
 * 获取分类列表
 * @returns {Array} 分类列表
 */
export function getCategories() {
  const categories = ['全部', ...new Set(mockFoodDatabase.map(item => item.category))];
  return categories;
}

/**
 * 获取热门推荐
 * @param {string} category - 分类（可选）
 * @param {number} limit - 返回数量
 * @returns {Promise<Array>} 热门食物列表
 */
export async function getPopularFoods(category = '', limit = 4) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let foods = mockFoodDatabase;
  if (category && category !== '全部') {
    foods = foods.filter(item => item.category === category);
  }
  
  return foods.slice(0, limit);
}

// ============ 搜索历史管理 ============

const SEARCH_HISTORY_KEY = 'food_search_history';
const MAX_HISTORY_COUNT = 10;

/**
 * 保存搜索历史
 * @param {string} keyword - 搜索关键词
 */
export function saveSearchHistory(keyword) {
  if (!keyword.trim()) return;
  
  try {
    let history = JSON.parse(uni.getStorageSync(SEARCH_HISTORY_KEY) || '[]');
    
    // 去重：如果已存在，先删除
    history = history.filter(item => item !== keyword);
    
    // 添加到开头
    history.unshift(keyword);
    
    // 限制数量
    if (history.length > MAX_HISTORY_COUNT) {
      history = history.slice(0, MAX_HISTORY_COUNT);
    }
    
    uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('保存搜索历史失败', e);
  }
}

/**
 * 获取搜索历史
 * @returns {Array} 历史记录列表
 */
export function getSearchHistory() {
  try {
    return JSON.parse(uni.getStorageSync(SEARCH_HISTORY_KEY) || '[]');
  } catch (e) {
    console.error('读取搜索历史失败', e);
    return [];
  }
}

/**
 * 清空搜索历史
 */
export function clearSearchHistory() {
  try {
    uni.removeStorageSync(SEARCH_HISTORY_KEY);
  } catch (e) {
    console.error('清空搜索历史失败', e);
  }
}

/**
 * 删除单条搜索历史
 * @param {string} keyword - 要删除的关键词
 */
export function removeSearchHistory(keyword) {
  try {
    let history = JSON.parse(uni.getStorageSync(SEARCH_HISTORY_KEY) || '[]');
    history = history.filter(item => item !== keyword);
    uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('删除搜索历史失败', e);
  }
}

// ============ 收藏管理 ============

const COLLECTION_KEY = 'food_collection';

/**
 * 切换收藏状态
 * @param {string} foodId - 食物ID
 * @returns {boolean} 收藏后的状态
 */
export function toggleCollection(foodId) {
  try {
    let collection = JSON.parse(uni.getStorageSync(COLLECTION_KEY) || '[]');
    const index = collection.indexOf(foodId);
    
    if (index > -1) {
      collection.splice(index, 1);
      uni.setStorageSync(COLLECTION_KEY, JSON.stringify(collection));
      return false;
    } else {
      collection.push(foodId);
      uni.setStorageSync(COLLECTION_KEY, JSON.stringify(collection));
      return true;
    }
  } catch (e) {
    console.error('切换收藏状态失败', e);
    return false;
  }
}

/**
 * 检查是否已收藏
 * @param {string} foodId - 食物ID
 * @returns {boolean} 是否已收藏
 */
export function isCollected(foodId) {
  try {
    const collection = JSON.parse(uni.getStorageSync(COLLECTION_KEY) || '[]');
    return collection.includes(foodId);
  } catch (e) {
    console.error('检查收藏状态失败', e);
    return false;
  }
}

/**
 * 获取收藏列表
 * @returns {Promise<Array>} 收藏的食物列表
 */
export async function getCollectionList() {
  try {
    const collection = JSON.parse(uni.getStorageSync(COLLECTION_KEY) || '[]');
    const foods = mockFoodDatabase.filter(item => collection.includes(item.id));
    return foods;
  } catch (e) {
    console.error('获取收藏列表失败', e);
    return [];
  }
}
