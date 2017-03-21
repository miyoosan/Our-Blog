 var result = [], tmp = [],
    arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 1, 2, 3, 3, 5, 65, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    len = arr.length;
    for(var i = 0; result.length < 10; i++){
        var random = Math.floor(Math.random() * len);
        if(!tmp[random]){
           tmp[random] = 1;
            result.push(arr[random])
        } else {
           continue;
        }
    }
    console.log(result)