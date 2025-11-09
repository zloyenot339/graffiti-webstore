import axios from "axios";

const API_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // если уже идёт обновление токена, ждем его
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] =
              "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_URL}/refresh_token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const signupUser = async (userData) => {
  const res = await api.post("/signup", userData);
  localStorage.setItem("accessToken", res.data.accessToken);
  return res;
};

export const loginUser = async (credentials) => {
  const res = await api.post("/login", credentials);
  localStorage.setItem("accessToken", res.data.accessToken);
  return res;
};

export const addGraffiti = async (formData) => {
  const token = localStorage.getItem("accessToken");
  console.log("Sending request with token:", token);
  return api.post("/addGraffiti", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addToCart = async (productId) => {
  const token = localStorage.getItem("accessToken");
  console.log("Adding to cart with token:", token);
  return api.post(
    "/cart/add",
    { product_id: productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
export const getCart = async () => {
  const token = localStorage.getItem("accessToken");
  return api.get("/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPosts = async () => {
  const token = localStorage.getItem("accessToken");
  return api.get(`/user-posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removePost = async (graffitiID) => {
  const token = localStorage.getItem("accessToken");
  return api.delete(`/user-posts/${graffitiID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserLikes = async () => {
  const token = localStorage.getItem("accessToken");
  return api.get("/user-likes", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeLike = async (graffitiID) => {
  const token = localStorage.getItem("accessToken");
  return api.delete(`/user-likes/${graffitiID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeFromCart = async (productId) => {
  const token = localStorage.getItem("accessToken");
  return api.delete(`/cart/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const handlePayment = async (cartItems) => {
  const token = localStorage.getItem("accessToken");
  return api.post(
    "/create-checkout-session",
    { cartItems },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const likeGraffiti = async (id) => {
  const token = localStorage.getItem("accessToken");
  return api.post(
    `/like/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export default api;
