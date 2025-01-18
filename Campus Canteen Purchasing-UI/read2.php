<?php include "conn.php" ?>
<?php
echo "all news data.<br>";
$sql = "select * from news "; 
$res = @mysqli_query($con,$sql);
if (mysqli_num_rows($res) > 0)
{
while ($dbrow = mysqli_fetch_assoc($res))
{
$id=$dbrow['id'];   
$title=$dbrow['title']; 
$content=$dbrow['content']; 
$add_time=$dbrow['add_time'];
$content = str_replace("\r", "<br>", $content); 
$content= str_replace(" ", "&nbsp; ", $content);
echo "ID:". $id . "<br>";          
echo "Title:". $title."<br>";   
echo "Timestamp:". $add_time."<br>";
echo "Content:". $content."<br>";
echo "<br>";
echo "--------------------------------";
echo "<br>";
}
}
else
{
echo "no data";
}
 
mysqli_close($con);
?>

