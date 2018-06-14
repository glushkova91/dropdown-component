<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Drop-down auto-complete component</title>
    <link rel="stylesheet" href="dist/bundle.css">
      <?php
        $con=mysqli_connect("localhost","root","","users");
        if (mysqli_connect_errno())
          {
          echo "Failed to connect to MySQL: " . mysqli_connect_error();
          }
          mysqli_set_charset($con,"utf8");
        $sql="SELECT id,firstname,lastname,img_path FROM users WHERE 1 ORDER BY firstname ASC";
        $result=mysqli_query($con,$sql);
        while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
            $array[]= $row;
        }
       ?>
     <script>
            var dropdownInput = [
                <?php
                foreach ($array as $key => $value) {
                    echo "{ id: {$value['id']}, url: '{$value['img_path']}', label: '{$value['firstname']} {$value['lastname']}'},";
                }
                ?>
            ];
        </script>
</head>
<body>
    <div class="controls">
        <div class="multiselect">
            <input type="checkbox" id="multiselect-option" name="multiselect">
            <label for="multiselect-option">Multiselect</label>
        </div>
        <div class="autocomplete">
            <input type="checkbox" id="autocomplete-option" name="autocomplete">
            <label for="autocomplete-option">Autocomplete</label>
        </div>
        <div class="show-image">
            <input type="checkbox" id="show-image-option" name="show-image">
            <label for="show-image-option">Show image</label>
        </div>
        <div class="extended-search">
            <input type="checkbox" id="extended-search-option" name="extended-search">
            <label for="extended-search-option">Extended search</label>
        </div>
    </div>
    <div id="drop-down-user" class="drop-down-user drop-down"></div>
    <div id="drop-down-value" class="drop-down-value"></div>
     <div id="drop-down-additional" class="drop-down-multiselect drop-down"></div>
    <noscript>
        <style>
            .controls {
                display: none;
            }

            #noscript-select {
                height: 2.4375rem;
                padding: .5rem 1.5rem .5rem .5rem;
                margin: 0 0 1rem;
            }
        </style>
        <select name="user" id="noscript-select">
            <option>Выберите пользователя</option>
            <?php
            foreach ($array as $key => $value) {
                echo "<option value={$value['id']}>{$value['firstname']} {$value['lastname']}</option>";
            }

            mysqli_free_result($result);

            mysqli_close($con);
            ?>
        </select>
    </noscript>
</body>
<script type="text/javascript" src="dist/bundle.js"></script>
</html>