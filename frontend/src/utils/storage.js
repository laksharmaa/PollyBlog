export const authStorage = { getToken:()=>localStorage.getItem("token"), setToken:(t)=>localStorage.setItem("token",t), clear:()=>localStorage.removeItem("token"), isAuthenticated:()=>Boolean(localStorage.getItem("token")) };
export const themeStorage = { get:()=>localStorage.getItem("theme") || "light", set:(t)=>localStorage.setItem("theme",t) };
