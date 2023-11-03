<template>
	<view v-if="userDetail" class="my-index">
		<view class="header-box">
			<view class="header-box-left">
				<button class="avatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image class="avatar-img"
						:src="userDetail.base.avatarUrl ? userDetail.base.avatarUrl : '/static/images/default.png'"
						mode="aspectFill"></image>
				</button>
				<view class="r">
					<view class="uid">用户ID: {{ userDetail.base.id }}</view>
					<view class="nick" @click="editNick">{{ userDetail.base.nick ? userDetail.base.nick : '点击设置昵称' }}
					</view>
				</view>
			</view>
		</view>
		<view class="line"></view>
		<uni-popup ref="popupNick" type="bottom" background-color="#fff">
			<view class="popupNick">
				<view class="t">请输入昵称</view>
				<uni-easyinput v-model="nick" type="nickname" trim placeholder="请输入昵称"></uni-easyinput>
				<view class="btn"><button type="primary" @click="_editNick">设置昵称</button></view>
			</view>
		</uni-popup>
		<uni-list>
			<uni-list-item v-if="mobileBind" thumb="/static/images/phone.png" title="绑定手机"
				:rightText="userDetail.base.mobile"></uni-list-item>
			<uni-list-item v-else thumb="/static/images/phone.png" title="绑定手机" :rightText="userDetail.base.mobile">
				<template v-slot:footer>
					<button type="primary" size="mini" open-type="getPhoneNumber"
						@getphonenumber="getPhoneNumber">立即绑定</button>
				</template>
			</uni-list-item>
			<uni-list-item thumb="/static/images/fk.png" title="意见反馈" showArrow clickable
				to="/pages/my/feedback"></uni-list-item>
			<uni-list-item thumb="/static/images/about.png" title="关于我们" showArrow clickable
				to="/pages/my/about?key=aboutus"></uni-list-item>
			<uni-list-item thumb="/static/images/kf.png" title="联系客服" showArrow clickable @click="customerService"></uni-list-item>
			<uni-list-item thumb="/static/images/clear.png" title="清除缓存" showArrow clickable
				@click="clearStorage"></uni-list-item>
			<uni-list-item thumb="/static/images/debug.png" :title="enableDebug ? '关闭调试' : '打开调试'" showArrow
				clickable @click="setEnableDebug"></uni-list-item>
			<uni-list-item thumb="/static/images/setting.png" title="权限与设置" showArrow clickable
				@click="openSetting"></uni-list-item>
			<uni-list-item thumb="/static/images/version.png" title="当前版本" :rightText="version"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	const CONFIG = require('@/config.js')
	export default {
		data() {
			return {
				mobileBind: false,
				userDetail: undefined,
				nick: undefined,
				enableDebug: uni.getSystemInfoSync().enableDebug,
				version: CONFIG.version,
			}
		},
		onLoad() {
			this.getUserApiInfo()
		},
		methods: {
			getUserApiInfo() {
				getApp().userDetail().then(() => {
					const userDetail = getApp().globalData.userDetail
					this.userDetail = userDetail
					this.nick = userDetail.base.nick
					if (userDetail.base.mobile) {
						this.mobileBind = true
					}
				})
			},
			editNick() {
				this.$refs.popupNick.open('bottom')
			},
			async _editNick() {
				if (!this.nick) {
					uni.showToast({
						title: '请填写昵称',
						icon: 'none'
					})
					return
				}
				const postData = {
					token: this.token,
					nick: this.nick,
				}
				const res = await this.$wxapi.modifyUserInfo(postData)
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showToast({
					title: '设置成功',
				})
				this.$refs.popupNick.close()
				this.getUserApiInfo()
			},
			async onChooseAvatar(e) {
				console.log(e);
				const avatarUrl = e.detail.avatarUrl
				let res = await this.$wxapi.uploadFileV2(this.token, avatarUrl)
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				res = await this.$wxapi.modifyUserInfo({
					token: this.token,
					avatarUrl: res.data.url,
				})
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showToast({
					title: '设置成功',
				})
				this.getUserApiInfo()
			},
			getPhoneNumber(e) {
				if (!e.detail.errMsg || e.detail.errMsg == "getPhoneNumber:fail user deny") {
					return;
				} else if (e.detail.errMsg != "getPhoneNumber:ok") {
					wx.showModal({
						content: e.detail.errMsg,
						showCancel: false
					})
					return;
				}
				this._getPhoneNumber(e)
			},
			async _getPhoneNumber(e) {
				// https://www.yuque.com/apifm/nu0f75/cql7e1
				const res = await this.$wxapi.bindMobileWxappV2(this.token, e.detail.code)
				if (res.code == 0) {
					wx.showToast({
						title: '登录成功',
						icon: 'success'
					})
				} else {
					wx.showModal({
						content: res.msg,
						showCancel: false
					})
				}
				this.getUserApiInfo()
			},
			clearStorage() {
				uni.clearStorageSync()
				uni.reLaunch({
					url: '/pages/shop/select'
				})
			},
			setEnableDebug() {
				const enableDebug = uni.getSystemInfoSync().enableDebug
				if (enableDebug) {
					uni.setEnableDebug({
						enableDebug: false
					})
				} else {
					uni.setEnableDebug({
						enableDebug: true
					})
				}
			},
			openSetting() {
				uni.openSetting({
					withSubscriptions: true
				})
			},
			customerService() {
				wx.openCustomerServiceChat({
					extInfo: {
						url: this.sysconfigMap.customerServiceChatUrl
					},
					corpId: this.sysconfigMap.customerServiceChatCorpId,
					success: res => {},
					fail: err => {
						console.error(err)
					}
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.header-box {
		padding-right: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #333;
	}

	.header-box-left {
		display: flex;
		align-items: center;
	}

	.header-box .avatar {
		width: 128rpx;
		height: 128rpx;
		margin: 20rpx;
		border-radius: 50%;
	}

	.header-box .avatar-img {
		width: 128rpx;
		height: 128rpx;
		margin-left: -30rpx;
	}

	.header-box .btn {
		margin-left: 32rpx;
	}

	.header-box .r {
		margin-left: 32rpx;
		font-size: 28rpx;
	}

	.popupNick {
		padding: 32rpx;

		.t {
			text-align: center;
			font-weight: bold;
			font-size: 30rpx;
			padding-bottom: 32rpx;
		}

		.btn {
			margin-top: 32rpx;
		}
	}
</style>