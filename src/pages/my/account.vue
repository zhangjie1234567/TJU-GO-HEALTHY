<template>
	<view class="container">
		<view class="info-card">
			<view class="card-title">健康资料</view>

			<view class="info-row">
				<text class="info-label">身高</text>
				<view class="info-value-edit">
					<text class="info-value">{{ form.height }}cm</text>
					<text class="edit-icon" @click="editField('height')">✏️</text>
				</view>
			</view>
			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">体重</text>
				<view class="info-value-edit">
					<text class="info-value">{{ form.weight }}kg</text>
					<text class="edit-icon" @click="editField('weight')">✏️</text>
				</view>
			</view>
			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">目标体重</text>
				<view class="info-value-edit">
					<text class="info-value">{{ form.targetWeight }}kg</text>
					<text class="edit-icon" @click="editField('targetWeight')">✏️</text>
				</view>
			</view>
			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">年龄</text>
				<view class="info-value-edit">
					<text class="info-value">{{ form.age }}</text>
					<text class="edit-icon" @click="editField('age')">✏️</text>
				</view>
			</view>
		</view>

		<view class="action-section">
			<text class="section-title">账号管理</text>
			<view class="action-btn" @click="switchAccount">
				<text class="action-icon">🔄</text>
				<text class="action-text">切换账号</text>
				<text class="action-arrow">→</text>
			</view>
			<view class="action-btn danger" @click="logout">
				<text class="action-icon">🚪</text>
				<text class="action-text">退出登录</text>
				<text class="action-arrow">→</text>
			</view>
		</view>

		<view class="modal-overlay" v-if="showEditModal">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">编辑{{ editingField === 'height' ? '身高' : editingField === 'weight' ? '体重' : editingField === 'targetWeight' ? '目标体重' : '年龄' }}</text>
					<text class="modal-close" @click="showEditModal = false">✕</text>
				</view>

				<view class="modal-body">
					<input
						v-model="editValue"
						type="number"
						class="modal-input"
						:placeholder="`请输入${editingField === 'height' ? '身高' : editingField === 'weight' ? '体重' : editingField === 'targetWeight' ? '目标体重' : '年龄'}`"
					/>
				</view>

				<view class="modal-actions">
					<view class="modal-btn cancel" @click="showEditModal = false">取消</view>
					<view class="modal-btn confirm" @click="saveEdit">保存</view>
				</view>
			</view>
		</view>

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import {
	getCurrentUser,
	updateUserProfile,
	clearUserSession
} from './my-store'

const form = ref({
	height: 170,
	weight: 70,
	targetWeight: 60,
	age: 20
})

const showEditModal = ref(false)
const editingField = ref('')
const editValue = ref('')

const loadData = async () => {
	const user = await getCurrentUser()
	if (user) {
		form.value = {
			...form.value,
			height: Number(user.height) || 170,
			weight: Number(user.weight) || 70,
			targetWeight: Number(user.targetWeight) || 60,
			age: Number(user.age) || 20
		}
	}
}

const editField = (field) => {
	editingField.value = field
	editValue.value = String(form.value[field])
	showEditModal.value = true
}

const saveEdit = async () => {
	if (!editValue.value) return
	form.value[editingField.value] = Number(editValue.value)
	const ok = await updateUserProfile(form.value)
	if (!ok) return
	showEditModal.value = false
	uni.showToast({ title: '保存成功', icon: 'none' })
}

const switchAccount = () => {
	uni.showModal({
		title: '切换账号',
		content: '确定要切换账号吗？',
		success(res) {
			if (res.confirm) {
				clearUserSession()
				uni.navigateTo({ url: '/pages/login/login' })
			}
		}
	})
}

const logout = () => {
	uni.showModal({
		title: '退出登录',
		content: '确定要退出登录吗？',
		success(res) {
			if (res.confirm) {
				clearUserSession()
				uni.showToast({ title: '已退出登录', icon: 'none' })
				setTimeout(() => {
					uni.navigateTo({ url: '/pages/login/login' })
				}, 500)
			}
		}
	})
}

onShow(() => {
	loadData()
})
</script>

<style scoped lang="scss">
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;
$text-dark: #333;
$text-light: #888;
$danger-red: #ff6b6b;

.container {
	min-height: 100vh;
	background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
	padding: 20rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 20rpx;
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 0;
}

.info-label {
	font-size: 30rpx;
	color: $text-dark;
	font-weight: 600;
}

.info-value {
	font-size: 26rpx;
	color: $text-light;
}

.info-value-edit {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.edit-icon {
	font-size: 24rpx;
	color: $main-blue;
}

.divider {
	height: 1rpx;
	background: #eee;
}

.info-card {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.1);
}

.action-section {
	margin-top: 20rpx;
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
	margin-bottom: 12rpx;
	padding-left: 8rpx;
}

.action-btn {
	background: white;
	border-radius: 16rpx;
	padding: 20rpx 24rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

	&.danger {
		.action-icon,
		.action-text {
			color: $danger-red;
		}
	}
}

.action-icon {
	font-size: 28rpx;
	color: $main-blue;
}

.action-text {
	flex: 1;
	font-size: 28rpx;
	color: $text-dark;
}

.action-arrow {
	font-size: 28rpx;
	color: $text-light;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 100;
}

.modal-content {
	background: white;
	width: 100%;
	border-radius: 24rpx 24rpx 0 0;
	padding: 24rpx;
	max-height: 80vh;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #eee;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $text-dark;
}

.modal-close {
	font-size: 32rpx;
	color: $text-light;
}

.modal-body {
	margin: 20rpx 0;
}

.modal-input {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 14rpx 18rpx;
	font-size: 28rpx;
	height: 64rpx;
	box-sizing: border-box;
	background: white;
	color: #333;
}

.modal-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 20rpx;
}

.modal-btn {
	flex: 1;
	text-align: center;
	padding: 18rpx 0;
	border-radius: 12rpx;
	font-size: 28rpx;
}

.modal-btn.cancel {
	background: #f2f4f8;
	color: $text-dark;
}

.modal-btn.confirm {
	background: $main-blue;
	color: white;
}
</style>
