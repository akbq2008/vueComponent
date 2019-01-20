<template>
  <div>
    <div class="search_input">
      <input
        type="text"
        placeholder="请输入搜索关键词"
        @input="inputFun"
        v-model="searchCotent"
      >
      <!-- <button class="cr_9">搜索</button> -->
      <img
        v-show="isShowClear"
        @tap="clearInput"
        src="/static/img/close.svg"
        alt=""
      >
    </div>
    <div class="search_result">
      <scroll-view
        :scroll-y="true"
        class="inner"
      >
      </scroll-view>
    </div>
    <div
      class="goods"
      v-for="(item,index) in hotGoods"
      :key="index"
    >
      <div class="goods_left">
        <img
          :src="item.goods_url"
          alt=""
        >
      </div>
      <div class="goods_right">
        <p class="cr_3 fw_5">{{item.goods_name}}</p>
        <p class="cr_9 ft_1">月销量{{item.sum}}</p>
        <div class="price_num fx_sp">
          <div class="price_num_left">￥{{item.price}}</div>
          <div class="price_num_right ">
            <app-cartcontrol
              :item="item"
              :currentId="item.currentId"
            ></app-cartcontrol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { searchGoods, categoryList } from "@/api/goods";
import CartControl from "@/components/CartControl";
import { _debounce } from "@/utils/index";
import store from "../store";
export default {
  components: {
    "app-cartcontrol": CartControl
  },
  data() {
    return {
      hotGoods: [], //热门商品
      isShowClear: false, //是否显示清空
      searchCotent: "", //搜索内容
      category: []
    };
  },
  onShow() {
    categoryList().then(res => {
      if (res.code === 200) this.category = res.data.items.category;
    });
  },
  onLoad() {
    this.hotGoods = [];
    this.searchCotent = "";
    this.isShowClear = false;
  },
  computed: {
    shopCartGoods() {
      return store.state.shopCartGoods;
    },
    goodsCopy() {
      return store.state.drinkGoodsCopy;
    }
  },
  methods: {
    //输入时
    inputFun: _debounce(function(e) {
      this.hotGoods = [];
      this.searchCotent = e.mp.detail.value;
      wx.showLoading({
        title: "拼命加载中..."
      });
      this.searchCotent
        ? (this.isShowClear = true)
        : (this.isShowClear = false);
      let formData = {
        search: e.mp.detail.value
      };
      searchGoods(formData).then(res => {
        const data = res.data;
        if (res.code === 200) {
          console.log(this.category, this.shopCartGoods);
          data.items.forEach((x, index) => {
            this.category.forEach((item, y) => {
              if (item.id == x.category_id) {
                Object.assign(x, { currentId: y }, { goods_id: x.id });
              }
            });
            if (this.shopCartGoods.length > 0) {
              this.shopCartGoods.forEach((item, y) => {
                if (item.goods_id == x.id) {
                  x.quantity = Number(item.quantity);
                }
              });
            }
            x.quantity = Number(x.quantity);
            x.sum = Number(x.default_sale_sum) + Number(x.sale_sum);
          });

          this.hotGoods = data.items;
        }
      });
      wx.hideLoading();
    }, 1000),
    //清空输入
    clearInput() {
      this.isShowClear = false;
      this.searchCotent = ""; //
      this.hotGoods = [];
    }
  }
};
</script>

<style scoped lang="scss">
.search_input {
  position: relative;
  background: #f2f2f2;
  padding: 10rpx 8rpx;
  display: flex;
  justify-content: space-between;
  font-size: 0;
  img {
    position: absolute;
    right: 30rpx;
    top: 22rpx;
    width: 32rpx;
    height: 32rpx;
  }
  input {
    height: 56rpx;
    line-height: 56rpx;
    font-size: 28rpx;
    padding-left: 80rpx;
    padding-right: 74rpx;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkBAMAAAATLoWrAAAAJ1BMVEVHcEyZmZmZmZmampqZmZmZmZmZmZmZmZmZmZmampqZmZmZmZmZmZnfJ2vTAAAADHRSTlMAF/Uv6IuaxbNI1mUPqdtRAAABK0lEQVQoz2NgAAHOdCeVso0MSEBM5wwQHGpGiLACRQ6BRBNhIow1Z45vZmCwbjpzxAAqZHLmOJjJmHNGE6rI59AGCIvT5xBEGfsZZ5gRUmccwXTMIQO4qT4nwJTOaYTdRmcmAEm2MwVIzgFzmM4YIIQYdQ4DyTnHkf2RcxREnEYWAiuoOYwsxHQISPgcQBbiOiPAwKCjgCzEDrIMixAWjViMR3WEDcgRe04gC8WAnCqE4iGfw2BvN6B7m/nMSYSQEDhwGHKOIIJwzQlo6C6ECUlAA5pZ58gEiAjzGpi5RmeOCYC1BZ05cxQuqTYRGGUhZ470nAmAJglg3HstARKNbDBlDBZnwKATaD1MGYN0y5kzHpvBDj+K8Iog1JNwZUheOoouxBBzDEOINQEAamlrYrcIoPwAAAAASUVORK5CYII=");
    background-repeat: no-repeat;
    background-size: 7% 70%;
    background-color: white;
    background-position: 14rpx center;
    flex: 1;
  }
  button {
    font-size: 28rpx;
    width: 15vw;
    margin: 0;
    display: inline-block;
    height: 56rpx;
    line-height: 56rpx;
    background: #f2f2f2;
    padding: 0 4rpx;
    border: none;
  }
}
.search_result {
  background: white;
  .inner {
    padding: 0 20rpx;
  }
  .search_title {
    padding: 20rpx;
  }
  .hot {
    display: inline-block;
    padding: 4rpx 8rpx;
    background: #d8d8d8;
    margin-right: 26rpx;
    margin-bottom: 10rpx;
  }
}
.goods {
  display: flex;
  padding: 20rpx 36rpx;
  margin-bottom: 20rpx;
}
.goods_left {
  width: 180rpx;
  img {
    width: 150rpx;
    height: 150rpx;
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
</style>