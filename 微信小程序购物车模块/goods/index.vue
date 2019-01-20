<template>
  <div class="goods wt">
    <div
      class="skeleton"
      v-if="!init"
    >
      <div class="header fx_sp">
        <div class="ske_left"></div>
        <div class="ske_right"></div>
      </div>
      <div class="ske_content">
        <div class="list_left"></div>
        <div class="list_right">
          <div class="item_header"></div>
          <div class="item"></div>
          <div class="item"></div>
          <div class="item"></div>
          <div class="item"></div>
          <div class="item"></div>
        </div>
      </div>
      <div class="good_shop_cart"></div>
    </div>
    <div class="list_header fx_sp">
      <div class="left cr_6 fw_5">
        商品
        <span></span>
      </div>
      <div class="right ">
        <img
          src="/static/img/goods_search.png"
          alt=""
        >
        <input
          type="text"
          placeholder="搜索"
          placeholder-style="color:#999"
          @tap.stop="tapSearch"
        >
      </div>
    </div>
    <div class="content">
      <scroll-view
        :scroll-y="true"
        class="ct cr_6 ft_4 menuList"
        :style="{'height': 'calc(100vh - 214rpx)'}"
      >
        <ul class="goodsName_list">
          <li
            v-for="(item,index) in category"
            :key="index"
            @tap="switchRightTab(index,item.id)"
            :class="{'selected':currentId===index}"
          >
            {{item.name}}
            <i
              class="cf"
              v-if="item.listNum>0"
            >{{item.listNum}}</i>
          </li>
        </ul>
      </scroll-view>
      <div class="category_title_main">
        <h2
          class="cr_6 fw_5 ft_4 category_right_title"
          v-if="category[currentId]"
        >{{category[currentId].name}}</h2>
      </div>
      <scroll-view
        :scroll-y="true"
        class="goodsList"
        :scroll-into-view="scrollTopId"
        :style="{'height': '100%'}"
      >

        <div
          class="goods"
          v-for="(item,index) in drinkGoods"
          :key="index"
          @tap="showGoodsDetsil(item.goods_id)"
        >
          <div class="goods_left">
            <img
              v-if="!!item.url"
              :src="item.url"
              alt=""
            >
            <div
              class="placeholder"
              v-else
            ></div>

          </div>
          <div class="goods_right">
            <p class="cr_3 fw_5 goods_name">{{item.goods_name}}</p>
            <p class="cr_9 ft_1">月销量{{item.sum}}</p>
            <div class="price_num fx_sp">
              <div class="price_num_left">￥{{item.price}}</div>
              <div class="price_num_right ">
                <app-cartcontrol
                  :item="item"
                  :currentId="currentId"
                ></app-cartcontrol>
              </div>
            </div>
          </div>
        </div>
      </scroll-view>
    </div>
    <div class="footer wt">
      <div class="foot_left fx_sp">
        <div
          class="sub_left"
          @tap="showShopCart"
        >
          <img
            src="/static/img/goods_car.png"
            alt=""
          >
          <span
            class="ct"
            v-if="CartNum>0"
          >{{CartNum}}</span>
        </div>
        <div class="sub_right">
          <span>合计:</span>
          <span class="money fw_5">￥{{totalMoney}}</span>
        </div>
      </div>
      <button
        class="foot_right ct fw_5 ft_6"
        @tap="confirmPay"
        v-if="CartNum>0"
      >
        <span>结算（{{CartNum}}）</span>

      </button>
      <div
        class="foot_right ct fw_5 noGoods cr_6 ft_6"
        v-else
      >
        <span>暂无</span>

      </div>
    </div>
    <div
      class="goodsDetail"
      v-if="goodsDetail"
    >
      <div
        class="shop_shadow"
        @tap="goodsDetail=false"
      ></div>
      <div class="goods_content ">
        <div class="container ft_4 wt">
          <img
            v-if="!!GoodObj.url"
            :src="GoodObj.url"
            alt=""
          >
          <div
            class="place"
            v-else
          >
          </div>
          <div class="detail">
            <p class="title">
              <span v-if="GoodObj.goods&&GoodObj.goods.goods_name">{{GoodObj.goods.goods_name}}</span>
            </p>
            <p class="info cr_6">月销{{GoodObj.sum}}</p>
            <p
              v-if="GoodObj.goods&&GoodObj.goods.itro"
              class="about"
              v-html="GoodObj.goods.itro"
            ></p>
          </div>
          <div class="goods_footer fx_sp ft_8 fw_5"><span v-if="GoodObj.goods&&GoodObj.goods.price">¥ {{GoodObj.goods.price}}</span>
            <div class="detail_right">
              <app-cartcontrol
                :item="detailObj"
                :currentId="currentId"
              ></app-cartcontrol>
            </div>
          </div>
        </div>
        <div
          class="detail_close fx_ct"
          @tap="goodsDetail=false"
        >
          <img
            src="/static/img/ic_close.png"
            alt=""
          >
        </div>
      </div>
    </div>

    <!-- 支付界面 -->
    <app-pop
      :isShow="isShow"
      @closeShadow="closeShadow($event)"
      :money="totalMoney"
      :orderId="orderId"
      @paySuccess="paySuccess($event)"
    ></app-pop>
    <app-shopCart v-if="stateShopCartShow"></app-shopCart>
  </div>
</template>

<script>
import Popup from "@/components/Popup";
import CartControl from "@/components/CartControl";
import ShopCart from "@/components/ShopCart";
import { emptyShopcart } from "@/api/shopCart";
import { categoryList, categoryDetail, goodsDetailFun } from "@/api/goods";
import { orderSubmit } from "@/api/order";
import store from "./store";
import { setTimeout } from "timers";
export default {
  components: {
    "app-pop": Popup,
    "app-shopCart": ShopCart,
    "app-cartcontrol": CartControl
  },
  data() {
    return {
      init: false, //初始化
      currentId: 0, //当前索引
      isShow: false, //是否显示支付遮罩层
      goodsDetail: false, //商品明细
      copyGoods: [],
      isFocus: false, //是否聚焦输入框
      orderId: "",
      room_id: 0,
      pageSize: 10,
      total: 0,
      Categorytotal: [], //当前类的总数量
      page: 0, //当前类的当前页数
      categoryId: 0, //当前分类的Id
      GoodObj: {}, //当前商品的明细
      detailObj: {}
    };
  },
  onReachBottom() {
    // 如果当前总数/当前页的最大数量>当前的页数，则可以下拉

    if (this.total > this.pageSize * this.page) {
      this.page++;
      wx.showLoading({
        title: "拼命加载中..."
      });
      let form = {
        category_id: this.categoryId,
        page: this.page,
        pageSize: this.pageSize
      };
      categoryDetail(form).then(res => {
        const data = res.data;
        if (res.code === 200) {
          data.items.forEach(a => {
            Object.assign(a, {
              sum: Number(a.default_sale_sum) + Number(a.sale_sum)
            });
          });
          store.commit("pushGoods", data.items);
        }
        wx.hideLoading();
      });
    }
  },
  onShow() {},
  onLoad(options) {
    store.dispatch("getShopcart");
    let room = "";
    console.log(options);
    if (options.scene) {
      room = options.scene;
      let index = room.indexOf("D") + 1;
      this.room_id = options.scene.substring(index);
    }
    if (options.room_id) {
      this.room_id = options.room_id;
    }
    console.log(this.room_id);
    wx.showLoading({
      title: "拼命加载中..."
    });
    categoryList().then(res => {
      const data = res.data.items;
      if (res.code === 200) {
        this.page = +res.data.page;
        this.pageSize = +res.data.page_size;
        data.category.map((x, index) => {
          let form = {
            category_id: x.id
          };
          Object.assign(x, { listNum: 0 });
          if (this.shopCartGoods.length > 0) {
            this.shopCartGoods.forEach(v => {
              if (v.category_id === x.id) {
                x.listNum += Number(v.quantity);
              }
            });
          }
        });
        data.goods.forEach(a => {
          Object.assign(a, {
            sum: Number(a.default_sale_sum) + Number(a.sale_sum)
          });
        });
        store.commit("initGoods", data.goods);
        store.commit("changeCategory", data.category);
        setTimeout(() => {
          this.init = true;
        }, 200);
      }
      wx.hideLoading();
    });
  },
  computed: {
    stateShopCartShow() {
      return store.state.isCartShow;
    },
    category() {
      return store.state.category;
    },
    drinkGoodsCopy() {
      return store.state.drinkGoodsCopy;
    },
    drinkGoods() {
      return store.state.drinkGoods;
    },
    CartNum() {
      return store.state.CartNum;
    },
    shopCartGoods() {
      return store.state.shopCartGoods;
    },
    totalMoney() {
      let sum = 0;
      this.shopCartGoods.forEach((item, index) => {
        sum += Number(item.price) * Number(item.quantity);
      });
      return sum.toFixed(2);
    }
  },
  methods: {
    /**
     * 支付成功回调
     */
    paySuccess(status) {
      if (status) {
        store.commit("getCart", []);
        store.commit("initShopCartNum", 0); //清空购物车数量
        let caregoryCopy = this.category;
        caregoryCopy.map(x => {
          x.listNum = 0;
        });
        store.commit("changeCategory", caregoryCopy); //清空列表上的数量
        // emptyShopcart();
        this.hideShopCart();
      }
    },
    tapSearch() {
      wx.navigateTo({
        url: "./goodsSearch/main"
      });
    },
    showShopCart() {
      store.commit("changeCartShow", true);
    },
    /**
     * 显示商品明细
     */
    showGoodsDetsil(id) {
      this.goodsDetail = true;
      let form = {
        goods_id: id
      };
      goodsDetailFun(form).then(res => {
        const data = res.data.data;
        if (res.code === 200) {
          this.GoodObj = data;
          Object.assign(
            this.GoodObj,
            {
              url: Object.values(data.img_path[0])[0]
            },
            {
              sum:
                Number(this.GoodObj.goods.default_sale_sum) +
                Number(this.GoodObj.goods.sale_sum)
            }
          );
          this.GoodObj.goods.goods_id = +this.GoodObj.goods.id;
          this.detailObj = this.GoodObj.goods;
        }
      });
    },
    /**
     * 点击左侧列表右边跳转到对应位置
     */
    switchRightTab(index, id) {
      this.page = 1;
      this.currentId = index; //
      this.categoryId = this.category[index].id;
      this.getDetail();
    },
    /**
     * 获取分类商品
     */
    getDetail() {
      wx.showLoading({
        title: "拼命加载中..."
      });
      let form = {
        category_id: this.categoryId,
        page: this.page,
        pageSize: this.pageSize
      };
      categoryDetail(form).then(res => {
        const data = res.data;
        if (res.code === 200) {
          this.total = +data.count;
          this.page = +data.page;
          this.pageSize = +data.page_size;
          data.items.forEach(a => {
            Object.assign(a, {
              sum: Number(a.default_sale_sum) + Number(a.sale_sum)
            });
          });
          store.commit("initGoods", data.items);
        }
        wx.hideLoading();
      });
    },
    /**
     * 支付
     */
    confirmPay() {
      this.isShow = true;
      let type = wx.getStorageSync("currentType");
      let formData = {
        room_id: +this.room_id,
        pay_type: 1,
        mobile: "",
        discounts: 0,
        name: "",
        comment: "",
        goods: []
      };
      this.shopCartGoods.forEach((item, index) => {
        formData.goods[index] = {
          goods_id: +item.goods_id,
          quantity: +item.quantity,
          product_price: +item.price,
          discount_price: 0
        };
      });
      orderSubmit(formData).then(res => {
        const data = res.data;
        if (res.code == 200) {
          this.orderId = data;
        } else {
          wx.showToast({
            title: data.message,
            icon: "none"
          });
        }
      });
    },
    //
    closeShadow(e) {
      this.isShow = e;
    }
  }
};
</script>

<style scoped lang="scss">
.skeleton {
  margin-top: -80rpx;
  .header {
    padding: 10rpx 20rpx;
    .ske_left {
      width: 128rpx;
      height: 60rpx;
      background: #eaeaeab3;
    }
    .ske_right {
      width: 128rpx;
      height: 60rpx;
      background: #eaeaeab3;
    }
  }
  .ske_content {
    display: flex;
    .item_header {
      margin-top: -77rpx;
      margin-bottom: 15px;
      width: 128rpx;
      height: 60rpx;
      background: #eaeaeab3;
    }
    .list_left {
      width: 148rpx;
      background: #eaeaeab3;
    }
    .list_right {
      flex: 1;
      margin: 80rpx 0 0 20rpx;
      .item {
        width: 560rpx;
        height: 150rpx;
        background: #eaeaeab3;
        margin-bottom: 40rpx;
      }
    }
  }
  .good_shop_cart {
    position: fixed;
    left: 0;
    right: 0;
    height: 100rpx;
    bottom: 0;
    background: #eaeaeab3;
  }
}
.goods {
  padding-top: 112rpx;
  .list_header {
    position: fixed;
    background: white;
    left: 0;
    right: 0;
    top: 0;
    padding: 30rpx 20rpx 20rpx 30rpx;
    border-bottom: 1px solid #d3d3d3;
    box-sizing: border-box;
    height: 112rpx;
    line-height: 112rpx;
    z-index: 100;
    .left {
      span {
        position: absolute;
        width: 64rpx;
        left: 30rpx;
        right: 0;
        bottom: 0;
        height: 4rpx;
        background: #78b0fa;
      }
    }
    .right {
      display: flex;
      align-items: center;
      background: #f4f4f4;
      border-radius: 26rpx;
      img {
        width: 36rpx;
        height: 36rpx;
        vertical-align: middle;
        margin-left: 16rpx;
      }
      input {
        width: 100rpx;
        border-radius: 26rpx;
        vertical-align: middle;
        padding: 4rpx 12rpx;
      }
      .widther {
        width: 430rpx;
        transition: 0.3s ease;
      }
      .widths {
        width: 100rpx;
        transition: 0.3s ease;
      }
    }
  }
  .content {
    display: flex;
    padding-bottom: 100rpx;
    .menuList {
      width: 148rpx;
      background: #f8f8f9;
      position: fixed;
      left: 0;
      right: 0;
      // min-height: 1070rpx;
      li {
        padding: 18rpx 0;
      }
      .selected {
        background: white;
        font-weight: 500;
        color: #333;
      }
    }
    .goodsList {
      padding-top: 74rpx;
      margin-left: 158rpx;
      min-height: 1070rpx;
      h2 {
        position: sticky;
        top: 0;
        z-index: 100;
        padding: 20rpx;
      }
      .goods {
        display: flex;
        padding: 20rpx 36rpx 20rpx 0;
        margin-bottom: 20rpx;
      }
      .goods_left {
        width: 180rpx;
        img,
        .placeholder {
          width: 150rpx;
          height: 150rpx;
        }
        .placeholder {
          background: grey;
        }
      }
      .goods_right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        p:first-of-type {
          font-weight: bold;
        }
        img {
          width: 48rpx;
          height: 48rpx;
        }
        .price_num {
          .price_num_left {
            color: #f35556;
            width: 200rpx;
          }
          .price_num_right {
            flex: 1;
            overflow: hidden;
            text-align: right;
            .itemReduce {
              vertical-align: middle;
              display: inline-block;
              background: #f4f4f4;
              width: 48rpx;
              height: 48rpx;
              line-height: 48rpx;
              border-radius: 50%;
              transform: translateX(0rpx);
              text-align: center;
              span {
                display: inline-block;
                width: 24rpx;
                height: 4rpx;
                background: #dadada;
                vertical-align: middle;
              }
            }
            img {
              vertical-align: middle;
            }
            .num {
              margin: 0 10rpx;
            }
          }
        }
      }
    }
  }
  .footer {
    border-top: 1px solid #e6e6e6;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    z-index: 150;
    box-sizing: border-box;
    padding-left: 48rpx;
    .foot_left {
      flex: 1;
      img {
        width: 58rpx;
        height: 58rpx;
      }
      .sub_left {
        position: relative;
        padding: 16rpx;
        span {
          position: absolute;
          top: 14rpx;
          right: -18rpx;
          background: #ffe220;
          width: 30rpx;
          height: 30rpx;
          line-height: 30rpx;
          transform: translate(-50%);
          border-radius: 50%;
          font-size: 20rpx;
        }
      }
      .sub_right {
        padding-right: 32rpx;
        span:first-of-type {
          color: #9e9e9e;
        }
        .money {
          color: #f35556;
        }
      }
    }
    .foot_right {
      background: #ffe220;
      width: 226rpx;
      height: 100rpx;
      line-height: 100rpx;
      font-weight: bold;
    }
    .noGoods {
      background: #f2f2f2;
    }
  }
}

.goodsDetail {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  .goods_content {
    position: absolute;
    left: 40rpx;
    top: 62rpx;
    right: 40rpx;
    .place {
      height: 502rpx;
      background-color: rgba(255, 255, 255, 0.3);
    }
    .detail {
      padding: 20rpx 16rpx;
      .info {
        margin: 2rpx 0 16rpx 0;
      }
    }
    .title,
    .about {
      color: #3b3b36;
    }
    img {
      width: 100%;
      height: 502rpx;
    }
    .goods_footer {
      margin-top: 80rpx;
      padding: 16rpx 32rpx;
      background: #fafafa;
      .itemReduce {
        vertical-align: middle;
        display: inline-block;
        background: #f4f4f4;
        width: 48rpx;
        height: 48rpx;
        line-height: 48rpx;
        border-radius: 50%;
        transform: translateX(0rpx);
        text-align: center;
        span {
          display: inline-block;
          width: 24rpx;
          height: 4rpx;
          background: #dadada;
          vertical-align: middle;
        }
      }
      span {
        color: #e9253d;
      }
      .num {
        margin: 0 10rpx;
        color: #3b3b36;
      }
      img {
        width: 48rpx;
        vertical-align: middle;
        height: 48rpx;
      }
    }
  }
  .detail_close {
    position: absolute;
    left: 0;
    right: 0;
    width: 62rpx;
    height: 62rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    margin: 48rpx auto 12rpx;
    img {
      width: 26rpx;
      height: 26rpx;
    }
  }
}
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}
.shop_shadow {
  background: rgba(0, 0, 0, 0.3);
  height: 100vh;
}
.goodsName_list {
  li {
    position: relative;
    i {
      position: absolute;
      right: 0;
      top: 4rpx;
      width: 32rpx;
      margin: 0 auto;
      height: 32rpx;
      line-height: 32rpx;
      border-radius: 50%;
      background: #f35556;
      font-size: 20rpx;
    }
  }
}
.up {
  transform: translateY(0%) !important;
  transition: 0.3s linear;
  opacity: 1;
}
.down {
  transform: translateY(100%) !important;
  transition: 0.3s linear;
  opacity: 0;
}
.rotate_x {
  transform: translateX(88) rotate(180deg);
  transition: all 0.5s linear;
}
.category_title_main {
  position: fixed;
  left: 148rpx;
  top: 112rpx;
  height: 74rpx;
  right: 0;
  line-height: 74rpx;
  background: white;
  z-index: 100;
  .category_right_title {
    margin-left: 20rpx;
  }
}
button {
  border-radius: 0;
}
</style>