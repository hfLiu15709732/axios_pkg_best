# 真企业级 Axios 项目封装实践

## 1.前言：

随着前端框架不断发展，项目规模往往**快速增大**，显而易见的在于所发送与维护的接请求种类与数量不断增多，而在一个项目中，多数的请求所需要的配置往往是一样的，如果每发起一次请求，就要把这些比如设置**错误处理**、**设置请求头**、**请求地址选择**、**映射匹配**等等操作，都重新写一个，这样不仅浪费时间而且使得代码非常冗余与臃肿。所以在今天的大型项目中必须要进行 Axios 或其他网络请求工具的封装，二次封装具备以下多种好处：

- **统一接口管理：**大型项目通常会有多个模块、多个后端接口，直接使用 Axios 来发送请求可能会导致代码冗余和混乱。通过对 Axios 进行二次封装，可以将接口统一管理，使代码更加清晰和可维护。

- **抽象请求逻辑：**大型项目中的请求逻辑可能包括统一的请求头、请求拦截、响应拦截、错误处理等。通过二次封装 Axios，可以将这些公共的请求逻辑抽象出来，避免在每个请求中重复编写这些逻辑，提高代码的复用性。

- **定制化配置：**在大型项目中，对请求的配置可能会有一些特定的需求，例如设置超时时间、设置请求的 baseURL、设置认证信息等。通过二次封装 Axios，可以在封装的过程中根据项目需求进行定制化配置，提高灵活性和可定制性。

- **错误处理和统一提示：**在大型项目中，错误处理和统一提示是非常重要的一环。通过二次封装 Axios，可以统一处理请求错误，例如网络错误、接口返回错误码等，并进行适当的提示，提高用户体验和系统的健壮性。

- **接口模块化和扩展性：**通过二次封装 Axios，可以将接口按照模块进行划分和管理，提高代码的可读性和可维护性。同时，在项目后期的功能扩展中，也可以通过扩展封装的 Axios 实现接口的快速迭代和调整。

> 今天，本博客会带来一套真正的企业级 Axios 项目封装实践,真正实现**一次封装，多处收益**

注意，如果还对 Axios 这个工具不太熟悉的同学可以到[Axios 官网](https://www.axios-http.cn/) 深入学习一下 axios，很快就能上手的!

## 2.项目准备与代码结构

**所需要的相关依赖：**

```shell
npm install axios --save
yarn add axios --save
pnpm add axios --save
#其他下载依赖方式均可
```

**整体的项目结构：**

```apl
项目结构:
|-- api
|   |-- community.ts  # 社区相关接口
|   |-- user.ts     # 用户相关接口
|   |-- shop.ts     # 商店相关接口
|   |-- requset.ts     # 请求核心配置文件
|-- tools
|   |-- auth.ts     # 权限相关工具文件
|-- constants
|   |-- responseCode.ts  # 接口响应相关常量
|-- types
|   |-- request.d.ts  # 请求所涉及自定义类型的集中维护

```

## 3.Axios 配置

### 3.1 工具、常量、类型的配置

**Auth 工具的配置**

> **在 Auth.ts 文件中编写以下代码**

```js
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
```

**Response 常量的配置**

> **在 responseCode.ts 文件中编写以下代码**

```js
export const ERROR_CODE: { [key: number]: string } = {
	400: "请求失败",
	401: "无权访问",
	403: "紧张访问",
	404: "请求不存在",
	405: "请求方法错误",
	406: "请求的格式错误",
	410: "资源已删除",
	422: "验证错误",
	500: "服务器发生错误",
	502: "网关错误",
	503: "服务器暂时过载或维护",
	504: "网关超时",
};

export const TOKEN_ERROR_CODE: { [key: number]: string } = {
	506: "请先登录",
	507: "请重新登录",
	508: "登录已过期",
};
```

**request 请求类型的配置**

> 为使得本实践更利于维护，采用`ts`进行，所以采用统一维护请求相关类型信息，在`request.d.ts`文件中编写以下代码

```typescript
export interface ResponseDataType {
	code: number;
	message: string;
	data: any;
}

export interface requestConfigType {
	headers?: { [key: string]: string };
	onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
	signal?: GenericAbortSignal;
	hold?: boolean;
	timeout?: number;
	isToken?: boolean;
}
```

### 3.2 Axios 的基础信息配置

> 本配置的代码均在`request.ts`核心配置文件中编写，代码里面都有详细的注释，结合注释对于以了解`axios`的新手也完全可以看懂

```ts
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
```

### 3.3 Axios 拦截器配置

> 本配置的代码均在`request.ts`核心配置文件中编写，代码里面都有详细的注释，结合注释对于以了解`axios`的新手也完全可以看懂

```ts
/* 请求拦截 */
instance.interceptors.request.use(requestAuth, (err) => Promise.reject(err));

/* 响应拦截 */
instance.interceptors.response.use(responseSuccess, (err) => {
	NProgress.done(); // 关闭loading
	return Promise.reject(err);
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
```

### 3.4 Axios 请求统一整合

> 本配置的代码均在`request.ts`核心配置文件中编写，代码里面都有详细的注释，结合注释对于以了解`axios`的新手也完全可以看懂

```ts
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
```

### 3.5 分类型暴露

> 本配置的代码均在`request.ts`核心配置文件中编写，代码里面都有详细的注释，结合注释对于以了解`axios`的新手也完全可以看懂

```ts
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
```

## 4.接口封装

> 分类型或模块的划分接口，对接口进行封装与暴露，例如一个项目划分成 `用户相关接口`/`社区相关接口`等等

**社区相关接口的一个案例：**

```typescript
/**
 * 社区相关接口信息
 *
 * 查询社区列表
 * 获取所有社区列表
 * 获取用户所在社区详细信息
 * xxxxxx
 *
 */
import { GET, POST } from "./request";

/**
 * 查询社区列表
 * @param data
 * @returns
 */
export const searchCommunityList = (data: { id: string; location: string }) => {
	console.log(data);

	return GET("/community/search", data, { isToken: true });
};

/**
 * 获取所有社区列表
 * @param {}
 * @returns
 */
export const getAllCommunityList = () =>
	GET("/community/all", {}, { isToken: true });

/**
 * 获取用户所在社区详细信息
 * @param {}
 * @returns
 */
export const getCommunityDetailByToken = () =>
	GET("/community/detail/self", {}, { isToken: true });
```

## 5.组件内调用

> 这样子，只需要最后一步就是组件内部调用相关的`接口封装`，我们只需要调用相关的接口函数接口，而且这样封装的函数是非常有利于`async await`这样的调用风格的

**社区相关组件的一个案例：**

```typescript
import { useState } from "react";

const data = [
	{
		title: "Ant Design Title 1",
	},
	{
		title: "Ant Design Title 2",
	},
	{
		title: "Ant Design Title 3",
	},
	{
		title: "Ant Design Title 4",
	},
];

const [communityList, setCommunityList] = useState<Array<object>>(data);
const handleGetAllCommunityList = async () => {
	try {
		const data: Array<object> = await getAllCommunityList();
		message.success("获取所有社区成功！");
		setCommunityList(data);
	} catch (error) {
		console.log(error);
	} finally {
		console.log("请求结束");
	}
};

const handleSearchCommunityList = async () => {
	try {
		const data: Array<object> = await searchCommunityList({
			id: "2222",
			location: "北京",
		});
		message.success("搜索社区成功！");
		setCommunityList(data);
	} catch (error) {
		console.log(error);
	} finally {
		console.log("请求结束");
	}
};
```

## 6. 总结

> **本实践没有过多的文本描述，多在代码中的注释。但通过此个实践了解学习之后，应该可以较好的掌握这套企业级的 Axios 请求封装解决方案，能够真正实现一次封装，多处收益**

相关的配套实践 Demo 会上传 Github 开源

项目链接：[Axios 企业级封装实践](
