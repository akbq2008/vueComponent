<template>
  <div>
    <!-- 购物车 -->
    <div class="shopcart">
      <div
        class="shopCart_shadow"
        @tap="hideShopCart"
        v-if="stateShopCartShow"
      ></div>
      <div
        class="shopcart_main"
        :class="{'up':stateShopCartShow,'down':!stateShopCartShow}"
      >
        <div class="shop_header cr">
          <span
            class="empty"
            @tap="emptyShopCart"
          >
            <img
              src="/static/img/delete.svg"
              alt=""
            ><span class="cr_9">清空购物车</span>
          </span>
        </div>
        <scroll-view
          :scroll-y="true"
          class="shopCart_content"
          :style="{'max-height': '520rpx'}"
        >
          <div
            class="shopcart_container"
            v-for="(item,index) in shopCartGoods"
            :key="index"
          >
            <div class="shop_content wt">
              <div class="shop_left fx_sp">
                <span v-if="item.goods_name">{{item.goods_name}}</span>
                <span class="cr_3">￥{{item.price}}</span>
              </div>
              <div class="shop_right fx_sa">
                <app-cartcontrol
                  :item="item"
                  :currentId="-1"
                ></app-cartcontrol>
              </div>
            </div>
          </div>
        </scroll-view>
      </div>
    </div>
  </div>
</template>

<script>
import store from "@/pages/discovery/goods/store";
import { getShopcart } from "@/api/shopCart";
import { _throttle } from "@/utils/index";
import CartControl from "@/components/CartControl";
import {
  addShopcart,
  editShopcart,
  deleteShopcart,
  emptyShopcart
} from "@/api/shopCart";
import { categoryDetail } from "@/api/goods";
export default {
  components: {
    "app-cartcontrol": CartControl
  },
  data() {
    return {};
  },
  onLoad() {},
  computed: {
    drinkGoods() {
      return store.state.drinkGoods;
    },
    stateShopCartShow() {
      return store.state.isCartShow;
    },
    shopCartGoods() {
      return store.state.shopCartGoods;
    },
    category() {
      return store.state.category;
    }
  },
  methods: {
    /**
     * 清空购物车
     */
    emptyShopCart() {
      store.commit("getCart", []);
      store.commit("initShopCartNum", 0); //清空购物车数量
      let caregoryCopy = this.category;
      caregoryCopy.map(x => {
        x.listNum = 0;
      });
      store.commit("changeCategory", caregoryCopy); //清空列表上的数量
      this.drinkGoods.map(x => {
        x.quantity = 0;
      });
      emptyShopcart();
      this.hideShopCart();
    },
    /**
     * 隐藏购物车
     */
    hideShopCart() {
      store.commit("changeCartShow", false);
    }
  }
};
</script>

<style scoped lang="scss">
.shopcart {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  .shopCart_shadow {
    background: rgba(0, 0, 0, 0.3);
    height: 100vh;
  }
  .shopcart_main {
    position: absolute;
    bottom: 100rpx;
    left: 0;
    right: 0;
    max-height: 600rpx;
    .shop_header {
      height: 80rpx;
      line-height: 80rpx;
      background: #f4f4f4;
      .empty {
        display: inline-block;
        height: 100%;
      }
      img {
        width: 30rpx;
        height: 30rpx;
        vertical-align: middle;
      }
      span {
        vertical-align: middle;
        margin: 0 18rpx 0 14rpx;
      }
    }
    .shop_content {
      display: flex;
      align-items: center;
      .shop_left {
        flex: 1;
        padding-left: 18rpx;
      }
      .shop_right {
        width: 25vw;
        padding: 28rpx 18rpx;
        .reduce {
          background: #f4f4f4;
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          vertical-align: middle;
          span {
            display: inline-block;
            width: 24rpx;
            height: 4rpx;
            background: #dadada;
          }
        }
        // .num {
        //   margin: 0 32rpx;
        // }
        img {
          width: 48rpx;
          height: 48rpx;
          vertical-align: middle;
        }
      }
    }
  }
}
.shop_content {
  background: white;
}
</style>
