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
