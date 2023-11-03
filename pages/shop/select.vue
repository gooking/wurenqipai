<template>
	<view class="shop-select">
		<uni-search-bar v-model="kw" placeholder="请输入关键词搜索" cancelButton="none" @confirm="search"></uni-search-bar>
		<page-box-empty v-if="!list || list.length == 0" title="暂无门店" :showBtn="false"></page-box-empty>
		<view class="list" v-for="(item,index) in list" :key="item.id" @click="select(item)">
			<view class="img-box">
				<image :src="item.pic" class="img" mode="widthFix"></image>
				<view class="opening-tag">
					<uni-tag v-if="item.isOpened" text="营业中" type="success"></uni-tag>
					<uni-tag v-else text="休息中" type="default"></uni-tag>
				</view>
				<view class="book">订</view>
			</view>
			<view class="info-box">
				<view class="l">
					<view class="title">{{ item.name }}</view>
					<view class="address">{{ item.address }}</view>
					<view class="address"><uni-icons type="location" size="20"></uni-icons> {{ item.distance }}km</view>
				</view>
				<view class="r">
					<uni-icons type="phone-filled" size="64rpx" color="#f3a73f"
						@click="makePhone(item.linkPhone)"></uni-icons>
					<view class="location" @click="openLocation(item)">导航</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				kw: undefined,
				page: 1,
				list: undefined,
				lat: undefined,
				long: undefined,
			}
		},
		onLoad() {
			getApp().getLocation().then(res => {
				this.lat = res.lat
				this.long = res.long
				this.fetchShops()
			})
		},
		onReachBottom() {
			this.page++
			this.fetchShops()
		},
		methods: {
			search() {
				this.page = 1
				this.fetchShops()
			},
			async fetchShops() {
				// https://www.yuque.com/apifm/nu0f75/vvgeq9
				const res = await this.$wxapi.fetchShops({
					page: this.page,
					k: this.kw ? this.kw : '',
					curlatitude: this.lat,
					curlongitude: this.long,
				})
				if (res.code == 0) {
					res.data.forEach(ele => {
						ele.isOpened = this.checkIsOpened(ele.openingHours)
						ele.distance = ele.distance.toFixed(2)
					})
					if (this.page == 1) {
						this.list = res.data
					} else {
						this.list = this.list.concat(res.data)
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
			select(item) {
				this.vuex('shopId', item.id)
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.shop-select {
		padding-bottom: 32rpx;
	}

	.list {
		box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
		margin: 0 32rpx 32rpx 32rpx;
		border-radius: 24rpx;
		overflow: hidden;

		.img-box {
			position: relative;

			.img {
				width: 100%;
			}

			.opening-tag {
				position: absolute;
				left: 32rpx;
				top: 32rpx;
			}

			.book {
				position: absolute;
				right: 32rpx;
				top: 50%;
				background: #18bc37;
				color: #fff;
				width: 88rpx;
				height: 88rpx;
				border-radius: 50%;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 36rpx;
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
	}
</style>