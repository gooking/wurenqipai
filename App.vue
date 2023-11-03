<script>
	const CONFIG = require('@/config.js')
	const WXAUTH = require('@/common/wxauth.js')
	export default {
		globalData: {
			long: undefined,
			lat: undefined,
			userDetail: undefined,
		},
		onLaunch() {
			this.$wxapi.init(CONFIG.subDomain)
			this.checkForUpdate(); // 检查新版本
			this.queryConfigBatch();
		},
		onShow(e) {
			if (e && e.query && e.query.inviter_id) {
				this.vuex('referrer', e.query.inviter_id)
			}
			this.autoLogin()
		},
		onHide() {
			console.log('App Hide')
		},
		onPageNotFound(e) {
			// 页面不存在 {path: '/1212', query: {a: '123'}, isEntryPage: true}
			console.error('页面不存在', e)
		},
		methods: {
			checkForUpdate() {
				// #ifdef MP
				const updateManager = uni.getUpdateManager();
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log(res.hasUpdate);
				});
				updateManager.onUpdateReady(function(res) {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
							}
						}
					});

				});
				updateManager.onUpdateFailed(function(res) {
					// 新的版本下载失败
				});
				// #endif
			},
			async queryConfigBatch() {
				const sysconfigkeys = CONFIG.sysconfigkeys
				if (!sysconfigkeys) {
					return
				}
				// https://www.yuque.com/apifm/nu0f75/dis5tl
				const res = await this.$wxapi.queryConfigBatch(sysconfigkeys)
				if (res.code == 0) {
					const sysconfigMap = {}
					res.data.forEach(config => {
						sysconfigMap[config.key] = config.value
					})
					this.vuex('sysconfigMap', sysconfigMap)
					uni.$emit('sysconfigOK', sysconfigMap)
					// uni.$on('sysconfigOK',data => {
					// 	console.log('监听到事件来自 update ，携带参数 msg 为：' + data.msg);
					// })

				}
			},
			getLocation() {
				const _this = this
				return new Promise(function(resolve, reject) {
					if (_this.globalData.lat && _this.globalData.long) {
						resolve({
							long: _this.globalData.long,
							lat: _this.globalData.lat
						})
						return
					}
					uni.showLoading({
						title: ''
					})
					uni.getFuzzyLocation({
						type: "gcj02", //默认为 wgs84 返回 gps 坐标
						success: res => {
							console.log("定位获取:", res);
							let platform = uni.getSystemInfoSync().platform;
							if (platform == "ios") {
								//toFixed() 方法可把 Number 四舍五入为指定小数位数的数字。
								_this.globalData.lat = res.latitude.toFixed(6)
								_this.globalData.long = res.longitude.toFixed(6)
								resolve({
									long: res.longitude.toFixed(6),
									lat: res.latitude.toFixed(6)
								})
							} else {
								_this.globalData.lat = res.latitude
								_this.globalData.long = res.longitude
								resolve({
									long: res.longitude,
									lat: res.latitude
								})
							}
						},
						fail: err => {
							console.error(err)
							reject(err)
							if (
								err.errMsg ===
								"getLocation:fail 频繁调用会增加电量损耗，可考虑使用 wx.onLocationChange 监听地理位置变化"
							) {
								uni.showToast({
									title: "请勿频繁定位",
									icon: "none",
								});
							} else if (err.errMsg === "getLocation:fail auth deny") {
								// 未授权
								uni.showToast({
									title: "无法定位，请重新获取位置信息",
									icon: "none",
								});
							} else if (
								err.errMsg ===
								"getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF"
							) {
								uni.showModal({
									content: "请开启手机定位服务",
									showCancel: false,
								});
							} else {
								uni.showModal({
									content: "无法获取手机定位 \n 请先确认定位服务是否已开启",
									showCancel: false,
								});
							}
						},
						complete: () => {
							uni.hideLoading()
						},
					});
				});
			},
			getDistance(lat1, lng1, lat2, lng2) {
			  var dis = 0;
			  var radLat1 = toRadians(lat1);
			  var radLat2 = toRadians(lat2);
			  var deltaLat = radLat1 - radLat2;
			  var deltaLng = toRadians(lng1) - toRadians(lng2);
			  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
			  return dis * 6378137;
			
			  function toRadians(d) {
			    return d * Math.PI / 180;
			  }
			},
			async autoLogin(force) {
				// 微信小程序自动登陆
				// #ifdef MP-WEIXIN
				const isLogined = await WXAUTH.checkHasLogined()
				if (!isLogined) {
					await WXAUTH.authorize()
				}
				setTimeout(() => {
					uni.$emit('loginOK', {})
				}, 500)
				// #endif
			},
			async userDetail() {
				const _this = this.$vm ? this.$vm : this
				// https://www.yuque.com/apifm/nu0f75/zgf8pu
				const res = await _this.$wxapi.userDetail(_this.token)
				if (res.code == 0) {
					_this.globalData.userDetail = res.data
				}
			},
		},
	}
</script>

<style>
	.line {
		height: 1rpx;
		background-color: #e5e5e5;
	}
</style>