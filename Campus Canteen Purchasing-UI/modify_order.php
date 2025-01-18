<?php
// 引入连接数据库的文件
session_start();
include "conn.php";
	$conn->set_charset("utf8");
	echo 0;
// 处理订单发布表单提交
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['submit_order'])) {
	echo 111;
	$user_id = $_SESSION['user_id'];
    $account = $_SESSION['account'];
    $order_id = uniqid();  // 生成一个唯一的订单编号
    $address = $_POST['address'];
    $tip = $_POST['tip'];
    $meal_cost = $_POST['meal_cost'];
    $order_status = 1;  // 假设初始状态为待付款
    $category = $_POST['category'];  // 现在是 char(11) 类型
    $restaurant = $_POST['restaurant'];
    $meal_description = $_POST['meal_description'];
	if(function_exists('date_default_timezone_set')) 
	{ 
		date_default_timezone_set('Hongkong'); 
	} 
	$add_time=date('Y-m-d H:i:s');
	$order_num = 1;
	// 用session保存信息
	$_SESSION['order_id'] = $order_id;

    // 使用预处理语句插入订单信息到数据库
    $stmt = $conn->prepare("INSERT INTO 代买餐订单 (订单编号, 收货地址, 小费, 餐品花费, 订单状态, 类别, 餐厅, 餐品描述) VALUES (?,?,?,?,?,?,?,?)");
    if($stmt){
		$stmt->bind_param("ssiissis", $order_id, $address, $tip, $meal_cost, $order_status, $category, $restaurant, $meal_description);
		if ($stmt->execute()) {
			echo "<p style='color: green;'>订单发布成功！</p>";
			echo "add successfully,<a href='order.php'>please return</a>";
		} else {
			echo "<p style='color: red;'>订单发布失败: ". $conn->error. "</p>";
		}
		$stmt->close();
	}
	else{
		echo "发布订单失败";
	}
	// 更新下单数据
	$sql = "INSERT INTO 下单 (用户id, 订单编号, 下单时间, 下单数量) VALUES('$user_id','$order_id','$add_time',$order_num)";
	echo $sql;
	$result = @mysqli_query($conn,$sql); 
}

// 处理订单接收表单提交
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['accept_order'])) {
	echo 222;
    $user_id = $_SESSION['user_id'];
    $order_id = $_POST['order_id'];
    $accept_quantity = $_POST['accept_quantity'];
    $accept_time = date('Y-m-d H:i:s');  // 获取当前时间
	
	// 保存session
	$_SESSION['order_num'] = 1;
	
    // 使用预处理语句插入接单信息到数据库
    $stmt = $conn->prepare("INSERT INTO 接单 (用户id, 订单编号, 接单时间, 接单数量) VALUES (?,?,?,?)");
    $stmt->bind_param("sssi", $user_id, $order_id, $accept_time, $accept_quantity);
    if ($stmt->execute()) {
        echo "<p style='color: green;'>订单接收成功！</p>";
		echo "add successfully,<a href='order.php'>please return</a>";
    } else {
        echo "<p style='color: red;'>订单接收失败: ". $conn->error. "</p>";
    }
    $stmt->close();
}

// 处理服务发布表单提交
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['submit_service'])) {
	echo 444;
	$user_id = $_SESSION['user_id'];
    $service_id = 0;
    $description = $_POST['service_description'];
    $type = $_POST['service_type'];
    $publish_time = date('Y-m-d H:i:s');  // 获取当前时间
	$num = 1;
	
	// 获取当前最大的用户 ID，并自增 1 作为新用户的 ID
    $sql = "SELECT MAX(服务编号) AS max_id FROM 服务";
    $result = $conn->query($sql);
	if(!$result){
		$service_id = 1;
	}
	else{
		$row = $result->fetch_assoc();
		$max_id = $row['max_id'];
		// 如果没有服务，将服务编号 设为 1，否则自增 1
		$service_id = ($max_id == NULL)? 1 : $max_id + 1;
	}
	// 保存session
	$_SESSION['service_id'] = $service_id;
	
    // 使用预处理语句插入接单信息到数据库
    $stmt = $conn->prepare("INSERT INTO 发布服务 (服务编号, 用户id, 发布时间, 发布数量) VALUES (?,?,?,?)");
    if($stmt){
		$stmt->bind_param("sssi", $service_id, $user_id, $publish_time, $num);
		$stmt->execute();
		$stmt->close();
	}
	
	// 使用预处理语句插入接单信息到数据库
    $stmt1 = $conn->prepare("INSERT INTO 服务 (服务编号, 服务类别, 服务描述) VALUES (?,?,?)");
    $stmt1->bind_param("sss", $service_id, $type, $description);
    if ($stmt1->execute()) {
        echo "<p style='color: green;'>服务发布成功！</p>";
		echo "add successfully,<a href='order.php'>please return</a>";
    } else {
        echo "<p style='color: red;'>服务发布失败: ". $conn->error. "</p>";
    }
    $stmt1->close();
}

// 处理投诉表单提交
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['submit_complaint'])) {
	echo 555;
	$user_id = $_SESSION['user_id'];
    $order_id = $_POST['order_id'];
    $complaint_reason = $_POST['complaint_reason'];
    $complaint_category = $_POST['complaint_category'];
    $publish_time = date('Y-m-d H:i:s');  // 获取当前时间
	$num = 1;
	$complained_id = 0;
	
	// 获得用户id
    $sql = "SELECT 用户id FROM 接单 where 订单编号 = '$order_id'";
	
    $result = $conn->query($sql);
	if(!$result){
		$complained_id = 1;
	}
	else{
		$row = $result->fetch_assoc();
		$complained_id = $row['用户id'];
	}
	echo "投诉的人是";
	echo $complained_id;
	// 使用预处理语句插入接单信息到数据库
    $stmt1 = $conn->prepare("INSERT INTO 投诉 (用户id, 订单编号, 投诉时间, 投诉原因, 投诉类别, 数量) VALUES (?,?,?,?,?,?)");
    $stmt1->bind_param("sssssi", $complained_id, $order_id, $publish_time, $complaint_reason, $complaint_category, $num);
    if ($stmt1->execute()) {
        echo "<p style='color: green;'>投诉成功！</p>";
		echo "add successfully,<a href='order.php'>please return</a>";
    }
	echo "<p style='color: green;'>投诉成功！</p>";
	echo "add successfully,<a href='order.php'>please return</a>";
    $stmt1->close();
}
?>

