/**********************************
 * SUMMARY ：快速定位 函式
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2014/03/12  Charlie Create
             
 **********************************/

function FastLocForAPI() {
    var oCom = this;
    oCom.Layer = "";       //圖層
    oCom.arrSrcData = [];  //來源資料集
    oCom.btnOnClick = "N";  //*//紀錄定位子功能是否被開啟過 N=否 Y=有 (預設否)
    oCom.btnLocViewMode = "Y";  //*//紀錄WGS84定位切換 N=否(度分秒) Y=有(十進位)
    oCom.isForFlooding = "N";
    oCom.geom;
    oCom.evtgeom;
    oCom.ext;
    var infoWindowEventHide; //infoWindow關閉事件
    oCom.hasAddrResult=false;

    // public method begin ////////////////////////////////////////////////////

    //載入資料源
    oCom.loadDataSrc = function () {
        var url = "";
        $.ajax({
            url: url,
            type: 'get',              // post/get
            dataType: "json",          // xml/json/script/html
            data: "",
            cache: false,              // 是否允許快取
            success: function (data) {
            },
            error: function () {
            }
        });
    }

    //GetMarkListData();//先取回地標定位總資料

    //介面初始化
    oCom.initFastLoc = function () {

        //介面生成       
        $('#tabRoadLocZone').append("<option value='不拘'>不拘</option>"); //縣市鄉鎮
        for (var i = 0; i < arrCounTown.length; i++) {
            if (arrCounTown[i].COUN_NA != "連江縣" && arrCounTown[i].COUN_NA != "金門縣") {  //定位過濾掉金門連江
                $('#tabRoadLocZone').append("<option value='" + arrCounTown[i].COUN_ID + "'>" + arrCounTown[i].COUN_NA + "</option>"); //公路定位用

                $('#tabLocLandmarkZone').append("<option value='" + arrCounTown[i].COUN_ID + "'>" + arrCounTown[i].COUN_NA + "</option>"); //地標定位用
            }
            //設定初始值
            //if (i == 0) {
            //    $('#tabRoadLocZone').val(arrCounTown[i].COUN_ID);
            //    createTownItems(arrCounTown[i].COUN_ID);
            //}
        }      
        ddlCountySelectChange(); //公路定位 道路名稱 
        getMarkList(); //地標定位 取得類別
        GetSelectCounty3Data(); //地標定位 取得鄉鎮資料        

        //事件綁定
        $("#divLocTool").on("click", ".LocTool", switchFastLoc);   //切換定位工具

        $("#btnLocQueryKW").click(function () { keywordSearch(); });   //關鍵字搜尋按鈕   

        $("#selLocCorSym").change(function () { selectCorSym(); });   //坐標定位切換下拉式選單
        $("#spanLocViewMode a").click(function () { changeCorSym(); });   //坐標定位切換坐標系統
        $("#btnLocCoorXY").unbind("click").on("click", function () { CoorLoc(''); });   //坐標定位按鈕  //+  將click改成onunbind跟on事件改寫在同一行  Kevin  2016/03/15         

        $("#tabRoadLocZone").on("change", function () { ddlCountySelectChange(); }); //縣市or道路別change事件  //+//
        $("#tabRoadLocType").on("change", function () { ddlCountySelectChange(); }); //縣市or道路別change事件  //+//
        $("#btnLocRoad").click(function () { RoadLoc(); });   //公路定位按鈕

        $("#tabLocLandmarkZone").on("change", function () { GetSelectCounty3Data(); }); //縣市change事件  //+//
        $("#tabLocLandmarkType").change(function () { MarkSelectChange(); });   //地標定位切換下拉式選單  /////
        $("#tabLocLandmarkVillage").change(function () { MarkSelectChange(); });   //地標定位切換下拉式選單  /////
        $("#tabLocLandmarkZone").change(function () { MarkSelectChangeZoneUse(); });   //地標定位切換下拉式選單  /////
        $("#btnLocLandmark").click(function () { MarkLoc(); });   //地標定位按鈕
        $("#btnLocLandmarkQueryKW").click(function () { LandmarkkeywordSearch(); });   //地標關鍵字搜尋按鈕    
        
    }
    //介面初始化 for 淹水兵棋台 Kevin Add 2016.3.11
    oCom.initFastLocFlooding = function () {

        //介面生成       
        /*$('#tabRoadLocZone').append("<option value='不拘'>不拘</option>"); //縣市鄉鎮
        for (var i = 0; i < arrCounTown.length; i++) {
            if (arrCounTown[i].COUN_NA != "連江縣" && arrCounTown[i].COUN_NA != "金門縣") {  //定位過濾掉金門連江
                $('#tabRoadLocZone').append("<option value='" + arrCounTown[i].COUN_ID + "'>" + arrCounTown[i].COUN_NA + "</option>"); //公路定位用

                $('#tabLocLandmarkZone').append("<option value='" + arrCounTown[i].COUN_ID + "'>" + arrCounTown[i].COUN_NA + "</option>"); //地標定位用
            }
            //設定初始值
            //if (i == 0) {
            //    $('#tabRoadLocZone').val(arrCounTown[i].COUN_ID);
            //    createTownItems(arrCounTown[i].COUN_ID);
            //}
        }
        ddlCountySelectChange(); //公路定位 道路名稱 
        getMarkList(); //地標定位 取得類別
        GetSelectCounty3Data(); //地標定位 取得鄉鎮資料    */    

        //事件綁定
        $("#divLocTool").on("click", ".LocTool", switchFastLoc);   //切換定位工具

        $("#btnLocQueryKW").click(function () { keywordSearch(); });   //關鍵字搜尋按鈕   

        $("#selLocCorSym").change(function () { selectCorSym(); });   //坐標定位切換下拉式選單
        $("#spanLocViewMode a").click(function () { changeCorSym(); });   //坐標定位切換坐標系統
        $("#FastLocPart #btnLocCoorXY").unbind("click");   //坐標定位按鈕   
        $("#FastLocPart #btnLocCoorXY").click(function () { CoorLoc('坐標定位'); });   //坐標定位按鈕       
        $("input[name='stepOne']:radio").on("change", function () { stepOneChange(); });//淹水中心點定位方式切換事件
       /* $("#tabRoadLocZone").on("change", function () { ddlCountySelectChange(); }); //縣市or道路別change事件  //+//
        $("#tabRoadLocType").on("change", function () { ddlCountySelectChange(); }); //縣市or道路別change事件  //+//
        $("#btnLocRoad").click(function () { RoadLoc(); });   //公路定位按鈕

        $("#tabLocLandmarkZone").on("change", function () { GetSelectCounty3Data(); }); //縣市change事件  //+//
        $("#tabLocLandmarkType").change(function () { MarkSelectChange(); });   //地標定位切換下拉式選單  /////
        $("#tabLocLandmarkVillage").change(function () { MarkSelectChange(); });   //地標定位切換下拉式選單  /////
        $("#tabLocLandmarkZone").change(function () { MarkSelectChangeZoneUse(); });   //地標定位切換下拉式選單  /////
        $("#btnLocLandmark").click(function () { MarkLoc(); });   //地標定位按鈕*/
        $("#btnLocLandmarkQueryKW").click(function () { LandmarkkeywordSearch(); });   //地標關鍵字搜尋按鈕 
        //dojo.disconnect(ClickLoc);
       fldClickHandler= dojo.connect(map, "onClick", ClickLoc);//地圖點擊事件
    }

    // private method begin ////////////////////////////////////////////////////
    //選到該定位方式時，才顯示該方式之輸入框 Added by Kevin 2016.3.12
    function stepOneChange()
    {
        //debugger;
        var selectItem = $("input[name='stepOne']:checked").val();

        if (selectItem == "mapClick") {
            //$('#txtLocKeyWord').attr('disabled', true);
            //$('#btnLocQueryKW').attr('disabled', true);
            $("#FastLocPart #LocAddressContent").hide();
            $("#FastLocPart #LocXYContent").hide();
            fldClickHandler = dojo.connect(map, "onClick", ClickLoc);
            $("#FastLocPart #btnLocCoorXY").unbind("click");   //坐標定位按鈕
            $("#FastLocPart #btnLocQueryKW").unbind("click");   //關鍵字搜尋按鈕  
        }
        else if (selectItem == "locAddress")
        {
            //$('#txtLocKeyWord').attr('disabled', false);
            //$('#btnLocQueryKW').attr('disabled', false);
            $("#FastLocPart #LocAddressContent").show();
            $("#FastLocPart #LocXYContent").hide();
            dojo.disconnect(fldClickHandler);
            $("#btnLocQueryKW").click(function () { keywordSearch(); });   //關鍵字搜尋按鈕   
            $("#FastLocPart #btnLocCoorXY").unbind("click");   //坐標定位按鈕
        }
        else if(selectItem=="locXY")
        {
            //$('#txtLocKeyWord').attr('disabled', true);
            //$('#btnLocQueryKW').attr('disabled', true);
            $("#FastLocPart #LocXYContent").show();
            $("#FastLocPart #LocAddressContent").hide();
            dojo.disconnect(fldClickHandler);
            $("#FastLocPart #btnLocCoorXY").click(function () { CoorLoc('坐標定位'); });   //坐標定位按鈕   
            $("#FastLocPart #btnLocQueryKW").unbind("click");   //關鍵字搜尋按鈕  
        }
    }

    function switchFastLoc(evt) {
        //$('#divFastLoc').show();
        $('#ToolsDiv').css('width', '292px'); // 2015/01/12 修改
        $('#ListBanner').css('display', 'block'); // 2015/01/12 修改
        $("#divFastLoc").show().css('height', (Number($('#divSubToolbar').css('height').replace('px', '')) - 15).toString() + 'px'); // 2015/01/12 修改

        var evtTarget = evt.srcElement ? evt.srcElement : evt.target;
        var toolid = $(evtTarget).attr("toolid");
        var toolName = $(evtTarget).attr('id').replace("img", "");

        curExecTool = toolid; //記錄點擊功能ID
        setCounterFunc(curExecTool, "", "Q", "GIS"); //定位功能操作記錄
        oCom.btnOnClick = "Y"; //紀錄定位子功能曾被開過

        //重設圖片 // 2015/01/12 修改
        //$("#divLocTool").find("img").attr("src", function () { return this.src.replace("On_", "Off_") });
        //$(evtTarget).attr("src", function () { return this.src.replace("Off_", "On_") });
        $("#divLocTool").find("div").css({ "background-color": "#FFF", "color": "#0084AD" });
        $(evtTarget).css({ "background-color": "#0084AD", "color": "#FFF" });

        $("#divFastLoc .LocOperate").hide();

        //*//行政區定位模組化--------------------------------------
        if (toolName == "LocRegion") {

            //if (typeof (oFastLocRegion) == "undefined") {
                $("#divLocRegion").load("ucWidget/FastLocRegion.htm", function () {
                
                    oFastLocRegion = new FastLocRegion();
                    oFastLocRegion.initFastLocRegion();
                    oFastLocRegion.map = map; //傳入地圖給模組呼叫使用
                    oFastLocRegion.layer = map.getLayer("layerFastLoc");

                });
            //} else {
            //    $("#divLocRegion").show();
            //}
        }
        //*//-----------------------------------------------------

        //*//流域定位模組化--------------------------------------
        if (toolName == "LocRiver") {
            
            //if (typeof (oFastLocRegion) == "undefined") {
            $("#divLocRiver").load("ucWidget/FastLocRiver.htm", function () {

                oFastLocRiver = new FastLocRiver();
                oFastLocRiver.initFastLocRiver();
                oFastLocRiver.map = map; //傳入地圖給模組呼叫使用
                oFastLocRiver.layer = map.getLayer("layerFastLoc");

            });
            //} else {
            //    $("#divLocRegion").show();
            //}
        }
        //*//-----------------------------------------------------

        $("#divFastLoc").find('#div' + toolName).show();
    }

    ////***************************************************關鍵字定位

    function doEnter(event) {//關鍵字按enter
        if (event.keyCode == 13 && chkSearchWordAndAlert() == true) {	//判斷輸入關鍵字是否正常
            keywordSearch();
        }
    }

    oCom.keywordSearch=function () {

        if (txtLocKeyWord.value == "") { alert("請輸入關鍵字"); }
        else {
            //取得關鍵字搜尋結果
            var cmd = "TGOSLocate";
            var keyword = encodeURI(txtLocKeyWord.value);
            var url = "GetData/funcWidget/GetFastLocData.ashx";

            $.ajax({
                url: url,
                type: 'get',
                data: {
                    "cmd": cmd,
                    "keyword": keyword
                },
                dataType: "json",
                cache: false,   //不允許快取   
                beforeSend: function () {
                    showLoading();
                },
                success: function (data) {
                    var KeyWordLoc = data;
                    //console.log(KeyWordLoc);
                    //$("#divLocXYResult table.tbody tbody").empty();
                    //$('#tabLocLandmarkVillage').append("<option value='不拘'>不拘</option>");
                    $("#addressResult").empty();
                    $("#closeSearchResult").show();
                    if (!oCom.hasAddrResult) {
                        $("#txtLocKeyWord").width($("#txtLocKeyWord").width() - 25);
                        oCom.hasAddrResult = true;
                    }
                    $("#closeSearchResult").unbind('click').bind("click", function () {
                        $("#addressResult").empty();
                        $("#closeSearchResult").hide();
                        $("#txtLocKeyWord").width($("#txtLocKeyWord").width() + 25);
                        $("#txtLocKeyWord").val('');
                        oCom.hasAddrResult = false;
                    });
                    for (var i = 0; i < KeyWordLoc.length; i++) {
                        var o = KeyWordLoc[i];

                        html = "";
                        //html += "<tr id=\"trFLoc" + i + "\">";
                        if (o.Source == "TGOS") {
                            html += "  <div style =\"padding:3px 0px 3px 5px;margin-right:-2px;font-size:12px;font-family:'微軟正黑體','Microsoft JhengHei';cursor:pointer;color:#767171;border:1px #BFBFBF solid;background-color:white;\" id=\"aFLoc" + i + "\" data-Cx= \"" + o.Cx + "\" data-Cy= \"" + o.Cy + "\" data-Addr= \"" + o.Addr + "\" data-Source= \"" + o.Source + "\" data-LTRB= \"" + o.LTRB + "\" >" + o.Addr + "</div>";
                        } else if (o.Source == "NCDR") {
                            html += "  <td><a style =\"color :#0000ff;\" id=\"aFLoc" + i + "\" data-Cx= \"" + o.Cx + "\" data-Cy= \"" + o.Cy + "\" data-Addr= \"" + o.Addr + "\" data-Source= \"" + o.Source + "\" data-LTRB= \"" + o.LTRB + "\" data-LocLevel= \"" + o.LocLevel + "\" >" + o.Addr + "</a></td>";
                        } else {
                            html += "  <td><a id=\"aFLoc" + i + "\" data-Cx= \"" + o.Cx + "\" data-Cy= \"" + o.Cy + "\" data-Addr= \"" + o.Addr + "\" data-Source= \"" + o.Source + "\" data-LTRB= \"" + o.LTRB + "\" >" + o.Addr + "</a></td>";
                        }
                        //html += "</tr>";
                       
                        $("#addressResult").append(html);
                        // (o.LTRB-邊界值) (o.Cy-y坐標) (o.Cx-x坐標) (o.Source-來源分Google NCDR TGOS)
                        $("#aFLoc" + i).bind("click", function (e) {
                            if (o.Source == "NCDR") {
                                locKW($(e.currentTarget).attr("data-Cx"), $(e.currentTarget).attr("data-Cy"), $(e.currentTarget).attr("data-Addr"), $(e.currentTarget).attr("data-Source"), $(e.currentTarget).attr("data-LTRB"), $(e.currentTarget).attr("data-LocLevel"));
                            } else {
                                locKW($(e.currentTarget).attr("data-Cx"), $(e.currentTarget).attr("data-Cy"), $(e.currentTarget).attr("data-Addr"), $(e.currentTarget).attr("data-Source"), $(e.currentTarget).attr("data-LTRB"), "");
                            }
                        }); //坐標定位按鈕

                    }
                   // $('#divLocXYResult').show();
                    //$('#divLocXYResult table').show();
                   // dojo.byId("LocXYQueryN").innerHTML = "搜尋筆數：" + (KeyWordLoc.length);
                    if (KeyWordLoc.length == 0) { $('#divLocXYResult table').hide(); }

                    //重設高度
                    //var h = $(window).height();
                    //$("#divLocXYResult div").css("height", h - 205);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                complete: function () {
                    hideLoading();
                }
            });

        }
    }

    ////***************************************************坐標定位
    function selectCorSym() {//切換坐標系統
        if (selLocCorSym.value == "TM2 97" || selLocCorSym.value == "TM2 67") {
            $('#spanLocViewMode').hide();
            $('#divLocWGS84').hide();
            $('#divLocWGS84_10').hide();
            $('#divLocTM2').show();
            $('#selLocLngDiv').show(); // 2015/10/30 修改
        }
        else {
            $('#spanLocViewMode').show();
            $('#selLocLngDiv').hide(); // 2015/10/30 修改

            if (oCom.btnLocViewMode == "N") { $('#divLocWGS84').show(); }
            else { $('#divLocWGS84_10').show(); }

            $('#divLocTM2').hide();
        }
    }

    function changeCorSym() {//切換坐標系統

        if (oCom.btnLocViewMode == 'Y') {
            $('#divLocWGS84').show();
            $('#divLocWGS84_10').hide();

            oCom.btnLocViewMode = "N";
        }
        else {
            $('#divLocWGS84').hide();
            $('#divLocWGS84_10').show();

            oCom.btnLocViewMode = "Y";
        }

    }

    function CoorLoc(infoTitle) {   //點下坐標定位按鈕
        debugger;
        var selLocCorSym = $('#selLocCorSym').val();
        
        /*if (selLocCorSym.value == "TM2 97") {
            var TM297 = coordinatesTransfer(LocTM2X.value * 1, LocTM2Y.value * 1, "EPSG:3826", "EPSG:4326");
            AddLocInfo(TM297.x, TM297.y, infoTitle, "CoorLoc");
        }
        else if (selLocCorSym.value == "TM2 67") {//TM2 67
            var TM267 = coordinatesTransfer(LocTM2X.value * 1, LocTM2Y.value * 1, "EPSG:3828", "EPSG:4326");
            AddLocInfo(TM267.x, TM267.y, infoTitle, "CoorLoc");
        }
        else if (selLocCorSym.value == "WGS84" && oCom.btnLocViewMode == "N") {//wgs84 度分秒
            var WGS84 = coordinatesTransfer(LocLanDeg.value * 1 + (LocLanMin.value / 60) * 1 + (LocLanSec.value / 3600) * 1, LocLonDeg.value * 1 + (LocLonMin.value / 60) * 1 + (LocLonSec.value / 3600) * 1, "EPSG:4326", "EPSG:4326");
            AddLocInfo(WGS84.x, WGS84.y, infoTitle, "CoorLoc");
        }
        else if (selLocCorSym.value == "WGS84" && oCom.btnLocViewMode == "Y") {//wgs84 十進位
            var WGS84_10 = coordinatesTransfer(LocLan.value * 1, LocLon.value * 1, "EPSG:4326", "EPSG:4326");
            AddLocInfo(WGS84_10.x, WGS84_10.y, infoTitle, "CoorLoc");
        }*/
        if (selLocCorSym == "TM2 97") {           
            var TM297 = coordinatesTransfer(LocTM2X.value * 1, LocTM2Y.value * 1, "EPSG:3826", "EPSG:4326");
            AddLocInfo(TM297.x, TM297.y, infoTitle, "CoorLoc");
        }
        else if (selLocCorSym == "TM2 67") {//TM2 67           
            var TM267 = coordinatesTransfer(LocTM2X.value * 1, LocTM2Y.value * 1, "EPSG:3828", "EPSG:4326");
            AddLocInfo(TM267.x, TM267.y, infoTitle, "CoorLoc");
        }
        else if (selLocCorSym == "WGS84" && oCom.btnLocViewMode == "N") {//wgs84 度分秒
            var WGS84 = coordinatesTransfer(LocLanDeg.value * 1 + (LocLanMin.value / 60) * 1 + (LocLanSec.value / 3600) * 1, LocLonDeg.value * 1 + (LocLonMin.value / 60) * 1 + (LocLonSec.value / 3600) * 1, "EPSG:4326", "EPSG:4326");
            AddLocInfo(WGS84.x, WGS84.y, infoTitle, "CoorLoc");
        }
        else if (selLocCorSym == "WGS84" && oCom.btnLocViewMode == "Y") {//wgs84 十進位
            var WGS84_10 = coordinatesTransfer(LocLan.value * 1, LocLon.value * 1, "EPSG:4326", "EPSG:4326");
            AddLocInfo(WGS84_10.x, WGS84_10.y, infoTitle, "CoorLoc");
        }
    }

    ////***************************************************公路定位

    //公路定位-縣市別 SelectChangeEvent 
    function ddlCountySelectChange() {
        //取得道路名稱
        var cmd = "getRoadList";
        var county = "";
        var RoadType = tabRoadLocType.value.toString();
        var url = "GetData/funcWidget/GetFastLocData.ashx";

        if (tabRoadLocZone.value.toString() != "不拘") {
            county = tabRoadLocZone.value.toString();
        }

        $("#tabRoadLocName").empty(); //下拉式選單清空

        $.ajax({
            url: url,
            type: 'get',
            data: {
                "cmd": cmd,
                "county": county,
                "RoadType": RoadType
            },
            dataType: "json",
            cache: false,   //不允許快取   
            beforeSend: function () {
                //showLoading();
            },
            success: function (data) {
                var RoadList = data;

                if (RoadList.length == 0) {
                    $('#tabRoadLocName').append("<option value='無資料'>無資料</option>");
                } else {

                    for (var i = 0; i < RoadList.length; i++) {
                        var o = RoadList[i];

                        $('#tabRoadLocName').append("<option value='" + o.DATA + "'>" + o.ROAD + "</option>");
                    }
                }
            },
            error: function () {
                //alert("資料載入失敗");
            },
            complete: function () {
                //hideLoading();
            }
        });
    }

    //點下公路定位按鈕
    function RoadLoc() {

        var RoadPost = (txtRoadLocK.value * 1000) + tabRoadLocM.value * 1;
        var lsUrl = "";
        lsUrl = "GetData/funcWidget/GetFastLocData.ashx?cmd=RoadLoc";
        if (tabRoadLocZone.value.toString() != "不拘") {
            lsUrl += "&county=" + tabRoadLocZone.value.toString();
        }
        lsUrl += "&RoadType=" + tabRoadLocType.value.toString();
        lsUrl += "&RoadName=" + tabRoadLocName.value.toString();
        lsUrl += "&RoadPost=" + RoadPost;

        $.ajax({
            url: lsUrl,
            type: 'get',
            dataType: "json",
            cache: false,   //不允許快取   
            beforeSend: function () {
                //showLoading();
            },
            success: function (data) {                
                var RoadData = data;

                AddLocInfo(RoadData[0].X, RoadData[0].Y, RoadData[0].POST, "RoadLoc");
            },
            error: function () {
            }
        });
    }

    ////***************************************************地標定位

    function getMarkList() {
        //取得地標類別清單
        var cmd = "getMarkList";
        var url = "GetData/funcWidget/GetFastLocData.ashx";

        $.ajax({
            url: url,
            type: 'get',
            data: {
                "cmd": cmd,
            },
            dataType: "json",
            cache: false,   //不允許快取   
            beforeSend: function () {
                //showLoading();
            },
            success: function (data) {
                var MarkList = data;
                for (var i = 0; i < MarkList.length; i++) {
                    var o = MarkList[i];
                    $('#tabLocLandmarkType').append("<option value='" + o.value + "'>" + o.Label + "</option>");
                }
            },
            error: function () {
                alert("地標定位類別資料載入失敗");
            },
            complete: function () {
                //hideLoading();
            }
        });
    }

    //取得地標類別清單
    function GetMarkListData() {
        var cmd = "getMarkListData";
        var PoiType = "0";
        var url = "GetData/funcWidget/GetFastLocData.ashx";

        $.ajax({
            url: url,
            type: 'get',
            data: {
                "cmd": cmd,
                "PoiType": PoiType,
            },
            dataType: "json",
            cache: false,   //不允許快取   
            beforeSend: function () {
                //showLoading();
            },
            success: function (data) {
                oCom.arrSrcData = data;
                for (var i = 0; i < oCom.arrSrcData.length; i++) {
                    var o = oCom.arrSrcData[i];
                    if (o.COUNNAME == "臺北市") {  //預設
                        $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                    }
                }
            },
            error: function () {
                alert("地標定位資料載入失敗");
            },
            complete: function () {
                //hideLoading();
            }
        });
    }

    function GetSelectCounty3Data() {

        $("#tabLocLandmarkVillage").empty(); //下拉式選單清空

        //取得地標定位鄉鎮資料
        var cmd = "getTownship3";
        var county = tabLocLandmarkZone.value.toString();
        var url = "GetData/funcWidget/GetFastLocData.ashx";

        $.ajax({
            url: url,
            type: 'get',
            data: {
                "cmd": cmd,
                "county": county
            },
            dataType: "json",
            cache: false,   //不允許快取   
            beforeSend: function () {
                //showLoading();
            },
            success: function (data) {
                var Township = data;
                $('#tabLocLandmarkVillage').append("<option value='不拘'>不拘</option>");
                for (var i = 0; i < Township.length; i++) {
                    var o = Township[i];

                    $('#tabLocLandmarkVillage').append("<option value='" + o.ID + "'>" + o.TOWNSHIP + "</option>");
                }
            },
            error: function () {
                //alert("資料載入失敗");
            },
            complete: function () {
                //hideLoading();
            }
        });
    }

    function MarkLoc() {	//點下地標定位按鈕

        var index = tabLocLandmarkName.value;
        var o = oCom.arrSrcData[index];

        AddLocInfo(o.TM_X, o.TM_Y, o.Label, "MarkLoc");//
    }

    function ClickLoc(event) {
        //debugger;
        
        //oCom.geom = event.geometry;        
        var mp, posX, posY;
        mp = esri.geometry.webMercatorToGeographic(event.mapPoint);
        
        posX = mp.x.toFixed(6);
        posY = mp.y.toFixed(6);
        AddLocInfo(posX, posY, "", "ClickLoc");
    }

    function LandmarkkeywordSearch() {

        if (txtLocLandmarkKW.value == "") { alert("請輸入關鍵字"); }
        else {

            //取得關鍵字搜尋結果
            $("#divLocLandmarkResult table.tbody tbody").empty();
            var QueryN = 0;

            if ($("#tabLocLandmarkType option:selected")[0].innerText == "不拘") {
                for (var i = 0; i < oCom.arrSrcData.length; i++) {
                    var o = oCom.arrSrcData[i];
                    if (o.Label.search(txtLocLandmarkKW.value) >= 0) {

                        QueryN = QueryN + 1;

                        html = "";
                        html += "<tr id=\"trFLocLandmarkKW" + i + "\">";
                        html += "  <td><a id=\"aFLocLandmarkKW" + i + "\" data-TM_X= \"" + o.TM_X + "\" data-TM_Y= \"" + o.TM_Y + "\" data-Label= \"" + o.Label + "\" >" + o.Label + "</a></td>";
                        html += "  <td align='center'>" + o.COUNNAME + "</td>";
                        html += "  <td align='center'>" + o.TOWNNAME + "</td>";
                        html += "</tr>";

                        $("#divLocLandmarkResult table.tbody tbody").append(html);

                        $("#aFLocLandmarkKW" + i).bind("click", function (e) {
                            AddLocInfo($(e.currentTarget).attr("data-TM_X"), $(e.currentTarget).attr("data-TM_Y"), $(e.currentTarget).attr("data-Label"), "MarkLoc");
                        });
                    }
                }
            } else {
                for (var i = 0; i < oCom.arrSrcData.length; i++) {
                    var o = oCom.arrSrcData[i];
                    if (o.Label.search(txtLocLandmarkKW.value) >= 0 && o.PoiType == $("#tabLocLandmarkType option:selected")[0].innerText) {

                        QueryN = QueryN + 1;

                        html = "";
                        html += "<tr id=\"trFLocLandmarkKW" + i + "\">";
                        html += "  <td><a id=\"aFLocLandmarkKW" + i + "\" data-TM_X= \"" + o.TM_X + "\" data-TM_Y= \"" + o.TM_Y + "\" data-Label= \"" + o.Label + "\" >" + o.Label + "</a></td>";
                        html += "  <td align='center'>" + o.COUNNAME + "</td>";
                        html += "  <td align='center'>" + o.TOWNNAME + "</td>";
                        html += "</tr>";

                        $("#divLocLandmarkResult table.tbody tbody").append(html);

                        $("#aFLocLandmarkKW" + i).bind("click", function (e) {                           
                            AddLocInfo($(e.currentTarget).attr("data-TM_X"), $(e.currentTarget).attr("data-TM_Y"), $(e.currentTarget).attr("data-Label"), "MarkLoc");
                        });
                    }
                }
            }
            $('#divLocLandmarkResult').show();
            $('#divLocLandmarkResult table').show();
            dojo.byId("LandmarkQueryN").innerHTML = "搜尋筆數：" + QueryN;

            //重設高度
            var h = $(window).height();
            $("#divLocLandmarkResult div").css("height", h - 305);

            if (QueryN == 0) { $('#divLocLandmarkResult table').hide(); }
        }
    }

    function MarkSelectChange() {

        $("#tabLocLandmarkName").empty(); //下拉式選單清空

        if ($("#tabLocLandmarkType option:selected")[0].innerText == "不拘" && $("#tabLocLandmarkVillage option:selected")[0].innerText == "不拘") {
            for (var i = 0; i < oCom.arrSrcData.length; i++) {
                var o = oCom.arrSrcData[i];
                if (o.COUNNAME == $("#tabLocLandmarkZone option:selected")[0].innerText) {
                    $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                }
            }
        } else if ($("#tabLocLandmarkType option:selected")[0].innerText == "不拘" && $("#tabLocLandmarkVillage option:selected")[0].innerText != "不拘") {
            for (var i = 0; i < oCom.arrSrcData.length; i++) {
                var o = oCom.arrSrcData[i];
                if (o.COUNNAME == $("#tabLocLandmarkZone option:selected")[0].innerText && o.TOWNNAME == $("#tabLocLandmarkVillage option:selected")[0].innerText) {
                    $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                }
            }
        } else if ($("#tabLocLandmarkType option:selected")[0].innerText != "不拘" && $("#tabLocLandmarkVillage option:selected")[0].innerText == "不拘") {
            for (var i = 0; i < oCom.arrSrcData.length; i++) {
                var o = oCom.arrSrcData[i];
                if (o.COUNNAME == $("#tabLocLandmarkZone option:selected")[0].innerText && o.PoiType == $("#tabLocLandmarkType option:selected")[0].innerText) {
                    $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                }
            }
        } else {
            for (var i = 0; i < oCom.arrSrcData.length; i++) {
                var o = oCom.arrSrcData[i];
                if (o.COUNNAME == $("#tabLocLandmarkZone option:selected")[0].innerText && o.PoiType == $("#tabLocLandmarkType option:selected")[0].innerText && o.TOWNNAME == $("#tabLocLandmarkVillage option:selected")[0].innerText) {
                    $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                }
            }
        }
    }

    function MarkSelectChangeZoneUse() {

        $("#tabLocLandmarkName").empty(); //下拉式選單清空

        if ($("#tabLocLandmarkType option:selected")[0].innerText == "不拘") {
            for (var i = 0; i < oCom.arrSrcData.length; i++) {
                var o = oCom.arrSrcData[i];
                if (o.COUNNAME == $("#tabLocLandmarkZone option:selected")[0].innerText) {
                    $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                }
            }
        } else {
            for (var i = 0; i < oCom.arrSrcData.length; i++) {
                var o = oCom.arrSrcData[i];
                if (o.COUNNAME == $("#tabLocLandmarkZone option:selected")[0].innerText && o.PoiType == $("#tabLocLandmarkType option:selected")[0].innerText) {
                    $('#tabLocLandmarkName').append("<option value='" + i + "'>" + o.Label + "</option>");
                }
            }
        }
    }
    
    ////***************************************************
    //貼定位點+訊息視窗模組 
    function AddLocInfo(X, Y, strInfo, type) {
        dojo.disconnect(infoWindowEventHide);//綁定事件之前要先清除之前綁定的事件

        map.infoWindow.hide(); //關Tip

        var TWD97Point = coordinatesTransfer(parseFloat(X), parseFloat(Y), "EPSG:4326", "EPSG:3826");
        var WGS84Point = coordinatesTransfer(parseFloat(X), parseFloat(Y), "EPSG:4326", "EPSG:4326");
        var CurMapPoint = coordinatesTransfer(parseFloat(X), parseFloat(Y), "EPSG:4326", "EPSG:3857");

        map.infoWindow.resize(240, 60);

        //取得淹水定位點
        if (oCom.isForFlooding == "Y")
            oModfldPrt.qPoint = TWD97Point;


        var TipHtml = '';
        //TipHtml += '<img alt="" src="images/widgetFastLoc/FastLoc/legndClose.png" style="cursor:pointer;position:absolute;right:3%;top:3%;" onClick="map.infoWindow.hide();RemoveGraphicByID(map.getLayer(\'layerFastLoc\'), \'\', \'\');" />';
        TipHtml += '<table style="width:100%;height:100%">';
        if (type == "RoadLoc") {
            map.infoWindow.setTitle("公路定位");
            map.infoWindow.resize(240, 80);
            TipHtml += '<tr><td colspan=2 style="color:#3E3A39;font-family:Arial;新細明體;">道路名稱：' + $("#tabRoadLocName option:selected")[0].innerText + '</td></tr>';
            TipHtml += '<tr><td colspan=2 style="color:#3E3A39;font-family:Arial;新細明體;">鄰近里程數：' + strInfo + '</td></tr>';
        } else if (type == "CoorLoc") { //不顯示地點資訊
            if (strInfo == '')
            { map.infoWindow.setTitle("坐標定位"); }
            else if(strInfo!='')
            { map.infoWindow.setTitle(strInfo); }
        }else if(type == "ClickLoc")
        { map.infoWindow.setTitle("點擊定位"); }
        else {
            if (type == "MarkLoc") {
                map.infoWindow.setTitle("地標定位");
            } else { map.infoWindow.setTitle("地址定位"); }            
            TipHtml += '<tr><td colspan=2 style="color:#3E3A39;font-family:Arial;新細明體;">地點：' + strInfo + '</td></tr>';
        }
        TipHtml += '<tr><td colspan=2 style="color:#3E3A39;font-family:Arial;新細明體;">TWD97：' + parseInt(TWD97Point.x) + "，" + parseInt(TWD97Point.y) + '</td></tr>';

        // 2015/12/28 修改 Start
        if (type == "CoorLoc") {
            // X 經度 Y 緯度，若TWD97或TWD67選中央經線 119 則使用者輸入的經度減 2 度
            if ($('#selLocLng').val() == 'Lng119' && (selLocCorSym.value == "TM2 97" || selLocCorSym.value == "TM2 67")) {
                X = X - 2;
                WGS84Point = coordinatesTransfer(parseFloat(X), parseFloat(Y), "EPSG:4326", "EPSG:4326");
                CurMapPoint = coordinatesTransfer(parseFloat(X), parseFloat(Y), "EPSG:4326", "EPSG:3857");
            }
        }
        // 2015/12/28 修改 End

        TipHtml += '<tr><td colspan=2 style="color:#3E3A39;font-family:Arial;新細明體;">WGS84：' + WGS84Point.x.toFixed(6) + "，" + WGS84Point.y.toFixed(6) + '</td></tr>';
        TipHtml += '</table>';

        map.infoWindow.setContent(TipHtml);
        
        var point = new esri.geometry.Point(CurMapPoint.x, CurMapPoint.y, map.spatialReference);
        oCom.geom = point;
        var picPath;
        picPath = 'images/MapTool/locateIcon.png';
        var PicSymbol = new esri.symbol.PictureMarkerSymbol(picPath, 37, 42);
        
        var graphic = new esri.Graphic(point, PicSymbol);
        var geometry = graphic.geometry;
        oCom.ext = new esri.geometry.Extent(geometry.x - 1000, geometry.y - 1000, geometry.x + 1000, geometry.y + 1000, geometry.spatialReference);//2016/04/21 定位時先設定extent,等淹水兵棋台的淹水網格查完後會用到 Kevin 2016/11/21Kevin 改為縮放到12層級
        
        var layer = map.getLayer("layerFastLoc");

        RemoveGraphicByID(layer, "", ""); //移除圖層所有圖片
        layer.add(graphic); //貼圖
        var features = layer.graphics;       
        oCom.evtgeom = features[0].geometry;
        //定位
        if (type == "RoadLoc" || type == "MarkLoc") { map.centerAndZoom(point, parseInt(11)); }
        else if (type == "key") { map.centerAndZoom(point, parseInt(14)); }
        else { map.centerAt(point); }
        setTimeout(function () {
            map.infoWindow.show(point);
        }, 1000);
        infoWindowEventHide = map.infoWindow.on("hide", function () { //監聽infoWindow關閉事件
            RemoveGraphicByID(layer, "", "");
        });
       
    }

    //Locating 關鍵字搜尋來源區分
    function locKW(sX, sY, strInfo, sSource, sLTRB, sLocLevel) {

        var Source = sSource;
        var LTRB = sLTRB;
        var extent = null;

            if (Source == "NCDR") {
                //var LocLevel = "";
                //var MapLocLevel = 11;

                //LocLevel = sLocLevel;//定位等級
                //if (LocLevel != "" && LocLevel != "0" && LocLevel != "9") {
                //    MapLocLevel = getLocMapLevel(LocLevel); //依定位等級決定定位至大或小比例尺
                //}

                //var point = new esri.geometry.Point(parseInt(sX), parseInt(sY), { wkid: 102443 });
                //map.centerAndZoom(point, parseInt(MapLocLevel));

                //因需求比例尺統一改為定位到1:7500 上方保留原邏輯
            }
            else {
                //extent = new esri.geometry.Extent(LTRB.split(",")[0], LTRB.split(",")[3], LTRB.split(",")[2], LTRB.split(",")[1], map.spatialReference);

                //var intXmin = LTRB.split(",")[0] * 1;
                //var intYmin = LTRB.split(",")[3] * 1;
                //var intXmax = LTRB.split(",")[2] * 1;
                //var intYmax = LTRB.split(",")[1] * 1;

                //extent = new esri.geometry.Extent(intXmin, intYmin, intXmax, intYmax, map.spatialReference);
                //map.setExtent(extent);

                //因需求比例尺統一改為定位到1:7500 上方保留原邏輯
            }

            //setTimeout(function () {
            //    AddLocInfo(sX, sY, strInfo, "key");
            //}, 600);

            AddLocInfo(sX, sY, strInfo, "key");
    }

    function getLocMapLevel(LocLevel) //NCDR依定位等級決定定位至大或小比例尺
        {
            var MapLocLevel = 0;
	
            if (LocLevel == "1" || LocLevel == "2" || LocLevel == "3")
                MapLocLevel = 15;
            else if (LocLevel == "4" || LocLevel == "5")
                MapLocLevel = 14;
            else if (LocLevel == "6")
                MapLocLevel = 11;
            else if (LocLevel == "7")
                MapLocLevel = 9;
            else if (LocLevel == "8")
                MapLocLevel = 7;
	
            return MapLocLevel;
        }

    function chkSearchWord() { //檢查關鍵字 true代表正常
        if (txtKeyWord.text.toString() == "" || txtKeyWord.text.toString().indexOf('%') != -1)
            return false;
        else if (Number(txtKeyWord.text).toString() != "NaN" && Number(txtKeyWord.text) < 1000)
            return false;
        else if (txtKeyWord.text.toString().length <= 1)
            return false;
        else
            return true;
    }

    function chkSearchWordAndAlert() { //檢查關鍵字 true代表正常
        if (txtKeyWord.text.toString() == "" || txtKeyWord.text.toString().indexOf('%') != -1) {
            Alert.show("關鍵字不得為空白或包含特殊符號，請再試試看。", "提示");
            return false;
        }
        else if (Number(txtKeyWord.text).toString() != "NaN" && Number(txtKeyWord.text) < 1000) {
            Alert.show("建議輸入更明確的關鍵字\n方便您更快速地找到資訊。", "提示");
            return false;
        }
        else if (txtKeyWord.text.toString().length <= 1) {
            Alert.show("建議輸入更明確的關鍵字\n方便您更快速地找到資訊。", "提示");
            return false;
        }
        else {
            return true;
        }
    }    
}

// 2015/12/28 修改
function chgLngTxt()
{
    if ($('#selLocLng').val() == 'Lng119')
        $('#locLngTxt').text('( 金馬澎適用 )');
    else if ($('#selLocLng').val() == 'Lng121')
        $('#locLngTxt').text('( 臺灣本島適用 )');
}



