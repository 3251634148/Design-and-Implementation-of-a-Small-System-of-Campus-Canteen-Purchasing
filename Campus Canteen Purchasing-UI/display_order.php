<?php
// 引入连接数据库的文件
	session_start();
	include "conn.php";
	$conn->set_charset("utf8");
	echo "<br><br><br><br>-----------------------------------当前订单----------------------------------------<br>";
	// 查询所有订单信息
	$sql = "SELECT o.用户id,u.账号,o.订单编号,o.下单时间,o.下单数量,d.收货地址,d.小费,d.餐品花费,d.订单状态,d.类别,d.餐厅,d.餐品描述 FROM 下单 o JOIN 用户 u ON o.用户id = u.用户id JOIN 代买餐订单 d ON o.订单编号 = d.订单编号;";
	$result = @mysqli_query($conn,$sql);
	if ($result) {
		while($row = $result->fetch_assoc()) {
			$oid = $row["订单编号"];
			$sql = "SELECT j.用户id AS 接单者用户id,u.账号 AS 接单者账号,j.订单编号,j.接单时间,j.接单数量 FROM 接单 j JOIN 用户 u ON j.用户id = u.用户id WHERE j.订单编号 = '$oid';";
			$result1 = @mysqli_query($conn,$sql);
			echo "<div class='order-item'>";
			echo "<p><strong>订单编号:</strong> ". $row["订单编号"]. "</p>";
			echo "<p><strong>发布者:</strong> ". $row["账号"]. "</p>";
			echo "<p><strong>收货地址:</strong> ". $row["收货地址"]. "</p>";
			echo "<p><strong>小费:</strong> ". $row["小费"]. "</p>";
			echo "<p><strong>餐品花费:</strong> ". $row["餐品花费"]. "</p>";
			echo "<p><strong>订单状态:</strong> ". $row["订单状态"]. "</p>";
			echo "<p><strong>类别:</strong> ". $row["类别"]. "</p>";
			echo "<p><strong>餐厅:</strong> ". $row["餐厅"]. "</p>";
			echo "<p><strong>餐品描述:</strong> ". $row["餐品描述"]. "</p>";
			
			if($result1){
				$row1 = $result1->fetch_assoc();
				echo "<p><strong>接单者:</strong> ". $row1["接单者账号"]. "</p>";
				echo "<p><strong>接单时间:</strong> ". $row1["接单时间"]. "</p>";
			}
			else{
				echo "<p><strong>接单者:</strong> "."暂无"."</p>";
				echo "<p><strong>接单时间:</strong> "."暂无" . "</p>";
			}
			echo "<br>";
			echo "</div>";
		}
		echo "search successfully,<a href='order.php'>please return</a>";
	} 
	else {
		echo "<p>暂无订单信息。</p>";
	}
	echo "<br><br><br><br>-----------------------------------已有服务----------------------------------------<br>";
	$sql = "SELECT ps.发布时间, u.账号 AS 发布者账号, s.服务类别, s.服务描述 FROM 发布服务 ps JOIN 用户 u ON ps.用户id = u.用户id JOIN 服务 s ON ps.服务编号 = s.服务编号;";
	$result = @mysqli_query($conn,$sql);
	if ($result) {
		while($row = $result->fetch_assoc()) {
			$sql = "SELECT j.用户id AS 接单者用户id,u.账号 AS 接单者账号,j.订单编号,j.接单时间,j.接单数量 FROM 接单 j JOIN 用户 u ON j.用户id = u.用户id WHERE j.订单编号 = '$oid';";
			$result1 = @mysqli_query($conn,$sql);
			echo "<div class='order-item'>";
			echo "<p><strong>发布时间:</strong> ". $row["发布时间"]. "</p>";
			echo "<p><strong>发布者:</strong> ". $row["发布者账号"]. "</p>";
			echo "<p><strong>服务类别:</strong> ". $row["服务类别"]. "</p>";
			echo "<p><strong>服务描述:</strong> ". $row["服务描述"]. "</p>";
		}
		echo "search successfully,<a href='order.php'>please return</a>";
	} 
	else {
		echo "<p>暂无服务信息。</p>";
	}
?>
