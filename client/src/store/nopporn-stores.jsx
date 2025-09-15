import axios from "axios";
import React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listCategory } from "../api/Category";
import { listProduct, searchFilters } from "../api/Product";
import _, { update } from 'lodash'

const npStore = (set, get) => ({
  user: null,
  token: null,
  products: [],
  categories: [],
  carts: [],

  LogOut: () => {
    set({
      user: null,
      token: null,
      carts: [],
    })
  },
  actionAddtoCart: (product) => {
    const carts = get().carts;
    const updateCart = [...carts, { ...product, count: 1 }];
    
    // WF Step Unique
    const unique = _.unionWith(updateCart, _.isEqual)
    console.log("Click add in Zudstand", updateCart);
    console.log("Uniq", unique);

    set({ carts: unique });
  },

  actionUpdateQuantity: (productId,newQuantity)=>{
    set((state)=>({
      carts: state.carts.map((item)=>
        item.id === productId
          ? {...item, count: Math.max(1, newQuantity)}
          : item
      
      )
    }))
  },
  actionRemoveProduct: (productId)=>{
    set((state)=>({
      carts: state.carts.filter((item)=>
        item.id !== productId
      )
    }))
  },
  getTotalPrice: ()=>{
    return get().carts.reduce((total,item)=>{
      return total + item.price * item.count
    },0)
  },

  actionLogin: async (form) => {
    const res = await axios.post("http://localhost:5001/api/login", form);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },
  getCategory: async () => {
    try {
      const res = await listCategory();
      set({ categories: res.data });
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  },
  getProduct: async (count) => {
    try {
      const res = await listProduct(count);
      set({ products: res.data });
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  },

  actionSearchFilters: async (arg) => {
    try {
      const res = await searchFilters(arg);
      set({ products: res.data });
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  },
  clearCart: () => {
    set({ carts: [] });
  }
});

const usePersist = {
  name: "nopporn-store",
  storage: createJSONStorage(() => localStorage),
};

const useNpStore = create(persist(npStore, usePersist));

export default useNpStore;