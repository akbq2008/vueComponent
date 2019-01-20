<template>
  <div class="pay_container pay">
    <div
      class="inner"
      :class="{'up':isShow,'down':!isShow}"
    >
      <div
        class="shadow"
        @tap="close"
      > </div>
      <div class="pay_main wt">
        <div class="header ct cr_3">
          <img
            src="/static/img/close.svg"
            alt=""
            @tap="close"
          >
          <p class="title ft_8 fw_5">支付</p>
          <p class="ft_4 fw_5">订单总价</p>
          <p class="money">￥{{money}}</p>
        </div>
        <div class="pay_way">
          <p class="cr_9 pay_title">支付方式</p>
          <div
            class="cr_3 fx_sp item"
            @tap="currentPay=1"
          >
            <div class="sub_left"><img
                src="/static/img/pay_wechat.png"
                alt=""
              ><span>微信支付</span></div>
            <div class="sub_right">
              <img
                src="/static/img/pay_true.png"
                alt=""
                v-if="currentPay===1"
              >
              <img
                src="/static/img/pay_false.png"
                alt=""
                v-if="currentPay===3"
              >
            </div>
          </div>
          <div
            class="cr_3 fx_sp item"
            @tap="currentPay=3"
            v-if="isWechat"
          >
            <div class="sub_left"><img
                src="/static/img/pay_pocket.png"
                alt=""
              ><span>钱包支付</span></div>
            <div class="sub_right">
              <img
                src="/static/img/pay_true.png"
                alt=""
                v-if="currentPay===3"
              >
              <img
                src="/static/img/pay_false.png"
                alt=""
                v-if="currentPay===1"
              >
            </div>
          </div>
        </div>
        <div class="btn">
          <button
            class="cr_3 fw_5"
            @tap="pay"
          >确认支付{{money}}元</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { balancePay, wechatPay } from "@/api/recharge";
import { wxLogin } from "@/utils/index";
export default {
  data() {
    return {
      isLoadig: false
    };
  },
  props: {
    TypeInfo: {
      type: String,
      default: "1"
    },
    //支付类型1.订单支付，2.充值  3.打赏
    isShow: {
      type: Boolean
    },
    money: {
      type: Number
    },
    orderId: {
      type: String
    }, //订单号
    isWechat: {
      type: Boolean,
      default: true
    } //是否只允许微信支付
  },
  onLoad() {
    wx.setStorageSync("currentType", this.currentPay);
  },
  data() {
    return {
      currentPay: 1 //1.微信支付，2.支付宝支付 3.余额支付
    };
  },
  methods: {
    close() {
      this.isShow = false;
      this.$emit("closeShadow", this.isShow);
    },
    pay() {
      this.isLoadig = true;
      let userInfo = wx.getStorageSync("userInfo");
      let formData = {
        type: this.TypeInfo,
        pay_type: this.currentPay + "",
        user_id: userInfo.userId,
        order_id: this.orderId
      };
      //微信支付
      if (this.currentPay === 1) {
        let jsCode = "";
        //获取jsCode
        let _this = this;
        wxLogin().then(res => {
          jsCode = res.code;
          Object.assign(formData, { jsCode: jsCode });
          wechatPay(formData)
            .then(res => {
              let data = JSON.parse(res.data);
              wx.requestPayment({
                appId: data.appId,
                timeStamp: data.timeStamp + "",
                nonceStr: data.nonceStr,
                package: data.package,
                signType: data.signType,
                paySign: data.paySign,
                success(res) {
                  _this.$emit("paySuccess", true, _this, this);
                  wx.showToast({
                    title: "支付成功",
                    icon: "none"
                  });
                  wx.navigateTo({
                    url: "/pages/discovery/pay/main"
                  });
                },
                fail(res) {
                  wx.showToast({
                    title: "支付失败",
                    icon: "none"
                  });
                }
              });
            })
            .then(() => {
              this.isLoadig = false;
            });
        });
      } else if (this.currentPay === 3) {
        //余额支付
        balancePay(formData).then(res => {
          if (res.code === 200 && res.data) {
            wx.showToast({
              title: "支付成功",
              icon: "none"
            });
            wx.navigateTo({
              url: "/pages/discovery/pay/main"
            });
            this.$emit("paySuccess", true);
            this.close();
          } else {
            wx.showToast({
              title: "支付失败",
              icon: "none"
            });
          }
          this.isLoadig = false;
        });
      }
    }
  }
};
</script>

<style scoped lang="scss">
.pay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  transform: translateY(100%);
  .up {
    transform: translateY(-100%) !important;
    transition: 0.3s linear;
    opacity: 1;
  }
  .down {
    transform: translateY(100%) !important;
    transition: 0.3s linear;
    opacity: 0;
  }
  .btn {
    margin-top: 140rpx;
    button {
      margin: 0 50rpx 86rpx;
      background: #ffe220;
    }
  }
  .shadow {
    height: 30vh;
    background: rgba(0, 0, 0, 0.3);
  }
  .inner {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .pay_main {
    padding-bottom: 86rpx;
    .title {
      padding: 20rpx 0 48rpx;
    }
    .money {
      font-size: 60rpx;
      margin-top: 34rpx;
      line-height: 84rpx;
    }
    .header {
      position: relative;
      img {
        width: 28rpx;
        height: 28rpx;
        position: absolute;
        left: 40rpx;
        top: 30rpx;
      }
    }
    .pay_way {
      padding: 66rpx 54rpx 0;
      span,
      img {
        vertical-align: middle;
      }
      .pay_title {
        border-bottom: 1px solid #ececec;
        padding-bottom: 20rpx;
      }
      .item {
        padding: 20rpx 0;
        border-bottom: 1px solid #ececec;
      }
      .sub_left {
        img {
          width: 38rpx;
          height: 38rpx;
          margin-right: 12rpx;
          vertical-align: middle;
        }
        span {
          vertical-align: middle;
        }
      }
      .sub_right {
        img {
          width: 52rpx;
          height: 52rpx;
        }
      }
    }
  }
}
</style>