<template>
	<view class="container">
		<!-- 账号信息卡片 -->
		<view class="info-card">
			<view class="info-row">
				<text class="info-label">昵称</text>
				<view class="info-value-edit">
					<text class="info-value">{{ form.name }}</text>
					<text class="edit-icon" @click="editField('name')">✏️</text>
				</view>
			</view>
			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">学号</text>
				<text class="info-value">{{ form.studentId }}</text>
			</view>
			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">头像</text>
				<view class="avatar-selector" @click="selectAvatar">
					<view class="avatar-preview">{{ form.avatar }}</view>
					<text class="edit-icon">✏️</text>
				</view>
			</view>
			<view class="divider"></view>

			<view class="info-row">
				<text class="info-label">密码</text>
				<text class="edit-link" @click="editPassword">修改密码 →</text>
			</view>
		</view>

		<!-- 其他信息 -->
		<view class="info-card">
			<view class="card-title">个人信息</view>

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

		<!-- 账号管理 -->
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

		<!-- 编辑弹窗 -->
		<view class="modal-overlay" v-if="showEditModal" @click.self="showEditModal = false">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">编辑{{ editingField === 'name' ? '昵称' : editingField === 'height' ? '身高' : editingField === 'weight' ? '体重' : editingField === 'targetWeight' ? '目标体重' : '年龄' }}</text>
					<text class="modal-close" @click="showEditModal = false">✕</text>
				</view>

				<view class="modal-body">
					<input
						v-if="editingField === 'name'"
						v-model="editValue"
						type="text"
						class="modal-input"
						placeholder="请输入昵称"
						maxlength="20"
					/>
					<input
						v-else
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

		<!-- 头像选择器 -->
		<view class="modal-overlay" v-if="showAvatarPicker" @click.self="showAvatarPicker = false">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">选择头像</text>
					<text class="modal-close" @click="showAvatarPicker = false">✕</text>
				</view>

				<view class="avatar-grid">
					<view
						v-for="(avatar, index) in avatarList"
						:key="index"
						class="avatar-item"
						:class="{ selected: form.avatar === avatar }"
						@click="form.avatar = avatar; saveAvatarAndClose()"
					>
						{{ avatar }}
					</view>
				</view>
			</view>
		</view>

		<!-- 密码修改弹窗 -->
		<view class="modal-overlay" v-if="showPasswordModal" @click.self="showPasswordModal = false">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">修改密码</text>
					<text class="modal-close" @click="showPasswordModal = false">✕</text>
				</view>

				<view class="modal-body">
					<input
						v-model="passwordForm.old"
						type="password"
						class="modal-input"
						placeholder="请输入旧密码"
					/>
					<input
						v-model="passwordForm.new"
						type="password"
						class="modal-input"
						placeholder="请输入新密码"
					/>
					<input
						v-model="passwordForm.confirm"
						type="password"
						class="modal-input"
						placeholder="请确认新密码"
					/>
				</view>

				<view class="modal-actions">
					<view class="modal-btn cancel" @click="showPasswordModal = false">取消</view>
					<view class="modal-btn confirm" @click="savePassword">保存</view>
				</view>
			</view>
		</view>

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getCurrentUser, updateUserProfile } from './my-store'

const form = ref({
	name: '',
	studentId: '',
	avatar: '😊',
	height: 170,
	weight: 70,
	targetWeight: 60,
	age: 20
})

const showEditModal = ref(false)
const editingField = ref('')
const editValue = ref('')

const showAvatarPicker = ref(false)
const avatarList = ['😊', '😃', '😄', '😁', '🤗', '😍', '🤩', '😎', '🥳', '😇', '🧠', '💪', '🤸', '🏃', '🚴']

const showPasswordModal = ref(false)
const passwordForm = ref({
	old: '',
	new: '',
	confirm: ''
})

const loadData = () => {
	const user = getCurrentUser()
	if (user) {
		form.value = {
			...form.value,
			name: user.name,
			studentId: user.studentId,
			avatar: user.avatar || '😊'
		}
	}
}

const editField = (field) => {
	editingField.value = field
	editValue.value = String(form.value[field])
	showEditModal.value = true
}

const saveEdit = () => {
	if (editValue.value) {
		if (editingField.value === 'name') {
			form.value.name = editValue.value
		} else {
			form.value[editingField.value] = Number(editValue.value)
		}
		updateUserProfile(form.value)
		showEditModal.value = false
		uni.showToast({
			title: '保存成功',
			icon: 'none'
		})
	}
}

const selectAvatar = () => {
	showAvatarPicker.value = true
}

const saveAvatarAndClose = () => {
	updateUserProfile(form.value)
	showAvatarPicker.value = false
	uni.showToast({
		title: '头像已更新',
		icon: 'none'
	})
}

const editPassword = () => {
	passwordForm.value = { old: '', new: '', confirm: '' }
	showPasswordModal.value = true
}

const savePassword = () => {
	if (!passwordForm.value.old || !passwordForm.value.new || !passwordForm.value.confirm) {
		uni.showToast({
			title: '请填写所有字段',
			icon: 'none'
		})
		return
	}

	if (passwordForm.value.new !== passwordForm.value.confirm) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		})
		return
	}

	if (passwordForm.value.new.length < 6) {
		uni.showToast({
			title: '密码长度至少6位',
			icon: 'none'
		})
		return
	}

	// 这里应该调用后端API验证旧密码和修改密码
	uni.setStorageSync('user_password', passwordForm.value.new)
	showPasswordModal.value = false
	uni.showToast({
		title: '密码修改成功',
		icon: 'none'
	})
}

const switchAccount = () => {
	uni.showModal({
		title: '切换账号',
		content: '确定要切换账号吗？',
		success(res) {
			if (res.confirm) {
				uni.clearStorageSync()
				uni.navigateTo({
					url: '/pages/login/login'
				})
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
				uni.removeStorageSync('current_user_profile')
				uni.showToast({
					title: '已退出登录',
					icon: 'none'
				})
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					})
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
$light-gray: #f8f8f8;
$text-dark: #333;
$text-light: #888;
$danger-red: #ff6b6b;

.container {
	min-height: 100vh;
	background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
	padding: 20rpx;
}

.top-bar {
	background: white;
	display: flex;
	align-items: center;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 20rpx;
	padding-bottom: 0;
	border-bottom: none;
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
	cursor: pointer;
}

.edit-link {
	font-size: 26rpx;
	color: $main-blue;
}

.avatar-selector {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.avatar-preview {
	font-size: 40rpx;
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: $bg-blue;
	border-radius: 8rpx;
	cursor: pointer;
}

.divider {
	height: 1rpx;
	background: #eee;
	margin: 0;
}

.info-card {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.1);
}

.action-section {
	padding: 0;
	margin-top: 20rpx;
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
	margin-left: 0;
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
	transition: transform 0.2s, box-shadow 0.2s;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.12);
	}

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

/* 模态框 */
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
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
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
	cursor: pointer;
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
	line-height: 1;
	margin-bottom: 16rpx;
	box-sizing: border-box;
	background: white;
	color: #333;
	font-family: inherit;
	outline: none;
	-webkit-appearance: none;
	appearance: none;
	transition: border-color 0.2s, box-shadow 0.2s;
	display: flex;
	align-items: center;
}

.modal-input::placeholder {
	color: #ccc;
	font-size: 28rpx;
}

.modal-input:focus {
	border-color: $main-blue;
	box-shadow: 0 0 0 2rpx rgba(79, 161, 242, 0.1);
}

.avatar-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 16rpx;
	margin: 20rpx 0;
}

.avatar-item {
	font-size: 48rpx;
	width: 70rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: $bg-blue;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	cursor: pointer;
	transition: all 0.2s;

	&.selected {
		border-color: $main-blue;
		background: rgba(79, 161, 242, 0.2);
	}

	&:active {
		transform: scale(0.95);
	}
}

.modal-actions {
	display: flex;
	gap: 12rpx;
	margin-top: 24rpx;
}

.modal-btn {
	flex: 1;
	padding: 16rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	text-align: center;
	font-weight: 600;
	transition: transform 0.2s;

	&:active {
		transform: scale(0.98);
	}

	&.cancel {
		background: #eee;
		color: $text-light;
	}

	&.confirm {
		background: $main-blue;
		color: white;
	}
}
</style>
