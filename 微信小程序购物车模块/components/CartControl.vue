<template>
  <div>
    <div
      class="itemReduce fx_ct"
      :class="{'rotate_x':item.quantity>0}"
      v-if="item.quantity>0"
      @tap.stop="goodsReduce(item)"
    ><span></span></div>
    <span
      class="num"
      v-if="item.quantity>0"
    >{{item.quantity}}</span>
    <img
      src="/static/img/goods_add.png"
      alt=""
      @tap.stop="goodsAdd(item)"
    >
  </div>
</template>

<script>
import { _throttle } from "@/utils/index";
import { addShopcart, editShopcart, deleteShopcart } from "@/api/shopCart";
import store from "@/pages/discovery/goods/store";
export default {
  data() {
    return {
      cartNum: 0 //购物车数量
    };
  },
  props: {
    item: {},
    currentId: {
      type: Number
    }
  },
  computed: {
    getCart() {
      return store.state.shopCartGoods;
    },
    category() {
      return store.state.category;
    },
    goods() {
      return store.state.drinkGoods;
    },
    CartNum() {
      return store.state.CartNum;
    }
  },
  onLoad() {},
  methods: {
    commonFun(item, type) {
      let arr = [];
      arr = this.category.concat();
      this.category.forEach((x, index) => {
        if (x.id === item.category_id) {
          this.currentId = index; //返回购物车中当前货物在category的索引
        }
      });
      this.goods.map(x => {
        if (x.goods_id == item.goods_id) {
          x.quantity = item.quantity;
        }
      });
      let categoryArr = this.category.concat();
      categoryArr.map((x, i) => {
        if (i === this.currentId) {
          if (type === "add") {
            return x.listNum++;
          } else {
            return x.listNum--;
          }
        }
      });
      store.commit("changeCategory", categoryArr); //修改左侧列表
      let cartSum = 0;
      this.category.map(x => {
        cartSum += Number(x.listNum);
      });
      store.commit("initShopCartNum", cartSum);
    },
    /**
     * 列表中点击商品减少
     */
    goodsReduce: _throttle(function(item) {
      if (item.quantity > 0) {
        item.quantity--;
      }
      let formData = {
        goods_id: +item.goods_id,
        quantity: item.quantity
      };

      //如果数量大于0就减少，为0 时，删除该商品
      if (item.quantity > 0) {
        editShopcart(formData).then(res => {
          if (res.code !== 200) {
            wx.showToast({
              title: res.message,
              icon: "none"
            });
          } else {
            this.commonFun(item, "reduce");
            store.dispatch("getShopcart");
          }
        });
      } else {
        if (this.getCart.length === 0) {
          store.commit("changeCartShow", false);
        }

        deleteShopcart({ goods_id: +item.goods_id }).then(res => {
          if (res.code !== 200) {
            wx.showToast({
              title: res.message,
              icon: "none"
            });
          } else {
            this.commonFun(item, "reduce");
            store.dispatch("getShopcart");
          }
        });
      }
    }, 500),
    /**
     * 列表中点击商品增加
     */
    goodsAdd: _throttle(function(item) {
      let formData = {
        goods_id: +item.goods_id,
        quantity: 1
      };
      addShopcart(formData).then(res => {
        if (res.code != 200) {
          wx.showToast({
            title: res.message,
            icon: "none"
          });
        } else {
          item.quantity++;
          this.commonFun(item, "add");
          store.dispatch("getShopcart");
        }
      });
    }, 500)
  }
};
</script>

<style scoped lang="scss">
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
  width: 48rpx;
  height: 48rpx;
}
.num {
  margin: 0 10rpx;
}
</style>