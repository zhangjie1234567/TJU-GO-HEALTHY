<template>
  <view class="questionnaire-container">
    <scroll-view class="questionnaire-scroll" scroll-y="true" :show-scrollbar="false">
    <!-- 顶部标签栏 -->
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: currentTab === 'base' }" @click="switchTab('base')">基础信息</view>
      <view class="tab-item" :class="{ active: currentTab === 'habit' }" @click="switchTab('habit')">日常习惯</view>
    </view>

    <!-- 基础信息模块 -->
    <view v-if="currentTab === 'base'" class="content-section">
      <!-- 欢迎语 -->
      <view class="welcome-section">
        <view class="tip-box">
          <text class="tip-text">请耐心填写，健康方案基于填写信息生成 填写越详细方案越贴合！</text>
        </view>
      </view>

      <!-- 基础信息表单 -->
      <view class="form-section">
        <!-- 性别选择 -->
        <view class="form-item">
          <picker @change="onGenderChange" :value="selectedGenderIndex" :range="genderRange">
            <view class="picker-text">{{ selectedGenderIndex === -1 ? '请选择性别' : genderRange[selectedGenderIndex] }}
            </view>
          </picker>
        </view>
        <!-- 身高输入 -->
        <view class="form-item">
          <view class="input-with-unit">
            <input class="form-input" placeholder="身高" type="digit" v-model="height" @input="handleHeightInput" />
            <text class="unit-text">cm</text>
          </view>
        </view>

        <!-- 体重输入 -->
        <view class="form-item">
          <view class="input-with-unit">
            <input class="form-input" placeholder="体重" type="digit" v-model="weight" @input="handleWeightInput" />
            <text class="unit-text">kg</text>
          </view>
        </view>

        <!-- BMI和体型展示 -->
        <view class="bmi-section">
          <text class="bmi-text">BMI: {{ bmi }}</text>
          <text class="body-type-text">体型: {{ bodyType }}</text>
        </view>

        <!-- 年龄输入 -->
        <view class="form-item">
          <input class="form-input" placeholder="年龄" type="digit" v-model="age" />
        </view>
      </view>

      <!-- 目标选择区 -->
      <view class="target-section">
        <text class="section-title">请选择你所期望的目标：</text>
        <view class="target-buttons">
          <view v-for="item in targetList" :key="item" class="target-btn" :class="{ active: selectedTarget === item }"
            @click="selectTarget(item)">
            {{ item }}
          </view>
        </view>

        <text class="section-title">请选择你想改善的部位：（多选）</text>
        <view class="part-buttons">
          <view v-for="item in partList" :key="item" class="part-btn" :class="{ active: selectedParts.includes(item) }"
            @click="togglePart(item)">
            {{ item }}
          </view>
        </view>

        <!-- 目标体重输入 -->
        <view class="form-item">
          <view class="input-with-unit">
            <input class="form-input" placeholder="你的目标体重" type="digit" v-model="targetWeight"
              @input="handleTargetWeightInput" />
            <text class="unit-text">kg</text>
          </view>
        </view>
      </view>

      <!-- 下一步按钮 -->
      <view class="submit-section">
        <button class="submit-btn" @click="handleBaseSubmit">下一步</button>
      </view>
    </view>
    <!-- 日常习惯模块 -->
    <view v-if="currentTab === 'habit'" class="content-section">
      <!-- 日常习惯表单区域 -->
      <view class="habit-section">
        <!-- 问题1：每周运动几次 -->
        <view class="habit-item">
          <text class="habit-label">1. 你每周进行几次运动？（含各类运动）</text>
          <view class="option-buttons">
            <view v-for="item in exerciseFreqOptions" :key="item.value" class="option-btn"
              :class="{ active: form.exerciseFreq === item.value }" @click="form.exerciseFreq = item.value">
              {{ item.label }}
            </view>
          </view>
        </view>

        <!-- 问题2：运动类型（多选） -->
        <view class="habit-item" v-if="form.exerciseFreq !== '0'">
          <text class="habit-label">2. 你进行的运动属于哪种类型？（多选）</text>
          <view class="option-buttons">
            <view v-for="item in exerciseTypeOptions" :key="item.value" class="option-btn"
              :class="{ active: form.exerciseTypes.includes(item.value) }" @click="toggleExerciseType(item.value)">
              {{ item.label }}
            </view>
          </view>
        </view>

        <!-- 问题3：单次运动持续多久 -->
        <view class="habit-item" v-if="form.exerciseFreq !== '0'">
          <text class="habit-label">3. 你单次运动持续多久？</text>
          <view class="option-buttons">
            <view v-for="item in exerciseDurationOptions" :key="item.value" class="option-btn"
              :class="{ active: form.exerciseDuration === item.value }" @click="form.exerciseDuration = item.value">
              {{ item.label }}
            </view>
          </view>
        </view>

        <!-- 删除问题四 -->
        <!-- 问题4：食物过敏或忌口（多选+填空） -->
        <view class="habit-item">
          <text class="habit-label">4. 食物过敏或忌口？（多选）</text>
          <view class="option-buttons">
            <view v-for="item in foodAllergyOptions" :key="item.value" class="option-wrapper">
              <!-- 多选按钮 -->
              <view class="option-btn" :class="{ active: form.foodAllergies.includes(item.value) }"
                @click="toggleFoodAllergy(item.value)">
                {{ item.label }}
              </view>

              <!-- 选中后出现填空框 -->
              <view v-if="form.foodAllergies.includes(item.value) && item.value !=='none' " class=" food-input-wrapper">
                <input class="food-input" v-model="form.foodAllergyDetails[item.value]" placeholder="请填写具体食物" />
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 提交按钮（日常习惯最终提交） -->
      <view class="submit-section">
        <button class="submit-btn" @click="handleHabitSubmit">提交</button>
      </view>
    </view>
    </scroll-view>
  </view>
</template>

<script setup>
  import {
    ref,
    computed
  } from 'vue'
  //圈1：基础信息和日常习惯的常量
  // 1. 标签切换状态
  const currentTab = ref('base') // 默认显示基础信息

  // 2.基础信息
  const height = ref('')
  const weight = ref('')
  const age = ref('')
  const targetWeight = ref('')

  // 性别选项
  const genderRange = ref(['男', '女'])
  // 选中的性别索引：初始值设为 -1（表示未选择）
  const selectedGenderIndex = ref(-1)

  // 目标与部位选择
  const targetList = ref(['减肥', '增重', '保持健康'])
  const selectedTarget = ref('')
  const partList = ref(['脸部', '颈部', '肩部', '手臂', '腹部', '腰部', '背部', '腿部', '臀部'])
  const selectedParts = ref([])

  //日常习惯
  // 3. 日常习惯数据
  const form = ref({
    // 每周运动几次
    exerciseFreq: '',
    // 运动类型（多选）
    exerciseTypes: [],
    // 单次运动持续多久
    exerciseDuration: '',
    //删除问题四
    // ✅ 新增问题4
    foodAllergies: [],
    foodAllergyDetails: {}
  })

  // 4. 日常习惯选项配置
  // 问题1：每周运动几次
  const exerciseFreqOptions = ref([{
      label: '0次',
      value: '0'
    },
    {
      label: '1-2次',
      value: '1-2'
    },
    {
      label: '3-4次',
      value: '3-4'
    },
    {
      label: '5-6次',
      value: '5-6'
    },
    {
      label: '7次及以上',
      value: '7+'
    }
  ])

  // 问题2：运动类型（多选）
  const exerciseTypeOptions = ref([{
      label: '低强度（散步，慢跑，骑行，慢速游泳）',
      value: 'low'
    },
    {
      label: '中强度（快走，跑步，打球，舞蹈等）',
      value: 'medium'
    },
    {
      label: '高强度（HIIT，拳击，大重量，田径运动等）',
      value: 'high'
    },
    {
      label: '无固定运动类型',
      value: 'none'
    }
  ])

  // 问题3：单次运动持续多久
  const exerciseDurationOptions = ref([{
      label: '15分钟以内',
      value: '<15'
    },
    {
      label: '15-30分钟',
      value: '15-30'
    },
    {
      label: '31-60分钟',
      value: '31-60'
    },
    {
      label: '61-90分钟',
      value: '61-90'
    },
    {
      label: '90分钟以上',
      value: '>90'
    }
  ])

  //删除问题四
  // 问题4：食物过敏或忌口
  const foodAllergyOptions = ref([{
      label: '海鲜类',
      value: 'seafood'
    },
    {
      label: '乳制品',
      value: 'dairy'
    },
    {
      label: '小麦类',
      value: 'wheat'
    },
    {
      label: '水果类',
      value: 'fruit'
    },
    {
      label: '坚果类',
      value: 'nuts'
    },
    {
      label: '蛋类',
      value: 'egg'
    },
    {
      label: '大豆类',
      value: 'soy'
    },
    {
      label: '其他',
      value: 'other'
    },
    {
      label: '无',
      value: 'none'
    }
  ])

  // 新增：处理运动次数变更（清空2、3题数据）
  const handleExerciseFreqChange = (value) => {
    form.value.exerciseFreq = value
    // 如果选择0次，清空运动类型和时长
    if (value === '0') {
      form.value.exerciseTypes = []
      form.value.exerciseDuration = ''
    }
  }
  // 5. 基础信息方法
  const switchTab = (tab) => {
    // 切换标签时可加校验：比如基础信息没填完不让切日常习惯
    if (tab === 'habit' && !validateBaseForm()) {
      return
    }
    currentTab.value = tab
  }

  const formatDecimalInput = (value, decimalPlaces) => {
    let formatted = value.replace(/[^0-9.]/g, '')
    const dotIndex = formatted.indexOf('.')
    if (dotIndex !== -1) {
      formatted = formatted.slice(0, dotIndex + 1) + formatted.slice(dotIndex + 1).replace(/\./g, '')
      const decimalPart = formatted.slice(dotIndex + 1)
      if (decimalPart.length > decimalPlaces) {
        formatted = formatted.slice(0, dotIndex + 1 + decimalPlaces)
      }
    }
    return formatted
  }
  // 处理身高输入（限制最多4位小数）
  const handleHeightInput = () => {
    height.value = formatDecimalInput(height.value, 4)
  }

  // 处理体重输入（限制最多4位小数）
  const handleWeightInput = () => {
    weight.value = formatDecimalInput(weight.value, 4)
  }

  // 处理目标体重输入（限制最多4位小数）
  const handleTargetWeightInput = () => {
    targetWeight.value = formatDecimalInput(targetWeight.value, 4)
  }

  // BMI 与体型计算
  const bmi = computed(() => {
    const h = parseFloat(height.value) || 0
    const w = parseFloat(weight.value) || 0
    if (h === 0 || w === 0) return '--'
    return (w / Math.pow(h / 100, 2)).toFixed(1)
  })

  const bodyType = computed(() => {
    const b = parseFloat(bmi.value)
    if (isNaN(b)) return '--'
    if (b < 18.5) return '偏瘦'
    if (b < 24) return '正常'
    if (b < 28) return '超重'
    return '肥胖'
  })

  // 事件处理
  const onGenderChange = (e) => {
    selectedGenderIndex.value = e.detail.value
  }

  const selectTarget = (target) => {
    selectedTarget.value = target
  }

  const togglePart = (part) => {
    const index = selectedParts.value.indexOf(part)
    if (index > -1) {
      selectedParts.value.splice(index, 1)
    } else {
      selectedParts.value.push(part)
    }
  }

  // 表单校验
  const validateBaseForm = () => {
    // 校验性别
    if (selectedGenderIndex.value === -1) {
      uni.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return false
    }

    // 校验身高
    if (!height.value || parseFloat(height.value) <= 0) {
      uni.showToast({
        title: '请输入有效的身高',
        icon: 'none'
      })
      return false
    }

    // 校验体重
    if (!weight.value || parseFloat(weight.value) <= 0) {
      uni.showToast({
        title: '请输入有效的体重',
        icon: 'none'
      })
      return false
    }

    // 校验年龄
    if (!age.value || parseInt(age.value) <= 0 || parseInt(age.value) > 120) {
      uni.showToast({
        title: '请输入有效的年龄',
        icon: 'none'
      })
      return false
    }

    // 校验目标
    if (!selectedTarget.value) {
      uni.showToast({
        title: '请选择期望目标',
        icon: 'none'
      })
      return false
    }

    // 校验改善部位
    if (selectedParts.value.length === 0) {
      uni.showToast({
        title: '请选择至少一个改善部位',
        icon: 'none'
      })
      return false
    }

    // 校验目标体重
    if (!targetWeight.value || parseFloat(targetWeight.value) <= 0) {
      uni.showToast({
        title: '请输入有效的目标体重',
        icon: 'none'
      })
      return false
    }

    return true
  }

  // 7. 基础信息下一步函数（核心修改：校验通过后直接切换到日常习惯）
  const handleBaseSubmit = () => {
    // 1. 先校验基础信息
    if (!validateBaseForm()) return

    // 3. 直接切换到日常习惯标签页（无延迟，体验更优）
    currentTab.value = 'habit'


    // 4. 可选：滚动到日常习惯顶部（优化体验）
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }
  // 新增：切换运动类型
  const toggleExerciseType = (value) => {
    const index = form.value.exerciseTypes.indexOf(value)
    if (index > -1) {
      form.value.exerciseTypes.splice(index, 1)
    } else {
      form.value.exerciseTypes.push(value)
    }
  }

  //删除问题四
  // 核心修改：切换食物过敏选项（处理“无”选项的特殊逻辑）
  const toggleFoodAllergy = (value) => {
    // 如果选择的是“无”选项
    if (value === 'none') {
      // 清空所有已选的过敏类型
      form.value.foodAllergies = ['none']
      // 清空所有过敏详情
      form.value.foodAllergyDetails = {}
      return
    }

    // 如果已经选中了“无”，再选其他选项时，先移除“无”
    if (form.value.foodAllergies.includes('none')) {
      form.value.foodAllergies = form.value.foodAllergies.filter(item => item !== 'none')
    }

    const index = form.value.foodAllergies.indexOf(value)
    if (index > -1) {
      // 取消选择
      form.value.foodAllergies.splice(index, 1)
      delete form.value.foodAllergyDetails[value]
    } else {
      // 选择
      form.value.foodAllergies.push(value)
      form.value.foodAllergyDetails[value] = ''
    }
  }

  // 9. 日常习惯校验（更新为新问题）
  const validateHabitForm = () => {
    if (!form.value.exerciseFreq) {
      uni.showToast({
        title: '请选择每周运动次数',
        icon: 'none'
      })
      return false
    }
    // 只有当运动次数不是0次时，才校验2、3题
    if (form.value.exerciseFreq !== '0') {
      if (form.value.exerciseTypes.length === 0) {
        uni.showToast({
          title: '请选择运动类型',
          icon: 'none'
        })
        return false
      }
      if (!form.value.exerciseDuration) {
        uni.showToast({
          title: '请选择单次运动时长',
          icon: 'none'
        })
        return false
      }
    }
    //删除问题四
    // ########### 新增：第四题（食物过敏/忌口）校验 ###########
    // 1. 校验必选：至少选择一个选项
    if (form.value.foodAllergies.length === 0) {
      uni.showToast({
        title: '请选择食物过敏或忌口选项',
        icon: 'none'
      })
      return false
    }

    // 2. 校验非“无”选项的填空必填
    const nonNoneAllergies = form.value.foodAllergies.filter(item => item !== 'none')
    if (nonNoneAllergies.length > 0) {
      for (const allergy of nonNoneAllergies) {
        // 检查填空是否为空（去除首尾空格）
        if (!form.value.foodAllergyDetails[allergy]?.trim()) {
          // 找到对应的选项名称
          const allergyLabel = foodAllergyOptions.value.find(item => item.value === allergy)?.label || '该选项'
          uni.showToast({
            title: `请填写${allergyLabel}的具体食物`,
            icon: 'none'
          })
          return false
        }
      }
    }
    // ########### 第四题校验结束 ###########

    return true
  }
  // 10. 日常习惯提交函数（核心修改：校验通过后跳转到首页）
  const handleHabitSubmit = () => {
    // 1. 先校验日常习惯
    if (!validateHabitForm()) return

    // 2. 整合所有问卷数据（可传给后端）
    const allQuestionnaireData = {
      baseInfo: {
        gender: genderRange.value[selectedGenderIndex.value],
        height: `${height.value}cm`,
        weight: `${weight.value}kg`,
        bmi: bmi.value,
        bodyType: bodyType.value,
        age: age.value,
        target: selectedTarget.value,
        parts: selectedParts.value,
        targetWeight: `${targetWeight.value}kg`
      },
      habitInfo: {
        exerciseFreq: form.value.exerciseFreq,
        exerciseTypes: form.value.exerciseTypes,
        exerciseDuration: form.value.exerciseDuration,
        //删除问题四
        // 新增问题4数据
        foodAllergies: form.value.foodAllergies,
        foodAllergyDetails: form.value.foodAllergyDetails
      }
    }
    // 3. 保存问卷数据到本地存储（供AI对话使用）
    try {
      uni.setStorageSync('questionnaireData', allQuestionnaireData)
      // ✅ 新增：保存基础信息以便其他页面使用
      uni.setStorageSync('questionnaireBaseInfo', allQuestionnaireData.baseInfo)
      // ✅ 标记问卷已完成
      uni.setStorageSync('questionnaireCompleted', 'true')
      console.log('完整问卷数据已保存:', allQuestionnaireData)
    } catch (e) {
      console.error('保存问卷数据失败:', e)
    }

    // ✅ 新增：同步体重数据到record_weight
    try {
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      
      // 初始化体重记录列表（当前体重作为第一条记录）
      const currentWeight = parseFloat(weight.value)
      const weightList = [{
        date: dateStr,
        weight: currentWeight
      }]
      uni.setStorageSync('weightList', JSON.stringify(weightList))
      
      // 保存目标体重
      const targetWeightValue = parseFloat(targetWeight.value)
      uni.setStorageSync('targetWeight', targetWeightValue.toString())
      
      // 初始化首次使用日期（用于计算使用天数）
      if (!uni.getStorageSync('app_first_use_date')) {
        uni.setStorageSync('app_first_use_date', dateStr)
      }
      
      // 初始化每日记录（记录天数为1）
      const dailyRecords = {}
      dailyRecords[dateStr] = {
        date: dateStr,
        hasRecord: true,
        timestamp: Date.now()
      }
      uni.setStorageSync('daily_records', JSON.stringify(dailyRecords))
      
      console.log('✅ 体重数据已同步:', { currentWeight, targetWeightValue, dateStr })
    } catch (e) {
      console.error('同步体重数据失败:', e)
    }

    // 4. 提示提交成功
    uni.showToast({
      title: '问卷提交成功',
      icon: 'success',
      duration: 1500
    })

    // 5. 跳转到首页（核心逻辑：替换为你的首页路径）
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/home/home' // 请确认你的首页路径是否正确
      })
    }, 1500)
  }
</script>

<style scoped>
  .questionnaire-container {
    height: 100vh;
    background-color: #ffffff;
    box-sizing: border-box;
  }

  .questionnaire-scroll {
    height: 100%;
    /* 调整左右间距：从20rpx改为60rpx，上下保持20rpx */
    padding: 20rpx 60rpx;
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
  }

  /* 顶部标签栏 */
  .tab-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 30rpx;
  }

  .tab-item {
    padding: 15rpx 30rpx;
    border-radius: 30rpx;
    font-size: 32rpx;
    color: #666666;
    margin: 0 15rpx;
    background-color: #f0f0f0;
  }

  .tab-item.active {
    background-color: #64b5f6;
    color: #ffffff;
  }

  /* 内容区域通用 */
  .content-section {
    width: 100%;
  }

  /* 欢迎语区域 */
  .welcome-section {
    margin-bottom: 15rpx;
  }

  .tip-box {
    background-color: #e3f2fd;
    border-radius: 42rpx;
    padding: 40rpx;
  }

  .tip-text {
    font-size: 32rpx;
    color: #555555;
    line-height: 1.8;
  }

  /* 表单区域 */
  .form-section {
    margin-top: 30rpx;
    margin-bottom: 30rpx;
  }

  .form-item {
    margin-bottom: 30rpx;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #D9D9D9;
    font-size: 30rpx;
    color: #000000;
    padding: 0 10rpx;
    box-sizing: border-box;
    /* 移除原有可能的outline，避免点击时出现双重边框 */
    outline: none;
  }

  .picker-text {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #D9D9D9;
    font-size: 30rpx;
    color: #333333;
    padding: 0 10rpx;
    box-sizing: border-box;
  }

  /* 带单位的输入框样式 */
  .input-with-unit {
    display: flex;
    align-items: center;
    position: relative;
  }

  /*单位的样式*/
  .unit-text {
    position: absolute;
    right: 22.5rpx;
    font-size: 32rpx;
    color: #333333;
  }

  .picker-text {
    display: flex;
    align-items: center;
    color: #555555;
  }

  .bmi-section {
    display: flex;
    justify-content: space-between;
    padding: 10rpx 0;
    margin-bottom: 10rpx;
  }

  .bmi-text,
  .body-type-text {
    font-size: 42rpx;
    color: #64b5f6;
    font-weight: 500;
  }

  /* 目标选择区 */
  .target-section {
    margin-bottom: 60rpx;
  }

  .section-title {
    display: block;
    font-size: 32rpx;
    color: #333333;
    margin-bottom: 30rpx;
  }

  .target-buttons,
  .part-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 25rpx;
  }

  .target-buttons,
  .part-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 25rpx;
    /* 间距放大1.5倍 */
    margin-bottom: 35rpx;
    /* 间距放大1.5倍 */
  }

  .target-btn,
  .part-btn {
    padding: 20rpx 40rpx;
    /* 内边距放大1.5倍 */
    border-radius: 45rpx;
    /* 圆角放大1.5倍 */
    font-size: 34rpx;
    /* 26rpx * 1.5 = 39rpx */
    color: #64b5f6;
    background-color: #e3f2fd;
    border: 1rpx solid #bbdefb;
  }

  .target-btn.active,
  .part-btn.active {
    background-color: #64b5f6;
    color: #ffffff;
    border-color: #64b5f6;
  }

  /* 日常习惯样式 */
  .habit-section {
    margin-bottom: 60rpx;
  }

  .habit-item {
    /* 移除 habit-item 的边框，让题目没有框 */
    margin-bottom: 40rpx;
    /* border: 1rpx solid #999999; */
    padding: 0;
    /* 移除内边距 */
    box-sizing: border-box;
  }

  .habit-label {
    display: block;
    font-size: 32rpx;
    /* 改为黑色 */
    color: #333333;
    /* 去掉下方间距，让选项紧贴题目 */
    margin-bottom: 20rpx;
    line-height: 1.5;
  }

  .option-buttons {
    display: flex;
    flex-direction: column;
    /* 改为垂直排列 */
    gap: 15rpx;
    /* 选项之间的间距 */
  }

  .option-btn {
    /* 改为矩形边框样式 */
    padding: 25rpx 20rpx;
    border-radius: 0;
    /* 去掉圆角 */
    font-size: 28rpx;
    color: #000000;
    /* 文字黑色 */
    background-color: #ffffff;
    /* 背景白色 */
    border: 1rpx solid #D4D7DD;
    /* 灰色边框 */
    box-sizing: border-box;
    width: 100%;
    /* 选项占满宽度 */
    text-align: left;
    /* 文字左对齐 */
  }

  .option-btn.active {
    /* 选中时的样式 */
    background-color: #64b5f6;
    color: #ffffff;
    border-color: #64b5f6;
  }

  /* 提交和下一步的按钮通用 */
  .submit-section {
    margin-top: 35rpx;
  }

  .submit-btn {
    width: 100%;
    height: 100rpx;
    background: linear-gradient(to right, #64b5f6, #42a5f5);
    border-radius: 66rpx;
    color: #ffffff;
    font-size: 32rpx;
    border: none;
  }

  /* 问题4专用样式 */
  .option-wrapper {
    width: 100%;
  }

  .food-input-wrapper {
    margin-top: 10rpx;
    margin-bottom: 10rpx;
  }

  .food-input {
    width: 100%;
    height: 70rpx;
    border: 1rpx solid #D4D7DD;
    padding: 0 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    background-color: #f9fafc;
  }
</style>