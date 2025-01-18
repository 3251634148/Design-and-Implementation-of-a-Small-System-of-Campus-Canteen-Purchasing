

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>登录</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="header">
        <h1>校园食堂代买餐平台</h1>
    </div>
    <video autoplay muted loop id="video-background">
        <source src="background.mp4" type="video/mp4">
    </video>
    <div class="login-box">
        <img src="R-C.jpg" alt="平台logo" class="logo">
        <h2>登录</h2>
        <?php if (isset($error)) {?>
            <p style="color: red;"><?php echo $error;?></p>
        <?php }?>
        <form method="post" action= "save_index.php">
            <input type="text" name="username" placeholder="用户名" required>
            <input type="password" name="password" placeholder="密码" required>
            <button type="submit">登录</button>
        </form>
        <form method="get" action="register.php">
            <button type="submit" class="register-button">注册</button>
        </form>
    </div>
</body>
</html>