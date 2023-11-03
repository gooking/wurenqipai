<template>
	<view v-if="apiData" class="index">
		<view class="img-box">
			<image :src="apiData.basicInfo.pic" class="img" mode="widthFix"></image>
		</view>
		<view class="day-box">
			<view class="item" :class="index == dayIndex ? 'active' : ''" v-for="(item,index) in dayList"
				@click="dayClick(index)">
				<view class="t1">{{ item.name }}</view>
				<view class="t2">{{ item.dayStr }}</view>
			</view>
		</view>
		<view class="line"></view>
		<view class="list">
			<view class="t2">
				<view class="box"></view>
				<view class="txt">可选</view>
				<view class="box active"></view>
				<view class="txt">不可选</view>
			</view>
			<view class="line"></view>
			<view class="t3">
				<view class="item" v-for="(item,index) in times">
					<view v-if="item.selected" class="box select" @click="sel(index)"></view>
					<view v-else-if="item.stores == 0" class="box active"></view>
					<view v-else class="box" @click="sel(index)"></view>
					<view class="txt">{{ item.name }}</view>
				</view>
			</view>
		</view>
		<view class="submit-box">
			<view class="line"></view>
			<view class="main">
				<view class="l">
					￥<text>{{ amount }}</text>已选{{ hours }}小时
				</view>
				<view class="r">
					<button type="primary" :disabled="disabled" :loading="loading" @click="submit">立即预定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const dayjs = require('dayjs')
	const PAY = require('@/common/pay.js')
	export default {
		data() {
			return {
				id: undefined,
				apiData: undefined,
				menuButtonInfo: {
					top: 0
				},
				distance: undefined,
				dayIndex: 0,
				dayList: [],
				mobileBind: false,
				times: undefined,
				disabled: true,
				loading: false,
				hours: 0,
				amount: 0,
				postData: undefined,
			}
		},
		onLoad(e) {
			this.id = e.id
			this.goodsDetailV2()
			const weekArray = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
			for (var i = 0; i < 5; i++) {
				const d = dayjs().add(i, 'day')
				let name = weekArray[d.day()]
				if (i == 0) {
					name = '今天'
				} else if (i == 1) {
					name = '明天'
				}
				this.dayList.push({
					name,
					dayStr: d.format('MM-DD'),
					date: d.format('YYYY-MM-DD'),
				})
			}
			this.dayClick(0)
			if (getApp().globalData.userDetail) {
				const userDetail = getApp().globalData.userDetail
				if (userDetail.base.mobile) {
					this.mobileBind = true
				}
			}
			uni.$on('loginOK', data => {
				getApp().userDetail().then(() => {
					const userDetail = getApp().globalData.userDetail
					if (userDetail.base.mobile) {
						this.mobileBind = true
					}
				})
			})
			this.goodsTimesDayItems()
		},
		onShareAppMessage: function() {
			return {
				title: this.apiData.basicInfo.name,
				path: '/pages/index/yuding?id=' + this.id,
				imageUrl: this.apiData.basicInfo.pic
			}
		},
		onShareTimeline() {
			return {
				title: this.apiData.basicInfo.name,
				query: 'id=' + this.id,
				imageUrl: this.apiData.basicInfo.pic
			}
		},
		methods: {
			async goodsDetailV2() {
				// https://www.yuque.com/apifm/nu0f75/vuml8a
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.goodsDetailV2({
					id: this.id,
					token: this.token,
				})
				uni.hideLoading()
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.reLaunch({
								url: '/pages/index/index'
							})
						}
					})
					return
				}
				this.apiData = res.data
				uni.setNavigationBarTitle({
					title: res.data.basicInfo.name
				})
			},
			dayClick(index) {
				this.dayIndex = index
				this.goodsTimesDayItems()
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
				const res = this.$wxapi.bindMobileWxappV2(this.token, e.detail.code)
				if (res.code == 0) {
					wx.showToast({
						title: '登录成功',
						icon: 'success'
					})
					this.mobileBind = true
				} else {
					wx.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
			async goodsTimesDayItems() {
				// https://www.yuque.com/apifm/nu0f75/dlpp5v
				const res = await this.$wxapi.goodsTimesDayItems(this.dayList[this.dayIndex].date, this.id)
				if (res.code == 0) {
					res.data.forEach(ele => {
						if (this.dayIndex == 0 && dayjs().format('HH:00') > ele.name) {
							ele.stores = 0
						}
					})
					this.times = res.data
				}
			},
			async sel(index) {
				const t = this.times[index]
				t.selected = !t.selected
				this.times.splice(index, 1, t)
				// 第一个选中的时间段紧跟着的后面时段必选
				const firstIndex = this.times.findIndex(ele => ele.selected)
				if (firstIndex != -1 && firstIndex < this.times.length - 1) {
					// 中间不能断，要连续
					if (t.selected && firstIndex < index) {
						for (let i = firstIndex + 1; i < index; i++) {
							const item = this.times[i]
							if (item.stores > 0 && !item.selected) {
								item.selected = true
								this.times.splice(i, 1, item)
							}
						}
					}
					// 取消选择，后面全部取消选择
					if (!t.selected) {
						for (let i = index; i < 24; i++) {
							const item = this.times[i]
							item.selected = false
							this.times.splice(i, 1, item)
						}
					}
					// 有选，且不是最后一个（23:00）,需要连选下一个
					const nextItem = this.times[firstIndex+1]
					if (nextItem.stores > 0) {
						nextItem.selected = true
						this.times.splice(firstIndex+1, 1, nextItem)
					}
				}
				// 必选结束
				let hours = 0
				const goodsJsonStr = []
				this.times.filter(ele => ele.selected).forEach(ele => {
					hours++
					goodsJsonStr.push({
						goodsId: this.id,
						number: 1,
						goodsTimesDay: this.dayList[this.dayIndex].date,
						goodsTimesItem: ele.name,
					})
				})
				this.hours = hours.toFixed(0)
				if (this.hours < 2) {
					this.amount = 0
					this.disabled = true
					return
				}
				// 计算价格 https://www.yuque.com/apifm/nu0f75/qx4w98
				this.postData = {
					token: this.token,
					calculate: true,
					goodsJsonStr: JSON.stringify(goodsJsonStr),
				}
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.orderCreate(this.postData)
				uni.hideLoading()
				if (res.code == 0) {
					this.disabled = false
					this.amount = res.data.amountReal
				} else {
					this.disabled = true
				}
			},
			async submit() {
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.orderCreate(Object.assign(this.postData, {calculate: false}))
				uni.hideLoading()
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
					this.disabled = true
					return
				}
				// 读取余额 https://www.yuque.com/apifm/nu0f75/wrqkcb
				const userAmount = await this.$wxapi.userAmount(this.token)
				const needPay = (res.data.amountReal - userAmount.data.balance).toFixed(2)
				if (needPay <= 0) {
					// 直接调用支付接口
					const orderPay = await this.$wxapi.orderPay(this.token, res.data.id)
					if (orderPay.code != 0) {
						uni.showModal({
							content: orderPay.msg,
							showCancel: false
						})
						wx.setStorageSync('order_refresh', true)
						uni.switchTab({
							url: "../order/index"
						})
					} else {
						uni.showToast({
							title: '支付成功'
						})
						wx.setStorageSync('order_refresh', true)
						uni.switchTab({
							url: "../order/index"
						})
					}
				} else {
					// 发起在线支付
					PAY.pay('wxpay', {
						appid: getApp().globalData.wxpayOpenAppId
					}, needPay, '支付订单 ：' + res.data.id, '支付订单 ：' + res.data.id, {
						type: 0,
						id: res.data.id
					}, () => {
						wx.setStorageSync('order_refresh', true)
						uni.switchTab({
							url: "../order/index"
						})
					}, () => {
						wx.setStorageSync('order_refresh', true)
						uni.switchTab({
							url: "../order/index"
						})
					})
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.img-box {
		position: relative;

		.img {
			width: 100%;
		}
	}

	.day-box {
		padding: 16rpx;
		display: flex;

		.item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #999;
			padding: 24rpx;

			.t2 {
				margin-top: 16rpx;
			}

			&.active {
				background: #f3a73f;
				color: #fff;
				border-radius: 16rpx;
			}
		}
	}

	.list {
		margin-top: 32rpx;
		padding: 0 16rpx 16rpx 16rpx;
		border-bottom: #e5e5e5 1rpx solid;

		.t2 {
			display: flex;
			align-items: center;
			font-size: 26rpx;
			margin-top: 16rpx;
			margin-bottom: 32rpx;
			.box {
				width: 24rpx;
				height: 24rpx;
				background: #dfdfdf;

				&.active {
					background: #e43d33;
				}
			}

			.txt {
				padding: 0 32rpx 0 16rpx;
			}
		}

		.t3 {
			display: flex;
			margin-top: 16rpx;
			flex-wrap: wrap;
			padding-left: 24rpx;
			.item {
				width: 56rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				margin-top: 8rpx;
				.box {
					width: 48rpx;
					height: 48rpx;
					background: #dfdfdf;

					&.active {
						background: #e43d33;
					}
					&.select {
						background: #18bc37;
					}
				}

				.txt {
					text-align: center;
					font-size: 16rpx;
				}
			}
		}
	}
	.submit-box {
		// bottom: constant(safe-area-inset-bottom);
		// bottom: env(safe-area-inset-bottom);
		background: #fff;
		position: fixed;
		left: 0;
		width: 100vw;
		bottom: var(--window-bottom);
		.main {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 16rpx 32rpx;
			.l {
				color: #333;
				font-size: 26rpx;
				text {
					color: #e43d33;
					font-size: 36rpx;
					padding: 0 8rpx;
				}
			}
		}
	}
</style>