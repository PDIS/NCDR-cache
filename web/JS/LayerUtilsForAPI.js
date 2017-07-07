/**********************************
 * SUMMARY ：功能列、圖層函式
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2013/06/26  Vicky Liang Create
 *           2016/07/06  Martin Hsieh : 圖例路徑(legend path) 改絕對 (於 config.js : gLegendPath )
             
 **********************************/


//功能選單函式************************************************************
//載入登入資訊
function getLogonInfo() {
    var url = "GetData/funcWidget/getLogonData.ashx?account=" + account + "&entry=" + entrysys;
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            oGrpInfo = data;
            arrToolbar = data.FuncRight;
            creatToolbar();

            //設定Banner圖片
            // 2015/01/12 修改
            if (oGrpInfo.IsLocalEdition == "N") {
                //$("#divTopBanner").css("background", "url(./images/banner.png) left top no-repeat");
                //$("#divTopBanner").css("background-color", "#B1D4DB");
            } else {
                //$("#divTopBanner").css("background", "url(./images/bannerLocal.png) left top no-repeat");
                //$("#divTopBanner").css("background-color", "#B1D4DB");

                //地方群組,初始定位至地方範圍
                if (oGrpInfo.CounL != "" && oGrpInfo.CounB != "" && oGrpInfo.CounR != "" && oGrpInfo.CounT != "") {
                    var extent = new esri.geometry.Extent(parseFloat(oGrpInfo.CounL), parseFloat(oGrpInfo.CounB), parseFloat(oGrpInfo.CounR), parseFloat(oGrpInfo.CounT), new esri.SpatialReference(mapSpRef)); //定位至地方範圍
                    map.setExtent(extent);
                }
            }

            //設定意見回饋
            if (surveyTarget.toUpperCase() != "NONE") {
                if (sysType.toUpperCase() == surveyTarget.toUpperCase() || surveyTarget.toUpperCase() == "ALL") {
                    $("#aSurvey").attr("href", surverUrl);
                    $("#aSurvey").show();
                }
            }
            else {
                $("#aSurvey").hide();
            }

            loadFuncList(); // 2015/06/23 修改成在載入登入資訊後再執行，避免預設書籤載入有問題
        }
    });
}

//取出版次資料 2015/01/12 修改
function getVerLogData() {
    var url = "GetData/funcWidget/getVerLogData.ashx";
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            VerLogData = data;

            //設定Banner版次
            $('#VerDesc').html('V' + VerLogData[0].VerNo);
        },
        error: function () {
            //當前網頁非入口網時, 才需提示訊息
            var currPage = document.location.pathname;
            var isPortal = false;
            if (currPage.indexOf("index.aspx") >= 0) isPortal = true;
            if (currPage.indexOf("index1.aspx") >= 0) isPortal = true; //第一版入口網
            if (!isPortal) {
                window.alert("您尚未登入系統，或已閒置太久未操作系統，請重新登入。");
            }

            window.location.href = 'index.aspx';
        }
    });
}

// 版次簡易介面的內容設定/顯示/隱藏 2015/01/12
function showVer() {

    if ($('#divVer').css('display') != 'block') {
        // 顯示
        $('#divVer').css('display', 'block');

        //設定內容 限制最新兩筆
        var outHtml = '';
        var vCnt = 1;
        outHtml += '<ol style="-webkit-padding-start: 25px;">';
        for (var Vr in VerLogData) {
            if (vCnt <= 2) {
                outHtml += '<li style="margin-bottom:20px">';
                outHtml += '<p style="line-height:22px;">V' + VerLogData[Vr]['VerNo'].toString() + ' (更新日期 ' + VerLogData[Vr]['UpdDate'].toString() + ') : <br/>' + VerLogData[Vr]['UpdDesc'].toString() + '</p>';
                outHtml += '</li>';
            }
            vCnt++;
        }

        outHtml += '</ol>';
        outHtml += '<div style="width:95%;text-align:right;margin-bottom:10px;"><a href="javascript: void(0)" style="text-decoration: none;" onclick="nVerWin()" >更多版次歷史訊息</a></div>';

        $('#divVerDesc').html(outHtml);
    } else
        $('#divVer').css('display', 'none');
}

function hideVer() {
    $('#divVer').css('display', 'none');
}

// 版次完整內容設定 2015/01/12
function nVerWin() {
    var w = window.open();

    //設定內容
    var outHtml = '';
    outHtml += '<ol style="-webkit-padding-start: 25px;">';
    for (var Vr in VerLogData) {
        outHtml += '<li style="margin-bottom:20px">';
        outHtml += '<p style="line-height:22px;">V' + VerLogData[Vr]['VerNo'].toString() + ' (更新日期 ' + VerLogData[Vr]['UpdDate'].toString() + ') : <br/>' + VerLogData[Vr]['UpdDesc'].toString() + '</p>';
        outHtml += '</li>';
    }

    outHtml += '</ol>';

    $(w.document.body).html(outHtml);
}

//設定瀏覽人數
var timerOnlineP;
function getOnlinePcnt() {
    clearTimeout(timerOnlineP); //清除定時器

    //var url = "GetData/funcWidget/getOnlineP.ashx";
    var url = "GetData/funcWidget/getOnlineP.aspx";
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            $("#spanOnlineP").html("線上人數：" + data.OnlineP + "&nbsp;人&nbsp;");
            timerOnlineP = setTimeout(getOnlinePcnt, 60000, null); //更新頻率1分鐘(1*60*1000)
        },
        error: function () {
            /* 錯誤就不要重Load了 2015/08/18
            clearTimeout(timerOnlineP); //清除定時器
            timerOnlineP = null;
            delete timerOnlineP;

            //當前網頁非入口網時, 才需提示訊息
            var currPage = document.location.pathname;
            var isPortal = false;
            if (currPage.indexOf("index.aspx") >= 0) isPortal = true;
            if (currPage.indexOf("index1.aspx") >= 0) isPortal = true; //第一版入口網
            if (!isPortal) {
                window.alert("您尚未登入系統，或已閒置太久未操作系統，請重新登入。");
            }

            window.location.href = 'index.aspx';
            */
        }
    });
}

//取出總瀏覽人次
function getBrowseCount() {
    var url = "GetData/funcWidget/getBrowseCount.ashx";
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            $("#imgBrowseCount").attr("title", "總瀏覽人數：" + data.BrowseCount + " (自2010/10/25起)");
        },
        error: function () { }
    });
}

//載入功能選單
function creatToolbar() {
    $.each(arrToolbar, function (i, item) {

        if (item.IsShow == "Y") {

            //產製主功能
            if (item.FuncEName == "TlTime") { //時間萬年曆
                //html = "<img id=\"img" + item.FuncEName + "\" src=\"" + item.FuncImg + "\" onclick=\"OpenTimeline()\" />";
                //$("#divTopBanner div:eq(0)").append(html);
                // 2015/07/22 修改
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);OpenTimeline();\" >時間萬年曆</div>";
                $("#divTopBannerTab").append(html);
            } else if (item.FuncEName == "TlRID") { //即時情資展示模版
                //html = "<img id=\"img" + item.FuncEName + "\" src=\"" + item.FuncImg + "\" title='地震儀表板' onclick=\"openRealInfoMenu()\" style=\"margin-left:5px;\" />" // 2015/01/12 修改
                //$("#divTopBanner div:eq(0)").append(html);
                // 2015/07/22 修改
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);openRealInfoMenu();\" >地震儀表版</div>";
                $("#divTopBannerTab").append(html);
            } else if (item.FuncEName == "TlPPT") { //簡報模版
                //html = "<img id=\"policyDecisionIMG\" src=\"" + item.FuncImg + "\" title='簡報模板' onclick=\"openPolicyDecision(this)\" style=\"margin-left:5px;\" />"; // 2015/01/12 修改
                //$("#divTopBanner div:eq(0)").append(html);
                // 2015/07/22 修改
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);openPolicyDecision(this);\" >簡報模版</div>";
                $("#divTopBannerTab").append(html);
            } else if (item.FuncEName == "TlJudge" && oGrpInfo.IsLocalEdition == "Y") { //情資研判 & 地方權限  //+// charlie
                //html = "<img id=\"img" + item.FuncEName + "\" title='情資研判文件' src=\"" + item.FuncImg + "\" onclick=\"OpenPdfList()\" style=\"margin-left:5px;\" />" // 2015/01/12 修改
                //$("#divTopBanner div:eq(0)").append(html);
                // 2015/07/22 修改
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);OpenPdfList();\" >情資研判</div>";
                $("#divTopBannerTab").append(html);
            } else if (item.FuncEName == "TlPlay") { //播放清單
                //html = "<img id=\"img" + item.FuncEName + "\" src=\"" + item.FuncImg + "\" title='時序性圖片播放器' onclick=\"OpenPlayList()\" style=\"margin-left:5px;\" />" // 2015/01/12 修改
                //$("#divTopBanner div:eq(0)").append(html);
                // 2015/07/22 修改
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);OpenPlayList();\" >時序性圖片播放器</div>";
                $("#divTopBannerTab").append(html);
            }
            //@JG20150306
            else if (item.FuncEName == "DsWater") { //水文情資模板
                //html = "<img id=\"img" + item.FuncEName + "\" src=\"" + item.FuncImg + "\" title='水文情資模板' onclick=\"OpenDsWater()\" style=\"margin-left:5px;\" />";
                //$("#divTopBanner div:eq(0)").append(html);
                // 2015/07/22 修改
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);OpenDsWater();\" >水文監控儀表板</div>";
                $("#divTopBannerTab").append(html);
            }
            else if (item.FuncEName == "FloodingPredict") {    //淹水兵棋台 @20160314 Andy
                html = "<div class=\"divTopBannerTabDiv\" onclick=\"setDivTopBannerTab(this);OpenFloodingPredict('" + item.FuncEName + "');\" >低窪模擬兵棋台</div>";
                $("#divTopBannerTab").append(html);
            }
            //@JG20150306
            else { //左方主功能列

                if (item.FuncEName != "TlJudge" && item.FuncEName != "policyDecisionIMG") {
                    html = "<img id=\"img" + item.FuncEName + "\" src=\"" + item.FuncImg + "\" title=\"" + item.FuncName + "\" onclick=\"openSubTool(event, '" + item.FuncEName + "', '" + item.FuncId + "')\" style=\"padding-bottom:5px;\" />"; // 2015/01/12 修改
                    $("#divMainTool").append(html);
                }
                //html = "<img id=\"img" + item.FuncEName + "\" src=\"" + item.FuncImg + "\" title=\"" + item.FuncName + "\" onclick=\"openSubTool(event, '" + item.FuncEName + "', '" + item.FuncId + "')\" />";
                //$("#divMainTool").append(html);
            }

            //產製子功能
            $.each(item.SubFuncs, function (j, subitem) {

                if (subitem.IsShow == "Y") {
                    switch (item.FuncEName) {
                        case "TlFunc": //圖層工具
                            // 2015/01/12 修改不用iocn用文字當按鈕
                            //html = "<img id=\"img" + subitem.FuncEName + "\" src=\"" + subitem.FuncImg + "\" alt=\"" + subitem.FuncName + "\" onclick=\"OpenFuncList(event, '" + subitem.FuncEName + "', '" + subitem.FuncId + "')\" />";
                            html = "<div id=\"img" + subitem.FuncEName + "\" style=\"background-color:#FFF;Color:#0084AD;width:45px;height:30px;font-family:微軟正黑體;font-size:14px;text-align:center;padding-top:5px;cursor:pointer;\" ";
                            html += "onclick=\"OpenFuncList(event, '" + subitem.FuncEName + "', '" + subitem.FuncId + "')\" >" + subitem.FuncName.replace('圖層', '') + "</div>";
                            $("#divFuncType").append(html);
                            break;
                        case "TlBmk": //書籤工具
                            //$("#divBmkTool").show();
                            break;
                        case "TlDraw": //畫家工具
                            //$("#divDrawTool").show();
                            break;
                        case "TlLoc": //定位工具
                            // 2015/01/12 修改不用iocn用文字當按鈕
                            //html = "<img id=\"img" + subitem.FuncEName + "\" class=\"LocTool\" src=\"" + subitem.FuncImg + "\" alt=\"" + subitem.FuncName + "\" toolid='" + subitem.FuncId + "' />";
                            html = "<div id=\"img" + subitem.FuncEName + "\" class=\"LocTool\" style=\"background-color:#FFF;Color:#0084AD;width:45px;height:30px;font-family:微軟正黑體;font-size:14px;text-align:center;padding-top:5px;cursor:pointer;\" ";
                            html += "toolid='" + subitem.FuncId + "' >" + subitem.FuncName.replace('定位', '') + "</div>";
                            $("#divLocTool").append(html);
                            break;
                        case "TlMap": //地圖工具
                            // 2015/01/12 修改不用iocn用文字當按鈕
                            //html = "<img id=\"imgMT" + j + "\" class=\"MapTool\" src=\"" + subitem.FuncImg + "\" alt=\"" + subitem.FuncName + "\" onclick=\"openMapTool(event, '" + subitem.FuncEName + "','" + subitem.FuncId + "')\" />";
                            var showWord = '';
                            switch (subitem.FuncName) {
                                case "圖資查詢":
                                    showWord = '圖層';
                                    break;
                                case "雷達雨量站降雨整合估計資料":
                                    showWord = '雨量';
                                    break;
                                case "距離測量":
                                    showWord = '距離';
                                    break;
                                case "面積測量":
                                    showWord = '面積';
                                    break;
                                case "地形資料查詢":
                                    showWord = '地形';
                                    break;
                                case "地形剖面線分析":
                                    showWord = '剖面';
                                    break;
                                case "街景圖查詢":
                                    showWord = '街景';
                                    break;
                                case "區域統計分析":
                                    showWord = '環域';
                                    break;
                                case "影像比對":
                                    showWord = '比對';
                                    break;
                                case "路徑規劃": // 2015/05/25 修改
                                    showWord = '路徑';
                                    break;
                                case "淹水查詢": // 2016/3/14 Kevin 新增淹水功能
                                    showWord = '淹水';
                                    break;
                            }
                            
                            html = "<div id=\"imgMT" + j + "\" class=\"MapTool\" style=\"background-color:#FFF;Color:#0084AD;width:45px;height:30px;font-family:微軟正黑體;font-size:14px;text-align:center;padding-top:5px;cursor:pointer;\" ";
                            html += "onclick=\"openMapTool(event, '" + subitem.FuncEName + "','" + subitem.FuncId + "')\" >" + showWord + "</div>";
                            $("#divMapTool").append(html);
                            break;
                        case "TlEvt": //事件工具
                            //$("#divEvtTool").show();
                            break;
                    }
                }
            });

            if (item.FuncEName == "TlFunc") {
                //加入圖例鈕
                html = "<img id=\"imgLegend\" src=\"images/FuncList/layerIcon_off-10.png\" title=\"開啟圖例\" onclick=\"$('#divFuncLegend').show()\" />";
                $("#divFuncType").append(html);
            }
        }
    });

    //@JG20150306
    // 2015/01/12 修改
    //html = "<div style=\"height:50px;width:40px;display:inline-block;\"><img id=\"optchang\" src=\"images/Toolbar/opt_chang.png\" onclick=\"changeOption();\" />";
    //html += "<img id=\"imgToolOpt\" src=\"images/Toolbar/mainIcon_menu.png\" style=\"margin-top:-4px;\" onclick=\"closeAllopt();\" /></div>";
    html = "<div style=\"min-width:40px;max-width:15%;display:inline-block;\">" +
           "<img id=\"optchang\" src=\"images/Toolbar/opt_chang.png\" onclick=\"changeOption();\" style='width:100%'/>" +
           "<img id=\"imgToolOpt\" src=\"images/Toolbar/mainIcon_menu.png\" style=\"width:100%;margin-top:-4px;\" onclick=\"closeAllopt();\" /></div>";
    //@JG20150306
    //$("#divMainTool").html(html + '<div id="MainMenu" style="width:84%;display:inline-block;">' + $("#divMainTool").html() + '</div>');
    $("#divMainTool").html(html + '<div id="MainMenu" style="display:inline-block;">' + $("#divMainTool").html() + '</div>');

    // 2015/01/12 修改，依照功能選單數量設定長度
    var divToolbarWidth = $('#MainMenu img').length * 36 + 40;
    $('#divToolbar').animate({ width: divToolbarWidth + 'px' }, 800, function () {
        $('#MainMenu').css('display', 'inline-block');
    });

    //加入重整鈕
    //html = "<img id=\"imgRefresh\" src=\"images/Toolbar/refresh.png\" style=\"padding:30px 0px 0px 7px\" title=\"重整頁面\" onclick=\"window.location.href=window.location.href\" />";
    //$("#divMainTool").append(html); // 2015/01/12

    // 2015/07/22 修改
    window.onresize = resetTab;
    html = "<img id=\"SubTabBnrPrev\" src=\"images/widgetBookMark/left.png\" style=\"vertical-align: middle;padding-right: 10px; cursor:pointer; margin-left:5px; \" />";
    html += "<img id=\"SubTabBnrNext\" src=\"images/widgetBookMark/right.png\" style=\"vertical-align: middle;padding-right: 10px; cursor:pointer; margin-left:5px; \"  />";
    $("#divTopBannerTab").append(html);
    resetTab();
    setDivTopBannerTab($('#divTopBannerTab div:eq(0)'));

    //載入淹水計算Module @20160318 Andy
    $('head').append($('<script src="JS/FloodingPredict/FldPrt.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));
    oModfldPrt = new FldPrt();
    $('head').append($('<link rel="stylesheet" type="text/css" href="JS/FloodingPredict/FldPrt.css?v=' + Math.floor(Math.random() * 1E6 + 1) + '">'));
}

// 2015/07/22 修改 Start
function setDivTopBannerTab(obj) {
    $('#divTopBannerTab div').removeClass('divTopBannerTabClick');
    $(obj).toggleClass('divTopBannerTabClick');
}

function setDivTopBannerMapTab() {
    if ($('#divPlayList').css('display') != 'none')
        $('#divPlayList').hide();

    if ($('#divPdfList').css('display') != 'none')
        $('#divPdfList').hide();
}

function resetTab(event) {
    $("#SubTabBnrPrev").hide();
    $("#SubTabBnrNext").hide();
    var winW = $(window).width();
    // var winW = 300; test
    var subTabWidth = 150; //功能頁籤寬度
    var totCount = $("#divTopBannerTab div").length; //總數量
    var showCount = Math.floor((winW - 30) / (subTabWidth + 4)); //可顯示數量
    var idxStart = 0;
    var idxEnd = (showCount - 1);
    if ((totCount * subTabWidth) > winW) {
        $("#SubTabBnrNext").show();
        $("#divTopBannerTab div:lt(" + (showCount) + ")").show();
        $("#divTopBannerTab div:gt(" + (showCount - 1) + ")").hide();
    }
    else {
        $("#divTopBannerTab div:lt(" + (showCount) + ")").show(); 
    }

    //bind event
    $("#SubTabBnrNext").unbind("click").bind("click", function () {
        if (idxStart >= 0 && idxEnd < totCount) {
            $("#SubTabBnrPrev").show();
            idxStart += 1;
            idxEnd += 1;
        }
        $("#divTopBannerTab div:lt(" + idxStart + ")").hide();
        $("#divTopBannerTab div:eq(" + idxEnd + ")").show();
        $("#divTopBannerTab div:gt(" + idxEnd + ")").hide();

        if (idxEnd == (totCount - 1)) {
            $("#SubTabBnrNext").hide();
        }
    });
    $("#SubTabBnrPrev").unbind("click").bind("click", function () {
        idxStart -= 1;
        idxEnd -= 1;
        $("#divTopBannerTab div:gt(" + idxEnd + ")").hide();
        $("#divTopBannerTab div:eq(" + idxStart + ")").show();
        $("#divTopBannerTab div:lt(" + idxStart + ")").hide();

        if (idxStart == 0) {
            $("#SubTabBnrPrev").hide();
        }
        if (idxEnd < (totCount - 1)) {
            $("#SubTabBnrNext").show();
        }

    });
}

// 2015/07/22 修改 End


//淹水兵棋台 @20160314 Andy
function OpenFloodingPredict(funcName) {
    //$(window).on('resize', function () {
    //    if (bigger && bigger.autoBiggerRezise()) {
    //        bigger.CDivResize('auto');
    //    }
    //});
    
    $('#divMapTool div:contains("淹水")').show();//@2016/3/15 Kevin 進入淹水兵棋台後再秀淹水按鈕
    isInFldPrt = "Y";
    //$('head').append($('<script src="JS/FloodingPredict/FldPrt.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

    //oModfldPrt = new FldPrt();
    oModfldPrt.init();
    oModfldPrt.initFldPrtProj();

    //$('head').append($('<link rel="stylesheet" type="text/css" href="JS/FloodingPredict/FldPrt.css?v=' + Math.floor(Math.random() * 1E6 + 1) + '">'));
}
//@2016/03/16 點選避難收容統計(環域)頁籤之事件 Kevin
function OpenAreaAnalysis() {
    //debugger;
    map.infoWindow.hide();
    map.graphics.clear();
    dojo.disconnect(fldClickHandler);
    oModfldPrt.DisConnRoadAnaClick();
    oModfldPrt.removeFldPrtLayer("graLayer_effectPopu");
    oModfldPrt.removeFldPrtLayer("graLayer_procObj");
    //加上環域buffer、定位用到之layer並重新排序
    /*var layer = map.getLayer("lyrIdentify");
    if (typeof (oMapQry.Layer) != "undefined") {
        map.addLayer(oMapQry.Layer);
    }*/
    if (typeof (oMapQry.Layer) != "undefined") {
        map.addLayer(oMapQry.Layer);
        map.reorderLayer(oMapQry.Layer, 100);
        var fastLoclayer = map.getLayer("layerFastLoc");
        map.reorderLayer(fastLoclayer, 500);
    }
    var layer = map.getLayer("feaLayer_censusBlock");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    $('#EffectedPopulation').hide();
    $('#ProcTarget').hide();
    $('#roadAnalysisDiv').hide();
    $('#AreaAnalysisMapList').show();
    $('#RT_AreaAnalysisResult').show();
    $('#divMapTool').show();
    $('#divSubToolbar').show();
    $('#divMapTool').children().show();
    $('#ProcAreaAnalysis').css("background-color", "#3FADFA").siblings().css("background-color", "#FFF");
    $('#ProcAreaAnalysis').css("text-decoration", "underline").siblings().css("text-decoration", "none");
    $('#ProcAreaAnalysis').css("color", "#FFF").siblings().css("color", "black");
    $('#divMapTool div:contains("環域")').click();
    $('div.divTopBannerTabDiv').unbind("mouseenter mouseleave");
    $('#ProcAreaAnalysis').siblings().hover(function () {
        $(this).css("background-color", "#3FADFA");
        $(this).css("text-decoration", "underline");
        $(this).css("color", "#FFF");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    }, function () {
        $(this).css("background-color", "#FFF");
        $(this).css("text-decoration", "none");
        $(this).css("color", "#404040");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    });
}
//@2016/03/18 點選淹水範圍模擬頁籤之事件 Kevin
function OpenFldSimulate() {
    //debugger;
    map.infoWindow.hide();
    map.graphics.clear();
    isInFldPrt = "Y";
    oModfldPrt.ClearData();
    oModfldPrt.DisConnRoadAnaClick();
    if ($("#imgTlMap").attr('src').toLowerCase().indexOf('_on') == -1) {
        $('#imgTlMap').click();
    }
    $('#divMapTool').show();
    $('#divSubToolbar').show();
    $('#divMapTool').children().show();
    $('#divMapTool div:contains("淹水")').click();
    //移除環域buffer用到之layer
    var layer = map.getLayer("lyrIdentify");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    layer = map.getLayer("feaLayer_censusBlock");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    $('#RT_AreaAnalysisResult').hide();
    $('#roadAnalysisDiv').hide();
    $('#FldSimulate').css("background-color", "#3FADFA").siblings().css("background-color", "#FFF");
    $('#FldSimulate').css("text-decoration", "underline").siblings().css("text-decoration", "none");
    $('#FldSimulate').css("color", "#FFF").siblings().css("color", "black");
    $('div.divTopBannerTabDiv').unbind("mouseenter mouseleave");
    $('#FldSimulate').siblings().hover(function () {
        $(this).css("background-color", "#3FADFA");
        $(this).css("text-decoration", "underline");
        $(this).css("color", "#FFF");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    }, function () {       
        $(this).css("background-color", "#FFF");
        $(this).css("text-decoration", "none");
        $(this).css("color", "#404040");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    });
    
}
//@2016/03/21 點選受影響人口統計頁籤之事件 Kevin
function OpenPopuStat() {
    map.infoWindow.hide();
    map.graphics.clear();
    isInFldPrt = "Y";    
    //移除環域buffer用到之layer
    var layer = map.getLayer("lyrIdentify");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    layer = map.getLayer("feaLayer_censusBlock");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    oModfldPrt.removeFldPrtLayer("graLayer_procObj");
    //$("#RT_AreaAnalysis").empty();
    oModfldPrt.DisConnRoadAnaClick();
    dojo.disconnect(fldClickHandler);
    $('#AreaAnalysisMapList').hide();
    $('#RT_AreaAnalysisResult').hide();
    $('#roadAnalysisDiv').hide();
    //$('#MapListDiv').html('');    
    $('#EffectedPopulation').show();
    $('#EffectPopuAnalysis').css("background-color", "#3FADFA").siblings().css("background-color", "#FFF");
    $('#EffectPopuAnalysis').css("text-decoration", "underline").siblings().css("text-decoration", "none");
    $('#EffectPopuAnalysis').css("color", "#FFF").siblings().css("color", "black");
    $("#divSubToolbar").hide();
    $("#divSubToolbar div:gt(0)").hide();
    setFuncDivInitVisible();
    $('#ProcTarget').hide();
    //oModfldPrt.CalEffectPopulation();
    oModfldPrt.AddEffectPopuLayer();
    $('div.divTopBannerTabDiv').unbind("mouseenter mouseleave");
    $('#EffectPopuAnalysis').siblings().hover(function () {
        $(this).css("background-color", "#3FADFA");
        $(this).css("text-decoration", "underline");
        $(this).css("color", "#FFF");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    }, function () {
        $(this).css("background-color", "#FFF");
        $(this).css("text-decoration", "none");
        $(this).css("color", "#404040");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    });
}
//@2016/03/21 點選受影響保全對象統計頁籤之事件 Kevin
function OpenProcObjStat() {
    map.infoWindow.hide();
    map.graphics.clear();
    dojo.disconnect(fldClickHandler);
    oModfldPrt.DisConnRoadAnaClick();
    var layer = map.getLayer("lyrIdentify");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    layer = map.getLayer("feaLayer_censusBlock");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    oModfldPrt.removeFldPrtLayer("graLayer_effectPopu");
    $('#AreaAnalysisMapList').hide();
    $('#RT_AreaAnalysisResult').hide();
    $('#roadAnalysisDiv').hide();
    $('#ProcTarget').show();
    $('#ProcObjStat').css("background-color", "#3FADFA").siblings().css("background-color", "#FFF");
    $('#ProcObjStat').css("text-decoration", "underline").siblings().css("text-decoration", "none");
    $('#ProcObjStat').css("color", "#FFF").siblings().css("color", "black");
    $("#divSubToolbar").hide();
    $("#divSubToolbar div:gt(0)").hide();
    setFuncDivInitVisible();
    $('#EffectedPopulation').hide();
    oModfldPrt.AddProcObjLayer();
    $('div.divTopBannerTabDiv').unbind("mouseenter mouseleave");
    $('#ProcObjStat').siblings().hover(function () {
        $(this).css("background-color", "#3FADFA");
        $(this).css("text-decoration", "underline");
        $(this).css("color", "#FFF");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    }, function () {
        $(this).css("background-color", "#FFF");
        $(this).css("text-decoration", "none");
        $(this).css("color", "#404040");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    });
}

//路網分析
function OpenRoadAna() {
    debugger;
    map.infoWindow.hide();
    dojo.disconnect(fldClickHandler);
    var layer = map.getLayer("lyrIdentify");
    if (typeof (layer) != "undefined") {
        map.removeLayer(layer);
    }
    oModfldPrt.removeFldPrtLayer("graLayer_effectPopu");
    oModfldPrt.removeFldPrtLayer("graLayer_procObj");
    $('#AreaAnalysisMapList').hide();
    $('#RT_AreaAnalysisResult').hide();
    $('.fldPrtFuncDiv').show();
    $('#roadAnalysis').css("background-color", "#3FADFA").siblings().css("background-color", "#FFF");
    $('#roadAnalysis').css("text-decoration", "underline").siblings().css("text-decoration", "none");
    $('#roadAnalysis').css("color", "#FFF").siblings().css("color", "black");
    $("#divSubToolbar").hide();
    $("#divSubToolbar div:gt(0)").hide();
    setFuncDivInitVisible();
    $('#EffectedPopulation').hide();
    //oModfldPrt.AddProcObjLayer();
    $('div.divTopBannerTabDiv').unbind("mouseenter mouseleave");

    oModfldPrt.OpenRoadAnalysis();    
    oModfldPrt.AddCensusLayer();
    $('#roadAnalysis').siblings().hover(function () {
        $(this).css("background-color", "#3FADFA");
        $(this).css("text-decoration", "underline");
        $(this).css("color", "#FFF");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    }, function () {
        $(this).css("background-color", "#FFF");
        $(this).css("text-decoration", "none");
        $(this).css("color", "#404040");
        //$('#divTopBannerTab div').addClass('divTopBannerTabDisabled');
    });
}

//@JG20150306
function OpenDsWater() {
    $(window).on('resize', function () {
        if (bigger && bigger.autoBiggerRezise()) {
            bigger.CDivResize('auto');
        }
    });

    //@JG
    $('head').append($('<script src="JS/WraInfo/WraInfo.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));

    wraInfo = new WraInfo();
    wraInfo.init();
    wraInfo.opennewprj();

    $('head').append($('<link rel="stylesheet" type="text/css" href="JS/WraInfo/wrainfo.css?v=' + Math.floor(Math.random() * 1E6 + 1) + '">'));
}
//@JG20150306


// 2015/01/12 修改 start
function closeAllopt() {
    if ($('#MainMenu').css('display') == 'none') {
        var divToolbarWidth = $('#MainMenu img').length * 36 + 40;
        $('#divToolbar').animate({ width: divToolbarWidth + 'px' }, 800, function () {
            $('#MainMenu').css('display', 'inline-block');
        });
    } else {
        $('#divTimeline').hide();
        $('#divTimeAxis').hide();
        $('#divMapPainter').css('display', 'none');
        $("#ToolsDiv").css('width', '40px');
        $("#ToolsDiv").hide();
        $("#divSubToolbar").hide();
        setFuncDivInitVisible();
        $('#MainMenu').css('display', 'none');
        $('#divToolbar').animate({ width: "40px" }, 800);
        $('#MainMenu').find("img").attr("src", function () {
            return this.src.replace("_on", "_off")
        });
    }

}

// 功能選單與比例尺位置 換左右位置
function changeOption() {
    if (pstionFlg == 'L') {
        $("#divScale").css({
            "left": "10px", "right": "auto"
        });
        $("#divToolbar").css({ "left": "auto", "right": "0px" });
        $("#ToolsDiv").css({ "left": "auto", "right": "5px" });
        $("#divBmkTool").css({ "left": "auto", "right": "5px" });
        $("#divMapPainter").css({ "left": "auto", "right": "5px" });
        pstionFlg = 'R';
    } else if (pstionFlg == 'R') {
        $("#divScale").css({
            "left": "auto", "right": "10px"
        });
        $("#divToolbar").css({
            "left": "0px", "right": "auto"
        });
        $("#ToolsDiv").css({
            "left": "40px", "right": "auto"
        });
        $("#divBmkTool").css({
            "left": "40px", "right": "auto"
        });
        $("#divMapPainter").css({
            "left": "45px", "right": "auto"
        });
        pstionFlg = 'L';
    }
}
// 2015/01/12 修改 end

//設定功能選單初始顯示狀態
function setFuncDivInitVisible() {
    $("#divFuncList").hide();
    $("#divBmkTool").hide();
    $("#divBmkTitle").hide();
    $("#divEditBmk").hide();
    $("#divRemoteList").hide();  //+// charlie
    $("#divWMSList").hide();  //+// charlie
    $("#divEventPictQry").hide();
    $("#divMapToolArea").hide();
    $("#divFastLoc").hide();

    $("#FuncNav").hide();
    $("#MapBgNav").hide();
    if ($("#RealInfoDemoFuncNav").length > 0) $("#RealInfoDemoFuncNav").hide();

    //$('.swipe-control').css('display', 'none'); // 2015/01/12 修改，非影像比對功能開啟時，要關閉影像比度視窗 // 2015/12/08 整合影像比對，關閉影像比對工具
}

//開啟子功能列
var BmkGrpList = new Object(); // 2015/02/10 修改，書籤群組清單
function openSubTool(event, type, toolid) {

    curExecTool = toolid; //記錄點擊功能ID

    //初始狀態
    //$("#divSubToolbar").hide();
    //$("#divSubToolbar div:gt(0)").hide();
    // 2015/01/12 修改，畫家開啟後不關閉其他主選單功能
    // 2015/08/06 修改，畫家開啟後，有些Banner會消失問題
    if (type != 'TlDraw') 
    {
        $("#divSubToolbar").hide();
        $("#divSubToolbar div:gt(0)").hide();
        setFuncDivInitVisible();
    }

    //關閉地圖量測繪圖工具
    if (typeof (oMapQry) != "undefined") {
        if (isInFldPrt != "Y") {//@2016/03/29 Kevin 淹水兵棋台內切換頁籤時，不把環域分析紀錄清掉
            oMapQry.disposeMapQry();
        }
    }

        // 2015/12/08 整合影像比對，關閉影像比對工具(圖層、工具、事件不關閉)
        if (type != "TlFunc" && type != "TlMap" && type != "TlEvt") {
            $('.swipe-control').css('display', 'none'); //非影像比對功能開啟時，要關閉影像比度視窗

        if (typeof (swipeTool) != 'undefined') {
            $('#swipe-leg').hide();
            $('.swipe-control').css('display', 'none');
            $("#MapToolType").click();
    }
    }

    //重設圖片
    var evt = event ? event: (window.event ? window.event: null);
    var obj = evt.srcElement ? evt.srcElement: evt.target;
        //$(obj.parentElement).find("img").attr("src", function () { return this.src.replace("_on", "_off") }); // 2015/01/12 修改
        //$(obj).attr("src", function () { return this.src.replace("_off", "_on") }); // 2015/01/12 修改
        dojo.disconnect(fldClickHandler);
        switch (type) {
            case "TlFunc": //圖層工具
            // 2015/01/12 修改
            if ($("#imgTlFunc").attr('src').toLowerCase().indexOf('_on') != -1) {
                $("#ToolsDiv").hide().css('width', '0px');
                $('#divSubToolbar').hide();
                $("#divFuncType").hide();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
            });
            } else {
                $("#ToolsDiv").show().css('width', '45px');
                $('#divSubToolbar').show();
                $("#divFuncType").show();
                $("#divFuncType div").show();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
            });
                $(obj).attr("src", function () {
                    return this.src.replace("_off", "_on")
            });
                $("#divFuncType div:eq(0)").click(); //預設開啟第一個選單

        }
                break;

            case "TlBmk": //書籤工具
                    // 2015/01/12 修改
                    if ($("#imgTlBmk").attr('src').toLowerCase().indexOf('_on') != -1) {
                $("#ToolsDiv").hide();
                $("#divBmkTool").hide();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                    }
                    else {
                $("#ToolsDiv").show();
                $("#divBmkTool").show();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                $(obj).attr("src", function () {
                    return this.src.replace("_off", "_on")
                    });

                        getBmkGrpList();  // 取得書籤群組清單 2015/02/10 修改

                        //載入書籤資料
                if (typeof (oBookmark) == "undefined") {
                    $("#divBmkTool").load("ucWidget/Bookmark.htm", function () {
                        oBookmark = new Bookmark();
                        oBookmark.account = account;
                        oBookmark.loadBmkList("S", null);
                });
                    }
                }
                break;

            case "TlDraw": //畫家工具
                    // 2015/01/12 修改
                    if ($("#imgTlDraw").attr('src').toLowerCase().indexOf('_on') != -1) {
                $('.MapPainterClose').click();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                    }
                    else {
                $("#divMapPainter").show();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                $(obj).attr("src", function () {
                    return this.src.replace("_off", "_on")
                    });

                if (typeof (oMapPainter) == "undefined") {
                    //$("#divMapPainter").load("ucWidget/MapPainter.htm?v=" + Math.floor(Math.random() * 1E6 + 1), function () {
                    $("#divMapPainter").load("JS/MapPainter/MapPainter.htm?v=" +Math.floor(Math.random() * 1E6 +1), function () {

                        //建立畫布圖層
                        layerMapPainter = map.getLayer("layerMapPainter");
                        if (typeof (layerMapPainter) == "undefined") {
                            layerMapPainter = new esri.layers.GraphicsLayer({ id: "layerMapPainter", "opacity": 1
                        });
                            map.addLayer(layerMapPainter);
                    }

                        oMapPainter = new MapPainter();
                        oMapPainter.account = account;
                        oMapPainter.Layer = layerMapPainter;
                        oMapPainter.loadMptList();
                });
                } else {
                    //@JG20150423*/判斷書籤開啟畫布的狀況下，不重置畫布
                    if (oMapPainter.Layer.graphics.length > 0 && $("#selMptList").val() != '-1') {
                    } else {
                        oMapPainter.reopenMapPainter();
                }
                    }
                }
                break;

            case "TlLoc": //定位工具
                    // 2015/01/12 修改
                    if ($("#imgTlLoc").attr('src').toLowerCase().indexOf('_on') != -1) {

                $("#ToolsDiv").hide().css('width', '0px');
                $("#divSubToolbar").hide();
                $("#divLocTool").hide();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                    }
                    else {
                $("#ToolsDiv").show().css('width', '45px');
                $("#divSubToolbar").show();
                $("#divLocTool").show();
                $("#divLocTool div").show();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                $(obj).attr("src", function () {
                    return this.src.replace("_off", "_on")
                    });


                $("#FastLocPart").empty();//2016.03.14 Kevin 清除淹水兵棋台已載入的FastLoc.htm,避免控制項重複 

                    $("#divFastLoc").load("ucWidget/FastLoc.htm", function () {
                        $("#divFastLoc #LocAddressContent").show();
                        $("#divFastLoc #LocXYContent").show();
                        //*// 建立定位圖層 START
                        layerFastLoc = map.getLayer("layerFastLoc");
                        if (typeof (layerFastLoc) == "undefined") {
                            layerFastLoc = new esri.layers.GraphicsLayer({ id: "layerFastLoc", "opacity": 1
                        });
                            map.addLayer(layerFastLoc);
                    }

                        //*// 建立定位圖層 END
                        if (typeof (oFastLoc) == "undefined") {
                        oFastLoc = new FastLoc();
                        oFastLoc.initFastLoc();
                        oFastLoc.Layer = layerFastLoc;
                        } else { oFastLoc.initFastLoc();
                    }

                    });

                        //else {
                        //*// 2014.01.07 charlie 判斷定位子功能是否被點開過

                        /*if (oFastLoc.btnOnClick == "Y") {
                        //$("#divFastLoc").show();
                        $('#ToolsDiv').css('width', '292px'); // 2015/01/12 修改
                        $('#ListBanner').css('display', 'block'); // 2015/01/12 修改
                        $("#divFastLoc").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
                        }*/

                        //}

                setTimeout(function () { $("#divLocTool div:eq(0)").click();
                    }, 500); //預設開啟第一個選單
                }
                break;

            case "TlMap": //地圖工具
                    // 2015/01/12 修改
                    if ($("#imgTlMap").attr('src').toLowerCase().indexOf('_on') != -1) {
                $("#ToolsDiv").hide()
                $("#divSubToolbar").hide();
                $("#divMapTool").hide();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                    }
                    else {
                $("#ToolsDiv").show();
                $("#divSubToolbar").show();
                $("#divMapTool").show();
                $("#divMapTool div").show();
                $("#divFastLoc").empty();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                $(obj).attr("src", function () {
                    return this.src.replace("_off", "_on")
                    });

                if (typeof (swipeTool) == 'undefined') { // 2015/12/08 整合影像比對：為了讓操作更順暢的特例判斷
                    $("#divMapTool div:eq(0)").click(); //預設開啟第一個選單
                } else {
                    $("#divMapTool div:contains('比對')").click();
                    }

                }
                break;

            case "TlEvt": //事件工具
                    //$("#divSubToolbar").show();
                    //$("#divEvtTool").show();//暫時不啟用

                    // 2015/01/12 修改
                    if ($("#imgTlEvt").attr('src').toLowerCase().indexOf('_on') != -1) {
                $('#divTimeline').hide();
                $('#divTimeAxis').hide();
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                    }
                    else {
                $(obj.parentElement).find("img").attr("src", function () {
                    return this.src.replace("_on", "_off")
                    });
                $(obj).attr("src", function () {
                    return this.src.replace("_off", "_on")
                    });
                        //*// 2014.05.28 Ray(TimeAxis) 點擊事件工具時，開啟萬年曆+時間橫軸
                        OpenTimeline();//開啟萬年曆
                        OpenTimeAxis();//開啟時間橫軸

                        //確認oTimeline跟oTimeAxis物件都ready，再綁定watch事件(解決兩物件雙向同步的問題)
                var check = function () {
                    if (typeof (oTimeAxis) == "undefined" || typeof (oTimeline) == "undefined") {
                        setTimeout(check, 500); // check again in a second
                    }
                    else {
                        //oTimeline.unwatch("selDateTime");
                        oTimeline.NCDRwatch("selDateTime", WatchTimeline);//監看萬年曆觸發事件  // 2015/12/08 整合影像比對 watch 改為 NCDRwatch 避免套件衝突
                        //oTimeAxis.unwatch("customTime");
                        oTimeAxis.NCDRwatch("customTime", WatchTimeAxis);//監看時間橫軸觸發事件  // 2015/12/08 整合影像比對 watch 改為 NCDRwatch 避免套件衝突
                }
                    }
                        check();
                }
            break;
    }

}

// 2015/02/10 修改 Start
// 取得書籤群組清單 
function getBmkGrpList() {
    var url = "GetData/funcWidget/getBookmarkData.ashx?cmd=G";

    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            $.each(data, function (i, item) {
                var opHtml = '<option value="' + item.GrpId.toString() + '"  >' + item.GrpName.toString() + '</option>';
                if (item.IsLocal == 'N')
                    $('#sBmkGrp').find("[label='中央']").html($('#sBmkGrp').find("[label='中央']").html() + opHtml);
                else if (item.IsLocal == 'Y')
                    $('#sBmkGrp').find("[label='地方']").html($('#sBmkGrp').find("[label='地方']").html() + opHtml);
            });
        },
        error: function (e) {
        }
    });
}

// 顯示或隱藏群組選項
function ClickBmkRio(BmkVal) {
    if (BmkVal == '4')
        $('#sBmkGrpImg').css({ 'visibility': 'visible' });
        //$('.divBmkSetGrp').find('button').css({ 'visibility': 'visible' });
    else
        $('#sBmkGrpImg').css({ 'visibility': 'hidden' });
    //$('.divBmkSetGrp').find('button').css({ 'visibility': 'hidden' });
}
function showBmkGrpList() {
    //$('.ui-multiselect').click();
    $('span').filter(':contains("瀏覽群組")').parent().click();
}

// 2015/02/10 修改 End

//收合功能選單
function hideFuncMenu(obj, src) {
    if (src == "divSubToolbar") {
        $("#ToolsDiv").css('width', '45px'); // 2015/01/12 修改
        $("#ToolsDiv").hide(); // 2015/01/12 修改
        $("#divSubToolbar").hide();
        setFuncDivInitVisible();

        if (isPPTMode == "Y") {
            $("#divTimeline").hide();
            $("#divTimeAxis").hide();
            $("#divFuncLegend").hide();

            if (typeof (oMapPainter) != "undefined") {
                RemoveGraphicByID(oMapPainter.Layer, "", ""); //移除圖層所有圖片
                $("#divMapPainterDraw").empty();
                $("#divMptDrawList .tbody tbody").empty(); //清空資料表
                $('#divMapPainter').hide();
                oMapPainter.tbBrush.deactivate();
                oMapPainter.tbEdit.deactivate();
            }
        }
    } else {
        $("#" + src).hide();
    }

    //關閉地圖量測繪圖工具
    if (typeof (oMapQry) != "undefined") {
        oMapQry.disposeMapQry();
    }

    $('#MainMenu').find("img").attr("src", function () { return this.src.replace("_on", "_off") }); // 2015/01/12 修改
}

//開啟圖層清單
function OpenFuncList(event, type, toolid) {
    var evt = event ? event : (window.event ? window.event : null);
    curExecTool = toolid; //記錄點擊功能ID

    //初始狀態
    setFuncDivInitVisible();

    $('#ToolsDiv').css('width', '292px'); // 2015/01/12 修改
    $('#ListBanner').css('display', 'block'); // 2015/01/12 修改

    // 2015/01/12 重設按鈕樣式
    var evt = event ? event : (window.event ? window.event : null);
    var obj = evt.srcElement ? evt.srcElement : evt.target;
    $(obj.parentElement).find("div").css({
        "background-color": "#FFF", "color": "#0084AD"
    });
    $(obj).css({
        "background-color": "#0084AD", "color": "#FFF"
    });

    switch (type) {
        case "FnAll": //全部圖層
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            SetFuncItemActive(evt, '', '');
            break;
        case "FnBasic": //基礎圖層
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            SetFuncItemActive(evt, 'Basic', '');
            break;
        case "FnWarn": //警戒圖層
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            SetFuncItemActive(evt, 'Warn', '');
            break;
        case "FnMonitor": //監測圖層
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            SetFuncItemActive(evt, 'Monitor', '');
            break;
        case "FnCase": //災情圖層
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            SetFuncItemActive(evt, 'Case', '');
            break;
        case "FnBaseMap": //底圖圖層
            //$("#divFuncList").show();
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            $("#MapBgNav").show();
            break;
        case "FnRemote": //遙測圖層
            //$("#divRemoteList").show();
            $("#divRemoteList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改

            if (typeof (oRemoteList) == "undefined") {
                $("#divRemoteList").load("ucWidget/RemoteList.htm", function () {
                    oRemoteList = new RemoteList();
                    oRemoteList.initRemoteList();
                });
            }
            break;
        case "FnWms": //WMS圖層 yolanda 新增KML 功能
            //$("#divWMSList").show();
            $("#divWMSList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改

            if (typeof (oWMSList) == "undefined" || typeof (oKMLList) == "undefined" || typeof (oCSVList) == "undefined") {
                $("#divWMSList").load("ucWidget/WMSList.htm", function () {
                    oWMSList = new WMSList(); //WMS
                    oWMSList.initWMSList();
                    oKMLList = new KMLList();  //KML
                    oKMLList.initKMLList();
                    oCSVList = new CSVList(); //CSV
                    oCSVList.initCSVList();
                });
            }
            break;
        case "FnPict": //圖片
            //$("#divEventPictQry").show();
            $("#divEventPictQry").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改

            if (typeof (oEventPictQry) == "undefined") {
                $("#divEventPictQry").load("ucWidget/EventPictQry.htm", function () {
                    oEventPictQry = new EventPictQry();
                    oEventPictQry.initEventPictQry();
                });
            }

            break;
        case "FnSearch": //圖層搜尋
            //$("#divFuncList").show();
            $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
            $('#ToolsDiv').css('width', '292px'); // 2015/01/12 修改
            $('#ListBanner').css('display', 'block'); // 2015/01/12 修改
            $("#divSearchLayer").show();
            $("#FuncNav").show();
            $("#divSearchLayer").find("input[type='text']").val("")
            break;
    }
}

//開啟時間軸
function OpenTimeline() {
    //預設不開啟
    //$("#divTimeline").show();

    if (typeof (oTimeline) == "undefined") {
        $("#divTimeline").load("ucWidget/Timeline.htm", function () {
            oTimeline = new Timeline();
            oTimeline.genTimeline();
            oTimeline.loadCaseList();
        });
    }
}

//開啟時間橫軸
function OpenTimeAxis() {
    curExecTool = "46"; //記錄點擊功能ID    
    setCounterFunc(curExecTool, "", "Q", "GIS"); //功能操作記錄

    //預設開啟
    $('#divTimeAxis').show();

    if (typeof (oTimeAxis) == "undefined") {
        $('#divTimeAxis').load("ucWidget/TimeAxis.htm", function () {
            oTimeAxis = new TimeAxis();
            oTimeAxis.setContainer("TimeAxis");
            oTimeAxis.Load();
        });
    } else {
        oTimeAxis.goAssignTime(curDateTime);//萬年曆連動時間橫軸
    }
}

//監看萬年曆觸發事件
function WatchTimeline(id, oldval, newval) {
    try {
        oTimeAxis.NCDRunwatch("customTime");//暫停監看時間橫軸，以免無窮迴圈  // 2015/12/08 整合影像比對 unwatch 改為 NCDRunwatch 避免套件衝突
        clearTimeout(oTimeAxis.animateTimeout);
        oTimeAxis.goAssignTime(newval);//萬年曆連動時間橫軸
        oTimeAxis.NCDRwatch("customTime", WatchTimeAxis);//重新監看時間橫軸  // 2015/12/08 整合影像比對 watch 改為 NCDRwatch 避免套件衝突
    } catch (ex) { }
}

//監看時間橫軸觸發事件
function WatchTimeAxis(id, oldval, newval) {
    try {
        oTimeline.NCDRunwatch("selDateTime");//暫停監看萬年曆，以免無窮迴圈  // 2015/12/08 整合影像比對 unwatch 改為 NCDRunwatch 避免套件衝突
        $("#dprTLSelDate").datepicker("setDate", new Date(newval));//時間橫軸連動萬年曆
        oTimeline.NCDRwatch("selDateTime", WatchTimeline);//重新監看萬年曆  // 2015/12/08 整合影像比對 watch 改為 NCDRwatch 避免套件衝突
        oTimeline.resetOpenLayer(newval);
    } catch (ex) { }
}

//開啟播放清單
function OpenPlayList() {
    curExecTool = "74"; //記錄點擊功能ID    
    setCounterFunc(curExecTool, "", "Q", "GIS"); //功能操作記錄

    $("#divPlayList").show();

    if (typeof (oPlayList) == "undefined") {
        $("#divPlayList").load("ucWidget/PlayList.htm", function () {
            oPlayList = new PlayList();
            oPlayList.genPlayList();  //介面生成
        });
    }
}

//開啟情資研判清單
function OpenPdfList() {

    curExecTool = "59"; //記錄點擊功能ID    
    setCounterFunc(curExecTool, "", "Q", "GIS"); //功能操作記錄

    $("#divPdfList").show();

    if (typeof (oPdfList) == "undefined") {
        $("#divPdfList").load("ucWidget/PdfList.htm", function () {
            oPdfList = new PdfList();
            oPdfList.genPdfList();  //介面生成
        });
    }
}

//開啟即時情資主題選單
function openRealInfoMenu() {

    if (typeof (oTimeline) == "undefined") {
        $("#divTimeline").load("ucWidget/Timeline.htm", function () {
            oTimeline = new Timeline();
            oTimeline.genTimeline();
            oTimeline.loadCaseList();
        });
    }

    easyDialog.open({
        container: 'divRealInfoMenu',
        fixed: true,
        overlay: true
    });

    $("#divRealInfoDemo").load("ucWidget/RealInfoDemo.htm", function (response, status, error) {
        if (status != "error") {
            //取即時情資展示主題檔
            var url = "GetData/funcWidget/getRealInfoData.ashx";
            //var Cmd = "Category";
            var Cmd = "EventList";

            // 2015/7/7 修改震度範圍改接KMZ
            var PICUrlFlg = '1';
            if (gpNCDRPICUrl == 'http://140.110.141.214/NCDRPIC/')
                PICUrlFlg = '2';

            $.ajax({
                url: url,
                type: 'get',
                    data: {
                        "Cmd": Cmd,
                        "PICUrlFlg": PICUrlFlg // 2015/7/7 修改震度範圍改接KMZ
                    },
                dataType: "json",
                cache: false,   //不允許快取   
                beforeSend: function () { }
            }).done(function (data) {
                oRealInfoDemo = new RealInfoDemo();
                oRealInfoDemo.RealInfoDemoCData = data; //存入即時情資展示主題資料
                var newdata = data.sort(function (first, second)//依時間排序
                {
                    if (Date.parse(second.EventTime) == Date.parse(first.EventTime))
                        return 0;
                    if (Date.parse(second.EventTime) < Date.parse(first.EventTime))
                        return -1;
                    else
                        return 1;
                });
                    
                if ($("#divRealInfoShow").html() == "") {
                    var htmlC = '<div style="height: 100px;display:inline-block !important;">專案名稱: <input type="text" id="prj_name"/><br>專案日期:<input type="date" id="sdate"/> ~ <input type="date" id="edate"/> <input type="button" id="prj_query" value="查詢"/></div>';
                    for (var i = 0; i < newdata.length; i++) {
                        /*
                        htmlC += '<input type="button" style="cursor: pointer;width:120px; height:50px; margin-left:15px;margin-top:15px;';
                        htmlC += 'background-color:#DDD;text-align:center;color:#000" value="' + data[i].CateName + '" onclick="easyDialog.close();oRealInfoDemo.openRealInfoDemo(\'' + i + '\');"/>';
                        */
                        htmlC += "<div id='rinfo_" + i + "' onclick='easyDialog.close();oRealInfoDemo.openRealInfoDemo(" + i + ")' data-name='" + newdata[i].CateName + "' data-date='" + newdata[i].EventTime.substring(0, 10).replace(/-/g, '') + "'>";
                        htmlC += "<span style='float:left;'>" + newdata[i].CateName + "，規模" + newdata[i].Magnitude + "</span>";
                        htmlC += "<span style='float:right;'>" + newdata[i].EventTime + "</span>";
                        htmlC += "</div>";
                    }
                    $("#divRealInfoShow").append(htmlC);

                    //查詢專案
                    $('#divRealInfoShow').find('#prj_query').on('click', function () {
                        $('#divRealInfoShow div[id]').css('display', 'none');
                        var q_prjname = $('#prj_name').val();
                        var q_sdate = $('#sdate').val().replace(/-/g, '');
                        var q_edate = $('#edate').val().replace(/-/g, '');

                        if (q_sdate != '' || q_edate != '') {
                            if (q_sdate == '')
                                q_sdate = "19000101";

                            if (q_edate == '')
                                q_edate = "99000101";

                            $('#divRealInfoShow div[id]').each(function (i, d) {
                                if (q_sdate <= $('#' + d.id).data('date') && $('#' + d.id).data('date') <= q_edate) {
                                    if (q_prjname != '') {
                                        $('#' + d.id + '[data-name*="' + q_prjname + '"]').css('display', 'inline-block');
                                    } else {
                                        $('#' + d.id).css('display', 'inline-block');
                                    }
                                }
                            });
                            return;
                        } else {
                            if (q_prjname != '') {
                                $('#divRealInfoShow div[data-name*="' + q_prjname + '"]').css('display', 'inline-block');
                                return;
                            } else {
                                $('#divRealInfoShow div[id]').css('display', 'inline-block');
                            }
                        }
                    });

                }
            }).fail(function () { }).always(function () { });
        }
    });
}

//圖層選單函式************************************************************
//載入圖層清單
function loadFuncList() {
    var url = "GetData/funcWidget/getFuncListData.ashx?module=" + curModule + "&account=" + account;

    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",              // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            arrFuncList = data; 

            //圖層層級分類
            for (var i = 0; i < arrFuncList.length; i++) {
                var o = arrFuncList[i];

                if (o.PID > 0) {
                    arrFuncListC.push(o); //子層
                } else {
                    if (o.Mod == "") {
                        arrFuncListO.push(o); //其他
                    } else if (o.PID == 0) {
                        arrFuncListS.push(o); //單一
                    } else if (o.PID < 0) {
                        arrFuncListP.push(o); //父層
                    }
                }

                //地圖底圖
                if (o.Type == "MapBg") {
                    arrMapBg.push(o);
                }
            }

            //創建圖層選單
            createFuncMenu(curFuncType);

            //創建底圖layer
            newMapBgLayer();
        },
        error: function (jqXHR, textStatus, errorThrown) {

        }        
    });
}

//創建底圖圖層
function newMapBgLayer() {
    if (arrMapBg.length > 0) {
        for (var i = 0; i < arrMapBg.length; i++) {

            // wmts break
            if (arrMapBg[i].Exec == 'WMTS') {
                newMapBgLayerWMTSSuccess(arrMapBg[i]);
                continue;
            }

            if (arrMapBg[i].TiledMapUrl != "") {
                var lyrTiledMap;
                var layerUrl = (isToken == "Y") ? arrMapBg[i].TiledMapUrl + "?Token=" + arrMapBg[i].Token : arrMapBg[i].TiledMapUrl;
                // console.log('pre',layerUrl);
                lyrTiledMap = new esri.layers.ArcGISTiledMapServiceLayer(layerUrl, { id: "lyrTiledMap" + arrMapBg[i].ID });
                if (lyrTiledMap.loaded) {
                    newMapBgLayerSuccess(lyrTiledMap);
                }
                else {
                    lyrTiledMap.on("load", newMapBgLayerSuccess);
                    lyrTiledMap.on("error", newMapBgLayerError);
                }
            }
        }
    }
    else {
        setTimeout("newMapBgLayer()", 3000);
    }
}
function newMapBgLayerWMTSSuccess(obj) {
    var url = obj.TiledMapUrl;
    var id = obj.ID;
    var layer = new esri.layers.WebTiledLayer(url, { id: 'lyrTiledMap' + id, "opacity": 1 });
    map.addLayer(layer, 2);
    layer.hide();
    createMapBgMenu(obj);
}
function newMapBgLayerSuccess(layer) {
    // console.log('ok',layer);
    var lyrTiledMap = layer.target;
    map.addLayer(lyrTiledMap, 2);

    var Obj = getArryObj(arrMapBg, "ID", lyrTiledMap.id.replace("lyrTiledMap", ""));
    createMapBgMenu(Obj);
    if (curMapBase == "") {
        if (Obj.Open == "Y" && Obj.ID == defalutBgMapID) {  //加入預設開啟底圖 @20160317 Andy
            curMapBase = Obj.ID;

            //道路註記
            if ($("#liTwLabel").length > 0) {
                if (Obj.SubType == "1") {
                    $("#liTwLabel").hide();
                } else {
                    $("#liTwLabel").show();
                    switchTwLabel(true);
                }
            }

            switchMapBase(curMapBase);

            //套疊群組預設書籤
            if (typeof (oBookmark) == "undefined") {
                $("#divBmkTool").load("ucWidget/Bookmark.htm", function () {

                    oBookmark = new Bookmark();
                    oBookmark.account = account;
                    oBookmark.loadBmkList("S", null, function () {
                        if ($("#aBmk" + oGrpInfo.BookID).length > 0)
                            $("#aBmk" + oGrpInfo.BookID).trigger('click');

                    });
                });
            }

        } else {
            lyrTiledMap.hide();
        }
    } else {
        lyrTiledMap.hide();
    }
}
function newMapBgLayerError(error) {
    for (var i = 0; i < arrMapBg.length; i++) {
        if ("lyrTiledMap" + arrMapBg[i].ID == error.target.id) {
            if (curMapBase == "") {
                if (arrMapBg[i].Open == "Y") {
                    curMapBase = "800"; //連結錯誤之底圖,若為預設開啟時,則改為預設電子地圖
                    //$("#liTwLabel").hide();
                    //$("#liTwLabel").css("color", "gray");
                    //$("#liTwLabel").children("span:eq(0)").unbind("click"); //移除click事件
                    switchMapBase(curMapBase)
                }
            }
            //arrMapBg.splice(i, 1);
            break;
        }
    }
}

//創建圖層選單 
function createFuncMenu(type) {
    //重設高度
    var h = $(window).height();
    //$("#divFuncList div:eq(1)").css("height", h - 80); // 2015/01/12 修改

    curFuncType = type;
    $("#FuncNav").empty();
    var funHtml = "";

    //創建單一選單
    for (var i = 0; i < arrFuncListS.length; i++) {
        if (arrFuncListS[i].IsSpecRID == "Y") continue; //即時情資(地震儀表板)專用圖層時,不處理
        if (type != "" && arrFuncListS[i].Type != type) continue;

        funHtml = SetFuncHtml(arrFuncListS[i], "", "N");

        if (arrFuncListS[i].Type != "MapBg") {
            $("#FuncNav").append(funHtml);
        }
    }

    //創建父層選單
    for (var i = 0; i < arrFuncListP.length; i++) {
        if (arrFuncListP[i].IsSpecRID == "Y") continue; //即時情資(地震儀表板)專用圖層時,不處理
        if (type != "" && arrFuncListP[i].Type != type) continue;

        funHtml = SetFuncHtml(arrFuncListP[i], "p1", "N");

        if (arrFuncListP[i].Type != "MapBg") {
            $("#FuncNav").append(funHtml);
        }
    }

    //創建其他選單(僅單一項及父層,子層於下統一處理)
    for (var i = 0; i < arrFuncListO.length; i++) {
        if (i == 0) {
            funHtml = "";
            funHtml += "<li id=\"liFuncOth\" class=\"funcNode\">其他";
            funHtml += "  <ul class=\"p1\"></ul>";
            funHtml += "</li>";
            $("#FuncNav").append(funHtml);
        }

        if (arrFuncListO[i].IsSpecRID == "Y") continue; //即時情資(地震儀表板)專用圖層時,不處理
        if (type != "" && arrFuncListO[i].Type != type) continue;

        if (arrFuncListO[i].PID == 0) { //0:無父層,單一選單
            funHtml = SetFuncHtml(arrFuncListO[i], "", "N");
            $("#liFuncOth>ul").append(funHtml);
        } else if (arrFuncListO[i].PID < 0) { //-1:有子層            
            funHtml = SetFuncHtml(arrFuncListO[i], "p2", "N");
            $("#liFuncOth>ul").append(funHtml);
        }
    }

    //創建子層選單
    for (var i = 0; i < arrFuncListC.length; i++) {
        if (arrFuncListC[i].IsSpecRID == "Y") continue; //即時情資(地震儀表板)專用圖層時,不處理
        if (type != "" && arrFuncListC[i].Type != type) continue;

        var isHaveChild = "N"; //是否尚有子層,預設無
        var PID = "";
        var PCls = "";
        var CCls = "";
        var PObj;

        if ($("#liFunc" + arrFuncListC[i].ID).length == 0) {

            //是否存在父節點
            PObj = getArryObj(arrFuncList, "ID", arrFuncListC[i].PID)
            if (PObj != "" && $("#liFunc" + PObj.ID).length == 0) {

                //往上追溯是否存在父節點,不存在則創建,且編列於其他項
                var PPObj = getArryObj(arrFuncList, "ID", PObj.PID)
                if (PPObj != "")
                {
                    if ($("#liFunc" + PPObj.ID).length == 0) {
                        funHtml = SetFuncHtml(PPObj, "p2", "N");
                        $("#liFuncOth>ul").append(funHtml);
                    }

                    CCls = (PCls == "p1") ? "p2" : "p3";
                    funHtml = SetFuncHtml(PObj, CCls, "N");
                    $("#liFunc" + PObj.PID + ">ul").append(funHtml);
                }
            }

            //創建當前節點
            isHaveChild = ChkHaveChild(arrFuncListC[i].ID); //是否尚有子項(第三層)
            funHtml = "";
            if (isHaveChild == "N") {
                funHtml = SetFuncHtml(arrFuncListC[i], "", "N");
            } else {
                PID = GetFuncPID(arrFuncListC[i].ID) //取出父層ID
                PCls = $("#liFunc" + PID)[0].className;
                CCls = (PCls == "p1") ? "p2" : "p3";

                funHtml = SetFuncHtml(arrFuncListC[i], CCls, "N");
            }

            if (PObj != "")
                $("#liFunc" + arrFuncListC[i].PID + ">ul").append(funHtml);
            else
                $("#liFuncOth>ul").append(funHtml);
        }
    }

    //事件綁定
    $("ul#FuncNav li:has(ul)").click(bindFuncItemEvt).css("cursor", "pointer").click(); //綁定有子項之選單收合事件,加載觸發點擊事件

    //設定樣式
    $("ul#FuncNav li:not(:has(ul))").css("list-style", "none"); //對於沒有子項的選單
    $("ul#FuncNav li:has(ul)").css("list-style-image", "url(images/FuncList/close.png)"); //對於有子項的選單

    //初始隱藏子項
    $("ul#FuncNav li:has(ul)").each(function (i) {
        $(this).children().slideUp(400);
    });
}

//創建底圖選單
function createMapBgMenu(obj) {
    var funHtml = "";

    if (obj.PID > 0) { //子層
        //查無父層,則建立父節點
        if ($("#MapBgNav>#liFunc" + obj.PID).length == 0) {
            var PObj = getArryObj(arrMapBg, "ID", obj.PID);
            funHtml = SetFuncHtml(PObj, "p1", "N");
            $("#MapBgNav").append(funHtml);
            $("#MapBgNav #liFunc" + obj.PID).css({"list-style-image": "url(images/FuncList/close.png)", "margin-left": "25px"});
            $("#MapBgNav #liFunc" + obj.PID).unbind('click').bind("click", bindFuncItemEvt); //父節點事件綁定
        }

        //創建當前節點
        funHtml = SetFuncHtml(obj, "", "N");
        $("#liFunc" + obj.PID + ">ul").append(funHtml);
    }
    else if (obj.PID == 0) { //單一
        funHtml = SetFuncHtml(obj, "", "N");
        $("#MapBgNav").append(funHtml);
    }
    else if (obj.PID < 0) { //父層
        if ($("#liFunc" + obj.ID).length == 0) {
            funHtml = SetFuncHtml(obj, "p1", "N");
            $("#MapBgNav").append(funHtml);
            $("#MapBgNav #liFunc" + obj.ID).unbind('click').bind("click", bindFuncItemEvt); //事件綁定
        }
    }

    //子節點及單一節點click事件綁定
    if (obj.PID >= 0) {
        $("#liFunc" + obj.ID).children("span:eq(0)").unbind('click').bind("click",
        { id: obj.ID },
        function (e) {
            setCounterFunc(curExecTool, e.data.id, "Q", "GIS"); //功能操作記錄
            switchMapBase(e.data.id);
        });
    }

    //設定樣式
    $("ul#MapBgNav li:has(ul)").css("cursor", "pointer");
    $("ul#MapBgNav li:not(:has(ul))").css("list-style", "none"); //對於沒有子項的選單，統一設置
    $("ul#MapBgNav li:has(ul)").css("list-style-image", "url(images/FuncList/close.png)"); //對於有子項的選單，統一設置
    $("ul#MapBgNav li:has(ul)").each(function (i) { $(this).children().slideUp(400); });

}

//設定選單HTML
function SetFuncHtml(obj, cls, isAddParent) {

    //取出資料時間
    var datatime = "";
    if (obj.DataLastTime != "" || obj.Time != "") {
        datatime = "資料時間:" + ((obj.DataLastTime != "") ? obj.DataLastTime : obj.Time);
    }
    //取出資料來源
    var datasrc = (obj.Source != "") ? "資料來源:" + obj.Source : "";

    //取出顯示比例尺
    var dataLod = "";
    if (obj.Min != "-1" || obj.Max != "-1") {
        var sMin = (obj.Min == "-1") ? "不限" : obj.Min;
        var sMax = (obj.Max == "-1") ? "不限" : obj.Max;

        datatime = "建議觀看比例尺:" + sMin + "~" + sMax;
    }

    //組TIP
    var tip = "";
    if (datatime != "") tip += datatime;
    if (dataLod != "") tip += (tip != "") ? ("&#10;" + dataLod) : dataLod;
    if (datasrc != "") tip += (tip != "") ? ("&#10;" + datasrc) : datasrc;

    var html = "";
    if (cls == "") {
        html += "<li id='liFunc" + obj.ID + "' class=\"funcLeaf\">";
        html += "  <span>";
        // 2016/08/10: martin hsieh: wmts icon 固定設定處理
        if (obj.Exec == "WMTS" && obj.L1=="") obj.L1 = 'Pic.png';
        html += "    <img id=\"cbFunc" + obj.ID + "\" src=\"images/FuncList/uncheck.png\" /><span title=\"" + tip + "\"><img src=\"" + gLegendPath1 + obj.L1 + "\" style=\"width:16px\"/>" + obj.CName + "</span>";     
        if (obj.IsOverdue == "Y") {
            html += "    <img src=\"images/other/delay.gif\" title=\"資料與現在時間差異" + formatTimeMinute(obj.TimeDiff) + "，已超過警示時距(" + obj.AlertInterval + "分鐘)\" />";
        }

        html += "  </span>";
        html += "</li>";
    } else {
        html += "<li id=\"liFunc" + ((isAddParent == "N") ? obj.ID : obj.PID) + "\" class=\"funcNode\">" + ((isAddParent == "N") ? obj.CName : obj.PName);
        html += "  <ul class=\"" + cls + "\"></ul>";
        html += "</li>";
    }

    return html;
}
function bindFuncItemEvt(e) {
    //debugger;
    var $li = $(this);
    if (this == e.target) {

        if ($(this).children().is(":hidden")) { //如果子項是隱藏的則顯示
            $(this).css({
                "list-style-image": "url(images/FuncList/open.png)",
                "margin-left": "25px"
            });
            //$(this).children().show();
        } else { //如果子項是顯示的則隱藏
            $(this).css({
                "list-style-image": "url(images/FuncList/close.png)",
                "margin-left": "25px"
            });
            //$(this).children().hide();
        }
        // 修正圖層樹狀展摺後，資料夾前端箭頭符號殘留問題
        // 差 1px 的設定
        $li.css('margin-left', '24px');
        $li.parent().css('margin', '1px');
        $li.parent().parent().css('padding', '4px');
        // $(this).children("ul:eq(0)").slideToggle(400);
        $(this).children("ul:eq(0)").slideToggle(400, function () {
            // 於 slider effect 後還原回原本的 CSS 設定，注意這些設定在 ncdr.css 內
            // li 為 .funcLeaf , 父層 ul 為 #FuncNav
            $li.css('margin-left', '25px');
            $li.parent().css('margin', '0px');
            $li.parent().parent().css('padding', '5px');
        });
    }
    //return false; //避免不必要的事件混繞
}

//判斷選單是否有子層
function ChkHaveChild(funid) {
    var isHave = "N";
    for (var i = 0; i < arrFuncListC.length; i++) {
        if (arrFuncListC[i].PID == funid) {
            isHave = "Y";
            break;
        }
    }
    return isHave;
}

//取出選單之父層ID
function GetFuncPID(funid) {
    var parentid = "";
    for (var i = 0; i < arrFuncList.length; i++) {
        if (arrFuncList[i].ID == funid) {
            parentid = arrFuncList[i].PID;
            break;
        }
    }
    return parentid;
}

//設定圖層選單啟用狀態
function SetFuncItemActive(event, type, search) {
    curFuncType = type;

    var evt = event ? event : (window.event ? window.event : null);
    if (typeof (evt) != "undefined" && evt != null && evt.type == "click") {
        //$("#divFuncList").show();
        $('#ToolsDiv').css('width', '292px'); // 2015/01/12 修改
        $("#divFuncList").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改
        $("#FuncNav").show();
    }

    var MaxScale = 0;
    var MinScale = 0;
    var nowScale = map.getScale();

    //搜尋圖層關鍵字
    if (!$("#divSearchLayer").is(":hidden") && search == "")
        search = $("#divSearchLayer").find("input[type='text']").val();

    for (var i = 0; i < arrFuncList.length; i++) {

        if (arrFuncList[i].Type == "MapBg") continue;
        if (arrFuncList[i].IsSpecRID == "Y") continue; //即時情資(地震儀表板)專用圖層時,不處理

        if (type != "" && arrFuncList[i].Type != type) {
            $("#liFunc" + arrFuncList[i].ID).hide();
            continue;
        } else {

            //搜尋圖層結果
            if (search != "") {
                searchFuncRlt(arrFuncList[i], search);
            } else {
                $("#liFunc" + arrFuncList[i].ID).show();
                $("#liFuncOth").show();
            }
        }

        //依比例尺檢查是否可顯示
        MaxScale = (arrFuncList[i].Max == -1) ? map.getMaxScale() : parseFloat(arrFuncList[i].Max);
        MinScale = (arrFuncList[i].Min == -1) ? map.getMinScale() : parseFloat(arrFuncList[i].Min);
        if (nowScale >= MaxScale && nowScale <= MinScale) {

            arrFuncList[i].Show = "Y"; //符合比例尺,預設顯示圖層
            if (arrFuncList[i].EyeSee == "N") { //若圖例設定為閉眼時,則調整不顯示圖層
                arrFuncList[i].Show = "N";
            }

            $("#liFunc" + arrFuncList[i].ID).css("color", "black");

            //選單click事件綁定
            $("#liFunc" + arrFuncList[i].ID).children("span:eq(0)").unbind('click').bind("click",
                {
                    id: arrFuncList[i].ID,
                    name: arrFuncList[i].Name,
                    exec: arrFuncList[i].Exec,
                    src: "cbFunc"
                },
                function (e) {
                    switchFuncModule(e.data.id, e.data.name, e.data.exec, false, e.data.src); //預設關閉
                });
        } else {
            arrFuncList[i].Show = "N";
            $("#liFunc" + arrFuncList[i].ID).css("color", "gray");
            $("#liFunc" + arrFuncList[i].ID).children("span:eq(0)").unbind("click"); //移除click事件
        }

        //自動開啟圖層:不存在圖例區才開啟
        if (arrFuncList[i].Open == "Y" && arrFuncList[i].Show == "Y") {

            //設定勾選狀態
            $("#cbFunc" + arrFuncList[i].ID).attr("src", "images/FuncList/check.png");

            if (jQuery.inArray(arrFuncList[i], arrOpenFuncs) < 0) {
                switchFuncModule(arrFuncList[i].ID, arrFuncList[i].Name, arrFuncList[i].Exec, true, "")
            }
        }
    }

    //設定圖例區顯示狀態
    SetQFuncVisibleByAll();

    //判斷其他項之搜尋圖層結果
    if (search != "") {
        var othVisCount = $("#liFuncOth li").filter(":visible").size();
        if (othVisCount == 0)
            $("#liFuncOth").hide();
        else 
            $("#liFuncOth").show();
    }
}

//搜尋圖層
function searchFunc(event) {
    var evt = event ? event : (window.event ? window.event : null);
    var search = $("#divSearchLayer").find("input[type='text']").val();

    if (search == "") {
        alert("請輸入搜尋圖層關鍵字");
        return;
    } else {
        SetFuncItemActive(evt, curFuncType, search)
    }
}
//var iii = 0;
function searchFuncRlt(ofunc, findTxt) {

    var ofuncP = getArryObj(arrFuncListP, "ID", ofunc.PID);
    if (ofuncP == "")
        ofuncP = getArryObj(arrFuncListO, "ID", ofunc.PID);

    if (ofunc.CName.toUpperCase().indexOf(findTxt.toUpperCase()) >= 0) {
        $("#liFunc" + ofunc.ID).show();
        $("#liFunc" + ofunc.ID).parent().show(); //顯示ul tag

        //查詢物件為子層時,父層也一併顯示
        if (parseInt(ofunc.PID) > 0 && ofuncP != "" && ofunc.Type == ofuncP.Type) {
            $("#liFunc" + ofunc.PID).show();
        }

    } else {
        $("#liFunc" + ofunc.ID).hide();

        //查詢物件不符合時,判斷父層是否符合條件
        if (parseInt(ofunc.PID) > 0 && ofuncP != "") {
            if (ofuncP.CName.toUpperCase().indexOf(findTxt.toUpperCase()) >= 0) {

                // 2015/06/29 修改當父層顯示，子層也要顯示
                for (var iii = 0; iii < arrFuncListC.length; iii++) {
                    if (arrFuncListC[iii].PID == ofunc.PID)
                        $("#liFunc" + arrFuncListC[iii].ID).show();
                }

                $("#liFunc" + ofunc.PID).show();
                //$("#liFunc" + ofunc.ID).show();
            } 
        }
    }
}
function searchFuncClose() {
    $("#divSearchLayer").hide();
    $("#FuncNav ul").hide();
    $("#FuncNav li:has(ul)").css("list-style-image", "url(images/FuncList/close.png)"); //對於有子項的選單
    SetFuncItemActive(event, curFuncType, '');
}

//設定圖例區顯示狀態
function SetQFuncVisibleByAll() {    
    for (var i = 0; i < arrOpenFuncs.length; i++) {

        var layer = map.getLayer(arrOpenFuncs[i].layerid);

        if (typeof (layer) != "undefined") {
            var MaxScale = (arrOpenFuncs[i].Max == -1) ? map.getMaxScale() : parseFloat(arrOpenFuncs[i].Max);
            var MinScale = (arrOpenFuncs[i].Min == -1) ? map.getMinScale() : parseFloat(arrOpenFuncs[i].Min);
            var nowScale = map.getScale();

            if (nowScale >= MaxScale && nowScale <= MinScale) {

                if (arrOpenFuncs[i].EyeSee == "Y") { //圖例開眼時,才顯示圖層
                    layer.show();
                    arrOpenFuncs[i].Show == "Y"
                    //$("#opShwImg" + arrOpenFuncs[i].ID).attr("src", "images/FuncList/icon-40.png");
                    $("#showLayer" + arrOpenFuncs[i].ID).prop("checked", true);
                    $("#showLayer" + arrOpenFuncs[i].ID).prop("title", "圖層顯示中");
                }
                else {
                    layer.hide();
                    arrOpenFuncs[i].Show == "N"
                    //$("#opShwImg" + arrOpenFuncs[i].ID).attr("src", "images/FuncList/icon-41.png");
                    $("#showLayer" + arrOpenFuncs[i].ID).prop("checked", false);
                    $("#showLayer" + arrOpenFuncs[i].ID).prop("title", "圖層關閉中");
                }

                $("#opFunc" + arrOpenFuncs[i].ID).children("span:eq(0)").css("color", "black"); //圖例文字變色
                $("#showLayer" + arrOpenFuncs[i].ID).prop("disabled", false); //讓checkbox可點選
                //綁定事件
                $("#opShwImg" + arrOpenFuncs[i].ID).unbind('click').bind("click", { id: arrOpenFuncs[i].ID }, function (e) { SetQFuncVisibleByID(e.data.id); }); //眼睛click事件
                $("#opFrmImg" + arrOpenFuncs[i].ID).unbind('click').bind("click", //表單click事件
                    { id: arrOpenFuncs[i].ID, formid: arrOpenFuncs[i].formid },
                    function (e) { switchFuncFrm(e.data.id, e.data.formid); });
                $("#opOpaImg" + arrOpenFuncs[i].ID).unbind('click').bind("click", { id: "FuncOpa" + arrOpenFuncs[i].ID }, function (e) { switchFuncOpa(e.data.id, e.pageY + 15); }); //透明度click事件

            } else {
                layer.hide();
                arrOpenFuncs[i].Show == "N"
                //$("#opShwImg" + arrOpenFuncs[i].ID).attr("src", "images/FuncList/icon-41.png");
                $("#showLayer" + arrOpenFuncs[i].ID).prop("checked", false);
                $("#showLayer" + arrOpenFuncs[i].ID).prop("disabled", true);//讓checkbox不可點選
                $("#showLayer" + arrOpenFuncs[i].ID).prop("title", "圖層關閉中");
                $("#opFunc" + arrOpenFuncs[i].ID).children("span:eq(0)").css("color", "gray"); //圖例文字變色

                //移除事件
                $("#opShwImg" + arrOpenFuncs[i].ID).unbind("click"); //眼睛click事件
                $("#opFrmImg" + arrOpenFuncs[i].ID).unbind('click'); //表單click事件
                $("#opOpaImg" + arrOpenFuncs[i].ID).unbind('click'); //透明度click事件
            }
        }
    }
}

//設定指定圖例顯示狀態
function SetQFuncVisibleByID(funcid) {
    var funcobj = getArryObj(arrOpenFuncs, "ID", funcid);

    if (funcobj.layerid == "" || funcobj.layerid === undefined) {
        UpdQFuncList(funcid, false, "", ""); //移出圖例區
        switchFuncModule(funcobj.ID, funcobj.Name, funcobj.Exec, false, "");
    } else {
        var layer = map.getLayer(funcobj.layerid);

        if (funcobj.Show == "Y") {
            layer.hide();
            funcobj.Show = "N";
            funcobj.EyeSee = "N";
            //$("#opShwImg" + funcid).attr("src", "images/FuncList/icon-41.png");
            $("#showLayer" + funcid).prop("checked", false);
            $("#showLayer" + funcid).prop("title", "圖層關閉中");
        } else {
            layer.show();
            funcobj.Show = "Y";
            funcobj.EyeSee = "Y";
            //$("#opShwImg" + funcid).attr("src", "images/FuncList/icon-40.png");
            $("#showLayer" + funcid).prop("checked", true);
            $("#showLayer" + funcid).prop("title", "圖層顯示中");
        }
    }
}

//更新圖例區項目
function UpdQFuncList(funcid, chked, layerid, formid, mode) {    
    var funcobj;
    if (typeof (mode) != "undefined") {
        switch (mode) {
            case "cbFuncRID":
                funcobj = getArryObj(oRealInfoDemo.LayerData, "ID", funcid);
                break;
            case "FloodingPredict"://@建立淹水兵棋台裡的圖層的funcobj 2016/03/23 Kevin
                funcobj = new Object();
                
                funcobj.Exec = "";
                funcobj.DataLastTime = "";
                funcobj.L1 = "";
                funcobj.L2 = "";
                funcobj.Max = -1;
                funcobj.Min = -1;
                funcobj.Time = "";
                funcobj.ID = layerid;
                if (layerid == "graLayer_fldArea") {
                    funcobj.CName = "淹水網格";
                    funcobj.lyrIdx = 300;
                }
                else if (layerid == "graLayer_effectPopu") {
                    funcobj.CName = "影響人口";
                    funcobj.lyrIdx = 400;
                } else if (layerid == "graLayer_procObj") {
                    funcobj.CName = "保全對象";
                    funcobj.lyrIdx = 450;
                }
                break;
        }
    } 
    else {
        funcobj = getArryObj(arrFuncList, "ID", funcid);
    }

    if (chked) {
        if (typeof (funcobj) == "undefined") return;//找不到物件，略過
        if (funcobj == null) return;//找不到物件，略過
        if (jQuery.inArray(funcobj, arrOpenFuncs) > -1) return; //已存在圖例區者,略過
        console.log('funcobj');
        console.log(funcobj);
        //加入陣列
        funcobj.Checked = (chked) ? "Y" : "N"; //圖層勾選狀態
        funcobj.Open = (layerid == "") ? "N" : "Y";
        funcobj.Show = (layerid == "") ? "N" : "Y";
        funcobj.EyeSee = (layerid == "") ? "N" : "Y";
        funcobj.layerid = layerid;
        funcobj.formid = formid;
        arrOpenFuncs.push(funcobj);

        //圖檔路徑
        var imgOpnLyr = "images/FuncList/icon-37.png"; //關閉圖層
        var imgShwLyr = (layerid == "") ? "images/FuncList/icon-41.png" : "images/FuncList/icon-40.png"; //顯示圖層
        var imgOpnFrm = (layerid == "") ? "images/FuncList/icon-44.png" : "images/FuncList/icon-43.png"; //開啟表單
        var imgSetOpa = "images/FuncList/icon-42.png";     //透明度
        var imgLyrL1 = gLegendPath1 + funcobj.L1; //圖徵
        var imgLyrL2 = gLegendPath2 + funcobj.L2; //圖例
        var showHeatMap = false;//是否顯示轉換熱區圖按鈕 2016/09/01 Kevin
        if (funcobj.IsChgHeatmap == "Y" || funcobj.IsChgHeatmap==1) {
            showHeatMap = true;
        }

        //加入圖例區
        var html = "";
        if (layerid == "graLayer_fldArea" || layerid == "graLayer_effectPopu" || layerid == "graLayer_procObj")//@淹水兵棋台裡的圖層需指定寬度(因無資料時間) 2016/03/23 Kevin
            html += "<div id=\"opFunc" + funcobj.ID + "\" class=\"OpnFunc\" style=\"width:160px;\">";
        else
            html += "<div id=\"opFunc" + funcobj.ID + "\" class=\"OpnFunc\">";
        //if (layerid != "graLayer_fldArea" && layerid != "graLayer_effectPopu" && layerid != "graLayer_procObj")//@淹水兵棋台裡的圖層無法被關閉(by PM文件) 2016/03/23 Kevin
        //    html += "  <img id=\"opOpnImg" + funcobj.ID + "\" src=\"" + imgOpnLyr + "\" alt=\"關閉圖層\" />";
        html += "  <input type=\"checkbox\" id=\"showLayer" + funcobj.ID + "\" alt=\"顯示圖層\" />";
        //html += "  <img id=\"opShwImg" + funcobj.ID + "\" src=\"" + imgShwLyr + "\" alt=\"顯示圖層\" />";
        if(funcobj.L1!="")
            html += "  <img src=\"" + imgLyrL1 + "\" alt=\"圖徵\" />";
        html += "  <span>" + funcobj.CName + "</span>";
        html += "  <span style=\"float: right;\">";

        //表單TOOL
        //if (funcobj.Exec.indexOf("RTUI") >= 0 && funcobj.formid != "") {
        //    html += "    <img id=\"opFrmImg" + funcobj.ID + "\" src=\"" + imgOpnFrm + "\" alt=\"開啟表單\" title=\"開啟表單資訊視窗\" />";
        //}

        html += "    <img id=\"opOpaImg" + funcobj.ID + "\" src=\"" + imgSetOpa + "\" alt=\"透明度\"  title=\"調整圖層透明度\" />";
        html += "  </span>";

        //資料時間
        var opDataLastTime = "";
        if (funcobj.DataLastTime != "" || funcobj.Time != "") {
            opDataLastTime = (funcobj.DataLastTime != "") ? funcobj.DataLastTime : funcobj.Time;
            html += "  <br/><span class='opDataLastTime' style=\"margin-left: 60px; color: #87A1A6;\">資料時間：" + opDataLastTime + "</span>";
        }

        //圖例
        if (funcobj.L2 != "") {
            html += "  <img src=\"" + imgLyrL2 + "\" style=\"width: 150px;padding: 3px 0px 0px 55px;cursor: default;\" alt=\"圖例\"/>";
        }
        //熱區圖 2016/08/31 Kevin
        if (showHeatMap) {
            html += "  <img id=\"heatmapImg" + funcobj.ID + "\" src=\"" + "images/FuncList/heatmap_toggle.png" + "\"  alt=\"熱區圖\"/>";
            html += "  <div id=\"heatmapOpa" + funcobj.ID + "\" class=\"HeatMap\" >";
            html += '<div><div style="display:inline-block;position:relative;bottom:7px;">熱區半徑</div><input id=\"blurControl\"  type="range"  max=30 min=0 value=10 step=1/><div style="display:inline-block;"><span id="blurValue" style="position:relative;bottom:7px;">10</span></div></div>';
            html += '<div><div style="display:inline-block;position:relative;bottom:7px;">最大值  </div><input id=\"maxControl\"  type="range" max=500 min=0 value=20 step=1 /><div style="display:inline-block;"><span id="maxValue" style="position:relative;bottom:7px;">20</span></div></div>';
            html += '<div><div style="display:inline-block;position:relative;bottom:7px;">最小值  </div><input id=\"minControl\"  type="range" max=500 min=0 value=0 step=1 /><div style="display:inline-block;"><span id="minValue" style="position:relative;bottom:7px;">0</span></div></div>';
            html += "  </div>";
        }

        //透明度TOOL
        if (funcobj.Exec != "RealPictureSet") {
            html += "  <div id=\"FuncOpa" + funcobj.ID + "\" class=\"Opa\" >";
            html += "    <img src=\"images/other/close.png\" onclick=\"switchFuncOpa('FuncOpa" + funcobj.ID + "', 0)\" />";
            html += "    <img src=\"images/Opacity/transparent_on_01.png\" onclick=\"clickFuncOpa(0,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_02.png\" onclick=\"clickFuncOpa(0.1,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_03.png\" onclick=\"clickFuncOpa(0.2,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_04.png\" onclick=\"clickFuncOpa(0.3,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_05.png\" onclick=\"clickFuncOpa(0.4,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_06.png\" onclick=\"clickFuncOpa(0.5,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_07.png\" onclick=\"clickFuncOpa(0.7,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <img src=\"images/Opacity/transparent_off_08.png\" onclick=\"clickFuncOpa(0.85,'FuncOpa" + funcobj.ID + "','" + layerid + "')\" />";
            html += "    <s><i></i></s>";
            html += "  </div>";
        }


        html += "</div>";
        $("#divOpenFunc").append(html);
        //熱區圖slider 2016/08/31 Kevin
        if (showHeatMap) {

            var blurCtrl = document.getElementById("blurControl");
            var maxCtrl = document.getElementById("maxControl");
            var minCtrl = document.getElementById("minControl");
            blurCtrl.addEventListener("change", function (evt) {
                var r = +evt.target.value;
                if (r !== heatmapRdr.blurRadius) {
                    heatmapRdr.blurRadius = r;
                    heatmapLayer.redraw();
                }
            });
            maxCtrl.addEventListener("change", function (evt) {
                var r = +evt.target.value;
                if (r !== heatmapRdr.maxPixelIntensity) {
                    heatmapRdr.maxPixelIntensity = r;
                    heatmapLayer.redraw();
                }
            });
            minCtrl.addEventListener("change", function (evt) {
                var r = +evt.target.value;
                if (r !== heatmapRdr.minPixelIntensity) {
                    heatmapRdr.minPixelIntensity = r;
                    heatmapLayer.redraw();
                }
            });
        }
        //事件綁定
        //關閉圖層按鈕事件
        $("#opOpnImg" + funcobj.ID).unbind('click').bind("click",
            {
                id: funcobj.ID,
                cname: funcobj.CName,
                exec: funcobj.Exec
            },
            function (e) {
                funcobj.Checked = "N";
                switchFuncModule(e.data.id, e.data.cname, e.data.exec, false, typeof (mode) == "undefined" ? "" : mode);
                var layerHeatmap = map.getLayer("layerHeatmapFeature" + e.data.id);
                if (typeof (layerHeatmap) != "undefined") {
                    map.removeLayer(layerHeatmap);
                }
            });

        //圖例眼睛按鈕事件
        $("#showLayer" + funcobj.ID).unbind('change').bind("change", { id: funcobj.ID }, function (e) { SetQFuncVisibleByID(e.data.id); });
        //$("#opShwImg" + funcobj.ID).unbind('click').bind("click", { id: funcobj.ID }, function (e) { SetQFuncVisibleByID(e.data.id); });

        //表單TOOL按鈕事件
        if (funcobj.Exec.indexOf("RTUI") >= 0) {
            $("#opFrmImg" + funcobj.ID).unbind('click').bind("click", { id: funcobj.ID, formid: formid }, function (e) { switchFuncFrm(e.data.id, e.data.formid); });
        }

        //透明度TOOL按鈕事件
        $("#opOpaImg" + funcobj.ID).unbind('click').bind("click", { id: "FuncOpa" + funcobj.ID }, function (e) { switchFuncOpa(e.data.id, e.pageY + 15); });

        $("#heatmapImg" + funcobj.ID).unbind('click').bind("click", { id: "heatmapOpa" + funcobj.ID }, function (e) {
            switchHeatmap(e.data.id, e.pageY + 15);
            //$('#heatmapOpa' + funcobj.ID ).show();
        });
        var sliders = document.querySelectorAll(".HeatMap input[type=range]");
        var addLiveValue = function (ctrl) {
            var val = ctrl.nextElementSibling.querySelector("span");
            ctrl.addEventListener("input", function (evt) {
                val.innerHTML = evt.target.value;
            });
        };
        for (var i = 0; i < sliders.length; i++) {
            addLiveValue(sliders.item(i));
        }
        $("#of_layerMapPainter").remove();
        
    } else {
        for (var i = arrOpenFuncs.length - 1; i >= 0; i--) {
            if (arrOpenFuncs[i].ID == funcobj.ID) {

                //funcobj.Open = "N";
                funcobj.Show = "N";
                funcobj.EyeSee = "N"; //圖例眼睛開合預設值

                //移出陣列
                arrOpenFuncs.splice(i, 1);

                //移出圖例區
                if ($("#opFunc" + funcobj.ID).length > 0) {
                    $("#opFunc" + funcobj.ID).remove();
                }
            }
        }
    }

}

//透明度工具開關
function switchFuncOpa(opaid, y) {

    //$("#divOpenFunc .Opa").not("#" + opaid).hide();
    $(".Opa").not("#" + opaid).hide();

    if ($("#" + opaid).is(":hidden")) {
        $("#" + opaid).show();
        $("#" + opaid).offset({ top: y});
    } else {
        $("#" + opaid).hide();
    }
}

function switchHeatmap(opaid, y) {

    //$("#divOpenFunc .Opa").not("#" + opaid).hide();
    //$(".Opa").not("#" + opaid).hide();
    var layerID = opaid.replace(/heatmapOpa/, "");
    console.log(layerID);
    var layer = map.getLayer("layerFeature" + layerID);
    var layerHeatmap = map.getLayer("layerHeatmapFeature" + layerID);
    if ($("#" + opaid).is(":hidden")) {
        console.log('show');
        $("#" + opaid).show();
        $("#" + opaid).offset({ top: y });
        //map.removeLayer(featureLayer);
        //map.addLayer(heatmapLayer);
        console.log(heatmapLayer);
        //layer.setVisibility(false);
        SetQFuncVisibleByID(layerID);
        heatmapLayer.setVisibility(true);
    } else {
        console.log('hide');
        $("#" + opaid).hide();
        //map.removeLayer(heatmapLayer);
        //map.addLayer(featureLayer);
        //layer.setVisibility(true);
        SetQFuncVisibleByID(layerID);
        heatmapLayer.setVisibility(false);
    }
}

//點擊透明度
function clickFuncOpa(val, opaboxid, layerid) {
    setLayerOpa(val, opaboxid, layerid);
    setLayerOpaImgSrc(opaboxid, val);
}

//圖層透明度設定
function setLayerOpa(val, opaboxid, layerid) {

    //設定layer透明度
    var layer = map.getLayer(layerid);
    var valOpacity = 1 - (Math.round(val * 100) / 100);

    if (typeof (layer) != "undefined") {
        try {
            if (layerid.indexOf("layerKML") != -1) { //KMLlayer要特別處理
                if (typeof (layer._fLayers) != "undefined") {
                    for (var i = 0; i < layer._fLayers.length; i++) {
                        map.getLayer(layer._fLayers[i].id).setOpacity(valOpacity);
                    }
                }
                if (typeof (layer._groundLyr) != "undefined") {
                    map.getLayer(layer._groundLyr.id).setOpacity(valOpacity);
                }
                if (typeof (layer._links) != "undefined") {
                    for (var i = 0; i < layer._links.length; i++) {
                        map.getLayer(layer._links[i].id).setOpacity(valOpacity);
                    }
                }
            } else {
                layer.setOpacity(valOpacity);
            }
        } catch (e) { }
    }
}

//設定圖層透明度圖示
function setLayerOpaImgSrc(opaboxid, val) {
    //重設圖片src
    $("#" + opaboxid).find("img:gt(0)").attr("src", function () { return this.src.replace("on", "off") });

    if (typeof (event) != "undefined" && event != null) {
        var obj = event.srcElement ? event.srcElement : event.target;
        if (obj.nodeName == "IMG") {
            $(obj).attr("src", function () { return this.src.replace("off", "on") });
        }
    } else {
        for (var i = 0; i < 8; i++) {
            var sVal = (i == 0) ? i : i / 10;
            var eVal = (i == 0) ? i : (i + 1) / 10;

            if (val > 0.7) {
                $("#" + opaboxid).find("img:eq(8)").attr("src", function () { return this.src.replace("off", "on") });
                break;
            } else if (val > sVal && val <= eVal) {
                $("#" + opaboxid).find("img:eq(" + (i + 1).toString() + ")").attr("src", function () { return this.src.replace("off", "on") });
                break;
            }
        }
    }
}

//切換客製化表單開關
function switchFuncFrm(funcid, divformid) {
    if ($("#" + divformid).length > 0) {
        if ($("#" + divformid).is(":hidden")) {
            $("#" + divformid).show();
            $("#opFrmImg" + funcid).attr("src", "images/FuncList/icon-43.png")
        } else {
            $("#" + divformid).hide();
            $("#opFrmImg" + funcid).attr("src", "images/FuncList/icon-44.png")
        }
    }
}

//關閉全部圖層
function closeAllLayer() {
    if (isRIDMode == "Y") {
        for (var i = arrOpenFuncs.length - 1; i >= 0; i--) {
            arrOpenFuncs[i].Checked = "N";
            switchFuncModule(arrOpenFuncs[i].ID, arrOpenFuncs[i].Name, arrOpenFuncs[i].Exec, false, "cbFuncRID");
        }
    }
    else {
        for (var i = arrOpenFuncs.length - 1; i >= 0; i--) {
            arrOpenFuncs[i].Checked = "N";
            switchFuncModule(arrOpenFuncs[i].ID, arrOpenFuncs[i].Name, arrOpenFuncs[i].Exec, false, "");
        }
    }

    // 2015/12/08 整合影像比對
    if (typeof (oMapPainter) != "undefined") {
        oMapPainter.removeMPLegend(); //移除圖例區畫布
    }
}

//重新附加已開啟圖層(for reinit map)
function readdOpenLayer() {

    //已勾選道路註記, 重新附加
    var imgsrc = $("#cbTwLabel").attr("src");
    if (imgsrc.indexOf("uncheck.png") < 0)
    {
        var layerUrl = (isToken == "Y") ? gpTwLabel + "?Token=" + gpNCDR_Token : gpTwLabel;
        lyrTiledMapTwLabel = new esri.layers.ArcGISTiledMapServiceLayer(layerUrl, { id: "lyrTiledMapTwLabel" }); //道路註記
        map.addLayer(lyrTiledMapTwLabel);
        switchTwLabel(true);
    }

    for (var i = arrOpenFuncs.length - 1; i >= 0; i--) {

        switchFuncModule(arrOpenFuncs[i].ID, arrOpenFuncs[i].Name, arrOpenFuncs[i].Exec, true, "");

        var layer = map.getLayer(arrOpenFuncs[i].layerid)
        if (arrOpenFuncs[i].EyeSee == "N") {
            layer.hide();
        } else {
            layer.show();
        }
    }
}

//重整已開啟圖層資料
function refreshOpenLayer() {
    var exec, layer;

    for (var i = 0; i < arrOpenFuncs.length; i++) {
        exec = arrOpenFuncs[i].Exec;

        if (exec == "DBPoint" || exec == "ExcelPoint" || exec == "RTUI") {
            layer = map.getLayer(arrOpenFuncs[i].layerid)
        } else {
            continue;
        }

        if (typeof (layer) == "undefined") continue;
        if (layer.id.indexOf('RID') > 0) continue;//圖層為即時情資選單，無需Refresh

        //DB點圖層
        if (exec == "DBPoint" || exec == "ExcelPoint") {
            reloadDBPoint(arrOpenFuncs[i]);

            //重整CCTV // 2015/12/15 整合水文情資模板
            if (typeof (_oRT_CCTV) != "undefined" && _oRT_CCTV != null && (i + 1) == arrOpenFuncs.length) {
                if ($(".viewRT_History.ui-draggable[id^='RT_CCTV']").length > 0) setTimeout(function () { _oRT_CCTV.relocdiv(); }, 1000);
            }
        }

        if (exec == "RTUI") {
            //重新定位雨量圓餅圖
            if (typeof (oRT_Rain) != "undefined" && oRT_Rain != null) {
                RemoveGraphicByID(oRT_Rain.Layer, "Com-line", "");
                $.when(oRT_Rain.refreshDataTable(oRT_Rain.arrSrcData)).done(function () {
                    if ($("#divRT_RainChart").length > 0) oRT_Rain.relocChart();

                    //重畫歷線圖與圖點連結線 2014/10/20 add by vicky
                    if ($(".viewRT_History[charttype=RT_RainHistory]").length > 0) oRT_Rain.redrawHisChartLine();
                });
            }

            //重整河川水位資料
            if (typeof (oRT_WraRiver) != "undefined" && oRT_WraRiver != null) {
                RemoveGraphicByID(oRT_WraRiver.Layer, "Com-line", "");
                $.when(oRT_WraRiver.refreshDataTable(oRT_WraRiver.arrSrcData)).done(function () {
                    //重畫歷線圖與圖點連結線 2014/10/20 add by vicky
                    if ($(".viewRT_History[charttype=RT_WraRiverHistory]").length > 0) oRT_WraRiver.redrawHisChartLine();
                });
            }

            //重整水庫水位資料
            if (typeof (oRT_WraReservoir) != "undefined" && oRT_WraReservoir != null) {
                RemoveGraphicByID(oRT_WraReservoir.Layer, "Com-line", "");
                $.when(oRT_WraReservoir.refreshDataTable(oRT_WraReservoir.arrSrcData)).done(function () {
                    //重畫歷線圖與圖點連結線 2014/10/20 add by vicky
                    if ($(".viewRT_History[charttype=RT_WraReservoirHistory]").length > 0) oRT_WraReservoir.redrawHisChartLine();
                });
            }

            //重整潮位水位資料
            if (typeof (oRT_TideLevel) != "undefined" && oRT_TideLevel != null) {
                RemoveGraphicByID(oRT_TideLevel.Layer, "Com-line", "");
                $.when(oRT_TideLevel.refreshDataTable(oRT_TideLevel.arrSrcData)).done(function () {
                    //重畫歷線圖與圖點連結線 2014/10/20 add by vicky
                    if ($(".viewRT_History[charttype=RT_TideLevelHistory]").length > 0) oRT_TideLevel.redrawHisChartLine();
                });
            }

            //重整災損圖層
            if (typeof (oRT_SEDLE) != "undefined" && oRT_SEDLE != null) {
                oRT_SEDLE.refreshDataTable(oRT_SEDLE.arrSrcData);
            }
            //重整災損圖層(警戒)
            if (typeof (oRT_SEDLE_ALERT) != "undefined" && oRT_SEDLE_ALERT != null) {
                oRT_SEDLE_ALERT.refreshDataTable(oRT_SEDLE_ALERT.arrSrcData);
            }
        }
    }

    //最後重劃合併歷線圖連結線(如果arrLineCharsId.length > 0)
    if (typeof (arrLineCharsId) != "undefined") { //如果有用到HighChartsFun.js才會被定義(所以加入判斷是否已定義)
    for (var i = 0; i < arrLineCharsId.length; i++) {
        var obj = "";
        if (oRT_Rain) {
            obj = getArryObj(oRT_Rain.arrSrcData, 'STID', arrLineCharsId[i]);
            if (obj != "") {
                var targetPt = { "id": obj.STID ? obj.STID : obj.STNO, "coord": [obj.TM_X, obj.TM_Y] };
                oRT_Rain.drawHisChartLine($("#dragChart_" + arrLineCharsId[i]), targetPt);
                continue;
            }
        }

        if (oRT_WraRiver) {
            obj = getArryObj(oRT_WraRiver.arrSrcData, 'STID', arrLineCharsId[i]);
            if (obj != "") {
                var targetPt = { "id": obj.STID ? obj.STID : obj.STNO, "coord": [obj.TM_X, obj.TM_Y] };
                oRT_WraRiver.drawHisChartLine($("#dragChart_" + arrLineCharsId[i]), targetPt);
                continue;
            }
        }

        if (oRT_WraReservoir) {
            obj = getArryObj(oRT_WraReservoir.arrSrcData, 'STNO', arrLineCharsId[i]);
            if (obj != "") {
                var targetPt = { "id": obj.STID ? obj.STID : obj.STNO, "coord": [obj.TM_X, obj.TM_Y] };
                oRT_WraReservoir.drawHisChartLine($("#dragChart_" + arrLineCharsId[i]), targetPt);
                continue;
            }
        }

        if (oRT_TideLevel) {
            obj = getArryObj(oRT_TideLevel.arrSrcData, 'STID', arrLineCharsId[i]);
            if (obj != "") {
                var targetPt = { "id": obj.STID ? obj.STID : obj.STNO, "coord": [obj.TM_X, obj.TM_Y] };
                oRT_TideLevel.drawHisChartLine($("#dragChart_" + arrLineCharsId[i]), targetPt);
                continue;
            }
        }
    }
}
}

//重新設定地圖貼圖尺寸
function resetImgLayer(layer) {
    var arryGra = layer.graphics;
    for (var j = 0; j < arryGra.length; j++) {
        var graphic = arryGra[j];

        if (graphic.symbol.type == "picturemarkersymbol") {

            var relX_D = graphic.attributes["RelX"];
            var relY_D = graphic.attributes["RelY"];
            var rel_N = map.__LOD.resolution;
            var Width = parseInt(graphic.attributes["Width"]);
            var Height = parseInt(graphic.attributes["Height"]);
            var wh = parseInt(Width * (relX_D / rel_N));
            var ht = parseInt(Height * (relY_D / rel_N));

            graphic.symbol.setWidth(wh);
            graphic.symbol.setHeight(ht);

            //無中心點座標時，依左上座標位移
            if (graphic.attributes["Cx"] == "" || graphic.attributes["Cy"] == "") {
                graphic.symbol.setOffset(parseInt(wh) / 2, -(parseInt(ht) / 2));
            }
        }
    }
}

//設定表單預設顯示狀態(開關)
function setFrmDfVisible(funcid, divformid) {
    if (isPPTMode == "Y" || isRIDMode == "Y") { //簡報播放模式或即時情資展示時,一律不開啟表單
        $("#opFrmImg" + funcid).attr("src", "images/FuncList/icon-44.png");
        $("#" + divformid).css("display", "none");
    } else {
        if (IsRTUIFrmOpen == "Y") {
            $("#opFrmImg" + funcid).attr("src", "images/FuncList/icon-43.png");
            $("#" + divformid).css("display", "block");
        }
        else {
            $("#opFrmImg" + funcid).attr("src", "images/FuncList/icon-44.png");
            $("#" + divformid).css("display", "none");
        }
    }
}

//重新排序圖層順序
function reorderLayer() {    
    var orderArry = arrOpenFuncs.sort(sortBy("lyrIdx", null));

    for (var i = 0 ; i < orderArry.length; i++) {
        var layer = map.getLayer(orderArry[i].layerid)
        if (typeof (layer) != "undefined") {
            var idx = orderArry[i].lyrIdx;
            map.reorderLayer(layer, idx);
        }
    }

    if (typeof (layerMapPainter) != "undefined") {
        map.reorderLayer(layerMapPainter, 500);
    }
}

//通用圖層函式********************************************************
//依座標貼點
function AddPointToLayer(x, y, attr, imgpath, imgW, imgH, gcid, layer) {
    var pt = new esri.geometry.Point(x, y, new esri.SpatialReference(mapSpRef));
    var sms = new esri.symbol.PictureMarkerSymbol(imgpath, imgW, imgH);
    /*
    var sms = new esri.symbol.PictureMarkerSymbol({
        "url": imgpath,
        "height": imgH,
        "width": imgW,
        "type": "esriPMS"
    });
    */

    var graphic = new esri.Graphic(pt, sms, attr);
    graphic.id = gcid;
    layer.add(graphic); //貼圖
}

//畫多邊形(點陣列，屬性，樣式，圖層ID，圖層)
function AddPolygonToLayer(ring, attr, sfs, gcid, layer) {
    var poly = new esri.geometry.Polygon(new esri.SpatialReference(mapSpRef));
    var graphic;
    //加入點陣列
    poly.addRing(ring);
    if (layer.id == "graLayer_effectPopu") {//如果是影響人口圖層，則須加上InfoWindow     
        var infoTemplate = new esri.InfoTemplate("影響人口數", " 統計區編碼: ${CODEBASE}<br/>人口數: ${P_CNT}人");
        //var infoTemplate = new esri.InfoTemplate("影響人口數", " ${TOWN} ${VILLAGE}<br/>統計區編碼:${CODEBASE}<br/> 人口數: ${P_CNT}人");
        graphic = new esri.Graphic(poly, sfs, attr, infoTemplate);
    } else if (layer.id == "graLayer_procObj") {//如果是保全對象圖層，則須加上InfoWindow
        var infoTemplate = new esri.InfoTemplate("保全對象人口數", "  ${nFullName}<br/>人口數: ${persons}人");
        //var infoTemplate = new esri.InfoTemplate("保全對象人口數", "  ${nFullName}<br/>人口數: ${persons}人");
        graphic = new esri.Graphic(poly, sfs, attr, infoTemplate);
    }
    else {
        graphic = new esri.Graphic(poly, sfs, attr);
        graphic.id = gcid;
    }
   
    layer.add(graphic); //貼圖　
}

//依資料來源貼圖Graphic(RealImage、EstImage)
function AddGraphicToLayer(obj, fnid, fnname, layer) {
    if (typeof (obj) == "undefined") return;

    //取出圖片路徑
    var gpPath = obj.Path;
    if (fnname == "P01") gpPath = obj.Path.substr(0, obj.Path.length - 4) + ".jpg";
    var pictUrl = gpNCDRPICUrl + gpPath;

    if (fnname.substr(0, 3) == "P59" || fnname.substr(0, 3) == "P60")
        pictUrl = gpPath;

    //設定圖片
    var sms = new esri.symbol.PictureMarkerSymbol({
        "url": pictUrl,
        "width": obj.Width,
        "height": obj.Height
    });

    //依當前比例尺縮放圖片尺寸
    var relX_D = obj.RelX;
    var relY_D = obj.RelY;
    var rel_N = map.__LOD.resolution;
    var wh = obj.Width * (relX_D / rel_N);
    var ht = obj.Height * (relY_D / rel_N);
    sms.setWidth(wh);
    sms.setHeight(ht);

    //設定定位點
    var pt;
    if (obj.Cx != "" && obj.Cy != "") {
        pt = new esri.geometry.Point(obj.Cx, obj.Cy, map.spatialReference)
    } else {
        pt = new esri.geometry.Point(obj.Lx, obj.Ty, map.spatialReference)

        //座標位移:以縮放後的尺寸位移
        sms.setOffset(parseInt(wh) / 2, -(parseInt(ht) / 2));
    }

    //var graphic = new esri.Graphic(pt, sms, attrs); //设置样式
    var graphic = new esri.Graphic(pt, sms, obj); //设置样式
    graphic.id = "img" + fnid + "_" + fnname;

    layer.add(graphic); //貼圖　
}

//依資料來源貼圖MapImage(RealImage、EstImage)
function AddMapImageToLayer(obj, fnid, fnname, layer) {
    if (typeof (obj) == "undefined") return;

    //取出圖片路徑
    var gpPath = obj.Path
    var pictUrl = gpNCDRPICUrl + gpPath;
    if (fnname.substr(0, 3) == "P59" || fnname.substr(0, 3) == "P60")
        pictUrl = gpPath;

    var mi = new esri.layers.MapImage({
        'extent': { 'xmin': obj.Lx, 'ymin': obj.Dy, 'xmax': obj.Rx, 'ymax': obj.Ty, 'spatialReference': mapSpRef },
        'href': pictUrl
    });
    layer.addImage(mi);
}

/* 移除layer上圖片或圖點(RealImage、EstImage、DBPoint)
 * layer:貼圖圖層
 * fnid:功能id, 空白則移除該圖層所有貼圖
 * fmt:graphic id 前置詞(img/pt)
 * spt:graphic id 分隔符號
 */
function RemoveGraphicFromLayer(layer, fnid, fmt, spt) {
    var tmpGC = layer.graphics;
    var cnt = tmpGC.length;
    for (var i = tmpGC.length - 1; i >= 0; i--) {
        if (typeof (tmpGC[i].id) != "undefined") {
            if (fnid == "") {
                layer.remove(tmpGC[i]);
            }
            else { //移除指定功能項之圖片
                if (tmpGC[i].id.replace(fmt, "").split(spt)[0] == fnid) {
                    layer.remove(tmpGC[i]);
                }
            }
        }
    }
}

/* 移除layer上指定圖片或圖點
 * layer:貼圖圖層
 * gcid:圖片ID
 * mode:比對模式(all/part)
 */
function RemoveGraphicByID(layer, gcid, mode) {
    if (gcid == "" && mode == "") layer.clear();

    var tmpGC = layer.graphics;
    for (var i = tmpGC.length - 1; i >= 0; i--) {
        if (typeof (tmpGC[i].id) == "undefined") continue;

        if (gcid == "") {
            layer.remove(tmpGC[i]);
        } else {
            if (mode == "all") {
                if (tmpGC[i].id == gcid) {
                    layer.remove(tmpGC[i]);
                }
            } else {
                if (tmpGC[i].id.indexOf(gcid) > -1) {
                    layer.remove(tmpGC[i]);
                }
            }
        }
    }
}

//重新指定圖片內容Graphic(RealImage、EstImage)
function ResetGraphicSms(obj, fnid, fnname, layer) {
    if (typeof (obj) == "undefined ") return;

    var arrGC = layer.graphics;
    for (var i = arrGC.length - 1; i >= 0; i--) {
        if (typeof (arrGC[i].id) == "undefined") continue;

        if (arrGC[i].id == "img" + fnid + "_" + fnname) {

            //取出圖片路徑
            var gpPath = obj.Path;
            if (fnname == "P01")
                gpPath = obj.Path.substr(0, obj.Path.length - 4) + ".jpg";

            var sms = new esri.symbol.PictureMarkerSymbol({
                "url": gpNCDRPICUrl + gpPath,
                "width": obj.Width,
                "height": obj.Height
            });

            //依當前比例尺縮放圖片尺寸
            var relX_D = obj.RelX;
            var relY_D = obj.RelY;
            var rel_N = map.__LOD.resolution;
            var wh = obj.Width * (relX_D / rel_N);
            var ht = obj.Height * (relY_D / rel_N);
            sms.setWidth(wh);
            sms.setHeight(ht);

            arrGC[i].setSymbol(sms);
        }
    }


}

//重新指定圖片內容MapImage(RealImage、EstImage)
function resetMapImageToLayer(obj, fnid, fnname, layer) {
    if (typeof (obj) == "undefined ") return;

    //取出圖片路徑
    var gpPath = obj.Path
    var pictUrl = gpNCDRPICUrl + gpPath;
    if (fnname.substr(0, 3) == "P59" || fnname.substr(0, 3) == "P60")
        pictUrl = gpPath;

    //layer._mapImages[0].href = pictUrl;
    //layer.resume();
    //layer.removeAllImages(); 一次清除所有圖片 -> 會露出底圖(改用以下方法)
    var mi = new esri.layers.MapImage({
        'extent': { 'xmin': obj.Lx, 'ymin': obj.Dy, 'xmax': obj.Rx, 'ymax': obj.Ty, 'spatialReference': mapSpRef },
        'href': pictUrl
    });
    layer.addImage(mi);

    //圖片緩衝(保留部分圖片 -> 才不會露出底圖)
    if (layer.getImages().length > 5)
        layer.removeImage(layer.getImages()[0]);
}

//顯示指定點位之infowindow
function showPointTip(sPoint, title, content, w, h) {
    map.infoWindow.resize(w, h);
    map.infoWindow.setTitle(title);
    map.infoWindow.setContent(content);
    //Su-170508 如果設定0 就改使用content預設 + 20
    if (w == 0 || h == 0) {

        w = map.infoWindow._contentPane.scrollWidth + 20;

        h = map.infoWindow._contentPane.scrollHeight + 20
        h = (h > 350) ? 350 : h;
        w = (w < 200) ? 200 : w;
    }
    map.infoWindow.resize(w, h);
    map.infoWindow.show(sPoint, map.getInfoWindowAnchor(sPoint));
}

//RTUI客製表單函式********************************************************
/* 圖查文
 * name: 資料名稱 
 * key: 資料鍵值 
 * tb: 頁面table name 
 * trpre: 頁面tr id前置詞, 空白時不做TR變色處理 
 */
function GraphicToRecord(name, key, tb, trpre) {
    //取出圖點於所有資料集的Index
    var allData = $("#" + tb).dataTable().fnGetData();
    var dataIdx = 0;
    for (i = 0; i < allData.length; i++) {
        if (allData[i][name] == key) {
            dataIdx = i;
            break;
        }
    }

    //取出圖點於當前資料集的Index
    var dspIdx;
    var dspData = $("#" + tb).dataTable().fnSettings().aiDisplay;
    dspIdx = $.inArray(dataIdx, dspData);

    //計算所在頁次
    var pageCnt = $("#" + tb).dataTable().fnPagingInfo().iLength;
    var locPage = 0;
    if ((dspIdx + 1) > pageCnt) locPage = parseInt((dspIdx + 1) / pageCnt);
    $("#" + tb).dataTable().fnPageChange(locPage);

    //資料列變色
    if (trpre != "") {
        $("#" + tb + " tr").removeAttr("style");
        $("#" + trpre + key).attr("style", "border: 2px solid #0013EC");
    }
}

/* 文查圖(滑鼠移入record:定位圖點閃爍)
 * x: x座標 
 * u: x座標
 * layername: 圖層名稱
 */
function RecordToGraphic(x, y, layername) {
    e = arguments.callee.caller.arguments[0] || window.event;
    //a = e.target || e.srcElement;

    var layer = map.getLayer(layername);
    if (e.type == "mouseout" || e.type == "mouseleave") {
        if (typeof (layer) != "undefined") {
            map.removeLayer(layer);
        }
        return;
    }

    if (typeof (layer) == "undefined") {
        layer = new esri.layers.GraphicsLayer({ id: layername });
        map.addLayer(layer);
    }

    var pt = new esri.geometry.Point(x, y, new esri.SpatialReference(mapSpRef));
    var sms = new esri.symbol.PictureMarkerSymbol({
        "url": "images/other/Red_glow.gif",
        "height": 40,
        "width": 40,
        "type": "esriPMS"
    });

    var graphic = new esri.Graphic(pt, sms);
    layer.add(graphic); //貼圖　
    layer.setOpacity(0.5);
}

//移除資料表篩選函式
function RemoveTbFilter(tableid) {
    for (var i = 0; i < arrRtuiTbFilter.length; i++) {
        if (arrRtuiTbFilter[i] == tableid) {
            arrRtuiTbFilter.splice(i, 1);
            break;
        }
    }

    for (var j = 0; j < $.fn.dataTableExt.afnFiltering.length; j++) {
        if ($.fn.dataTableExt.afnFiltering[j].tbName == tableid) {
            $.fn.dataTableExt.afnFiltering.splice(j, 1);
            break;
        }
    }
}
//取得Graphics的Extent
function getGraphicsExtent(graphics) {
    var geometry, extent, ext;
    dojo.forEach(graphics, function (graphic, i) {
        geometry = graphic.geometry;

        if (geometry instanceof esri.geometry.Point) {
            ext = new esri.geometry.Extent(geometry.x -1, geometry.y -1, geometry.x +1, geometry.y +1, geometry.spatialReference);
        }
        else if (geometry instanceof esri.geometry.Extent) {
            ext = geometry;
        }
        else {
            ext = geometry.getExtent();
        }

        if (extent) {
            extent = extent.union(ext);
        }
        else {
            extent = new esri.geometry.Extent(ext);
        }
    });
    return extent;
}

// 2015/07/30 示警平台前台 Start
var DefaultLimitData;
var DefReloadLimit = false, DefJudgeLimit = false; // 2015/09/08 修改 : 網頁自動更新機制
var DefRainWarnTime = '', DefRiverWarnTime = '', Def_refreshIntervalId = ''; // 2015/09/08 修改 : 網頁自動更新機制
function setDefaultMegDivShow(obj) {
    if ($(obj).parent().css('height') != '27px')
        $(obj).parent().animate({ 'height': '27px' }, 700);
    else
        $(obj).parent().animate({ 'height': '300px' }, 700);
}

function getDefaultLimitData() {
    var url = "GetData/funcWidget/getLimitData.ashx";
    $.ajax({
        url: url,
        type: 'get',
        data: {
            GrpID: oGrpInfo.GrpId,
            IsLocalEdition: oGrpInfo.IsLocalEdition
        },
        dataType: "json",
        cache: false,   //不允許快取   
        success: function (data) {

            if (!DefJudgeLimit) { // 2015/09/08 修改 : 網頁自動更新機制()
                DefaultLimitData = data;
                if (DefaultLimitData != undefined) {
                    $('#MegDivSimple').show();

                    // 2015/09/08 修改 : 網頁自動更新機制
                    if (!DefReloadLimit) {
                        setDefaultMegDivShow($('#MegDivSimpleCtrl'));
                        $('audio')[0].play();
                    }

                    for (var i = 0; i < data.RainLimitList[0].length; i++) {
                        var RainLimitData = data.RainLimitList[0][i];
                        var sHtml = '<div class="MegDivClass" onclick="openBmkAndCenter(' + RainLimitData.BookId + ',' + RainLimitData.nWGS84_Lon + ',' + RainLimitData.nWGS84_lat + ');">';
                        sHtml += RainLimitData.WarnLevel + '，';
                        sHtml += '請關注，';

                        var cHtml = '';
                        for (var j = 0; j < data.RainFocusList[0].length; j++) {
                            if (data.RainFocusList[0][j].LimitID == RainLimitData.LimitID)
                                cHtml += '<a href=\'#\' style="text-decoration: underline;" onclick="DefaultFocusCenter(event,' + data.RainFocusList[0][j].WGS84Lon + ',' + data.RainFocusList[0][j].WGS84Lat + ');">' + data.RainFocusList[0][j].Focus + '</a>、';
                        }

                        sHtml += cHtml.substring(0, (cHtml.length - 1));
                        sHtml += '單位' + RainLimitData.GrpName + '：' + RainLimitData.STNM + '雨量站，';
                        sHtml += getDefaultLimitType(RainLimitData.WarnReason, 'Rain') + ' ' + RainLimitData.WarnRain + ' mm，';
                        sHtml += '達' + getDefaultLimitType(RainLimitData.WarnReason, 'Rain') + ' ' + RainLimitData.WarnLimit + ' mm 門檻';
                        sHtml += '</div>'

                        $('#MegDivSimple div:eq(1)').append(sHtml);
                    };

                    for (var i = 0; i < data.RiverLimitList[0].length; i++) {
                        var RiverLimitData = data.RiverLimitList[0][i];
                        var sHtml = '<div class="MegDivClass" onclick="openBmkAndCenter(' + RiverLimitData.BookId + ',' + RiverLimitData.nWGS84_Lon + ',' + RiverLimitData.nWGS84_lat + ');">';
                        sHtml += RiverLimitData.WarnLevel + '，';
                        sHtml += '請關注，';

                        var cHtml = '';
                        for (var j = 0; j < data.RiverFocusList[0].length; j++) {
                            if (data.RiverFocusList[0][j].RLimitID == RiverLimitData.RLimitID)
                                cHtml += '<a href=\'#\' style="text-decoration: underline;" onclick="DefaultFocusCenter(event,' + data.RiverFocusList[0][j].WGS84Lon + ',' + data.RiverFocusList[0][j].WGS84Lat + ');">' + data.RiverFocusList[0][j].Focus + '</a>、';
                        }

                        sHtml += cHtml.substring(0, (cHtml.length - 1));
                        sHtml += '單位' + RiverLimitData.GrpName + '：' + RiverLimitData.ST_NAME + '河川水位站，';
                        sHtml += getDefaultLimitType(RiverLimitData.WarnReason, 'River') + ' ' + RiverLimitData.WarnRiver + ' 公尺，';
                        sHtml += '達' + getDefaultLimitType(RiverLimitData.WarnReason, 'River') + ' ' + RiverLimitData.WarnLimit + ' 公尺';
                        sHtml += '</div>'

                        $('#MegDivSimple div:eq(1)').append(sHtml);
                    };

                    // 2015/09/08 修改 : 網頁自動更新機制
                    clearInterval(Def_refreshIntervalId);
                    Def_refreshIntervalId = setInterval(function () {
                        DefReloadLimit = true;
                        DefJudgeLimit = true;
                        getDefaultLimitData();
                    }, (LimitReloadMin * 60 * 1000));

                    $('#MegReload').css('display', 'none');
                }
            }
            else {
                var showBtn = false;
                if (DefRainWarnTime == '')
                    DefRainWarnTime = data.RainLimitList[0][0].WarnTime.toString();

                if (DefRiverWarnTime == '')
                    DefRiverWarnTime = data.RiverLimitList[0][0].WarnTime.toString();

                if (DefRainWarnTime != data.RainLimitList[0][0].WarnTime.toString()) {
                    //alert('雨量該更新了 : ' + RainWarnTime + '   ' + data.RainLimitList[0][0].WarnTime.toString());
                    DefRainWarnTime = data.RainLimitList[0][0].WarnTime.toString();
                    showBtn = true;
                }

                if (DefRiverWarnTime != data.RiverLimitList[0][0].WarnTime.toString()) {
                    //alert('河川該更新了 : ' + RiverWarnTime + '   ' + data.RiverLimitList[0][0].WarnTime.toString());
                    DefRiverWarnTime = data.RiverLimitList[0][0].WarnTime.toString();
                    showBtn = true;
                }

                if (showBtn)
                    $('#MegReload').css('display', 'block');
            }
        },
        error: function () {
        }
    });
}

// 2015/09/08 修改 : 網頁自動更新機制
function reloadDefLimitData() {
    DefJudgeLimit = false;
    DefReloadLimit = true;
    $('#MegDivSimple div:eq(1)').empty();
    getDefaultLimitData();
}

function getDefaultLimitType(type, typesrc) {
    var reTypeName = '';

    if (typesrc == 'Rain') {
        switch (type) {
            case 'WLMIN_10': case 'ALMIN_10': reTypeName = '10分鐘'; break;
            case 'WLHour_1': case 'ALHour_1': reTypeName = '1小時'; break;
            case 'WLHour_3': case 'ALHour_3': reTypeName = '3小時'; break;
            case 'WLHour_6': case 'ALHour_6': reTypeName = '6小時'; break;
            case 'WLHour_12': case 'ALHour_12': reTypeName = '12小時'; break;
            case 'WLHour_24': case 'ALHour_24': reTypeName = '24小時'; break;
        }
    }
    else if (typesrc == 'River') {
        switch (type) {
            case 'WStageWarn_1': case 'AStageWarn_1': reTypeName = '第一階段警示'; break;
            case 'WStageWarn_2': case 'AStageWarn_2': reTypeName = '第二階段警示'; break;
            case 'WStageWarn_3': case 'AStageWarn_3': reTypeName = '第三階段警示'; break;
        }
    }
    return reTypeName;
}

// 開啟對應的書籤(運用決策模版的default.js中函式) 與 定位到雨量站
function openBmkAndCenter(BmkID, Lon, Lat) {
    runBookmark(BmkID, false);
    if (Lon != '0' && Lat != '0') {
        setTimeout(function () {
            var pt = new esri.geometry.Point(parseFloat(Lon), parseFloat(Lat), new esri.SpatialReference(mapSpRef));
            map.centerAt(pt);
        }, 1000);
    }
}

//關注目標定位
function DefaultFocusCenter(e, Lon, Lat) {
    var pt = new esri.geometry.Point(parseFloat(Lon), parseFloat(Lat), new esri.SpatialReference(mapSpRef));
    map.centerAndZoom(pt, 7);
    e.stopPropagation();
}

// 2015/07/30 示警平台前台 End