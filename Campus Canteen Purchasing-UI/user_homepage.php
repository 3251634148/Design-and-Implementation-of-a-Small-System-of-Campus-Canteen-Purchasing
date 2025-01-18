<?php
// 引入连接数据库的文件
session_start();
include "conn.php";
	$conn->set_charset("utf8");

$user_id = $_SESSION['user_id'];

// 用户信息查询
$sql_user_info = "SELECT * FROM 用户 WHERE 用户id =?";
$stmt_user_info = $conn->prepare($sql_user_info);
$stmt_user_info->bind_param("s", $user_id);
$stmt_user_info->execute();
$result_user_info = $stmt_user_info->get_result();
if ($result_user_info->num_rows > 0) {
    $user_info = $result_user_info->fetch_assoc();
    echo "用户ID: ". $user_info["用户id"]. "<br>";
    echo "账号: ". $user_info["账号"]. "<br>";
    echo "密码: ". $user_info["密码"]. "<br>";
    echo "是否是管理员: ". ($user_info["是否是管理员"]? "是" : "否"). "<br>";
    echo "是否是失信用户: ". ($user_info["是否是失信用户"]? "是" : "否"). "<br>";
} else {
    echo "用户信息未找到";
}
$stmt_user_info->close();

$sql_user_info = "SELECT u.账号, u.密码, u.是否是管理员, s.stuID, s.name, s.grade, s.institute, s.contactingWay, s.email, s.sex FROM 用户 u JOIN 学生信息 s ON u.用户id = s.用户id WHERE s.用户id =?";
$stmt_user_info1 = $conn->prepare($sql_user_info);
if($stmt_user_info1){
	$stmt_user_info1->bind_param("s", $user_id);
	$stmt_user_info1->execute();
	$result_user_info1 = $stmt_user_info1->get_result();
	if ($result_user_info1->num_rows > 0) {
		$user_info1 = $result_user_info1->fetch_assoc();
		echo "校园卡号: ". $user_info1["stuID"]. "<br>";
		echo "名字: ". $user_info1["name"]. "<br>";
		echo "年级: ". $user_info1["grade"]. "<br>";
		echo "学院: ". $user_info1["institute"]. "<br>";
		echo "联系方式: ". $user_info1["contactingWay"]. "<br>";
		echo "邮箱: ". $user_info1["email"]. "<br>";
		echo "性别: ". $user_info1["sex"]. "<br>";
	} else {
		echo "用户信息未找到";
	}
	$stmt_user_info1->close();
}

if($user_info["是否是管理员"] == 0){
// 用户信息更新
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_user'])) {
    $new_account = $_POST['new_account'];
    $new_password = $_POST['new_password'];
    $stmt_update = $conn->prepare("UPDATE 用户 SET 账号 =?, 密码 =? WHERE 用户id =?");
    $stmt_update->bind_param("sss", $new_account, $new_password, $user_id);
    if ($stmt_update->execute()) {
        echo "用户信息更新成功";
    } else {
        echo "错误: ". $stmt_update->error;
    }
    $stmt_update->close();
}

// 用户信息删除，这里仅为示例，实际应用中请谨慎操作
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['delete_user'])) {
    $stmt_delete = $conn->prepare("DELETE FROM 用户 WHERE 用户id =?");
    $stmt_delete->bind_param("s", $user_id);
    if ($stmt_delete->execute()) {
        echo "用户信息删除成功";
        // 注销会话或执行其他清理操作
        session_destroy();
		echo "期待与你的下次见面,请点击这里返回登录界面<a href='index.php'>please return</a>";
        exit;
    } else {
        echo "错误: ". $stmt_delete->error;
    }
    $stmt_delete->close();
}


// 处理服务信息修改
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_service'])) {
    $service_id = $_POST['service_id'];
    $new_service_description = $_POST['new_service_description'];
    $sql = "UPDATE 服务 s
            JOIN 发布服务 ps ON s.服务编号 = ps.服务编号
            SET s.服务描述 =?
            WHERE ps.用户id =? AND s.服务编号 =?";
    $stmt = $conn->prepare($sql);
	if($stmt){
		$stmt->bind_param("sss", $new_service_description, $user_id, $service_id);
		if ($stmt->execute()) {
			echo "服务信息更新成功";
		} else {
			echo "错误: ". $stmt->error;
		}
		$stmt->close();
	}
    
}


// 查询用户的服务信息
$sql_services = "SELECT s.服务编号, s.服务类别, s.服务描述
                FROM 服务 s
                JOIN 发布服务 ps ON s.服务编号 = ps.服务编号
                WHERE ps.用户id =?";
$stmt_services = $conn->prepare($sql_services);
if($stmt_services){
$stmt_services->bind_param("s", $user_id);
$stmt_services->execute();
$result_services = $stmt_services->get_result();	
}


// 查询用户的学生信息和用户信息
$sql_user_info = "SELECT u.账号, u.密码, s.stuID, s.name, s.grade, s.institute, s.contactingWay, s.email, s.sex
                FROM 用户 u
                JOIN stuInfo s ON u.用户id = s.用户id
                WHERE u.用户id =?";
$stmt_user_info = $conn->prepare($sql_user_info);
if($stmt_user_info){
$stmt_user_info->bind_param("s", $user_id);
$stmt_user_info->execute();
$result_user_info = $stmt_user_info->get_result();
if($result_user_info)$user_info = $result_user_info->fetch_assoc();
}
}




// 管理员功能：查看非管理员用户的被投诉次数
if ($user_info["是否是管理员"] == 1) {
	echo "<br><br><br><br><br>----------------------------用户被投诉信息展示---------------------------------------<br>";
	// 管理员功能，查询用户的被投诉信息
	if($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['search_user'])){
		$sql_complaints = "SELECT u.用户id, COUNT(c.用户id) AS 被投诉次数 FROM 用户 u LEFT JOIN 投诉 c ON u.用户id = c.用户id WHERE u.是否是管理员 = 0 GROUP BY u.用户id";
		if($sql_complaints)$result_complaints = $conn->query($sql_complaints);
		if($result_complaints){
			if ($result_complaints->num_rows > 0) {
				while($row = $result_complaints->fetch_assoc()) {
					echo "用户ID: ". $row["用户id"]. " 被投诉次数: ". $row["被投诉次数"]. "<br>";
				}
			} else {
				echo "没有非管理员用户的投诉记录";
			}
		}
		echo "<br><br><br><br><br>----------------------------具体投诉信息展示---------------------------------------<br>";
		$sql_complaints = "SELECT u.用户id, c.投诉原因, c.投诉类别 FROM 投诉 c LEFT JOIN 用户 u ON u.用户id = c.用户id WHERE u.是否是管理员 = 0";
		if($sql_complaints)$result_complaints = $conn->query($sql_complaints);
		if($result_complaints){
			if ($result_complaints->num_rows > 0) {
				while($row = $result_complaints->fetch_assoc()) {
					echo "用户ID: ". $row["用户id"]. " 被投诉原因: ". $row["投诉原因"]. "投诉类别 ". $row["投诉类别"]."<br>";
				}
			} else {
				echo "没有非管理员用户的投诉记录";
			}
		}
	}
	// 管理员功能：冻结账号，这里假设添加一个字段 'is_frozen' 来表示账号是否冻结
	if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['freeze_user'])) {
		$freeze_user_id = $_POST['freeze_user_id'];
		$stmt_freeze = $conn->prepare("UPDATE 用户 SET 是否是失信用户 = 1 WHERE 用户id =?");
		$stmt_freeze->bind_param("s", $freeze_user_id);
		if ($stmt_freeze->execute()) {
			echo "用户账号已冻结";
		} else {
			echo "错误: ". $stmt_freeze->error;
		}
		$stmt_freeze->close();
	}
	
}

// 关闭连接
$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
    <title>用户主页</title>
</head>
<body>	
	<?php if ($user_info["是否是管理员"] == 0):?>
	<h2>用户订单信息</h2>
    <form method="post" action="modify_user_order">
        <label for="order_id">订单编号:</label>
        <input type="text" name="order_id" required><br>
        <label for="new_canteen">新餐厅:</label>
        <input type="text" name="new_canteen" required><br>
        <label for="new_food">新餐品描述:</label>
        <input type="text" name="new_food" required><br>
        <label for="new_address">新收获地址:</label>
        <input type="text" name="new_address" required><br>
		<input type="submit" name="update_order" value="更新用户信息">
    </form>
	<?php endif;?>
	
    <h2>用户信息</h2>
    <form method="post" action="modify_user_info">
        <label for="new_account">新账号:</label>
        <input type="text" name="new_account" required><br>
        <label for="new_password">新密码:</label>
        <input type="password" name="new_password" required><br>
        <label for="new_grade">新年级:</label>
        <input type="text" name="new_grade" required><br>
        <label for="new_institute">新学院:</label>
        <input type="text" name="new_institute" required><br>
        <label for="new_contactingWay">新联系方式:</label>
        <input type="text" name="new_contactingWay" required><br>
        <label for="new_email">新邮箱:</label>
        <input type="text" name="new_email" required><br>
        <input type="submit" name="update_user" value="更新用户信息">
    </form>
	<form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
        <input type="submit" name="delete_user" value="注销账户">
    </form>
	
    <?php if ($user_info["是否是管理员"] == 1):?>
    <h2>管理员功能</h2>
    <h3>查看非管理员用户的被投诉次数</h3>
	<form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
        <input type="submit" name="search_user" value="查询">
    </form>
	
    <h3>冻结账号</h3>
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
        用户ID: <input type="text" name="freeze_user_id"><br>
        <input type="submit" name="freeze_user" value="冻结账号">
    </form>
    <?php endif;?>
	<br><br>
	<form method="get" action="index.php">
        <button type="submit" class="button">返回登录页面</button>
    </form>
	<form method="get" action="order.php">
        <button type="submit" class="button">返回订单页面</button>
    </form>
</body>
</html>