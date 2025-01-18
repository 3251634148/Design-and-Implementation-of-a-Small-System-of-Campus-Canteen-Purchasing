<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"> <head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
<title>input news</title>
<style>
form{
padding:0px;
margin:0px;
}
</style>
</head>
<body>
<table width="70%" height="30" border="0" align="center" cellpadding="0" cellspacing="0">
<tr>
<td align="center">Fill in the information</td>
</tr>
</table>
<form action="save_news.php" method="post">
<table width="70%" border="0" align="center" cellpadding="0" cellspacing="0">
<tr>
<td width="30%" align="right">News Title</td>
<td width="70%" align="left"><input type="text" name="title" size="30"/></td>
</tr>
<tr>
<td align="right">New Content</td>
<td align="left"><textarea name="content" cols="30" rows="5"></textarea></td>
</tr>
</table>
<table width="70%" height="30" border="0" align="center" cellpadding="0" cellspacing="0">
<tr>
<td align="center"><input type="submit" name="submit1" value="Confirm to add"/></td>
</tr>
</table>
</form>
</body>
</html>
