<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$con=mysqli_connect("localhost","root","","users");
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }
  mysqli_set_charset($con,"utf8");

$entityBody = file_get_contents('php://input');
$seachKeys = json_decode($entityBody)->{'seachKey'};

foreach ($seachKeys as $i => $seachKey) {
    $seachArray = explode(",", $seachKey);

    $query = "SELECT id FROM users";
    
    foreach ($seachArray as $key => $value) {
        if ($key === 0) {
            $query .= " WHERE";
        }
    
        $trimed = addslashes(trim($value));
        $query .=" (nickname like '%$trimed%' OR firstname like '%$trimed%' OR lastname like '%$trimed%')";
     
        if ((count($seachArray) - 1) !== $key) {
            $query .= " AND";
        }
    }
    
    $query .=" ORDER BY firstname ASC";
    $result = mysqli_query($con, $query);

    while($row = mysqli_fetch_assoc($result))
    $resultRows[] = $row["id"];

    if (isset($resultRows)) {
        break;
    }
}

echo json_encode(isset($resultRows) ? $resultRows : null);
?>