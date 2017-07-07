/**********************************
 * SUMMARY ：地圖事件函式
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2013/06/26  Vicky Liang Create
             
 **********************************/

//地圖物件初始化
function initMap() {
    loading = dojo.byId("loadingImg");

    map = new esri.Map("map", {
        slider: true,               //是否顯示比例尺工具BAR
        sliderPosition: "top-right",
        //sliderStyle: "large",
        sliderLabels: lodsLabels,
        lods: curLods,              //比例尺參數
        zoom: mapDfZoom,
        center: new esri.geometry.Point(mapCenter[0], mapCenter[1], new esri.SpatialReference(mapSpRef)),
        logo: false
    });

    //基本底圖
    var urlWorld = (isToken == "Y") ? gpTiledMapWorld + "?Token=" + gpNCDR_Token : gpTiledMapWorld;
    var urlWorldI = (isToken == "Y") ? gpTiledMapWorldI + "?Token=" + gpNCDR_Token : gpTiledMapWorldI;
    lyrTiledMapWorld = new esri.layers.ArcGISTiledMapServiceLayer(urlWorld, { id: "lyrTiledMapWorld" }); //世界地圖-淺色地圖版
    lyrTiledMapWorldI = new esri.layers.ArcGISTiledMapServiceLayer(urlWorldI, { id: "lyrTiledMapWorldI" }); //世界地圖-影像地圖版
    map.addLayer(lyrTiledMapWorld, 1);
    map.addLayer(lyrTiledMapWorldI, 1);

    lyrTiledMapWorld.visible = false;
    lyrTiledMapWorldI.visible = true;

    //添加地圖事件
    map.on("load", function () {
        map.hideZoomSlider();
        if (typeof (mapSpRef) == "undefined") mapSpRef = map.spatialReference;

        getVerLogData();    //取出版次資料 2015/01/12 修改
        getOnlinePcnt();    //取出線上人數
        getBrowseCount();   //取出總瀏覽人次
        getLogonInfo();     //取出群組資訊
        //loadFuncList();     //載入圖層清單 // 2015/06/23 修改成在載入登入資訊後再執行，避免預設書籤載入有問題
        loadCounTownData(); //載入縣市鄉鎮資料

        createLod();

        if (typeof (oTimeline) == "undefined") {
            $("#divTimeline").load("ucWidget/Timeline.htm", function () {
                oTimeline = new Timeline();
                oTimeline.genTimeline();
                oTimeline.loadCaseList();
            });
        }

        dojo.connect(map, "onMouseMove", showCoordinates); //顯示滑鼠座標位置
        dojo.connect(map, "onMouseDrag", showCoordinates);
        dojo.connect(map, "onZoomEnd", MapZoomEnd);
        dojo.connect(map, "onExtentChange", MapExtentChange)
        dojo.connect(map, "onUpdateStart", showLoading);
        dojo.connect(map, "onUpdateEnd", hideLoading);

        // 2015/12/08 整合影像比對 Start
        dojo.connect(map, 'onLayerRemove', function (layer) {
            //圖例區移除遙測圖層圖例
            //延遲確認圖例區關閉
            setTimeout(function () {
                var b = true;
                for (var i = 0; i < map.layerIds.length; i++) {
                    if (map.layerIds[i] == layer.id) {
                        b = false;
                    }
                }
                if (b) {
                    $('#' + layer.id.replace('RemoteLayer_', 'of_')).remove();
                }
            }, 1000);
        });
        // 2015/12/08 整合影像比對 End

        /*
        //重新附加已開圖層
        if (arrOpenFuncs.length > 0)
            readdOpenLayer();

        //地圖畫家
        if (typeof (oMapPainter) != "undefined") {

            //建立畫布圖層
            if (typeof (oCom.Layer) == "undefined") {
                oCom.Layer = new esri.layers.GraphicsLayer({ id: "layerMapPainter", "opacity": 1 });
            }
            map.addLayer(oCom.Layer);

            if (oMapPainter.arrDrawList.length > 0) {
                oMapPainter.readdMptDraw(); //重繪畫布內容
            }
        }
        */
    });
}

function createLod() {
    var len = lods.length;
    var html = "";
    html += "<img class='zoomTaiwan' src='images/Scale/taiwan.png' title='回到全台' onclick=\"ZoomToLoc('" + mapCenter[0] + "','" + mapCenter[1] + "','" + mapTwLevel + "')\" />";
    for (var i = len - 1; i >= 0; i--) {
        var lev = i + 1;
        var img = "images/Scale/" + ((curLevel == i) ? "scale_on_" : "scale_off_") + lev + ".png";
        var scale = lods[i].scale;
        html += "<img id =\"imgS" + i + "\" src=\"" + img + "\" title=\"比例尺:" + lev + " (約1:" + scale + ")\" onclick=\"map.setScale(" + scale + ");\" />";
    }

    html += "<img id=\"optchang2\" src=\"images/Toolbar/opt_chang.png\" style=\"width: 28px;height: 28px;cursor: pointer;\" onclick=\"changeOption();\">"; // 2015/01/12 修改

    $("#divScale").append(html);
}

//設定地圖比例尺按鈕
function setLod(scale) {
    var layer = map.getLayer("lyrTiledMap" + curMapBase);
    if (typeof (layer) == "undefined") return;

    var html = "";

    if (layer.loaded) {
        var layerLods = (layer.minScale > mapVisScale) ? layer.tileInfo.lods : lods;
        var isExist;
        var nearScale;
        var vaildLods = [];

        $("#divScale img").show();
        for (var i = 0; i < lods.length; i++) {
            isExist = false;
            for (var j = 0; j < layerLods.length; j++) {
                if (lods[i].scale == layerLods[j].scale) {
                    isExist = true;
                    vaildLods.push({ idx: i, scale: lods[i].scale, level: lods[i].level });
                    break;
                }
            }

            //若在底圖比例尺中查無系統比例尺, 則隱藏比例尺選項
            if (!isExist) {
                $("#imgS" + i).hide();
            }
        }

        var idx;
        $("#divScale img").attr("src", function () { return this.src.replace("on", "off") });
        for (var k = 0; k < vaildLods.length; k++) {
            if (scale == vaildLods[k].scale) {
                idx = vaildLods[k].idx;
                break;
            } else {
                if (curZoomFactor > 1) { //放大
                    if (scale > vaildLods[k].scale) {
                        idx = vaildLods[k].idx;
                        map.setScale(vaildLods[k].scale);
                        break;
                    }
                } else { //縮小
                    if (scale > vaildLods[k].scale) {
                        idx = vaildLods[k - 1].idx;
                        map.setScale(vaildLods[k - 1].scale);
                        break;
                    }
                }
            }
        }

        if (typeof (idx) == "undefined")
        {
            idx = (curZoomFactor > 1) ? (vaildLods.length - 1) : 0;
            map.setScale(vaildLods[idx].scale);
        }

        $("#imgS" + idx).attr("src", function () { return this.src.replace("off", "on") });

        /* 原寫法:重新創建地圖
        var layerLods = (layer.minScale > 3000000) ? layer.tileInfo.lods : lods;
        if (curLods.length != layerLods.length) {
            curLods = layerLods;

            //重新創建地圖
            map.destroy();
            initMap();
            
            if (curLevel > curLods.length)
                curLevel = curLods.length - 2;

            map.setLevel(curLevel);
        }

        //重新產生比例尺圖示
        $("#divScale").empty();
        len = curLods.length;
        for (var i = len - 1; i >= 0; i--) {
            var lev = i + 1;
            var img = "images/Scale/" + ((curLevel == i) ? "scale_on_" : "scale_off_") + lev + ".png";
            var scale = curLods[i].scale;
            html += "<img id =\"imgS" + i + "\" src=\"" + img + "\" title=\"比例尺:" + lev + " (約1:" + scale + ")\" onclick=\"map.setScale(" + scale + ");\" />";
        }
        $("#divScale").append(html);
        */
    }
    else {
        dojo.connect(layer, "onLoad", setLod);
    }
}

//切換道路註記
function switchTwLabel(chked) {
    //傳入值為null時,依當前勾選狀態切換
    if (chked == null) {
        if ($("#cbTwLabel").length > 0) {
            var imgsrc = $("#cbTwLabel").attr("src");
            chked = (imgsrc.indexOf("uncheck.png") < 0) ? false : true;
        }
    }

    if (chked) {
        $("#cbTwLabel").attr("src", "images/FuncList/check.png"); //設定勾選狀態

        lyrTiledMapTwLabel = map.getLayer("lyrTiledMapTwLabel");
        if (typeof (lyrTiledMapTwLabel) == "undefined") {
            var url = (isToken == "Y") ? gpTwLabel + "?Token=" + gpNCDR_Token : gpTwLabel;
            lyrTiledMapTwLabel = new esri.layers.ArcGISTiledMapServiceLayer(url, { id: "lyrTiledMapTwLabel" }); //道路註記
            map.addLayer(lyrTiledMapTwLabel, 20);
        } else {
            lyrTiledMapTwLabel.show();
        }

    } else {
        $("#cbTwLabel").attr("src", "images/FuncList/uncheck.png"); //設定未勾選狀態
        lyrTiledMapTwLabel.hide();
    }
}

//切換底圖
function switchMapBase(funcid) {

    //道路註記
    var showTwLabel = ($("#cbTwLabel").attr("src").indexOf("uncheck.png") != -1) ? false : true;
    if (map.getScale() > 3000000) {
        if (showTwLabel == true) {
            lyrTiledMapTwLabel.hide();
            $("#cbTwLabel").attr("src", "images/FuncList/uncheck.png"); //設定未勾選狀態
            //var Obj = getArryObj(arrMapBg, "ID", funcid);
            ////切換底圖為電子地圖時,不顯示道路註記選單
            //if (Obj.SubType == "1") {
            //    $("#liTwLabel").hide();
            //} else {
            //    $("#liTwLabel").show();
            //}
        }

        //$("#liTwLabel").css("color", "gray");
        //$("#liTwLabel").children("span:eq(0)").unbind("click"); //移除click事件
    } else {
        //if (showTwLabel == true) {
            var Obj = getArryObj(arrMapBg, "ID", funcid);
            //切換底圖為電子地圖時,不顯示道路註記選單及圖層
            if (Obj.SubType == "1") {
                //$("#liTwLabel").hide();
                if (lyrTiledMapTwLabel)
                    lyrTiledMapTwLabel.hide();
                $("#cbTwLabel").attr("src", "images/FuncList/uncheck.png"); //設定未勾選狀態
            } else {
                //$("#liTwLabel").show();
                if (lyrTiledMapTwLabel)
                    lyrTiledMapTwLabel.show();
                $("#cbTwLabel").attr("src", "images/FuncList/check.png"); //設定勾選狀態
            }
        //}

        //$("#liTwLabel").css("color", "black");

        //選單click事件綁定
        //$("#liTwLabel").children("span:eq(0)").unbind('click').bind("click", function () { switchTwLabel(null); });
    }

    //底圖
    for (var i = 0; i < arrMapBg.length; i++) {

        if (arrMapBg[i].TiledMapUrl == "") continue;
        if (typeof (map.getLayer("lyrTiledMap" + arrMapBg[i].ID)) == "undefined") continue;

        if (arrMapBg[i].ID == funcid) {
            arrMapBg[i].Show = "Y";
            arrMapBg[i].Open = "Y";
            $("#cbFunc" + arrMapBg[i].ID).attr("src", "images/FuncList/check.png"); //設定勾選狀態

            //比例尺小於可視範圍時, 替換對應底圖
            resetMapBgbyScale(funcid, arrMapBg[i].Notes);

            curMapBase = funcid;
            setLod(curScale); //設定比例尺
        }
        else {
            arrMapBg[i].Show = "N";
            arrMapBg[i].Open = "N";
            $("#cbFunc" + arrMapBg[i].ID).attr("src", "images/FuncList/uncheck.png"); //設定勾選狀態

            map.getLayer("lyrTiledMap" + arrMapBg[i].ID).hide();
        }
    }

    //選單click事件綁定
    $("#liTwLabel").children("span:eq(0)").unbind('click').bind("click", function () { switchTwLabel(null); });
}

//當前地圖比例尺替換對應底圖
function resetMapBgbyScale(funcid, replaceMapbg) {

    //比例尺小於可視範圍時, 替換對應底圖
    if (map.getScale() > mapVisScale) {
        if (replaceMapbg == "MapWorld") {
            lyrTiledMapWorld.show();
            lyrTiledMapWorldI.hide();
        }
        else {
            lyrTiledMapWorld.hide();
            lyrTiledMapWorldI.show();
        }

        map.getLayer("lyrTiledMap" + funcid).hide();
    }
    else {
        lyrTiledMapWorld.hide();
        lyrTiledMapWorldI.hide();
        map.getLayer("lyrTiledMap" + funcid).show();
    }

    /*
    //判斷比例尺是否存在於預設值中,若無則不顯示替換底圖
    var isHaveScale = "N"
    for (var i = 0; i < lods.length; i++) {
        if (lods[i].scale == map.getScale()) {
            isHaveScale = "Y";
            break;
        }
    }
    if (isHaveScale == "N") {
        lyrTiledMapWorld.hide();
        lyrTiledMapWorldI.hide();
        map.getLayer("lyrTiledMap" + funcid).show();
    }*/
}

//地圖縮放動作結束後事件
function MapZoomEnd(extent, zoomFactor, anchor, level) {

    //map.infoWindow.hide();

    //重新設定圖層選單啟用狀態
    SetFuncItemActive(null, curFuncType, '');
    if (typeof (oRealInfoDemo) != "undefined" && $("#RealInfoDemoFuncNav").length > 0)
        oRealInfoDemo.SetFuncMenuActive(oRealInfoDemo.LayerData);

    //依當前比例尺重新縮放地圖貼圖尺寸
    //resetLayerGcSize(arrOpenFuncs);

    //依當前比例尺切換底圖
    curLevel = map.getLevel();
    curScale = map.getScale();
    curZoomFactor = zoomFactor;
    switchMapBase(curMapBase);

    //遙測圖層限制比例尺
    if (typeof (oRemoteList) != "undefined") { //+// charlie
        oRemoteList.LimitRemoteZoom(level);
    }

}

//地圖範圍改變事件
function MapExtentChange(extent, delta, outLevelChange, outLod) {

    //顯示當前刻度
    dojo.byId("ScaleInfo").innerHTML = "LOD Level: <i>" + outLod.level
                                 + "</i> Resolution: <i>" + outLod.resolution
                                 + "</i> Scale: <i>" + outLod.scale + "</i>";

    //依當前比例尺設定底圖選項是否可啟用
    for (var i = 0; i < map.layerIds.length; i++) {
        if (map.layerIds[i].toString().indexOf("TiledMap") < 0) continue;

        var layer = map.getLayer(map.layerIds[i]);
        var MaxScale = layer.maxScale;
        var MinScale = layer.minScale;
        if (map.getScale() >= MaxScale && map.getScale() <= MinScale) {
            if ($("#btn" + layer.id).length > 0) {
                $("#btn" + layer.id).attr('disabled', false);
            }
        } else {
            if ($("#btn" + layer.id).length > 0) {
                $("#btn" + layer.id).attr('disabled', true);
            }
        }
    }

    //重整已開啟圖層資料
    refreshOpenLayer();

    //災害事件圖片
    if (typeof (oEventPictQry) != "undefined" && oEventPictQry != null) oEventPictQry.refreshDataTable(oEventPictQry.arrSrcData);

    //重新定位地圖畫家的文字訊息框
    if ($("#divMapPainterDraw").length > 0 && $("#divMapPainterDraw").html() != "") oMapPainter.relocTipbox();
}

//顯示顯示滑鼠座標位置
function showCoordinates(evt) {
    var mp, posTitle, posX, posY;

    if (typeof (mapSpRef) != "undefined" && mapSpRef.wkid == "4326") {
        mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
        posTitle = "WGS84";
        posX = mp.x.toFixed(6);
        posY = mp.y.toFixed(6);

        var XY97 = coordinatesTransfer(posX * 1, posY * 1, "EPSG:4326", "EPSG:3826");
        dojo.byId("PosInfo").innerHTML = posTitle + "坐標：" + posX.toString() + ", " + posY.toString() + " (TWD97坐標：" + parseInt(XY97.x) + ", " + parseInt(XY97.y) + ")";
    } else {
        mp = evt.mapPoint;
        posTitle = "TWD97";
        posX = parseInt(mp.x);
        posY = parseInt(mp.y);
        dojo.byId("PosInfo").innerHTML = posTitle + "坐標：" + posX.toString() + ", " + posY.toString();
    }
}

//地圖事件處理進度
function showLoading() {
    esri.show(loading);
    //map.disableMapNavigation();
    //map.hideZoomSlider();
}
function hideLoading() {
    esri.hide(loading);
    //map.enableMapNavigation();
    //map.showZoomSlider();
}

/* 位移並放大至定位點
 * x: x座標 
 * y: y座標
 * l: 比例層級
 */
function ZoomToLoc(x, y, l) {
    var pt = new esri.geometry.Point(parseFloat(x), parseFloat(y), new esri.SpatialReference(mapSpRef));
    map.centerAndZoom(pt, l);
}

//依當前比例尺重新縮放地圖貼圖尺寸
function resetLayerGcSize(arrList) {
    var exec, layer;
    for (var i = 0; i < arrList.length; i++) {
        exec = arrList[i].Exec;

        if (exec == "RealImage") {
            layer = map.getLayer("layerRealImage" + arrList[i].ID);
        } else if (exec == "EstImage") {
            layer = map.getLayer("layerEstImage" + arrList[i].ID);
        } else {
            continue;
        }

        if (typeof (layer) != "undefined") {
            resetImgLayer(layer);
        }
    }
}

//重新設定地圖中心位置
function resetMapCenter(callback) {
    var center = map.extent.getCenter();
    var level = map.getLevel();
    map.resize();
    map.reposition();

    if (typeof (mapSpRef) != "undefined" && mapSpRef.wkid == "4326") {
        center = esri.geometry.webMercatorToGeographic(center);
    }

    setTimeout(function () {
        ZoomToLoc(center.x, center.y, level);
        if (callback) {
            callback();
        }
    }, 300);
}

//開啟地圖查詢工具區
function openMapTool(event, type, toolid) {
    
    curMapTool = type;
    curExecTool = toolid; //記錄點擊功能ID
    setCounterFunc(curExecTool, "", "Q", "GIS");//功能操作紀錄
    //重設圖片
    var evt = event ? event : (window.event ? window.event : null);
    var obj = evt.srcElement ? evt.srcElement : evt.target;
    if (obj.className == "MapTool") {
        //$(obj.parentElement).find("img").attr("src", function () { return this.src.replace("_on", "_off") });
        //$(obj).attr("src", function () { return this.src.replace("_off", "_on") });
        // 2015/01/12 修改
        $(obj.parentElement).find("div").css({ "background-color": "#FFF", "color": "#0084AD" });
        $(obj).css({ "background-color": "#0084AD", "color": "#FFF" });
    }
    //$("#divMapToolArea").show();
    $('#ToolsDiv').css('width', '350px'); // 2015/01/12 修改
    $('#ListBanner').css('display', 'block'); // 2015/01/12 修改
    $("#divMapToolArea").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
    //debugger;
    //建立貼圖圖層
    var layer = map.getLayer("lyrIdentify");
    if (typeof (layer) == "undefined") {
        layer = new esri.layers.GraphicsLayer({ id: "lyrIdentify", "opacity": 1 });
        map.addLayer(layer);
    } else {
        if (isInFldPrt != "Y"){
            layer.clear();
        }
    }
    currSelTool = type;
    //初始化地圖查詢介面
    if (typeof (oMapQry) != "undefined") {
        if (isInFldPrt != "Y") {//@2016/03/29 Kevin 淹水兵棋台內切換頁籤時，不把環域分析紀錄清掉
           oMapQry.disposeMapQry();
        } 
    } else {
        oMapQry = new MapQry();
        oMapQry.Layer = layer;
        oMapQry.initMapQry();
    }
    
    var title = $(obj).attr("alt");
    var desc = "";
    var rlt = "";

    $("#MapToolType").text("結束查詢"); // 2015/12/08 整合影像比對
    if (isInFldPrt != "Y")//@2016/03/29 Kevin 淹水兵棋台內切換頁籤時，不把環域分析紀錄清掉
    { $("#MapToolResult").empty(); }

    // 2015/12/08 整合影像比對 Start
    if (type != 'LayerSwipe') {
        $('#swipe-leg').hide();
        $('.swipe-control').css('display', 'none'); // 2015/05/06 開啟其他工具若非影像比對，即關閉視窗
        if (typeof (swipeTool) != 'undefined')
            $("#MapToolType").click();
    }
    // 2015/12/08 整合影像比對 End

    // 2016/02/04 修改：環域分析強化 Start
    $('#AreaAnalysisDiv').hide(); 
    $('#AreaAnalysisMapList').hide();
    $('#AreaAnalysisStatDiv').hide();
    $('#divMapToolArea').css('overflow-y', 'hidden'); 
    // 2016/02/04 修改：環域分析強化 End
    //2016/03/11 淹水兵棋台
    $('#FloodingAreaDiv').hide();
    $('#FloodingHeightDiv').hide();
   
    if (isInFldPrt == "Y") {
        if (currSelTool != "AreaAnalysis") {
            //$("#MapToolResult").html('');
            $("#RT_AreaAnalysis").hide();
            if (currSelTool != "Line") {
                $("font:contains('總距離：')").remove();               
            }
            if (currSelTool != "Polygon") {                
                $("font:contains('總面積')").remove();
            }
        } else {
            $("#RT_AreaAnalysis").show();
            $('#AreaAnalysisMapList').show();
            $("font:contains('總距離：')").remove();
            $("font:contains('總面積')").remove();
            $("#MapToolResult br").remove();          
        }
    }
    
    dojo.disconnect(fldClickHandler);
    isFirstIn = "Y";
    switch (type) {
        case "Identify":             
            desc = "使用說明：<br>將游標移至開啟的地圖上，<br>點擊滑鼠左鍵即可查詢已開啟圖資。<br><br>預設查詢圖資：<br>縣市界、鄉鎮界、村里界、河川。"
            oMapQry.tbMapOn("POINT");            
            break;

        case "KRID":
            desc = "使用說明：<br>在地圖上以滑鼠單點欲查詢區域，<br>即可顯示該位置之雷達_雨量站降雨整合估計資料。"
            oMapQry.tbMapOn("POINT");
            break;

        case "Line":
            desc = "使用說明：<br>請於地圖上使用滑鼠左鍵開始測量距離，雙擊兩下結束。"
            rlt = "<br><font color='green'>總距離：0 KM</font>";
            if (isInFldPrt != "Y") {
                $("#MapToolResult").html(rlt);
            } else { $("#MapToolResult").prepend(rlt); }//@2016/04/07 Kevin 淹水兵棋台內切換頁籤時，不把環域分析紀錄清掉
            oMapQry.tbMapOn("POLYLINE");
            break;

        case "Polygon":
            desc = "使用說明：<br>請於地圖上使用滑鼠左鍵開始測量面積，雙擊兩下結束。"
            rlt = "<br><font color='blue'>總面積：0 KM<sup>2</sup></font>";
            if (isInFldPrt != "Y") {
                $("#MapToolResult").html(rlt);
            } else { $("#MapToolResult").prepend(rlt); }//@2016/04/07 Kevin 淹水兵棋台內切換頁籤時，不把環域分析紀錄清掉
            oMapQry.tbMapOn("POLYGON");
            break;

        case "Terrain":
            desc = "使用說明：<br>在地圖上以滑鼠單點查詢區域範圍，即可顯示該位置範圍內地形高程資料。"
            oMapQry.tbMapOn("POINT");
            break;

        case "ProfileLine":
            desc = "使用說明：<br>在地圖上使用滑鼠左鍵開始繪製線段,雙擊兩下結束，即可顯示地形剖面資訊。<br><br>剖面線呈現最多為十段，<font color='red'>長度須大於500公尺</font>。"
            oMapQry.tbMapOn("POLYLINE");
            break;

        case "GStreetView":
            desc = "使用說明：<br>在地圖上以滑鼠單點欲查詢區域，即可顯示該位置街景。"
            oMapQry.tbMapOn("POINT");
            break;

        case "AreaAnalysis":
            currSelTool = "AreaAnalysis";
            $('#divMapToolArea').css('overflow-y', 'auto');
            //desc = "使用說明：請先勾選[資料庫點位類圖層]，再進行環域(區域)統計分析" 
            desc = "使用說明：<br>請先勾選欲分析之[圖層清單]，依序按照步驟，進行環域(區域)統計分析。"; 
            $('#AreaAnalysisDiv').show();
            $('#AreaAnalysisStatDiv').show();
            oMapQry.tbMapOn("ALL");
            oMapQry.Account = account;
            break;

         // 2015/12/08 整合影像比對 Start
        case "LayerSwipe":
            desc = "使用說明：<br>請先套疊圖層，再至[影像比對]視窗中勾選欲比對之圖層，即可進行比對操作。<br>點選[影像比對]視窗中的[圖例]按鈕可開關[影像比對]視窗";
            oMapQry.tbMapOn("ALL");
            $("#MapToolType").text("結束比對");
            $("#MapToolType").removeAttr('onclick');
            $("#MapToolType").on('click', function () {
                $(this).attr('IsActive', 'N');
                swipeTool.swap(false);
                $('.swipe-control').hide();
                $('.swipe-control .swipe-layer .OpnFunc input[type=checkbox]').each(function (i) {
                    $(this)[0].checked = false;
                });
            });

            if (typeof (swipeTool) == 'undefined') {
                $('head').append($('<script src="JS/SwipeTool/SwipeTool.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"></script>'));
                $('head').append($('<link rel="stylesheet" type="text/css" href="JS/SwipeTool/swipe.css?v=' + Math.floor(Math.random() * 1E6 + 1) + '">'));

                swipeTool = new SwipeTool();
                swipeTool.init();
                var div = $('#MapToolResult');
                swipeTool.swipeswitch(div);
            }
            $('.swipe-control').css('display', 'block');
            break;
         // 2015/12/08 整合影像比對 End

        case "MapRoute": // 2015/05/25 修改
            //desc = "使用說明：用左鍵在圖面點選，再點選<img src=\"images/MapTool/LocateInMap.png\" style=\"width:29.6px;height:33.6px;\" title=\"\" />，並決定屬性(起點、中繼點、迄點)，需兩點可進行路徑規劃。"
            desc = "使用說明：用左鍵在圖面點選，再點選圖示，並決定屬性(起點、中繼點、迄點)，需兩點可進行路徑規劃。"
            desc += "<br/><div style=\"margin-left:65%;\"><input type='button' id='goPlan' value='清除' onclick='oMapQry.ClearPlan();' />";
            desc += "<input type='button' id='goPlan' value='規劃' onclick='oMapQry.goPlan();' style=\"margin-left:10px;\" /></div>";
            oMapQry.tbMapOn("Route");            
            break;
        case "FloodingArea": // 淹水兵棋台 淹水頁籤區塊內容 2016.3.11 Kevin Add
            
            if (entrysys == "1") {                
                $('#divMapToolArea').css('overflow-y', 'auto');
                //desc = "使用說明：請先勾選[資料庫點位類圖層]，再進行環域(區域)統計分析" 
                desc = "使用說明：<br>在地圖上，使用滑鼠左鍵點擊欲查詢的位置，以及於下方輸入淹(積)水高度，即可顯示鄰近<div style='display:inline;color:red;text-decoration:underline;'>一公里</div>淹水區域。";
                $('#FloodingAreaDiv').show();
                $('#FloodingHeightDiv').show();
               //載入快速定位工具
                $("#FastLocPart").load("ucWidget/FastLoc.htm", function () {
                    $('#FastLocPart .LocOperate').hide();
                    $('#FastLocPart #divLocAddress').show();
                    $('#FastLocPart #divLocXY').show();
                    $('#FastLocPart #divLocAddress label').hide();
                    $('#FastLocPart #divLocXY #LocXYHeader').replaceWith("<input type='radio' name='stepOne' value='locXY' />輸入坐標");
                    $('#FastLocPart #divLocAddress #LocAddressHeader').replaceWith("<input type='radio' name='stepOne' value='locAddress' />輸入地址");
                    //建立定位圖層 START
                    layerFastLoc = map.getLayer("layerFastLoc");
                    if (typeof (layerFastLoc) == "undefined") {
                        layerFastLoc = new esri.layers.GraphicsLayer({ id: "layerFastLoc", "opacity": 1 });
                        map.addLayer(layerFastLoc);
                    }
                    
                    //建立定位圖層 END
                    if (typeof (oFastLocFlooding) == "undefined") {
                        oFastLocFlooding = new FastLoc();
                        oFastLocFlooding.initFastLocFlooding();
                        oFastLocFlooding.Layer = layerFastLoc; 
                        oFastLocFlooding.isForFlooding = "Y";
                    } else { oFastLocFlooding.initFastLocFlooding(); }

                });
                
                $("#btn_floodingHeight").unbind().on("click", function () {
                    oModfldPrt.CalFloodingArea();
                    //setTimeout(function () { oModfldPrt.CalEffectPopulation(); }, 5000);
                    //oModfldPrt.CalEffectPopulation();
                });
               


            }
            break;

    }
    $("#MapToolTitle span").text(title);
    $("#MapToolType").attr("ToolType", type);
    $("#MapToolType").attr("IsActive", "Y");
    $("#MapToolType").text("結束查詢");
    $("#MapToolDesc").html(desc);

}

//切換當前地圖工具狀態(開始/結束)
function switchMapToolStatus(event) {
    var evt = event ? event : (window.event ? window.event : null);

    if ($("#MapToolType").attr("IsActive") == "Y") {
        $("#MapToolType").attr("IsActive", "N");
        $("#MapToolType").text("開始查詢");
        if (typeof (oMapQry) != "undefined") {
            oMapQry.disposeMapQry();
        }
    } else {
        $("#MapToolType").attr("IsActive", "Y");
        $("#MapToolType").text("結束查詢");
        openMapTool(evt, $("#MapToolType").attr("ToolType"));
    }
}

//關閉地圖查詢工具
function closeMapTool() {
    $("#ToolsDiv").css('width', '45px'); // 2015/01/12 修改
    $('#ListBanner').css('display', 'none'); // 2015/01/12 修改
    $('#divMapToolArea').hide();
    oMapQry.Layer.clear();
    oMapQry.tbMapOff();
}

//取出地圖範圍
function getMapExtent() {
    var mapExtent, Lx, Rx, By, Ty;
    if (typeof (mapSpRef) != "undefined" && mapSpRef.wkid == "4326") {
        mapExtent = esri.geometry.webMercatorToGeographic(map.extent);
        Lx = mapExtent.xmin.toFixed(5);
        Rx = mapExtent.xmax.toFixed(5);
        By = mapExtent.ymin.toFixed(5);
        Ty = mapExtent.ymax.toFixed(5);
    }
    else {
        Lx = parseInt(map.extent.xmin);
        Rx = parseInt(map.extent.xmax);
        By = parseInt(map.extent.ymin);
        Ty = parseInt(map.extent.ymax);
    }

    return { xmin: Lx, xmax: Rx, ymin: By, ymax: Ty };
}



//Pair(key-value) Object
function PairObj() {
    //此物件的功能是，可以加入key-value pair，如果要加入的key已經存在，則把value加在原value上，並用逗點區隔
    //最後就能產生出類似群組選單的資料結構
    var oCom = this;
    oCom.PairArray = {};

    //public method : 加入key-value，若key已存在，則把value加入原value，並用逗點區隔
    oCom.push = function (_key, _value) {
        if (typeof (oCom.PairArray[_key]) == "undefined") {
            oCom.PairArray[_key] = _value;
        }
        else {
            oCom.PairArray[_key] = oCom.PairArray[_key] + "," + _value;
        }
    }
    //public method : 設定key對應的value值
    oCom.set = function (_key, _value) {
        oCom.PairArray[_key] = _value;
    }
    //public method : 傳回key值對應的value，並把此key-value移除
    oCom.pop = function (_key) {
        var _value;
        if (typeof (oCom.PairArray[_key]) == "undefined") {
            _value = null;
        } else {
            _value = oCom.PairArray[_key];
            delete oCom.PairArray[_key];
        }
        return _value;
    }
    //public method : 取得key值對應的value
    oCom.get = function (_key) {
        var _value;
        if (typeof (oCom.PairArray[_key]) == "undefined") {
            _value = null;
        } else {
            _value = oCom.PairArray[_key];
        }
        return _value;
    }

    //public method : 清空/初始化
    oCom.clear = function () {
        oCom.PairArray = {};
    }
}
