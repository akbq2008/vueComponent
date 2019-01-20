import Vue from "vue";
import Vuex from "vuex";
import {
  getShopcart
} from '@/api/shopCart'
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isCartShow: false, //是否显示购物车
    shopCartGoods: [], //购物车中的商品
    category: [], //左侧列表
    drinkGoods: [], //全部的商品
    drinkGoodsCopy: [], //全部商品的备份
    CartNum: 0, // 购物车的数量
    // CATEGORY_ID: 0, //类Id
  },
  mutations: {
    // initCategory_id(s, p) {
    //   s.CATEGORY_ID = p;
    // },
    initGoodsCopy(s, p) {
      s.drinkGoodsCopy[p.index] = p.data;
    },
    pushGoods(s, p) {
      s.drinkGoods.push(...p);
    },
    initGoods(s, p) {
      s.drinkGoods = [];
      s.drinkGoods = p;
    },
    changeCartShow(state, payload) {
      state.isCartShow = payload;
    },
    getCart(s, p) {
      s.shopCartGoods = [];
      s.shopCartGoods = p;
    },
    pushToCart(s, p) {
      s.shopCartGoods.push(p);
    },
    changeCategory(s, p) {
      s.category = p;
    }, //更改左侧列表
    asyncGoods(s, p) {
      s.drinkGoods = p;
    },
    asyncGoodsCopy(s, p) {
      s.drinkGoodsCopy = p;
    },
    initShopCartNum(s, p) {
      s.CartNum = p;
    }
  },
  actions: {
    getShopcart({
      commit
    }) {
      return new Promise((resolve, reject) => {
        let form = {
          page: 1,
          page_size: 1000,
        }
        getShopcart(form)
          .then(resp => {
            //购物车中的信息
            store.commit("getCart", resp.data.items);
            let num = resp.data.items.reduce((a, b) => {
              return Number(a) + Number(b.quantity);
            }, 0);
            store.commit("initShopCartNum", num)
            resolve(resp);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

  }
});

export default store;
