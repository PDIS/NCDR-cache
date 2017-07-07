/**********************************
 * SUMMARY ：地圖查詢 函式
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2014/01/16  Vicky Liang Create

 **********************************/
function MapQry() {
    var oCom = this;
    //圖層
    oCom.Layer;
    oCom.Account;  // 2016/02/04 修改：環域分析強化

    var currentEvtGeom;
    //查詢結果的Div名稱
    var divMapQry = "";
    var divOffsetLeft = "";
    var divOffsetTop = "";
    //var curMapQryTool = "";
    //繪圖工具（點、線、面）
    var tbMapDraw = new esri.toolbars.Draw(map, { showTooltips: false });
    //圖資查詢
    var identifyTask = new esri.tasks.IdentifyTask(gpNCDRLayers + "?Token=" + gpNCDR_Token);
    var geometryService = new esri.tasks.GeometryService(gpGeomeService + "?Token=" + gpNCDR_Token);
    var identifyParams;
    var layerEventMouseover;//滑鼠滑過圖形事件
    var layerEventMouseout;//滑鼠離開圖形事件
    //雷達雨量站
    var settingStartTime = "";//儲存設定區手動設定的時間
    var settingEndTime = "";
    //街景
    var streetViewCount = 0;//存放街景編號
    var streetViewPlace = new PairObj();//存放街景座標
    //地形剖面線
    var PL_data;
    //環域分析
    var AA_geom = [];
    var AA_bufferSize = [];
    var AA_Extent = [];
    var AA_currIndex = 0;
    var AA_currMode = "";
    var AA_lyrPair = new PairObj();

    var AA_featureSet = {};
    var AA_featureColor = {};
    var AA_currLyrSet;
    var AA_displayLyrSet = [];
    var isFirstIn = "Y";

    // 2015/05/25 修改：增加路徑規劃的參數
    var btnck; //mousedown function
    var menuX, menuY;
    var directionsDisplay, directionsService;
    var jsonObj = {};
    var panorama;//街景物件
    var StartPoint = null, EndPoint = null, MidPoint = null; // 路徑規劃：出發點、加至旅程

    var MapListData; // 2016/02/04 修改：環域分析強化
    var AA_MapList = []; // 2016/02/04 修改：環域分析強化
    var chkGoemList = []; // 2016/02/04 修改：環域分析強化
    var jsonArryPair = new PairObj(); // 2016/02/04 修改：環域分析強化
    

    // public method begin ////////////////////////////////////////////////////
    //介面初始化
    oCom.initMapQry = function () {
        if ($('#' + divMapQry)) {
            $('#' + divMapQry).remove();//移除圖資查詢結果的DIV
        }
        //事件綁定
        tbMapDraw.on("draw-start", startMapDraw);
        tbMapDraw.on("draw-end", endMapDraw);
        dojo.connect(geometryService, "onLengthsComplete", function (result) { outputDistance(result, 'MapToolResult'); });
        dojo.connect(geometryService, "onAreasAndLengthsComplete", function (result) { outputAreaAndLength(result, 'MapToolResult'); });
    }
    //介面終止
    oCom.disposeMapQry = function () {
        tbMapDraw.deactivate();
        if (typeof (oCom.Layer) != "undefined") {
            oCom.Layer.clear();
        }
       
        if ($('#' + divMapQry)) {
            $('#' + divMapQry).remove();//移除圖資查詢結果的DIV
        }
        if ($('#' + divMapQry + "Result")) {
            $('#' + divMapQry + "Result").remove();//移除圖資查詢結果的DIV
        }
        if ($('#' + divMapQry + "IdentifyResult")) {
            $('#' + divMapQry + "IdentifyResult").remove();
        }
        map.infoWindow.hide();//關閉infowindow

        //解除事件綁定
        dojo.disconnect(layerEventMouseover);
        dojo.disconnect(layerEventMouseout);
        dojo.disconnect(btnck); // 2015/05/25 解除路徑規劃地圖事件綁定

        //移除街景紀錄
        streetViewCount = 0;
        streetViewPlace.clear();

        //移除環域分析紀錄
        AA_geom = [];
        AA_bufferSize = [];
        AA_Extent = [];

        // 2015/05/25 關閉路徑規劃        
        CloseRouteFun();

        // 2016/02/04 修改：環域分析強化 
        oCom.closeAreaAnalysisMapList();
    }
    //開啟繪圖工具(tbType繪圖工具類型:"POINT","POLYLINE","POLYGON")
    oCom.tbMapOn = function (tbType) {
        switch (tbType) {
            case "POINT":
                tbMapDraw.activate(esri.toolbars.Draw.POINT);
                break;
            case "POLYLINE":
                tbMapDraw.activate(esri.toolbars.Draw.POLYLINE);
                break;
            case "POLYGON":
                tbMapDraw.activate(esri.toolbars.Draw.POLYGON);
                break;
            case "Route": // 2015/05/25 修改                
                btnck = dojo.connect(map, "onMouseDown", MouseDownByRoute);
                break;
            case "ALL":
                //debugger;
                if (curMapTool == "AreaAnalysis") {
                    btnck = dojo.connect(map, "onMouseDown", CtrlBufferFun); // 2016/02/04 修改：環域分析強化
                    divMapQry = "RT_AreaAnalysis";
                    oCom.tbMapOff();
                   
                    if (isInFldPrt == "Y") {//@2016/03/16 Kevin 淹水兵棋台預設要帶入半徑兩公里等,故用AreaAnalysisCreateListDivForFlooding()                       
                        //RemoveGraphicByID(oFastLocFlooding.Layer, "", ""); //移除圖層所有圖片
                        AreaAnalysisCreateListDivForFlooding();                                       
                    }
                    else { AreaAnalysisCreateListDiv(); }
                }
            default:
                break;
        }
    }
    //關閉繪圖工具
    oCom.tbMapOff = function () {
        tbMapDraw.deactivate();
    }
    //用以重載資料
    oCom.reloadSrcData = function () {
        //先檢查目前是使用哪個地圖工具，以及結果清單是否已開啟
        if ($('#' + divMapQry).length) {
            switch (divMapQry) {
                case "RT_KRIDHistory":
                    updateKRID();
                    break;
            }
        }
    }

    // 開始路徑規劃 2015/05/25 修改
    oCom.goPlan = function () {
        goPlanWay();
    }

    // 清除路徑規劃 2015/05/25 修改
    oCom.ClearPlan = function () {
        initRoute();
    }

    // 更換圖示、設定點屬性 2015/05/25 修改
    oCom.setPointPic = function (sLat, sLng, PType) {
        setPointAtr(sLat, sLng, PType);
    }

    // 起點、中繼點、終點點位順序更動 2015/05/25 修改
    // input：欄位元素索引值、up/down、觸發來源點位(ex：StartPoint)、欲改變的點位、欲改變的點位代號(ex：M)、觸發來源點位代號
    oCom.chgPoints = function (elindex, type, OrPt, ChgPt, ChgFlg, OrgFlg) {
        chgPointAtr(elindex, type, OrPt, ChgPt, ChgFlg, OrgFlg);
    }

    // 開啟街景 2015/05/25 修改
    oCom.openStreetView = function (Lng, Lat) {
        showStreetView(Lng, Lat);
    }
    // 關閉街景 2015/05/25 修改
    oCom.closeStreetView = function () {
        toggleStreetViewClose();
    }

    // public method end   ////////////////////////////////////////////////////


    // private method begin //////////////////////////////////////////////////
    //地圖繪圖開始(General)
    function startMapDraw(evt) {
        if (typeof (oCom.Layer) != "undefined") {
            oCom.Layer.clear();
        }
    }
    //地圖繪圖結束(General)
    function endMapDraw(evt) {

        switch (evt.geometry.spatialReference.wkid) {
            case 102443:
                currentEvtGeom = coordinatesTransfer(evt.geometry.x, evt.geometry.y, "EPSG:3826", "EPSG:4326");
                break;
            case 4326:
                currentEvtGeom = evt.geometry;
                break;
        }

        //呼叫功能函式
        switch (curMapTool) {
            case "Identify":
                divMapQry = "divIdenRlt";
                execIdentify(evt);
                break;
            case "Line":
            case "Polygon":
                execMeasure(evt);
                break;
            case "KRID":

                divMapQry = "RT_KRIDHistory";
                execKRID(evt);
                break;
            case "GStreetView":
                divMapQry = "divGStreetViewRlt";
                execGStreetView(evt);
                break;
            case "Terrain":
                divMapQry = "RT_Terrain";
                execTerrain(evt);
                break;
            case "ProfileLine":
                divMapQry = "RT_ProfileLine";
                execProfileLine(evt);
                break;
            case "AreaAnalysis":
                divMapQry = "RT_AreaAnalysis";
                execAreaAnalysis(evt);
                $('#AA_mode_ALL').click();
                break;
        }
    }

    //執行圖資查詢(Identify)
    function execIdentify(evt) {
        oCom.Layer.clear();
        //標示點位
        //點的樣式：十字
        var sms = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([255, 0, 0, 1]));
        var gc = new esri.Graphic(evt.geometry, sms);
        gc.id = "";
        oCom.Layer.add(gc);

		$('#' + divMapQry + 'Result').remove();
        AreaAnalysisGetData(evt.geometry, IdtRadius);
        AreaAnalysisLayerQuery(evt.geometry, IdtRadius);
    }
    //圖資查詢完成後的動作(Identify)舊版:未整合前
    function doIdentifyTask() {
        //Symbol：多邊形，藍底藍框
        var blueSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 2), new dojo.Color([0, 0, 255, 0.25]));
        //Symbol：多邊形，紅底紅框
        var redSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.25]));
        //處理查詢到的結果
        identifyTask.execute(identifyParams, function (idResults) {

            var divIdentifyList = "divIdenList";//圖資查詢的結果的Div名稱
            var polyPreIdentify = "IdentPoly";//圖資查詢多邊形前置詞
            hideLoading();//隱藏讀取中gif

            //Pair(key-value) Object，此物件用來組出結果清單
            var lyrPair = new PairObj();
            for (i = 0; i < idResults.length; i++) {
                var idResult = idResults[i];
                //將查詢到的結果加到圖層上
                var feature = idResult.feature;
                feature.setSymbol(redSymbol);
                feature.id = polyPreIdentify + idResult.feature.attributes.OBJECTID;
                feature.name = idResult.value;
                oCom.Layer.add(feature);
                lyrPair.push(idResult.layerName, idResult.value + "#" + idResult.feature.attributes.OBJECTID);//(圖層名稱,圖形名稱#圖形識別id)
            }
            //組出圖層資訊結果清單
            var rltHTML = "";
            for (var key in lyrPair.PairArray) {
                rltHTML += "<div class='" + divIdentifyList + "Title'>圖層名稱：" + key + "</div>";//圖層名稱
                rltHTML += "<div class='" + divIdentifyList + "Content'>";//包住許多圖形清單的DIV
                var arrValues = lyrPair.get(key);
                var arrValue = arrValues.split(',');
                for (var i = 0; i < arrValue.length; i++) {
                    var objid = polyPreIdentify + arrValue[i].split('#')[1];
                    var rltValue =
                        "<div class='" + divIdentifyList + "Detail' objId='" + objid + "'>" +
                        arrValue[i].split('#')[0] +
                        "</div>";//個別的圖形，加入圖形識別id(objId)是為了圖文互查的功能
                    rltHTML += rltValue;
                }
                rltHTML += "</div>";
            }
            $('#' + divIdentifyList).html(rltHTML);
            //刪除重複的圖資清單
            var seen = {};
            $('.' + divIdentifyList + "Content div").each(function () {
                if (seen[$(this).text()])
                    $(this).remove();
                else
                    seen[$(this).text()] = true;
            });
            //增加結果清單收合控制
            $('.' + divIdentifyList + 'Title').bind('click', function () {
                var isVisible = $(this).next().is(':visible');
                //$('.' + divIdentifyList + 'Content').hide();
                if (!isVisible) {
                    $(this).next().show();
                } else {
                    $(this).next().hide();
                }
            });
            //增加光棒滑動效果
            $('.' + divIdentifyList + 'Detail').hover(
                function () {
                    $(this).css({ 'background-color': '#EEEEEE' });
                },
                function () {
                    $(this).css({ 'background-color': '#FFFFFF' });
                }
            );
            //點擊變色+定位
            $('.' + divIdentifyList + 'Detail').click(function () {
                $('.' + divIdentifyList + 'Detail').css({ 'color': '#000000' });//清單顏色初始化
                $(this).css({ 'color': '#0000FF' });//點擊的清單變色
                var target;
                for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                    //if (oCom.Layer.graphics[i].id == $(this).attr('objId')) {
                    if (oCom.Layer.graphics[i].name == $(this).text()) {
                        target = oCom.Layer.graphics[i];
                        //target.symbol = newsymbol;//錯誤寫法，graphic不會自動更新
                        target.setSymbol(blueSymbol);
                    }
                    else {
                        //theLayer.graphics[i].symbol = oldsymbol;//錯誤寫法，graphic不會自動更新
                        oCom.Layer.graphics[i].setSymbol(redSymbol);
                    }
                }
                oCom.Layer.remove(target);
                oCom.Layer.add(target);//把點擊的圖層移到最上方
                //map.setExtent(target.geometry.getExtent());//定位
                //map.resize();//因為用了上面的錯誤寫法，要重設map的Extent才會更新graphic
            });
            //滑鼠滑過圖形
            dojo.disconnect(layerEventMouseover);//綁定事件之前要先清除之前綁定的事件
            layerEventMouseover = dojo.connect(oCom.Layer, "onMouseOver", function (evt) {
                //圖形變色
                for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                    if (oCom.Layer.graphics[i].id == evt.graphic.id) {
                        oCom.Layer.graphics[i].setSymbol(blueSymbol);
                    }
                    else {
                        oCom.Layer.graphics[i].setSymbol(redSymbol);
                    }
                }
                var infoContent = "";
                //圖查文
                $('.' + divIdentifyList + 'Detail').each(function () {
                    var _this = $(this);
                    if (_this.attr('objId') == evt.graphic.id) {
                        $('.' + divIdentifyList + 'Detail').css({ 'color': '#000000' });//清單顏色初始化
                        var indexOfThis = _this.parent().children().index(_this);//目標清單的index
                        _this
                            .css({ 'color': '#0000FF' })//目標清單改變顏色
                            .parent().show().scrollTop(indexOfThis * 40);//打開該圖層的清單，並把捲軸捲到目標清單的位置
                        //.siblings('.' + divIdentifyList + 'Content').hide();//隱藏其他圖層的清單
                        infoContent = _this.text();//InfoWindow的內容
                        return;
                    }
                })
                map.infoWindow.setContent(infoContent);
                map.infoWindow.resize(75, 30);
                (evt) ? map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint)) : null;//打開InfoWindow
            });
            //滑鼠離開圖形
            dojo.disconnect(layerEventMouseout);//綁定事件之前要先清除之前綁定的事件
            layerEventMouseout = dojo.connect(oCom.Layer, "onMouseOut", function (evt) {
                map.infoWindow.hide();//關閉InfoWindow
            });
        });
    }

    //執行地圖量測(Line, Polygon)
    function execMeasure(evt) {
        //oCom.tbMapDraw.deactivate();  //關閉地圖繪圖工具

        switch (evt.geometry.type) {
            case "polyline":
                var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 0]), 2);
                var lengthParams = new esri.tasks.LengthsParameters();
                lengthParams.polylines = [evt.geometry];
                //lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                lengthParams.geodesic = true;
                geometryService.lengths(lengthParams);
                break;

            case "polygon":
                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 2), new dojo.Color([0, 0, 255, 0.25]));
                var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
                //areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                //areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_ACRES;
                geometryService.simplify([evt.geometry], function (simplifiedGeometries) {
                    areasAndLengthParams.polygons = simplifiedGeometries;
                    geometryService.areasAndLengths(areasAndLengthParams);
                });
                break;
        }
        if (isInFldPrt != "Y") {
            oCom.Layer.clear(); //清除圖面
        }
        var graphic = new esri.Graphic(evt.geometry, symbol); //設定樣式
        oCom.Layer.add(graphic);
    }
    //顯示測距(Line)
    function outputDistance(result, targetid) {
        var html = "<br><font color='green'>總距離：" + dojo.number.format(result.lengths[0] / 1000) + " KM</font>";
        if (isInFldPrt != "Y") {
            $("#" + targetid).html(html);
        } else {
            $("font:contains('總距離：')").remove();
            $("#" + targetid).prepend(html);
        }//@2016/04/07 Kevin 淹水兵棋台內切換頁籤時，不把環域分析紀錄清掉
    }
    //顯示面積(Polygon)
    function outputAreaAndLength(result, targetid) {
        var html = "<br><font color='blue'>總面積：" + dojo.number.format(result.areas[0] / 1000000, { pattern: "#,##0.##" }) + " KM<sup>2</sup></font>";
        $("#" + targetid).html(html);
    }

    //雷達雨量站(KRID)
    function execKRID(evt) {
        if (isInFldPrt != "Y") {
            //清除畫面
            oCom.Layer.clear();
        }
        //標示點位
        //點的樣式：十字
        var sms = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([255, 0, 0, 1]));
        var gc = new esri.Graphic(evt.geometry, sms);
        oCom.Layer.add(gc);

        //if (settingStartTime == "" && settingEndTime == "") {//第一次查詢 // 2015/06/22 修改
            var today = new Date(curDateTime);
            var yesterday = new Date();
            yesterday.setTime(today.getTime() - 86400000);

            settingEndTime =
                today.getFullYear().toString() + "/" +
                pad(today.getMonth() + 1, 2) + "/" +
                pad(today.getDate(), 2) + " " +
                pad(today.getHours(), 2) + ":" +
                pad(today.getMinutes(), 2);
            settingStartTime =
                yesterday.getFullYear().toString() + "/" +
                pad(yesterday.getMonth() + 1, 2) + "/" +
                pad(yesterday.getDate(), 2) + " " +
                pad(yesterday.getHours(), 2) + ":" +
                pad(yesterday.getMinutes(), 2);
        //}

        var url = "GetData/RTUI/RT_KRID.ashx";
        //讀取中
        showLoading();
        //座標轉換
        currentEvtGeom = evt.geometry;
        var Point = coordinatesTransfer(currentEvtGeom.x, currentEvtGeom.y, "EPSG:" + currentEvtGeom.spatialReference.latestWkid, "EPSG:4326");
        currentEvtGeom.x = Point.x;
        currentEvtGeom.y = Point.y;

        $("#" + divMapQry).empty().html("<div style='width:550px; height:300px;text-align:center;line-height:300px;'><img style='vertical-align:middle;' src='images/KRID_Loading.gif' /></div>");
        $.ajax({
            url: url,
            data: {
                LAT: currentEvtGeom.y,
                LON: currentEvtGeom.x,
                START: settingStartTime,
                END: settingEndTime
            },
            type: 'get',              // post/get
            dataType: "json",          // xml/json/script/html
            cache: false,              // 是否允許快取
            beforeSend: function () {
                if (!$('#' + divMapQry).length) {
                    html = "<div id='" + divMapQry + "' class='viewRT_History' style='width:550px; height:300px;' charttype='RT_KRIDHistory'></div>";
                    $("#divMain").append(html);
                    $("#" + divMapQry).offset({ left: 100, top: 350 });
                    $("#" + divMapQry).draggable(); //添加拖曳事件
                }
                //讀取中動畫圖片
                $("#" + divMapQry).empty().html("<div style='width:550px; height:300px;text-align:center;line-height:300px;'><img style='vertical-align:middle;' src='images/KRID_Loading.gif' /></div>");
                var fakeJson = {
                    Data: [],
                    LAT: 0,
                    LON: 0,
                    Unit: '讀取中',
                    Start: settingStartTime,
                    End: settingEndTime
                };
                setTimeout(drawHisChart_KRID(fakeJson), 1000);
            },
            success: function (json) {
                drawHisChart_KRID(json);
            },
            error: function () {
                alert('取得雷達雨量站資料時，發生錯誤');
            },
            complete: function () {
                hideLoading();
            }
        });
    }
    //雷達雨量站-手動設定查詢區間(KRID)
    function execKRIDwithTime(startTime, endTime, lon, lat) {

        var url = "GetData/RTUI/RT_KRID.ashx";
        //讀取中
        showLoading();
        $("#" + divMapQry).empty().html("<div style='width:550px; height:300px;text-align:center;line-height:300px;'><img style='vertical-align:middle;' src='images/KRID_Loading.gif' /></div>");
        $.ajax({
            url: url,
            data: {
                LAT: lat,
                LON: lon,
                START: startTime,
                END: endTime
            },
            type: 'get',              // post/get
            dataType: "json",          // xml/json/script/html
            cache: false,              // 是否允許快取
            success: function (json) {
                drawHisChart_KRID(json);
            },
            error: function () {
                alert('取得雷達雨量站資料時，發生錯誤');
            },
            complete: function () {
                hideLoading();
            }
        });
    }
    //雷達雨量站-時間軸更新(KRID)
    function updateKRID() {
        var today = new Date(curDateTime);
        var yesterday = new Date();
        yesterday.setTime(today.getTime() - 86400000);

        settingEndTime =
            today.getFullYear().toString() + "/" +
            pad(today.getMonth() + 1, 2) + "/" +
            pad(today.getDate(), 2) + " " +
            pad(today.getHours(), 2) + ":" +
            pad(today.getMinutes(), 2);
        settingStartTime =
            yesterday.getFullYear().toString() + "/" +
            pad(yesterday.getMonth() + 1, 2) + "/" +
            pad(yesterday.getDate(), 2) + " " +
            pad(yesterday.getHours(), 2) + ":" +
            pad(yesterday.getMinutes(), 2);
        var url = "GetData/RTUI/RT_KRID.ashx";
        //讀取中
        showLoading();
        $("#" + divMapQry).empty().html("<div style='width:550px; height:300px;text-align:center;line-height:300px;'><img style='vertical-align:middle;' src='images/KRID_Loading.gif' /></div>");
        $.ajax({
            url: url,
            data: {
                LAT: currentEvtGeom.y,
                LON: currentEvtGeom.x,
                START: settingStartTime,
                END: settingEndTime
            },
            type: 'get',              // post/get
            dataType: "json",          // xml/json/script/html
            cache: false,              // 是否允許快取
            success: function (json) {
                drawHisChart_KRID(json);
            },
            error: function () {
                alert('取得雷達雨量站資料時，發生錯誤');
            },
            complete: function () {
                hideLoading();
            }
        });
    }
    //雷達雨量站歷線圖(KRID)
    function drawHisChart_KRID(json) {
        $("#" + divMapQry).load("ucRTUI/RT_KRID.htm", function () {
            //設定區
            setTimeKRID(this, json);
            //指定圖表ID
            $(this).find(".chartHistory").attr("id", "RT_KRIDHistory_chart");
            //顯示測站資訊
            var htmlTitle = "";
            htmlTitle +=
                "經度：" +
                parseFloat(json.LON).toFixed(4) +
                "&nbsp;&nbsp;緯度：" +
                parseFloat(json.LAT).toFixed(4) +
                "&nbsp;&nbsp;資料密度：" +
                json.Unit;

            $("#" + divMapQry + " div:eq(1)").html(htmlTitle);
            //Google Chart物件
            var chartData = new google.visualization.DataTable();
            chartData.addColumn("datetime", "時間");
            chartData.addColumn("number", "雨量mm");
            chartData.addColumn("number", "累計雨量mm");

            var accRainfall = 0;//查詢區間的最大累積雨量
            var hformat;//橫軸刻度格式
            if (new Date(json.End) - new Date(json.Start) <= 86400000) {
                hformat = "HH:mm";
            } else {
                hformat = "yyyy/MM/dd";
            }

            //填入資料
            chartData.addRows(json.Data.length);
            for (var i = 0; i < json.Data.length; i++) {
                //var _date = new Date(json.Data[i].Date);
                chartData.setCell(i, 0, new Date(json.Data[i].Date));
                chartData.setCell(i, 1, json.Data[i].Rain);
                chartData.setCell(i, 2, json.Data[i].AccRain);

                if (i == json.Data.length - 1) {//查詢區間的最後總累積雨量
                    accRainfall = json.Data[i].AccRain;
                }
            }

            //依據查詢區間的累積總雨量，來決定縱軸的刻度
            var vTicks = [];
            if (accRainfall < 10) { vTicks = [0, 2, 4, 6, 8, 10]; }// 0~10
            else
                if (accRainfall < 50) { vTicks = [0, 10, 20, 30, 40, 50]; }// 10~50
                else
                    if (accRainfall < 150) { vTicks = [0, 20, 40, 60, 80, 100]; }// 50~150
                    else { vTicks = [0, 100, 200, 300, 400, 500]; }// > 150

            //圖形設定
            var option = {
                chartArea: { left: 60, top: 20, width: "85%", height: "60%" },
                legend: { position: 'top' },
                pointSize: 2,
                vAxis: {
                    title: "雨量(mm)",
                    gridlines: { count: 5, color: "#BBBBBB" },
                    ticks: vTicks
                },
                hAxis: {
                    title: "時間：" + convertDate(json.Start, "yyyyMMddHHmm", "/") + " ~ " + convertDate(json.End, "yyyyMMddHHmm", "/"),
                    format: hformat
                },
                seriesType: "bars",
                series: { 1: { type: "line" } }
            };

            chartView = new google.visualization.DataView(chartData);
            var chart = new google.visualization.ComboChart(document.getElementById('RT_KRIDHistory_chart'));
            chart.draw(chartView, option);
        });

    }
    //雷達雨量站的設定區(KRID)
    function setTimeKRID(_this, _json) {
        //綁定按鈕事件
        $("#" + divMapQry + " .btnSet").click(function () {//[設定]按鈕
            $('#' + divMapQry + ' .divSetHistory').show();
        });
        $('#' + divMapQry + ' .btnUpd').click(function () {//[資料更新]按鈕
            $('#' + divMapQry + ' .divSetHistory').hide();
            //儲存目前設定的開始及結束時間
            settingStartTime = $('#' + divMapQry).find('.txtStartTimeD').val() + " " + $('#' + divMapQry).find('.txtStartTimeH').val() + ":" +  $('#' + divMapQry).find('.txtStartTimeM').val();
            settingEndTime = $('#' + divMapQry).find('.txtEndTimeD').val() + " " + $('#' + divMapQry).find('.txtEndTimeH').val() + ":" + $('#' + divMapQry).find('.txtStartTimeM').val();
            //更新圖表
            execKRIDwithTime(settingStartTime, settingEndTime, _json.LON, _json.LAT);
        });
        $('#' + divMapQry + ' .btnCancel').click(function () {//[取消設定]按鈕
            $('#' + divMapQry + ' .divSetHistory').hide();
        });

        //如果是第一次手動設定時間，則使用目前時間當預設值
        if (settingEndTime == "") {
            settingEndTime = curDateTime;
        }
        if (settingStartTime == "") {
            settingStartTime = convertDate(DateAdd("h", -24, settingEndTime), "yyyyMMddHHmm", "/");
        }
        //開始時間
        $(_this).find(".txtStartTimeD").val(convertDate(_json.Start, "yyyyMMdd", "/"));
        $(_this).find(".txtStartTimeH").val(new Date(_json.Start).getHours());
        $(_this).find(".txtStartTimeM").val(new Date(_json.Start).getMinutes());
        //結束時間
        $(_this).find(".txtEndTimeD").val(convertDate(_json.End, "yyyyMMdd", "/"));
        $(_this).find(".txtEndTimeH").val(new Date(_json.End).getHours());
        $(_this).find(".txtEndTimeM").val(new Date(_json.End).getMinutes());
        //開始時間的控制項設定
        $(_this).find(".txtStartTimeD").datepicker({
            showOn: "both",
            buttonImage: "images/other/calendar.gif",
            buttonImageOnly: true,
            regional: ["zh-TW"],
            maxDate: _json.End,
            changeMonth: true,
            changeYear: true,
            onClose: function (selectedDate) {
                var divSetHistory = $('#' + divMapQry).find(".divSetHistory");
                $(divSetHistory).find(".txtEndTimeD").datepicker("option", "minDate", selectedDate)
            }
        });
        $(_this).find(".txtStartTimeH").spinner({
            spin: function (event, ui) {
                if (ui.value > 23) {
                    $(_this).spinner("value", 23);
                    return false;
                } else if (ui.value < 0) {
                    $(_this).spinner("value", 0);
                    return false;
                }
            }
        });
        $(_this).find(".txtStartTimeM").spinner({
            spin: function (event, ui) {
                if (ui.value > 59) {
                    $(_this).spinner("value", 59);
                    return false;
                } else if (ui.value < 0) {
                    $(_this).spinner("value", 0);
                    return false;
                }
            }
        });
        //結束時間的控制項設定
        $(_this).find(".txtEndTimeD").datepicker({
            showOn: "both",
            buttonImage: "images/other/calendar.gif",
            buttonImageOnly: true,
            regional: ["zh-TW"],
            minDate: _json.Start,
            changeMonth: true,
            changeYear: true,
            onClose: function (selectedDate) {
                var divSetHistory = $('#' + divMapQry).find(".divSetHistory");
                $(divSetHistory).find(".txtStartTimeD").datepicker("option", "maxDate", selectedDate)
            }
        });
        $(_this).find(".txtEndTimeH").spinner({
            spin: function (event, ui) {
                if (ui.value > 23) {
                    $(_this).spinner("value", 23);
                    return false;
                } else if (ui.value < 0) {
                    $(_this).spinner("value", 0);
                    return false;
                }
            }
        });
        $(_this).find(".txtEndTimeM").spinner({
            spin: function (event, ui) {
                if (ui.value > 59) {
                    $(_this).spinner("value", 59);
                    return false;
                } else if (ui.value < 0) {
                    $(_this).spinner("value", 0);
                    return false;
                }
            }
        });
    }

    //Google街景查詢(GStreetView)
    function execGStreetView(evt) {
        var sv = new google.maps.StreetViewService();
        //座標轉換
        var targetPoint = coordinatesTransfer(evt.geometry.x, evt.geometry.y, "EPSG:" + evt.geometry.spatialReference.latestWkid, "EPSG:4326");
        var myplace = new google.maps.LatLng(targetPoint.y, targetPoint.x);
        //判斷是否有街景資訊服務
        sv.getPanoramaByLocation(myplace, 50, function CheckParanomaData(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {//該點有街景服務
                //街景計數器加1
                streetViewCount += 1;
                streetViewPlace.push(streetViewCount, myplace);

                for (var i = 0; i < oCom.Layer.graphics.length / 2; i++) {
                    var smallSymbol = new esri.symbol.TextSymbol(oCom.Layer.graphics[i * 2].symbol.text)
                    .setColor(new dojo.Color([255, 255, 255]))
                    .setAlign(esri.symbol.Font.ALIGN_START).setAngle(0)
                    .setOffset(10, -10)
                    .setFont(new esri.symbol.Font("9pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                    if (oCom.Layer.graphics[i * 2].id.toString().indexOf("AA_geom") == -1) {
                        oCom.Layer.graphics[i * 2].setSymbol(smallSymbol);//設為小字體
                    }
                }
                //畫文字
                var bigSymbol = new esri.symbol.TextSymbol("街景" + streetViewCount)
                    .setColor(new dojo.Color([255, 255, 255]))
                    .setAlign(esri.symbol.Font.ALIGN_START).setAngle(0)
                    .setOffset(10, -10)
                    .setFont(new esri.symbol.Font("14pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                var gt = new esri.Graphic(evt.geometry, bigSymbol);//設為大字體
                oCom.Layer.add(gt);
                //畫點
                var sms = new esri.symbol.PictureMarkerSymbol('images/widgetMapTool/Maps-green-32.png', 32, 32);
                var gc = new esri.Graphic(evt.geometry, sms);
                oCom.Layer.add(gc);

                //如果清單已存在：刪除
                if ($('#' + divMapQry)) {
                    $('#' + divMapQry).remove();
                }
                //開啟清單介面
                var html = "";
                html += "<div id='" + divMapQry + "' class='openDiv' style='width:300px; height:300px; z-index:3; left:100px; top:300px;'></div>";
                $("#divMain").append(html);
                //載入表身
                $('#' + divMapQry).load("ucWidget/GStreetView.htm", function () {
                    $('#' + divMapQry + ' .WidgetFrmClose').click(function () {//關閉按鈕
                        $('#' + divMapQry).remove();
                    });
                    //調整清單位置
                    $("#" + divMapQry).offset({ left: 100, top: 300 });
                    $("#" + divMapQry).show();
                    //添加清單拖曳事件
                    $("#" + divMapQry).draggable({ handle: "div:first" });//限定只有標題的那個div有拖曳功能

                    $('#divGStreetView').show();
                    panorama = new google.maps.StreetViewPanorama(document.getElementById("divGStreetView"));
                    panorama.setPano(data.location.pano);
                    panorama.setPov({
                        heading: 270,
                        pitch: 0,
                        zoom: 1
                    });
                    panorama.setVisible(true);

                    var info = "<select id='divGStreetViewInfoSel'>";
                    for (var i = 1; i <= streetViewCount; i++) {
                        info += "<option value='" + i + "'>街景" + i + "</option>"
                    }
                    info += "</select>";
                    $('#divGStreetViewInfo').html(info);
                    $('#divGStreetViewInfoSel').val(streetViewCount.toString());
                    //下拉選單變動的事件
                    $('#divGStreetViewInfoSel').change(function () {
                        panorama.setPosition(streetViewPlace.get($(this).val()));//切換街景

                        for (var i = 0; i < oCom.Layer.graphics.length / 2; i++) {
                            var smallSymbol = new esri.symbol.TextSymbol(oCom.Layer.graphics[i * 2].symbol.text)
                                .setColor(new dojo.Color([255, 255, 255]))
                                .setAlign(esri.symbol.Font.ALIGN_START).setAngle(0)
                                .setOffset(10, -10)
                                .setFont(new esri.symbol.Font("9pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                            oCom.Layer.graphics[i * 2].setSymbol(smallSymbol);//設為小字體
                        }
                        var bigSymbol = new esri.symbol.TextSymbol(oCom.Layer.graphics[($(this).val() - 1) * 2].symbol.text)
                            .setColor(new dojo.Color([255, 255, 255]))
                            .setAlign(esri.symbol.Font.ALIGN_START).setAngle(0)
                            .setOffset(10, -10)
                            .setFont(new esri.symbol.Font("14pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                        oCom.Layer.graphics[($(this).val() - 1) * 2].setSymbol(bigSymbol);//設為大字體
                    });
                });

            }
            else {//該點沒有有街景服務
                //如果清單已存在：刪除
                if ($('#' + divMapQry)) {
                    $('#' + divMapQry).remove();
                }
                //開啟清單介面
                var html = "";
                html += "<div id='" + divMapQry + "' class='openDiv' style='width:300px; height:300px; z-index:3; left:100px; top:300px;'></div>";
                $("#divMain").append(html);
                //載入表身
                $('#' + divMapQry).load("ucWidget/GStreetView.htm", function () {
                    $('#' + divMapQry + ' .WidgetFrmClose').click(function () {//關閉按鈕
                        $('#' + divMapQry).remove();
                    });
                    //調整清單位置
                    $("#" + divMapQry).offset({ left: 100, top: 300 });
                    $("#" + divMapQry).show();
                    //添加清單拖曳事件
                    $("#" + divMapQry).draggable({ handle: "div:first" });//限定只有標題的那個div有拖曳功能

                    var info = "<select id='divGStreetViewInfoSel'>";
                    for (var i = 1; i <= streetViewCount; i++) {
                        info += "<option value='" + i + "'>街景" + i + "</option>"
                    }
                    info += "</select>此位置街景不存在，請重新點選";
                    $('#divGStreetViewInfo').html(info);
                    $('#divGStreetViewInfoSel').val(0);
                    //下拉選單變動的事件
                    $('#divGStreetViewInfoSel').change(function () {
                        $('#divGStreetView').show();
                        panorama = new google.maps.StreetViewPanorama(document.getElementById("divGStreetView"));
                        panorama.setPosition(streetViewPlace.get($(this).val()));//切換街景

                        for (var i = 0; i < oCom.Layer.graphics.length / 2; i++) {
                            var smallSymbol = new esri.symbol.TextSymbol(oCom.Layer.graphics[i * 2].symbol.text)
                                .setColor(new dojo.Color([255, 255, 255]))
                                .setAlign(esri.symbol.Font.ALIGN_START).setAngle(0)
                                .setOffset(10, -10)
                                .setFont(new esri.symbol.Font("9pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                            oCom.Layer.graphics[i * 2].setSymbol(smallSymbol);//設為小字體
                        }
                        var bigSymbol = new esri.symbol.TextSymbol(oCom.Layer.graphics[($(this).val() - 1) * 2].symbol.text)
                            .setColor(new dojo.Color([255, 255, 255]))
                            .setAlign(esri.symbol.Font.ALIGN_START).setAngle(0)
                            .setOffset(10, -10)
                            .setFont(new esri.symbol.Font("14pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                        oCom.Layer.graphics[($(this).val() - 1) * 2].setSymbol(bigSymbol);//設為大字體
                    });
                });
            }
        });
    }

    //地形查詢(Terrain)
    function execTerrain(evt) {
        currentEvtGeom = evt.geometry;
        TerrainCreateDiv();//開啟清單介面
    }
    //地形查詢-開啟清單介面(Terrain)
    function TerrainCreateDiv() {
        //如果清單已存在
        if ($('#' + divMapQry).length != 0) {
            TerrainMapDraw();
            TerrainGetData();
            TerrainGetCity();
        }
        else {//如果清單不存在
            //畫介面
            var html = "";
            html += "<div id='" + divMapQry + "' class='openDiv' style='width:610px; height:460px; z-index:3; left:100px; top:300px;'></div>";
            $("#divMain").append(html);
            //載入表身
            $('#' + divMapQry).load("ucRTUI/RT_Terrain.htm", function () {
                //關閉按鈕
                $('#' + divMapQry + ' .WidgetFrmClose').click(function () {
                    $('#' + divMapQry).remove();
                });
                //調整清單位置
                $("#" + divMapQry).offset({ left: 100, top: 300 });
                $("#" + divMapQry).show();
                //添加清單拖曳事件
                $("#" + divMapQry).draggable({ handle: "div:first" });//限定只有標題的那個div有拖曳功能
                //Slider
                $("#" + divMapQry + " #Terrain_Slider").change(function (e) {
                    $("#" + divMapQry + " #Terrain_SliderValue").text("搜尋範圍：" + e.currentTarget.value + "公尺");
                });
                //Btn
                $("#" + divMapQry + " #Terrain_BtnExec").click(function (e) {
                    TerrainMapDraw();
                    TerrainGetData();
                });

                TerrainMapDraw();
                TerrainGetData();
                TerrainGetCity();
            });
        }
    }
    //地形查詢-地圖上畫出查詢範圍(Terrain)
    function TerrainMapDraw() {
        if( isInFldPrt  !="Y"){
            //清除畫面
        oCom.Layer.clear();
    }

        //畫點
        var sms = new esri.symbol.PictureMarkerSymbol('images/other/釘子-point.png', 19, 28);
        var gc = new esri.Graphic(esri.geometry.webMercatorToGeographic(currentEvtGeom), sms);
        oCom.Layer.add(gc);

        //畫查詢範圍(矩形)
        var Point97 = coordinatesTransfer(currentEvtGeom.x, currentEvtGeom.y, "EPSG:" + currentEvtGeom.spatialReference.latestWkid, "EPSG:3826");
        var rectwidth = $("#" + divMapQry + " #Terrain_Slider").prop("value");
        var pointLx = Point97.x - rectwidth / 2;
        var pointTy = Point97.y + rectwidth / 2;
        var pointRx = Point97.x + rectwidth / 2;
        var pointBy = Point97.y - rectwidth / 2;
        var PointMin = coordinatesTransfer(pointLx, pointBy, "EPSG:3826", "EPSG:4326");
        var PointMax = coordinatesTransfer(pointRx, pointTy, "EPSG:3826", "EPSG:4326");
        var ringPointArray = [[PointMin.x, PointMin.y], [PointMin.x, PointMax.y], [PointMax.x, PointMax.y], [PointMax.x, PointMin.y], [PointMin.x, PointMin.y]];
        var sfs = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new dojo.Color([0, 0, 255]),
                    2
                ),
                new dojo.Color([0, 0, 255, 0.1])
            );
        var attr = new Object();
        AddPolygonToLayer(ringPointArray, attr, sfs, "RT_Terrain", oCom.Layer);//畫多邊形
        map.centerAndZoom(esri.geometry.webMercatorToGeographic(currentEvtGeom), 14);//地圖縮放至該點
    }
    //地形查詢-由後端取得地形資料(Terrain)
    function TerrainGetData() {
        //先轉座標
        var Point = coordinatesTransfer(currentEvtGeom.x, currentEvtGeom.y, "EPSG:" + currentEvtGeom.spatialReference.latestWkid, "EPSG:3828");

        //ajax取得資料
        var url = "GetData/RTUI/RT_Terrain.ashx";
        $.ajax({
            url: url,
            type: 'get',
            data: {
                "func": "terrain",
                "x": Point.x,
                "y": Point.y,
                "rectwidth": $("#" + divMapQry + " #Terrain_Slider").prop("value"),
                "wkid": currentEvtGeom.spatialReference.latestWkid
            },
            dataType: "text",
            cache: false,   //不允許快取
            beforeSend: function () {
                showLoading();
            },
            success: function (data) {
                var json = $.parseJSON(data);//傳回資料為JSON字串
                $("#" + divMapQry + " #Terrain_Image").prop("src", json.Img);//圖片
                $("#" + divMapQry + " #Terrain_Span_Area").text(json.Area);//面積
                $("#" + divMapQry + " #Terrain_Span_Height").text(json.Height);//平均高程
                $("#" + divMapQry + " #Terrain_Span_Aspect").text(json.Aspect);//平均坡向
                $("#" + divMapQry + " #Terrain_Span_Gradient").text(json.Gradient + "（度）");//平均坡度
            },
            error: function () {
                alert("地形查詢資料載入失敗");
            },
            complete: function () {
                hideLoading();
            }
        });
    }
    //地形查詢-取得該點的縣市鄉鎮(Terrain)
    function TerrainGetCity() {
        //先轉座標
        var Point = coordinatesTransfer(currentEvtGeom.x, currentEvtGeom.y, "EPSG:" + currentEvtGeom.spatialReference.latestWkid, "EPSG:4326");


        //查詢中
        $("#" + divMapQry + " #Terrain_Span_City,#Terrain_Span_Town").html("<img src='images/other/Red_glow.gif' width='20' height='20' />");
        //ajax取得資料
        var url = "GetData/RTUI/RT_Terrain.ashx";
        $.ajax({
            url: url,
            type: 'get',
            data: {
                "func": "county",
                "x": Point.x,
                "y": Point.y,
                "wkid": currentEvtGeom.spatialReference.latestWkid
            },
            dataType: "text",
            cache: false,   //不允許快取
            beforeSend: function () {
                showLoading();
            },
            success: function (data) {
                var json = $.parseJSON(data);//傳回資料為JSON字串
                $("#" + divMapQry + " #Terrain_Span_City").html(json[0].COUN_NA);
                $("#" + divMapQry + " #Terrain_Span_Town").html(json[0].TOWN_NA);
            },
            error: function () {
                alert("縣市鄉鎮查詢資料失敗");
            },
            complete: function () {
                hideLoading();
            }
        });
    }

    //地形剖面線分析(ProfileLine)
    function execProfileLine(evt) {
        currentEvtGeom = evt.geometry;
        ProfileLineCreateDiv();

        var evtExt = evt.geometry.getExtent();
        var newExt = new esri.geometry.Extent(evtExt.xmin - 200, evtExt.ymin - 2000, evtExt.xmax + 200, evtExt.ymax + 2000, evt.geometry.spatialReference);
        map.setExtent(newExt);
    }
    //地形剖面線分析-開啟清單介面(ProfileLine)
    function ProfileLineCreateDiv() {
        //如果清單已存在
        if ($('#' + divMapQry).length != 0) {
            ProfileLineDraw();
            ProfileLineGetData();
        }
        else {//如果清單不存在
            //畫介面
            var html = "";
            html += "<div id='" + divMapQry + "' class='openDiv' style='width:575px; height:350px; z-index:3; left:100px; top:300px;'></div>";
            $("#divMain").append(html);
            //載入表身
            $('#' + divMapQry).load("ucRTUI/RT_ProfileLine.htm", function () {
                //關閉按鈕
                $('#' + divMapQry + ' .WidgetFrmClose').click(function () {
                    $('#' + divMapQry).remove();
                });
                //調整清單位置
                $("#" + divMapQry).offset({ left: 100, top: 300 });
                $("#" + divMapQry).show();
                //添加清單拖曳事件
                $("#" + divMapQry).draggable({ handle: "div:first" });//限定只有標題的那個div有拖曳功能


                ProfileLineDraw();
                ProfileLineGetData();
            });
        }
    }
    //地形剖面線分析-地圖上畫出查詢範圍(ProfileLine)
    function ProfileLineDraw() {
        if (isInFldPrt != "Y") {
            oCom.Layer.clear();
        }

        //應該要改成每段path都用不同顏色
        var sms;
        var gc;
        var coords = [];
        var polyline;
        for (var i = 0; i < currentEvtGeom.paths[0].length - 1; i++) {
            switch (i) {
                case 0:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([167, 15, 6]), 2);
                    break;
                case 1:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([169, 115, 8]), 2);
                    break;
                case 2:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([174, 180, 17]), 2);
                    break;
                case 3:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([22, 97, 15]), 2);
                    break;
                case 4:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([12, 15, 159]), 2);
                    break;
                case 5:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([88, 95, 14]), 2);
                    break;
                case 6:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([74, 5, 70]), 2);
                    break;
                case 7:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([24, 181, 172]), 2);
                    break;
                case 8:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([96, 96, 96]), 2);
                    break;
                case 9:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([15, 176, 16]), 2);
                    break;
                default:
                    sms = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([190, 119, 126]), 2);
                    break;
            }
            coords.push(currentEvtGeom.paths[0][i]);
            coords.push(currentEvtGeom.paths[0][i + 1]);
            polyline = new esri.geometry.Polyline(new esri.SpatialReference({ wkid: 102443 }));
            polyline.addPath(coords);
            var gc = new esri.Graphic(polyline, sms);
            oCom.Layer.add(gc);
            coords.length = 0;
        }

    }
    //地形剖面線分析-由後端取得地形剖面資料(ProfileLine)
    function ProfileLineGetData() {
        //處理剖面線的座標
        var PL_ArrX = [];
        var PL_ArrY = [];
        for (var i = 0; i < currentEvtGeom.paths.length; i++) {
            for (var j = 0; j < currentEvtGeom.paths[i].length; j++) {
                var Point = coordinatesTransfer(currentEvtGeom.paths[i][j][0], currentEvtGeom.paths[i][j][1], "EPSG:" + currentEvtGeom.spatialReference.latestWkid, "EPSG:3826");
                PL_ArrX.push(Point.x);
                PL_ArrY.push(Point.y);
            }
        }
        var url = "GetData/RTUI/RT_ProfileLine.ashx";
        //將座標組成QueryString
        var qs = "";
        qs += "?x=";
        for (var i = 0 ; i < PL_ArrX.length; i++) {
            qs += PL_ArrX[i];
            if (i != PL_ArrX.length - 1)
                qs += "|";
        }
        qs += "&y=";
        for (var i = 0 ; i < PL_ArrY.length; i++) {
            qs += PL_ArrY[i];
            if (i != PL_ArrY.length - 1)
                qs += "|";
        }
        //ajax後端資料查詢
        $.ajax({
            url: url + qs,
            type: 'get',
            dataType: "text",
            cache: false,   //不允許快取
            beforeSend: function () {
                showLoading();
            },
            success: function (data) {
                var json = $.parseJSON(data);//傳回資料為JSON字串
                PL_data = json;
                ProfileLineChart();
            },
            error: function () {
                alert("地形剖面線分析失敗，請確認查詢線段長度是否大於500公尺。");
            },
            complete: function () {
                hideLoading();
            }
        });
    }
    //地形剖面線分析-將資料用GoogleChart呈現(ProfileLine)
    function ProfileLineChart() {
        try {
            var LineCount = PL_data.Line.length;//線段數
            if (LineCount > 0 && LineCount < 10) {
                //指定圖表ID
                $("#" + divMapQry).find(".chartHistory").attr("id", "RT_ProfileLine_chart");
                //Google Chart 物件
                var chartData = new google.visualization.DataTable();
                chartData.addColumn("string", "距離(km)");
                var TraceCount = 0;//點位數
                for (var i = 0 ; i < LineCount; i++) {
                    TraceCount += PL_data.Line[i].Trace.length;
                    chartData.addColumn("number", "海拔(m)");
                }
                //填入資料，以下邏輯運算，是為了讓每個線段用顏色區別，且連續不中斷
                chartData.addRows(TraceCount);
                var CurrentLineTrace = 0;
                var TotalLineTrace = 0;
                var CurrentDistance = 0;
                for (var i = 0 ; i < LineCount; i++) {
                    for (var j = 0; j < PL_data.Line[i].Trace.length; j++) {
                        chartData.setCell(j + TotalLineTrace, 0, (Math.round((PL_data.Line[i].Trace[j].Distance + CurrentDistance) * 100) / 100).toString());
                        chartData.setCell(j + TotalLineTrace, i + 1, PL_data.Line[i].Trace[j].Height);
                        CurrentLineTrace = j;
                    }
                    CurrentDistance += PL_data.Line[i].Trace[CurrentLineTrace].Distance;
                    TotalLineTrace += CurrentLineTrace;
                }



                //圖形設定
                var option = {
                    chartArea: { left: 70, top: 10, width: "85%", height: "65%" },
                    pointSize: 2,
                    legend: { position: 'none' },
                    vAxis: {
                        title: "海拔(m)",
                    },
                    hAxis: {
                        title: "距離(km)",
                        showTextEvery: Math.round((TraceCount / 3) - 3)
                    },
                    colors:
                        [
                            '#a70f06', '#a97308', '#aeb411',
                            '#16610f', '#0c0f9f', '#585f0e',
                            '#4a0546', '#18b5ac', '#606060',
                            '#0fb010', '#be777e'
                        ]
                }

                chartView = new google.visualization.DataView(chartData);
                var chart = new google.visualization.AreaChart(document.getElementById('RT_ProfileLine_chart'));
                chart.draw(chartView, option);

                google.visualization.events.addListener(chart, 'onmouseover', function (obj) {
                    var index = obj.row;
                    for (var i = 0; i < PL_data.Line.length; i++) {
                        if (index < PL_data.Line[i].Trace.length) {
                            //顯示該點資訊
                            $("#" + divMapQry).find(".chartDesc")
                                .html
                                (
                                '<p>段落' + i + '：  ' +
                                '  總長(km)=' + PL_data.Line[i].Distance +
                                '  最高海拔(m)=' + PL_data.Line[i].Highest +
                                '  最低海拔(m)=' + PL_data.Line[i].Lowest + '</p>' +
                                '  <p>起點=' + PL_data.Line[i].From +
                                '  終點=' + PL_data.Line[i].To + '</p>'
                                );
                            break;
                        }
                        else {
                            index = index - PL_data.Line[i].Trace.length;
                        }
                    }
                });

                $("#" + divMapQry).find(".chartImg").html('<img src="' + PL_data.RegionImage + '"/>');
            } else {
                alert("地形剖面線分析失敗，請確認查詢線段長度是否大於500公尺。");
            }
        }
        catch (ex) {
            alert("地形剖面線分析失敗，請確認查詢線段長度是否大於500公尺。");
        }
    }

    //環域分析(AreaAnalysis)
    function execAreaAnalysis(evt) {       
        
        if (isInFldPrt == "Y") {//2016/03/17  如果是淹水兵棋台的環域，則帶入淹水範圍模擬的淹水中心點 Kevin
            if (evt == '') {
                currentEvtGeom = oFastLocFlooding.geom;
            } else { currentEvtGeom = evt.geometry; }
            currentEvtGeom.status = "show";
        } else {
            currentEvtGeom = evt.geometry;
            currentEvtGeom.status = "show";
        }
        //currentEvtGeom = evt.geometry;
        //currentEvtGeom.status = "show";
        if (isInFldPrt == "Y") {
            AreaAnalysisCreateListDivForFlooding();//開啟清單介面
        } else {
            AreaAnalysisCreateListDiv();//開啟清單介面
        }
        //環域大小
        var buffersize = ($('#' + divMapQry + ' #AA_Slider').is(':visible')) ? $('#' + divMapQry + ' #AA_Slider').val() : "0.001";
        //AreaAnalysisBuffer(currentEvtGeom, buffersize);
        AreaAnalysisBuffer(currentEvtGeom, buffersize, false); // 2016/02/04 修改：環域分析強化
        //AreaAnalysisGetData(currentEvtGeom);        
    }

    // 2016/02/04 修改：環域分析強化 Start
    function setAreaGraphic(currentEvtGeom, Gid) {
        switch (currentEvtGeom.type) {
            case "point":
                var symbol = new esri.symbol.PictureMarkerSymbol('images/MapTool/locateIcon.png', 37, 42);
                break;

            case "polyline":
                var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 0]), 5);
                break;

            case "polygon":
                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 2), new dojo.Color([0, 0, 255, 0.25]));
                break;
        }
        //設定Symbol offset        
        symbol.yoffset = 19;
        var graphic = new esri.Graphic(currentEvtGeom, symbol); //設定樣式
        graphic.id = "AA_MidGrphic" + Gid;
        oCom.Layer.add(graphic);
    }

    function CtrlBufferFun(evt) {
        $('#divRMenu').css({ 'display': 'none' });

        if (evt.button != 0 || evt.graphic == null || evt.graphic == undefined || evt.graphic.id == undefined) { //鎖定只有滑鼠左鍵才可以往下執行
            return false;
        }

        var idStr = evt.graphic.id;
        if (idStr.indexOf('AA_MidGrphic') != -1) {
            $("#divRMenu").html(getBufferSetHtml(idStr));

            if (evt.button == 0) {
                if (BrowserVer.firefox) {
                    menuX = evt.pageX + 8;
                    menuY = evt.pageY + 12;
                }
                else {
                    menuX = evt.clientX + 8;
                    menuY = evt.clientY + 12;
                }
                if ((parseInt(menuX) + 150) > parseInt(parent.bodyW)) {
                    menuX = menuX - 150;
                }

                if ((parseInt(menuY) + 180) > parseInt(parent.bodyH)) {
                    menuY = menuY - 180;
                }

                $('#divRMenu').css({ 'left': (menuX + 'px'), 'top': (menuY + 'px'), 'display': 'block' });
            }
        }
    }

    function getBufferSetHtml(idStr) {
        strHTML = '<div style="width:300px;background-color:#404040;color:#FFF;text-align:center;line-height:25px;">環域範圍<img src="images/MapTool/XX.png" onclick="oMapQry.hiddenRMenu(); " style="float:right;margin-right:5px;margin-top:5px;cursor:pointer;width: 15px;height: 15px;" /></div>';
        strHTML += '<div style="margin-top:5px;margin-bottom:5px;"><input type="radio" id="use_InitVal" name="aaRadio" value="InitVal" checked=true /> 快速選擇：';
        strHTML += '<select id="InitValSelect" >';
        strHTML += '<option value="0.1" selected >100 m </option>';
        strHTML += '<option value="0.3" >300 m </option>';
        strHTML += '<option value="0.5" >500 m </option>';
        strHTML += '<option value="1" >1 km </option>';
        strHTML += '<option value="1.3" >1.3 km </option>';
        strHTML += '<option value="1.5" >1.5 km </option>';
        strHTML += '<option value="2" >2 km </option>';
        strHTML += '<option value="2.3" >2.3 km </option>';
        strHTML += '<option value="2.5" >2.5 km </option>';
        strHTML += '<option value="3" >3 km </option>';
        strHTML += '<option value="5" >5 km </option>';
        strHTML += '<option value="10" >10 km </option>';
        strHTML += '<option value="15" >15 km </option>';

        strHTML += '</select></div>';
        strHTML += '<div>';
        strHTML += '<div style="margin-top:5px;margin-bottom:5px;"><input type="radio" id="use_UserVal" name="aaRadio" value="UserVal" />自訂範圍 ：<input type="text" id="userKeyinVal" style="width:50px;margin-right:3px;" value="" />km';
        strHTML += '<input type="button" id="exceBufferSet" value="查詢" style="float:right;margin-right:5px;" onclick="oMapQry.exceBufferSet(\'' + idStr + '\');"></div>';
        strHTML += '</div>';

        return strHTML;
    }

    oCom.exceBufferSet = function (idStr) {
        var geomIndex = idStr.replace('AA_MidGrphic', '');
        if ($('input[name=aaRadio]:checked').val() == 'UserVal') {
            if ($('#userKeyinVal').val().length > 0) {
                if (!isNaN($('#userKeyinVal').val())) {
                    var buffersize = Number($('#userKeyinVal').val());
                    $('#' + divMapQry + ' #AA_Slider').val(buffersize);
                    AreaAnalysisBuffer(AA_geom[Number(geomIndex)], buffersize, true);
                } else
                    alert('請輸入數字');
            } else
                alert('請輸入數字');

        } else if ($('input[name=aaRadio]:checked').val() == 'InitVal') {
            var buffersize = Number($('#InitValSelect').val());
            AreaAnalysisBuffer(AA_geom[Number(geomIndex)], buffersize, true);
        }
    }

    // 2016/02/04 修改：環域分析強化 End


    //環域分析-開啟圖層清單 by 2016/02/04 修改：環域分析強化
    oCom.openAreaAnalysisMapList = function () {
        debugger;
        if ($('#MapListDiv').html() == '') {
            $.ajax({
                url: "GETData/RTUI/RT_AreaAnalysis.ashx",
                data: {
                    opreation: "mapList",
                    account: oCom.Account
                },
                type: 'get',
                dataType: "text",
                cache: false,   //不允許快取
                beforeSend: function () {
                    showLoading();
                },
                success: function (data) {
                    var jsonData = $.parseJSON(data);
                    MapListData = jsonData;
                    var sHtml = '<div>圖層名稱</div><div>選擇</div>';
                    for (var di in jsonData) {
                        sHtml += '<div id=\"layer_name_' + jsonData[di].Fid + '\">' + jsonData[di].MapName + '</div>';
                        if (isInFldPrt == "Y") {
                            if (jsonData[di].MapName == "收容所_2015" && typeof (oMapQry.AA_MapList) == "undefined")//@淹水兵棋台要自動勾選[收容所_2015] 2016/05/03
                            {
                                sHtml += '<div>' + '<input id=\"layer_ckd_' + jsonData[di].Fid + '\" type="checkbox" onchange="oMapQry.openAreaAnalysisMap(' + jsonData[di].Fid + ',this.checked);" checked=\"true\" /></div>';
                                AA_MapList.push(jsonData[di].Fid);
                                setStatCtr_Map('', false);
                            }
                            else {
                                sHtml += '<div>' + '<input id=\"layer_ckd_' + jsonData[di].Fid + '\" type="checkbox" onchange="oMapQry.openAreaAnalysisMap(' + jsonData[di].Fid + ',this.checked);" /></div>';
                            }
                        } else {
                            sHtml += '<div><input type="checkbox" onchange="oMapQry.openAreaAnalysisMap(' + jsonData[di].Fid + ',this.checked);" /></div>';
                        }
                    }
                    $('#MapListDiv').html(sHtml);
                    $('#AreaAnalysisMapList').show();
                    if (isInFldPrt == "Y") {//@淹水兵棋台第一次進頁面要自動執行環域分析 2016/03/16 Kevin                        
                        var checkedLyrPos = $('#layer_name_6667').position();//取得收容所_2015的位置                        
                        var winHeight = $(window).height();
                        $('#MapListDiv').scrollTop(checkedLyrPos.top - winHeight + 700);//調整ScrollBar位置

                        //設定專案開啟圖層 @20160426 Andy
                        debugger;
                        if (typeof (oMapQry.AA_MapList) != "undefined") {
                            $("#MapListDiv input[type=checkbox]").each(function (i) {
                                $(this).prop("checked", false);    //取消
                                for (var item in oMapQry.AA_MapList) {
                                    if (oMapQry.AA_MapList[item] == $(this).attr("id").replace("layer_ckd_", "")) {
                                        $(this).prop("checked", true);
                                        //AA_MapList.push(oMapQry.AA_MapList[item]);
                                        //setStatCtr_Map('', false);
                                        oCom.openAreaAnalysisMap(oMapQry.AA_MapList[item], true);
                                    }
                                }

                            });
                        }
                        
                        execAreaAnalysis('');                       
                    }
                   
                },
                error: function (a, b, c) {
                    alert("環域分析圖層清單取得失敗");
                },
                complete: function () {
                    hideLoading();
                }
            });
        }else
            $('#AreaAnalysisMapList').show();
    }

    // 2016/02/04 修改：環域分析強化 Start
    // 勾選圖層清單的圖層
    oCom.openAreaAnalysisMap = function (Fid,isChecked) {
        var checkCnt = $('#MapListDiv input[type=checkbox]:checked').length;
        if (checkCnt >= 3)
            $('#MapListDiv input[type=checkbox]:not(:checked)').prop('disabled', true);
        else 
            $('#MapListDiv input[type=checkbox]:not(:checked)').prop('disabled', false);

        if (isChecked) {
            AA_MapList.push(Fid);
            setStatCtr_Map('', false);
        }
        else {
            AA_MapList.splice(AA_MapList.indexOf(Fid), 1);
            setStatCtr_Map(Fid, true);
        }
    }

    // 關閉圖層清單介面
    oCom.closeAreaAnalysisMapList = function () {
        $('#AreaAnalysisMapList').hide();
    }

    // 設定屬性統計圖的圖層選單
    function setStatCtr_Map(delId, isDel) {
        var vHtml = '';
        var keyVal ;
        if (!isDel) {
            for (var i in AA_MapList) {
                keyVal = '';
                keyVal = ''+AA_MapList[i];
                if (keyVal.indexOf('function') == 0) {//@2016/04/08 當開頭為function時，則不繼續做getArryObj，以避免發生錯誤 Kevin                 
                    continue;
                }
                var Item = getArryObj(MapListData, "Fid", AA_MapList[i]);
                if ($('#StatCtr_MapDL option[value=' + Item.Fid + ']').length == 0)
                    vHtml += '<option value="' + Item.Fid + '">' + Item.MapName + '</option>';
            }

            if (vHtml != '') {
                $('#StatCtr_MapDL').append(vHtml);
            }
        } else {
            if ($('#StatCtr_MapDL option[value=' + delId + ']').length > 0) {
                $('#StatCtr_MapDL option[value=' + delId + ']').remove();
                oCom.setStatCtr_Field('');
            }
        }
    }

    // 設定單一圖層要統計的欄位
    oCom.setStatCtr_Field = function (Fid) {
        debugger;
        if (Fid != '') {
            var vHtml = '';
            var MapData = getArryObj(MapListData, "Fid", Fid);
            var ItemData = MapData.TotalField;
            for (var i in ItemData) {
                vHtml += '<option value="' + ItemData[i].EName + '">' + ItemData[i].CName + '</option>';
            }
        }

        vHtml = '<option value="">請選擇</option>' + vHtml;
        $('#StatCtr_FieldDL').html(vHtml);
    }

    // 統計屬性值的總和
    oCom.getStatValues = function () {
        var sFid = $('#StatCtr_MapDL').val();
        var sField = $('#StatCtr_FieldDL').val();
        var sFieldText = $('#StatCtr_FieldDL option[value="' + sField + '"]').text();
        var cntField = 0;
        if(sField != '')
        {
            var statAlsis = $('#divAADrawListContent input[type=checkbox]:checked');
            for (var i = 0; i < statAlsis.length; i++) {
                var eleIdx = $(statAlsis[i]).attr('idx');
                var statData = jsonArryPair.get(eleIdx);

                if (statData == null) {
                    cntField = 0;
                }
                else {
                    for (var j = 0; j < statData.length; j++) {
                        if (statData[j].Fid == sFid) {
                            var fValues = statData[j].FieldValues;
                            for (var key in fValues) {
                                if (fValues[key].EName == sField)
                                    cntField += Number(fValues[key].FieldValue);
                            }
                        }
                    }
                }
            }
            var megHtml = sFieldText + '：' + thousandComma(cntField.toFixed(3).toString());
            $('#StatResult').html(megHtml);
        }
    }

    // 處理勾選
    oCom.chkGoem = function (obj) {
        if (obj.checked) {
            chkGoemList.push($(obj).attr('idx'));
        }
        else {
            chkGoemList = $.grep(chkGoemList, function (value) {
                return value != $(obj).attr('idx');
            });
        }
    }

    // 設定千分位
    var thousandComma = function (number) {
        var num = number.toString();
        var pattern = /(-?\d+)(\d{3})/;

        while (pattern.test(num)) {
            num = num.replace(pattern, "$1,$2");

        }
        return num;
    }

    // 2016/02/04 修改：環域分析強化 End

    //環域分析-處理Buffer(AreaAnalysis)
    function AreaAnalysisBuffer(geom, bufferSize, isClone, index) {
        //parameter:geom        圖形
        //parameter:bufferSize  環域半徑
        //parameter:index       儲存位置
		if (geom.status != "none") {
			var bufferParams = new esri.tasks.BufferParameters();
			bufferParams.geometries = [geom];
			bufferParams.distances = [bufferSize];
			bufferParams.unit = esri.tasks.GeometryService.UNIT_KILOMETER;
			bufferParams.outSpatialReference = map.spatialReference;
			bufferParams.geodesic = true;//2016/03/24 加上geodesic參數，以避免距離非地圖上的距離 Kevin
			//模擬多型
			//if (arguments.length <= 2) {//只傳兩個參數
			//	//沒有指定儲存位置->新圖形
			//	AA_currIndex = AA_geom.length;
			//	//儲存新圖形
			//	AA_geom.push(geom);
			//	AA_bufferSize.push(bufferSize);
			//	AA_currMode = "new";

			//}
			//else {//傳三個參數
			//	//有指定儲存位置->修改舊的圖形
			//	AA_currIndex = index;
			//	//修改舊圖形
			//	AA_geom[AA_currIndex] = geom;
			//	AA_bufferSize[AA_currIndex] = bufferSize;
			//	AA_currMode = "edit";
		    //}
		    // 2016/02/04 修改：環域分析強化
			if (arguments.length <= 3) {//只傳三個參數
			    if (!isClone) {
			        //debugger;
			        //沒有指定儲存位置->新圖形
			        AA_currIndex = AA_geom.length;
			        //儲存新圖形
			        AA_geom.push(geom);
			        AA_bufferSize.push(bufferSize);
			        AA_currMode = "new";
			    }
			    else {
			        //沒有指定儲存位置->新圖形
			        AA_currIndex = AA_geom.length;
			        //儲存新圖形
			        var cloneGeom = new Object();
			        cloneGeom['status'] = 'show';
			        cloneGeom['type'] = geom.type;
			        cloneGeom['spatialReference'] = geom.spatialReference;
			        cloneGeom['x'] = geom.x;
			        cloneGeom['y'] = geom.y;

			        switch (geom.type) {
			            case "polyline":
			                cloneGeom['paths'] = geom.paths;
			                break;
			            case "polygon":
			                cloneGeom['rings'] = geom.rings;
			                break;
			        }

			        AA_geom.push(cloneGeom);

			        AA_bufferSize.push(bufferSize);
			        AA_currMode = "new";
			    }
			}
			else {//傳四個參數
			    //有指定儲存位置->修改舊的圖形
			    AA_currIndex = index;
			    //修改舊圖形
			    AA_geom[AA_currIndex] = geom;
			    AA_bufferSize[AA_currIndex] = bufferSize;
			    AA_currMode = "edit";
			}
			AreaAnalysisRefreshTable();			
			
			geometryService.buffer(bufferParams, function (geometries) {
			    //debugger;
				var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255, 0.65]), 2), new dojo.Color([0, 0, 255, 0.35]));
				dojo.forEach(geometries, function (geometry) {//因為圖形可能為多個，所以用foreach，但此處圖形只會有一個
					//畫圖形
					var graphic = new esri.Graphic(geometry, symbol);
					graphic.id = "AA_geom" + AA_currIndex.toString();
					oCom.Layer.add(graphic);

					//縮放至圖形
					var evtExt = geometry.getExtent();					
					var newExt = new esri.geometry.Extent(evtExt.xmin - 500, evtExt.ymin - 5000, evtExt.xmax + 500, evtExt.ymax + 5000, map.spatialReference);
					//map.setExtent(newExt);//暫時拿掉畫完環域馬上定位的功能
					switch (AA_currMode) {
						case "new":
						    AA_Extent.push(newExt);
						    if (isInFldPrt != "Y" || isFirstIn == "N")//2016/03/16淹水兵棋台第一次進環域不畫graphic
						        setAreaGraphic(geom, AA_currIndex.toString());
                            //debugger;
                            isFirstIn = "N";
							break;
						case "edit":
							AA_Extent[AA_currIndex] = newExt;
							break;
					}
				});
			});
		}
    }
    //環域分析-DBPoint查詢(AreaAnalysis)
    function AreaAnalysisGetData(geom,idx) {
        //要查詢的圖層功能ID
        var qFuncId = "";
        // 2016/02/04 修改：環域分析強化，改用環域本身的圖層清單
        //for (var i = 0; i < arrOpenFuncs.length; i++) {
        //    if (arrOpenFuncs[i].Exec == "DBPoint")
        //        qFuncId += arrOpenFuncs[i].ID + ",";
        //}
        for (var i = 0; i < AA_MapList.length; i++) {            
            qFuncId += AA_MapList[i] + ",";
        }

        if (qFuncId.length != 0)
            qFuncId = qFuncId.slice(0, -1);
        //else
        //  alert("請先勾選「資料庫點位類圖層」，再進行環域（區域）統計分析");

        //圖形格式
        var qGeoType = geom.type;

        //圖形座標
        var qCoordiante = "";
        var Point84;
        switch (qGeoType) {
            case "point":
                Point84 = coordinatesTransfer(geom.x, geom.y, "EPSG:" + geom.spatialReference.latestWkid, "EPSG:4326");
                qCoordiante += Point84.x + "," + Point84.y;
                break;
            case "polyline":
                for (var i = 0; i < geom.paths.length; i++) {
                    for (var j = 0; j < geom.paths[i].length; j++) {
                        //因資料庫點位以WGS84為主，所以在此座標轉換
                        Point84 = coordinatesTransfer(geom.paths[i][j][0], geom.paths[i][j][1], "EPSG:" + geom.spatialReference.latestWkid, "EPSG:4326");
                        qCoordiante += Point84.x + "," + Point84.y + "|";
                    }
                }
                if (qCoordiante.length != 0)
                    qCoordiante = qCoordiante.slice(0, -1);//移除最後一個分隔符號'|'
                break;
            case "polygon":
                for (var i = 0; i < geom.rings.length; i++) {
                    for (var j = 0; j < geom.rings[i].length; j++) {
                        //因資料庫點位以WGS84為主，所以在此座標轉換
                        Point84 = coordinatesTransfer(geom.rings[i][j][0], geom.rings[i][j][1], "EPSG:" + geom.spatialReference.latestWkid, "EPSG:4326");
                        qCoordiante += Point84.x + "," + Point84.y + "|";
                    }
                }
                if (qCoordiante.length != 0)
                    qCoordiante = qCoordiante.slice(0, -1);//移除最後一個分隔符號'|'
                break;
        }

        //資料庫點位的環域分析
        if (qFuncId.length != 0) {
            //圖形座標系統
            var qEPSG = "4326";//因資料庫點位大部分為WGS84格式
            //Buffer長度（公尺）
            //var qBuffer = (($('#' + divMapQry + ' #AA_Slider').is(':visible')) ? $('#' + divMapQry + ' #AA_Slider').val() : "0.001") * 0.01;
            var qBuffer = (AA_bufferSize[idx] === undefined ? idx : AA_bufferSize[idx]) * 0.01;

            $.ajax({
                url: "GETData/RTUI/RT_AreaAnalysis.ashx",
                data: {
                    LayerId: qFuncId,
                    Coordinate: qCoordiante,
                    GeoType: qGeoType,
                    EPSG: qEPSG,
                    Buffer: qBuffer,
                    opreation: "areaAnalysis"
                },
                type: 'get',
                dataType: "text",
                cache: false,   //不允許快取
                beforeSend: function () {
                    showLoading();
                },
                success: function (data) {

                    var json = $.parseJSON(data);

                    // 2016/02/04 修改：環域分析強化
                    if (json.length > 0) {//有查詢到結果
                        $('#divAADrawListContent').find('div[exec="edit"][idx='+idx+']').html(json.length.toString());
                        jsonArryPair.push(idx, json);
                        //AreaAnalysisCreateResultDiv(json); 
                    } else {//沒有查詢到結果
                        $('#divAADrawListContent').find('div[exec="edit"][idx=' + idx + ']').html('查無結果');
                        jsonArryPair.push(idx, null);
                    }
                },
                error: function (a, b, c) {
                    alert("環域分析失敗");
                },
                complete: function () {
                    hideLoading();
                }
            });
        }
    }

    // 2016/02/04 修改：環域分析強化
    function ExecAreaAnalysisCreateResultDiv(idx) {
        var json = jsonArryPair.get(idx);
        if (json != null)
            AreaAnalysisCreateResultDiv(json);
    }

    //環域分析-開啟清單介面(AreaAnalysis)
    function AreaAnalysisCreateListDiv() {
        //如果清單已存在
        if ($('#' + divMapQry).length != 0) {

        }
        else {//如果清單不存在
            //畫介面
            var html = "";
            html += "<div id='" + divMapQry + "' style='width:280px; height:auto; z-index:3; '></div>";
            $("#MapToolResult").append(html);
            //載入表身
            $('#' + divMapQry).load("ucWidget/AreaAnalysis.htm", function () {
                //設定最大的環域半徑
                $('#AA_Slider').attr('max', AAmaxRadius);
                $("#" + divMapQry).show();
                //按鈕切換環域模式的事件
                $('#' + divMapQry + ' img').click(function () {
                    $(this).attr('src', $(this).attr('src').replace('_off', '_on')).siblings().each(function () { $(this).attr('src', $(this).attr('src').replace('_on', '_off')); });
                    if ($(this).is(':last-child') || $(this).is(':first-child')) {
                        $('#' + divMapQry + ' #AA_Slider').parent().hide();
                    }
                    else {
                        $('#' + divMapQry + ' #AA_Slider').parent().show();
                    }
                    AreaAnalysisSwitchMode($(this).attr('id'));
                });
                //選擇環域大小的拉桿
                $('#' + divMapQry + ' #AA_Slider').change(function (e) {
                    $('#' + divMapQry + " #AA_SliderValue").text("環域範圍：" + e.currentTarget.value + "公里");
                    //移除查詢結果視窗
                    $('#' + divMapQry + 'Result').remove();
                    //移除圖層
                    for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                        if (oCom.Layer.graphics[i].id.replace("AA_geom", "") == AA_currIndex) {
                            RemoveGraphicByID(oCom.Layer, "AA_geom" + AA_currIndex, "all");//移除圖層
                            break;
                        }
                    }
                    //修改圖形
                    if (AA_geom.length > 0) {
                        //AreaAnalysisBuffer(AA_geom[AA_currIndex], e.currentTarget.value, AA_currIndex); // 2016/02/04 修改：環域分析強化
                        AreaAnalysisBuffer(AA_geom[AA_currIndex], e.currentTarget.value, false, AA_currIndex); // 2016/02/04 修改：環域分析強化
                    }
                });

            });
        }
    }

    function AreaAnalysisCreateListDivForFlooding() {
        //debugger;
        //如果清單已存在
        if ($('#' + divMapQry).length != 0) {

        }
        else {//如果清單不存在
            //畫介面
            var html = "";
            html += "<div id='" + divMapQry + "' style='width:280px; height:auto; z-index:3; '></div>";
            $("#MapToolResult").append(html);
            //載入表身
            $('#' + divMapQry).load("ucWidget/AreaAnalysis.htm", function () {
                
                $("#AreaAnalysisDiv img").click();//@2016/03/16 Kevin 自動跳出分析圖層清單
               
                //設定最大的環域半徑
                $('#AA_Slider').attr('max', AAmaxRadius);
                $("#" + divMapQry).show();
                
                $('#' + divMapQry + ' #AA_Slider').parent().show();
                
                //按鈕切換環域模式的事件
                $('#' + divMapQry + ' img').click(function () {
                    
                    $(this).attr('src', $(this).attr('src').replace('_off', '_on')).siblings().each(function () { $(this).attr('src', $(this).attr('src').replace('_on', '_off')); });
                    if ($(this).is(':last-child') || $(this).is(':first-child')) {
                        $('#' + divMapQry + ' #AA_Slider').parent().hide();
                    }
                    else {
                        $('#' + divMapQry + ' #AA_Slider').parent().show();
                    }
                    AreaAnalysisSwitchMode($(this).attr('id'));
                });
                //2016/03/16 淹水兵棋台還域範圍預設帶2公里
                var bufferRadius;
                if (typeof (oModfldPrt.bufferRadius) != "undefined") {  //開啟專案，帶設定半徑
                    bufferRadius = oModfldPrt.bufferRadius;
                } else { bufferRadius = 2 }
                $('#' + divMapQry + ' #AA_Slider').val(bufferRadius);
                $('#' + divMapQry + ' #AA_SliderValue').text('環域範圍：' + bufferRadius + '公里');
                //選擇環域大小的拉桿
                $('#' + divMapQry + ' #AA_Slider').change(function (e) {
                    $('#' + divMapQry + " #AA_SliderValue").text("環域範圍：" + e.currentTarget.value + "公里");
                    //移除查詢結果視窗
                    $('#' + divMapQry + 'Result').remove();
                    //移除圖層
                    for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                        if (oCom.Layer.graphics[i].id.replace("AA_geom", "") == AA_currIndex) {
                            RemoveGraphicByID(oCom.Layer, "AA_geom" + AA_currIndex, "all");//移除圖層
                            break;
                        }
                    }
                    //修改圖形
                    if (AA_geom.length > 0) {
                        //AreaAnalysisBuffer(AA_geom[AA_currIndex], e.currentTarget.value, AA_currIndex); // 2016/02/04 修改：環域分析強化
                        AreaAnalysisBuffer(AA_geom[AA_currIndex], e.currentTarget.value, false, AA_currIndex); // 2016/02/04 修改：環域分析強化
                    }
                });

            });

            //$('#AA_mode_POINT').click();
        }
    }

    //環域分析-開啟結果介面(AreaAnalysis)
    function AreaAnalysisCreateResultDiv(json) {
        if ($('#' + divMapQry + "Result").length != 0) {
            $('#divAAResultDetail').hide();
            AreaAnalysisShowResult(json);
        }
        else {//如果清單不存在
            //畫介面
            var html = "";
            html += "<div id='" + divMapQry + "Result' class='openDiv' style='width:300px; height:auto; z-index:3; left:410px; top:100px;'></div>";
            $("#divMain").append(html);
            //載入表身
            $('#' + divMapQry + "Result").load("ucWidget/AreaAnalysisResult.htm", function () {
                //關閉按鈕
                $('#' + divMapQry + 'Result .WidgetFrmClose').click(function () {
                    $('#' + divMapQry + "Result").remove();
                });
                $("#" + divMapQry + "Result").offset({ left: 410, top: 100 });
                $("#" + divMapQry + "Result").show();
                //添加清單拖曳事件
                $("#" + divMapQry + "Result").draggable({ handle: "div:first" });//限定只有標題的那個div有拖曳功能
                //按鈕切換環域模式的事件

                AreaAnalysisShowResult(json);
            });
        }
    }
    //環域分析-填入查詢結果(AreaAnalysis)
    function AreaAnalysisShowResult(json) {
        //由結果組出html字串
        AA_lyrPair.clear();
        for (var i = json.length; i--;) {
            //AA_lyrPair.push(json[i].Layer, json[i].Title + "#" + json[i].X + "#" + json[i].Y); // 2016/02/04 修改：環域分析強化
            AA_lyrPair.push(json[i].Layer, json[i].Title + "#" + json[i].X + "#" + json[i].Y + "#" + json[i].Fid + "#" + json[i].Dist); // 2016/02/04 修改：環域分析強化
        }

        var html2 = "";
        for (var key in AA_lyrPair.PairArray) {
            html2 += "<tr>";
            html2 += "<td>" + key + "</td>";
            var values = AA_lyrPair.get(key).split(',');
            html2 += "<td>" + values.length + "</td>";
            //html2 += "<td><img src='images/widgetMapTool/infomation.png' style='width:12px; height:12px; cursor:pointer;' key='" + key + "' /></td>"; // 2016/02/04 修改：環域分析強化
            html2 += "<td><input type='radio' name='infomation' style='cursor:pointer;' key='" + key + "' /></td>"; // 2016/02/04 修改：環域分析強化
            html2 += "</tr>";
        }

        $('#divAAResultClassContent').empty().append(html2);
        $('#divAAResultClass').show();

        //點擊變色
        $('#divAAResultClassContent tr').click(function () {
            $(this).css('background-color', '#FFFF66').siblings().css("background-color", "#FFFFF");
        });
        //點擊列出物件
        //$('#divAAResultClassContent img').click(function () {
        $('#divAAResultClassContent input[name=infomation]').click(function () {            
            var key = $(this).attr('key');
            var values = AA_lyrPair.get(key).split(',');
            var html = "";
            for (var k = 0; k < values.length; k++) {
                var detail = values[k].split('#');
                html += "<tr>";
                html += "<td>" + detail[0] + "</td>";
                html += "<td style='width:61px;' >" + detail[4] + "</td>"; // 2016/02/04 修改：環域分析強化，加入距離
                html += "<td><img src='images/other/Loc.png' style='width:12px; height:12px; cursor:pointer;' X=" + detail[1] + " Y=" + detail[2] + " /></td>";
                html += "</tr>";
            }

            // 2016/02/04 修改：環域分析強化，開啟圖層
            var mapFid = values[0].split('#')[3];
            if ($("#liFunc" + mapFid).children("span:eq(0)").children("img").attr('src') != 'images/FuncList/check.png')
                $("#liFunc" + mapFid).children("span:eq(0)").click();

            $('#divAAResultDetailContent').empty().append(html);
            $('#divAAResultDetail').show();
            //點擊變色
            $('#divAAResultDetailContent tr').click(function () {
                $(this).css('background-color', '#FFFF66').siblings().css("background-color", "#FFFFFF");
            });
            //點擊定位
            $('#divAAResultDetailContent img').click(function () {
                var Point = coordinatesTransfer(parseFloat($(this).attr('X')), parseFloat($(this).attr('Y')), "EPSG:4326", "EPSG:" + map.spatialReference.latestWkid);
                map.centerAt(new esri.geometry.Point(Point.x, Point.y, map.spatialReference));
                RecordToGraphic(Point.x, Point.y, 'AA_glow');//圖形閃動特效
            });
            $('#divAAResultDetailContent img').mouseout(function () {
                var Point = coordinatesTransfer(parseFloat($(this).attr('X')), parseFloat($(this).attr('Y')), "EPSG:4326", "EPSG:" + map.spatialReference.latestWkid);
                RecordToGraphic(Point.x, Point.y, 'AA_glow');//圖形閃動特效
            });
        });
    }

    //環域分析-切換環域模式(AreaAnalysis)
    function AreaAnalysisSwitchMode(mode) {
        oCom.tbMapOn(mode.replace('AA_mode_',''));
    }
    //環域分析-更新表格(AreaAnalysis)
    function AreaAnalysisRefreshTable() {
        var tbstr = "";
        $('#' + divMapQry + "Result").remove();

        jsonArryPair = new PairObj(); // 2016/02/04 修改：環域分析強化，初始化 PairObj 物件

        var tdCnt = 1;
        for (var len = AA_geom.length; len--;) {
            if (AA_geom[len].status != "none") {//被刪除的圖形不顯示
                tbstr += "<tr>";
                tbstr += "<td style='display: none;'>" + len + "</td>"; // 2016/02/04 修改：環域分析強化               
                tbstr += "<td>" + tdCnt + "</td>"; // 2016/02/04 修改：環域分析強化
                // 2016/02/04 修改：環域分析強化
                if (chkGoemList.length > 0) {
                    var isCheck = "";
                    for (var j = 0; j < chkGoemList.length; j++) {
                        if (chkGoemList[j] == len) isCheck = "checked";
                    }
                    tbstr += "<td><input type='checkbox' idx=" + len + " onchange=\"oMapQry.chkGoem(this);\" " + isCheck + "  /></td>";
                }
                else
                    tbstr += "<td><input type='checkbox' idx=" + len + " onchange=\"oMapQry.chkGoem(this);\"  /></td>";

                var geomtype = "";
                switch (AA_geom[len].type) {
                    case "point":
                        geomtype = "點環域";
                        break;
                    case "polyline":
                        geomtype = "線環域";
                        break;
                    case "polygon":
                        geomtype = "區域分析";
                        break;
                }

                AreaAnalysisGetData(AA_geom[len], len); // 2016/02/04 修改：環域分析強化

                tbstr += "<td>" + geomtype + "</td>";
                tbstr += "<td><img src='images/widgetMapPainter/View12.png' exec='loc' idx=" + len + " style='cursor:pointer;' /></td>";
                tbstr += "<td><img src='images/widgetMapPainter/Erase12.png' exec='del' idx=" + len + " style='cursor:pointer;' /></td>";
                //tbstr += "<td><img src='images/widgetMapPainter/Modify12.png' exec='edit' idx=" + len + " style='cursor:pointer;' /></td>"; // 2016/02/04 修改：環域分析強化
                tbstr += "<td><div exec='edit' idx=" + len + " style='cursor:pointer;color:#0000FF;' ><div></td>"; // 2016/02/04 修改：環域分析強化
                tbstr += "</tr>";
                tdCnt++; // 2016/02/04 修改：環域分析強化
            }
        }
        //debugger;
        $('#divAADrawListContent').empty();
        $('#divAADrawListContent').html(tbstr);
        $('#divAADrawListContent tr').each(function () {
            if ($(this).find('td:first-child').html() == AA_currIndex) {
                $(this).css("background-color", "#FFFF66").siblings().css("background-color", "#ffffff");;
                return;
            }
        });
        $('#divAADrawListContent tr').on('click', function (e) {
            e.stopPropagation();

            $(this).css("background-color", "#FFFF66").siblings().css("background-color", "#ffffff");
            AA_currIndex = $(this).find("td:first-child").html();
            switch (AA_geom[AA_currIndex].type) {
                case "point":
                    $('#AA_mode_POINT').trigger('click');
                    $('#' + divMapQry + ' #AA_Slider').val(AA_bufferSize[AA_currIndex]);
                    $('#' + divMapQry + " #AA_SliderValue").text("環域範圍：" + AA_bufferSize[AA_currIndex] + "公里");
                    break;
                case "polyline":
                    $('#AA_mode_POLYLINE').trigger('click');
                    $('#' + divMapQry + ' #AA_Slider').val(AA_bufferSize[AA_currIndex]);
                    $('#' + divMapQry + " #AA_SliderValue").text("環域範圍：" + AA_bufferSize[AA_currIndex] + "公里");
                    break;
                case "polygon":
                    $('#AA_mode_POLYGON').trigger('click');
                    $('#' + divMapQry + ' #AA_Slider').val(AA_bufferSize[AA_currIndex]);
                    $('#' + divMapQry + " #AA_SliderValue").text("環域範圍：" + AA_bufferSize[AA_currIndex] + "公里");
                    break;
            }

            if ($(e.target).is('img')) {
                switch ($(e.target).attr('exec')) {
                    case "loc"://定位
                        map.setExtent(AA_Extent[$(e.target).attr('idx')]);
                        break;
                    case "del"://刪除
                        //移除查詢結果視窗
                        $('#' + divMapQry + 'Result').remove();
                        $('#' + divMapQry + 'IdentifyResult').remove();
                        //移除圖層
                        for (var i = 0; i < oCom.Layer.graphics.length; i++) {                            
                            if (oCom.Layer.graphics[i].id.replace("AA_geom", "") == $(e.target).attr('idx')) {
                                RemoveGraphicByID(oCom.Layer, "AA_geom" + $(e.target).attr('idx'), "all");//移除圖層
                                RemoveGraphicByID(oCom.Layer, "AA_MidGrphic" + $(e.target).attr('idx'), "all");// 2016/02/04 修改：環域分析強化，移除icon
                                $('#divRMenu').css({ 'display': 'none' });  // 2016/02/04 修改：環域分析強化
                                AA_geom[$(e.target).attr('idx')].status = "none";//被刪除後，使其在清單上不顯示
                                AreaAnalysisRefreshTable();
                                break;
                            }
                        }
                        break;
                    case "edit"://查詢
                        //移除查詢結果視窗
                        $('#' + divMapQry + 'Result').remove();
                        //環域分析查詢
                        AreaAnalysisGetData(AA_geom[$(e.target).attr('idx')], $(e.target).attr('idx'));
                        AreaAnalysisLayerQuery(AA_geom[$(e.target).attr('idx')], AA_bufferSize[$(e.target).attr('idx')]);
                        break;
                }
            }

            // 2016/02/04 修改：環域分析強化
            if($(e.target).is('div'))
            {
                if ($(e.target).attr('exec') == "edit")
                    ExecAreaAnalysisCreateResultDiv($(e.target).attr('idx'));
            }
        });
    }

    //環域分析-SDE圖層查詢
    function AreaAnalysisLayerQuery(geom,len) {
        $('#' + divMapQry + "IdentifyResult").remove()
        var temp = new Array();
        for (var i = 0; i < oCom.Layer.graphics.length; i++) {
            if (oCom.Layer.graphics[i].id.indexOf("AA_geom") > -1) {
                temp.push(oCom.Layer.graphics[i]);
            }
        }
        oCom.Layer.clear();

        for (var i = 0; i < temp.length; i++) {
            oCom.Layer.add(temp[i]);
        }

        identifyParams = new esri.tasks.IdentifyParameters();
        identifyParams.tolerance = TransMtoPX(len * 1000);//這個是畫面像素，會隨地圖層級不同代表不同的距離
        identifyParams.returnGeometry = true;
        identifyParams.width = map.width;
        identifyParams.height = map.height;
        identifyParams.geometry = geom;
        identifyParams.mapExtent = map.extent;
        identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
        $.ajax({
            url: gpNCDRLayers + "?Token=" + gpNCDR_Token + "&f=json",//MapService Layer List
            dataType: 'jsonp',//Cross Domain
            success: function (jsondata) {

                var IdentifyIds = new Array();
                //取得rest服務的所有圖層名稱與編號，
                for (var i = 0; i < jsondata.layers.length; i++) {
                    data = jsondata.layers[i];
                    if (data.subLayerIds != null)//如果有子圖層，則不顯示母圖層
                        continue;
                    if (data.parentLayerId != -1)//如果是子圖層，就看defaultVisibility屬性
                        if (data.defaultVisibility != true)
                            continue;

                    var flag = 1;

                    var isMatch = false;
                    for (var j = 0; j < arrFuncList.length; j++) {
                        //圖層的name跟arrFuncList[x].Name相比較
                        if (arrFuncList[j].Name.indexOf(data.name) > -1) {
                            if (data.name == "台灣外海100KM")
                                break;
                            /*
                            if (data.name != "縣市_五都版" &&
                                data.name != "村里_五都版" &&
                                data.name != "鄉鎮_五都版" &&
                                data.name != "河川(水利署)")//預設開啟這四個圖層，此四圖層不需經過圖層是否已開啟的檢查（想一下有沒有更好的寫法）
                                if ($('#cbFunc' + arrFuncList[j].ID).attr('src') != "images/FuncList/check.png")//檢查該圖層是否打開
                                    break;
                            */
                            if (curMapTool == "Identify") {
                                if (data.name != "縣市_五都版" &&
                                            data.name != "村里_五都版" &&
                                            data.name != "鄉鎮_五都版" &&
                                            data.name != "河川(水利署)")//預設開啟這四個圖層，此四圖層不需經過圖層是否已開啟的檢查（想一下有沒有更好的寫法）
                                    if ($('#cbFunc' + arrFuncList[j].ID).attr('src') != "images/FuncList/check.png")//檢查該圖層是否打開
                                        flag = flag * 0;
                            }
                            else {
                                if ($('#cbFunc' + arrFuncList[j].ID).attr('src') != "images/FuncList/check.png")//檢查該圖層是否打開
                                    flag = flag * 0;
                            }
                            //檢查圖層的最大層級Max跟最小層級Min
                            if (arrFuncList[j].Max != -1) {
                                if (map.getScale() < arrFuncList[j].Max) {//目前地圖階層大於該圖層的最大顯示階層
                                    flag = flag * 0;
                                }
                            }
                            if (arrFuncList[j].Min != -1) {
                                if (map.getScale() > arrFuncList[j].Min) {//目前地圖階層小於該圖層的最小顯示階層
                                    flag = flag * 0;
                                }
                            }
                            isMatch = true;
                            break;
                        }
                    }
                    if (!isMatch) //arrFuncList中沒有相似圖層
                        flag = flag * 0;

                    //檢查flag，視結果決定要不要加入IdentifyId中
                    if (flag) {
                        IdentifyIds.push(data.id);
                    }
                }

                if (IdentifyIds.length > 0) {//待查清單IdentifyIds中有值才進行SDE查詢，如果傳個空陣列進去，則是全部都查!
                    identifyParams.layerIds = IdentifyIds;
                    AreaAnalysisIdentifyTask();//開始IdentifyTask的查詢
                } else {
                    hideLoading();//隱藏讀取中gif
                }
            },
            error: function (a, b, c) {
                alert('圖資查詢失敗');
            }
        });

        showLoading();//顯示讀取中gif
    }

    function AreaAnalysisIdentifyTask() {
        //Symbol：多邊形，藍底藍框
        var blueSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 102]), 2), new dojo.Color([255, 255, 102, 0.25]));
        //Symbol：多邊形，紅底紅框
        var redSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.25]));
        //清空圖層暫存
        AA_featureSet = {};
        //清空圖層顏色暫存
        AA_featureColor = {};

        //處理查詢到的結果
        identifyTask.execute(identifyParams, function (idResults) {

            var divIdentifyList = "divIdenList";//圖資查詢的結果的Div名稱
            var polyPreIdentify = "IdentPoly";//圖資查詢多邊形前置詞
            hideLoading();//隱藏讀取中gif

            //Pair(key-value) Object，此物件用來組出結果清單
            var lyrPair = new PairObj();
            var seen = {};

            for (var i = 0; i < idResults.length; i++) {
                var idResult = idResults[i];
                //將查詢到的結果加到圖層上
                var feature = idResult.feature;
                feature.setSymbol(redSymbol);
                feature.id = polyPreIdentify + idResult.feature.attributes.OBJECTID;
                feature.name = idResult.feature.attributes[idResult.displayFieldName];
                feature.lyrSet = idResult.layerName;
                //oCom.Layer.add(feature);
                //先不要馬上疊圖，暫時先存起來
                if (AA_featureSet[idResult.layerName] === undefined)
                    AA_featureSet[idResult.layerName] = [];

                AA_featureSet[idResult.layerName].push(feature);

                //刪除重複的圖資清單
                if (seen[idResult.layerName] === undefined) {
                    seen[idResult.layerName] = [];
                    seen[idResult.layerName].push(idResult.value);
                    lyrPair.push(idResult.layerName, idResult.value + "#" + idResult.feature.attributes.OBJECTID);//(圖層名稱,圖形名稱#圖形識別id)
                }
                else {
                    var check = $.inArray(idResult.value, seen[idResult.layerName]);
                    if (check == -1) {
                        seen[idResult.layerName].push(idResult.value);
                        lyrPair.push(idResult.layerName, idResult.value + "#" + idResult.feature.attributes.OBJECTID);//(圖層名稱,圖形名稱#圖形識別id)
                    }
                }
            }
            //給圖層顏色暫存一個預設顏色
            for (var key in AA_featureSet) {
                if (AA_featureColor[key] === undefined)
                    AA_featureColor[key] = [];

                AA_featureColor[key][0] = redSymbol;
                AA_featureColor[key][1] = blueSymbol;
            }


            if ($('#' + divMapQry + "IdentifyResult").length != 0) {
                AreaAnalysisShowIdentifyResult(lyrPair);
            }
            else {//如果清單不存在
                //畫介面
                var html = "";
                html += "<div id='" + divMapQry + "IdentifyResult' class='openDiv' style='width:300px; height:auto; z-index:3; left:100px; top:450px;'></div>";
                $("#divMain").append(html);
                //載入表身
                $('#' + divMapQry + "IdentifyResult").load("ucWidget/IdentifyResult.htm", function () {
                    //關閉按鈕
                    $('#' + divMapQry + 'IdentifyResult .WidgetFrmClose').click(function () {
                        $('#' + divMapQry + "IdentifyResult").remove();
                    });
                    $("#" + divMapQry + "IdentifyResult").offset({ left: 100, top: 450 });
                    $("#" + divMapQry + "IdentifyResult").show();
                    //添加清單拖曳事件
                    $("#" + divMapQry + "IdentifyResult").draggable({ handle: "div:first" });//限定只有標題的那個div有拖曳功能
                    //按鈕切換環域模式的事件

                    AreaAnalysisShowIdentifyResult(lyrPair);
                });
            }
        });
    }

    function AreaAnalysisShowIdentifyResult(lyrPair) {
        //Symbol：多邊形，藍底藍框(其實是黃底黃框)
        var blueSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 102]), 2), new dojo.Color([255, 255, 102, 0.25]));
        //Symbol：多邊形，紅底紅框
        var redSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.25]));
        var html2 = "";
        for (var key in lyrPair.PairArray) {
            html2 += "<tr>";
            html2 += "<td>" + key + "</td>";
            var values = lyrPair.get(key).split(',');
            html2 += "<td>" + values.length + "</td>";
            html2 += "<td><input type='checkbox' style='width:12px; height:12px; cursor:pointer;' class='SetInfo' value='" + key + "' /></td>";
            html2 += "<td><img src='images/widgetMapTool/color-picker-icon.png' style='width:12px; height:12px; cursor:pointer;' class='SetLyrColor' /></td>";
            html2 += "</tr>";
        }

        $('#divIdentifyResultClassContent').empty().append(html2);
        $('#divIdentifyResultClass').show();

        //#region 點擊列出該圖層集的詳細資料
        $('#divIdentifyResultClassContent tr').click(function (e) {
            /*
            if (e.target.tagName == "IMG")//如果事件是由IMG(色彩選擇器)引起
            {
                e.stopPropagation();//停止Event Bubble
            }
            */
            //切換目前操作的圖層集
            AA_currLyrSet = $(this).find('input').val();

            //清空詳細清單
            $('#divIdentifyResultDetailContent').empty();

            //點擊的該列變色
            $(this)
                .css('background-color', '#FFFF66')
                .siblings().css("background-color", "#FFFFF");

            if ($(this).find('input').is(':checked'))//目標圖層集有被勾選
            {
                //#region 組出詳細資料清單
                var html = "";
                var values = lyrPair.get(AA_currLyrSet).split(',');
                for (var k = 0; k < values.length; k++) {
                    var detail = values[k].split('#');
                    html += "<tr>";
                    html += "<td>" + detail[0] + "</td>";
                    html += "<td><img src='images/other/Loc.png' style='width:12px; height:12px; cursor:pointer;' lyrName='" + detail[0] + "' objId=" + detail[1] + " /></td>";
                    html += "</tr>";
                }
                $('#divIdentifyResultDetailContent').append(html);
                //#endregion

                //顯示詳細清單
                $('#divIdentifyResultDetail').show();

                //#region 把有勾選的圖層疊上去，沒勾選的圖層移除
                var temp = new Array();
                for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                    if (oCom.Layer.graphics[i].id.indexOf("AA_geom") > -1) {
                        temp.push(oCom.Layer.graphics[i]);
                    }
                }
                oCom.Layer.clear();

                for (var i = 0; i < temp.length; i++) {
                    oCom.Layer.add(temp[i]);
                }

                $('#divIdentifyResultClassContent').find('input:checked').each(function () {
                    if ($(this).val() != AA_currLyrSet) {
                        for (var i = 0; i < AA_featureSet[$(this).val()].length; i++) {
                            oCom.Layer.add(AA_featureSet[$(this).val()][i]);
                        }
                    }
                });
                for (var i = 0; i < AA_featureSet[AA_currLyrSet].length; i++) {
                    oCom.Layer.add(AA_featureSet[AA_currLyrSet][i]);
                }//為了讓目前操作圖層在最上方，順序調整了一下
                //#endregion

                //#region 點擊清單，該列(tr)變色，對應的圖層變色(文查圖)
                $('#divIdentifyResultDetailContent tr').click(function (e) {
                    $(this).css('background-color', '#FFFF66').siblings().css("background-color", "#FFFFFF");

                    var target;
                    for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                        if (oCom.Layer.graphics[i].lyrSet == AA_currLyrSet) {
                            if (oCom.Layer.graphics[i].name == $(this).find('img:first-child').attr('lyrName')) {
                                target = oCom.Layer.graphics[i];
                                target.setSymbol(AA_featureColor[AA_currLyrSet][1]);
                            }
                            else {
                                if (oCom.Layer.graphics[i].id.indexOf("AA_geom") < 0)
                                    oCom.Layer.graphics[i].setSymbol(AA_featureColor[AA_currLyrSet][0]);
                            }
                        }
                    }
                    oCom.Layer.remove(target);
                    oCom.Layer.add(target);//把點擊的圖層移到最上方

                    if (e.target.tagName == "IMG")//如果事件是由IMG(定位按鈕)引起
                    {
                        map.setExtent(target.geometry.getExtent());//做圖形定位
                    }
                });
                //#endregion


                //#region 滑鼠滑過圖層觸發事件
                //綁定事件之前要先清除之前綁定的事件
                dojo.disconnect(layerEventMouseover);

                layerEventMouseover = dojo.connect(oCom.Layer, "onMouseOver", function (evt) {
                    //圖形變色
                    for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                        if (oCom.Layer.graphics[i].lyrSet == AA_currLyrSet) {
                            if (oCom.Layer.graphics[i].id == evt.graphic.id) {
                                oCom.Layer.graphics[i].setSymbol(AA_featureColor[AA_currLyrSet][1]);
                            }
                            else {
                                oCom.Layer.graphics[i].setSymbol(AA_featureColor[AA_currLyrSet][0]);
                            }
                        }
                    }
                    var infoContent = "";
                    //圖查文
                    $('#divIdentifyResultDetailContent tr').find('td:first-child').each(function () {
                        //var _this = $(this);
                        if ($(this).text() == evt.graphic.name) {

                            $(this)
                                .parent().css('background-color', '#ffff66')
                                .siblings().css('background-color', '#ffffff')
                                .parent().parent().parent().scrollTop($(this).parent().siblings().addBack().index($(this).parent()) * 20);//把捲軸捲到目標清單的位置

                            infoContent = $(this).text();//InfoWindow的內容
                            return;

                        }
                    })
                    if (infoContent != "") {
                        map.infoWindow.setContent(infoContent);
                        map.infoWindow.resize(75, 30);
                        (evt) ? map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint)) : null;//打開InfoWindow
                    }
                });
                //#endregion

                //#region 滑鼠離開圖形觸發事件
                //綁定事件之前要先清除之前綁定的事件
                dojo.disconnect(layerEventMouseout);

                layerEventMouseout = dojo.connect(oCom.Layer, "onMouseOut", function (evt) {
                    map.infoWindow.hide();//關閉InfoWindow
                });
                //#endregion
            }
            else//目標圖層集沒有被勾選
            {
                //不顯示詳細清單
                $('#divIdentifyResultDetail').hide();

                //#region 把有勾選的圖層疊上去，沒勾選的圖層移除
                var temp = new Array();
                for (var i = 0; i < oCom.Layer.graphics.length; i++) {
                    if (oCom.Layer.graphics[i].id.indexOf("AA_geom") > -1) {
                        temp.push(oCom.Layer.graphics[i]);
                    }
                }
                oCom.Layer.clear();

                for (var i = 0; i < temp.length; i++) {
                    oCom.Layer.add(temp[i]);
                }
                $('#divIdentifyResultClassContent').find('input:checked').each(function () {
                    for (var i = 0; i < AA_featureSet[$(this).val()].length; i++) {
                        oCom.Layer.add(AA_featureSet[$(this).val()][i]);
                    }
                });
                //#endregion
            }
        });
        //#endregion

        //#region 顏色選擇器
        $('#divIdentifyResultClassContent .SetLyrColor').colpick({
            layout: 'hex',
            onSubmit: function (hsb, hex, rgb, el) {
                AA_currLyrSet = $(el).parent().siblings(":first-child").text();
                //Set New Color
                var newSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([rgb.r, rgb.g, rgb.b]), 2), new dojo.Color([rgb.r, rgb.g, rgb.b, 0.25]));
                //var reverseSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255 - rgb.r, 255 - rgb.g, 255 - rgb.b]), 2), new dojo.Color([255 - rgb.r, 255 - rgb.g, 255 - rgb.b, 0.25]));
                AA_featureColor[AA_currLyrSet][0] = newSymbol;
                //AA_featureColor[AA_currLyrSet][1] = reverseSymbol;
                //change Lyr Color
                AreaAnalysisShowIdentifyLayer();
                $(el).colpickHide();
            }
        });
        //#endregion

    }

    function AreaAnalysisShowIdentifyLayer() {
        var temp = new Array();
        for (var i = 0; i < oCom.Layer.graphics.length; i++) {
            if (oCom.Layer.graphics[i].id.indexOf("AA_geom") > -1) {
                temp.push(oCom.Layer.graphics[i]);
            }
        }
        oCom.Layer.clear();

        for (var i = 0; i < temp.length; i++) {
            oCom.Layer.add(temp[i]);
        }
        /*
        //重新設定圖層顏色
        for (var key in AA_featureSet) {
            for (var i = 0; i < AA_featureSet[key].length; i++) {
                AA_featureSet[key][i].setSymbol(AA_featureColor[key][0]);
            }
        }
        */

        for (var i = 0; i < AA_featureSet[AA_currLyrSet].length; i++) {
            AA_featureSet[AA_currLyrSet][i].setSymbol(AA_featureColor[AA_currLyrSet][0]);
        }



        $('#divIdentifyResultClassContent').find('input:checked').each(function () {
            if ($(this).val() != AA_currLyrSet) {
                for (var i = 0; i < AA_featureSet[$(this).val()].length; i++) {
                    oCom.Layer.add(AA_featureSet[$(this).val()][i]);
                }
            }
        });
        for (var i = 0; i < AA_featureSet[AA_currLyrSet].length; i++) {
            oCom.Layer.add(AA_featureSet[AA_currLyrSet][i]);
        }//為了讓目前操作圖層在最上方，順序調整了一下
        /*
        //將圖層疊上畫布
        for (var i = 0; i < AA_featureSet[AA_currLyrSet].length; i++) {
            oCom.Layer.add(AA_featureSet[AA_currLyrSet][i]);
        }
        */
    }


    //公尺轉換成pixel
    function TransMtoPX(m) {
        var re = 0;
        re = m * map.width / (map.extent.xmax - map.extent.xmin);
        re = parseInt(re);
        return re;
    }


    // 路徑規劃 start  2015/05/25 修改
    // 滑鼠事件接續(因確認是否有街景服務有時間差問題，故需等結果回來後才能繼續往下執行)
    function MouseDownByRoute(evt) {
        if (evt.button != 0 || (evt.graphic != null && evt.graphic.id != 'MousePoint')) { //鎖定只有滑鼠左鍵才可以往下執行
            return false;
        }

        $('#divRMenu').css({ 'display': 'none' });

        var sv = new google.maps.StreetViewService();
        var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
        var isStreet = '';
        var NpointLat = mp.y.toFixed(6);
        var NpointLng = mp.x.toFixed(6);
        var sPlace = new google.maps.LatLng(NpointLat, NpointLng);

        //判斷是否有街景資訊服務
        sv.getPanoramaByLocation(sPlace, 50, function CheckParanomaData(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                //有服務
                isStreet = true;
                MouseDown(evt, NpointLat, NpointLng, isStreet);
            }
            else {
                isStreet = false;
                MouseDown(evt, NpointLat, NpointLng, isStreet)
            }
        });
    }

    function MouseDown(evt, Lat, Lng, isStreet) {

        document.oncontextmenu = function () { return false; };
        var strHTML;
        if (evt.button == 0) {
            if (evt.graphic == null) {
                for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
                    if (map.graphics.graphics[j].id == 'MousePoint')
                        map.graphics.remove(map.graphics.graphics[j]);
                }

                var point = new esri.geometry.Point(Lng, Lat, new esri.SpatialReference({ wkid: 4326 }));
                var PicSymbol = new esri.symbol.PictureMarkerSymbol('images/MapTool/LocateInMap.png', 37, 42);
                var graphic = new esri.Graphic(point, PicSymbol);
                graphic.id = 'MousePoint';
                map.graphics.add(graphic);
            }
            else {
                strHTML = getMouseLeftMenu(Lat, Lng, isStreet);
                $("#divRMenu").html(strHTML);
            }
        }

        if (evt.button == 0 && evt.graphic != null) {
            if (BrowserVer.firefox) {
                menuX = evt.pageX + 8;
                menuY = evt.pageY + 12;
            }
            else {
                menuX = evt.clientX + 8;
                menuY = evt.clientY + 12;
            }
            if ((parseInt(menuX) + 150) > parseInt(parent.bodyW)) {
                menuX = menuX - 150;
            }

            if ((parseInt(menuY) + 180) > parseInt(parent.bodyH)) {
                menuY = menuY - 180;
            }

            $('#divRMenu').css({ 'left': (menuX + 'px'), 'top': (menuY + 'px'), 'display': 'block' });
        }
    }

    //-------------------------------------------------------------- 左鍵選單
    function getMouseLeftMenu(Lat, Lng, isStreet) {
        var m = "";
        m += "<div style='width:150px;padding:0px; color:#1A75BB; border:1px solid #997D93; font-size:12px;background-color:#ffffff;'>";

        if (isStreet) {
            m += "    <table width='100%' cellpadding='3px' cellspacing='0px' style='margin-bottom:3px;font-size:9pt;'>";
            m += "        <thead>";
            m += "            <tr style='background-color:#0094ff; color:#FFFFFF; vertical-align:middle;'>";
            m += "                <th colspan='2'> Google </th>";
            m += "            </tr>";
            m += "        </thead>";
            m += "        <tr>";
            m += "        <td align='center'><span onClick=oMapQry.openStreetView(" + Lng + "," + Lat + "); style=\"cursor:pointer;color:#3E3A39;font-family:Arial;新細明體;\" >街景</span></td>";
            m += "        </tr>";
            m += "    </table>";
        }

        m += "    <table width='100%' cellpadding='3px' cellspacing='0px' style='margin-bottom:3px;font-size:9pt;'>";
        m += "        <thead>";
        m += "            <tr style='background-color:#0094ff; color:#FFFFFF; vertical-align:middle;'>";
        m += "                <th colspan='3'> 路徑規劃 </th>";
        m += "            </tr>";
        m += "        </thead>";
        m += "        <tr>";
        m += "            <td align='center'><span onClick=oMapQry.setPointPic(" + Lat + "," + Lng + ",'S');  ";
        m += "            style=\"cursor:pointer;color:#3E3A39;font-family:Arial;新細明體;\" >起點</span></td>";
        m += "            <td align='center'><span onClick=oMapQry.setPointPic(" + Lat + "," + Lng + ",'M');  ";
        m += "            style=\"cursor:pointer;color:#3E3A39;font-family:Arial;新細明體;\" >中繼點</span></td>";
        m += "            <td align='center'><span onClick=oMapQry.setPointPic(" + Lat + "," + Lng + ",'E');  ";
        m += "            style=\"cursor:pointer;color:#3E3A39;font-family:Arial;新細明體;\" >迄點</span></td>";
        m += "        </tr>";
        m += "    </table>";
        m += "</div>";
        return m.toString();
    }

    //更換圖示、設定點屬性    
    function setPointAtr(sLat, sLng, PType) {
        if (PType == 'S') {

            for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
                if (map.graphics.graphics[j].id == 'StartPoint' || map.graphics.graphics[j].id == 'MousePoint')
                    map.graphics.remove(map.graphics.graphics[j]);
            }

            StartPoint = new Object();
            if (sLat != undefined && sLng != undefined) {
                var point = new esri.geometry.Point(sLng, sLat, new esri.SpatialReference({ wkid: 4326 }));
                var PicSymbol = new esri.symbol.PictureMarkerSymbol('images/MapTool/route_START.png', 37, 42);
                var graphic = new esri.Graphic(point, PicSymbol);
                graphic.id = 'StartPoint';
                map.graphics.add(graphic);

                StartPoint.lat = sLat.toString();
                StartPoint.lng = sLng.toString();
            }
            else
                StartPoint = null;
        }
        else if (PType == 'M') {

            for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
                if (map.graphics.graphics[j].id == 'MidPoint' || map.graphics.graphics[j].id == 'MousePoint')
                    map.graphics.remove(map.graphics.graphics[j]);
            }

            MidPoint = new Object();
            if (sLat != undefined && sLng != undefined) {
                var point = new esri.geometry.Point(sLng, sLat, new esri.SpatialReference({ wkid: 4326 }));
                var PicSymbol = new esri.symbol.PictureMarkerSymbol('images/MapTool/locateIcon.png', 37, 42);
                var graphic = new esri.Graphic(point, PicSymbol);
                graphic.id = 'MidPoint';
                map.graphics.add(graphic);

                MidPoint.lat = sLat.toString();
                MidPoint.lng = sLng.toString();
            }
            else
                MidPoint = null;
        }
        else if (PType == 'E') {

            for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
                if (map.graphics.graphics[j].id == 'EndPoint' || map.graphics.graphics[j].id == 'MousePoint')
                    map.graphics.remove(map.graphics.graphics[j]);
            }

            EndPoint = new Object();
            if (sLat != undefined && sLng != undefined) {
                var point = new esri.geometry.Point(sLng, sLat, new esri.SpatialReference({ wkid: 4326 }));
                var PicSymbol = new esri.symbol.PictureMarkerSymbol('images/MapTool/route_END.png', 37, 42);
                var graphic = new esri.Graphic(point, PicSymbol);
                graphic.id = 'EndPoint';
                map.graphics.add(graphic);

                EndPoint.lat = sLat.toString();
                EndPoint.lng = sLng.toString();
            }
            else
                EndPoint = null;
        }

        oCom.hiddenRMenu();
    }

    oCom.hiddenRMenu =  function () {
        $('#divRMenu').css({ 'display': 'none' });
    }

    //啟動路徑規劃Function() - 完整
    function goPlanWay() {
        clearRoutes_variable();
        if (StartPoint != null && EndPoint != null) {
            var T_dtd = $.Deferred(); // 生成Deferred对象
            $.when(calcRoute(StartPoint, MidPoint, EndPoint))
                .done(function () {
                    drawRoutesWay(jsonObj.way);
                    BuildTable(jsonObj.Allroute);
                })
                .fail(function () {
                    return "導航分段資訊出現錯誤";
                });
            return T_dtd.promise();
        }
        else
            alert('請設定起點與終點！');
    }


    // 路徑規劃 核心運作
    function calcRoute(StartPoint, MidPoint, EndPoint) {
        var dtd = $.Deferred(); // 生成Deferred對象
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();

        /* 未來的警示語
        var notes = '允許的路點數上限為 8，且包含起點和目的地。\r\n' +
                    'Maps API for Business 客戶的要求最多可使用 23 個路點' +
                    '，包含起點和目的地。大眾運輸導航不支援路點。';
        */
        var waypts = [];
        var startP = new google.maps.LatLng(StartPoint.lat, StartPoint.lng);
        var endP = new google.maps.LatLng(EndPoint.lat, EndPoint.lng);
        var waysAry = (function () {
            var ary = [];
            if (MidPoint != null) { //若日後中繼點變多，這裡一定要改
                ary.push(MidPoint.lat + ',' + MidPoint.lng);

            }
            return ary;
        })();

        for (var i = 0; i < waysAry.length; i++) {
            waypts.push({
                location: waysAry[i],
                stopover: true//實際停靠點(true)或只是您在到達指定位置之前想要路過的點(false)
            });
        }

        var request = {
            origin: startP,
            destination: endP,
            waypoints: waypts,//路徑規劃的中繼點Array
            travelMode: google.maps.TravelMode['DRIVING'], // DRIVING：標準行車路線，WALKING：行人步行路線，BICYCLING：單車路線，TRANSIT：大眾運輸路線
            unitSystem: google.maps.UnitSystem.METRIC, //公制系統。系統會使用公里來顯示距離。
            avoidHighways: true,//true(預設)避開主要高速公路
            provideRouteAlternatives: false, //true，表示「導航」服務可在回應中提供一條以上的替代路線
            optimizeWaypoints: true,//提供 waypoints 的路線進行最佳化，提供最短的可能路徑。
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                var result = directionsDisplay.getDirections().routes[0];
                jsonObj["count"] = directionsDisplay.getDirections().routes.length; //幾筆地址定位資訊

                var lgs = new Array();
                for (var lg = 0 ; lg < result.legs.length; lg++) {
                    var route = new Array();
                    var lgObj = new Object();
                    //個別取出資訊 Start
                    for (var i2 = 0; i2 < result.legs[lg].steps.length; i2++) {
                        var instructions = result.legs[lg].steps[i2].instructions

                        //處理將<b> 與</b>與<div>... 字移除
                        do {
                            instructions = instructions.replace('<div style=\"font-size:0.9em\">', '');
                        } while (instructions.indexOf('<div style=\"font-size:0.9em\">') != -1);
                        do {
                            instructions = instructions.replace('</div>', '');
                        } while (instructions.indexOf('</div>') != -1);
                        do {
                            instructions = instructions.replace('<b>', '');
                        } while (instructions.indexOf('<b>') != -1);
                        do {
                            instructions = instructions.replace('</b>', '');
                        } while (instructions.indexOf('</b>') != -1);
                        instructions = instructions;

                        var newValue = { "maneuver": result.legs[lg].steps[i2].maneuver, "instructions": instructions, "distance": result.legs[lg].steps[i2].distance.text };
                        route.push(newValue);
                    }

                    lgObj["route"] = route; //路徑
                    lgObj["startaddress"] = result.legs[lg].start_address; //起始地址
                    lgObj["endaddress"] = result.legs[lg].end_address; //終點地址
                    lgs.push(lgObj);
                }
                jsonObj["Allroute"] = lgs;

                var way = new Array();
                for (var i = 0; i < result.overview_path.length; i++) {
                    //var CoordinateX = result.overview_path[i].lng().toFixed(3); // 2015/08/18 修改：為忠實呈現資料
                    var CoordinateX = result.overview_path[i].lng();
                    //var CoordinateY = result.overview_path[i].lat().toFixed(3); // 2015/08/18 修改：為忠實呈現資料
                    var CoordinateY = result.overview_path[i].lat();
                    var CoordinateResult = new Object();
                    var newCoordinateValue = { "X": CoordinateX, "Y": CoordinateY };
                    way.push(newCoordinateValue);
                }
                jsonObj["way"] = way;
                dtd.resolve(); // 改變Deferred對象的執行狀態
            }
        });
        return dtd.promise(); // 不予許Deferred結果被更改，保證結果不被修改
    }

    //畫出規劃路線  
    function drawRoutesWay(pointsAry) {
        var mps = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));
        for (var ptx in pointsAry) {
            mps.addPoint({ "x": Number(pointsAry[ptx].X), "y": Number(pointsAry[ptx].Y) });
        }

        var polylineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([204, 102, 51]), 4);
        var routes_PL = new esri.geometry.Polyline(new esri.SpatialReference({ wkid: 4326 }));
        routes_PL.addPath(mps.points);
        var graphic = new esri.Graphic(routes_PL, polylineSymbol);
        graphic.id = 'routesGraphic';
        map.graphics.add(graphic);
    }

    // 將路徑規劃結果顯示出來
    function BuildTable(RData) {
        var SAdress = '', MAdress = '', EAdress = '', AdrHtml = '', RouHtml = '', sumDist = 0;
        if (RData.length > 1) {
            SAdress = RData[0].startaddress.toString();
            MAdress = RData[0].endaddress.toString();
            EAdress = RData[1].endaddress.toString();
        }
        else {
            SAdress = RData[0].startaddress.toString();
            EAdress = RData[0].endaddress.toString();
        }

        // 先組地址
        AdrHtml += '<div style="width:270px;height:145px;">';
        AdrHtml += '<table id="AdressTb" style="width:100%;text-align:left;" >';
        AdrHtml += '<tr><td style="border:1px solid #E1E1E1;padding:5px 0px 5px 5px;"><img src="images/MapTool/route_START.png" style="float:left;width:29.6px;height:33.6px;"/>';
        AdrHtml += '<div style="color:#008C86;font-size:9pt;">起點';
        AdrHtml += '<img src="images/MapTool/point_down.png" style="margin-left:5px;cursor: pointer;" onclick="oMapQry.chgPoints(\'0\',\'down\',\'StartPoint\',\'MidPoint\',\'M\',\'S\');" /></div>';
        AdrHtml += '<div id="StartPlace" style="font-size: 9pt;">' + SAdress.replace('Unnamed Road,', '') + '</div></td></tr>';
        AdrHtml += '<tr><td style="border:1px solid #E1E1E1;padding:5px 0px 5px 5px;"><img src="images/MapTool/locateIcon.png" style="float:left;width:29.6px;height:33.6px;"/>';
        AdrHtml += '<div style="color:#008C86;font-size:9pt;">中繼點';
        AdrHtml += '<img src="images/MapTool/point_up.png" style="margin-left:5px;cursor: pointer;" onclick="oMapQry.chgPoints(\'1\',\'up\',\'MidPoint\',\'StartPoint\',\'S\',\'M\');" />';
        AdrHtml += '<img src="images/MapTool/point_down.png" style="margin-left:5px;cursor: pointer;" onclick="oMapQry.chgPoints(\'1\',\'down\',\'MidPoint\',\'EndPoint\',\'E\',\'M\');" /></div>';
        AdrHtml += '<div id="MidPlace" style="font-size: 9pt;">' + MAdress.replace('Unnamed Road,', '') + '</div></td></tr>';
        AdrHtml += '<tr><td style="border:1px solid #E1E1E1;padding:5px 0px 5px 5px;"><img src="images/MapTool/route_END.png" style="float:left;width:29.6px;height:33.6px;"/>';
        AdrHtml += '<div style="color:#008C86;font-size:9pt;">終點';
        AdrHtml += '<img src="images/MapTool/point_up.png" style="margin-left:5px;cursor: pointer;" onclick="oMapQry.chgPoints(\'2\',\'up\',\'EndPoint\',\'MidPoint\',\'M\',\'E\');" /></div>';
        AdrHtml += '<div id="EndPlace" style="font-size: 9pt;">' + EAdress.replace('Unnamed Road,', '') + '</div></td></tr>';
        AdrHtml += '</table>';
        AdrHtml += '</div>';
        RouHtml += '<div style="width:286px;height:100px;overflow-y:scroll;">';
        RouHtml += '<table id="RouteTb" style="width:100%;text-align:left;" >';
        RouHtml += '<tr><td colspan="2" style="border:1px solid #E1E1E1;padding:5px 0px 5px 5px;font-size: 9pt;font-weight:normal;">規劃結果</td></tr>';

        for (var lg in RData) {
            for (var rt in RData[lg]["route"]) {
                RouHtml += '<tr>';
                RouHtml += '<td style="border:1px solid #E1E1E1;font-size: 9pt;font-weight:normal;padding:5px 0px 5px 5px;">' + RData[lg]["route"][rt].instructions.toString() + '</td>';
                RouHtml += '<td style="width:60px;border:1px solid #E1E1E1;font-size: 9pt;font-weight:normal;padding:5px 0px 5px 5px;">' + RData[lg]["route"][rt].distance.toString() + '</td>';

                if (RData[lg]["route"][rt].distance.indexOf('公里') > 0)
                    sumDist += Number(RData[lg]["route"][rt].distance.replace('公里', ''));
                else if (RData[lg]["route"][rt].distance.indexOf('公尺') > 0)
                    sumDist += (Number(RData[lg]["route"][rt].distance.replace('公尺', '')) / 1000);
            }
        }
        RouHtml += '<tr><td colspan="2" style="border:1px solid #E1E1E1;font-size: 9pt;font-weight:normal;">總里程數' + formatFloat(sumDist, 3) + '公里</td></tr></table>';
        RouHtml += '</div>';

        $('#MapToolResult').html(AdrHtml + RouHtml);
    }

    function formatFloat(num, pos) {
        var size = Math.pow(10, pos);
        return Math.round(num * size) / size;
    }

    /*街景 Start*/
    /* 彈出StreetView視窗 */
    function showStreetView(_lng, _lat) {
        $("#streetview").draggable({ // 2015/05/25 修改
            cancel: "#streetviewDiv,input,textarea,button,select,option"
        });
        $('#streetviewDiv').height('325px');
        //街景物件初始化
        var myplace = new google.maps.LatLng(_lat, _lng);
        var panoramaOptions = {
            //position: myplace,
            pov: {
                heading: 270,
                pitch: 0
            },
            visible: true
        };
        panorama = new google.maps.StreetViewPanorama(document.getElementById('streetviewDiv'), panoramaOptions);
        var sv = new google.maps.StreetViewService();
        //sv.getPanorama({ location: myplace, radius: 50 }, processSVData);
        sv.getPanoramaByLocation(myplace, 50, processSVData);
        //panorama.setPov({ heading: 0, pitch: 0 });

        //顯示街景DIV
        toggleStreetViewOpen();
    }
    function processSVData(data, status) {
        console.log(status);
        if (status === google.maps.StreetViewStatus.OK) {
            
            panorama.setPano(data.location.pano);
            panorama.setPov({
                heading: 0,
                pitch: 0
            });
        } else if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
            var info = "此位置街景不存在，請重新點選";
            $('#streetviewDiv').height('50px');
            $('#streetviewDiv').html(info);
        }
    }
    /* 控制街景轉的角度 */
    function rotateStreetView() {
        var newheading = panorama.getPov().heading;
        if (newheading > 360) {
            newheading -= 360;
        }
        panorama.setPov(
            { heading: newheading + 1, pitch: 0 }//heading設為1比較平滑
        );
    }
    /* 關閉街景DIV */
    function toggleStreetViewClose() {
        $('#streetview').toggle();
        panorama.setVisible(false);
    }
    /* 打開街景DIV */
    function toggleStreetViewOpen() {
        if ($('#streetview').css('display') == 'block')
            toggleStreetViewClose();

        var xTop = menuY;
        var xLeft = menuX + 150;
        $('#streetview').toggle().css({ 'top': xTop + 'px', 'left': xLeft + 'px' });
        panorama.setVisible(true);
    }
    /*街景 End*/

    // 起點、中繼點、終點點位順序更動
    function chgPointAtr(elindex, type, OrPt, ChgPt, ChgFlg, OrgFlg) {
        clearRoutes_variable();

        // 圖點更動            
        for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
            var OrgLat, OrgLng, ChgLat, ChgLng;

            if (map.graphics.graphics[j].id == OrPt) {
                OrgLat = map.graphics.graphics[j].geometry.y;
                OrgLng = map.graphics.graphics[j].geometry.x;
            }
            if (map.graphics.graphics[j].id == ChgPt) {
                ChgLat = map.graphics.graphics[j].geometry.y;
                ChgLng = map.graphics.graphics[j].geometry.x;
            }

            setTimeout(function () {
                oMapQry.setPointPic(OrgLat, OrgLng, ChgFlg);
            }, 300);
            setTimeout(function () {
                oMapQry.setPointPic(ChgLat, ChgLng, OrgFlg);
            }, 300);
        }

        // 地址更動
        chgAdress(elindex, type);
    }

    // 地址更動
    function chgAdress(orgIndex, type) {
        var nextIndex;
        var TempAdrs = '';

        if (type == 'down')
            nextIndex = (Number(orgIndex) + 1).toString();
        else if (type == 'up')
            nextIndex = (Number(orgIndex) - 1).toString();

        TempAdrs = $('#AdressTb tr:eq(' + orgIndex + ') td div:eq(1)').html();
        $('#AdressTb tr:eq(' + orgIndex + ') td div:eq(1)').html($('#AdressTb tr:eq(' + nextIndex + ') td div:eq(1)').html());
        $('#AdressTb tr:eq(' + nextIndex + ') td div:eq(1)').html(TempAdrs);
    }


    // 初始化所有路徑規劃參數與結果
    function initRoute() {
        clearRoutes_variable();
        removeGraphicsLayer('StartPoint');
        removeGraphicsLayer('MidPoint');
        removeGraphicsLayer('EndPoint');

        $('#MapToolResult').html('');
        StartPoint = null;
        EndPoint = null;
        MidPoint = null;
    }

    // 初始化地圖規劃結果
    function clearRoutes_variable() {
        mps = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 102443 }));

        for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
            if (map.graphics.graphics[j].id == 'routesGraphic')
                map.graphics.remove(map.graphics.graphics[j]);
        }

        jsonObj = {};
    }

    // 關閉路徑規劃功能
    function CloseRouteFun() {
        initRoute();
        removeGraphicsLayer('MousePoint');
        $('#divRMenu').css('display', 'none');
        $('#streetview').css('display', 'none');
    }

    // 移除GraphicsLayer
    function removeGraphicsLayer(sName) {
        for (var j = 0 ; j < map.graphics.graphics.length ; j++) {
            if (map.graphics.graphics[j].id == sName)
                map.graphics.remove(map.graphics.graphics[j]);
        }
    }


    // 路徑規劃 end  2015/05/25 修改
    // private method end ////////////////////////////////////////////////////
}
