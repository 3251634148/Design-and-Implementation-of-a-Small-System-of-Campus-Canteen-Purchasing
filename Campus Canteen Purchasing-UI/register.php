
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>注册</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="header">
        <h1>校园食堂代买餐平台</h1>
    </div>
    <video autoplay muted loop id="video-background">
        <source src="background.mp4" type="video/mp4">
    </video>
    <div class="register-box">
        <img src="R-C.jpg" alt="平台logo" class="logo">
        <h2>注册</h2>
        <?php if (isset($error)) {?>
            <p style="color: red;"><?php echo $error;?></p>
        <?php }?>
        <form method="post" action="save_register.php">
            <input type="text" name="student_card" placeholder="学生校园卡号" required>
            <input type="text" name="name" placeholder="姓名" required>
            <input type="text" name="grade" placeholder="年级" required>
            <input type="text" name="institute" placeholder="学院" required>
            <input type="text" name="contact" placeholder="联系方式" required>
            <input type="email" name="email" placeholder="邮箱" required>
            <input type="text" name="sex" placeholder="性别" required>
            <input type="text" name="account" placeholder="用户名" required>
            <input type="password" name="password" placeholder="密码" required>
            <label>
                <input type="checkbox" name="is_admin" value="1"> 是否是管理员
            </label>
            <br>
			<button type="submit" class="register-button">注册</button>
        </form>
    </div>
</body>
</html>