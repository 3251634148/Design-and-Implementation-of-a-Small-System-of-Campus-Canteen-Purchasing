<?php
// 引入连接数据库的文件
session_start();
include "conn.php";
	$conn->set_charset("utf8");
// 处理登录表单提交
    $username = $_POST["username"];
    $password = $_POST["password"];
	
	// 使用预处理语句查询用户是否存在且密码正确
	$sql = "SELECT * FROM 用户 WHERE 账号 = ? AND 密码 = ?";
	$stmt = $conn->prepare($sql);
	if($stmt){
		$stmt->bind_param("ss", $username, $password);  // 绑定参数，"ss" 表示两个字符串类型的参数
		$stmt->execute(); // 执行查询

		// 获取查询结果
		$result = $stmt->get_result();

		// 判断用户是否存在
		if ($result->num_rows > 0) {
			$row = $result->fetch_assoc();
			$usable = $row["是否是失信用户"];
			if($usable == 1){
				echo "账号已经被冻结，请找管理员进行沟通！";
			}
			else{
				//保存session
				$_SESSION['account'] = $username;
				$_SESSION['user_id'] = $row["用户id"];
				$_SESSION['is_admin'] = $row["是否是管理员"];
				// 用户存在，登录成功
				echo "登录成功，<a href='order.php'>点击这里继续</a>";
			}
		} else {
			// 用户不存在或密码不正确
			echo "账号或密码错误，请重试！";
		}
		// 关闭连接
		$stmt->close();
	}
	else{
		die("SQL prepare failed: " . $conn->error); // 输出具体的错误信息
	}

	
	mysqli_close($conn);
?>