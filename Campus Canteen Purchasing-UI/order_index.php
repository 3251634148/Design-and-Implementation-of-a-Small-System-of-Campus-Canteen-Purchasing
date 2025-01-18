<?php
session_start(); // 开启 session 会话

// 引入数据库连接文件
include "conn.php";

// 获取当前登录用户的 ID
$account = $_SESSION['account'];

// 查询用户的基本信息
$sql = "SELECT u.账号, s.name, s.grade, s.institute 
        FROM 用户 u
        JOIN 学生信息 s ON u.用户id = s.用户id
        WHERE u.用户id = ?";
$stmt = $conn->prepare($sql);
echo 11111;
if($stmt){
	$stmt->bind_param("s", $account);
	$stmt->execute();
	$result = $stmt->get_result();
	$user_info = $result->fetch_assoc();
	$stmt->close();
}


// 查询用户的历史订单
$sql = "SELECT 订单编号, 收货地址, 小费, 餐品花费, 订单状态, 类别, 餐厅, 餐品描述 FROM 代买餐订单 WHERE 用户id = ?";
$stmt = $conn->prepare($sql);
if($stmt){
	$stmt->bind_param("s", $account);
	$stmt->execute();
	$order_result = $stmt->get_result();
	$stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>用户中心</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="order-box">
        <h2>欢迎，<?php echo $user_info['账号']; ?>!</h2>
        <p><strong>姓名:</strong> <?php echo $user_info['name']; ?></p>
        <p><strong>年级:</strong> <?php echo $user_info['grade']; ?></p>
        <p><strong>学院:</strong> <?php echo $user_info['institute']; ?></p>

        <h3>历史订单</h3>
        <table>
            <tr>
                <th>订单编号</th>
                <th>餐厅</th>
                <th>餐品描述</th>
                <th>小费</th>
                <th>餐品花费</th>
                <th>订单状态</th>
            </tr>
            <?php
            if ($order_result->num_rows > 0) {
                while ($order = $order_result->fetch_assoc()) {
                    echo "<tr>
                        <td>{$order['订单编号']}</td>
                        <td>{$order['餐厅']}</td>
                        <td>{$order['餐品描述']}</td>
                        <td>¥{$order['小费']}</td>
                        <td>¥{$order['餐品花费']}</td>
                        <td>{$order['订单状态']}</td>
                    </tr>";
                }
            } else {
                echo "<tr><td colspan='6'>暂无历史订单</td></tr>";
            }
            ?>
        </table>

        <h3>进入其他界面：</h3>
        <button onclick="window.location.href='order.php'">发布订单</button>
        <button onclick="window.location.href='receive_order.php'">接收订单</button>
        <button onclick="window.location.href='blacklist.php'">失信用户</button>
    </div>
</body>
</html>
