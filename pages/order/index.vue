<template>
	<view class="order-list">
		<uni-segmented-control :current="current" :values="statusList" @clickItem="statusClick"
			styleType="text"></uni-segmented-control>
		<view class="line"></view>
		<page-box-empty v-if="!list || list.length == 0" title="暂无预定" :showBtn="false"></page-box-empty>
		<view v-for="(item,index) in list" class="orders">
			<view class="shop-status">
				<view class="shop" @click="goShop(item.shopId)">
					<uni-icons type="shop-filled"></uni-icons>
					<view class="name">{{ item.shopName }}</view>
					<uni-icons type="right"></uni-icons>
				</view>
				<view class="status">{{ item.statusStr }}</view>
			</view>
			<view class="line"></view>
			<view v-for="(item2,index2) in item.goods" class="goods">
				<view class="goods-info">
					<image class="img" :src="item2.pic" mode="aspectFill"></image>
					<view class="info">
						<view class="name">{{ item2.goodsName }}</view>
						<view class="time">下单时间:{{ item2.dateAdd }}</view>
						<view class="time">预定{{ item2.property }}</view>
					</view>
				</view>
			</view>
			<view class="line"></view>
			<view class="amount-btn">
				<view class="amount">总计￥<text>{{ item.amountReal }}</text></view>
				<view class="btns">
					<button v-if="item.status == 0" type="primary" size="mini" @click="pay(index)">支付</button>
					<button v-else-if="item.status == 1" type="primary" size="mini"
						@click="shopIotCmds(item.id, item.goods[0].goodsId)">开门</button>
					<button v-else type="warn" size="mini"
						@click="orderDelete(index)">删除</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const PAY = require('@/common/pay.js')
	export default {
		data() {
			return {
				statusList: ['全部', '待付款', '已预定', '已完成'],
				current: 0,
				list: undefined,
				page: 1,
			}
		},
		onLoad(e) {
			this.orderList()
		},
		onShow() {
			const refresh = wx.getStorageSync('order_refresh')
			if (refresh) {
				wx.removeStorageSync('order_refresh')
				this.current = 0
				this.page = 1
				this.orderList()
			}
		},
		onReachBottom() {
			this.page++
			this.orderList()
		},
		onPullDownRefresh() {
			wx.stopPullDownRefresh()
			this.page = 1
			this.orderList()
		},
		methods: {
			statusClick(e) {
				this.current = e.currentIndex
				this.page = 1
				this.orderList()
			},
			async orderList() {
				const d = {
					token: this.token,
					page: this.page,
					showShopInfo: true,
				}
				if (this.current == 0) {
					d.statusBatch = '0,1,2,3,4'
				} else if (this.current == 1) {
					d.status = 0
				} else if (this.current == 2) {
					d.status = 1
				} else if (this.current == 3) {
					d.statusBatch = '2,3,4'
				}
				// https://www.yuque.com/apifm/nu0f75/uwggsm
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.orderList(d)
				uni.hideLoading()
				if (res.code == 0) {
					res.data.orderList.forEach(ele => {
						ele.shopInfo = res.data.shopMap[ele.shopId]
						ele.goods = res.data.goodsMap[ele.id]
						if (ele.status == 1) {
							ele.statusStr = '预定成功'
						} else if (ele.status > 1) {
							ele.statusStr = '已完成'
						}
					})
					if (this.page == 1) {
						this.list = res.data.orderList
					} else {
						this.list = this.list.concat(res.data.orderList)
					}
				} else {
					if (this.page == 1) {
						this.list = null
					} else {
						uni.showToast({
							title: '没有更多了~',
							icon: 'none'
						})
					}
				}
			},
			async pay(index) {
				// https://www.yuque.com/apifm/nu0f75/wrqkcb
				let res = await this.$wxapi.userAmount(this.token)
				let balance = 0
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
				balance = res.data.balance
				const orderInfo = this.list[index]
				const needPay = (orderInfo.amountReal - balance).toFixed(2)
				if (needPay <= 0) {
					// 直接调用支付接口 https://www.yuque.com/apifm/nu0f75/lwt2vi
					const res = await this.$wxapi.orderPay(this.token, orderInfo.id)
					if (res.code != 0) {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: '支付成功'
						})
						this.statusClick({
							currentIndex: 0
						})
					}
				} else {
					// 发起在线支付
					PAY.pay('wxpay', {
						appid: getApp().globalData.wxpayOpenAppId
					}, needPay, '支付订单 ：' + orderInfo.id, '支付订单 ：' + orderInfo.id, {
						type: 0,
						id: orderInfo.id
					}, () => {
						this.statusClick({
							currentIndex: 0
						})
					}, (err) => {
						uni.showToast({
							title: '支付失败',
							icon: 'none'
						})
					})
				}
			},
			async _shopIotDevices(orderId) {
				// https://www.yuque.com/apifm/nu0f75/ibg4icu15di25hfc
				const res = await this.$wxapi.shopIotDevices({
					token: this.token,
					orderId
				})
				if (res.code == 0) {
					const shopIotDevices = res.data
					const devices = []
					res.data.forEach(ele => {
						devices.push(ele.name)
					})
					uni.showActionSheet({
						itemList: devices,
						success: res => {
							this.shopIotCmds(orderId, shopIotDevices[res.tapIndex])
						},
					})
				} else {
					uni.showModal({
						content: '当前时段无法开门',
						showCancel: false
					})
				}
			},
			goShop(shopId) {
				this.vuex('shopId', shopId)
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			async shopIotCmds(orderId, goodsId) {
				// https://www.yuque.com/apifm/nu0f75/rek5dwng8b9cdoko
				const res = await this.$wxapi.shopIotCmds({
					token: this.token,
					orderId,
					goodsId: goodsId
				})
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
					return
				}
				const cmds = []
				const cmdList = res.data
				res.data.forEach(ele => {
					cmds.push(ele.name)
				})
				uni.showActionSheet({
					itemList: cmds,
					success: res => {
						this.cmdSelect(orderId, goodsId, cmdList[res.tapIndex])
					},
				})
			},
			async cmdSelect(orderId, goodsId, cmd) {
				// https://www.yuque.com/apifm/nu0f75/uq495hlq3ho5kw4t
				const res = await this.$wxapi.shopIotExecute({
					token: this.token,
					orderId,
					goodsId,
					topic: cmd.topic,
					cmdId: cmd.id,
				})
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				} else {
					uni.showToast({
						title: '已发送',
					})
				}
			},
			orderDelete(index) {
				uni.showModal({
					content: '确认要删除订单吗？',
					success: res => {
						if (res.confirm) {
							this._orderDelete(index)
						}
					}
				})
			},
			async _orderDelete(index) {
				const item = this.list[index]
				// https://www.yuque.com/apifm/nu0f75/eex4bb
				uni.showLoading({
					title: ''
				})
				const res = await this.$wxapi.orderDelete(this.token, item.id)
				uni.hideLoading()
				if (res.code != 0) {
					uni.showModal({
						content: res.msg,
						showCancel: false
					})
				} else {
					uni.showToast({
						title: '已删除',
					})
					this.list.splice(index, 1)
				}
			},
		}
	}
</script>
<style scoped lang="scss">
	.order-list {}

	.orders {
		box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
		margin-bottom: 32rpx;
		padding-top: 32rpx;

		.shop-status {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;
			padding: 16rpx 32rpx;

			.shop {
				display: flex;
				flex: 1;
				align-items: center;

				.name {
					padding: 0 8rpx;
					font-size: 26rpx;
				}
			}

			.status {
				color: #999;
				font-size: 26rpx;
			}
		}

		.amount-btn {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 16rpx 32rpx;

			.amount {
				color: #e43d33;
				font-size: 26rpx;

				text {
					font-size: 36rpx;
				}
			}
		}
	}

	.goods {
		padding: 32rpx;

		.goods-info {
			display: flex;
			padding-top: 16rpx;

			.img {
				width: 140rpx;
				height: 140rpx;
				border-radius: 16rpx;
			}

			.info {
				flex: 1;
				padding-left: 16rpx;

				.name {
					font-size: 28rpx;
					font-weight: bold;
				}

				.time {
					color: #999;
					font-size: 26rpx;
					margin-top: 16rpx;
				}
			}
		}
	}
</style>