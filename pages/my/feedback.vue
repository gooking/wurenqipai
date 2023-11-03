<template>
	<view>
		<view class="form-box">
			<uni-forms ref="form" :rules="rules" :model="form" :label-position="deviceType == 'pad' ? 'left' : 'top'" label-width="170rpx">
				<uni-forms-item label="姓名:" name="name">
					<uni-easyinput v-model="form.name" placeholder="如何称呼您" trim />
				</uni-forms-item>
				<uni-forms-item label="联系电话:" name="mobile">
					<uni-easyinput v-model="form.mobile" placeholder="方便我们与您联系" trim />
				</uni-forms-item>
				<uni-forms-item label="上传文件:">
					<uni-file-picker
						mode="grid"
						:auto-upload="false"
						@select="afterRead"
						@delete="deletePic"
					/>
				</uni-forms-item>
				<uni-forms-item label="反馈内容:" name="content">
					<uni-easyinput type="textarea" v-model="form.content" placeholder="请留下您的宝贵建议或意见～" trim />
				</uni-forms-item>
			</uni-forms>
		</view>
		<view class="submit-btn">
			<button type="primary" :loading="loading" @click="submit">提交反馈</button>
		</view>
	</view>
</template>

<script>
	const PAY = require('@/common/pay.js')
	export default {
		data() {
			return {
				fileList: [],
				balance: 0.00,
				rules: {
					name: {
						rules: [
							{
								required: true,
								errorMessage: '不能为空',
							}
						]
					},
					mobile: {
						rules: [
							{
								required: true,
								errorMessage: '不能为空',
							}
						]
					},
				},
				form: {
					name: null,
					mobile: null,
					content: null,
				},
				loading: false,
			}
		},
		created() {

		},
		mounted() {

		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onLoad(e) {},
		onShow() {

		},
		onShareAppMessage() {
			return {
				title: '意见反馈 - ' + this.sysconfigMap.mallName,
				path: '/pages/my/feedback?inviter_id=' + this.uid
			}
		},
		methods: {
			async afterRead(event) {
				console.log(event);
				this.fileList = this.fileList.concat(event.tempFiles)
			},
			deletePic(event) {
				const index = this.fileList.findIndex(ele => ele.path == event.tempFile.path)
				this.fileList.splice(index, 1)
			},
			submit() {
				console.log('this.fileList', this.fileList);
				this.$refs.form.validate().then(res => {
					this._submit()
				}).catch(errors => {
					uni.showToast({
						title: '表单请填写完整',
						icon: 'none'
					})
				})
			},
			async _submit() {
				this.loading = true
				const extJsonStr = {}
				extJsonStr['姓名'] = this.form.name
				extJsonStr['联系电话'] = this.form.mobile
				// 批量上传附件
				if (this.fileList) {
					for (let index = 0; index < this.fileList.length; index++) {
						const pic = this.fileList[index];
						const res = await this.$wxapi.uploadFile(this.token, pic.url)
						if (res.code == 0) {
							extJsonStr['file' + index] = res.data.url
						}
					}
				}
				const res = await this.$wxapi.addComment({
					token: this.token,
					type: 1,
					extJsonStr: JSON.stringify(extJsonStr),
					content: this.form.content
				})
				this.loading = false
				if (res.code == 0) {
					uni.showModal({
						showCancel: false,
						content: '提交成功',
						confirmText: '知道了',
						success: () => {
							uni.navigateBack()
						}
					})
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
		}
	}
</script>
<style scoped lang="scss">
	.form-box {
		padding: 32rpx;
	}
	.submit-btn {
		padding: 23rpx;
	}
</style>
