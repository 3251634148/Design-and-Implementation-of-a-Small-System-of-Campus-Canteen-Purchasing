<?php include "conn.php" ?>
<?php
	session_start();
// 处理注册表单提交
	$conn->set_charset("utf8");
    $student_card = $_POST["student_card"];
    $name = $_POST["name"];
    $grade = $_POST["grade"];
    $institute = $_POST["institute"];
    $contact = $_POST["contact"];
    $email = $_POST["email"];
    $sex =  $_POST["sex"];
    $account = $_POST["account"];
    $password = $_POST["password"];
    $is_admin = isset($_POST["is_admin"])? 1 : 0;
	
    // 获取当前最大的用户 ID，并自增 1 作为新用户的 ID
    $sql = "SELECT MAX(用户id) AS max_id FROM 用户";
    $result = $conn->query($sql);
	if(!$result){
		$user_id = 1;
	}
	else{
		$row = $result->fetch_assoc();
		$max_id = $row['max_id'];
		// 如果没有用户，将用户 ID 设为 1，否则自增 1
		$user_id = ($max_id == NULL)? 1 : $max_id + 1;
	}
	// 保存session
	$_SESSION['account'] = $account;
	$_SESSION['is_admin'] = $is_admin;
	$_SESSION['user_id'] = $user_id;
	
    // 使用预处理语句插入用户信息到数据库
	$sql = "INSERT INTO 用户 (用户id, 账号, 密码, 是否是管理员, 是否是失信用户) VALUES ($user_id, '$account', '$password', $is_admin, 0);";
	$conn->query($sql);
	$sql = "INSERT INTO 学生信息 (stuID, 用户id, name, grade, institute, contactingWay, email, sex) VALUES ($student_card, $user_id, '$name', '$grade', '$institute', '$contact', '$email', '$sex');";
	
	if (@mysqli_query($conn,$sql)) {
		// 注册成功后返回登录页面
		echo "add successfully,<a href='index.php'>please return</a>";
		$conn->close();
		exit;
	} else {
	  echo "Error: " . $sql . "<br>" . $conn->error;
	}

?>
