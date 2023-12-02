import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function resolve(url) {
	return path.resolve(__dirname, url);
}

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 8888,
		host: "0.0.0.0",
		// open: true,
		proxy: {
			"/api": {
				target: "https://mock.presstime.cn/mock/653695baffb279f23e01cefb",
				changeOrigin: true,
				rewrite: (path) => path.replace("/api/", "/"),
			},
		},
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
	},
	resolve: {
		// 配置路径别名
		alias: {
			"@": resolve("./src"),
		},
	},
	plugins: [react()],
});
