<?php 
$hostname = "localhost"; //local hist
$database = "test"; //database name 
$username = "root"; //user
$password = ""; //password
$con = mysqli_connect($hostname, $username, $password, $database); 
if (mysqli_connect_errno()) 
{
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  exit();
}
?>
<?php
 
$sql = "select * from news where id = 1";

$res = @mysqli_query($con,$sql);

$row = @mysqli_fetch_array($res, MYSQLI_ASSOC);
if($row)
{
//$dbrow=@mysqli_fetch_array($res, MYSQLI_ASSOC);
$id=$row['id'];   
$title=$row['title']; 
$content=$row['content']; 
$add_time=$row['add_time'];
echo "ID:". $id . "<br>";          
echo "Title:". $title."<br>";   
echo "Timestamp:". $add_time;
echo "<br>";
}
else
{
echo "no data";
}
?>
