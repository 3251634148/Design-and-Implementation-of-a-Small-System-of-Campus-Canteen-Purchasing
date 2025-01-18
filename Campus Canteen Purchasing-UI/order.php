

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>订单与服务管理</title>
    <link rel="stylesheet" type="text/css" href="style_order.css">
</head>
<body>
	<nav>
        <a href="user_homepage.php">用户主页</a>
        <a href="display_order.php">查询订单</a>
    </nav>
    <div class="container">
		<div class="sidebar">
			<img class="avatar" src="OIP-C.jpg" alt="用户头像">
			<div class="user-info">
				<p class="welcome-message">欢迎来到星晨的小店</p>
			</div>
		</div>
		<div class="main-content">
			<h2>订单页面</h2>
			<!-- 订单发布表单 -->
			<form method="post" action="modify_order.php">
				<h3>发布订单</h3>
				<label for="address">收货地址:</label>
				<input type="text" name="address" required><br>
				<label for="tip">小费:</label>
				<input type="number" name="tip" step="0.01" required><br>
				<label for="meal_cost">餐品花费:</label>
				<input type="number" name="meal_cost" step="0.01" required><br>
				<label for="category">类别:</label>
				<input type="text" name="category" required><br>
				<label for="restaurant">餐厅:</label>
				<input type="text" name="restaurant" required><br>
				<label for="meal_description">餐品描述:</label>
				<textarea name="meal_description" required></textarea><br>
				<button type="submit" name="submit_order">发布订单</button>
			</form>

			<!-- 订单接收表单 -->
			<form method="post" action="modify_order.php">
				<h3>接收订单</h3>
				<label for="order_id">订单编号:</label>
				<input type="text" name="order_id" required><br>
				<label for="accept_quantity">接收数量:</label>
				<input type="number" name="accept_quantity" required><br>
				<button type="submit" name="accept_order">接收订单</button>
			</form>
			
			<!-- 订单投诉表单 -->
			<form method="post" action="modify_order.php">
				<h3>投诉订单</h3>
				<label for="order_id">输入订单编号:</label>
				<input type="text" name="order_id" required><br>
				<label for="complaint_category">投诉类别:</label>
				<input type="text" name="complaint_category" required><br>
				<label for="complaint_reason">投诉原因:</label>
				<textarea name="complaint_reason" required></textarea><br>
				<button type="submit" name="submit_complaint">提交投诉</button>
			</form>
			
			<!-- 发布服务表单 -->
			<h2>服务发布</h2>
			<form method="post" action="modify_order.php">
				服务类别: <input type="datetime" name="service_type"><br>
				服务描述: <input type="text" name="service_description"><br>
				<button type="submit" name="submit_service">发布服务</button>
			</form>
		</div>
    </div>
</body>
</html>