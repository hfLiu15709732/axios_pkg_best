import axios, {
	Method,
	InternalAxiosRequestConfig,
	AxiosResponse,
	GenericAbortSignal,
	AxiosProgressEvent,
} from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { clearToken, getToken } from "../tools/auth";
import { TOKEN_ERROR_CODE } from "../constants/responseCode";
import { ResponseDataType, requestConfigType } from "../types/request";

const instance = axios.create({
	baseURL: "/api", // 开发环境下的跨域解决
	timeout: 5000, //配置超时时间
	withCredentials: true, //携带凭证允许
	headers: {
		"content-type": "application/json",
	}, //请求头格式
});

/**
 * 请求开始前的检查
 */
function requestAuth(
	config: InternalAxiosRequestConfig & requestConfigType
): InternalAxiosRequestConfig {
	if (config.headers && config.isToken) {
		console.log("auth-consig-token");
		config.headers.Authorization = `Bearer ${getToken()}`;
		// 需要使用token的请求
	}
	// 不需要使用token的请求，直接送出即可
	NProgress.start(); // 启动loading
	return config;
}

/**
 * 请求成功,检查请求头
 */
function responseSuccess(response: AxiosResponse<ResponseDataType>) {
	NProgress.done(); // 关闭loading
	return response;
}

/**
 * 响应数据检查
 */
function checkRes(data: ResponseDataType) {
	if (data === undefined) {
		console.log("error->", data, "data is empty");
		return Promise.reject("服务器异常");
	} else if (data.code < 200 || data.code >= 400) {
		return Promise.reject(data);
	}
	return data.data;
}

/**
 * 响应错误
 */
function responseError(err: any) {
	console.log("error->", "请求错误", err);

	if (!err) {
		return Promise.reject({ reason: "未知错误" });
	}
	if (typeof err === "string") {
		return Promise.reject({ reason: err });
	}
	if (err.response) {
		// 有报错响应
		const res = err.response;

		if (res.data.code in TOKEN_ERROR_CODE) {
			clearToken();
			return Promise.reject({ reason: "登录信息已过期，请重新登录" });
		}
		if (res.status >= 500) {
			return Promise.reject({ reason: "服务器出错啦，请稍后再试～" });
		}
		return Promise.reject({ reason: res.data.reason });
	}
	return Promise.reject({
		...err,
		reason: "网络出错啦，请检查您的网络或更换浏览器重试",
	});
}

/* 请求拦截 */
instance.interceptors.request.use(requestAuth, (err) => Promise.reject(err));

/* 响应拦截 */
instance.interceptors.response.use(responseSuccess, (err) => {
	NProgress.done(); // 关闭loading
	return Promise.reject(err);
});

function request(url: string, data: any, config: any, method: Method): any {
	/* 去空 */
	for (const key in data) {
		if (data[key] === null || data[key] === undefined) {
			delete data[key];
		}
	}

	return instance
		.request({
			url: url,
			method: method,
			data: method === "GET" ? null : data,
			params: method === "GET" ? data : null, // get请求不携带data，params放在url上
			...config, // 用户自定义配置，可以覆盖前面的配置
		})
		.then((res) => checkRes(res.data)) //这里将数据data解构出来了，直接放到下一步checkRes中去了
		.catch((err) => responseError(err));
}

/**
 * api请求方式
 * @param {String} url
 * @param {Any} params
 * @param {Object} config
 * @returns
 */
export function GET<T>(url: string, params = {}, config: any = {}): Promise<T> {
	return request(url, params, config, "GET");
}

export function POST<T>(url: string, data = {}, config: any = {}): Promise<T> {
	return request(url, data, config, "POST");
}

export function PUT<T>(url: string, data = {}, config: any = {}): Promise<T> {
	return request(url, data, config, "PUT");
}

export function DELETE<T>(
	url: string,
	data = {},
	config: any = {}
): Promise<T> {
	return request(url, data, config, "DELETE");
}
