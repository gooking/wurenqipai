<template>
	<view v-if="apiData" class="index">
		<view class="img-box">
			<image :src="apiData.info.pic" class="img" mode="widthFix"></image>
			<!-- #ifdef MP -->
			<view class="opening-tag" :style="'top: ' + menuButtonInfo.top + 'px;'" @click="changeShop">
				<uni-icons type="back" size="36rpx"></uni-icons>
				<view class="txt">切换门店</view>
			</view>
			<!-- #endif -->
			<!-- #ifndef MP -->
			<view class="opening-tag" style="top: 64rpx;" @click="changeShop">
				<uni-icons type="back" size="36rpx"></uni-icons>
				<view class="txt">切换门店</view>
			</view>
			<!-- #endif -->
		</view>
		<uni-list>
			<uni-list-item thumb="/static/images/notice.png"
				:title="apiData.info.openingHours + ' ,可提前4天预定，120分钟起订'"></uni-list-item>
		</uni-list>
		<view class="info-box">
			<view class="l">
				<view class="title">{{ apiData.info.name }}</view>
				<view class="address">{{ apiData.info.address }}</view>
				<view v-if="distance" class="address"><uni-icons type="location" size="20"></uni-icons> {{ distance }}km
				</view>
			</view>
			<view class="r">
				<uni-icons type="phone-filled" size="64rpx" color="#f3a73f"
					@click="makePhone(apiData.info.linkPhone)"></uni-icons>
				<view class="location" @click="openLocation(apiData.info)">导航</view>
			</view>
		</view>
		<view class="line"></view>
		<view class="btn-group">
			<view class="item">
				<image src="/static/images/wifi.png" mode="widthFix" @click="wifi"></image>
				<text @click="wifi">WiFi连接</text>
				<button v-if="!mobileBind" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"></button>
			</view>
			<view class="item">
				<image src="/static/images/door.png" mode="widthFix" @click="goOrders"></image>
				<text @click="goOrders">开门</text>
				<button v-if="!mobileBind" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"></button>
			</view>
		</view>
		<view class="line"></view>
		<view class="day-box">
			<view class="item" :class="index == dayIndex ? 'active' : ''" v-for="(item,index) in dayList"
				@click="dayClick(index)">
				<view class="t1">{{ item.name }}</view>
				<view class="t2">{{ item.dayStr }}</view>
			</view>
		</view>
		<view class="line"></view>
		<page-box-empty v-if="!goods || goods.length == 0" title="暂无包厢" :showBtn="false"></page-box-empty>
		<view v-for="(item,index) in goods" class="list" @click="yuding(index)">
			<view class="t1">
				<image class="pic" mode="aspectFill" :src="item.pic"></image>
				<view class="info">
					<view class="title">{{ item.name }}</view>
					<view class="txt">{{ item.subName }}</view>
				</view>
				<view v-if="item.curStores" class="status">
					<view class="a">订</view>
					<view class="b">空闲中</view>
				</view>
				<view v-else class="status active">
					<view class="a">{{ item.nextFreeTime }}结束</view>
					<view class="b">使用中</view>
				</view>
			</view>
			<view class="t2">
				<view class="box"></view>
				<view class="txt">可选</view>
				<view class="box active"></view>
				<view class="txt">不可选</view>
			</view>
			<view class="t3">
				<view class="item" v-for="(item,index) in item.times">
					<view class="box" :class="item.stores == 0 ? 'active' : ''"></view>
					<view class="txt">{{ item.name }}</view>
				</view>
			</view>
		</view>
		<view class="content-title">
			<uni-title type="h1" title="门店介绍"></uni-title>
		</view>
		<view v-if="apiData.content" class="content">
			<mp-html :content="apiData.content" />
		</view>

		<uni-popup ref="popupWifi" type="bottom" background-color="#fff">
			<view class="popupWifi">
				<view class="t">WiFi连接</view>
				<view class="ssid">名称: {{ apiData.info.wifiSsid }}</view>
				<view class="pwd">密码: {{ apiData.info.wifiPwd }}</view>
				<view class="btns">
					<view class="btn"><button type="primary" @click="copywifi">复制密码</button></view>
					<!-- #ifdef MP -->
					<view class="btn btn2"><button type="primary" @click="connectwifi">一键连接</button></view>
					<!-- #endif -->
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	const dayjs = require('dayjs')
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
				goods: undefined,
			}
		},
		onLoad(e) {
			if (!e.id) {
				e.id = this.shopId // 读取缓存
			}
			if (!e.id) {
				// 选择门店
				uni.redirectTo({
					url: '/pages/shop/select'
				})
				return
			}
			this.id = e.id
			this.shopSubdetail()
			// #ifdef MP
			this.menuButtonInfo = uni.getMenuButtonBoundingClientRect()
			// #endif
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
			this.goodsv2()
		},
		onShareAppMessage: function() {
			return {
				title: this.apiData.info.name,
				path: '/pages/index/index?id=' + this.id,
				imageUrl: this.apiData.info.pic
			}
		},
		onShareTimeline() {
			return {
				title: this.apiData.info.name,
				query: 'id=' + this.id,
				imageUrl: this.apiData.info.pic
			}
		},
		methods: {
			async shopSubdetail() {
				// https://www.yuque.com/apifm/nu0f75/cu4cfi
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.shopSubdetail(this.id)
				uni.hideLoading()
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false,
						success: () => {
							uni.reLaunch({
								url: '/pages/shop/select'
							})
						}
					})
					return
				}
				this.apiData = res.data
				this.getDistance()
			},
			getDistance() {
				getApp().getLocation().then(res => {
					this.lat = res.lat
					this.long = res.long
					const distance = getApp().getDistance(res.lat, res.long, this.apiData.info.latitude, this
						.apiData.info.longitude) / 1000
					this.distance = distance.toFixed(2)
				})
			},
			checkIsOpened(openingHours) {
				if (!openingHours) {
					return true
				}
				const date = new Date();
				const startTime = openingHours.split('-')[0]
				const endTime = openingHours.split('-')[1]
				const dangqian = date.toLocaleTimeString('chinese', {
					hour12: false
				})

				const dq = dangqian.split(":")
				const a = startTime.split(":")
				const b = endTime.split(":")

				const dqdq = date.setHours(dq[0], dq[1])
				const aa = date.setHours(a[0], a[1])
				const bb = date.setHours(b[0], b[1])

				if (a[0] * 1 > b[0] * 1) {
					// 说明是到第二天
					return !this.checkIsOpened(endTime + '-' + startTime)
				}
				return aa < dqdq && dqdq < bb
			},
			makePhone(phoneNumber) {
				uni.makePhoneCall({
					phoneNumber
				})
			},
			openLocation(item) {
				uni.openLocation({
					latitude: item.latitude,
					longitude: item.longitude,
					name: item.name,
					address: item.address
				})
			},
			wifi() {
				this.$refs.popupWifi.open('bottom')
			},
			copywifi() {
				uni.setClipboardData({
					data: this.apiData.info.wifiPwd
				})
			},
			connectwifi() {
				uni.startWifi({
					success: () => {
						uni.connectWifi({
							SSID: this.apiData.info.wifiSsid,
							password: this.apiData.info.wifiPwd,
							forceNewApi: true,
							success: () => {
								uni.showToast({
									title: '连接成功',
									icon: 'none'
								})
							},
							fail: (error) => {
								console.error(this.apiData.info.wifiSsid);
								console.error(this.apiData.info.wifiPwd);
								console.error(error);
								uni.showToast({
									title: error.errMsg,
									icon: 'none'
								})
							},
						})
					},
					fail: (error) => {
						console.error(error);
						uni.showToast({
							title: 'WiFi初始化失败:' + error.errMsg,
							icon: 'none'
						})
					},
				})
			},
			dayClick(index) {
				this.dayIndex = index
				this.processTimeStores()
			},
			changeShop() {
				uni.navigateTo({
					url: '/pages/shop/select'
				})
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
					this.mobileBind = true
				} else {
					wx.showModal({
						content: res.msg,
						showCancel: false
					})
				}
			},
			async goodsv2() {
				// https://www.yuque.com/apifm/nu0f75/wg5t98
				const res = await this.$wxapi.goodsv2({
					shopId: this.id
				})
				if (res.code == 0) {
					this.goods = res.data.result
					this.processTimeStores()
				}
			},
			async processTimeStores() {
				if (!this.goods || this.goods.length == 0) {
					return
				}
				for (let i = 0; i < this.goods.length; i++) {
					const g = this.goods[i]
					g.times = []
					// https://www.yuque.com/apifm/nu0f75/dlpp5v
					const res = await this.$wxapi.goodsTimesDayItems(this.dayList[this.dayIndex].date, g.id)
					if (res.code == 0) {
						res.data.forEach(ele => {
							if (this.dayIndex == 0 && dayjs().format('HH:00') > ele.name) {
								ele.stores = 0
							}
						})
						g.times = res.data
					}
					// 当前时段是否可预定
					const curTime = dayjs().format('HH:00')
					const _curTime = g.times.find(ele => ele.name == curTime)
					g.curStores = _curTime ? _curTime.stores : 0
					if (g.curStores <= 0) {
						// 计算结束时间 
						const curIndex = g.times.findIndex(ele => ele.name == curTime)
						for (var j = curIndex; j < g.times.length; j++) {
							if (g.times[j].stores > 0) {
								g.nextFreeTime = g.times[j].name
								break
							}
						}
						if (!g.nextFreeTime) {
							g.nextFreeTime = '今日'
						}
					}
					this.goods.splice(i, 1, g)
				}
			},
			yuding(index) {
				const item = this.goods[index]
				uni.navigateTo({
					url: '/pages/index/yuding?id=' + item.id
				})
			},
			goOrders() {
				uni.switchTab({
					url: '/pages/order/index'
				})
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

		.opening-tag {
			position: absolute;
			left: 32rpx;
			display: flex;
			align-items: center;
			background: #f5f5f5;
			padding: 16rpx 24rpx;
			border-radius: 32rpx;
		}
	}

	.info-box {
		padding: 32rpx;
		display: flex;

		.l {
			flex: 1;
		}

		.title {
			font-weight: bold;
			padding-bottom: 24rpx;
		}

		.address {
			color: #666;
			padding: 8rpx 0;
		}

		.r {
			display: flex;
			flex-direction: column;
			align-items: center;

			.location {
				margin-top: 16rpx;
				color: #f3a73f;
			}
		}

	}

	.btn-group {
		padding: 48rpx;
		display: flex;
		justify-content: space-around;

		.item {
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			image {
				width: 88rpx;
			}

			text {
				margin-top: 16rpx;
				font-size: 26rpx;
			}

			button {
				position: absolute;
				height: 100%;
				width: 100%;
				opacity: 0;
				z-index: 99;
			}
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

		.t1 {
			display: flex;
			align-items: center;

			.pic {
				width: 200rpx;
				height: 200rpx;
				border-radius: 32rpx;
			}

			.info {
				flex: 1;
				padding: 0 24rpx;

				.title {
					font-weight: bold;
				}

				.txt {
					color: #666;
					font-size: 26rpx;
					margin-top: 16rpx;
				}
			}

			.status {
				border: #f3a73f 1rpx solid;
				border-radius: 16rpx;
				overflow: hidden;
				text-align: center;
				width: 150rpx;
				font-size: 26rpx;

				.a {
					height: 88rpx;
					line-height: 88rpx;
					background: #f3a73f;
					color: #fff;
				}

				.b {
					height: 48rpx;
					line-height: 48rpx;
					color: #f3a73f;
				}

				&.active {
					border: #e43d33 1rpx solid;

					.a {
						background: #e43d33;
					}

					.b {
						color: #e43d33;
					}
				}
			}
		}

		.t2 {
			display: flex;
			align-items: center;
			font-size: 26rpx;
			margin-top: 16rpx;

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
					width: 36rpx;
					height: 36rpx;
					background: #dfdfdf;

					&.active {
						background: #e43d33;
					}
				}

				.txt {
					text-align: center;
					font-size: 16rpx;
				}
			}
		}
	}

	.content-title {
		padding: 16rpx;
	}

	.content {
		padding: 0 16rpx 16rpx 16rpx;
	}

	.popupWifi {
		padding: 64rpx 64rpx 0 64rpx;

		.t {
			text-align: center;
			font-weight: bold;
			font-size: 30rpx;
		}

		.ssid {
			margin-top: 64rpx;
		}

		.pwd {
			margin-top: 16rpx;
		}

		.btns {
			display: flex;
			justify-content: space-between;
			margin-top: 64rpx;

			.btn {
				flex: 1;
			}

			.btn2 {
				flex: 1;
				padding-left: 32rpx;
			}
		}
	}
</style>