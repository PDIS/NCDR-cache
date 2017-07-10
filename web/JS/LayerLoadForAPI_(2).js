/**********************************
 * SUMMARY ：圖層載入
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2013/06/07  Vicky Liang Create
 *           2016/07/06  Martin Hsieh : 圖例路徑(legend path) 改絕對 (於 config.js : gLegendPath )
             
 **********************************/

//切換圖層功能
function switchFuncModule(funcid, funcname, exectype, chked, evtSrc) {
    // 2015/12/08 整合影像比對
    $.Deferred(function (deferred) {
        //debugger

        var FuncObj;
        var layer = "";
        var layerHeatmap = "";
        var url = "";
        var otherArry = [];
        var imgsrc;

        //#region 由目標陣列中取出物件    
        switch (evtSrc.replace("_Mod", "")) {
            case "cbFuncRID":
                FuncObj = getArryObj(oRealInfoDemo.LayerData, "ID", funcid);
                otherArry.push({ "array": arrFuncList, "mode": "cbFunc_Mod" });
                break;
            case "cbFunc":
            default:
                FuncObj = getArryObj(arrFuncList, "ID", funcid);
                try {
                    otherArry.push({ "array": oRealInfoDemo.LayerData, "mode": "cbFuncRID_Mod" });
                } catch (ex) { }
                break;
        }
        //#endregion

        try {
            imgsrc = $("#" + evtSrc + funcid).attr("src");
            chked = (imgsrc.indexOf("uncheck.png") < 0) ? false : true;
        } catch (ex) {
            //事件來源非勾選框
            if (FuncObj.Checked == "Y")
                chked = true;
            else
                chked = false;
        }

        //#region 檢查其他模組是否有相同圖層
        if (evtSrc != "" && evtSrc.indexOf("_Mod") < 0) {
            for (var i = 0; i < otherArry.length; i++) {
                var otherObj = getArryObj(otherArry[i]["array"], "ID", funcid);
                if (typeof (otherObj) != "undefined" && otherObj != "") {
                    if (otherObj.Open == "Y" && otherObj.Show == "Y") {
                        switchFuncModule(funcid, funcname, exectype, false, otherArry[i]["mode"]);//把其他模組的相同圖層關掉
                    }
                }
                else { continue; }
            }
        }
        //#endregion

        //功能操作記錄
        if (chked && evtSrc != "")
            setCounterFunc(curExecTool, funcid, "Q", "GIS"); //圖層功能

        //設定勾選狀態
        evtSrc = evtSrc.replace("_Mod", "");
        if (evtSrc == "") { evtSrc = "cbFunc"; }
        if ($("#" + evtSrc + funcid).length > 0) {
            $("#" + evtSrc + funcid).attr("src", function () { return (chked) ? "images/FuncList/check.png" : "images/FuncList/uncheck.png" });
        }

        //開啟圖層
        switch (exectype) {
            case "RTUI": //RTUI即時類
                FuncObj.lyrIdx = 300;
                switch (evtSrc) {
                    case "cbFuncRID":
                        LoadRTUI(FuncObj, chked, oRealInfoDemo.Extent);
                        break;
                    case "cbFunc":
                    default:
                        LoadRTUI(FuncObj, chked);
                        break;
                }
                break;
            case "RTUI_Comm": //公版主題式表單
                FuncObj.lyrIdx = 300;
                LoadRTUICommon(FuncObj, chked);
                break;
            case "NCDR_Point": //動態圖層服務Point
                FuncObj.lyrIdx = 400;
                layer = map.getLayer("layerNcdrPoint" + funcid);
                if (typeof (layer) == "undefined") {
                    url = (isToken == "Y") ? gpNCDRLayersPoint + "?Token=" + gpNCDR_Token : gpNCDRLayersPoint;
                    layer = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: "layerNcdrPoint" + funcid, "opacity": 1 });
                    map.addLayer(layer);
                }

                if (layer.loaded) {
                    LoadDynamicLayers(FuncObj, chked, layer);
                }
                else {
                    dojo.connect(layer, "onLoad", function () { LoadDynamicLayers(FuncObj, chked, layer); });
                }

                break;

            case "NCDR_Line": //動態圖層服務Line
                FuncObj.lyrIdx = 300;
                layer = map.getLayer("layerNcdrLine" + funcid);
                if (typeof (layer) == "undefined") {
                    url = (isToken == "Y") ? gpNCDRLayersLine + "?Token=" + gpNCDR_Token : gpNCDRLayersLine;
                    layer = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: "layerNcdrLine" + funcid, "opacity": 1 });
                    map.addLayer(layer);
                }

                if (layer.loaded) {
                    LoadDynamicLayers(FuncObj, chked, layer);
                }
                else {
                    dojo.connect(layer, "onLoad", function () { LoadDynamicLayers(FuncObj, chked, layer); });
                }

                break;

            case "NCDR_Polygon": //動態圖層服務Polygon
                //var path = "http://localhost:22199/images/Toc/Legend1/coun4.json";
                FuncObj.lyrIdx = 300;
                if (gpMapDBDataJsonUrl == "") {
                    layer = map.getLayer("layerNcdrPolygon" + funcid);
                    if (typeof (layer) == "undefined") {
                        url = (isToken == "Y") ? gpNCDRLayersPolygon + "?Token=" + gpNCDR_Token : gpNCDRLayersPolygon;
                        layer = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: "layerNcdrPolygon" + funcid, "opacity": 1 });
                        map.addLayer(layer);
                    }

                    if (layer.loaded) {
                        LoadDynamicLayers(FuncObj, chked, layer);
                    }
                    else {
                        dojo.connect(layer, "onLoad", function () { LoadDynamicLayers(FuncObj, chked, layer); });
                    }
                } else {
                    layer = map.getLayer("layerNcdrPolygon" + funcid);
                    if (typeof (layer) == "undefined") {
                        layer = new esri.layers.GraphicsLayer({ id: "layerNcdrPolygon" + funcid, "opacity": 1 });
                        map.addLayer(layer);
                    }

                    //取消勾選時,移除該圖層
                    if (!chked) {
                        map.removeLayer(layer); //移除layer
                        break;
                    }

                    var path = gpMapDBDataJsonUrl;
                    path += "m";
                    path += funcid;
                    path += ".json";

                    $.ajax({
                        url: path,
                        type: 'GET',
                        dataType: "json",
                        cache: false,
                        async: false,
                        success: function (data) {
                            FuncObj.lyrIdx = 300;
                            for (var i = 0, j = data.data.length; i < j; i++) {
                                layer.add(new esri.Graphic(data.data[i]));
                            }
                        }
                    });
                }

                break;

            case "NCDR_Polygon2": //動態圖層服務Polygon2，2016/02/04 加入
                FuncObj.lyrIdx = 300;
                if (gpMapDBDataJsonUrl == "") {
                    layer = map.getLayer("layerNcdrPolygon" + funcid);
                    if (typeof (layer) == "undefined") {
                        url = (isToken == "Y") ? gpNCDRLayersPolygon2 + "?Token=" + gpNCDR_Token : gpNCDRLayersPolygon2;
                        layer = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: "layerNcdrPolygon" + funcid, "opacity": 1 });
                        map.addLayer(layer);
                    }

                    if (layer.loaded) {
                        LoadDynamicLayers(FuncObj, chked, layer);
                    }
                    else {
                        dojo.connect(layer, "onLoad", function () { LoadDynamicLayers(FuncObj, chked, layer); });
                    }
                } else {
                    layer = map.getLayer("layerNcdrPolygon" + funcid);
                    if (typeof (layer) == "undefined") {
                        layer = new esri.layers.GraphicsLayer({ id: "layerNcdrPolygon" + funcid, "opacity": 1 });
                        map.addLayer(layer);
                    }

                    //取消勾選時,移除該圖層
                    if (!chked) {
                        map.removeLayer(layer); //移除layer
                        break;
                    }

                    var path = gpMapDBDataJsonUrl;
                    path += "m";
                    path += funcid;
                    path += ".json";

                    $.ajax({
                        url: path,
                        type: 'GET',
                        dataType: "json",
                        cache: false,
                        async: false,
                        success: function (data) {
                            FuncObj.lyrIdx = 300;
                            for (var i = 0, j = data.data.length; i < j; i++) {
                                layer.add(new esri.Graphic(data.data[i]));
                            }
                        }
                    });
                }

                break;

            case "NCDR_Polygon3": //動態圖層服務Polygon3，2016/02/04 加入
                FuncObj.lyrIdx = 300;
                if (gpMapDBDataJsonUrl == "") {
                    layer = map.getLayer("layerNcdrPolygon" + funcid);
                    if (typeof (layer) == "undefined") {
                        url = (isToken == "Y") ? gpNCDRLayersPolygon3 + "?Token=" + gpNCDR_Token : gpNCDRLayersPolygon3;
                        layer = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: "layerNcdrPolygon" + funcid, "opacity": 1 });
                        map.addLayer(layer);
                    }

                    if (layer.loaded) {
                        LoadDynamicLayers(FuncObj, chked, layer);
                    }
                    else {
                        dojo.connect(layer, "onLoad", function () { LoadDynamicLayers(FuncObj, chked, layer); });
                    }
                } else {
                    layer = map.getLayer("layerNcdrPolygon" + funcid);
                    if (typeof (layer) == "undefined") {
                        layer = new esri.layers.GraphicsLayer({ id: "layerNcdrPolygon" + funcid, "opacity": 1 });
                        map.addLayer(layer);
                    }

                    //取消勾選時,移除該圖層
                    if (!chked) {
                        map.removeLayer(layer); //移除layer
                        break;
                    }

                    var path = gpMapDBDataJsonUrl;
                    path += "m";
                    path += funcid;
                    path += ".json";

                    $.ajax({
                        url: path,
                        type: 'GET',
                        dataType: "json",
                        cache: false,
                        async: false,
                        success: function (data) {
                            FuncObj.lyrIdx = 300;
                            for (var i = 0, j = data.data.length; i < j; i++) {
                                layer.add(new esri.Graphic(data.data[i]));
                            }
                        }
                    });
                }

                break;

                //case "PictureSet": //開啟圖片功能視窗(固定路徑)
                //    break;

            case "RealPictureSet": //開啟即時圖片功能視窗(動態路徑)
                LoadRealPicture(FuncObj, chked);
                break;

            case "RealImage": //貼即時圖片於地圖上(動態路徑)
                FuncObj.lyrIdx = 100;
                if (gpImageDBDataJsonUrl == "") {
                    layer = map.getLayer("layerRealImage" + funcid);
                    if (typeof (layer) == "undefined") {
                        //layer = new esri.layers.GraphicsLayer({ id: "layerRealImage" + funcid, "opacity": 1 });
                        layer = new esri.layers.MapImageLayer({ id: "layerRealImage" + funcid });
                        map.addLayer(layer);
                    }

                    LoadRealImage(FuncObj, chked, layer);
                } else {
                    layer = map.getLayer("layerRealImage" + funcid);
                    if (typeof (layer) == "undefined") {
                        layer = new esri.layers.MapImageLayer({ id: "layerRealImage" + funcid });
                        map.addLayer(layer);
                    }

                    //取消勾選時,移除該圖層所有圖點
                    if (!chked) {
                        layer.removeAllImages();
                        map.removeLayer(layer); //移除layer
                        break;
                    }

                    var path = gpImageDBDataJsonUrl;
                    path += "i";
                    path += funcid;
                    path += ".json";

                    $.ajax({
                        url: path,
                        type: 'GET',
                        dataType: "json",
                        cache: false,
                        async: false,
                        success: function (data) {
                            FuncObj.lyrIdx = 100;

                            if (data.data.length > 0) {
                                layer.removeAllImages();
                                //var mi = new esri.layers.MapImage(data.data[data.data.length - 1]);
                                //取出圖片路徑
                                var gpPath = data.data[data.data.length - 1].href;
                                var pictUrl = gpNCDRPICUrl + gpPath;
                                if (FuncObj.Name.substr(0, 3) == "P59" || FuncObj.Name.substr(0, 3) == "P60")
                                    pictUrl = gpPath;

                                var mi = new esri.layers.MapImage({
                                    'extent': { 'xmin': data.data[data.data.length - 1].extent.xmin, 'ymin': data.data[data.data.length - 1].extent.ymin, 'xmax': data.data[data.data.length - 1].extent.xmax, 'ymax': data.data[data.data.length - 1].extent.ymax, 'spatialReference': data.data[data.data.length - 1].extent.spatialReference },
                                    'href': pictUrl
                                });
                                layer.addImage(mi);

                                if ($("#divOpenFunc>#opFunc" + FuncObj.ID).find("span.opDataLastTime").length == 0) { // 2016/01/12 更新圖例區時，時序性圖片的時間還沒回傳回來導致無法加入資料時間，所以用插入的方式
                                    $("#divOpenFunc>#opFunc" + FuncObj.ID).append("<br/><span class='opDataLastTime' style=\"margin-left: 60px; color: #87A1A6;\">資料時間：" + data.data[data.data.length - 1].href.substring(data.data[data.data.length - 1].href.length - 24, data.data[data.data.length - 1].href.length - 9) + "</span>");
                                }
                                else
                                    $("#divOpenFunc>#opFunc" + FuncObj.ID).find("span.opDataLastTime").text("資料時間：" + data.data[data.data.length - 1].href.substring(data.data[data.data.length - 1].href.length - 24, data.data[data.data.length - 1].href.length - 9));

                            } else {
                                UpdQFuncList(FuncObj.ID, false, "", ""); //更新圖例區
                                $("#cbFunc" + FuncObj.ID).attr("src", "images/FuncList/uncheck.png");
                                alert("查無" + FuncObj.CName + "資料");
                            }
                        }
                    });
                }

                break;

            case "DBPoint": //資料庫貼點
                FuncObj.lyrIdx = 600;
                switch (evtSrc) {
                    case "cbFuncRID":
                        layer = map.getLayer("layerRIDDBPoint" + funcid);
                        if (typeof (layer) == "undefined") {
                            layer = new esri.layers.GraphicsLayer({ id: "layerRIDDBPoint" + funcid, "opacity": 1 });
                            map.addLayer(layer);
                        }
                        oRealInfoDemo.LoadRIDLayer(FuncObj, chked, layer);
                        break;
                    case "cbFunc":
                    default:
                        layer = map.getLayer("layerDBPoint" + funcid);
                        if (typeof (layer) == "undefined") {
                            layer = new esri.layers.GraphicsLayer({ id: "layerDBPoint" + funcid, "opacity": 1 });
                            map.addLayer(layer);
                        }
                        LoadDBPoint(FuncObj, chked, layer);
                        break;
                }
                break;

            case "ExcelPoint": //動態點位貼點
                FuncObj.lyrIdx = 300;
                layer = map.getLayer("layerDBPoint" + funcid);
                if (typeof (layer) == "undefined") {
                    layer = new esri.layers.GraphicsLayer({ id: "layerDBPoint" + funcid, "opacity": 1 });
                    map.addLayer(layer);
                }

                LoadDBPoint(FuncObj, chked, layer);
                break;

            case "TiledMap": //TiledMap類地圖服務
                FuncObj.lyrIdx = 200;
                layer = map.getLayer("layerTiledMap" + funcid);

                if (typeof (layer) == "undefined") {
                    url = (isToken == "Y") ? FuncObj.TiledMapUrl + "?Token=" + FuncObj.Token : FuncObj.TiledMapUrl;
                    layer = new esri.layers.ArcGISTiledMapServiceLayer(url, { id: "layerTiledMap" + funcid, "opacity": 1 });
                    map.addLayer(layer);
                }

                LoadTiledMapLayers(FuncObj, chked, layer);
                break;

            case "EstImage": //推估圖片貼點顯示,EX:推估降雨氣候模式,推估降雨動力模式
                FuncObj.lyrIdx = 100;
                layer = map.getLayer("layerEstImage" + funcid);
                if (typeof (layer) == "undefined") {
                    //layer = new esri.layers.GraphicsLayer({ id: "layerEstImage" + funcid, "opacity": 1 });
                    layer = new esri.layers.MapImageLayer({ id: "layerEstImage" + funcid });
                    map.addLayer(layer);
                }

                LoadEstImage(FuncObj, chked, layer);
                break;

            case "WMS": //動態WMS服務
                FuncObj.lyrIdx = 200;
                LoadBWmsLayers(FuncObj, chked);
                break;

            case "KML": //動態KML服務
                FuncObj.lyrIdx = 300;
                layer = map.getLayer("layerKML" + funcid);
                if (typeof (layer) == "undefined") {
                    if (gpKmlDataJsonUrl == "") {
                        showLoading();
                        url = FuncObj.TiledMapUrl;
                        layer = new esri.layers.KMLLayer(url, { id: "layerKML" + funcid, outSR: new esri.SpatialReference(mapSpRef), "opacity": 1 });
                        map.addLayer(layer);
                        console.log('kml');
                        map.infoWindow.on("hide", function () { //監聽infoWindow關閉事件
                            map.graphics.clear();
                        });

                        layer.on("load", function () {
                            hideLoading();
                            //拿掉InfoTemplate，改用InfoWindow，以避免其他圖層的InfoTemplate無法保持開啟 2016/08/24 Kevin
                            require(["dojo/_base/array"], function (array) {
                                //console.log(layer);
                                var layers = layer.getLayers();
                                console.log(layers);
                                array.forEach(layers, function (layerObj) {
                                    console.log('i');
                                    console.log(layerObj);
                                    layerObj.setInfoTemplate(null);
                                    dojo.connect(layerObj, "onClick", function (e) {
                                        // do your on click stuff here  
                                        console.log(e);
                                        map.graphics.clear();
                                        //var infoTemplate = new esri.InfoTemplate();                                    
                                        //infoTemplate.setTitle('title');
                                        //infoTemplate.setContent('tip');
                                        //layerObj.setInfoTemplate(infoTemplate);
                                        var content = '<div class="esriViewPopup" id="esri_dijit__PopupRenderer_0" widgetid="esri_dijit__PopupRenderer_0"><div class="mainSection">';
                                        content = content + '<div class="header" dojoattachpoint="_title">' + e.graphic.attributes.name + '</div>';
                                        content = content + '<div class="hzLine"></div>';
                                        content = content + '<div dojoattachpoint="_description">' + e.graphic.attributes.description + '</div>';
                                        content = content + '</div></div>';
                                        showPointTip(e.screenPoint, "", content, 0, 0);//infowindow改成依照內容大小調整
                                        var highlightSymbol = new esri.symbol.SimpleFillSymbol(
                                          esri.symbol.SimpleFillSymbol.STYLE_NULL,
                                          new esri.symbol.SimpleLineSymbol(
                                            esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                            new dojo.Color([0, 255, 255]), 2
                                          ),
                                          new dojo.Color([125, 125, 125, 0.35])
                                        );
                                        var highlightGraphic = new esri.Graphic(e.graphic.geometry, highlightSymbol);
                                        highlightGraphic.id = "kmlgrp";
                                        //layer.add(highlightGraphic);
                                        map.graphics.add(highlightGraphic);
                                    });
                                });
                            });
                        });
                        layer.on("error", function () {
                            hideLoading();
                            UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                            $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                            alert(funcobj.CName + "資料載入失敗");
                        });
                    } else {

                        var path = gpKmlDataJsonUrl;
                        path += "k";
                        path += funcid;
                        path += ".json";

                        showLoading();
                        $.ajax({
                            url: path,
                            type: 'GET',
                            dataType: "json",
                            cache: false,
                            async: false,
                            success: function (data) {
                                layer = new esri.layers.KMLLayer(gpKmlDataJsonUrl + data.data[0].url, { id: data.data[0].options.id, outSR: new esri.SpatialReference(data.data[0].options.outSR), "opacity": data.data[0].options.opacity });
                                map.addLayer(layer);
                                console.log('kml');
                                map.infoWindow.on("hide", function () { //監聽infoWindow關閉事件
                                    map.graphics.clear();
                                });

                                layer.on("load", function () {
                                    hideLoading();
                                    //拿掉InfoTemplate，改用InfoWindow，以避免其他圖層的InfoTemplate無法保持開啟 2016/08/24 Kevin
                                    require(["dojo/_base/array"], function (array) {
                                        //console.log(layer);
                                        var layers = layer.getLayers();
                                        console.log(layers);
                                        array.forEach(layers, function (layerObj) {
                                            console.log('i');
                                            console.log(layerObj);
                                            if (layerObj.setInfoTemplate) {
                                                layerObj.setInfoTemplate(null);
                                                dojo.connect(layerObj, "onClick", function (e) {
                                                    // do your on click stuff here  
                                                    console.log(e);
                                                    map.graphics.clear();
                                                    //var infoTemplate = new esri.InfoTemplate();                                    
                                                    //infoTemplate.setTitle('title');
                                                    //infoTemplate.setContent('tip');
                                                    //layerObj.setInfoTemplate(infoTemplate);
                                                    var content = '<div class="esriViewPopup" id="esri_dijit__PopupRenderer_0" widgetid="esri_dijit__PopupRenderer_0"><div class="mainSection">';
                                                    content = content + '<div class="header" dojoattachpoint="_title">' + e.graphic.attributes.name + '</div>';
                                                    content = content + '<div class="hzLine"></div>';
                                                    content = content + '<div dojoattachpoint="_description">' + e.graphic.attributes.description + '</div>';
                                                    content = content + '</div></div>';
                                                    showPointTip(e.screenPoint, "", content, 0, 0);
                                                    var highlightSymbol = new esri.symbol.SimpleFillSymbol(
                                                      esri.symbol.SimpleFillSymbol.STYLE_NULL,
                                                      new esri.symbol.SimpleLineSymbol(
                                                        esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                                        new dojo.Color([0, 255, 255]), 2
                                                      ),
                                                      new dojo.Color([125, 125, 125, 0.35])
                                                    );
                                                    var highlightGraphic = new esri.Graphic(e.graphic.geometry, highlightSymbol);
                                                    highlightGraphic.id = "kmlgrp";
                                                    //layer.add(highlightGraphic);
                                                    map.graphics.add(highlightGraphic);
                                                });
                                            }
                                        });
                                    });
                                });

                                layer.on("error", function () {
                                    hideLoading();
                                    //UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                                    //$("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                                    alert(funcid + "-Kml資料接收異常，修復中");
                                });
                            }
                        });
                    }
                }
                LoadKMLLayers(FuncObj, chked, layer);
                break;

            case "FeatureLayer": //動態FeatureService
                FuncObj.lyrIdx = 200;
                layer = map.getLayer("layerFeature" + funcid);

                if (typeof (layer) == "undefined") {
                    url = (isToken == "Y") ? FuncObj.TiledMapUrl + "?Token=" + FuncObj.Token : FuncObj.TiledMapUrl;
                    layer = new esri.layers.FeatureLayer(url, { id: "layerFeature" + funcid, "opacity": 1 });
                    map.addLayer(layer);
                }

                if (layer.loaded) {
                    LoadFeatureLayer(FuncObj, chked, layer);
                }
                else {
                    dojo.connect(layer, "onLoad", function () { LoadFeatureLayer(FuncObj, chked, layer); });
                }

                break;
            case "FS_Point"://特徵服務(點) 2016/08/30 Kevin
                //debugger;
                FuncObj.lyrIdx = 200;
                layer = map.getLayer("layerFeature" + funcid);
                layerHeatmap = map.getLayer("layerHeatmapFeature" + funcid);

                LoadPointFeatureLayer(FuncObj, funcid, chked, layer, layerHeatmap);
                layer = featureLayer;


                break;
            case "FS_Line"://特徵服務(線) 2016/08/30 Kevin
                //debugger;
                FuncObj.lyrIdx = 200;
                layer = map.getLayer("layerFeature" + funcid);
                layerHeatmap = map.getLayer("layerHeatmapFeature" + funcid);

                LoadLineFeatureLayer(FuncObj, funcid, chked, layer, layerHeatmap);
                layer = featureLayer;


                break;
            case "FS_ Polygon"://特徵服務(面) 2016/08/30 Kevin
                //debugger;
                FuncObj.lyrIdx = 200;
                layer = map.getLayer("layerFeature" + funcid);
                layerHeatmap = map.getLayer("layerHeatmapFeature" + funcid);

                LoadPolygonFeatureLayer(FuncObj, funcid, chked, layer, layerHeatmap);
                layer = featureLayer;


                break;
                // 20160704 Martin: WMTS Layer by arcgis api WebTiledLayer
            case "WMTS":

                // debugger;

                FuncObj.lyrIdx = 300;
                var idPrefix = "layerWebTiled";

                layer = map.getLayer(idPrefix + funcid);

                if (typeof (layer) == "undefined") {

                    showLoading();
                    url = FuncObj.TiledMapUrl;

                    layer = new esri.layers.WebTiledLayer(url,
                                           {
                                               id: idPrefix + funcid,
                                               // outSR: new esri.SpatialReference(3857),
                                               "opacity": 1
                                           });
                    map.addLayer(layer);

                    layer.on("load", function () { hideLoading(); });
                    layer.on("error", function () {
                        hideLoading();
                        UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                        $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                        alert(funcobj.CName + "資料載入失敗");
                    });

                } else {
                    LoadWMTSLayers(FuncObj, chked, layer);
                }



                break;
        }
        // switch case

        //設定圖層開啟狀態(客製化圖層另外處理)
        FuncObj.Checked = (chked) ? "Y" : "N";
        if (exectype != "RTUI" && exectype != "RTUI_Comm" && exectype != "RealPictureSet" && exectype != "WMS") {
            console.log('opclos');
            console.log(layer);
            FuncObj.Open = (chked) ? "Y" : "N";
            FuncObj.Show = (chked) ? "Y" : "N";
            FuncObj.EyeSee = (chked) ? "Y" : "N"; //圖例眼睛開合預設值
            FuncObj.layerid = (chked) ? layer.id : "";

            //更新圖例區
            switch (evtSrc) {
                case "cbFuncRID":
                    UpdQFuncList(funcid, chked, layer.id, "", evtSrc); //使用即時情資展示模組，多傳一參數作為判斷用
                    break;
                case "cbFunc":
                default:
                    UpdQFuncList(funcid, chked, layer.id, "");
                    break;
            }
        }

        //關閉圖層時,隱藏infoWindow
        if (!chked) {
            if (exectype == "RTUI" || exectype == "DBPoint" || exectype == "ExcelPoint")
                map.infoWindow.hide();
        }

        reorderLayer(); //重新排序已開圖層
        SetQFuncVisibleByAll(); //重新設定圖例區顯示狀態

        // 2015/12/08 整合影像比對
        deferred.resolve();
    });
}

//載入圖層:資料庫圖點
function LoadDBPoint(funcobj, chked, layer) {
    $.getScript("https://watch.ncdr.nat.gov.tw/mmodel.js");//改成載入圖層時才讀取(之前是進入網站時就讀取) Kevin 2016/08/24 改成https開頭 2016/10/27
    //取消勾選時,移除該圖層所有圖點
    if (!chked) {
        RemoveGraphicFromLayer(layer, funcobj.ID, "pt", "_");
        map.removeLayer(layer); //移除layer

        // 2015/12/29 修改 Start
        if (typeof (map.getLayer("layerDBPointCCTVLine")) != "undefined") {

            if (map.getLayer('layerDBPointCCTVLine').graphics.length == 0)
                map.removeLayer(map.getLayer("layerDBPointCCTVLine"));
            else {
                for (var i = map.getLayer('layerDBPointCCTVLine').graphics.length - 1; i >= 0; i--) {
                    if (map.getLayer('layerDBPointCCTVLine').graphics[i].pid == funcobj.ID) {
                        map.getLayer('layerDBPointCCTVLine').remove(map.getLayer('layerDBPointCCTVLine').graphics[i]);
                    }
                }
            }

            _oRT_CCTV.arrSrcData = [];
            $(".viewRT_History.ui-draggable[id^='RT_CCTV'][pid='" + funcobj.ID + "']").remove();
        }
        // 2015/12/29 修改 End

        return;
    }

    if (gpDBDataJsonUrl == "") {
        //取出當前地圖範圍
        var mapExtent = getMapExtent();
        var Lx = mapExtent.xmin;
        var Rx = mapExtent.xmax;
        var By = mapExtent.ymin;
        var Ty = mapExtent.ymax;

        var curtime = curDateTime;
        var url = "GetData/funcWidget/getDBPointData.ashx?id=" + funcobj.ID + "&exec=" + funcobj.Name + "&exec=" + funcobj.Exec + "&Lx=" + Lx + "&Ty=" + Ty + "&Rx=" + Rx + "&By=" + By + "&curtimeS=" + curtime;

        $.ajax({
            url: url,
            type: 'get',                 // post/get
            dataType: "json",              // xml/json/script/html
            cache: false,                 // 是否允許快取
            beforeSend: function () {
                showLoading();
            },
            success: function (data) {
                LoadDBPointData(funcobj, layer, data);
            },
            error: function () {
                UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                alert(funcobj.CName + "資料載入失敗");
            },
            complete: function () {
                hideLoading();
            }
        });
    } else {
        var path = gpDBDataJsonUrl;
        path += "d";
        path += funcobj.ID;
        path += ".json";

        $.ajax({
            url: path,
            type: 'GET',
            dataType: "json",
            cache: false,
            async: false,
            success: function (data) {
                LoadDBPointData(funcobj, layer, data);
            },
            error: function () {
                UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                alert(funcobj.CName + "資料載入失敗");
            },
            complete: function () {
                hideLoading();
            }
        });
    }
}

function LoadDBPointData(funcobj, layer, data) {
    RemoveGraphicFromLayer(layer, funcobj.ID, "pt", "_");

    var GISLink = []; //+// charlie
    GISLink = funcobj.Iden.split("|");

    var oUrlID = "";
    var oUrlType = ""; //Su-01 增加變數
    var oUrlTypeIdx;   //Su-01 增加變數
    var opType;   //Su-150522 增加變數

    if (GISLink.length > 1) {
        for (var i = 0; i < GISLink.length; i++) {
            if (GISLink[i].split(":")[1] == "url連結") {
                oUrlID = GISLink[i].split(":")[0];
            }

            //Su-01 增加變數內容
            if (GISLink[i].split(":")[1] == "cctv") {
                oUrlType = "cctv";
            }
            if (GISLink[i].split(":")[1] == "watch") {
                oUrlType = "watch";
                oUrlTypeIdx = i;
            }
            if (GISLink[i].split(":")[1] == "image") {
                oUrlType = "image";
                oUrlTypeIdx = i;
            }
            //Su-01 結束
            //Su-150522 增加變數
            if (GISLink[i].split(":")[1] == "ptype") {
                opType = GISLink[i].split(":")[0];
            }
            //Su-150522 增加變數結束

        }
    }

    //貼點
    if (gpDBDataJsonUrl == "") {
        for (var i = 0; i < data.DataList[0].Items.length; i++) {
            var o = data.DataList[0].Items[i];
            var imgPath = gLegendPath1 + o.Pic;
            var gcID = "pt" + funcobj.ID + "_" + o.ID;

            AddPointToLayer(o.PX, o.PY, o, imgPath, 16, 16, gcID, layer); //Su-01 改成點資訊都帶入   
            /*
            if (oUrlID != "") {  //+// charlie
                AddPointToLayer(o.PX, o.PY, o[oUrlID], imgPath, 16, 16, gcID, layer);  //attr只存URL
            } else {
                AddPointToLayer(o.PX, o.PY, o, imgPath, 16, 16, gcID, layer);
            }*/
        }
    } else {
        for (var i = 0; i < data.DataList[0].Items.length; i++) {
            var o = data.DataList[0].Items[i];
            var imgPath = gLegendPath1 + o.PictureMarkerSymbol.url;
            var gcID = "pt" + funcobj.ID + "_" + o.attributes.ID;

            AddPointToLayer(o.geometry.x, o.geometry.y, o.attributes, imgPath, 16, 16, gcID, layer); //Su-01 改成點資訊都帶入   
        }
    }

    //圖形點擊事件
    if (oUrlID != "") {  //+// charlie
        dojo.connect(map.getLayer(layer.id), "onClick", function (evt) {

            //Su-01 因應都帶入修改顯示內容  
            var arrIden = funcobj.Iden.split("|");
            var content = "";
            var h = 0;
            if (oUrlType == "cctv") {
                // 2015/12/15 整合水文情資模板
                //content += '<a href="#" onClick="MyWindow=window.open(\'' + evt.graphic.attributes[oUrlID] + '\', \'popUpWindow1\', \'height=330,width=400,left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no\');">加入監看</br>';
                //content += '<iframe id="cctvf"  runat=""server"" src =" ' + evt.graphic.attributes[oUrlID] + '&info=1" height = "330" width = "400" frameborder=""0""  scrolling =""no"" align=""middle"" /></a>';
                //showPointTip(evt.screenPoint, evt.graphic.attributes["Title"], content, 420, 500);

                //Su-CCTV 關掉infowindow時結束CCTV
                //map.infoWindow.on("hide", function (evt) {
                //    $("#cctvf").remove();
                //});
                //Su-CCTV 關掉infowindow時結束CCTV

                $('head').append($('<script src="JS/RT_CCTV/RT_CCTV.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));
                if (_oRT_CCTV == null) {
                    _oRT_CCTV = new oRT_CCTV();
                    _oRT_CCTV.init(layer);
                }

                if (typeof (_oRT_CCTV.Layer) == 'undefined' && (typeof ($('#bgctrltmp').css('display')) == 'undefined' || $('#bgctrltmp').css('display') == 'none')) {
                    _oRT_CCTV.init(layer);
                }

                var set = {
                    title: evt.graphic.attributes["Title"],
                    stid: evt.graphic.attributes["ID"],
                    pid: evt.graphic.id.split('_')[0].replace('pt', ''),
                    src: evt.graphic.attributes[oUrlID],
                    px: evt.graphic.attributes["PX"],
                    py: evt.graphic.attributes["PY"]
                };
                _oRT_CCTV.show(set);
                // 2015/12/15 整合水文情資模板

            } else if (oUrlType == "watch") {
                // 2015/12/15 整合水文情資模板
                $('head').append($('<script src="JS/RT_WATCH/RT_WATCH.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));
                if (_oRT_WATCH == null) {
                    _oRT_WATCH = new oRT_WATCH();
                    _oRT_WATCH.init(layer);
                }
                var watchurl = '';
                for (var i = 0; i < arrIden.length; i++) {
                    if (arrIden[i].split(":")[1] == 'watchurl') {
                        watchurl = evt.graphic.attributes[arrIden[i].split(":")[0]] + '?a=' + evt.graphic.attributes[arrIden[oUrlTypeIdx].split(":")[0]];
                        watchurl += '&d=' + mmodeldate + '&t=' + mmodeltime + '&p=pmx';
                    }
                }
                var set = {
                    title: evt.graphic.attributes["Title"],
                    stid: evt.graphic.attributes["ID"],
                    pid: evt.graphic.id.split('_')[0].replace('pt', ''),
                    url: watchurl,
                    src: evt.graphic.attributes[oUrlID],
                    px: evt.graphic.attributes["PX"],
                    py: evt.graphic.attributes["PY"]
                };
                _oRT_WATCH.show(set);

                //var imgLoad = function (url, callback) {
                //    var img = new Image();
                //    img.src = url;
                //    if (img.complete) {
                //        callback(img.width, img.height);
                //    } else {
                //        img.onload = function () {
                //            if (img.width > 600) {
                //                var x = 600;
                //                var y = img.height * 600 / img.width;
                //                if (y > 600) {
                //                    y = 600;
                //                    x = img.width * 600 / img.height;
                //                }
                //            }
                //            callback(x, y);
                //            img.onload = null;
                //        };
                //    };
                //};

                //Su-150522 修正增加opType
                //for (var i = 0; i < arrIden.length; i++) {
                //    if (arrIden[i].split(":")[1] == 'watchurl') {
                //        var watchurl = evt.graphic.attributes[arrIden[i].split(":")[0]] + '?a=' + evt.graphic.attributes[arrIden[oUrlTypeIdx].split(":")[0]];
                //        watchurl += '&d=' + mmodeldate + '&t=' + mmodeltime + '&p=' + evt.graphic.attributes[opType];
                //    }
                //}
                //Su-150522 修正增加opType	

                //imgLoad(watchurl, function (x, y) {
                //    content += '<a href="#" onClick="MyWindow=window.open(\'' + evt.graphic.attributes[oUrlID] + '\', \'popUpWindow2\', \'height=330,width=400,left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no\');">另開視窗</br>';
                //    content += '<img src="' + watchurl + '" height="' + y + '" width="' + x + '"/></a>';
                //    showPointTip(evt.screenPoint, evt.graphic.attributes["Title"], content, x + 20, y + 20);
                //});
                // 2015/12/15 整合水文情資模板

            } else if (oUrlType == "image") {
                var imgLoad = function (url, callback) {
                    var img = new Image();
                    img.src = url;
                    if (img.complete) {
                        callback(img.width, img.height);
                    } else {
                        img.onload = function () {
                            if (img.width > 600) {
                                var x = 600;
                                var y = img.height * 600 / img.width;
                                if (y > 600) {
                                    y = 600;
                                    x = img.width * 600 / img.height;
                                }
                            }
                            callback(x, y);
                            img.onload = null;
                        };
                    };
                };

                for (var i = 0; i < arrIden.length; i++) {
                    if (arrIden[i].split(":")[1] == 'url連結') {
                        var watchurl = evt.graphic.attributes[arrIden[i].split(":")[0]]
                        //	 + '?a=' + evt.graphic.attributes[arrIden[oUrlTypeIdx].split(":")[0]];
                        //	 watchurl += '&d=' +  mmodeldate + '&t=' + mmodeltime + '&p=pmx' ;
                    }
                }

                imgLoad(watchurl, function (x, y) {
                    content += '<a href="#" onClick="MyWindow=window.open(\'' + evt.graphic.attributes[oUrlID] + '\', \'popUpWindow2\', \'height=330,width=400,left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no\');">另開視窗</br>';
                    content += '<img src="' + watchurl + '" height="' + y + '" width="' + x + '"/></a>';
                    showPointTip(evt.screenPoint, evt.graphic.attributes["Title"], content, x + 20, y + 20);
                });
            } else {
                window.open(evt.graphic.attributes[oUrlID], 'popUpWindow', 'height=330,width=400,left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');
            }
            //Su-01 修改結束
            //window.open(evt.graphic.attributes, 'popUpWindow', 'height=330,width=400,left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');
        });
    } else {
        dojo.connect(map.getLayer(layer.id), "onClick", function (evt) {
            var arrIden = funcobj.Iden.split("|");
            var content = "";
            var h = 0;

            //Su-01 增加infowindow 寬度自動調整 (最大還是280)					
            var w = 0;
            var w1 = 0;
            var strLength;
            //Su-01 結束	

            for (var i = 0; i < arrIden.length; i++) {
                var fileName = arrIden[i].split(":")[1];
                var fileValue = evt.graphic.attributes[arrIden[i].split(":")[0]];
                if (fileValue != "") {

                    //Su-01 增加infowindow 寬度自動調整 (最大還是280)	
                    strLength = fileName + ":" + fileValue;
                    //Su-01 增加infowindow 高度自動調整 
                    var RowLength = parseInt(strLength.length / 25) + 1;
                    h = h + 30 * RowLength;

                    content += fileName + ":" + fileValue + "</br>";

                    w1 = strLength.length * 14;
                    w = (w1 > w) ? w1 : w;
                    //Su-01 結束
                }
            }

            // 2015/10/19：優化示警燈號 Start
            var LyerCName = getArryObj(arrFuncList, "ID", layer.id.replace('layerDBPoint', '')).CName;
            if (LyerCName == '警戒指標_縣市' || LyerCName == '警戒指標_鄉鎮') {
                var warnData = data.DataList[0].warnItems;
                var WarnCont = '';
                var sID = '';

                if (LyerCName == '警戒指標_縣市')
                    sID = evt.graphic.attributes["COUN_ID"];
                else if (LyerCName == '警戒指標_鄉鎮')
                    sID = evt.graphic.attributes["TOWN_ID"];

                for (var j = 0; j < warnData.length; j++) {
                    if (warnData[j].ID.trim() == sID.trim() && warnData[j].description.trim() != '目前無警示') {
                        WarnCont += "<div style='font-family:微軟正黑體;'>";
                        WarnCont += "<span style='color:" + warnData[j].Color.trim() + ";font-size:13pt;font-weight:bold;'>" + warnData[j].headline.trim() + "</span></br>" + warnData[j].description.trim();
                        WarnCont += "</div></br>";
                    }
                }

                if (WarnCont == '') WarnCont = '目前無警示';
                content = WarnCont;
            }
            // 2015/10/19：優化示警燈號 End

            //Su-01 增加infowindow 寬度自動調整 (最大還是280)
            strLength = evt.graphic.attributes["Title"];
            w1 = strLength.length * 14;
            w = (w1 > w) ? w1 : w;
            w = (w > 280) ? 280 : w;
            //Su-01 增加infowindow 高度自動調整(最大還是280)
            h = (h > 280) ? 280 : h;
            showPointTip(evt.screenPoint, evt.graphic.attributes["Title"], content, w, h);
            //Su-01 結束
            //showPointTip(evt.screenPoint, evt.graphic.attributes["Title"], content, 280, h);
        });
    }
}

//載入圖層:開啟動態圖層
function LoadDynamicLayers(funcobj, chked, layer) {
    var arrDynVisibleLayer = [];
    var layerInfos = [];
    var info;

    layerInfos = layer.layerInfos;
    for (var i in layerInfos) {
        info = layerInfos[i];

        if (info.name == funcobj.Name) {
            if (info.subLayerIds != null) { //處理子圖層                
                for (var j in info.subLayerIds) {
                    var sublayer = info.subLayerIds[j];
                    if (chked) { //已勾選,且陣列查無資料時,加入陣列
                        arrDynVisibleLayer.push(sublayer.id)
                    } else if (!chked && layer.visibleLayers.indexOf(sublayer.id) >= 0) { //取消勾選,且陣列查有資料時,自陣列移除
                        removeArryElm(arrDynVisibleLayer, sublayer.id);
                    }
                }
            } else {
                if (chked) { //已勾選,且陣列查無資料時,加入陣列
                    arrDynVisibleLayer.push(info.id)
                } else if (!chked && layer.visibleLayers.indexOf(info.id) >= 0) { //取消勾選,且陣列查有資料時,自陣列移除
                    removeArryElm(arrDynVisibleLayer, info.id);
                }
            }
            break;
        }
    }

    if (arrDynVisibleLayer.length != 0) {
        layer.setVisibleLayers(arrDynVisibleLayer);
    }
    else {
        map.removeLayer(layer); //移除layer
    }
}

//載入圖層:TiledMap類地圖服務
function LoadTiledMapLayers(funcobj, chked, layer) {

    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }

    //設定顯示
    layer.setVisibility(chked);
}

//載入圖層:RealImage:指定圖片路徑(即時)
function LoadRealImage(funcobj, chked, layer) {
    //取消勾選時,移除該圖層所有圖點
    if (!chked) {
        layer.removeAllImages();
        map.removeLayer(layer); //移除layer
        return;
    }

    var curtime = curDateTime;
    //curtime = "2012/06/04 14:00"; //for test
    //var url = "GetData/funcWidget/getRealImageData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Name + "&exec=" + funcobj.Exec + "&curtimeS=" + curtime; // 2015/12/23 修改
    var url = "GetData/funcWidget/getRealImageData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Class + "&exec=" + funcobj.Exec + "&curtimeS=" + curtime; // 2015/12/23 修改
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",              // xml/json/script/html
        cache: false,                 // 是否允許快取
        beforeSend: function () {
            showLoading();
        },
        success: function (data) {
            var o = data.DataList[0].Items[0];
            if (typeof (o) != "undefined") {
                layer.removeAllImages();
                AddMapImageToLayer(o, funcobj.ID, funcobj.Name, layer);

                if ($("#divOpenFunc>#opFunc" + funcobj.ID).find("span.opDataLastTime").length == 0) { // 2016/01/12 更新圖例區時，時序性圖片的時間還沒回傳回來導致無法加入資料時間，所以用插入的方式
                    $("#divOpenFunc>#opFunc" + funcobj.ID).append("<br/><span class='opDataLastTime' style=\"margin-left: 60px; color: #87A1A6;\">資料時間：" + o.Time + "</span>");
                }
                else
                    $("#divOpenFunc>#opFunc" + funcobj.ID).find("span.opDataLastTime").text("資料時間：" + o.Time);

            } else {
                UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                alert("查無" + funcobj.CName + "資料");
            }
        },
        error: function () {
            UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
            $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
            alert(funcobj.CName + "資料載入失敗");
        },
        complete: function () {
            hideLoading();
        }
    });
}

//載入圖層:EstImage :指定圖片路徑(推估),EX:推估降雨氣候模式,推估降雨動力模式
function LoadEstImage(funcobj, chked, layer) {
    //取消勾選時,移除該圖層所有圖點
    if (!chked) {
        layer.removeAllImages();
        map.removeLayer(layer); //移除layer
        return;
    }

    var curtime = curDateTime;
    //var url = "GetData/funcWidget/getRealImageData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Name.split("-")[0] + "&exec=" + funcobj.Exec + "&curtimeS=" + curtime + "&est=" + funcobj.Name.split("-")[1]; // 2015/12/23 修改
    var url = "GetData/funcWidget/getRealImageData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Class.split("-")[0] + "&exec=" + funcobj.Exec + "&curtimeS=" + curtime + "&est=" + funcobj.Name.split("-")[1]; // 2015/12/23 修改
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",              // xml/json/script/html
        cache: false,                 // 是否允許快取
        beforeSend: function () {
            showLoading();
        },
        success: function (data) {
            var o = data.DataList[0].Items[0];
            if (typeof (o) != "undefined") {
                layer.removeAllImages();
                //AddGraphicToLayer(o, funcobj.ID, funcobj.Name, layer); //貼圖
                AddMapImageToLayer(o, funcobj.ID, funcobj.Name, layer);
                $("#divOpenFunc>#opFunc" + funcobj.ID).find("span.opDataLastTime").text("資料時間：" + o.Time);
            } else {
                UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                alert(data.DataList[0].Label);
            }
        },
        error: function () {
            UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
            $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
            alert(funcobj.CName + "資料載入失敗");
        },
        complete: function () {
            hideLoading();
        }
    });
}

//載入圖層:RealPictureSet:開啟圖片視窗
function LoadRealPicture(funcobj, chked) {
    //取消勾選時,移除DIV
    if (!chked) {
        removeDiv(funcobj.ID, "divPict" + funcobj.ID, '');
        return;
    }
    var curtime = curDateTime;
    //var url = "GetData/funcWidget/getRealImageData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Name + "&exec=" + funcobj.Exec + "&curtimeS=" + curtime; // 2015/12/23 修改
    var url = "GetData/funcWidget/getRealImageData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Class + "&exec=" + funcobj.Exec + "&curtimeS=" + curtime; // 2015/12/23 修改

    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            var o = data.DataList[0].Items[0];
            if (typeof (o) != "undefined") {
                AddPictDiv(o, o, funcobj.ID, funcobj.Name); //開啟表單圖片DIV
            } else {
                UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
                $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
                alert('查無資料');
            }
        },
        error: function () {
            UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
            $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
            alert(funcobj.CName + "資料載入失敗");
        }
    });
}
// LoadLayer:WMTS (ref.: KML)
function LoadWMTSLayers(funcobj, chked, layer) {
    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }
    //設定顯示
    layer.setVisibility(chked);
}
//載入圖層:WMS服務
function LoadBWmsLayers(funcobj, chked) {

    //設定圖層狀態
    funcobj.Open = (chked) ? "Y" : "N";
    funcobj.Show = (chked) ? "Y" : "N";
    funcobj.EyeSee = (chked) ? "Y" : "N"; //圖例眼睛開合預設值
    funcobj.layerid = (chked) ? "layerBWMS" + funcobj.ID : "";
    UpdQFuncList(funcobj.ID, chked, "layerBWMS" + funcobj.ID, ""); //更新圖例區

    var layer = map.getLayer("layerBWMS" + funcobj.ID);
    if (!chked) {
        if (typeof (layer) != "undefined") {
            map.removeLayer(layer); //移除layer
            return;
        }
    }

    var sUrl = funcobj.TiledMapUrl;
    var wmsUrl = "";
    var sParam = "";
    var wmsParam = [];
    if (sUrl.indexOf("?") >= 0) {
        wmsUrl = sUrl.split("?")[0];  //服務網址
        sParam = sUrl.split("?")[1];  //服務參數
        wmsParam = sParam.split("&"); //服務參數陣列

        //設定物件
        var o = new Object();
        for (var i = 0; i < wmsParam.length; i++) o[wmsParam[i].split("=")[0].toLowerCase()] = wmsParam[i].split("=")[1];

        //載入圖層
        dojo.declare("WMSLayer", esri.layers.DynamicMapServiceLayer, {
            constructor: function () {
                this.loaded = true;
                this.onLoad(this);
            },
            getImageUrl: function (extent, width, height, callback) {
                var newEPSG = resetWmsEPSG(extent, o.srs);
                var params = {
                    REQUEST: "GetMap",
                    TRANSPARENT: true,
                    FORMAT: o.format,
                    VERSION: o.version,
                    LAYERS: o.layers,
                    styles: "",
                    //changing values
                    BBOX: newEPSG.xmin + "," + newEPSG.ymin + "," + newEPSG.xmax + "," + newEPSG.ymax,
                    SRS: newEPSG.wmsSRS,
                    WIDTH: width,
                    HEIGHT: height
                };

                callback(wmsUrl + "?" + dojo.objectToQuery(params));


            }
        })

        map.addLayer(new WMSLayer({ id: "layerBWMS" + funcobj.ID }));
    }
}

//載入圖層:KML類地圖服務
function LoadKMLLayers(funcobj, chked, layer) {
    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }
    //設定顯示
    if (layer)
        layer.setVisibility(chked);
}

//載入圖層:RTUI客製化表單
function LoadRTUI(funcobj, chked, opt) {
    funcobj.Open = (chked) ? "Y" : "N";
    funcobj.Show = (chked) ? "Y" : "N";
    funcobj.EyeSee = (chked) ? "Y" : "N"; //圖例眼睛開合預設值

    switch (funcobj.Name) {
        case "Tide": //即時潮位
            LoadRtTide(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name)
            break;
        case "TideLevel": //潮位 add 2015/03/20
            LoadRtTideLevel(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name)
            break;
        case "Rain": //即時雨量
            LoadRtRain(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name)
            break;
        case "TyRoute_CWB": //CWB颱風路徑
            LoadRtTyRouteCWB(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name)
            break;
        case "WraRiver": //河川水位
            LoadRtWraRiver(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name)
            break;
        case "WraReservoir": //水庫水位
            LoadRtWraReservoir(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name, opt)
            break;
        case "TyRoute_EachCountry": //各國颱風預測路徑
            LoadRtTyRouteEachCountry(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
            break;
        case "Raad_Broken"://交通損壞狀況
            LoadRtRoadBroken(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
            break;
        case "NccComm"://通訊損毀狀況
            LoadNccComm(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
            break;
        case "PowerOutage"://電力中斷
            LoadPowerOutage(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
            break;
        case "EqDataSource"://震央  //*// charlie
            LoadEqDataSource(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
            break;
        case "震度範圍"://震度範圍@RealInfoDemo  Ray
            LoadPGA(funcobj.ID, funcobj.Name, chked, 'layerEQPGA');
            break;
        case "關鍵設施_高鐵"://高鐵@RealInfoDemo  Ray
            LoadHSR(funcobj.ID, funcobj.Name, chked, 'layerHSR');
            break;
        case "全台人口密度"://全台人口密度@RealInfoDemo  Ray
            LoadPopDensity(funcobj.ID, funcobj.Name, chked, 'layerPopDensity');
            break;
        case "山崩風險"://山崩風險@RealInfoDemo  Vicky add at 2014.11.25
            LoadLSRisk(funcobj.ID, funcobj.Name, chked, 'layerLSRisk');
            break;
        case "山崩潛勢"://山崩潛勢@RealInfoDemo  Engels 2015/09/21 增加山崩潛勢圖層(KMZ)
            LoadLandslide(funcobj.ID, funcobj.Name, chked, 'layerLandslide');
            break;
        case "地震剖面線段"://地震剖面線段@RealInfoDemo  Engels 2015/12/10 增加地震剖面線段(KMZ)
            LoadSection(funcobj.ID, funcobj.Name, funcobj.TiledMapUrl, chked, 'layerSection');
            break;
        case "SEDLEvaTheme":
            // LoadRtWraRiver(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
            LoadRtSEDLEvaTheme(funcobj.ID, funcobj.name, chked, 'layer' + funcobj.Name);
            break;
        case "SEDLEvaThemeAlert":
            LoadRtSEDLEvaThemeAlert(funcobj.ID, funcobj.name, chked, 'layer' + funcobj.Name);
            break;

        default:
            //未開發之客製化圖層
            UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
            break;
    }
}

//載入圖層:公版主題式表單
function LoadRTUICommon(funcobj, chked, opt) {
    //公版主題式表單
    LoadRtCommon(funcobj.ID, funcobj.Name, chked, 'layer' + funcobj.Name);
}

//載入圖層:FeatureLayer服務
function LoadFeatureLayer(funcobj, chked, layer) {

    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }

    //設定顯示
    layer.setVisibility(chked);
}

function LoadPointFeatureLayer(funcobj, funcid, chked, layer, layerHeatmap) {
    oMapQry = new MapQry();

    oMapQry.initMapQry();

    $('#streetview').css({ top: '100px', left: '50px' });
    if (typeof (layer) == "undefined") {
        var featureOption;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Polygon_2/MapServer/34' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Building/MapServer/0' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Line/MapServer/2' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Point/MapServer/2' + '?Token=' + gpNCDR_Token;
        url = funcobj.TiledMapUrl + '?Token=' + gpNCDR_Token;
        console.log(url);
        //url = (isToken == "Y") ? FuncObj.TiledMapUrl + "?Token=" + FuncObj.Token : FuncObj.TiledMapUrl;
        var showHeatMap = true;


        if (showHeatMap) {
            featureOption = {
                id: "layerHeatmapFeature" + funcid,
                "opacity": 1,
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
                //infoTemplate: template,
                outFields: ["*"]
            };

            layerHeatmap = new esri.layers.FeatureLayer(url, featureOption);

            setRendererAndCondition(layerHeatmap, "FS_Point", funcobj, showHeatMap);
            layerHeatmap.setVisibility(false);

            heatmapLayer = layerHeatmap;
            map.addLayer(layerHeatmap);
        }

        featureOption = {
            id: "layerFeature" + funcid,
            "opacity": 1,
            mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
            // infoTemplate: template,
            outFields: ["*"]
        };


        layer = new esri.layers.FeatureLayer(url, featureOption);
        bindFeatureServiceClickEvent(layer, funcobj);
        layer.on('load', function (evt) {
            setRendererAndCondition(layer, "FS_Point", funcobj, false);
        });
        featureLayer = layer;
        map.addLayer(layer);

    }

    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }

    //設定顯示
    layer.setVisibility(chked);
}
function LoadLineFeatureLayer(funcobj, funcid, chked, layer, layerHeatmap) {
    if (typeof (layer) == "undefined") {
        var featureOption;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Polygon_2/MapServer/34' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Building/MapServer/0' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Line/MapServer/2' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Point/MapServer/2' + '?Token=' + gpNCDR_Token;
        url = funcobj.TiledMapUrl + '?Token=' + gpNCDR_Token;
        console.log(url);
        featureOption = {
            id: "layerFeature" + funcid,
            "opacity": 1,
            mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
            // infoTemplate: template,
            outFields: ["*"]
        };
        layer = new esri.layers.FeatureLayer(url, featureOption);
        console.log(layer);
        bindFeatureServiceClickEvent(layer, funcobj);
        setRendererAndCondition(layer, "FS_Line", funcobj, false);
        featureLayer = layer;
        map.addLayer(layer);
    }
    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }

    //設定顯示
    layer.setVisibility(chked);
}

function LoadPolygonFeatureLayer(funcobj, funcid, chked, layer, layerHeatmap) {
    if (typeof (layer) == "undefined") {
        var featureOption;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Polygon_2/MapServer/34' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Building/MapServer/0' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Line/MapServer/2' + '?Token=' + gpNCDR_Token;
        //url = 'http://140.110.141.217/ceocgis/rest/services/NCDR_SDE_2014/NCDR_SDE_Point/MapServer/2' + '?Token=' + gpNCDR_Token;
        url = funcobj.TiledMapUrl + '?Token=' + gpNCDR_Token;
        console.log(url);
        featureOption = {
            id: "layerFeature" + funcid,
            "opacity": 1,
            mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
            // infoTemplate: template,
            outFields: ["*"]
        };
        layer = new esri.layers.FeatureLayer(url, featureOption);
        console.log(layer);
        bindFeatureServiceClickEvent(layer, funcobj);
        setRendererAndCondition(layer, "FS_ Polygon", funcobj, false);
        featureLayer = layer;
        map.addLayer(layer);
    }
    if (!chked) {
        map.removeLayer(layer); //移除layer
        return;
    }

    //設定顯示
    layer.setVisibility(chked);
}
//設定圖層樣式與篩選條件 2016/09/29 Kevin
function setRendererAndCondition(layer, layerType, funcobj, isShowHeatmap) {
    var layerCondition;
    $.ajax({
        url: "GetData/funcWidget/getLyrStyle.ashx",
        data: {
            //FuncId: 6721,
            //FuncId: 1004,
            FuncId: funcobj.ID,
        },
        dataType: 'json'
    }).done(function (data) {
        console.log('lyrstyle');
        console.log(data);
        layerCondition = "BAS_NAME='高雄市立聯合醫院'|CCTV-2.png$#073C44&#170744";
        funcobj.lyrCondi = data[0].LyrStyle;
        //funcobj.lyrCondi = "|#DC143C$#073C44&#170744";
        require(["esri/renderers/HeatmapRenderer", "esri/renderers/SimpleRenderer", ], function (HeatmapRenderer, SimpleRenderer) {

            if (layerType == "FS_Point") {
                setPointStyle(HeatmapRenderer, SimpleRenderer, layer, funcobj, isShowHeatmap);
            } else if (layerType == "FS_Line") {
                setLineStyle(SimpleRenderer, layer, funcobj);
            } else if (layerType == "FS_ Polygon") {
                setPolygonStyle(SimpleRenderer, layer, funcobj);
            }

        }


    );
        var expression = funcobj.lyrCondi.split("$")[0].split("|")[0];
        if (typeof (expression) != "undefined") {
            layer.setDefinitionExpression(expression);
        }
    });

}

function setPointStyle(HeatmapRenderer, SimpleRenderer, layer, funcobj, isShowHeatmap) {
    if (isShowHeatmap) {
        var colorArr = [];
        colorArr.push("rgba(153, 225, 153, 0)");
        var heatmapColors = funcobj.lyrCondi.split("$")[1].split("&");
        for (var i = 0; i < heatmapColors.length; i++) {
            colorArr.push(heatmapColors[i]);
        }
        //console.log(colorArr);
        var heatmapRenderer = new HeatmapRenderer({
            blurRadius: 10,
            colors: colorArr,
            //colors: ["rgba(153, 225, 153, 0)", "rgb(51, 255, 153)", "rgb(0, 255, 128)", "rgb(0, 204, 102)", "rgb(213, 15, 34)"],
            //colors: ["rgba(153, 225, 153, 0)", "#760D0D", "#CCD306"],
            maxPixelIntensity: 20,
            minPixelIntensity: 0
        });
        layer.setRenderer(heatmapRenderer);
        heatmapRdr = heatmapRenderer;
    } else {

        var lyrStyle = funcobj.lyrCondi.split("$")[0].split("|")[1];
        //var lyrStyle = layerCondition.split("$")[0].split("|")[1];
        lyrStyle = lyrStyle.split("*")[0];
        //layer.on('load', function (evt) {
        console.log('load');
        console.log(layer);

        var rdr = layer.renderer;

        if (typeof (lyrStyle) != "undefined") {
            if (typeof (layer.renderer.symbol.url) != "undefined") {
                if (lyrStyle.includes("png")) {
                    var fillSymbol = new esri.symbol.PictureMarkerSymbol(
                     gLegendPath1 + lyrStyle,
                     22,
                     22
                   );
                    var statesRenderer = new SimpleRenderer(fillSymbol);
                    layer.setRenderer(statesRenderer);
                }
            } else {
                var pointSymbol = new esri.symbol.SimpleMarkerSymbol(
                          esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,
                          12,
                          new esri.symbol.SimpleLineSymbol(
                            esri.symbol.SimpleLineSymbol.STYLE_NULL,
                            new dojo.Color(lyrStyle),
                            1
                          ),
                          new dojo.Color(lyrStyle)
                );
                var statesRenderer = new SimpleRenderer(pointSymbol);
                layer.setRenderer(statesRenderer);
            }

        }
        //});


    }
}

function setLineStyle(SimpleRenderer, layer, funcobj) {
    var lyrStyle = funcobj.lyrCondi.split("$")[0].split("|")[1];
    //var lyrStyle = layerCondition.split("$")[0].split("|")[1];
    lyrStyle = lyrStyle.split("*")[0];
    console.log(lyrStyle);
    if (typeof (lyrStyle) != "undefined") {

        var statesColor = new dojo.Color(lyrStyle);
        var statesLine = new esri.symbol.SimpleLineSymbol("solid", statesColor, 1.5);
        var statesRenderer = new SimpleRenderer(statesLine);
        layer.setRenderer(statesRenderer);

    }
}

function setPolygonStyle(SimpleRenderer, layer, funcobj) {
    var lyrStyle = funcobj.lyrCondi.split("$")[0].split("|")[1];
    //var lyrStyle = layerCondition.split("$")[0].split("|")[1];
    console.log(lyrStyle);
    if (typeof (lyrStyle) != "undefined") {
        var borderColor = lyrStyle.split("*")[0];
        var fillColor = lyrStyle.split("*")[1];
        var polygonSymbol = new esri.symbol.SimpleFillSymbol(
                   esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                   new esri.symbol.SimpleLineSymbol(
                     esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                     new dojo.Color(borderColor),
                     2
                   ),
                   new dojo.Color(fillColor)
           );
        //var polygonSymbol = new esri.symbol.SimpleFillSymbol(
        //           esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        //           new esri.symbol.SimpleLineSymbol(
        //             esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        //             new dojo.Color([111, 177, 0]),
        //             2
        //           ),
        //           new dojo.Color([111, 177, 0, 0.15])
        //   );
        var statesRenderer = new SimpleRenderer(polygonSymbol);
        layer.setRenderer(statesRenderer);

    }
}

function bindFeatureServiceClickEvent(layer, funcobj) {
    dojo.connect(layer, "onClick", function (evt) {
        var showStreetView = (funcobj.IsShowStrView == "1") ? true : false;
        var content = '';
        var identifyInfo = funcobj.Iden;
        console.log(identifyInfo);
        //var identifyInfo = 'BAS_NAME:醫院名|BAS_TEL_NO:電話';
        var identifyInfos = identifyInfo.split("|");
        var attributeName = [];
        var attributeValue = [];
        for (var i = 0; i < identifyInfos.length; i++) {
            attributeName.push(identifyInfos[i].split(":")[0]);
            attributeValue.push(identifyInfos[i].split(":")[1]);
        }
        console.log(attributeName);
        console.log(attributeValue);
        console.log(evt.graphic.attributes);
        $.each(evt.graphic.attributes, function (index, value) {
            console.log(index);
            console.log(value);
            if (identifyInfo == "") {
                content += '<div>' + index + ':' + value + '</div>';
            }
            else if (attributeName.indexOf(index) >= 0) {
                content += '<div>' + attributeValue[attributeName.indexOf(index)] + ':' + value + '</div>';
            }

        });
        if (showStreetView && typeof (evt.graphic.attributes.nWGS84_Lon) != "undefined") {
            var mp, posX, posY;
            mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);

            posX = evt.graphic.attributes.nWGS84_Lon.toFixed(6);
            posY = evt.graphic.attributes.nWGS84_Lat.toFixed(6);
            //posX = mp.x.toFixed(6);
            //posY = mp.y.toFixed(6);
            var WGS84Point = coordinatesTransfer(parseFloat(posX), parseFloat(posY), "EPSG:4326", "EPSG:4326");
            //var WGS84Point = coordinatesTransfer(parseFloat(posX), parseFloat(posY), "EPSG:3826", "EPSG:4326");

            content += "<p style=\"text-align:right;color:blue;cursor:pointer;\"  onclick=\"oMapQry.openStreetView(" + WGS84Point.x + "," + WGS84Point.y + ");\">&lt;觀看街景&gt;</p>";
        }
        showPointTip(evt.screenPoint, "", content, 200, 150);
    }
);
}

//重新載入圖層:資料庫圖點
function reloadDBPoint(funcobj) {
    if (gpDBDataJsonUrl == "") {
    var layer = map.getLayer("layerDBPoint" + funcobj.ID);

    //取出當前地圖範圍
    var mapExtent = getMapExtent();
    var Lx = mapExtent.xmin;
    var Rx = mapExtent.xmax;
    var By = mapExtent.ymin;
    var Ty = mapExtent.ymax;

    var curtime = curDateTime;
    var url = "GetData/funcWidget/getDBPointData.ashx?id=" + funcobj.ID + "&name=" + funcobj.Name + "&exec=" + funcobj.Exec + "&Lx=" + Lx + "&Ty=" + Ty + "&Rx=" + Rx + "&By=" + By + "&curtimeS=" + curtime;

    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",              // xml/json/script/html
        cache: false,                 // 是否允許快取
        beforeSend: function () {
            showLoading();
        },
        success: function (data) {

            layer.clear();

            var GISLink = [];
            GISLink = funcobj.Iden.split("|");
            var oUrlID = "";
            if (GISLink.length > 1) {
                for (var i = 0; i < GISLink.length; i++) {
                    if (GISLink[i].split(":")[1] == "url連結") {
                        oUrlID = GISLink[i].split(":")[0];
                    }
                }
            }

            //貼點
            for (var i = 0; i < data.DataList[0].Items.length; i++) {
                var o = data.DataList[0].Items[i];
                var imgPath = gLegendPath1 + o.Pic;
                var gcID = "pt" + funcobj.ID + "_" + o.ID;

                if (oUrlID != "") {
                    //Su-01 因應TIP需求
                    //AddPointToLayer(o.PX, o.PY, o[oUrlID], imgPath, 16, 16, gcID, layer);  //attr只存URL
                    AddPointToLayer(o.PX, o.PY, o, imgPath, 16, 16, gcID, layer);
                    //Su-01修改結束 
                } else {
                    AddPointToLayer(o.PX, o.PY, o, imgPath, 16, 16, gcID, layer);
                }
            }
        },
        error: function () {
            UpdQFuncList(funcobj.ID, false, "", ""); //更新圖例區
            $("#cbFunc" + funcobj.ID).attr("src", "images/FuncList/uncheck.png");
            alert(funcobj.CName + "資料載入失敗");
        },
        complete: function () {
            hideLoading();
        }
    });
}
}

//載入圖層:遙測  //+// charlie
function LoadRemoteLayers(ID, URL, Extent) {

    var wmsUrl = URL;  //服務網址

    //載入圖層
    dojo.declare("RemoteLayer_N", esri.layers.DynamicMapServiceLayer, {
        constructor: function () {
            this.loaded = true;
            this.onLoad(this);
        },
        getImageUrl: function (extent, width, height, callback) {

            var mapEPSG = "EPSG:" + extent.spatialReference.latestWkid;
            var WGS84_min = coordinatesTransfer(extent.xmin * 1, extent.ymin * 1, mapEPSG, "EPSG:4326");
            var WGS84_max = coordinatesTransfer(extent.xmax * 1, extent.ymax * 1, mapEPSG, "EPSG:4326");
            //alert(WGS84_min.x + "  " + WGS84_min.y);

            var params = {
                request: "GetMap",
                transparent: true,
                format: "image/png",
                version: "1.1.1",
                layers: ID,
                styles: "",
                //servicename: o.servicename,

                //changing values
                //bbox: Extent.split(",")[1] + "," + Extent.split(",")[0] + "," + Extent.split(",")[3] + "," + Extent.split(",")[2],
                bbox: WGS84_min.x + "," + WGS84_min.y + "," + WGS84_max.x + "," + WGS84_max.y,  //順序與一般WMS不同 需注意
                srs: "EPSG:" + "4326", //遙測服務只接受84坐標

                width: width,
                height: height
            };

            callback(wmsUrl + "?" + dojo.objectToQuery(params));
        }

    });

    // 2015/12/08 整合影像比對 Start
    //debugger
    //UpdQFuncList(ID.replace(" ", ""), true, rn.id, ""); //更新圖例區
    var index_ = $.inArray('lyrTiledMapTwLabel', map.layerIds);

    var rn = new RemoteLayer_N({ id: "RemoteLayer_" + ID.replace(" ", "") });
    map.addLayer(rn, index_ - 1);

    //ID裡面有空白....
    var ID_ = ID.replace(/ /gi, '');
    var scsl = $('#divOpenFunc');
    if (scsl.find('#of_' + ID_).length == 0) {
        var ctx_ = '';
        ctx_ += '<div class="OpnFunc RM" id="of_' + ID_ + '" style="margin: 0px;">';
        ctx_ += '<div style="float:left">';
        ctx_ += '<img id="opOpnImg_' + ID_ + '" alt="關閉圖層" src="images/FuncList/icon-37.png"/>&nbsp;';
        ctx_ += '<img id="opShwImg_' + ID_ + '" alt="顯示圖層" src="images/FuncList/icon-40.png"/>&nbsp;';
        ctx_ += '</div>';
        ctx_ += '<div style="width:150px;word- break: break-all;word-wrap: break-word;float:left;margin-left:10px">';
        ctx_ += '<span style="color: rgb(0, 0, 0);">' + ID_ + '</span>';
        ctx_ += '</div>';
        ctx_ += '<div style="float:left;margin-left:10px">';
        ctx_ += '<img id="opOpaImg_' + ID_ + '" src="images/FuncList/icon-42.png" alt="透明度" />';
        ctx_ += '</div>';
        ctx_ += "<div id=\"Opa_" + ID_ + "\" class=\"Opa\" >";
        ctx_ += "<img src=\"images/other/close.png\" onclick=\"switchFuncOpa('Opa_" + ID_ + "', 0)\" />";

        ctx_ += "<img src=\"images/Opacity/transparent_on_01.png\" onclick=\"clickFuncOpa(0,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_02.png\" onclick=\"clickFuncOpa(0.1,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_03.png\" onclick=\"clickFuncOpa(0.2,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_04.png\" onclick=\"clickFuncOpa(0.3,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_05.png\" onclick=\"clickFuncOpa(0.4,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_06.png\" onclick=\"clickFuncOpa(0.5,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_07.png\" onclick=\"clickFuncOpa(0.7,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";
        ctx_ += "<img src=\"images/Opacity/transparent_off_08.png\" onclick=\"clickFuncOpa(0.85,'Opa_" + ID_ + "','" + 'RemoteLayer_' + ID_ + "')\" />";

        ctx_ += '<s><i></i></s></div></div>';
        if (scsl.find('.OpnFunc').length == 0) {
            scsl.append(ctx_);
        } else {
            scsl.prepend(ctx_);
        }
    }
    scsl.find('.OpnFunc.RM').each(function () {
        $(this).find('img').eq(0).unbind('click').on('click', function () {
            //@JG
            //MapUtils L64
            //dojo.connect(map, 'onLayerRemove', function (layer) {
            //    //圖例區移除遙測圖層圖例
            //    $('#' + layer.id.replace('RemoteLayer_', 'of_')).remove();
            //});
            $('#' + this.id.replace('opOpnImg_', 'of_')).remove();
            $('#' + this.id.replace('opOpnImg_', 'Img_')).attr('src', 'images/FuncList/uncheck.png');

            //這些類 也要加入 replace TALIM_20120618_ Aerial_AFASI
            var layer = map.getLayer(this.id.replace('opOpnImg_', 'RemoteLayer_'));
            map.removeLayer(layer);
        });
        $(this).find('img').eq(1).unbind('click').on('click', function () {

            //這些類 也要加入 replace TALIM_20120618_ Aerial_AFASI
            //也確認一下swipe那邊
            var layer = map.getLayer(this.id.replace('opShwImg_', 'RemoteLayer_'));

            if (typeof (layer) != 'undefined') {
                if ($(this).attr('alt') == '顯示圖層') {
                    $(this).attr('alt', '隱藏圖層');
                    $(this).attr('src', 'images/FuncList/icon-41.png');
                    layer.hide();
                } else {
                    $(this).attr('alt', '顯示圖層');
                    $(this).attr('src', 'images/FuncList/icon-40.png');
                    layer.show();
                }
            }
        });
        $(this).find('img').eq(2).unbind('click').on('click', function () {
            $('#' + this.id.replace('opOpaImg_', 'Opa_')).show();
            //clickFuncOpa 處理透明度 
        });

    });
    // 2015/12/08 整合影像比對 End

    //map.addLayer(new RemoteLayer_N({ id: "RemoteLayer_" + ID.replace(" ", "") })); // 2015/12/08 整合影像比對
}

//載入圖層:個人WMS服務  //+// charlie
function LoadWmsLayers(URL, layerid) {
    var sUrl = URL;
    var wmsUrl = "";
    var sParam = "";
    var wmsParam = [];
    if (sUrl.indexOf("?") >= 0) {
        wmsUrl = sUrl.split("?")[0];  //服務網址
        sParam = sUrl.split("?")[1];  //服務參數
        wmsParam = sParam.split("&"); //服務參數陣列

        //設定物件
        var o = new Object();
        for (var i = 0; i < wmsParam.length; i++) o[wmsParam[i].split("=")[0].toUpperCase()] = wmsParam[i].split("=")[1];

        //載入圖層
        dojo.declare("WMSLayer_N", esri.layers.DynamicMapServiceLayer, {
            constructor: function () {
                this.loaded = true;
                this.onLoad(this);
            },
            getImageUrl: function (extent, width, height, callback) {
                var newEPSG = resetWmsEPSG(extent, o.SRS);
                var params = {
                    REQUEST: "GetMap",
                    TRANSPARENT: true,
                    FORMAT: o.FORMAT,
                    VERSION: o.VERSION,
                    LAYERS: o.LAYERS,
                    STYLES: "",
                    //servicename: o.servicename,
                    BBOX: newEPSG.xmin + "," + newEPSG.ymin + "," + newEPSG.xmax + "," + newEPSG.ymax,
                    SRS: newEPSG.wmsSRS,
                    WIDTH: width,
                    HEIGHT: height
                };

                if (typeof (o.SERVICENAME) != "undefined") {
                    callback(wmsUrl + "?" + dojo.objectToQuery(params) + "&servicename=" + o.SERVICENAME);
                } else {
                    callback(wmsUrl + "?" + dojo.objectToQuery(params));
                }
            }

        })

        WMSLayerArray.push(new WMSLayer_N());
        WMSLayerArray[WMSLayerArray.length - 1].id = "layerWMS" + layerid;
        map.addLayer(WMSLayerArray[WMSLayerArray.length - 1]);
    }
}

//載入臨時上架圖層:KML類地圖服務 20140828 yolanda
function LoadKmlLayers2(URL, layerid) {

    showLoading();

    layer = new esri.layers.KMLLayer(URL, { id: "layerKML" + layerid, outSR: new esri.SpatialReference(mapSpRef), "opacity": 1 });

    KMLLayerArray.push(layer);
    KMLLayerArray[KMLLayerArray.length - 1].id = "layerKML" + layerid;
    map.addLayer(layer);


    layer.on("load", function () { hideLoading(); });
    layer.on("error", function () {
        hideLoading();
        UpdQFuncList(layerid, false, "", ""); //更新圖例區
        $("#cbFunc" + layerid).attr("src", "images/FuncList/uncheck.png");
        alert("資料載入失敗");
    });
}

//重設WMS坐標系統 //add by Vicky
function resetWmsEPSG(extent, srcSRS) {
    var mapEPSG = "EPSG:" + extent.spatialReference.latestWkid;
    //var wmsSRS;
    var oWmsParm = new Object();//, xmin, ymin, xmax, ymax;

    //預設wms參數與系統相符
    oWmsParm.wmsSRS = mapEPSG;
    oWmsParm.xmin = extent.xmin;
    oWmsParm.ymin = extent.ymin;
    oWmsParm.xmax = extent.xmax;
    oWmsParm.ymax = extent.ymax;

    //wms坐標與系統不符時,調整參數
    if (srcSRS != mapEPSG) {
        var minXY, maxXY
        if (srcSRS == "EPSG:" + extent.spatialReference.wkid) { //ex.102443 vs 3826
            oWmsParm.wmsSRS = "EPSG:" + extent.spatialReference.wkid;
        }
        else if (srcSRS == "EPSG:3857" || mapSpRef.wkid == "4326") { //轉84坐標
            var minXY = coordinatesTransfer(extent.xmin * 1, extent.ymin * 1, mapEPSG, "EPSG:4326");
            var maxXY = coordinatesTransfer(extent.xmax * 1, extent.ymax * 1, mapEPSG, "EPSG:4326");
            oWmsParm.wmsSRS = "EPSG:4326";
            oWmsParm.xmin = minXY.x;
            oWmsParm.ymin = minXY.y;
            oWmsParm.xmax = maxXY.x;
            oWmsParm.ymax = maxXY.y;
        }
    }

    return oWmsParm;
}


//RTUI客製化圖層********************************************************

//公版主題式表單
//var timerCommon;
var oRT_Common = {};
function LoadRtCommon(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_Common" + funcid; //客製化表單DIV ID
    var tbRTUI = "tbCommon" + funcid;          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {
        if ($("#" + tbRTUI).length > 0) {
            if ($('#' + tbRTUI + '.dataTable').length > 0) { // 2015/08/06 修改沒有資料時的關閉DIV能正常
                var datatables = $('#' + tbRTUI).dataTable();
                datatables.fnDestroy();

                RemoveTbFilter(tbRTUI); //移除資料表篩選條件
            }
        }

        removeDiv(funcid, divOpenRTUI); //移除DIV
        map.infoWindow.hide();

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        //clearInterval(timerCommon);
        //timerCommon = null;
        //delete timerCommon;

        oRT_Common["Func" + funcid].destory();
        oRT_Common["Func" + funcid] = null;
        delete oRT_Common["Func" + funcid];

        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {
            //添加拖曳事件
            $("#" + divOpenRTUI).draggable({ handle: "div:first" });

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(500).css('padding-bottom', '10px');
            //$("#" + divOpenRTUI).height(500);
            $("#" + divOpenRTUI).offset({ top: 50 + Object.keys(oRT_Common).length * 30, left: 100 + Object.keys(oRT_Common).length * 30 });
            setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_Common.htm", function () {
                $("#" + divOpenRTUI + " table").attr('id', tbRTUI);
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });
                $("#" + divOpenRTUI + " .CommonTitleName").text(getArryObj(arrFuncList, 'ID', funcid).CName);

                oRT_Common["Func" + funcid] = new RT_Common();
                oRT_Common["Func" + funcid].FuncId = funcid;
                oRT_Common["Func" + funcid].FuncName = funcname;
                oRT_Common["Func" + funcid].Layer = layerRTUI;
                oRT_Common["Func" + funcid].FrmBoxId = divOpenRTUI;  //DIV容器id
                oRT_Common["Func" + funcid].TableId = tbRTUI;     //表單id
                oRT_Common["Func" + funcid].RecId = "CommonRecord"; //表身id
                oRT_Common["Func" + funcid].TrPre = "Common";      //資料TR id前置詞(for圖查文)
                oRT_Common["Func" + funcid].PtPre = "RT_Common";    //圖點id前置詞
                oRT_Common["Func" + funcid].loadSrcData();

                //clearInterval(timerCommon);
                //timerCommon = setInterval(oRT_Common["Func" + funcid].reloadSrcData, 600000, null); //更新頻率10分鐘(10*60*1000)

            });
        }
    }
}

//即時潮位站
var timerTide;
var oRT_Tide;
function LoadRtTide(funcid, funcname, chked, layerid) {

    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_Tide"; //客製化表單DIV ID
    var tbRTUI = "tbTide";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {
        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            //datatables.fnClearTable(0); //清空數據
            //datatables.fnDraw();        //重新加載數據
            datatables.fnDestroy();

            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        removeDiv(funcid, divOpenRTUI); //移除DIV

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerTide);
        timerTide = null;
        delete timerTide;

        oRT_Tide = null;
        delete oRT_Tide;

        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_Tide != null && typeof(oRT_Tide) != "undefined")
        {
            oRT_Tide.Layer = layerRTUI;
            oRT_Tide.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#mainRight").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" ></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            //$("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width("100%");
            //$("#" + divOpenRTUI).height(530);
            //$("#" + divOpenRTUI).offset({ top: 50, left: 50 });
            //setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_TyRouteCWBForAPI.htm", function () {
                //$("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });
                $("#closeCWBInfo").unbind('click').bind("click", function () {
                    closeTabs("#cwbTitle", "#cwbContent", "#closeCWBInfo", "#openCWBInfo");
                });
                $("#openCWBInfo").unbind('click').bind("click", function () {
                    openTabs("#cwbTitle", "#cwbContent", "#closeCWBInfo", "#openCWBInfo");
                });
                closeTabs("#cwbTitle", "#cwbContent", "#closeCWBInfo", "#openCWBInfo");
                oRT_TyRouteCWB = new RT_TyRouteCWB();
                oRT_TyRouteCWB.FuncId = funcid;
                oRT_TyRouteCWB.FuncName = funcname;
                oRT_TyRouteCWB.Layer = layerRTUI;    //圖層
                oRT_TyRouteCWB.DivId = divOpenRTUI;  //DIV容器id
                oRT_TyRouteCWB.loadSrcData();

                clearInterval(timerTyRouteCWB); //清除計時器
                timerTyRouteCWB = setInterval(oRT_TyRouteCWB.reloadSrcData, 3600000, null); //更新頻率1小時(60*60*1000)
            });
        }
    }
}

// 2015/03/20 新增「潮位」：仿「即時潮位站」製作
var timerTideLevel;
var oRT_TideLevel;
function LoadRtTideLevel(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_TideLevel"; //客製化表單DIV ID
    var tbRTUI = "tbTideLevel";          //客製化表單TABLE ID
    var divChartBox = "tbTideLevel"; //統計圖容器ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {
        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();

            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        // 2015/06/08 修正潮位
        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除表單
        $(".viewRT_History[charttype=RT_TideLevelHistory]").remove(); //移除所有歷線圖

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerTideLevel);
        timerTideLevel = null;
        delete timerTideLevel;

        oRT_TideLevel = null;
        delete oRT_TideLevel;

        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            //添加拖曳事件
            $("#" + divOpenRTUI).draggable();

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(500);
            $("#" + divOpenRTUI).height(450);
            $("#" + divOpenRTUI).offset({ top: 50, left: 100 });
            setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_TideLevel.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                oRT_TideLevel = new RT_TideLevel();
                oRT_TideLevel.FuncId = funcid;
                oRT_TideLevel.FuncName = funcname;
                oRT_TideLevel.Layer = layerRTUI;
                oRT_TideLevel.FrmBoxId = divOpenRTUI;  //DIV容器id
                oRT_TideLevel.TableId = tbRTUI;     //表單id
                oRT_TideLevel.RecId = "TideLevelRecord"; //表身id
                oRT_TideLevel.TrPre = "tideLevel_";      //資料TR id前置詞(for圖查文)
                oRT_TideLevel.PtPre = "RT_TideLevel";    //圖點id前置詞
                oRT_TideLevel.loadSrcData();

                clearInterval(timerTide);
                timerTideLevel = setInterval(oRT_TideLevel.reloadSrcData, 600000, null); //更新頻率10分鐘(10*60*1000)
            });
        }
    }
}



//即時雨量
var timerRain;
var oRT_Rain;
function LoadRtRain(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_Rain"; //客製化表單容器 ID
    var tbRTUI = "tbRain";          //客製化表單TABLE ID
    var divChartBox = "divRT_RainChart"; //統計圖容器ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除表單
        $("#" + divChartBox).remove();      //移除所有統計圖
        $(".viewRT_History[charttype=RT_RainHistory]").remove(); //移除所有歷線圖

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerRain);
        timerRain = null;
        delete timerRain;

        oRT_Rain = null;
        delete oRT_Rain;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_Rain != null && typeof (oRT_Rain) != "undefined") {
            oRT_Rain.Layer = layerRTUI;
            oRT_Rain.reloadSrcData();
            return;
        }*/

        if ($("#divRT_RainChart").length == 0) $("#divMain").append("<div id = \"divRT_RainChart\" style=\"width:100%; height:100%; z-index:3;\"></div>"); //創建圖表容器
        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(370);
            $("#" + divOpenRTUI).height(550);
            $("#" + divOpenRTUI).offset({ top: 50, left: 100 });
            setFrmDfVisible(funcid, divOpenRTUI);

            // 2015/12/15 整合水文情資模板
            $('head').append($('<script src="JS/RT_Rain.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_Rain.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                oRT_Rain = new RT_Rain();
                oRT_Rain.FuncId = funcid;
                oRT_Rain.FuncName = funcname;
                oRT_Rain.Layer = layerRTUI;      //圖層
                oRT_Rain.FrmBoxId = divOpenRTUI; //表單容器id
                oRT_Rain.TableId = tbRTUI;       //表格id
                oRT_Rain.RecId = "RainRecord";   //表身id
                oRT_Rain.TrPre = "rain_";        //資料TR id前置詞(for圖查文)
                oRT_Rain.PtPre = "RT_Rain";      //圖點id前置詞
                oRT_Rain.ChartBoxId = divChartBox; //統計圖容器id
                oRT_Rain.loadSrcData();

                clearInterval(timerRain); //清除計時器
                timerRain = setInterval(oRT_Rain.reloadSrcData, 600000, null); //更新頻率10分鐘(10*60*1000)
            });
        }
    }
}

//CWB颱風路徑
var oRT_TyRouteCWB;
var timerTyRouteCWB;
function LoadRtTyRouteCWB(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_TyRouteCWB"; //客製化表單DIV ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {
        removeDiv(funcid, divOpenRTUI); //移除表單

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerTyRouteCWB);
        timerTyRouteCWB = null;
        delete timerTyRouteCWB;

        oRT_TyRouteCWB = null;
        delete oRT_TyRouteCWB;

        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_TyRouteCWB != null && typeof (oRT_TyRouteCWB) != "undefined") {
            oRT_TyRouteCWB.Layer = layerRTUI;
            oRT_TyRouteCWB.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#mainRight").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" ></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            //$("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width("100%");
            //$("#" + divOpenRTUI).height(530);
            //$("#" + divOpenRTUI).offset({ top: 50, left: 50 });
            //setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_TyRouteCWBForAPI.htm", function () {
                //$("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });
                $("#closeCWBInfo").unbind('click').bind("click", function () {
                    closeTabs("#cwbTitle", "#cwbContent", "#closeCWBInfo", "#openCWBInfo");
                });
                $("#openCWBInfo").unbind('click').bind("click", function () {
                    openTabs("#cwbTitle", "#cwbContent", "#closeCWBInfo", "#openCWBInfo");
                });
                closeTabs("#cwbTitle", "#cwbContent", "#closeCWBInfo", "#openCWBInfo");
                oRT_TyRouteCWB = new RT_TyRouteCWB();
                oRT_TyRouteCWB.FuncId = funcid;
                oRT_TyRouteCWB.FuncName = funcname;
                oRT_TyRouteCWB.Layer = layerRTUI;    //圖層
                oRT_TyRouteCWB.DivId = divOpenRTUI;  //DIV容器id
                oRT_TyRouteCWB.loadSrcData();

                clearInterval(timerTyRouteCWB); //清除計時器
                timerTyRouteCWB = setInterval(oRT_TyRouteCWB.reloadSrcData, 3600000, null); //更新頻率1小時(60*60*1000)
            });
        }
    }
}

//河川水位
var timerWraRiver;
var oRT_WraRiver;
function LoadRtWraRiver(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_WraRiver"; //客製化表單容器 ID
    var tbRTUI = "tbWraRiver";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除表單
        $(".viewRT_History[charttype=RT_WraRiverHistory]").remove(); //移除所有歷線圖

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerWraRiver);
        timerWraRiver = null;
        delete timerWraRiver;

        oRT_WraRiver = null;
        delete oRT_WraRiver;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_WraRiver != null && typeof (oRT_WraRiver) != "undefined") {
            oRT_WraRiver.Layer = layerRTUI;
            oRT_WraRiver.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(410);
            $("#" + divOpenRTUI).height(470);
            $("#" + divOpenRTUI).offset({ top: 50, left: 100 });
            setFrmDfVisible(funcid, divOpenRTUI);

            // 2015/12/15 整合水文情資模板
            $('head').append($('<script src="JS/RT_WraRiver.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_WraRiver.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                oRT_WraRiver = new RT_WraRiver();
                oRT_WraRiver.FuncId = funcid;
                oRT_WraRiver.FuncName = funcname;
                oRT_WraRiver.Layer = layerRTUI;          //圖層
                oRT_WraRiver.FrmBoxId = divOpenRTUI;     //表單容器id
                oRT_WraRiver.TableId = tbRTUI;           //表格id
                oRT_WraRiver.RecId = "WraRiverRecord";   //表身id
                oRT_WraRiver.TrPre = "trWraRiver";        //資料TR id前置詞(for圖查文)
                oRT_WraRiver.PtPre = "ptWraRiver";         //圖點id前置詞
                //oRT_WraRiver.openedBmkTime = oBookmark.openedBmkTime; //加入書籤時間，河川水位判斷是否有專案時間分別撈即時(沒時間)或即時+歷史(有時間)  @20160420 Andy //改回沒有時間判斷 @20160428    Andy
                oRT_WraRiver.loadSrcData();

                clearInterval(timerWraRiver);
                timeroRT_WraRiver = setInterval(oRT_WraRiver.reloadSrcData, 600000, null); //更新頻率10分鐘(10*60*1000)
            });

        }
    }
}

//水庫水位
var timerWraReservoir;
var oRT_WraReservoir;
function LoadRtWraReservoir(funcid, funcname, chked, layerid, extent) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_WraReservoir"; //客製化表單容器 ID
    var tbRTUI = "tbWraReservoir";          //客製化表單TABLE ID

    if (typeof (extent) != "undefined") { //即時情資：參數增加影響範圍
        UpdQFuncList(funcid, chked, layerid, divOpenRTUI, "cbFuncRID"); //更新圖例區
    }
    else {
        UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區
    }

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除表單
        $(".viewRT_History[charttype=RT_WraReservoirHistory]").remove(); //移除所有歷線圖

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerWraReservoir);
        timerWraReservoir = null;
        delete timerWraReservoir;

        oRT_WraReservoir = null;
        delete oRT_WraReservoir;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_WraReservoir != null && typeof (oRT_WraReservoir) != "undefined") {
            oRT_WraReservoir.Layer = layerRTUI;
            oRT_WraReservoir.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(550);
            $("#" + divOpenRTUI).height(470);
            $("#" + divOpenRTUI).offset({ top: 50, left: 100 });
            setFrmDfVisible(funcid, divOpenRTUI);

            // 2015/12/15 整合水文情資模板
            $('head').append($('<script src="JS/RT_WraReservoir.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_WraReservoir.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                oRT_WraReservoir = new RT_WraReservoir();
                oRT_WraReservoir.FuncId = funcid;
                oRT_WraReservoir.FuncName = funcname;
                oRT_WraReservoir.Layer = layerRTUI;              //圖層
                oRT_WraReservoir.FrmBoxId = divOpenRTUI;         //表單容器id
                oRT_WraReservoir.TableId = tbRTUI;               //表格id
                oRT_WraReservoir.RecId = "WraReservoirRecord";   //表身id
                oRT_WraReservoir.TrPre = "trWraReservoir";       //資料TR id前置詞(for圖查文)
                oRT_WraReservoir.PtPre = "ptWraReservoir";       //圖點id前置詞

                if (typeof (extent) != "undefined") {
                    oRT_WraReservoir.Extent = extent;
                    $('#cbWraReservoirQryStn').prop('checked', false);
                }


                oRT_WraReservoir.loadSrcData();

                clearInterval(timerWraReservoir);
                timeroRT_WraReservoir = setInterval(oRT_WraReservoir.reloadSrcData, 600000, null); //更新頻率10分鐘(10*60*1000)

            });

        }
    }
}

//各國颱風預測路徑  Ray
var timerTyRouteEachCountry;
var oRT_TyRouteEachCountry;
function LoadRtTyRouteEachCountry(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_TyRouteEachCountry"; //客製化表單容器 ID
    var tbRTUI = "tbTyRouteEachCountry";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除DIV

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //清除計時器
        clearInterval(timerTyRouteEachCountry);
        timerTyRouteEachCountry = null;
        delete timerTyRouteEachCountry;

        oRT_TyRouteEachCountry = null;
        delete oRT_TyRouteEachCountry;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_TyRouteEachCountry != null && typeof (oRT_TyRouteEachCountry) != "undefined") {
            oRT_TyRouteEachCountry.Layer = layerRTUI;
            oRT_TyRouteEachCountry.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#mainRight").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            //$("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            //$("#" + divOpenRTUI).width(300);
            //$("#" + divOpenRTUI).height(210); //2015/09/15 修改
            //$("#" + divOpenRTUI).height(230); //2015/09/15 修改
            //$("#" + divOpenRTUI).offset({ top: 100, left: 50 });
            //setFrmDfVisible(funcid, divOpenRTUI);//因為沒有表單按鈕，故改為預設顯示

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_TyRouteEachCountryForAPI.htm", function () {
                //$("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });
                $("#closeEachCountryInfo").unbind('click').bind("click", function () {
                    closeTabs("#eachCountryTitle", "#eachCountryContent", "#closeEachCountryInfo", "#openEachCountryInfo");
                });
                $("#openEachCountryInfo").unbind('click').bind("click", function () {
                    openTabs("#eachCountryTitle", "#eachCountryContent", "#closeEachCountryInfo", "#openEachCountryInfo");
                });
                closeTabs("#eachCountryTitle", "#eachCountryContent", "#closeEachCountryInfo", "#openEachCountryInfo");
                oRT_TyRouteEachCountry = new RT_TyRouteEachCountry();
                oRT_TyRouteEachCountry.FuncId = funcid;
                oRT_TyRouteEachCountry.FuncName = funcname;
                oRT_TyRouteEachCountry.Layer = layerRTUI;    //圖層
                oRT_TyRouteEachCountry.DivId = divOpenRTUI;  //DIV容器id
                oRT_TyRouteEachCountry.loadSrcData();

                clearInterval(timerTyRouteEachCountry);
                timerTyRouteEachCountry = setInterval(oRT_TyRouteEachCountry.reloadSrcData, 3600000, null); //更新頻率1小時(60*60*1000)
            });

        }
    }
}

//交通損壞狀況  Ray
var oRT_RoadBroken;
function LoadRtRoadBroken(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_RoadBroken"; //客製化表單容器 ID
    var tbRTUI = "tbRoadBroken";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除DIV

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        oRT_RoadBroken = null;
        delete oRT_RoadBroken;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_RoadBroken != null && typeof (oRT_RoadBroken) != "undefined") {
            oRT_RoadBroken.Layer = layerRTUI;
            oRT_RoadBroken.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(650);
            $("#" + divOpenRTUI).height(460);
            $("#" + divOpenRTUI).offset({ top: 100, left: 50 });
            setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_RoadBroken.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });


                oRT_RoadBroken = new RT_RoadBroken();
                oRT_RoadBroken.FuncId = funcid;
                oRT_RoadBroken.FuncName = funcname;
                oRT_RoadBroken.Layer = layerRTUI;    //圖層
                oRT_RoadBroken.DivId = divOpenRTUI;  //DIV容器id
                oRT_RoadBroken.TableId = tbRTUI;     //表格id
                oRT_RoadBroken.RecId = "RoadBrokenRecord";   //表身id
                oRT_RoadBroken.TrPre = "trRoadBroken";       //資料TR id前置詞(for圖查文)
                oRT_RoadBroken.PtPre = "ptRoadBroken";    //圖點id前置詞
                oRT_RoadBroken.loadSrcData();
            });

        }
    }
}

//通訊損壞狀況  Ray
var oRT_NccComm;
function LoadNccComm(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_NccComm"; //客製化表單容器 ID
    var tbRTUI = "tbNccComm";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除DIV

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        oRT_NccComm = null;
        delete oRT_NccComm;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_NccComm != null && typeof (oRT_NccComm) != "undefined") {
            oRT_NccComm.Layer = layerRTUI;
            oRT_NccComm.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(650);
            $("#" + divOpenRTUI).height(460);
            $("#" + divOpenRTUI).offset({ top: 100, left: 50 });
            setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_NccComm.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                oRT_NccComm = new RT_NccComm();
                oRT_NccComm.FuncId = funcid;
                oRT_NccComm.FuncName = funcname;
                oRT_NccComm.Layer = layerRTUI;    //圖層
                oRT_NccComm.DivId = divOpenRTUI;  //DIV容器id
                oRT_NccComm.TableId = tbRTUI;     //表格id
                oRT_NccComm.RecId = "NccCommRecord";   //表身id
                oRT_NccComm.TrPre = "trNccComm";       //資料TR id前置詞(for圖查文)
                oRT_NccComm.PolyPre = "polyNccComm";    //圖點id前置詞
                oRT_NccComm.loadSrcData();
            });

        }
    }
}

//電力中斷  Ray
var oRT_PowerOutage;
function LoadPowerOutage(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_PowerOutage"; //客製化表單容器 ID
    var tbRTUI = "tbPowerOutage";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除DIV

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        oRT_PowerOutage = null;
        delete oRT_PowerOutage;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_PowerOutage != null && typeof (oRT_PowerOutage) != "undefined") {
            oRT_PowerOutage.Layer = layerRTUI;
            oRT_PowerOutage.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(500);
            $("#" + divOpenRTUI).height(500);
            $("#" + divOpenRTUI).offset({ top: 100, left: 50 });
            //$("#" + divOpenRTUI).css("display", "block");
            setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_PowerOutage.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });


                oRT_PowerOutage = new RT_PowerOutage();
                oRT_PowerOutage.FuncId = funcid;
                oRT_PowerOutage.FuncName = funcname;
                oRT_PowerOutage.Layer = layerRTUI;    //圖層
                oRT_PowerOutage.DivId = divOpenRTUI;  //DIV容器id
                oRT_PowerOutage.TableId = tbRTUI;     //表格id
                oRT_PowerOutage.RecId = "PowerOutageRecord";   //表身id
                oRT_PowerOutage.TrPre = "trPowerOutage";       //資料TR id前置詞(for圖查文)
                oRT_PowerOutage.PolyPre = "polyPowerOutage";    //圖點id前置詞
                oRT_PowerOutage.loadSrcData();
            });

        }
    }
}

//震央  //*// charlie
var oRT_EqDataSource;
function LoadEqDataSource(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_EqDataSource"; //客製化表單容器 ID
    var tbRTUI = "tbEqDataSource";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        map.infoWindow.hide();
        removeDiv(funcid, divOpenRTUI, ''); //移除DIV

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        oRT_EqDataSource = null;
        delete oRT_EqDataSource;

        return;
    }
    else {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        /*
        //變更底圖時,重新附加圖層
        if (oRT_EqDataSource != null && typeof (oRT_EqDataSource) != "undefined") {
            oRT_EqDataSource.Layer = layerRTUI;
            oRT_EqDataSource.reloadSrcData();
            return;
        }*/

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(300);
            $("#" + divOpenRTUI).height(440);
            $("#" + divOpenRTUI).offset({ top: 100, left: 50 });
            //$("#" + divOpenRTUI).css("display", "block");
            setFrmDfVisible(funcid, divOpenRTUI);

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_EqDataSource.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                oRT_EqDataSource = new RT_EqDataSource();
                oRT_EqDataSource.FuncId = funcid;
                oRT_EqDataSource.FuncName = funcname;
                oRT_EqDataSource.Layer = layerRTUI;    //圖層
                oRT_EqDataSource.DivId = divOpenRTUI;  //DIV容器id
                oRT_EqDataSource.TableId = tbRTUI;     //表格id
                oRT_EqDataSource.RecId = "EqDataSourceRecord";   //表身id
                oRT_EqDataSource.TrPre = "trEqDataSource";       //資料TR id前置詞(for圖查文)
                oRT_EqDataSource.PolyPre = "polyEqDataSource";    //圖點id前置詞
                oRT_EqDataSource.loadSrcData();
            });

        }
    }
}

//震度範圍@RealInfoDemo  Ray
function LoadPGA(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層

    UpdQFuncList(funcid, chked, layerid, "", "cbFuncRID"); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {
        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            map.removeLayer(layerRTUI);
        }
        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {

            showLoading();
            // 2015/7/7 修改震度範圍改接KMZ
            var PGACateId = getArryObj(oRealInfoDemo.LayerData, "ID", funcid).CateId;
            var PGAKMZ = getArryObj(oRealInfoDemo.RealInfoDemoCData, "CateId", PGACateId);
            var url = PGAKMZ.PictFile.replace('_p1.png', '.kmz');
            //console.log('震度範圍 = ' + url);

            layer = new esri.layers.KMLLayer(url, { id: layerid, outSR: new esri.SpatialReference(mapSpRef), "opacity": 1 });
            map.addLayer(layer);

            layer.on("load", function () { hideLoading(); });
            layer.on("error", function () {
                hideLoading();
                UpdQFuncList(funcid, false, "", ""); //更新圖例區
                $("#cbFunc" + funcid).attr("src", "images/FuncList/uncheck.png");
                alert(funcname + "資料載入失敗");
            });


            //var url = "http://61.56.4.39/arcgis/rest/services/NCDR_SDE_2014/NCDREQDASH_FS/FeatureServer/0";
            /*
            var url = gpEQFS + "/0" + (isToken == 'Y' ? ("?Token=" + gpNCDR_Token) : "");

            layerRTUI = new esri.layers.FeatureLayer(url, {
                id: layerid,
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND
            });
            var waitLoad = function () {
                if (layerRTUI.loaded) { //確認圖層已載入
                    layerRTUI.setDefinitionExpression("EventID = '" + oRealInfoDemo.CategoryData.EventID + "'");
                    map.addLayer(layerRTUI);
                    setLayerOpa(0.7, "FuncOpa" + funcid, layerid);
                    setLayerOpaImgSrc("FuncOpa" + funcid, 0.7)
                } else {
                    setTimeout(waitLoad, 300);
                }
            }
            waitLoad();
            */
            /*
            //V1版
            var url = gpNCDRLayersPolygon + (isToken == 'Y' ? ("?Token=" + gpNCDR_Token) : "");
            layerRTUI = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: layerid });

            var waitLoad = function () {
                if (layerRTUI.loaded) {//確認圖層已載入
                    var layerInfos = [];
                    var info;
                    layerInfos = layerRTUI.layerInfos;
                    for (var i in layerInfos) {
                        info = layerInfos[i];
                        if (info.name == funcname) {//使用圖層名稱比對
                            layerRTUI.setVisibleLayers([info.id]);
                            var layerDefinitions = [];
                            layerDefinitions[info.id] = "EventID='" + oRealInfoDemo.CategoryData.EventID + "'";
                            layerRTUI.setLayerDefinitions(layerDefinitions);
                            map.addLayer(layerRTUI);
                            break;
                        }
                    }
                    setLayerOpa(0.7, "FuncOpa" + funcid, layerid);
                    setLayerOpaImgSrc("FuncOpa" + funcid, 0.7)
                }
                else {
                    setTimeout(waitLoad, 300);
                }
            }
            waitLoad();
            */
        } else {
            map.removeLayer(layerRTUI);
        }
    }
}

//高鐵@RealInfoDemo  Ray
function LoadHSR(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層

    UpdQFuncList(funcid, chked, layerid, "", "cbFuncRID"); //更新圖例區
    //取消勾選時,移除layer
    if (!chked) {
        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }
        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
            oRealInfoDemo.addHSRLayer(getArryObj(arrFuncList, "ID", funcid), true, layerRTUI);
        } else {
            layerRTUI.clear();
        }
    }

}

//全台人口密度@RealInfoDemo  Ray
function LoadPopDensity(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層

    UpdQFuncList(funcid, chked, layerid, "", "cbFuncRID"); //更新圖例區
    //取消勾選時,移除layer
    if (!chked) {
        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            map.removeLayer(layerRTUI);
        }
        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {

            showLoading();
            // 2015/7/7 修改人口密度改接KMZ
            var PopCateId = getArryObj(oRealInfoDemo.LayerData, "ID", funcid).CateId;
            var PopKMZ = getArryObj(oRealInfoDemo.RealInfoDemoCData, "CateId", PopCateId);
            //var url = PopKMZ.PictFile.replace('_p1.png', '_pop_1.kmz'); // 2015/09/21 修改
            //console.log('人口密度 = ' + url);

            // 2015/09/21 修改
            var url = "GetData/funcWidget/getRealInfoData.ashx?Cmd=GetUrl&SUrl=" + PopKMZ.PictFile + "&UrlType=Pop";
            $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                cache: false,   //不允許快取   
                success: function (data) {
                    var PicUrl = '';
                    PicUrl = data.PicURL.toString();

                    layer = new esri.layers.KMLLayer(PicUrl, { id: layerid, outSR: new esri.SpatialReference(mapSpRef), "opacity": 1 });
                    map.addLayer(layer);

                    layer.on("load", function () { hideLoading(); });
                    layer.on("error", function () {
                        hideLoading();
                        UpdQFuncList(funcid, false, "", ""); //更新圖例區
                        $("#cbFunc" + funcid).attr("src", "images/FuncList/uncheck.png");
                        alert(funcname + "資料載入失敗");
                    });
                }
            });

        } else {
            map.removeLayer(layerRTUI);
        }
    }
}

//山崩風險@RealInfoDemo  Vicky add at 2014.11.25
function LoadLSRisk(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層
    UpdQFuncList(funcid, chked, layerid, "", "cbFuncRID"); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {
        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            map.removeLayer(layerRTUI);
        }
        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            //var url = "http://61.56.4.39/arcgis/rest/services/NCDR_SDE_2014/NCDREQDASH_FS/FeatureServer/2";
            var url = gpEQFS + "/2" + (isToken == 'Y' ? ("?Token=" + gpNCDR_Token) : "");

            layerRTUI = new esri.layers.FeatureLayer(url, {
                id: layerid,
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND
            });
            var waitLoad = function () {
                if (layerRTUI.loaded) { //確認圖層已載入
                    layerRTUI.setDefinitionExpression("EventID = '" + oRealInfoDemo.CategoryData.EventID + "'");
                    map.addLayer(layerRTUI);
                } else {
                    setTimeout(waitLoad, 300);
                }
            }
            waitLoad();
        } else {
            map.removeLayer(layerRTUI);
        }
    }
}

//山崩潛勢@RealInfoDemo  Engels 2015/09/21 增加山崩潛勢圖層(KMZ)
function LoadLandslide(funcid, funcname, chked, layerid) {
    var layerRTUI; //客製化圖層

    UpdQFuncList(funcid, chked, layerid, "", "cbFuncRID"); //更新圖例區
    //取消勾選時,移除layer
    if (!chked) {
        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            map.removeLayer(layerRTUI);
        }
        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {

            showLoading();

            var LandsCateId = getArryObj(oRealInfoDemo.LayerData, "ID", funcid).CateId;
            var LndKMZ = getArryObj(oRealInfoDemo.RealInfoDemoCData, "CateId", LandsCateId);

            var url = "GetData/funcWidget/getRealInfoData.ashx?Cmd=GetUrl&SUrl=" + LndKMZ.PictFile + "&UrlType=Lnd";
            $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                cache: false,   //不允許快取   
                success: function (data) {
                    var PicUrl = '';
                    PicUrl = data.PicURL.toString();

                    layer = new esri.layers.KMLLayer(PicUrl, { id: layerid, outSR: new esri.SpatialReference(mapSpRef), "opacity": 1 });
                    map.addLayer(layer);

                    layer.on("load", function () { hideLoading(); });
                    layer.on("error", function () {
                        hideLoading();
                        UpdQFuncList(funcid, false, "", ""); //更新圖例區
                        $("#cbFunc" + funcid).attr("src", "images/FuncList/uncheck.png");
                        alert(funcname + "資料載入失敗");
                    });
                }
            });

        } else {
            map.removeLayer(layerRTUI);
        }
    }
}

//地震剖面線段@RealInfoDemo  Engels 2015/12/10 增加地震剖面線段(KMZ)
function LoadSection(funcid, funcname, TiledMapUrl, chked, layerid) {
    var layerRTUI; //客製化圖層

    UpdQFuncList(funcid, chked, layerid, "", "cbFuncRID"); //更新圖例區
    //取消勾選時,移除layer
    if (!chked) {
        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            map.removeLayer(layerRTUI);
        }
        return;
    }
    else {
        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {

            showLoading();

            layer = new esri.layers.KMLLayer(TiledMapUrl, { id: layerid, outSR: new esri.SpatialReference(mapSpRef), "opacity": 1 });
            map.addLayer(layer);

            layer.on("load", function () { hideLoading(); });
            layer.on("error", function () {
                hideLoading();
                UpdQFuncList(funcid, false, "", ""); //更新圖例區
                $("#cbFunc" + funcid).attr("src", "images/FuncList/uncheck.png");
                alert(funcname + "資料載入失敗");
            });

        } else {
            map.removeLayer(layerRTUI);
        }
    }
}

// 災損圖層切換開關
var ort_SEDLE_REC = {};
function RtSEDLEswitch(funcid) {
    var prefix = '#liFunc';
}
// 社會經濟災損評估主題圖@Social Economic Disaster Losses Evaluate Theme : SEDLEvaTheme
// Martin 2016/08/01 : 參考河川水位 WraRiver
var timerSEDLE;
var oRT_SEDLE;
function LoadRtSEDLEvaTheme(funcid, funcname, chked, layerid) {
    // SEDLE 一般/警戒 版切換, 紀錄啟動資訊
    ort_SEDLE_REC[funcid] = chked;

    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_SEDLEvaTheme"; //客製化表單容器 ID
    var tbRTUI = "tbSEDLEvaTheme";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        map.infoWindow.hide();


        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        removeDiv(funcid, divOpenRTUI, ''); //移除表單
        // $(".viewRT_History[charttype=RT_WraRiverHistory]").remove(); //移除所有歷線圖

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //移除layer2b : 另一個功能獨立使用的圖層 : SEDLETab2b
        var layer = map.getLayer('SEDLETab2b');
        if (typeof (layer) != "undefined") {
            layer.clear();
            map.removeLayer(layer);
        }

        // 移除 tab2b 所用的 div
        $('#tab2bpt').remove();

        ////清除計時器
        //window.clearInterval(timerWraRiver);
        //timerWraRiver = null;
        //delete timerWraRiver;

        //oRT_SEDLE = null;
        //delete oRT_SEDLE;

        //return;
    }

    // 圖層勾選: init.
    if (chked) {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(410);
            $("#" + divOpenRTUI).height(470);
            $("#" + divOpenRTUI).offset({ top: 50, left: 100 });
            setFrmDfVisible(funcid, divOpenRTUI);

            // 2015/12/15 整合水文情資模板
            // $('head').append($('<script src="JS/RT_WraRiver.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_SEDLEvaTheme.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                // console.log({ 'FuncId': funcid, 'FuncName': funcname, 'layerRTUI': layerRTUI, 'divOpenRTUI': divOpenRTUI, 'tbRTUI': tbRTUI });

                oRT_SEDLE = new RT_SEDLEvaTheme();
                oRT_SEDLE.FuncId = funcid;
                oRT_SEDLE.FuncName = funcname;
                oRT_SEDLE.Layer = layerRTUI;          //圖層
                oRT_SEDLE.FrmBoxId = divOpenRTUI;     //表單容器id
                oRT_SEDLE.TableId = tbRTUI;           //表格id
                oRT_SEDLE.RecId = "SEDLEvaThemeRecord";   //表身id
                oRT_SEDLE.TrPre = "trSEDLEvaTheme";        //資料TR id前置詞(for圖查文)
                oRT_SEDLE.PtPre = "ptSEDLEvaTheme";         //圖點id前置詞

                oRT_SEDLE.loadSrcData();

            });

        }
    }
}

// 社會經濟災損評估主題圖, 警戒版@Social Economic Disaster Losses Evaluate Theme, Alert ver. : SEDLEvaThemeAlert
// Martin 2016/11/24 
var timerSEDLEAlert;
var oRT_SEDLE_ALERT;
function LoadRtSEDLEvaThemeAlert(funcid, funcname, chked, layerid) {
    // SEDLE 一般/警戒 版切換, 紀錄啟動資訊
    ort_SEDLE_REC[funcid] = chked;

    var layerRTUI; //客製化圖層
    var divOpenRTUI = "divRT_SEDLEvaThemeAlert"; //客製化表單容器 ID
    var tbRTUI = "tbSEDLEvaThemeAlert";          //客製化表單TABLE ID

    UpdQFuncList(funcid, chked, layerid, divOpenRTUI); //更新圖例區

    //取消勾選時,移除layer
    if (!chked) {

        map.infoWindow.hide();


        if ($("#" + tbRTUI).length > 0) {
            var datatables = $('#' + tbRTUI).dataTable();
            datatables.fnDestroy();
            RemoveTbFilter(tbRTUI); //移除資料表篩選條件
        }

        removeDiv(funcid, divOpenRTUI, ''); //移除表單
        // $(".viewRT_History[charttype=RT_WraRiverHistory]").remove(); //移除所有歷線圖

        //移除layer
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) != "undefined") {
            layerRTUI.clear();
            map.removeLayer(layerRTUI);
        }

        //移除layer2b : 另一個功能獨立使用的圖層 : SEDLETab2b
        var layer = map.getLayer('SEDLETab2bA');
        if (typeof (layer) != "undefined") {
            layer.clear();
            map.removeLayer(layer);
        }

        // 移除 tab2b 所用的 div
        $('#tab2bptA').remove();

        //清除計時器
        window.clearInterval(timerSEDLEAlert);
        timerSEDLEAlert = null;
        delete timerSEDLEAlert;

        oRT_SEDLE_ALERT = null;
        delete oRT_SEDLE_ALERT;

        return;
    }
    // if !checked

    // 圖層勾選: init.
    if (chked) {

        //初始化圖層
        layerRTUI = map.getLayer(layerid);
        if (typeof (layerRTUI) == "undefined") {
            layerRTUI = new esri.layers.GraphicsLayer({ id: layerid, "opacity": 1 });
            map.addLayer(layerRTUI);
        } else {
            layerRTUI.clear();
        }

        if ($("#" + divOpenRTUI).length == 0) $("#divMain").append("<div id = \"" + divOpenRTUI + "\" class=\"openRtuiDiv\" style=\"display:none\"></div>"); //創建客製化表單DIV
        if ($("#" + divOpenRTUI).length > 0) {

            $("#" + divOpenRTUI).draggable(); //添加拖曳事件

            //調整表單尺寸及位置
            $("#" + divOpenRTUI).width(410);
            $("#" + divOpenRTUI).height(470);
            $("#" + divOpenRTUI).offset({ top: 50, left: 100 });
            setFrmDfVisible(funcid, divOpenRTUI);

            // 2015/12/15 整合水文情資模板
            // $('head').append($('<script src="JS/RT_WraRiver.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

            //載入表身
            $("#" + divOpenRTUI).load("ucRTUI/RT_SEDLEvaThemeAlert.htm", function () {
                $("#" + divOpenRTUI + " .RtuiFrmClose").click(function () { switchFuncFrm(funcid, divOpenRTUI); });

                // console.log({ 'FuncId': funcid, 'FuncName': funcname, 'layerRTUI': layerRTUI, 'divOpenRTUI': divOpenRTUI, 'tbRTUI': tbRTUI });

                oRT_SEDLE_ALERT = new RT_SEDLEvaThemeAlert();
                oRT_SEDLE_ALERT.FuncId = funcid;
                oRT_SEDLE_ALERT.FuncName = funcname;
                oRT_SEDLE_ALERT.Layer = layerRTUI;          //圖層
                oRT_SEDLE_ALERT.FrmBoxId = divOpenRTUI;     //表單容器id
                oRT_SEDLE_ALERT.TableId = tbRTUI;           //表格id
                oRT_SEDLE_ALERT.RecId = "SEDLEvaThemeAlertRecord";   //表身id
                oRT_SEDLE_ALERT.TrPre = "trSEDLEvaThemeAlert";        //資料TR id前置詞(for圖查文)
                oRT_SEDLE_ALERT.PtPre = "ptSEDLEvaThemeAlert";         //圖點id前置詞

                oRT_SEDLE_ALERT.loadSrcData();

            });

        }
    }
}