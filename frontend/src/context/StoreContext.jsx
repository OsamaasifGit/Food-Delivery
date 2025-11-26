

//import { food_list } from "../assets/assets";
/*
import { createContext, useEffect, useState } from "react";
export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

   const [cartItems,setCartItems] = useState({});
   const url = "http://localhost:4000";
   const [token,setToken] = useState("");
   const [food_list,setFood] = useState([])

   const addToCart = (itemId) => {
     if (!cartItems[itemId]) {
        setCartItems((prev)=>({...prev,[itemId]:1}))
     }
      else {
        setCartItems((prev) => ({ ...prev,[itemId]: prev[itemId] +1}))
      }
        if (token) {
          await axios.post(url+"/api/cart/add",{itemId})
        }
   }

    const removeFromCart = (itemId) => {
        setCartItems((prev) =>({...prev,[itemId]:prev[itemId] -1}))
    }

    const getTotalCartAmount = () => {
      let totalAmount = 0;
      for(const item in cartItems)
      {
         if(cartItems[item]>0){
                     let itemInfo = food_list.find((product)=>product._id === item);
         totalAmount += itemInfo.price* cartItems[item];
         }
        
      }
      return totalAmount;
    }
    
    const fetchFoodList = async () => {
      const response = await axios.get(url+"/api/food/list");
           setFoodList(response.data.data)
    }


    useEffect(()=>{

     // if (localStorage.getItem("token")){
      //  setToken(localStorage.getItem("token"));
     // }
      async function loadData() {
         await fetchFoodList();
         if (localStorage.getItem("token")){
       setToken(localStorage.getItem("token"));
      }
   }
   loadData();
    },[])

    const contextValue = {
      food_list,
      cartItems,
      setCartItems,
      addToCart,
      removeFromCart,
      getTotalCartAmount,
      url,
      token,
      setToken

    }
     return(
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
     )
}

export default StoreContextProvider;

/*
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFood] = useState([]);
    const url = "http://localhost:4000";
    const [token, setToken] = useState("");

    // Add item to cart
    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
        }));
         if (token) {
          await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            if (!prev[itemId] || prev[itemId] <= 1) {
                const newCart = { ...prev };
                delete newCart[itemId];
                return newCart;
            } else {
                return { ...prev, [itemId]: prev[itemId] - 1 };
            }
           
        });
         if(token){
                await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}});
            }
    };

    // Calculate total cart amount
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                // Use _id or id depending on backend
                const itemInfo =
                    food_list.find((product) => product._id === item) ||
                    food_list.find((product) => product.id === item);

                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    // Fetch food list from backend
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            console.log("Fetched food list:", response.data.data); // Debug
            setFood(response.data.data || []);
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();

            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
            }
        }
        loadData();
    }, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;


*/

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({}); // keys are strings
  const [food_list, setFood] = useState([]);
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");

  // helper: build headers (uses Authorization: Bearer if token exists,
  // but falls back to { token } in case your backend expects that header name)
  const buildAuthHeaders = () => {
    if (!token) return {};
    // default to Authorization Bearer — change if backend expects different
    return {
      Authorization: `Bearer ${token}`,
      // token: token, // uncomment if your backend expects header 'token'
    };
  };

  // Add item to cart (optimistic update with rollback on error)
  const addToCart = async (itemId) => {
    const key = String(itemId);
    // optimistic update
    setCartItems((prev) => ({
      ...prev,
      [key]: prev[key] ? prev[key] + 1 : 1,
    }));

    if (!token) return; // nothing to sync with server if no token

    try {
      await axios.post(
        `${url}/api/cart/add`,
        { itemId },
        { headers: buildAuthHeaders() }
      );
    } catch (error) {
      console.error("Failed to add to server cart, reverting local change:", error);
      // rollback the optimistic change
      setCartItems((prev) => {
        const current = prev[key] ?? 0;
        if (current <= 1) {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        } else {
          return { ...prev, [key]: current - 1 };
        }
      });
    }
  };

  // Remove item from cart (optimistic update with rollback on error)
  const removeFromCart = async (itemId) => {
    const key = String(itemId);

    // optimistic update
    setCartItems((prev) => {
      const qty = prev[key] ?? 0;
      if (qty <= 1) {
        const newCart = { ...prev };
        delete newCart[key];
        return newCart;
      } else {
        return { ...prev, [key]: qty - 1 };
      }
    });

    if (!token) return;

    try {
      await axios.post(
        `${url}/api/cart/remove`,
        { itemId },
        { headers: buildAuthHeaders() }
      );
    } catch (error) {
      console.error("Failed to remove from server cart, reverting local change:", error);
      // rollback (add back one)
      setCartItems((prev) => ({
        ...prev,
        [key]: prev[key] ? prev[key] + 1 : 1,
      }));
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemKey in cartItems) {
      const qty = cartItems[itemKey];
      if (!qty || qty <= 0) continue;

      // find product by _id or id (be robust to types)
      const itemInfo =
        food_list.find((p) => String(p._id) === String(itemKey)) ||
        food_list.find((p) => String(p.id) === String(itemKey));

      if (itemInfo && typeof itemInfo.price === "number") {
        totalAmount += itemInfo.price * qty;
      } else if (itemInfo && itemInfo.price != null) {
        // try numeric coercion if price is string
        const priceNum = Number(itemInfo.price);
        if (!Number.isNaN(priceNum)) totalAmount += priceNum * qty;
      }
    }
    return totalAmount;
  };

  // Fetch food list from backend
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      // backend might return data in different shape; try common fallbacks:
      const list = (response.data && (response.data.data || response.data)) || [];
      console.log("Fetched food list:", list);
      setFood(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  const loadCartData = async (token) => {
    const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
    setCartItems(response.data.cartData);
  }

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // keep empty dependency: run once on mount

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
