<template>
	<view v-if="resData" class="about">
		<view class="content">
			<mp-html :content="resData.info.content" />
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				key: undefined,
				resData: undefined,
			}
		},
		created() {
		
		},
		mounted() {
			
		},
		onReady() {
			
		},
		onLoad(e) {
			this.key = e.key
			this._cmsPage()
		},
		onShow() {

		},
		onShareAppMessage(e) {
			
		},
		methods: {
			async _cmsPage() {
				// https://www.yuque.com/apifm/nu0f75/utgp8i
				const res = await this.$wxapi.cmsPage(this.key)
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					uni.navigateBack()
					return
				}
				uni.setNavigationBarTitle({
					title: res.data.info.title
				})
				this.resData = res.data
			},
		}
	}
</script>
<style scoped lang="scss">
.about {
	.content {
		padding: 32rpx;
		font-size: 28rpx;
		line-height: 48rpx;
		color: #333;
	}
}
</style>
