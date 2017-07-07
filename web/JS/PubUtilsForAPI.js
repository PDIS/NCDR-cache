/**********************************
 * SUMMARY ：共用函式
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2013/06/07  Vicky Liang Create
             
 **********************************/

//載入縣市鄉鎮資料
function loadCounTownData() {
    var url = "GetData/funcWidget/getCountryData.ashx";
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            arrCounTown = data;
            //$('#divBanner img:eq(0)').attr('title', arrCounTown[0].TP); // 2015/08/20 測試IP用
        }
    });
}

//功能操作記錄
function setCounterFunc(funcid, dataid, Operation, functype) {
    if (funcid == "") return;

    var url = "GetData/funcWidget/CounterFunc.ashx?funcid=" + funcid + "&dataid=" + dataid + "&op=" + Operation + "&typ=" + functype;
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function () { }
    });
}

//補0
function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

//去空白
function StrTrim(str) {
    //console.log(str);
    if (str) {
        if (typeof (str) != "undefined") {
            if (str.length > 0)
                return str.replace(/^\s+|\s+$/g, "");
            else
                return str
        }
    }
    else
        return str
}
//從左邊取N長度字串
function StrLeft(str, len) {
    if (len <= 0)
        return "";
    else if (len > str.length)
        return str;
    else
        return str.substring(0, len);
}
//從右邊取N長度字串
function StrRight(str, len) {
    if (len <= 0)
        return "";
    else if (len > str.length)
        return str;
    else
        return str.substring(str.length - len, str.length);
}

//取出當前時間
function getCurrentDateTime() {
    var today = new Date();
    var currentDateTime = today.getFullYear() + '/' + pad((today.getMonth() + 1), 2) + '/' + pad(today.getDate(), 2) + ' ' + pad(today.getHours(), 2) + ':' + pad(today.getMinutes(), 2) + ':' + pad(today.getSeconds(), 2);
    return currentDateTime;
}

function getNextYearYesterday() {
    var today = new Date();
    var currentDateTime = (today.getFullYear()+1) + '/' + pad((today.getMonth() + 1), 2) + '/' + pad(today.getDate()-1, 2) ;
    return currentDateTime;
}

function randString(n) {
    if (!n) {
        n = 5;
    }

    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < n; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

/* 轉換日期格式並指定分隔符號
 * dt :日期
 * fmt:格式 
 * sms :分隔符號
 */
function convertDate(dt, fmt, sms) {
    var date = new Date(dt);
    var YYYY = date.getFullYear().toString();
    var MM = pad(date.getMonth() + 1, 2).toString();
    var dd = pad(date.getDate(), 2).toString();
    var HH = pad(date.getHours(), 2).toString();
    var mm = pad(date.getMinutes(), 2).toString();
    var ss = pad(date.getSeconds(), 2).toString();
    var rltValue = "";

    if (fmt == "yyyyMM")
        rltValue = YYYY + sms + MM;
    else if (fmt == "yyyyMMdd")
        rltValue = YYYY + sms + MM + sms + dd;
    else if (fmt == "yyyyMMddHHmm"){
        if (sms=="")
            rltValue = YYYY + MM + dd + HH + mm;
        else
            rltValue = YYYY + sms + MM + sms + dd + " " + HH + ":" + mm;
    }
    else if (fmt == "yyyyMMddHHmmss") {
        if (sms == "")
            rltValue = YYYY + MM + dd + HH + mm + ss;
        else
            rltValue = YYYY + sms + MM + sms + dd + " " + HH + ":" + mm + ":" + ss;
    }
    else if (fmt == "HHmm")
        rltValue = HH + ":" + mm;
    else if (fmt == "HH")
        rltValue = HH;

    return rltValue;
}

/* 日期相加
 * interval  :單位(d/s/m/h/M/y) 
 * num       :數量
 * dt        :日期
 */
function DateAdd(interval, num, dt) {
    var date = new Date(dt);
    var val = date.valueOf();

    if (interval == "d") { //日
        val += 86400000 * num;
    } else if (interval == "s") { //秒
        val += 1000 * num;
    } else if (interval == "m") { //分鐘
        val += 60000 * num;
    } else if (interval == "h") { //時
        val += 3600000 * num;
    } else if (interval == "M") { //月
        var mo = date.getMonth();
        var yr = date.getYear();

        mo = (mo + num) % 12;
        if (0 > mo) {
            yr += (date.getMonth() + num - mo - 12) / 12;
            mo += 12;
        }
        else
            yr += ((date.getMonth() + num - mo) / 12);

        val.setMonth(mo);
        val.setYear(yr);
    } else if (interval == "y") { //年
        var newYY = date.getFullYear() + num;
        var newDT = new Date(newYY + "/" + (date.getMonth() + 1) + "/" + date.getDate());
        val = newDT.valueOf();
    }

    //return convertDate(new Date(val), fmt, "/");
    return val;
}

/* 日期相差
 * interval :單位(y/m/d/w/h/n/s) 
 * dtS      :起始日期時間
 * dtE      :結束日期時間
 */
function DateDiff(interval, dtS, dtE) {
    var date1 = new Date(dtS);
    var date2 = new Date(dtE);
    var part = date2.getTime() - date1.getTime(); //相差毫秒

    switch (interval.toLowerCase()) {
        case "y":
            return parseInt(date2.getFullYear() - date1.getFullYear());
        case "m":
            return parseInt((date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth()));
        case "d":
            return parseInt(part / 1000 / 60 / 60 / 24);
        case "w":
            return parseInt(part / 1000 / 60 / 60 / 24 / 7);
        case "h":
            return parseInt(part / 1000 / 60 / 60);
        case "n":
            return parseInt(part / 1000 / 60);
        case "s":
            return parseInt(part / 1000);
    }
}

//動態載入JS
function insertJS(jsId, jsSrc) {
    var js = document.createElement('script');
    js.setAttribute("type", "text/javascript");
    js.setAttribute("id", jsId);
    js.setAttribute("src", jsSrc);

    if (typeof js != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(js);
    }
}

//動態移除JS
function removeJS(jsId) {
    var js = document.getElementById(jsId);
    js.parentNode.removeChild(js);
}

//依資料來源新增圖片視窗(RealPictureSet)
function AddPictDiv(obj, attrs, fnid, fnname) {
    var divId = "divPict" + fnid;
    var imgId = "imgPict" + fnid; //圖片ID
    var imgSrc = gpNCDRPICUrl + obj.Path; //圖片來源

    $("#divMain").append(createDiv(fnid, divId, imgId, imgSrc, ''));
    $("#" + divId).draggable();


    //調整圖片尺寸
    var maxW = $("#" + divId).width() - 20;
    var maxH = $("#" + divId).height() - 20;
    ResizeImages(imgId, maxW, maxH, divId);
}

/* 創建div  
 * fnid :圖層選單id
 * divid:新開div id 
 * dfImgId :預設內嵌圖片id
 * dfImgsrc:預設內嵌圖片路徑
 * layerid:圖層layer id
 */
function createDiv(fnid, divid, dfImgId, dfImgsrc, layerid) {
    var html = "";
    html += "<div id='" + divid + "' class='openDiv'>"
    html += "  <div><img src='images/other/關閉視窗off.png' style='position:absolute;top:5px;right:5px;cursor:pointer' title='關閉' onclick=\"removeDiv('" + fnid + "', '" + divid + "', '" + layerid + "')\" /></div>"

    if (dfImgId != "") {
        html += "  <div style='position:absolute;top:20px;left:5px;'><img id = '" + dfImgId + "' src='" + dfImgsrc + "' alt='表單' /></div>";
    }

    html += "</div>"
    return html;
}

function createRtuiDiv(fnid, divid) {
    var html = "";

    html += "<div id=\"" + divid + "\" class='openRtuiDiv' style=\"display:none\">";
    html += "  <div style=\"border-radius: 10px; background-color:#B1D4DB\">";
    html += "    <div style=\"padding:10px 5px 5px 10.5em;\">客製化表單";
    html += "      <img src=\"images/other/關閉視窗off.png\" alt=\"關閉\" style=\"float:right;\" />";
    html += "    </div>";
    html += "    <div style=\"padding:10px 0px 0px 0px;background-color:#fff\"></div>";
    html += "  </div>";
    html += "</div>";

    return html;
}

/* 移除div  
 * fnid :圖層功能id
 * divid:新開div id 
 * layerid:圖層layer id
 */
function removeDiv(fnid, divid, layerid) {

    $("#" + divid).remove(); //移除div

    //取消勾選圖層
    if (fnid != "") {
        $("#cbFunc" + fnid).attr("src", "images/FuncList/uncheck.png"); //取消勾選圖層
    }

    //移除layer
    if (layerid != "") {
        layer = map.getLayer(layerid);
        if (typeof (layer) != "undefined") {
            layer.clear();
            map.removeLayer(layer);
        }
    }
}

//放大圖片
function showLPicture(imgLargePicture, imgid) {
    if ($("div[id='" + imgid + "']").size() == 0) {
        var html = "";

        html += "<div id='" + imgid + "' class='openDiv' style='height:380px;width:510px;border-radius: 5px; background-color: #B1D4DB' >"
        html += "<div style='padding: 10px 5px 5px 10px;'>觀看原圖<img src='images/other/關閉視窗off.png' style='position:absolute;top:5px;right:5px;cursor:pointer' title='關閉' onclick=\"removeDiv('','" + imgid + "','')\"></div>"
        html += "<div style='padding: 10px 0px 0px 0px; background-color: #fff'></div>"
        html += "<div style='padding: 5px 5px 0px 5px; background-color: #fff; cursor: default;'>"
        html += "<div style='height: 320px; padding-right: 10px;'>"
        html += "<img id='imgLPicture' src='" + imgLargePicture + "' style='max-width:550px; max-height:325px;'/>"
        html += "</div>"
        html += "</div>"
        html += "</div>"
        $("#divMain").append(html);
        $("#" + imgid).draggable();
    }
    else {
        $("#imgLPicture").attr("src", imgLargePicture);
    }
}

//依比例縮放圖片
function ResizeImages(imgid, maxwidth, maxheight, divid) {
    var img = new Image();
    img.src = document.getElementById(imgid).src;
    var oldwidth, oldheight;

    img.onload = function () {
        if (img.width > img.height) {
            if (img.width > maxwidth) {
                oldwidth = img.width;
                img.height = img.height * (maxwidth / oldwidth);
                img.width = maxwidth;
            }
        } else {
            if (img.height > maxheight) {
                oldheight = img.height;
                img.width = img.width * (maxheight / oldheight);
                img.height = maxheight;
            }
        }
        $("#" + imgid).width(img.width);
        $("#" + imgid).height(img.height);
        $("#" + divid).height(img.height + 30);
    }
}

//移除陣列元素
function removeArryElm(array, val) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] == val) {
            array.splice(i, 1);
        }
    }
}

//停止循環計時器
function clearTimer(name) {
    for (var i = 0; i < arrTimer.length; i++) {
        if (arrTimer[i].name == name) {
            clearInterval(arrTimer[i].id);
            arrTimer.splice(i, 1)
        }
    }
}

//google chart轉存圖片******************
//另存圖片
function saveAsImg(chartContainer) {
    var imgData = getImgData(chartContainer);
    //window.location = imgData.replace("image/png", "image/octet-stream"); //此方法不會產生副檔名

    $.post("./GetData/DownloadImage.ashx", {
        data: imgData
    },
            function (k) {
                if (k)
                    location.href = "./GetData/DownloadImage.ashx?k=" + k;
            });
}

//回傳image
function getImgData(chartContainer) {
    var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
    var svg = chartArea.innerHTML;
    var doc = chartContainer.ownerDocument;
    var canvas = doc.createElement('canvas');
    canvas.setAttribute('width', chartArea.offsetWidth);
    canvas.setAttribute('height', chartArea.offsetHeight);

    canvas.setAttribute(
        'style',
        'position: absolute; ' +
        'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
        'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
    doc.body.appendChild(canvas);
    canvg(canvas, svg);
    var imgData = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);
    return imgData;
}

//highcharts chart轉存圖片******************
//另存圖片
function saveAsHighChartsImg(chartContainer) {
    var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
    var svg = "";
    var doc = chartContainer.ownerDocument;
    var canvas = doc.createElement('canvas');
    canvas.setAttribute('width', chartArea.offsetWidth);
    canvas.setAttribute('height', chartArea.offsetHeight);

    canvas.setAttribute(
        'style',
        'position: absolute; ' +
        'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
        'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
    doc.body.appendChild(canvas);
    $.each(chartContainer.getElementsByTagName('svg'), function (i, s) {
        chartArea = s.parentNode;
        var h = chartArea.innerHTML;
        h = h.replace('<svg', '<g transform="translate(100, ' + i * (chartArea.offsetHeight + 10) + ')" ');
        h = h.replace('</svg>', '</g>');
        svg += h;
    });
    svg = '<svg height="' + chartContainer.getElementsByTagName('svg').length * (chartArea.offsetHeight + 10) + '" width="' + (chartArea.offsetWidth + 100) + '" version="1.1" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>'
    canvg(canvas, svg);
    var imgData = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);

    $.post("./GetData/DownloadImage.ashx", {
        data: imgData
    },
            function (k) {
                if (k)
                    location.href = "./GetData/DownloadImage.ashx?k=" + k;
            });
}

//轉置圖片於指定容器
function toImg(chartContainer, imgContainer) {
    var doc = chartContainer.ownerDocument;
    var img = doc.createElement('img');
    img.src = getImgData(chartContainer);

    while (imgContainer.firstChild) {
        imgContainer.removeChild(imgContainer.firstChild);
    }
    imgContainer.appendChild(img);
}
//*************************************

//列印指定區域
function printArea(obj) {
    var newWindow = window.open("列印", "_blank");
    var docStr = obj.innerHTML;
    newWindow.document.write(docStr);
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
}

//查詢系統功能權限
function IsSysFuncRight(funcid) {
    var IsHaveRight = false;
    try {
        for (var i = 0; i < arrToolbar.length; i++) {

            if (arrToolbar[i].FuncId == funcid) {
                IsHaveRight = true;
                break;
            }
        }
    } catch (ex) { IsHaveRight = false; }
    return IsHaveRight
}

//色碼轉換 *****************************
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function hexToABGR(alpha, color) {
    color = color.replace("#", "");
    var hexAlpha = StrRight("00" + parseInt(alpha * 255).toString(16), 2);
    var hexBGR = color.substr(4, 2) + color.substr(2, 2) + color.substr(0, 2);
    return (hexAlpha + hexBGR).toUpperCase();
}
//**************************************

//轉換時間(分鐘)單位
function formatTimeMinute(mins) {

    var iMins = parseInt(mins);
    var sRe = "";

    if (iMins >= (60 * 24)) //大於1天
    {
        iMins = Math.floor(iMins / (60 * 24));
        sRe = iMins.toString() + "天";
    }
    else if (iMins >= 60) //大於1小時
    {
        iMins = Math.floor(iMins / 60);
        sRe = iMins.toString() + "小時";
    }
    else
        sRe = iMins.toString() + "分鐘";

    return sRe;
}

//取出區域名稱
function getCounTownName(coun, town) {
    for (var i = 0; i < arrCounTown.length; i++) {
        if (arrCounTown[i].COUN_ID == coun) {
            if (town == "") {
                return arrCounTown[i].COUN_NA;
            } else {
                for (var j = 0; j < arrCounTown[i].TOWN.length; j++) {
                    if (arrCounTown[i].TOWN[j].TOWN_ID == town) {
                        return arrCounTown[i].TOWN[j].TOWN_NA;
                    }
                }
            }
        }
    }
}

//陣列物件排序
//name:主要排序對象
//minor:次要排序函式
var sortBy = function (name, minor) {
    return function (o, p) {
        var a, b;
        if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[name];
            b = p[name];
            if (a === b) {
                return typeof minor === 'function' ? minor(o, p) : 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        } else {
            throw ("error");
        }
    }
}

//檔案上傳
/*
 * divid :容器ID
 * appendTarget:附加至元素ID 
 * limitOpts:上傳限制{FileSize:intVal(MB), FileFmt:arrVal} 
*/
function createFileUpload(divid, appendTarget, limitOpts, callback) {
    var FileSize = limitOpts.FileSize;
    var FileFmt = limitOpts.FileFmt.toString();
    var html = "";
    html += "<div id='" + divid + "' style='width:500px; font-size:13px'>";
    html += "  <form name='uploadForm' method='post' enctype='multipart/form-data'>";
    html += "    <input name='file' type='file'><input type='button' value='匯入'>";
    //html += "    <div>檔案大小:" + FileSize + "MB以內，檔案格式:限" + FileFmt + "</div>";
    html += "    <div>檔案大小:" + FileSize + "MB以內，檔案格式:限" + FileFmt + "<div>";
    html += "    <div style='text-align:right'>格式範例:<a href='範例CSV.csv' target='_blank'>CSV格式範例下載</a></div>"; //2015/04/30 這邊要在修正不然會出問題
    html += "  </form><br>";
    html += "  <div style='color:red; display:none'>資料處理中...</div>";
    html += "</div>";
    $("#" + appendTarget).append(html);
    $("#" + divid + " input[type='button']").click(function () {
        uploadAndSubmit(divid, limitOpts, callback);
    });

    $("#divMptFileUpload").dialog({
        title: "匯入檔案",
        modal: true
    });
}
//匯入檔案
function uploadAndSubmit(divid, limitOpts, onLoadCallback) {
    $("#" + divid + ">div:eq(0)").show();
    var form = document.forms["uploadForm"];

    if (form["file"].files.length > 0) {
        var SizeLimit = 1024 * 1024 * limitOpts.FileSize;
        var file = form["file"].files[0];
        var regFileFmt = (new RegExp('(' + limitOpts.FileFmt.join('|').replace(/\./g, '\\.') + ')$'));
        var isValid = "Y";

        if (!regFileFmt.test(file.name)) {
            alert("檔案格式限制為" + limitOpts.FileFmt.toString() + "，請重新選擇檔案。");
            isValid = "N";
        }
        if (file.size > SizeLimit) {
            alert("檔案匯入限制為" + (SizeLimit / 1024 / 1024) + "MB以內，請重新選擇檔案。");
            isValid = "N";
        }

        var result;
        if (isValid == "Y") {
            //取出副檔名
            var extIdx = file.name.lastIndexOf('.');
            var extName = file.name.substr(extIdx + 1, file.name.length);

            //讀入檔案
            var reader = new FileReader();
            //reader.onload = onLoadCallback;
            reader.onload = function (e) {
                onLoadCallback(e, extName);
            };
            //reader.readAsText(file);
            reader.readAsText(file, 'big5');
            return result;
        }
        else {
            return "error";
            //$("#" + divid).dialog("close");
        }
    }
    else {
        alert("請選擇檔案。");
    }
}

//座標轉換
function coordinatesTransfer(x, y, srcCoor, dstCoor) {
    Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    Proj4js.defs["EPSG:3826"] = "+proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=???? +no_defs";
    Proj4js.defs["EPSG:3828"] = "+proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=121 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";
    Proj4js.defs["EPSG:3857"] = "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
    Proj4js.defs["EPSG:102100"] = "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

    if (typeof x == "string") {
        x = parseFloat(x);
    }
    if (typeof y == "string") {
        y = parseFloat(y);
    }

    var src = new Proj4js.Proj(srcCoor);
    var dst = new Proj4js.Proj(dstCoor);
    var point = new Proj4js.Point(x, y);
    Proj4js.transform(src, dst, point);
    var result = new Object();
    result.x = point.x;
    result.y = point.y;

    return result;
}

//取出指定陣列物件
function getArryObj(arry, keyname, keyval) {
    var obj = "";
    for (var i = 0; i < arry.length; i++) {
        //if (arry[i][keyname] == keyval) {
        if (arry[i][keyname] !== null) {//避免目標物件沒有屬性名稱keyname
            if (StrTrim(arry[i][keyname]) == StrTrim(keyval)) {
                obj = arry[i];
                break;
            }
        }
    }
    return obj;
}

// 移除指定陣列物件 2015/12/29 修改
function removeArryObj(arry, keyname, keyval) {
    var arryTmp = [];
    for (var i = 0; i < arry.length; i++) {
        if (arry[i][keyname] !== null) {
            if (StrTrim(arry[i][keyname]) != StrTrim(keyval)) {
                arryTmp.push(arry[i]);
            }
        }
    }
    return arryTmp;
}

//切換物件顯示狀態
function switchObjDisplay(target) {
    if ($("#" + target).is(":hidden")) {
        $("#" + target).show();
    } else {
        $("#" + target).hide();
    }
}

function closeTabs(tabTitle, tabContent, closeIcon, openIcon) {
    // $(tabTitle).height(35);
    $(tabContent).hide();
    $(closeIcon).hide();
    $(openIcon).show();
    $(openIcon).css("display", "inline-block");
    $(tabTitle).removeClass("openTab");
    $(tabTitle).addClass("closeTab");    
    if (fatDiv.indexOf(tabContent)>=0) {
        $("#mainRight").width("250px");
        $("#btnToggle").css("right", "250px");
    }
}

function openTabs(tabTitle, tabContent, closeIcon, openIcon) {
    // $(tabTitle).height("100%");
    $(tabContent).show();
    $(closeIcon).show();
    $(openIcon).hide();
    $(closeIcon).css("display", "inline-block");
    $(tabTitle).removeClass("closeTab");
    $(tabTitle).addClass("openTab");
    var contentWidth = $(tabContent).width();
    if (contentWidth > 250) {
        $("#mainRight").width(contentWidth);
        $("#btnToggle").css("right", contentWidth);
    }
}