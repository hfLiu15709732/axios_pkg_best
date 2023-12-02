/**
 * 用户相关接口信息
 *
 * 注册
 * 登录
 * 忘记密码/更新密码
 * xxxxxx
 *
 */
import { GET, POST } from "./request";

/**
 * 登录接口
 * @param data
 * @returns
 */
export const postLogin = (data: { phone: string; password: string }) =>
	GET("/user/user/login", data, { istoken: false });

/**
 * 注册接口
 * @param data
 * @returns
 */
export const postRegister = (data: {
	phone: string;
	password: string;
	smsCode: string;
	registerCode: string;
	inviteCode: string;
}) => POST("/user/user/register", data, { isToken: false });

/**
 * 忘记密码/更新密码接口
 * @param data
 * @returns
 */
export const updatePassword = (data: {
	phone: string;
	password: string;
	smsCode: string;
}) => POST("/user/updatepassword", data, { isToken: false });
