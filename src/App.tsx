import "./App.css";
import { Input, Avatar, List, Button, message } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import { getAllCommunityList, searchCommunityList } from "./api/community";
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

function App() {
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

	const { Search } = Input;

	const suffix = (
		<AudioOutlined
			style={{
				fontSize: 16,
				color: "#1677ff",
			}}
		/>
	);

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
	return (
		<>
			<div style={{ display: "flex" }}>
				<div
					style={{
						width: "670px",
						display: "flex",
						flexDirection: "column",
						margin: "0 auto",
						marginTop: "10px",
					}}
				>
					<div
						style={{
							marginBottom: "40px",
							display: "flex",
						}}
					>
						<Search
							placeholder="输入一些今天的事情吧"
							enterButton="搜索社区"
							size="large"
							suffix={suffix}
							style={{ marginRight: "15px" }}
							onSearch={() => {
								handleSearchCommunityList();
							}}
						/>
						<Button
							type="primary"
							size="large"
							onClick={() => {
								handleGetAllCommunityList();
							}}
						>
							获取全部社区
						</Button>
					</div>
					<div>
						<List
							itemLayout="horizontal"
							dataSource={communityList}
							renderItem={(item, index) => (
								<List.Item>
									<List.Item.Meta
										avatar={
											<Avatar
												src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
											/>
										}
										title={<a href="https://ant.design">{item.title}</a>}
										description="Ant Design, a design language for background applications, is refined by Ant UED Team"
									/>
								</List.Item>
							)}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
