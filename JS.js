var arr3 = [];

function Mine(tr, td, mineNum) {
    this.tr = tr; //行数    
    this.td = td; //列数
    this.mineNum = mineNum //雷数
    this.squares = [] //存储所有的方块信息，是一个二维数组，按行列顺序排放
    this.tds = []; //存储所有的单元格的dom信息
    this.surplusMine = mineNum; //剩余雷的数量
    this.allRight = false; //右击旗子判断是否是雷 
    this.parent = document.querySelector('.gameBox');

}
//创建一个表格类 

//生成n个不重复的数字
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td); //生成一个 空数组但是有长度 ，长度为 格子的总数 。
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    //取到99个不重复的数据 用了sort随机排序的原理
    square.sort(function () {
        return 0.5 - Math.random()
    });

    return square.slice(0, this.mineNum);
}


//初始化 
Mine.prototype.init = function () {
    var rn = this.randomNum(); //雷在格子里面的位置
    var n = 0; //用来找到格子对应的索引
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = []; //所有格子所对应的信息
        for (var j = 0; j < this.td; j++) {
            if (rn.indexOf(++n) != -1) {
                //如果该条件成立，说明循环到的索引在雷的数组里面，则该索引对应雷
                this.squares[i][j] = {
                    type: 'mine',
                    x: j,
                    y: i
                }
            } else {
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                }

            }

        }
    }
    this.updateNum();
    this.creatDom();

    this.parent.oncontextmenu = function () {
        return false;
    }
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
}

Mine.prototype.creatDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) {
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) {
            var domTd = document.createElement('td')

            this.tds[i][j] = domTd; //把所有的创建的td添加到数组当中
            domTd.pos = [i, j]; // 将这个格子对应的行与列存到格子身上
            domTd.onmousedown = function () {
                This.play(event, this); //大this是指实例对象，小this是指点击事件
            }
            domTr.appendChild(domTd);


        }

        table.appendChild(domTr);

    }
    this.parent.innerHTML = ''; //避免创建多个 
    this.parent.appendChild(table);
}

//找格子的周围的八个格子 
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = []; //将找到的格子的坐标返回
    //双层循环，循环出九个格子
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 || //格子超出左边的范围
                j < 0 || //格子超出上边的范围
                i > this.td - 1 || //格子超出右边的范围
                j > this.tr - 1 || //格子超出下边的范围
                (i == x && j == y) || //当前循环到的格子是自己 
                this.squares[j][i].type == 'mine' //周围的格子是雷的条件
            ) {
                continue; //跳出循环 
            }
            result.push([j, i]); //以行与列的形式返回
        }
    }

    return result;

}
//更新所有的数字：把它变成对应正确的数字 
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            //只更新雷周围的数字 
            if (this.squares[i][j].type == 'number') {
                continue; //找的是非雷的数字，直接跳过
            } else {
                var num = this.getAround(this.squares[i][j]); //获取到每一个雷周围的数字
                for (var k = 0; k < num.length; k++) {

                    //num【k】【0】代表雷周围的格子的位置，让雷周围的格子的位置的value+1
                    this.squares[num[k][0]][num[k][1]].value += 1;
                }
            }
        }
    }
}

Mine.prototype.play = function (ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != 'flag') //限制用户：标记旗子后，不能再点击左键 
    {
        //以鼠标左键点击
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'six', 'seven', 'eight']
        //若点到数字
        if (curSquare.type == 'number') {
            obj.innerHTML = curSquare.value;

            obj.className = cl[curSquare.value];
            if (curSquare.value == 0) {
                //用户点到数字0：
                //若是零则不显示；
                /*1.显示自身数字；
                  2.找周围的八个格子：
                      1.显示周围格子数字，若周围格子数字都不为零，即到此为止；
                      2.若周围存在格子数字为零，则重复以上步骤。 */
                obj.innerHTML = "";

                function getAllZero(square) {
                    var around = This.getAround(square); //找到了周围的n个格子 返回的是一个二维数组
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0]; //行
                        var y = around[i][1]; //列
                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        if (This.squares[x][y].value == 0) {
                            //若找到的某个格子的值是0，以它为中心继续寻找格子
                            if (!This.tds[x][y].check) {
                                //给该格子添加一条属性，如果没有这条属性就给它加上true
                                //下一次就不会再找了
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);

                            }
                        } else {
                            //如果以某个格子的为中心时找到的四周的格子不为零就显示其四周的数字
                            This.tds[x][y].innerHTML = This.squares[x][y].value;

                        }
                    }

                }
                getAllZero(curSquare); //

            }
        } else {
            //用户点到雷
            this.gameOver(obj);
        }
    }
    
    if (ev.which == 3) {
        //表示用户点击的是右键。
        //如果右击的是数字，无法右击 
        
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag'; //切换小红旗显示隐藏

        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true; //用户标记的旗子后都是雷
            
            //设置一个限制条件：让点击过的元素不会重复被push进数组里
            if (obj.getAttribute('data') != 1) {
                arr3.push(this.allRight);
                obj.setAttribute('data', 1);
            }
        } else {
            this.allRight = false;
            console.log(obj.getAttribute('data'));
            if (obj.getAttribute('data') != 1) {
                arr3.push(this.allRight);
                obj.setAttribute('data', 1);
            }
        }

        if (obj.className == 'flag') {
            //通关判断：以旗子存在的数量来判断存在的雷的数量 
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;

        }

        //剩余雷的数量为零表示用户标完小红旗，此时判断游戏是成功还是失败
        if (this.surplusMine == 0) {
           var a3 = arr3.every(function (v) {
                return v == true;
           })
            console.log(a3);
            if (a3) {
                alert('游戏成功');
            } else {
                alert('游戏失败');
                this.gameOver(); //调用游戏结束的方法 
            }
        }
    }
};

//定义游戏失败的函数 
Mine.prototype.gameOver = function (clickTd) {
    /*
        1.显示所有的雷
        2.页面中的内容点击不动，取消所有格子的点击事件
        3.给点击到的雷标记一个红色 
    */
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    
    if (clickTd) {
        clickTd.style.backgroundColor = 'red';
        alert('游戏失败');
    }

}


//button的功能  
var btns = document.querySelectorAll('.level button');
var min = null; //用来储存生成的实例
var Ln = 0; //用来处理当前选中的状态 
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
] //三个难度的行数、列数及雷数


for (var i = 0; i < btns.length - 1; i++) {
    (function (i) {
        btns[i].onclick = function () {
            btns[Ln].className = '';
            this.className = 'active';
            mine = new Mine(...arr[i]);
            mine.init();
            Ln = i;
            btns[3].onclick = function () {
                mine = new Mine(...arr[Ln]);
                mine.init();
                arr3 = [];

            }
        }
    }(i))
}
btns[0].onclick();