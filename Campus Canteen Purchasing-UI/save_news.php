<?php include "conn.php" ?>


<?php
$title=$_POST["title"]; 
$content=$_POST["content"]; 
if(function_exists('date_default_timezone_set')) 
{ 
date_default_timezone_set('Hongkong'); 
} 
$add_time=date("Y-m-d");
$sql = "INSERT INTO news (title,content,add_time) VALUES ('$title','$content','$add_time')";
echo $sql;
$result = @mysqli_query($con,$sql); 

if($result)
{
echo "Add successfully,<a href='add_news.php'>return to continue</a>";
}
else
{
echo "Fail to add,<a href='add_news.php'>please return</a>";
}
?>
