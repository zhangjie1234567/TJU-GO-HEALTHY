<template>
  <view class="page">
    <view class="content">
      <text class="page-title">今日菜单 - 留园</text>

      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchKeyword" placeholder="搜索菜品" confirm-type="search" />
        <text v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">✕</text>
      </view>

      <view v-if="displayDishes.length === 0" class="empty">{{ emptyText }}</view>

      <view v-else class="dish-list">
        <view class="dish-card" v-for="dish in displayDishes" :key="dish.id">
          <view class="dish-head">
            <text class="dish-name">{{ dish.dishName }}</text>
            <text class="dish-price">{{ dish.price.toFixed(2) }}元</text>
          </view>

          <view class="dish-meta">
            <text class="meta-chip">楼层：{{ dish.floor }}</text>
            <text class="meta-chip">风味：{{ dish.flavor }}</text>
            <text class="meta-chip">卡路里：{{ dish.calorie }} kcal</text>
          </view>

          <view class="dish-actions">
            <text class="action-btn" @click="addDishToMeal(dish, 'breakfast')">加早餐</text>
            <text class="action-btn" @click="addDishToMeal(dish, 'lunch')">加午餐</text>
            <text class="action-btn" @click="addDishToMeal(dish, 'dinner')">加晚餐</text>
            <text class="action-btn" :class="dish.collected ? 'favorite' : 'primary'" @click="toggleDishCollection(dish)">
              {{ dish.collected ? '已收藏' : '收藏到菜谱' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCanteenMenu } from './baseMenuPage.js'

const { displayDishes, searchKeyword,emptyText, fetchMenu, toggleDishCollection, addDishToMeal } = useCanteenMenu('留园')

onMounted(fetchMenu)
</script>

<style lang="scss" scoped>
@import './canteen-menu.css';
</style>