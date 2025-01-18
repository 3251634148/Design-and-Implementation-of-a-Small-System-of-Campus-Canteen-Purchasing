<?php
// 引入连接数据库的文件
session_start();
include "conn.php";
	$user_id = $_SESSION['user_id'];
	$conn->set_charset("utf8");
// 处理用户信息更新（包括账号、密码和学生信息）
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_user'])) {
    $new_account = $_POST['new_account'];
    $new_password = $_POST['new_password'];
    $new_grade = $_POST['new_grade'];
    $new_institute = $_POST['new_institute'];
    $new_contactingWay = $_POST['new_contactingWay'];
    $new_email = $_POST['new_email'];
    $sql_user_update = "UPDATE 用户 u
                      JOIN 学生信息 s ON u.用户id = s.用户id
                      SET u.账号 =?, u.密码 =?, s.grade =?, s.institute =?, s.contactingWay =?, s.email =?
                      WHERE u.用户id =?";
    $stmt_user_update = $conn->prepare($sql_user_update);
    if($stmt_user_update){
		$stmt_user_update->bind_param("sssssss", $new_account, $new_password, $new_grade, $new_institute, $new_contactingWay, $new_email, $user_id);
		if ($stmt_user_update->execute()) {
			echo "用户信息更新成功,";
			echo "请返回<a href='user_homepage.php'>please return</a>";
		} else {
			echo "错误: ". $stmt_user_update->error;
		}
		$stmt_user_update->close();
	}
	else echo "更新失败";
}
?>
