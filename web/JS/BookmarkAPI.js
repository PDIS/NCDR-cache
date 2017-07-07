/**********************************
 * SUMMARY ：書籤 函式
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2013/08/08  Vicky Liang Create
             2013/1126   Vicky Liang 整併地方權限(整備/應變)、增加書籤編輯權限控管、書籤名稱關鍵字查詢
             
 **********************************/
function Bookmark() {
    var oCom = this;
    oCom.account = "";
    oCom.arrBmkModule = [];
    oCom.arrBookmark = []; //書籤資料集
    oCom.arrMapLayer = [    //底圖:舊資料對應用
        { id: "0", name: "lyrTiledMap800", title: "電子地圖", fid: "800" },
        { id: "1", name: "lyrTiledMap801", title: "正射影像", fid: "801" },
        { id: "2", name: "lyrTiledMap805", title: "地形圖", fid: "805" },
        { id: "3", name: "lyrTiledMap802", title: "衛照", fid: "803" },
        { id: "4", name: "lyrTiledMap804", title: "福衛影像", fid: "804" }
    ];

    var selModule = "A1"; //預設篩選書籤
    var IsSetLocalRight = ""; //是否有「設定地方瀏覽」權限
    var objSender = ""; //物件叫用來源
    var bmkModIdx = 7;

    // 2015/02/10 修改 Start
    // 群組篩選條件
    // 因為篩選條件是多選，且可能會包含多個區間，因此使用陣列儲存
    oCom.GRPfilter = [];
    // 2015/02/10 修改 End

    // 2015/7/15 修改：簡報模版設定畫布ID
    oCom.Mp_ID_fromPP = "";

    // 2016/01/26 修改，加入畫布ID from 災情網 
    oCom.Mp_ID_fromPortal2 = "";

    //加入書籤時間，河川水位判斷是否有專案時間分別撈即時(沒時間)或即時+歷史(有時間)  @20160420 Andy
    //oCom.openedBmkTime = "";  //改回沒有時間判斷 @20160428    Andy

    // public method gegin ////////////////////////////////////////////////////

    //載入書籤清單
    oCom.loadBmkList = function (cmd, oBmk, callback) {
        IsSetLocalRight = IsSysFuncRight(16); //是否有「設定地方瀏覽」權限
        //@JG20150311*/
        //var url = "GetData/funcWidget/getBookMarkData.ashx?cmd=" + cmd + "&account=" + oCom.account + "&isLocalGrp=" + oGrpInfo.IsLocalEdition;
        var url = 'GetData/funcWidget/getBookmarkData.ashx?cmd=' + cmd;
        var urlp = '&account=' + oCom.account + '&isLocalGrp=' + oGrpInfo.IsLocalEdition;
        var Funcs = [];
        if (oBmk != null) {
            //url += "&id=" + oBmk.BookID + "&name=" + oBmk.BookName + "&ctgy=" + oBmk.BookGroupID + "&rights=" + oBmk.Rights + "&GISLink=" + oBmk.GISLink + "&bm=" + oBmk.BookTime;
            urlp += '&id=' + oBmk.BookID + '&name=' + oBmk.BookName +
                    '&ctgy=' + oBmk.BookGroupID + '&rights=' + oBmk.Rights +
                    '&GISLink=' + oBmk.GISLink + '&bm=' + oBmk.BookTime +
                    "&GrpList=" + oBmk.GrpList + // 2015/02/10 修改：加入群組清單
                    //@JG20150409*/
                    '&MpID=' + oBmk.MpID || '-1';
            Funcs = oBmk.Funcs;
        }
        url += encodeURI(urlp);
        //@JG20150311*/

        $.ajax({
            url: url,
            type: 'get',                 // post/get
            dataType: "json",             // xml/json/script/html
            data: { Funcs: Funcs },  // 2016/12/19 修改：加入子圖層 (內容加在URL在HTTPS會被列入危害)
            cache: false,                 // 是否允許快取
            success: function (data) {

                //指定資料集
                oCom.arrBmkModule = data.BmkCategory;
                oCom.arrBookmark = data.BmkData;

                //產生模組選項
                $("#selBmkModule").empty();
                $("#selBmkModule").append("<option value='All'>不拘</option>");
                $("#selBmkModule").append("<option value='ComUse'>常用</option>");
                $("#divBmkModule").empty();
                for (var i = 0; i < data.BmkCategory.length; i++) {
                    $("#selBmkModule").append("<option value='" + data.BmkCategory[i].ID + "'>" + data.BmkCategory[i].Name + "</option>");

                    var imgSrc = data.BmkCategory[i].ImageSrc;
                    if (imgSrc == "")
                        imgSrc = "images/widgetBookMark/userfulGroup.png";
                    $("#divBmkModule").append("<span id=\"spnBmkMod" + data.BmkCategory[i].ID + "\"><img src=\"" + imgSrc + "\" /><br>" + data.BmkCategory[i].Name.substr(0, 2) + "</span>");

                    //選單click事件綁定
                    $("#spnBmkMod" + data.BmkCategory[i].ID).unbind('click').bind("click",
                    {
                        id: data.BmkCategory[i].ID
                    },
                    function (e) {
                        //$("#divBmkModule span").removeAttr("style");
                        //$(this).attr("style", "background-color:#a4ebfb");
                        createTable(e.data.id);
                    });

                }

                //初始狀態設定
                $("#selBmkModule").val(selModule);
                $("#divBmkImgRight img").hide();

                //事件綁定
                $("#aViewMode").unbind("click").bind("click", switchViewMode);
                $("#aInsBmk").unbind("click").bind("click", function () {
                    //var oBmk = { BookID: "", BookName: "", Rights: "0", GISLink: "Loc=", BookTime: "" };
                    var oBmk = { BookID: "", BookName: "", Rights: "9", GISLink: "Loc=", BookTime: "", GrpList: "" }; // 2015/02/10 修改：加入群組
                    EditBmk(oBmk, "I");
                });
                $("#selBmkModule").unbind("change").bind("change", function () { createTable(""); });
                $("#btnBmkQuery").unbind("click").bind("click", function () { createTable(""); });
                $("#divBmkComUse").unbind('click').bind("click", function () { //常用書籤圖示
                    //$("#divBmkModule span").removeAttr("style");
                    //$("#divBmkComUse").attr("style", "background-color:#a4ebfb");
                    createTable("ComUse")
                });

                $("#divBmkImgLeft img").unbind("click").bind("click", function () {
                    bmkModIdx++;
                    var X = 45 - ((bmkModIdx - 7) * 40);
                    //var X = $("#divBmkModule").position().left;
                    //X -= 40;
                    $("#divBmkModule").animate({ left: X });

                    if (bmkModIdx == oCom.arrBmkModule.length) {
                        $("#divBmkImgLeft img").hide();
                        $("#divBmkImgRight img").show();
                    } else {
                        $("#divBmkImgRight img").show();
                    }
                });
                $("#divBmkImgRight img").unbind("click").bind("click", function () {
                    bmkModIdx--;
                    var X = 45 + ((7 - bmkModIdx) * 40);
                    //var X = $("#divBmkModule").position().left;
                    //X += 40;
                    $("#divBmkModule").animate({ left: X });

                    if (bmkModIdx == 7) {
                        $("#divBmkImgLeft img").show();
                        $("#divBmkImgRight img").hide();
                    } else {
                        $("#divBmkImgLeft img").show();
                    }

                });

                //產製資料表
                createTable("");

                if (data.CMD == "I") {
                    $("#lbBmkExecMsg").css("visibility", "visible");
                    $("#lbBmkExecMsg").text("新增書籤「" + oBmk.BookName + "」成功");
                    setTimeout(function () { easyDialog.close() }, 1000);
                } else if (data.CMD == "U") {
                    $("#lbBmkExecMsg").css("visibility", "visible");
                    $("#lbBmkExecMsg").text("修改書籤「" + oBmk.BookName + "」成功");
                    setTimeout(function () { easyDialog.close() }, 1000);
                } else if (data.CMD == "D") {
                    $("#lbBmkExecMsg").css("visibility", "visible");
                    $("#lbBmkExecMsg").text("刪除書籤「" + oBmk.BookName + "」成功");
                    setTimeout(function () { easyDialog.close() }, 1000);
                } else {
                    //切換成圖示模式
                    switchViewMode();
                }

                if (callback) {
                    callback();
                }
            },
            error: function (e) {
                if (cmd == "I") {
                    $("#lbBmkExecMsg").css("visibility", "visible");
                    $("#lbBmkExecMsg").text("新增書籤「" + oBmk.BookName + "」失敗");
                } else if (cmd == "U") {
                    $("#lbBmkExecMsg").css("visibility", "visible");
                    $("#lbBmkExecMsg").text("修改書籤「" + oBmk.BookName + "」失敗");
                } else if (cmd == "D") {
                    $("#lbBmkExecMsg").css("visibility", "visible");
                    $("#lbBmkExecMsg").text("刪除書籤「" + oBmk.BookName + "」失敗");
                }
            }
        });

        //讀取MapPainter
        loadMapPainter();//@JG20150409*/
    }

    //@JG20150409*/
    function loadMapPainter() {
        var url = "GetData/funcWidget/getMapPainter.ashx?cmd=S&Account=" + oCom.account;
        $.ajax({
            url: url,
            type: 'get',
            dataType: "json",
            cache: false
        })
        .done(function (data) {
            var dm = data.MptData;
            //建立畫布下拉選單
            var sml = $(".selMptList");
            sml.empty();
            sml.append("<option value='-1' selected>=選擇畫布=</option>");
            for (var i = 0; i < dm.length; i++) {
                sml.append("<option value='" + dm[i].ID + "'>" + dm[i].Title + "</option>");
            }
            sml.val(-1);

            if (typeof (oMapPainter) == "undefined") {
                $("#divMapPainter").load("JS/MapPainter/MapPainter.htm?v=" + Math.floor(Math.random() * 1E6 + 1), function () {
                    //建立畫布圖層
                    layerMapPainter = map.getLayer("layerMapPainter");
                    if (typeof (layerMapPainter) == "undefined") {
                        layerMapPainter = new esri.layers.GraphicsLayer({ id: "layerMapPainter", "opacity": 1 });
                        map.addLayer(layerMapPainter);
                    }

                    oMapPainter = new MapPainter();
                    oMapPainter.account = account;
                    oMapPainter.Layer = layerMapPainter;
                    oMapPainter.loadMptList();
                });
            } else {
                oMapPainter.reopenMapPainter();
            }
            sml.on('change', function () {
                //@JG20150423*/畫布change事件
                $("#selMptList").val(this.value).trigger('change');
                //oMapPainter.loadDrawList(this.value);
                oMapPainter.addToLegend(true); //重置圖例區
            });

        }).fail(function () {

        });
    }
    //for外部功能修改書籤 //oBmk:書籤物件, sender:叫用來源(EX.slider,本物件叫用則為空白)
    oCom.ModifyBookmark = function (oBmk, sender) {
        UpdBmkData(oBmk, "U", sender);
    }

    //for外部功能套疊書籤 //oBmk:書籤物件, sender:叫用來源(EX.portal,本物件叫用則為空白)
    oCom.OpenBookmark = function (oBmk, sender) {
        
        objSender = sender;

        closeAllLayer(); //關閉全部圖層
        //Su-modify 20160417 關閉資訊綜覽功能
        if (typeof (clearFunc) != "undefined") clearFunc();
      
        //切換時間軸時間為書籤時間
        curDateTime = (oBmk.BookTime != "") ? oBmk.BookTime : getCurrentDateTime();
       
        //取書籤參數
        var oGisParm = oCom.convertGISParm(oBmk.GISLink + "|Funcs=" + oBmk.Funcs);
        setGISLink1(oGisParm);
    }

    //轉換書籤參數為物件
    oCom.convertGISParm = function (str) {
        var arrParm = str.split("|");
        var oParm = new Object();
        for (var i = 0; i < arrParm.length; i++) {
            if (arrParm[i].indexOf("Funcs=") < 0) {
                var nodeName = arrParm[i].split("=")[0];
                var nodeValue = arrParm[i].split("=")[1];
                oParm[nodeName] = nodeValue;
            }
            else {
                //資料裡面有可能包含'='號 (另外處理)
                var nodeName = arrParm[i].split("=")[0];
                var nodeValue = arrParm[i].replace("Funcs=", "");
                oParm[nodeName] = nodeValue;
            }
        }
        return oParm;
    }


    // private method begin ////////////////////////////////////////////////////
    //產製資料表
    function createTable(mod) {
        if (mod != "") {
            selModule = mod;
            $("#selBmkModule").val(mod);
        } else {
            selModule = $("#selBmkModule").val();
        }

        var QryBmkName = ($("#txtBmkNameQ").length > 0) ? $("#txtBmkNameQ").val().toUpperCase() : "";
        var GISLink = [];
        var BmkModule;
        var BmkImgSrc
        var html;

        $("#divBmkList table.tbody tbody").empty();
        $("#divBmkImgs").empty();
        for (var i = 0; i < oCom.arrBookmark.length; i++) {
            //取書籤主題
            BmkModule = oCom.arrBookmark[i].BookGroupID;
            
            //篩選書籤主題
            if (selModule == "ComUse") {
                if (oCom.arrBookmark[i].IsCommonUse != "1") continue;
            } else {
                if (selModule != "All" && BmkModule != selModule) continue;
            }

            //篩選書籤名稱
            if (QryBmkName != "" && oCom.arrBookmark[i].BookName.toUpperCase().indexOf(QryBmkName) < 0) continue;

            html = "";
            html += "<tr id=\"trBmk" + oCom.arrBookmark[i].BookID + "\">";
            html += "  <td><a id=\"aBmk" + oCom.arrBookmark[i].BookID + "\">" + oCom.arrBookmark[i].BookName + "</a></td>";

            //html += "  <td align='center'><img id=\"imgBmkHelp" + oCom.arrBookmark[i].BookID + "\" src=\"images/other/help.png\" width=\"20\" /></td>";
            if (oCom.arrBookmark[i].PdfName != "") {
                html += "  <td align='center'><a href='./UploadFiles/Bmk/" + oCom.arrBookmark[i].PdfName + "' target='_blank'><img src=\"images/other/help.png\" width=\"20\" /></a></td>";
            } else {
                html += "  <td align='center'>&nbsp;</td>";
            }

            html += "  <td align='center'>" + oCom.arrBookmark[i].RightsName + "</td>";

            if (oCom.arrBookmark[i].IsModify == "Y") {
                html += "  <td align='center'><a id=\"aEditBmk" + oCom.arrBookmark[i].BookID + "\">編輯</a></td>";
            } else {
                html += "  <td align='center'>&nbsp;</td>"; //不開放非同群組之地方群組人員編輯
            }
            html += "</tr>";
            $("#divBmkList table.tbody tbody").append(html);

            //事件綁定
            $("#aBmk" + oCom.arrBookmark[i].BookID).unbind('click').bind("click", { oBmk: oCom.arrBookmark[i] }, function (e) {
                showBmk(e.data.oBmk);
                //@JG20150409*/
                // 2015/06/03
                $("#opOpnImg_layerMapPainter").click();
                //showMapPainter(e.data.oBmk.MpID);//大眾版不需要畫布
            });
            $("#aEditBmk" + oCom.arrBookmark[i].BookID).unbind('click').bind("click", { oBmk: oCom.arrBookmark[i] }, function (e) {
                EditBmk(e.data.oBmk, "U");
                //@JG20150409*/
                //showMapPainter(e.data.oBmk.MpID);
                // 2015/06/03
               // showMapPainterByEdit(e.data.oBmk.MpID);
            });

            //圖示列表
            var imgSrc = oCom.arrBookmark[i].ImageSrc;
            if (imgSrc == "")
                imgSrc = "images/widgetBookMark/userfulGroup.png";
            html = "";
            html += "<span id=\"spnBmk" + oCom.arrBookmark[i].BookID + "\"><img src=\"" + imgSrc + "\" /><br />" + oCom.arrBookmark[i].BookName + "</span>";
            $("#divBmkImgs").append(html);

            //事件綁定
            $("#spnBmk" + oCom.arrBookmark[i].BookID).unbind('click').bind("click", { oBmk: oCom.arrBookmark[i] }, function (e) {
                showBmk(e.data.oBmk);
                //@JG20150409*/
                // 2015/06/03
                $("#opOpnImg_layerMapPainter").click();
                //showMapPainter(e.data.oBmk.MpID);
            });

        }

        //查無結果訊息
        if ($("#divBmkImgs span").length == 0) {
            var oBmkMod = getArryObj(oCom.arrBmkModule, "ID", selModule);
            $("#divBmkImgs").text("尚無「" + oBmkMod.Name + "」類之書籤資料。");
        }

        //重設高度 // 2015/01/12 修改
        //var h = $(window).height();
        //$("#divBmkList div").css("height", h - 190)
        //$("#divBmkImgs").css("height", h - 200);
    }

    //開啟畫家圖層//@JG20150409*/
    function showMapPainterByEdit(index) {
        if ($(".selMptList").size() != 0 && typeof (oMapPainter) != 'undefined') {
            if (index == null || index == '' || index == '-1' || index == -1) {
                index = -1;
                $('select.selMptList,select#selMptList').val(index);
                oMapPainter.removeMPLegend();//從圖例區移除
            } else {
                $('select.selMptList,select#selMptList').val(index);
                oMapPainter.addToLegend(true); //重置圖例區
                //@JG20150423*/重置畫布
                $("#selMptList").val(index).trigger('change');
            }
            //$('select#selMptList option:selected').text();
            //$('select.selMptList option:selected').text();

            //@JG20150423*/重置畫布
            //$("#selMptList").val(index).trigger('change')
            //oMapPainter.loadDrawList(index);
            //@JG20150423*/
        }
    }  

    // 2015/06/03
    var TempMapPainter;
    function showMapPainter(index) {
        if ($('select.selMptList option[value=' + index + ']').text() != '')
        {

        }
        else {

            if (typeof (TempMapPainter) != "undefined") {   // 2016/03/11 新增，有畫布清單不重撈 Andy
                if (oCom.Mp_ID_fromPP != "")
                    $('select.selMptList,select#selMptList').val(index);
                if (oCom.Mp_ID_fromPortal2 != "")
                    $('select.selMptList,select#selMptList').val(index);
                return false;
            }

            var url = "GetData/funcWidget/getMapPainter.ashx?cmd=SALL";
            $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                cache: false
            })
            .done(function (data) {
                layerMapPainter = map.getLayer("layerMapPainter");

                // 2016/01/26 修改，加入畫布
                //if (typeof (layerMapPainter) == "undefined") {
                //    layerMapPainter = new esri.layers.GraphicsLayer({ id: "layerMapPainter", "opacity": 1 });
                //    map.addLayer(layerMapPainter);
                //}
                if (typeof (TempMapPainter) == "undefined") {
                    $("#divMapPainter").load("JS/MapPainter/MapPainter.htm?v=" + Math.floor(Math.random() * 1E6 + 1), function () {
                        //建立畫布圖層
                        layerMapPainter = map.getLayer("layerMapPainter");
                        if (typeof (layerMapPainter) == "undefined") {
                            layerMapPainter = new esri.layers.GraphicsLayer({ id: "layerMapPainter", "opacity": 1 });
                            map.addLayer(layerMapPainter);
                        }

                        TempMapPainter = new MapPainter();
                        if (oCom.Mp_ID_fromPortal2 != "") TempMapPainter.isPortal = 'Y';
                        TempMapPainter.GetAllByBmk = 'Y';
                        TempMapPainter.arrSrcData = data.MptData;
                        TempMapPainter.Layer = layerMapPainter;
                        TempMapPainter.initMapPainter();
                        TempMapPainter.loadDrawList(index);
                        TempMapPainter.addToLegend(true); //重置圖例區
                    });
                } else {
                    TempMapPainter = new MapPainter();
                    if (oCom.Mp_ID_fromPortal2 != "") TempMapPainter.isPortal = 'Y';
                    TempMapPainter.GetAllByBmk = 'Y';
                    TempMapPainter.arrSrcData = data.MptData;
                    TempMapPainter.Layer = layerMapPainter;
                    TempMapPainter.initMapPainter();
                    TempMapPainter.loadDrawList(index);
                    TempMapPainter.addToLegend(true); //重置圖例區
                }

                // 2015/7/15 修改：簡報模版設定畫布ID
                if (oCom.Mp_ID_fromPP != "")
                    $('select.selMptList,select#selMptList').val(index);

                // 2016/01/26 修改，加入畫布
                if (oCom.Mp_ID_fromPortal2 != "")
                    $('select.selMptList,select#selMptList').val(index);


            }).fail(function () {

            });
        }
    }


    //點選書籤
    function showBmk(oBmk) {

        //功能操作記錄
        setCounterFunc(curExecTool, oBmk.BookID, "Q", "GIS"); //書籤套疊功能

        $("#trBmk" + oBmk.BookID).css("")
        $("#divBmkList table.tbody tbody tr").removeAttr("style");
        $("#trBmk" + oBmk.BookID).attr("style", "background-color:#a4ebfb");
        $("#divBmkTitle").show();
        $("#divBmkTitle span").text("書籤：" + oBmk.BookName);

        $("#divBmkImgs span").removeAttr("style");
        $("#spnBmk" + oBmk.BookID).attr("style", "background-color:#a4ebfb");

        closeAllLayer(); //關閉全部圖層
        //Su-modify 20160417 關閉資訊綜覽功能
        if (typeof (clearFunc) != "undefined") clearFunc();

        //切換時間軸時間為書籤時間
        curDateTime = (oBmk.BookTime != "") ? oBmk.BookTime : getCurrentDateTime();
        if (typeof (oTimeline) != "undefined") { oTimeline.resetOpenLayer(curDateTime) };

        //加入書籤時間，河川水位判斷是否有專案時間分別撈即時(沒時間)或即時+歷史(有時間)  @20160420 Andy
        //oCom.openedBmkTime = oBmk.BookTime;   //改回沒有時間判斷 @20160428    Andy

        setGISLink(oBmk.GISLink + "|Funcs=" + JSON.stringify(oBmk.Funcs));
    }

    //套疊書籤
    function setGISLink(gislink) {
        //取書籤參數
        var oGisParm = oCom.convertGISParm(gislink);
        setGISLink1(oGisParm);
    }

    //套疊書籤1
    function setGISLink1(oGisParm) {
        
        //定位
        if (oGisParm.Loc == "Y" && oGrpInfo.IsLocalEdition == "Y") {
            //定位至地方範圍
            if (oGrpInfo.CounL != "" && oGrpInfo.CounB != "" && oGrpInfo.CounR != "" && oGrpInfo.CounT != "") {
                var extent = new esri.geometry.Extent(parseFloat(oGrpInfo.CounL), parseFloat(oGrpInfo.CounB), parseFloat(oGrpInfo.CounR), parseFloat(oGrpInfo.CounT), new esri.SpatialReference(mapSpRef)); //定位至地方範圍
                map.setExtent(extent);
            }
        } else {
            if (typeof (scale) != "undefined") {
                oGisParm.Level = scale;
            }
            //設定比例尺
            if (oGisParm.Level != "") { 
                map.setLevel(parseInt(oGisParm.Level));
            }
          
            //定位至中心點
            if (oGisParm.Cx != "" && oGisParm.Cy != "") {
                if (mapSpRef != "undefined" && mapSpRef.wkid == "4326") {                   
                    var xy84 ;
                    if (typeof (cx) != "undefined") {
                        oGisParm.Cx = cx;
                    }
                    if (typeof (cy) != "undefined") {
                        oGisParm.Cy = cy;
                    }
                    if (typeof (cx) != "undefined") {
                        xy84 = coordinatesTransfer(oGisParm.Cx * 1, oGisParm.Cy * 1, "EPSG:4326", "EPSG:4326");
                    } else {
                        xy84 = coordinatesTransfer(oGisParm.Cx * 1, oGisParm.Cy * 1, "EPSG:3826", "EPSG:4326");
                    }
                    oGisParm.Cx = xy84.x.toFixed(5);
                    oGisParm.Cy = xy84.y.toFixed(5);
                }
                var pt = new esri.geometry.Point(parseFloat(oGisParm.Cx), parseFloat(oGisParm.Cy), new esri.SpatialReference(mapSpRef));
                map.centerAt(pt);
            }
            
        }

        //套疊其他參數
        setTimeout(setGISLink2, 1000, oGisParm);

        //定時刷新圖層資訊(大眾版刷新機制可以寫在這)
        //setInterval(function () {
        //    for (var n1 = 0; n1 < map.layerIds.length; n1++) {
        //        if (map.layerIds[n1].includes("layer")) {
        //            map.removeLayer(map.getLayer(map.layerIds[n1]));
        //            n1--;
        //        }
        //    }

        //    for (var n1 = 0; n1 < arrOpenFuncs.length; n1++) {
        //        $('#of_' + arrOpenFuncs[n1].ID).remove();
        //    }

        //    arrOpenFuncs.length = 0;
        //    setGISLink2(oGisParm);
        //}, 300000);
    }

    //套疊書籤2
    function setGISLink2(oGisParm) {

        //設定底圖
        if (oGisParm.Map != "") {

            if (objSender == "") {
                if (typeof (lyrTiledMapTwLabel) != "undefined") {
                    $("#cbTwLabel").attr("src", "images/FuncList/uncheck.png");
                    lyrTiledMapTwLabel.hide();
                }
            } else {
                //隱藏所有底圖
                for (var j = 0; j < map.layerIds.length; j++) {
                    if (map.layerIds[j] != "lyrTiledMapWorld" && map.layerIds[j] != "lyrTiledMapWorldI") {
                        map.getLayer(map.layerIds[j]).hide();
                    }
                }
            }
            
            var arrBkMap = oGisParm.Map.split(",");
            for (var i = 0; i < arrBkMap.length; i++) {
                if (arrBkMap[i] <= 4) { //舊底圖ID
                    var objMap = getArryObj(oCom.arrMapLayer, "id", arrBkMap[i]);
                    curMapBase = objMap.fid;
                } else if (arrBkMap[i] == 99) {
                    switchTwLabel(true); //道路註記
                } else {
                    curMapBase = arrBkMap[i];
                }
            }

            if (typeof (objSender) == "undefined" || objSender == "") {
                switchMapBase(curMapBase);
            } else {
                //顯示底圖
                var lyrTiledMap = map.getLayer("lyrTiledMap" + curMapBase);
                if (typeof (lyrTiledMap) == "undefined") {
                    var oMap = getArryObj(arrFuncList, "ID", curMapBase)
                   if (oMap.Exec == 'WMTS') {
                        lyrTiledMap = new esri.layers.WebTiledLayer(oMap.TiledMapUrl, { id: 'lyrTiledMap' + oMap.ID, "opacity": 1 });
                        map.addLayer(lyrTiledMap);
                        map.reorderLayer(lyrTiledMap, 1);
                    }
                    else {
                        var layerUrl = (isToken == "Y") ? oMap.TiledMapUrl + "?Token=" + oMap.Token : oMap.TiledMapUrl;
                        lyrTiledMap = new esri.layers.ArcGISTiledMapServiceLayer(layerUrl, { id: "lyrTiledMap" + oMap.ID });
                        map.addLayer(lyrTiledMap);
                        map.reorderLayer(lyrTiledMap, 1);
                    }
                    
                } else {
                    lyrTiledMap.show();
                }

                //比例尺小於可視範圍時, 替換對應底圖
                if (map.getScale() > mapVisScale) {
                    if (lyrTiledMapWorldI)
                        lyrTiledMapWorldI.show();
                    lyrTiledMap.hide();
                }
                else {
                    if (lyrTiledMapWorldI)
                        lyrTiledMapWorldI.hide();
                    lyrTiledMap.show();
                }

                // 2016/01/26 修改，加入畫布
                //showMapPainter(oCom.Mp_ID_fromPortal2); 
            }
        }

        //開啟模組(模組暫無使用)
        if (objSender == "") {
            if (oGisParm.Module != "" && oGrpInfo.IsLocalEdition == "N") {
                curModule = oGisParm.Module;
            }
        }

        //設定圖層清單及圖例區
        if (oGisParm.Func != "" || oGisParm.QFunc != "") {
            var arrBkFunc; //已開圖層
            var arrBkQFunc; //圖例區

            try {
                arrBkFunc = oGisParm.Func.split(",");
                arrBkQFunc = oGisParm.QFunc.split(",");
            } catch (ex) { }

            //開啟已勾選圖層
            if (oGisParm.Func != "") {
                $.each(arrBkFunc, function (i, id) {
                    var Sets = id.split("/");
                    var FuncObj = getArryObj(arrFuncList, "ID", Sets[0]);
                    if (FuncObj != "") {
                        if (jQuery.inArray(FuncObj, arrOpenFuncs) < 0) { //不在圖例區才開啟

                            /*
                            //功能操作記錄
                            if (objSender == "")
                                setCounterFunc("22", FuncObj.ID, "Q", "GIS"); //圖層套疊功能
                            */

                            //開啟圖層
                            if (["Rain", "WraReservoir", "WraRiver", "CCTV", "WATCH", "TideLevel"].indexOf(FuncObj.Name) < 0) {
                                curExecTool = ""; //for圖層套疊時, 不重複LOG操作記錄
                                FuncObj.Checked = "Y";
                                switchFuncModule(FuncObj.ID, FuncObj.Name, FuncObj.Exec, true, "");
                            }
                        }
                    }
                });
            }

            //開啟圖層子圖
            /*if (oGisParm.Funcs) {
                openMarkRecord(oGisParm);
            }*/

            //判斷圖例區
            if (oGisParm.QFunc != "") {
                $.each(arrBkQFunc, function (i, id) {
                    //只處理不在已勾選清單的項目
                    if (jQuery.inArray(id, arrBkFunc) < 0) {
                        var FuncObj = getArryObj(arrFuncList, "ID", id);
                        if (FuncObj != "") {
                            if (jQuery.inArray(FuncObj, arrOpenFuncs) < 0) { //不在圖例區才開啟
                                FuncObj.Checked = "Y";
                                //UpdQFuncList(FuncObj.ID, true, "", "");
                                switchFuncModule(FuncObj.ID, FuncObj.Name, FuncObj.Exec, true, "");
                            }
                        }
                    }
                });
            }
        }

        //設定透明度
        if (typeof (oGisParm.Alpha) != "undefined" && oGisParm.Alpha != "") {
            var arrAlpha = oGisParm.Alpha.split(",");
            for (var i = 0; i < arrAlpha.length; i++) {
                var type = arrAlpha[i].split(":")[0];
                var alpha = resetAlphaVal(parseFloat(arrAlpha[i].split(":")[1]));

                //巡覽圖例區,依參數設定圖層
                for (var j = 0; j < arrOpenFuncs.length; j++) {
                    //資料內容包括:Exec(舊)、Name(舊/新)、ID(新)
                    if (arrOpenFuncs[j].Show == "Y" && (arrOpenFuncs[j].Exec == type || arrOpenFuncs[j].Name == type || arrOpenFuncs[j].ID == type)) {

                        var layer = map.getLayer(arrOpenFuncs[j].layerid);
                        if (typeof (layer) != "undefined") {

                            //設定圖層透明度
                            setLayerOpa(alpha, "FuncOpa" + arrOpenFuncs[j].ID, arrOpenFuncs[j].layerid);

                            //設定圖層透明度圖示
                            setLayerOpaImgSrc("FuncOpa" + arrOpenFuncs[j].ID, alpha);
                        }
                    }
                }
            }
        }

        if (objSender == "") {
            //開啟畫布(畫家功能尚未開發)
            if (oGisParm.Draw != "" && oGrpInfo.IsLocalEdition == "N") {

            }
        }

        //關閉載入進度
        setTimeout(hideLoading, 2000);

        // 2015/7/15 修改：簡報模版設定畫布ID
        //if (oCom.Mp_ID_fromPP != "")
        //    showMapPainter(oCom.Mp_ID_fromPP);

        //最後再設定圖層位置與是否顯示
        if (oGisParm.Func != "") {
            $.each(arrBkFunc, function (i, id) {
                var Sets = id.split("/");
                var FuncObj = getArryObj(arrFuncList, "ID", Sets[0]);
                if (FuncObj != "") {
                    if (jQuery.inArray(FuncObj, arrOpenFuncs) >= 0) { //不在圖例區才開啟

                        //設定圖層位置
                        if (Sets[2] != "undefined")
                            $("#" + FuncObj.formid).css("top", Sets[2]);

                        if (Sets[3] != "undefined")
                            $("#" + FuncObj.formid).css("left", Sets[3]);
                        
                        //是否顯示
                        if (Sets[1] == "N")
                            $("#" + FuncObj.formid).css("display", "none");
                        else
                            $("#" + FuncObj.formid).show();
                    }
                }
            });
        }
    }

    //設定透明度值
    function resetAlphaVal(val) {
        if (val < 0.8)
            return 1 - (Math.round(val * 10) / 10);
        else
            return 1 - 0.85
    }

    //編輯書籤
    function EditBmk(oBmk, cmd) {
        $("#lbBmkFrmTitle").text((cmd == "I") ? "新增書籤" : "編輯書籤");

        easyDialog.open({
            container: 'divEditBmk',
            //autoClose:2000, //自動關閉時間
            fixed: true,
            overlay: true
        });

        $("#lbBmkExecMsg").css("visibility", "hidden");
        $("#divEditBmk").draggable();

        $("#txtBmkTimeD").datepicker({
            showOn: "both",
            buttonImage: "images/other/calendar.gif",
            buttonImageOnly: true,
            regional: ["zh-TW"],
            maxDate: "0"
        });

        $("#txtBmkTimeH").spinner({
            spin: function (event, ui) {
                if (ui.value > 23) {
                    $(this).spinner("value", 23);
                    return false;
                } else if (ui.value < 0) {
                    $(this).spinner("value", 0);
                    return false;
                }
            }
        });

        $("#txtBmkTimeM").spinner({
            spin: function (event, ui) {
                if (ui.value > 59) {
                    $(this).spinner("value", 59);
                    return false;
                } else if (ui.value < 0) {
                    $(this).spinner("value", 0);
                    return false;
                }
            }
        });

        //顯示資料
        var oGisParm = oCom.convertGISParm(oBmk.GISLink); //取書籤參數
        $("#hidBmkId").val(oBmk.BookID);
        $("#txtBmkName").val(oBmk.BookName);

        //新增狀態或有「地方版設定」權限或原建立者,才顯示書籤權限設定欄位
        if (cmd == "I" || IsSetLocalRight || oBmk.Account == oCom.account) {
            $("#trBmkRight").show();
        } else {
            $("#trBmkRight").hide();
        }

        // 2015/02/10 修改：全開，不再限制
        //有「地方版設定」權限,才顯示地方書籤權限設定欄位
        //if (IsSetLocalRight) {
        $("#divEditBmk div.divBmkSetLocal").show();
        //} else {
        //    $("#divEditBmk div.divBmkSetLocal").hide();
        //}

        if (oBmk.Rights == "0" || oBmk.Rights == "1" || oBmk.Rights == "4" || oBmk.Rights == "9") { // 2015/02/10 修改：點選群組選項、公開
            $("input[name=BmkRight][value=" + oBmk.Rights + "]").prop('checked', true);
        } else { //地方整備與地方應變整併
            $("input[name=BmkRight][value=2]").prop('checked', true);
        }

        //定位地方範圍
        $("#cbBmkLocLocal").prop('checked', ((oGisParm.Loc == "Y") ? true : false));
        var BmkRight = $('input[name=BmkRight]:checked').val();
        if (BmkRight == "0" || BmkRight == "1") {
            $("#cbBmkLocLocal").prop("checked", false);
            $("#cbBmkLocLocal").prop("disabled", true);
            $("#spBmkLocLocal label").css("color", "gray");
        } else {
            $("#cbBmkLocLocal").prop("disabled", false);
            $("#spBmkLocLocal label").css("color", "black");
        }

        var BookTime = (oBmk.BookTime == "") ? new Date(curDateTime) : new Date(oBmk.BookTime);
        if (cmd == "I") { //新增時,預設勾選紀錄書籤時間
            $("#cbLogBmkTime").prop("checked", true);
            $("#btnBmkSave").val("新增");
            $("#btnBmkDel").css("display", "none");
        } else {
            $("#cbLogBmkTime").prop("checked", ((oBmk.BookTime == "") ? false : true));
            $("#btnBmkSave").val("修改");
            $("#btnBmkDel").css("display", "inline");
        }
        $("#txtBmkTimeD").val(convertDate(BookTime, "yyyyMMdd", "/"));
        $("#txtBmkTimeH").val(BookTime.getHours());
        $("#txtBmkTimeM").val(BookTime.getMinutes());

        $("#lbBmkModTime").text("上次修改時間:" + oBmk.ModTime);
        $("#lbBmkModTime").css("visibility", ((cmd == "I") ? "hidden" : "visible")); //新增時,不顯示修改時間

        //事件綁定
        $("#btnBmkSave").unbind('click').bind("click", { obj: oBmk, cmd: cmd }, function (e) { UpdBmkData(e.data.obj, e.data.cmd, ""); });
        $("#btnBmkDel").unbind('click').bind("click", { obj: oBmk }, function (e) {
            if (confirm('確定刪除書籤紀錄?')) {
                UpdBmkData(e.data.obj, "D", "");
            }
        });
        $("input[name=BmkRight]").unbind('click').bind("click", function (e) {
            var BmkRight = $(this).val();

            if (BmkRight == "0" || BmkRight == "1") {
                $("#cbBmkLocLocal").prop("checked", false);
                $("#cbBmkLocLocal").prop("disabled", true);
                $("#spBmkLocLocal label").css("color", "gray");
            } else {
                $("#cbBmkLocLocal").prop("disabled", false);
                $("#spBmkLocLocal label").css("color", "black");
            }
        });

        // 2015/02/10 修改 Start
        // 組別篩選工具        
        $("#divEditBmk div.divBmkSetGrp").show();
        $('#sBmkGrp')
            .multiselect({
                noneSelectedText: "瀏覽群組",
                selectedText: "瀏覽群組",
                height: "400px",
                header: false,
                position: {
                    my: 'center bottom',
                    at: 'left top'
                },
                close: function (event, ui) {//關閉介面時發生
                    oCom.GRPfilter = [];
                    var multiSel = $('#sBmkGrp').multiselect('getChecked');
                    for (var i = 0; i < $('#sBmkGrp').multiselect('getChecked').length; i++) {
                        oCom.GRPfilter.push(multiSel[i].value);
                    }
                }
            })
            .multiselect("uncheckAll")//預設全部不勾選
            .next().css({
                'width': '80px',
                'height': '26px',
                'background': '#fff',
                'color': '#000',
                'border': '1px solid #BBB',
                'border-radius': '0px'
            });

        $('.divBmkSetGrp').find('button').css({ 'visibility': 'hidden' }); // 隱藏套件的按鈕
        if (oBmk.Rights != "4")
            $('#sBmkGrpImg').css({ 'visibility': 'hidden' });
            //$('.divBmkSetGrp').find('button').css({ 'visibility': 'hidden' });
        else
            $('#sBmkGrpImg').css({ 'visibility': 'visible' });
        //$('.divBmkSetGrp').find('button').css({ 'visibility': 'visible' });

        // 預設群組勾選
        if (oBmk.ShareGrp) {
            var sGrpList = oBmk.ShareGrp.split(',');
            for (var j = 0; j < sGrpList.length; j++) {
                $('[name="multiselect_sBmkGrp"][value="' + sGrpList[j] + '"]').click();
            }
        }
        // 2015/02/10 修改 End
    }

    //異動書籤DB資料
    function UpdBmkData(oBmk, cmd, sender) {

        //功能操作記錄
        setCounterFunc(curExecTool, oBmk.BookID, cmd, "GIS"); //書籤異動功能

        if (sender == "") { //表本身物件叫用,反之為外部物件叫用
            //資料檢查
            if ($("#txtBmkName").val() == "") {
                $("#lbBmkExecMsg").css("visibility", "visible");
                $("#lbBmkExecMsg").text("請輸入書籤名稱");
                return;
            }

            if ($("#txtBmkName").val().length >= 30) {
                $("#lbBmkExecMsg").css("visibility", "visible");
                $("#lbBmkExecMsg").text("書籤名稱超過30的字，請重新輸入");
                return;
            }

            oBmk.BookGroupID = ($("#selBmkModule").val() == "All" || $("#selBmkModule").val() == "ComUse") ? curModule : $("#selBmkModule").val();
            oBmk.BookName = $("#txtBmkName").val();
            oBmk.Rights = $('input[name=BmkRight]:checked').val();

            // 2015/02/10 修改：組群組參數
            if (oBmk.Rights == '4')
                oBmk.GrpList = oCom.GRPfilter;

            IsLoc = ($("#cbBmkLocLocal").prop("checked")) ? "Y" : "N";

            if ($("#cbLogBmkTime").prop("checked") == true) {
                oBmk.BookTime = $("#txtBmkTimeD").val() + " " + pad($("#txtBmkTimeH").val(), 2) + ":" + pad($("#txtBmkTimeM").val(), 2);
            } else {
                oBmk.BookTime = "";
            }
        } else {
            var oGisParm = oCom.convertGISParm(oBmk.GISLink); //取書籤參數
            IsLoc = (oGisParm.Loc == "Y") ? "Y" : "N";
        }

        oBmk.GISLink = getGISLink(IsLoc, oBmk); //重組書籤參數
        oBmk.Funcs = getMarkRecord2();    //紀錄表單資訊
        //@JG20150409*/
        oBmk['MpID'] = $('.selMptList option:selected').val() || ''; //畫布

        oCom.loadBmkList(cmd, oBmk); //傳送至SERVER
    }

    //組書籤字串
    function getGISLink(IsLoc, o) {
        var mapCenter, Cx, Cy;
        if (typeof (mapSpRef) != "undefined" && mapSpRef.wkid == "4326") {
            mapCenter = esri.geometry.webMercatorToGeographic(map.extent.getCenter());
            var XY97 = coordinatesTransfer(mapCenter.x * 1, mapCenter.y * 1, "EPSG:4326", "EPSG:3826");
            Cx = parseFloat(XY97.x).toString();
            Cy = parseFloat(XY97.y).toString();
        }
        else {
            Cx = parseInt(map.extent.getCenter().x).toString();
            Cy = parseInt(map.extent.getCenter().y).toString();
        }

        var Level = map.getLevel();
        var Module = ($("#selBmkModule").val() == "All") ? o.BookGroupID : $("#selBmkModule").val();
        var Func = "";
        //var Funcs = [];
        var QFunc = "";
        var Alpha = "";
        var Loc = IsLoc;
        //var drawID = ""; //畫布待開發 //@JG20150409*/ 加到其他地方去
        var GISLink;
        var Map = curMapBase;

        //道路註記
        var imgRoad = $("#cbTwLabel").attr("src");
        var chkedRoad = (imgRoad.indexOf("uncheck.png") < 0) ? true : false;
        if (chkedRoad) Map = Map + ",99";

        for (var i = 0; i < arrOpenFuncs.length; i++) {
            QFunc += arrOpenFuncs[i].ID + ",";

            //if (arrOpenFuncs[i].Show == "Y") {
            var oFun = $("#" + arrOpenFuncs[i].formid);
            if (oFun.css("display") == "none")
                Func += arrOpenFuncs[i].ID + "/" + "N" + "/" + oFun.css("top") + "/" + oFun.css("left") + ",";
            else
                Func += arrOpenFuncs[i].ID + "/" + "Y" + "/" + oFun.css("top") + "/" + oFun.css("left") + ",";
            //}
            //getMarkRecord(Funcs, arrOpenFuncs[i]);
            var layer = map.getLayer(arrOpenFuncs[i].layerid);
            if (typeof (layer) != "undefined") {
                //新參數格式改為存ID:opacity
                Alpha += arrOpenFuncs[i].ID + ":" + (Math.round(layer.opacity * 10) / 10) + ",";
            }
        }

        if (QFunc != "") QFunc = QFunc.substr(0, QFunc.length - 1);
        if (Func != "") Func = Func.substr(0, Func.length - 1);
        if (Alpha != "") Alpha = Alpha.substr(0, Alpha.length - 1);

        GISLink = "Cx=" + Cx + "|Cy=" + Cy + "|Level=" + Level + "|Func=" + Func + "|Map=" + Map
            + "|Module=" + Module + "|QFunc=" + QFunc + "|Alpha=" + Alpha + "|Loc=" + Loc;
        //@JG20150409*/ 加到其他地方去
        //+ "|Draw=" + drawID;

        return GISLink;
    }

    //紀錄開啟的圖層功能資訊
    function getMarkRecord(objs, func) {
        //debugger
        //div
        //var objs = [];
        //map.graphicsLayerIds   $(“div[id]“)
        //$('.ui-draggable:visible').each(function (i) {
        $('div[id*="' + func.formid + '"]').each(function (i) {
            if ($(this)[0].id.indexOf('RT_') != -1) {
                var type = $(this)[0].id.indexOf('divRT_') != -1 ? 'group' : 'item';
                var t = $(this);
                var obj = {
                    type: type,
                    id: t[0].id,
                    top: t[0].offsetTop,
                    left: t[0].offsetLeft,
                    STNO: t[0].id.replace('RT_WraReservoirHistory', '')
                                 .replace('RT_RainHistory', '')
                                 .replace('RT_WraRiverHistory', '')
                                 .replace('RT_CCTV_', '')
                                 .replace('RT_WATCH_', '')
                                 .replace('RT_TideLevelHistory', ''),
                    src: 'cbFunc'
                }

                //debugger
                //var FuncObj = getArryObj(arrFuncList, "ID", obj.id);
                var name = getRTtype(obj.id);
                if (name != null && name.indexOf('CCTV') != -1) {
                    obj['name'] = name;//'CCTV';
                    obj['exec'] = 'DBPoint';
                    obj['pid'] = t.attr('pid');
                    obj['pname'] = getPName(t.attr('pid'));
                    obj['set'] = {
                        title: $(t).find('.cctvTitle').text(),
                        //stid: obj.STNO,
                        //pid: t.attr('pid'),
                        src: $(t).find('#cctvf')[0].src.replace(/&info=1/gi, ''),//&info=1只顯示一組畫面，否則會有radiobutton
                        px: t.attr('px'),
                        py: t.attr('py')
                    };
                } else if (name != null && name.indexOf('WATCH') != -1) {
                    //debugger
                    obj['name'] = name;//'WATCH';
                    obj['exec'] = 'DBPoint';
                    obj['pid'] = t.attr('pid');
                    obj['pname'] = getPName(t.attr('pid'));
                    obj['set'] = {
                        title: $(t).find('.watchTitle').text(),
                        url: $(t).find('.watchContent img')[0].src,
                        px: t.attr('px'),
                        py: t.attr('py')
                    };
                } else {
                    obj['name'] = name;
                    obj['exec'] = 'RTUI';
                }

                if (type == 'group') {
                    switch (obj.id.replace('divRT_', '')) {
                        case 'CCTV':
                            //obj['funcid'] = '1082'; //CCTV這邊還要設置的更活，目前還是治標不治本上正式機前要處理好
                            obj['funcid'] = getArryObj(arrFuncList, "Name", '水保局CCTV').ID;
                            break;
                        case 'Rain':
                            //obj['funcid'] = '2';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;

                            obj['city'] = $('#selRainCity option:selected').val();
                            obj['unit'] = $('#selRainUnit option:selected').val();
                            obj['inme'] = $('#cbRainMapExtent')[0].checked;
                            obj['accrain'] = $('#cbRainAccRain')[0].checked;
                            obj['acchour'] = $('#selRainAccHour option:selected').val();
                            obj['accmm'] = $('#txtRainAccRain').val();
                            obj['alert'] = $('#cbRainAlertRain')[0].checked;
                            obj['houralert'] = $('#cbRainHourRain')[0].checked;
                            obj['hr24'] = $('#cbRainQryStn')[0].checked;
                            obj['hr'] = $('#selRainQryStn option:selected').val();
                            break;
                        case 'WraReservoir':
                            //obj['funcid'] = '3';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;

                            obj['alert'] = $('#selWraReservoirAlert option:selected').val();
                            obj['basin'] = $('#selWraReservoirBasin option:selected').val();
                            obj['type'] = $('#selWraReservoirType option:selected').val();
                            obj['fp'] = $('#cbWraReservoirFP')[0].checked;
                            obj['inme'] = $('#cbWraReservoirMapExtent')[0].checked;
                            obj['hr24'] = $('#cbWraReservoirQryStn')[0].checked;
                            obj['hr'] = $('#selWraReservoirQryStn option:selected').val();
                            break;
                        case 'WraRiver':
                            //obj['funcid'] = '7';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;

                            obj['alert'] = $('#selWraRiverAlert option:selected').val();
                            obj['basin'] = $('#selWraRiverBasin option:selected').val();
                            obj['hr24'] = $('#cbWraRiverQryStn')[0].checked;
                            obj['hr'] = $('#selWraRiverQryStn option:selected').val();
                            obj['alertpoit'] = $('#cbWraRiverAlertPoit')[0].checked;
                            obj['inme'] = $('#cbWraRiverMapExtent')[0].checked;
                            break;
                        case 'TideLevel':
                            //obj['funcid'] = '6607';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;
                            break;
                        default:
                            break;
                    }
                }
                objs.push(obj);
            }
        });

        //return JSON.stringify(objs);
    }

    //紀錄開啟的圖層功能資訊
    function getMarkRecord2() {
        //debugger
        //div
        var objs = [];
        //map.graphicsLayerIds
        $('.ui-draggable:visible').each(function (i) {
            if ($(this)[0].id.indexOf('RT_') != -1 && $(this)[0].id != "RT_WraRCombine") {
                var type = $(this)[0].id.indexOf('divRT_') != -1 ? 'group' : 'item';
                var t = $(this);
                var obj = {
                    type: type,
                    id: t[0].id,
                    top: t[0].offsetTop,
                    left: t[0].offsetLeft,
                    STNO: t[0].id.replace('RT_WraReservoirHistory', '')
                                 .replace('RT_RainHistory', '')
                                 .replace('RT_WraRiverHistory', '')
                                 .replace('RT_CCTV_', '')
                                 .replace('RT_WATCH_', '')
                                 .replace('RT_TideLevelHistory', ''),
                    src: 'cbFunc'
                }

                //debugger
                //var FuncObj = getArryObj(arrFuncList, "ID", obj.id);
                var name = getRTtype(obj.id);
                if (name != null && name.indexOf('CCTV') != -1) {
                    obj['name'] = name;//'CCTV';
                    obj['exec'] = 'DBPoint';
                    obj['pid'] = t.attr('pid');
                    obj['pname'] = getPName(t.attr('pid'));
                    obj['set'] = {
                        title: $(t).find('.cctvTitle').text(),
                        //stid: obj.STNO,
                        //pid: t.attr('pid'),
                        src: $(t).find('#cctvf')[0].src.replace(/&info=1/gi, ''),//&info=1只顯示一組畫面，否則會有radiobutton
                        px: t.attr('px'),
                        py: t.attr('py')
                    };
                } else if (name != null && name.indexOf('WATCH') != -1) {
                    //debugger
                    obj['name'] = name;//'WATCH';
                    obj['exec'] = 'DBPoint';
                    obj['pid'] = t.attr('pid');
                    obj['pname'] = getPName(t.attr('pid'));
                    obj['set'] = {
                        title: $(t).find('.watchTitle').text(),
                        url: $(t).find('.watchContent img')[0].src,
                        px: t.attr('px'),
                        py: t.attr('py')
                    };
                } else {
                    obj['name'] = name;
                    obj['exec'] = 'RTUI';
                }

                if (type == 'group') {
                    switch (obj.id.replace('divRT_', '')) {
                        case 'CCTV':
                            //obj['funcid'] = '1082'; //CCTV這邊還要設置的更活，目前還是治標不治本上正式機前要處理好
                            obj['funcid'] = getArryObj(arrFuncList, "Name", '水保局CCTV').ID;
                            break;
                        case 'Rain':
                            //obj['funcid'] = '2';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;

                            obj['city'] = $('#selRainCity option:selected').val();
                            obj['unit'] = $('#selRainUnit option:selected').val();
                            obj['inme'] = $('#cbRainMapExtent')[0].checked;
                            obj['accrain'] = $('#cbRainAccRain')[0].checked;
                            obj['acchour'] = $('#selRainAccHour option:selected').val();
                            obj['accmm'] = $('#txtRainAccRain').val();
                            obj['alert'] = $('#cbRainAlertRain')[0].checked;
                            obj['houralert'] = $('#cbRainHourRain')[0].checked;
                            obj['hr24'] = $('#cbRainQryStn')[0].checked;
                            obj['hr'] = $('#selRainQryStn option:selected').val();
                            break;
                        case 'WraReservoir':
                            //obj['funcid'] = '3';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;

                            obj['alert'] = $('#selWraReservoirAlert option:selected').val();
                            obj['basin'] = $('#selWraReservoirBasin option:selected').val();
                            obj['type'] = $('#selWraReservoirType option:selected').val();
                            obj['fp'] = $('#cbWraReservoirFP')[0].checked;
                            obj['inme'] = $('#cbWraReservoirMapExtent')[0].checked;
                            obj['hr24'] = $('#cbWraReservoirQryStn')[0].checked;
                            obj['hr'] = $('#selWraReservoirQryStn option:selected').val();
                            break;
                        case 'WraRiver':
                            //obj['funcid'] = '7';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;

                            obj['alert'] = $('#selWraRiverAlert option:selected').val();
                            obj['basin'] = $('#selWraRiverBasin option:selected').val();
                            obj['hr24'] = $('#cbWraRiverQryStn')[0].checked;
                            obj['hr'] = $('#selWraRiverQryStn option:selected').val();
                            obj['alertpoit'] = $('#cbWraRiverAlertPoit')[0].checked;
                            obj['inme'] = $('#cbWraRiverMapExtent')[0].checked;
                            break;
                        case 'TideLevel':
                            //obj['funcid'] = '6607';
                            obj['funcid'] = getArryObj(arrFuncList, "Name", obj.id.replace('divRT_', '')).ID;
                            break;
                        default:
                            break;
                    }
                }
                objs.push(obj);
            }
        });
        return JSON.stringify(objs);
    }

    //開啟紀錄的圖層功能資訊
    function openMarkRecord(data) {
        var obj = JSON.parse(data.Funcs.replace(/\\"/gi, '"'));

        $.when(openwrainfoto(obj, 0)).done(function () {
            //$('#editmapobj').show();
            //set event
            //$('#editmapobj').on('click', function () {
            //    openeditmapobj();
            //});
        });

        //開啟列表視窗(若物件已創造，須用此方法開啟視窗)
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].type == 'group' && $('#' + obj[i].STNO).is(':hidden')) {
                switchFuncFrm(obj[i].funcid, obj[i].STNO);
            }
        }
    }

    //開啟客製化視窗
    function openwrainfoto(obj, i) {
        if (obj.length == 0) return;
        $.Deferred(function (deferred) {
            //debugger
            var ojs = {
                Rain: oRT_Rain,
                WraReservoir: oRT_WraReservoir,
                WraRiver: oRT_WraRiver,
                TideLevel: oRT_TideLevel
            };

            var name = obj[i].name == null ? obj[i].id.replace('divRT_', '') : obj[i].name;
            switch (name) {
                case 'Rain':
                case 'WraReservoir':
                case 'WraRiver':
                    var oRT_ = ojs[name];
                    if (typeof (oRT_) == 'undefined' || oRT_ == null) {
                        $.when(switchFuncModule(obj[i].funcid, name, obj[i].exec, false, obj[i].src)).done(function () {
                            openCSTIW(obj[i]);
                            if (i < obj.length - 1) {
                                openwrainfoto(obj, i += 1);
                                return;
                            }
                        });
                    } else {
                        openCSTIW(obj[i]);
                        if (i < obj.length - 1) {
                            openwrainfoto(obj, i += 1);
                            return;
                        }
                    }
                    break;
                case 'CCTV':
                case 'WATCH':
                    //這邊若有n個視窗就會呼叫 switchFuncModule  n次，造成1.開2.關3.開4.關
                    //debugger
                    var layer = map.getLayer("layerDBPoint" + obj[i].pid);
                    if (typeof (layer) == "undefined") {
                        var FuncObj = getArryObj(arrFuncList, "ID", obj[i].pid);
                        $.when(switchFuncModule(FuncObj.ID, FuncObj.Name, FuncObj.Exec, false, obj[i].src)).done(function () {
                            openCSTIW(obj[i]);
                            if (i < obj.length - 1) {
                                openwrainfoto(obj, i += 1);
                                return;
                            }
                        });
                    } else {
                        openCSTIW(obj[i]);
                        if (i < obj.length - 1) {
                            openwrainfoto(obj, i += 1);
                            return;
                        }
                    }
                    break;
                case 'TideLevel':
                    var oRT_ = ojs[name];
                    if (typeof (oRT_) == 'undefined' || oRT_ == null) {
                        $.when(switchFuncModule(obj[i].funcid, name, obj[i].exec, false, obj[i].src)).done(function () {
                            openCSTIW(obj[i]);
                            if (i < obj.length - 1) {
                                openwrainfoto(obj, i += 1);
                                return;
                            }
                        });
                    } else {
                        openCSTIW(obj[i]);
                        if (i < obj.length - 1) {
                            openwrainfoto(obj, i += 1);
                            return;
                        }
                    }

                    break;
                default:
                    openCSTIW(obj[i]);
                    if (i < obj.length - 1) {
                        openwrainfoto(obj, i += 1);
                        return;
                    }
                    break;
            }
            deferred.resolve();
        });
    }

    function openCSTIW(obj) {
        var ojs = {
            Rain: oRT_Rain,
            WraReservoir: oRT_WraReservoir,
            WraRiver: oRT_WraRiver,
            TideLevel: oRT_TideLevel
        };
        //var ojss = {//目前只關閉 checkbox24小時,應再考慮其他欄位
        //    Rain: '#cbRainQryStn',
        //    WraReservoir: '#cbWraReservoirQryStn',
        //    WraRiver: '#cbWraRiverQryStn'
        //};
        var ojss = {
            Rain: {
                city: { id: '#selRainCity', type: 'select' },
                unit: { id: '#selRainUnit', type: 'select' },
                inme: { id: '#cbRainMapExtent', type: 'checkbox' },
                accrain: { id: '#cbRainAccRain', type: 'checkbox' },
                acchour: { id: '#selRainAccHour', type: 'select' },
                accmm: { id: '#txtRainAccRain', type: 'text' },
                alert: { id: '#cbRainAlertRain', type: 'checkbox' },
                houralert: { id: '#cbRainHourRain', type: 'checkbox' },
                hr24: { id: '#cbRainQryStn', type: 'checkbox' },
                hr: { id: '#selRainQryStn', type: 'select' },

            },
            WraReservoir: {
                alert: { id: '#selWraReservoirAlert', type: 'select' },
                basin: { id: '#selWraReservoirBasin', type: 'select' },
                type: { id: '#selWraReservoirType', type: 'select' },
                fp: { id: '#cbWraReservoirFP', type: 'checkbox' },
                inme: { id: '#cbWraReservoirMapExtent', type: 'checkbox' },
                hr24: { id: '#cbWraReservoirQryStn', type: 'checkbox' },
                hr: { id: '#selWraReservoirQryStn', type: 'select' },
            },
            WraRiver: {
                alert: { id: '#selWraRiverAlert', type: 'select' },//value:-1,2,1,0
                basin: { id: '#selWraRiverBasin', type: 'select' },
                hr24: { id: '#cbWraRiverQryStn', type: 'checkbox' },
                hr: { id: '#selWraRiverQryStn', type: 'select' },
                alertpoit: { id: '#cbWraRiverAlertPoit', type: 'checkbox' },
                inme: { id: '#cbWraRiverMapExtent', type: 'checkbox' }
            },
            TideLevel: {

            }
        };
        try {
            switch (obj.type) {
                case 'item':
                    //debugger
                    switch (obj.name) {
                        case 'Rain':
                        case 'WraReservoir':
                        case 'WraRiver':
                        case 'TideLevel':
                            var oRT_ = ojs[obj.name];
                            if (typeof (oRT_) == 'undefined') {
                                setTimeout(function () { openCSTIW(obj); }, 200);
                                return;
                            } else {
                                $.when(oRT_.viewHisChart(obj.STNO)).done(function () {
                                    setdivtopleft({
                                        id: obj.id,
                                        top: obj.top,
                                        left: obj.left
                                    });
                                    //oRT_.redrawHisChartLine();//XX
                                });
                            }
                            break;
                        case 'CCTV':
                            //debugger
                            if (typeof (_oRT_CCTV) == 'undefined') {
                                var layer = map.getLayer("layerDBPoint" + obj.pid);
                                if (typeof (layer) == 'undefined') {
                                    setTimeout(function () { openCSTIW(obj); }, 200);
                                    return;
                                } else {
                                    $('head').append($('<script src="JS/RT_CCTV/RT_CCTV.js?v=' + Math.floor(Math.random() * 1E6 + 1) + '"><' + '/script>'));
                                    _oRT_CCTV = new oRT_CCTV();
                                    _oRT_CCTV.init(layer);
                                }
                            } else {
                                var layer = map.getLayer("layerDBPoint" + obj.pid);
                                _oRT_CCTV.init(layer);
                            }

                            var set = {
                                title: obj.set.title,
                                stid: obj.STNO,
                                pid: obj.pid,
                                src: obj.set.src,
                                px: obj.set.px,
                                py: obj.set.py,
                                top: obj.top,
                                left: obj.left
                            };

                            _oRT_CCTV.show(set);

                            setdivtopleft({
                                id: obj.id,
                                top: obj.top,
                                left: obj.left
                            });

                            // _oRT_CCTV.relocdiv()
                            setTimeout(function () { _oRT_CCTV.relocdiv(); }, 1500);
                            break;
                        case 'WATCH':
                            //debugger
                            if (typeof (_oRT_WATCH) == 'undefined') {
                                var layer = map.getLayer("layerDBPoint" + obj.pid);
                                if (typeof (layer) == 'undefined') {
                                    layer = new esri.layers.GraphicsLayer({ id: "layerDBPoint" + obj.pid, "opacity": 1 });
                                    map.addLayer(layer);

                                    _oRT_WATCH = new oRT_WATCH();
                                    _oRT_WATCH.init(layer);

                                    //setTimeout(function () { openCSTIW(obj); }, 200);
                                    //return;
                                } else {
                                    _oRT_WATCH = new oRT_WATCH();
                                    _oRT_WATCH.init(layer);
                                }
                            }
                            var set = {
                                title: obj.set.title,
                                stid: obj.STNO,
                                pid: obj.pid,
                                url: obj.set.url,
                                px: obj.set.px,
                                py: obj.set.py
                            };

                            _oRT_WATCH.show(set);

                            setdivtopleft({
                                id: obj.id,
                                top: obj.top,
                                left: obj.left
                            });

                            _oRT_WATCH.relocdiv();
                            break;
                    }
                case 'group':
                default:
                    switch (obj.id) {
                        case 'divRT_Rain':
                        case 'divRT_WraReservoir':
                        case 'divRT_WraRiver':
                            var ocb = ojss[obj.id.replace('divRT_', '')];
                            for (var item in ocb) {
                                if ($(ocb[item].id).size() != 0) {
                                    switch (ocb[item].type) {
                                        case 'checkbox':
                                            $(ocb[item].id)[0].checked = obj[item].toString().toLowerCase() == 'true';
                                            break;
                                        case 'select':
                                            if ($(ocb[item].id + ' option').size() > 0) {
                                                setTimeout(function () {
                                                    //設定select無效果!?
                                                    $(ocb[item].id).val(obj[item]);
                                                    $(ocb[item].id).trigger('change');
                                                }, 200);
                                            } else {
                                                setTimeout(function () { openCSTIW(obj); }, 200);
                                                return;
                                            }
                                            break;
                                    }
                                } else {
                                    setTimeout(function () { openCSTIW(obj); }, 200);
                                    return;
                                }
                            }
                            break;
                    }
                    setdivtopleft({
                        id: obj.id,
                        top: obj.top,
                        left: obj.left
                    });
                    break;
            }
        } catch (e) {
            setTimeout(function () { openCSTIW(obj); }, 200);
            return;
        }
    }

    function setdivtopleft(obj) {
        if ($('#' + obj.id).size() == 0) {
            setTimeout(function () { setdivtopleft(obj); }, 200);
            return;
        } else {
            $('#' + obj.id).css({
                top: obj.top,
                left: obj.left
            });
        }
    }

    function getRTtype(id) {
        if (id.indexOf('WraReservoirHistory') != -1) {
            return 'WraReservoir';
        } else if (id.indexOf('RainHistory') != -1) {
            return 'Rain';
        } else if (id.indexOf('WraRiverHistory') != -1) {
            return 'WraRiver';
        } else if (id.indexOf('CCTV') != -1) {
            return 'CCTV';
        } else if (id.indexOf('WATCH') != -1) {
            return 'WATCH'
        } else if (id.indexOf('TideLevel') != -1) {
            return 'TideLevel'
        } else {
            return null;
        }
    }

    function getPName(pid) {
        switch (pid) {
            case '1082':
                return '水保局CCTV';
            case '1083':
                return '水利署CCTV';
            case '1084':
                return '高工局CCTV';
            case '1088':
                return '屏東縣CCTV';
            default:
                return null;
        }
    }

    //取書籤模組對應圖檔位置
    function getBmkImgSrc(mod) {
        var imgsrc = "";
        switch (mod) {
            case "A1": //氣象資訊
                imgsrc = "images/widgetBookMark/meteorologyGroup.png";
                break;
            case "D1": //坡地資訊
                imgsrc = "images/widgetBookMark/slopingGroup.png";
                break;
            case "D2": //淹水資訊
                imgsrc = "images/widgetBookMark/floodingGroup.png";
                break;
            case "F8": //災情資訊
                imgsrc = "images/widgetBookMark/disasterGroup.png";
                break;
            case "C1": //遙測影像收集
                imgsrc = "images/widgetBookMark/telemetryGroup.png";
                break;
            case "A2": //歷史個案分析
                imgsrc = "images/widgetBookMark/historyGroup.png";
                break;
            case "A4": //災害區位及類型預判
                imgsrc = "images/widgetBookMark/locationGroup.png";
                break;
            case "B1": //地震資訊
                imgsrc = "images/widgetBookMark/earthquakeGroup.png";
                break;
        }
        return imgsrc;
    }

    //切換檢視模式
    function switchViewMode() {
        var mode = $("#aViewMode").attr("viewmode");
        
        if (mode == "list") {
            $("#divViewBmkList").show();
            $("#divViewBmkImg").hide();
            $("#aViewMode").attr("viewmode", "image");

            $("#aViewMode").html("切換圖示模式");
        } else {
            $("#divViewBmkList").hide();
            $("#divViewBmkImg").show();
            $("#aViewMode").attr("viewmode", "list");
            $("#aViewMode").text("切換清單模式");

            //bmkModIdx = 7;
            //$("#divBmkModule").css("left", 45);
            //$("#divBmkImgLeft img").show();
            //$("#divBmkImgRight img").hide();
        }
    }

    // 2016/01/26 修改，加入畫布
    oCom.relocTipbox = function () {
        if (typeof (TempMapPainter) != "undefined") {
            if (oCom.Mp_ID_fromPortal2 != "") TempMapPainter.isPortal = 'Y';
            //重新定位地圖畫家的文字訊息框
            if ($("#divMapPainterDraw").length > 0 && $("#divMapPainterDraw").html() != "") TempMapPainter.relocTipbox();
        }
    }

}