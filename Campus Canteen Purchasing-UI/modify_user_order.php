<?php
// 引入连接数据库的文件
session_start();
include "conn.php";
$conn->set_charset("utf8");
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_order'])) {
    $order_id = $_POST['order_id'];
    $new_food = $_POST['new_food'];
    $new_address = $_POST['new_address'];
    $new_restaurant = $_POST['new_canteen'];
    $sql = "UPDATE 代买餐订单 SET 餐品描述 =?, 收货地址 =?, 餐厅 =? WHERE 订单编号 =?";
    $stmt = $conn->prepare($sql);
	
    if($stmt){
		echo 111;
		$stmt->bind_param("ssss", $new_food, $new_address, $new_restaurant, $order_id);
		if ($stmt->execute()) {
			echo "订单信息更新成功,";
			echo "请返回<a href='user_homepage.php'>please return</a>";
		} else {
			echo "错误: ". $stmt->error;
		}
		$stmt->close();
	}
}

?>