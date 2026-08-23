export const authStorage = {
	getToken: () => localStorage.getItem("token"),
	getRefreshToken: () => localStorage.getItem("refreshToken"),
	setTokens: ({ accessToken, token, refreshToken }) => {
		localStorage.setItem("token", accessToken || token);
		if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
	},
	clear: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
	},
	isAuthenticated: () => Boolean(localStorage.getItem("token")),
};
export const themeStorage = { get:()=>localStorage.getItem("theme") || "light", set:(t)=>localStorage.setItem("theme",t) };
