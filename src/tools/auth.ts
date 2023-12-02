/**
 * 设置token
 * @param token
 * @returns
 */
export const setToken = (token: string) =>
	sessionStorage.setItem("token", token);

/**
 * 获取token
 * @returns
 */
export const getToken = () => window.localStorage.getItem("token");

/**
 * 获取token
 * @returns
 */
export const clearToken = () => window.localStorage.removeItem("token");
