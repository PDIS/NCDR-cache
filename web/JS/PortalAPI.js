/**********************************
 * SUMMARY ：入口網
 * INPUT   ：
 * OUTPUT  ：
 * VERSIONS：2014/08/25  Vicky Liang  Create
             
 **********************************/

//#region 系統登入

//檢核登入狀態
function chkLoginStatus() {
    submitLoginSuccess(null, "initChk");
    //var url = "GetData/Portal/getSysEntry.ashx";
    //$.ajax({
    //    url: url,
    //    type: 'get',                 // post/get
    //    dataType: "json",             // xml/json/script/html
    //    cache: false,                 // 是否允許快取
    //    success: function (data) {
    //        submitLoginSuccess(data, "initChk");
    //    },
    //    error: function () {
    //        loadPSiteSetting(); //載入頁面
    //        loadCaseCapData();  //載入警戒資料
    //        //loadCounTownData();
    //    }
    //});
}

//登入
function submitLogin() {
    //var url = "GetData/Portal/getSysEntry.ashx";
    //$.ajax({
    //    url: url,
    //    type: 'get',                 // post/get
    //    data: {
    //        Acc: $("#txtAccount").val(),
    //        Pwd: $("#txtPassword").val()
    //    },
    //    dataType: "json",             // xml/json/script/html
    //    cache: false,                 // 是否允許快取
    //    beforeSend: function () {
    //        $("#divLogin").append("<div class='mask'>資料驗證中...</div>")
    //    },
    //    success: function (data) {
    //        submitLoginSuccess(data, "submit");
    //    },
    //    error: function () {
    //        $("#divLogin .mask").remove();
    //    },
    //    complete: function () {
    //        $("#divLogin .mask").remove();
    //    }
    //});
}

//單一登入
function submitSingleLogin() {
    var SingleReturnUrl = gpNCDRWebUrl + "index.aspx";
    document.location.href = gpSingleLoginUrl + encodeURIComponent(SingleReturnUrl);
}

//EMIC登入 2016/08/08 Kevin
function submitEMICLogin() {
    var SingleReturnUrl = gpNCDRWebUrl + "index.aspx";
    document.location.href = "http://portal.emic.gov.tw/nfasso/action/ssoLogon.do?returnUrl=" + encodeURIComponent(SingleReturnUrl);
}

//登入成功處理
function submitLoginSuccess(data, src) {

    //if (src == "initChk") {
    //    loadCaseCapData();  //初始載入警戒資料
    //    //loadCounTownData(); //載入縣市鄉鎮資料
    //    loadPSiteSetting(); //初始載入頁面
    //} else {
    //    //$('#tabMenu .tabs li a:first').trigger('click'); //登入後,開啟第一個父頁籤
    //    $('#tabMenu').find('.tabsBmk').children().unbind('click');
    //    $('#tabMenu').find('ul.tabs li a').unbind('click');
    //    oModTab.loadSrcData();
    //}



    //setCounterFunc("Login", "", "", "PTL"); //功能操作記錄

    //oGrpInfo = data.user;
    //arrSysEntry = data.sysEntry;
    //createSysEntry(data.sysEntry);
    //$("#sUserName").show();
    //$("#sUserName").text("Welcome，" + data.user.UsrAcct);
    //如果使用者沒填寫Email且不為AD帳號，則跳出建議修改Email提醒 2016/06/14 Kevin
    //if (data.user.Email == "" && data.user.IsAD == "N") {
    //    $("#userID").html(data.user.UsrAcct);
    //    $("#InfoChangeAlert").show();
    //}
    //yolanda  如果登入者由單一登入或E政府要特別將帳號做處理
    //var splitAcct = data.user.UsrAcct.split("_@");
    //$("#sUserName").text("Welcome，" + splitAcct[0]);
    //2016.04.29 Kevin 一般登入後，顯示個人專區 
    //if (data.user.UsrAcct.indexOf('_@') <= 0)
    //    document.getElementById('selfInfo').style.display = "inline";
    //yolanda E政府登出時，要導回E政府登出頁面
    //$("#aLogout").unbind('click').bind("click", function () {
    //    if (data.user.UsrAcct.indexOf('_@SSO') > 0) {
    //        LogoutSSO();
    //    }
    //    else
    //        Logout();
    //    //2016.04.29 Kevin 登出後，隱藏個人專區 
    //    document.getElementById('selfInfo').style.display = "none";
    //});

    if (typeof (oGrpInfo.CounID) == "undefined" || oGrpInfo.CounID == "") {
        LBS_COUN_ID = "00";
        LBS_COUN_NA = "";
        LBS_TOWN_ID = "00";
        LBS_TOWN_NA = "";
    } else {
        LBS_COUN_ID = oGrpInfo.CounID;
        LBS_COUN_NA = oGrpInfo.CounName;
    }

    if (src == "initChk") {
        loadCaseCapData();  //初始載入警戒資料
        //loadCounTownData(); //載入縣市鄉鎮資料
        loadPSiteSetting(); //初始載入頁面
    } else {
        //$('#tabMenu .tabs li a:first').trigger('click'); //登入後,開啟第一個父頁籤
        $('#tabMenu').find('.tabsBmk').children().unbind('click');
        $('#tabMenu').find('ul.tabs li a').unbind('click');
        oModTab.loadSrcData();
    }

    //setTimeout(function () { // 2015/07/30 示警平台前台
    //    getLimitData();
    //}, 2000);


}

//創建系統選單
function createSysEntry() {
    $(".SysLogout").show();
    var tmphtml = "<select id='selSys'>"
    tmphtml += "<option  id='" + "none" + "' class='aSysEntry'>" + "請選擇系統" + "</option>";
    for (var i = 0; i < arrSysEntry.length; i++) {
        tmphtml += "<option  id='" + arrSysEntry[i].EntryId + "' class='aSysEntry'>" + arrSysEntry[i].EntryName + "</option>";
        //html += "<a  id='" + arrSysEntry[i].EntryId + "' class='aSysEntry'>" + arrSysEntry[i].EntryName + "</a>";
    }
    tmphtml += "</select>"
    $("#loginSys").html(tmphtml);
    //$("#aLogin").text("請選擇系統 ▼");
    
    $("#divLogin").hide();
    $("#divLogin").css("right", 89);
    $("#divLogin").width(130);
    $("#frmLogin").empty();
    $(".SysLogin img").attr("src", "images/Portal/systemSelect.png");
    var html = "";
    html += "<div style='text-align: left;'>"
    html += "<input type='hidden' name='EntryId' value=''>"
    html += "<input type='hidden' name='EntryUrl' value=''>"
    //for (var i = 0; i < arrSysEntry.length; i++) {
    //    html += "<a  id='" + arrSysEntry[i].EntryId + "' class='aSysEntry'>" + arrSysEntry[i].EntryName + "</a>";
    //}
    html += "</div>"
    $("#frmLogin").append(html);
    $("#selSys").unbind('change').bind("change", function () { selSysEntry($("#selSys option:selected").attr('id')); });
    //$("#frmLogin .aSysEntry").unbind('click').bind("click", function () { selSysEntry(this.id); });
}

//選擇系統選單
function selSysEntry(id) {
    console.log('selSys');
    debugger;
    var obj = getArryObj(arrSysEntry, "EntryId", id);
    $("#frmLogin").find("input[name='EntryId']").val(id);
    $("#frmLogin").find("input[name='EntryUrl']").val(obj.EntryUrl);
    $("#frmLogin").attr("action", "SysRedirect.aspx");
    $("#frmLogin").submit();
}

//登出
function Logout() {
    var url = "GetData/Logout.ashx";
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",             // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            arrSysEntry = [];
            oGrpInfo = {};
            //$("#aLogin").text("輔助系統登入");
            $("#loginSys").html('<a id="aLogin" style="padding-right:5px;" >輔助系統登入</a>');
            $("#aLogin").unbind('click').bind("click", function () { switchObjDisplay('divLogin'); });
            $(".SysLogout").hide();
            $("#sUserName").hide();
            $("#sUserName").text("");
            $("#divLogin").hide();
            $("#divLogin").css("right", 5);
            $("#divLogin").width(200);
            $("#frmLogin").empty();

            var html = "";
            html += "帳號：<input id='txtAccount' type='text' value='' /><br />";
            html += "密碼：<input id='txtPassword' type='password' value='' /><br />";
            html += "<input id='btnLogin' type='button' value='登入' /><br />";
            html += " <div><input id='btnSinLogin' type='button' value='E政府登入' style='width:80px;' />     <input id='btnEMICLogin' type='button' value='EMIC登入' style='width:80px;' /></div>";
            html += "<div id='applyAcc' style='display:inline;'><input id='btnApplyAccount' type='button' value='帳號申請' style='color:#1EB5C3;background-color:white;border:none;text-decoration:underline;font-size:13.5px;cursor:pointer;width:60px;padding-right: 59px;' /></div>";
            html += "|    <div id='pwForget' style='display:inline;'><input  type='button' value='忘記密碼' style='color:#1EB5C3;background-color:white;border:none;text-decoration:underline;font-size:13.5px;cursor:pointer;width:60px;padding-right: 59px;' /></div>";//2016/04/29 Kevin  加入忘記密碼按鈕 2016/5/10 移到連結時顯示手指游標
            html += "<div style='color:#f00; font-size:10px; line-height: 15px;'>(本系統目前僅提供政府應變人員使用，暫不接受一般民眾申請)</div>";
            $("#frmLogin").append(html);

            //bind event
            $("#btnLogin").unbind('click').bind("click", function () { submitLogin(); });
            $("#btnSinLogin").unbind('click').bind("click", function () { submitSingleLogin(); });//E政府事件綁定
            $("#btnEMICLogin").unbind('click').bind("click", function () { submitEMICLogin(); });//EMIC登入事件綁定 2016/08/08 Kevin
            $("#btnApplyAccount").unbind('click').bind("click", function () { window.open('applyAccount.aspx', '_blank'); });//帳號申請事件綁定
            $("#pwForget  input[type='button']").unbind('click').bind("click", function () { window.open('queryPassword.aspx', '_blank'); });//2016/04/29 忘記密碼事件綁定
            oModTab.loadSrcData();
            //2016/05/10 加上按下Enter後進行登入事件 Kevin
            $('#txtPassword,#txtAccount').unbind("keypress").keypress(function (e) {
                if (e.which == 13) {
                    $('#btnLogin').focus().click();
                }
            });
        },
        error: function () { }
    });

}

//E政府登出
function LogoutSSO() {
    var sUrl2 = gpNCDRWebUrl + "index.aspx";
    var SingleLogout = gpSingleLogoutUrl + encodeURIComponent(sUrl2 + "?L") + '&cancelUrl=' + encodeURIComponent(sUrl2);
    document.location.href = SingleLogout;
}

//#endregion

//載入頁面設定資料
function loadPSiteSetting() {
    //var url = "GetData/Portal/getPortalMain.ashx";
    //$.ajax({
    //    url: url,
    //    type: 'get',     // post/get
    //    data: {
    //        "urlParaName": urlParaName,//模板化災情網:多傳入網址參數名稱 2016/06/27 Kevin
    //        "urlParaValue": urlParaValue,//模板化災情網:多傳入網址參數值 2016/06/27 Kevin
    //    },
    //    dataType: "json", // xml/json/script/html
    //    cache: false,     // 是否允許快取
    //    success: function (data) {
    //        oPortalSet = data;
    //        $("#BannerText").text(data.BannerText); //設定系統名稱      

    //        initPortal(); //初始化介面            
    //        excTabAndMarguee(); // 2015/11/25 修改
    //        //loadFuncListDataAll(); //初始載入圖層資料 // 2015/11/25 修改
    //    },
    //    error: function () { }
    //});
    initPortal(); //初始化介面            
    excTabAndMarguee(); // 2015/11/25 修改
}

//初始化介面
function initPortal() {
    
    oModTab = new ModuleTab(); //頁籤    
    oBookmark = new Bookmark(); //書籤

    resetVisibleComp();  //調整中間區域寬度、隱藏頁籤API不須用到的區塊 2016/11/09 Kevin   
    //getOnlinePcnt();  //取出線上人數
    //getBrowseCount(); //取出總瀏覽人次
    GetCountyList();

    //防災速報
    oNcdrEQ = new NcdrEQ();
    //oNcdrEQ.getNCDREQTime();

    //統計圖
    oModChart = new ModuleChart();
    oModChart.SetId = setId;
    //oModChart.loadSrcData(LBS_COUN_NA); //暫不載入資料集,載入時機:頁籤點擊事件-->縣市change事件

    //相關連結
    oWebLink = new ModuleLink();
    //oWebLink.loadSrcData();

    //地圖
    oModMap = new ModuleMap();
    oModMap.initBlock();
    
    //bind event
    $("#btnLogin").unbind('click').bind("click", function () { submitLogin(); });
    $("#btnSinLogin").unbind('click').bind("click", function () { submitSingleLogin(); });//E政府事件綁定
    $("#btnEMICLogin").unbind('click').bind("click", function () { submitEMICLogin(); });//EMIC登入事件綁定 2016/08/08 Kevin
    $("#btnApplyAccount").unbind('click').bind("click", function () { window.open('applyAccount.aspx', '_blank'); });//帳號申請事件綁定
    $("#pwForget input[type='button']").unbind('click').bind("click", function () { window.open('queryPassword.aspx', '_blank'); });//2016/04/29 忘記密碼事件綁定
    $("#selCounty").unbind('change').bind("change", function () { CountySelectChange(true, 'counChange'); }); //縣市change事件 // 2016/01/27 修改：判斷是否要重Load鄉鎮清單
    $("#selTownship").unbind('change').bind("change", function () { TownshipSelectChange(); }); //鄉鎮change事件
    $("#btnNCDREQ").unbind('click').bind("click", oNcdrEQ.showNCDREQ); //防災速報
    $("#imgLBS").unbind('click').bind("click", getLBS); //防災速報
    $("#hideInfoChangeAlert").unbind('click').bind("click", function () { $('#InfoChangeAlert').hide(); }); //2016/06/14 下一次按鈕事件綁定 Kevin
    $("#changeUserInfo").unbind('click').bind("click", function () { $('#InfoChangeAlert').hide(); window.open('editUserData.aspx', '_blank'); });//2016/06/14 立即修改按鈕事件綁定 Kevin
    $("#closeTabsCase").unbind('click').bind("click", function () {
        closeTabs("#tabInfo", "#tabsCase", "#closeTabsCase", "#openTabsCase");
    });
    $("#openTabsCase").unbind('click').bind("click", function () {
        openTabs("#tabInfo", "#tabsCase", "#closeTabsCase", "#openTabsCase");
    });
    $("#closeMapInfo").unbind('click').bind("click", function () {
        closeTabs("#mapInfo", "#divOpenFunc", "#closeMapInfo", "#openMapInfo");
    });//地圖資訊收合按鈕綁定收合事件
    $("#openMapInfo").unbind('click').bind("click", function () {
        openTabs("#mapInfo", "#divOpenFunc", "#closeMapInfo", "#openMapInfo");
    });//地圖資訊收合按鈕綁定收合事件
    window.onresize = resetVisibleComp;
    //2016/05/10 加上按下Enter後進行登入事件 Kevin
    $('#txtPassword,#txtAccount').unbind("keypress").keypress(function (e) {
        if (e.which == 13) {
            $('#btnLogin').focus().click();
        }
    });
}

function closeTabsCase() {
    $("#R1").height(35);
    $("#tabsCase").hide();
    $("#closeTabsCase").hide();
    //    $("#openTabsCase").show();
    $("#openTabsCase").css("display", "inline-block");
    var r1Height = $("#R1").height();
    console.log(r1Height);
    var mapInfoHeight = $("#divFuncLegend").height();
    console.log(mapInfoHeight);
    //$("#mainRight").height(r1Height + mapInfoHeight);

}

//function closeTabs(tabTitle, tabContent, closeIcon, openIcon) {
//   // $(tabTitle).height(35);
//    $(tabContent).hide();
//    $(closeIcon).hide();
//    $(openIcon).show();
//    $(openIcon).css("display", "inline-block");
//    $(tabTitle).removeClass("openTab");
//    $(tabTitle).addClass("closeTab");
//}

function closeMapInfo() {
    $("#divFuncLegend").height(31);
    $("#divOpenFunc").hide();
    $("#closeMapInfo").hide();
    //    $("#openTabsCase").show();
    $("#openMapInfo").css("display", "inline-block");
    var r1Height = $("#R1").height();
    console.log(r1Height);
    var mapInfoHeight = $("#divFuncLegend").height();
    console.log(mapInfoHeight);
    //$("#mainRight").height(r1Height + mapInfoHeight);
}

//function openTabs(tabTitle, tabContent, closeIcon, openIcon) {
//   // $(tabTitle).height("100%");
//    $(tabContent).show();
//    $(closeIcon).show();
//    $(openIcon).hide();
//    $(tabTitle).removeClass("closeTab");
//    $(tabTitle).addClass("openTab");
//}

function openTabsCase() {
    var winH = $(window).height();



    var RightW = ($("#mainRight").length == 0) ? 0 : $("#mainRight").width();
    var RightH = ($("#mainRight").length == 0) ? 0 : (winH * 0.655);
    console.log(RightH);
    console.log(winH - RightH);
    $("#R1").height(RightH);
    //$("#R1").height("65.5%");
    $("#tabsCase").show();
    $("#closeTabsCase").show();
    $("#openTabsCase").hide();
    var r1Height = $("#R1").height();
    console.log(r1Height);
    var mapInfoHeight = $("#divFuncLegend").height();
    console.log(mapInfoHeight);
    //$("#mainRight").height(r1Height + mapInfoHeight);
    //$("#mainRight").height("100%");
}

function openMapInfo() {
    var winH = $(window).height();



    var RightW = ($("#mainRight").length == 0) ? 0 : $("#mainRight").width();
    var RightH = ($("#mainRight").length == 0) ? 0 : (winH * 0.655);
    console.log(RightH);
    console.log(winH - RightH);
    //$("#R1").height(RightH);
    $("#divFuncLegend").height((winH - RightH) - 16);
    //$("#divFuncLegend").height("32.8%");
    $("#divOpenFunc").show();
    $("#closeMapInfo").show();
    $("#openMapInfo").hide();
    var r1Height = $("#R1").height();
    console.log(r1Height);
    var mapInfoHeight = $("#divFuncLegend").height();
    console.log(mapInfoHeight);
    //$("#mainRight").height(r1Height + mapInfoHeight);
   // $("#mainRight").height("100%");
}

//調整中間區域寬度
function resetVisibleComp(event) {
    var winH = $(window).height();
    var winW = $(window).width();    
    var btnExpandOffset = 0;
    //自適應-Su
    var MainRigheW =  250;
    $('#divMarguee').height(0);
    $('#divBanner').hide();
    $('#MargueePic').hide();
    $('#tabMenu').hide();
    $('#divFooter').hide();
    $('#divMarguee').hide();
    //$("#mainRight").hide();
    $("#R2").hide();
    
    $("#btnExpand").hide();
    $("#mainRight").width(MainRigheW);   
    $("#R1 ul.tabs li").width(MainRigheW);
    //$("#R1 ul.tabs li").css("border-radius", "5px 5px 0px 0px");
    $("#R1 ul.tabs li a").width(MainRigheW);

    var RightW = ($("#mainRight").length == 0) ? 0 : $("#mainRight").width();
    var RightH = ($("#mainRight").length == 0) ? 0 : (winH * 0.655);
    console.log(RightH);
    console.log(winH - RightH);
    //$("#R1 #tabsCase").height(RightH-48);
    //$("#R1").height(RightH);
    //$("#divOpenFunc").height((winH - RightH) - 49);
    $('#divMain').css({        
        "top": 0        
    });
    $('#C2').css({
        "top": 0
    });
    $('.esriSimpleSliderIncrementButton').css({
        "position": "fixed",
        "left": "38px",
        "bottom": "39px",
        "background": "#fff",
        "width": "25px",
        "height": "25px",
        "border-radius":"0px"
    });
    $('.esriSimpleSliderDecrementButton').css({
        "position": "fixed",
        "left": "10px",
        "bottom": "40px",
        "background": "#fff",
        "width": "25px",
        "height": "25px",
        "border-radius": "5px 0px 0px 5px"
    });

    $('#btnFunLegend').css({
        "position": "fixed",
        "left": "20px",
        "bottom": "31px",        
    });
    //重算DIV寬度
    $("#divBanner").width(winW);
    $("#divFooter").width(winW);
    $("#divMain").width(winW);
    //$("#mainCenter").width(winW - RightW - 20);
    $("#mainCenter").width(winW);
    $("#tabMenu").width(winW - RightW - 10);
    //縮放時重新設定頁籤scrool bar 2016/07/13
    //oModTab.setMainTabScrollbar();
    //oModTab.setSubTabScrollbar(currTabElmId);

    //重算DIV高度
    var footerH = $("#divFooter").height();
    var mainH = RightH - footerH + 20;
    //$("#mainCenter").height(mainH);
    $("#mainCenter").height(winH);
    //$("#mainRight").height(mainH);
    $("#C2").height(winH);
    //$("#C2").height(mainH - 55);
    
    //$("#R1 div").height(mainH - $("#R2").height() - 40);

    //重算footer位置
    var CenterH = ($("#mainCenter").length == 0) ? 0 : $("#mainCenter").height();
    var footerTop = mainH;
    footerTop = footerTop + $("#divBanner").height() + 40;

   

    //$("#divFooter").css("top", footerTop);

    //if (typeof (event) != "undefined" && event.type == 'resize') {
    //    //oModChart.loadSrcData(LBS_COUN_NA);
    //    //oModChart.loadSrcData(LBS_COUN_NA, '', '0'); // 加入頁籤

    //    // 2015/10/01 增修地震統計圖，讓本來已點選的統計圖加上縣市參數更新
    //    if ($('#R2 .ui-state-active a').length == 0)
    //    oModChart.loadSrcData(LBS_COUN_NA, '', '0'); // 加入頁籤
    //    else
    //        $('#R2 .ui-state-active a').click(); // 2015/10/01 增修地震統計圖，讓本來已點選的統計圖加上縣市參數更新

    //    oModTab.setMainTabScrollbar();
    //    oModTab.setSubTabScrollbar("#tabs-" + oModTab.currTab.ParentId);
    //}

    //更新統計圖-Su
    //$(window).resize(function (event) {
    //    oModChart.loadSrcData(LBS_COUN_NA);
    //    //更新統計圖-Su
    //});
}

//載入警戒資料
function loadCaseCapData() {
    CapDataLoaded = 'N'; // 2015/10/13 修改 : 調整頁籤的效能與警戒顯示(Cap是否已Load完)

    //var url = "GetData/Portal/getModuleAlert.ashx";
    //$.ajax({
    //    url: url,
    //    type: 'get',     // post/get
    //    data: {"Cmd": "getCapData"},
    //    dataType: "json", // xml/json/script/html
    //    cache: false,     // 是否允許快取
    //    success: function (data) {
    //        arrCaseCapData = data;
    //        CapDataLoaded = 'Y'; // 2015/10/13 修改 : 調整頁籤的效能與警戒顯示
    //    },
    //    error: function () {
    //        CapDataLoaded = 'Y'; // 2015/10/13 修改 : 調整頁籤的效能與警戒顯示
    //    }
    //});
}

//取出警戒資料描述
function getCaseCapDesc() {
    var obj = oModTab.currTab;
    if (obj.InfoType != "CAP") return;

    var selCoun = LBS_COUN_ID;
    var selTown = LBS_TOWN_ID;
    var strDesc = "";
    for (var i = 0; i < arrCaseCapData.length; i++) {
        if (selCoun == "00" && selTown == "00") { //縣市鄉鎮不拘時,比對全台資料
            if (arrCaseCapData[i].AltId == obj.AltType) {
                strDesc = arrCaseCapData[i].description;
                break;
            }
        } else { //依縣市鄉鎮比對                        
            var findCap = function () {
                var capCoun = "";
                var capTown = "";

                //取出cap縣市
                if (StrLeft(arrCaseCapData[i].AreaId, 1) == "6")
                    capCoun = StrLeft(arrCaseCapData[i].AreaId, 2) + "000";
                else
                    capCoun = StrLeft(arrCaseCapData[i].AreaId, 5);

                //取出cap鄉鎮
                if (arrCaseCapData[i].AreaId.length > 5) {
                    capTown = StrLeft(arrCaseCapData[i].AreaId, 7);
                }

                //比對區域
                var isFind = false;
                if (arrCaseCapData[i].AltId == obj.AltType) {
                    if (capCoun == selCoun) { //先比縣市
                        isFind = true;
                    }

                    if (selTown != "00") { //再比鄉鎮
                        switch (obj.AltType) {
                            case "2": //颱風:縣市層級
                            case "3": //地震:縣市層級
                            case "9": //停班停課:縣市層級
                                break;
                            default:  //鄉鎮
                                if (capTown != "") {
                                    if (capTown == selTown)
                                        isFind = true;
                                    else 
                                        isFind = false;
                                }
                                break;
                        }
                    }                    
                }
                return isFind;
            }

            if (findCap()) {
                strDesc = arrCaseCapData[i].description;
                break;
            }
        }
    }

    return strDesc;
}

//依ID取出圖層資料集
function loadFuncListDataByIDs(Funcs) {
    var url = "GetData/funcWidget/getFuncListData.ashx?module=A1&funcs=" + Funcs;
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        dataType: "json",              // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            data.forEach(function (element, index, array) {
                if (jQuery.inArray(element, arrFuncList) < 0) {
                    arrFuncList.push(element);
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) { }
    });
}

//載入所有圖層資料集
function loadFuncListDataAll() {
    var url = "GetData/funcWidget/getFuncListData.ashx";
    $.ajax({
        url: url,
        type: 'get',                 // post/get
        data: { "src": "api" },
        dataType: "json",              // xml/json/script/html
        cache: false,                 // 是否允許快取
        success: function (data) {
            arrFuncList = data;
        },
        error: function (jqXHR, textStatus, errorThrown) { },
        complete: function () {

            /* // 2015/11/25 修改
            //頁籤
            oModTab.SetId = oPortalSet.SetId;
            oModTab.loadSrcData();

            //跑馬燈
            oModMarguee = new ModuleMarguee();
            oModMarguee.loadSrcData();
            */
        }
    });
}

// 先處理頁籤與跑馬燈 // 2015/11/25 修改
function excTabAndMarguee() {
    //頁籤
    oModTab.SetId = setId;
    oModTab.loadSrcData();

    //跑馬燈
    //oModMarguee = new ModuleMarguee();
    //oModMarguee.loadSrcData();
}


//#region 行政區篩選(改變LBS區域)

//取得縣市清單
function GetCountyList() {
    $("#selCounty").empty(); //下拉式選單清空
    $('#selCounty').append("<option value='00' selected>不拘</option>");

    if (arrCounTown.length == 0) {
        setTimeout(GetCountyList, 500);
    } else {
        for (var i = 0; i < arrCounTown.length; i++) {
            $('#selCounty').append("<option value='" + arrCounTown[i].COUN_ID + "'>" + arrCounTown[i].COUN_NA + "</option>");
        }
    }
}

//取得鄉鎮清單
function GetTownshipList() {

    $("#selTownship").empty(); //下拉式選單清空
    $('#selTownship').append("<option value='00' selected>不拘</option>");

    if (LBS_COUN_ID == "00") return;

    var objCoun = getArryObj(arrCounTown, 'COUN_ID', LBS_COUN_ID);
    for (var i = 0; i < objCoun.TOWN.length; i++) {
        var o = objCoun.TOWN[i];
        if (o.TOWN_ID=="0000000") continue;
        $('#selTownship').append("<option value='" + o.TOWN_ID + "'>" + o.TOWN_NA + "</option>");
    }
}

//縣市change事件
//function CountySelectChange() {
function CountySelectChange(isLoadTown, ChartID) { // 2016/01/27 修改：判斷是否要重Load鄉鎮清單、不要讓Chart一直重畫

    //更新定位縣市
    LBS_COUN_NA = ($('#selCounty').val() == "00") ? "" : $("#selCounty").find(":selected").text();
    LBS_COUN_ID = $('#selCounty').val();
    LBS_TOWN_NA = "";
    LBS_TOWN_ID = "00";

    if (isLoadTown || $("#selTownship option").length == 0) // 2016/01/27 修改：判斷是否要重Load鄉鎮清單
        GetTownshipList();

    // 2015/10/01 增修地震統計圖，讓本來已點選的統計圖加上縣市參數更新
    // 2016/01/27 修改：不要讓Chart一直重畫
    if ((ChartID != 'null' || $("#R2").find('#ul_Chart li').length == 0) && (keepChartId != ChartID)) {
        if ($('#R2 .ui-state-active a').length == 0)
            oModChart.loadSrcData(LBS_COUN_NA, '', '0'); // 加入頁籤
        else
            $('#R2 .ui-state-active a').click(); // 2015/10/01 增修地震統計圖，讓本來已點選的統計圖加上縣市參數更新

        keepChartId = ChartID;
    }

    //更新圖面資料
    if (oModTab.currTab.LyrType == "IMG" && oModTab.currTab.ImgType == "url") {
        var url = oModTab.getTabImageUrl(oModTab.currTab.ImgUrl);
        $("#divImg").find("img").attr("src",url);
    } else if (oModTab.currTab.LyrType == "BMK") {
        CountyTownshipLoc();
    }

    // 2015/09/07 修改 : 資訊綜覽地區性
//su 0927 start
    if (oModTab.currTab.InfoType == "TXT")
//Su 0927 end
        oModTab.setTabsCaseAreaInfo(tabsCaseUrlTmp);
}

//鄉鎮change事件
function TownshipSelectChange() {
    //setCounterFunc("70", LBS_TOWN_ID, "Q", "PTL"); //功能操作記錄

    LBS_COUN_NA = $("#selCounty").find(":selected").text();
    LBS_COUN_ID = $('#selCounty').val();
    LBS_TOWN_NA = $("#selTownship").find(":selected").text();
    LBS_TOWN_ID = $('#selTownship').val();

    if (oModTab.currTab.LyrType == "BMK")
        CountyTownshipLoc(); //鄉鎮定位

    // 2015/09/07 修改 : 資訊綜覽地區性
//su 0927 start
    if (oModTab.currTab.InfoType == "TXT")
//Su 0927 end	
        oModTab.setTabsCaseAreaInfo(tabsCaseUrlTmp);
}

//縣市鄉鎮定位
function CountyTownshipLoc() { //鄉鎮定位

    //移除行政界輪框
    var gLayer = map.getLayer("gcZone");
    if (typeof (gLayer) != "undefined") {
        map.removeLayer(gLayer);
    }

    //依區域連動篩選資訊綜覽
    //var capDesc = getCaseCapDesc();
    var capDesc = "";
    if (capDesc == "") capDesc = "該地區無發布相關警示"; // 2015/09/18 修改
    $('#tabsCase').text(capDesc);

    if (LBS_COUN_ID == "00") return;

    //繪製行政界輪框
    if (LBS_TOWN_ID != "00") {
        drawZone("town", LBS_COUN_NA + ',' + LBS_TOWN_NA);
    } else {
        drawZone("coun", LBS_COUN_NA);
    }

    //書籤為「定位地方」時,依行政區重新定位
    if (oModTab.currBmkGisParm.Loc != null && oModTab.currBmkGisParm.Loc == "Y") {
        var extent;
        var oCoun = getArryObj(arrCounTown, 'COUN_ID', LBS_COUN_ID);

        if (LBS_TOWN_ID != "00") {
            var oTown = getArryObj(oCoun.TOWN, 'TOWN_ID', LBS_TOWN_ID);
            extent = new esri.geometry.Extent(parseFloat(oTown.TOWN_L), parseFloat(oTown.TOWN_B), parseFloat(oTown.TOWN_R), parseFloat(oTown.TOWN_T), new esri.SpatialReference(mapSpRef));

        }
        else {
            extent = new esri.geometry.Extent(parseFloat(oCoun.COUN_L), parseFloat(oCoun.COUN_B), parseFloat(oCoun.COUN_R), parseFloat(oCoun.COUN_T), new esri.SpatialReference(mapSpRef));
        }
        setTimeout(function () { map.setExtent(extent) }, 1500); //延遲extent以免在Bookmark setGISLink1()執行設定比例尺地圖未讀取完畢使得地圖爆掉 @20160406 Andy 再把延遲時間調長成1500,以避免累積雨量圖跑掉 20160513 Kevin
    }
}



//#endregion


//#region 取得當前位置

function getLBS() {
    // 檢查是否支援geolocation            
    if (typeof (navigator.geolocation) == undefined) {
        alert("無法利用位置資訊。");
        return;
    }
    // 開始監視 getCurrentPosition = 僅問一次
    navigator.geolocation.getCurrentPosition(
      successCallback, errorCallback, { timeout: 3000 });
}
function successCallback(position) {
    var lat = position.coords.latitude.toString();
    var lon = position.coords.longitude.toString();
    var WGS97 = coordinatesTransfer(lon * 1, lat * 1, "EPSG:4326", "EPSG:3826");

    if (typeof (mapSpRef) != "undefined" && mapSpRef.wkid == "4326") {
        LBS_x = lon;
        LBS_y = lat;
    } else {
        LBS_x = WGS97.x;
        LBS_y = WGS97.y;
    }


    queryArea(WGS97.x, WGS97.y);
}
function errorCallback(err) {
    switch (err.code) {
        case err.TIMEOUT:
            console.log('LBS TIMEOUT');
            //alert('無法取得定位，將使用預設位置');
            break;

        case err.POSITION_UNAVAILABLE:
            console.log('LBS POSITION_UNAVAILABLE');
            //alert('無法取得定位，將使用預設位置');
            break;

        case err.PERMISSION_DENIED://拒絕，用預設位置「新北市新店區」
            alert('無法取得定位');
            break;

        case err.UNKNOWN_ERROR:
            alert('請稍候再試');
            break;
    }
}
//依坐標查詢行政區
function queryArea(PX, PY) {
    var queryTask, query;
    require([
      "esri/tasks/query",
      "esri/tasks/QueryTask"
    ], function (
      Query, QueryTask
    ) {
        queryTask = new QueryTask(LBS_Url + "?token=" + LBS_Token);
        query = new Query();
        query.where = "1=1";
        query.returnGeometry = false;
        query.geometry = new esri.geometry.Point(Number(PX), Number(PY), new esri.SpatialReference({ wkid: 102443 }));
        query.outFields = ["COUN_NA", "COUN_ID", "TOWN_NA", "TOWN_ID"]; //
        queryTask.execute(query, showResults);

        function showResults(results) {
            if (results.features.length > 0) {

                LBS_COUN_ID = results.features[0].attributes.COUN_ID.toString();
                LBS_COUN_NA = results.features[0].attributes.COUN_NA.toString();
                LBS_TOWN_ID = results.features[0].attributes.TOWN_ID.toString();
                LBS_TOWN_NA = results.features[0].attributes.TOWN_NA.toString();

                $('#selCounty').val(LBS_COUN_ID).trigger('change');
                var setSelTownship = function () {
                    if ($('#selTownship option[value="' + LBS_TOWN_ID + '"]').length > 0) {
                        $('#selTownship').val(LBS_TOWN_ID);
                    }
                    else {
                        setTimeout(setSelTownship, 500);
                    }
                }
                setSelTownship();
                CountyTownshipLoc();
            }
            else {
                //用預設位置「新北市新店區」
                LBS_COUN_ID = "65000"
                LBS_COUN_NA = "新北市";
                LBS_TOWN_ID = "6500600";
                LBS_TOWN_NA = "新店區";

                $('#selCounty').val(LBS_COUN_ID).trigger('change');
                var setSelTownship = function () {
                    if ($('#selTownship option[value="' + LBS_TOWN_ID + '"]').length > 0) {
                        $('#selTownship').val(LBS_TOWN_ID);
                    }
                    else {
                        setTimeout(setSelTownship, 500);
                    }
                }
                setSelTownship();
            }
        }
    });
}

//#endregion

//地圖
function ModuleMap() {
    var oCom = this;

    //介面初始化
    oCom.initBlock = function () {
        //創建執行圖示
        loading = dojo.byId("loadingImg");

        //創建地圖
        map = new esri.Map("map", {
            slider: true,            //是否顯示比例尺工具BAR
            sliderPosition: "top-right",
            lods: lods,              //比例尺參數
            zoom: mapDfZoom,
            logo: false
        });
	//2017-05-08:先註解掉大眾版用不到
        //var url = (isToken == "Y") ? gpTiledMapWorldI + "?Token=" + gpNCDR_Token : gpTiledMapWorldI;
        //lyrTiledMapWorldI = new esri.layers.ArcGISTiledMapServiceLayer(url, { id: "lyrTiledMapWorldI" }); //世界地圖-影像地圖版
        //map.addLayer(lyrTiledMapWorldI, 1);        
        //添加地圖事件
        map.on("load", function () {
            if (typeof (mapSpRef) == "undefined") mapSpRef = map.spatialReference;

            dojo.connect(map, "onUpdateStart", showLoading);
            dojo.connect(map, "onUpdateEnd", hideLoading);

            dojo.connect(map, "onExtentChange", MapExtentChangePortal);
            dojo.connect(map, "onZoomEnd", MapZoomEndPortal);
            resetVisibleComp();  //調整中間區域寬度  
            var fastLocForAPI;
            if (typeof (fastLocForAPI) == "undefined") {
                fastLocForAPI = new FastLocForAPI();
            }
            $("#mainRight").show();
            var layer = map.getLayer("layerFastLoc");
            if (typeof (layer) == "undefined") {
                layer = new esri.layers.GraphicsLayer({ id: "layerFastLoc", "opacity": 1 });
                map.addLayer(layer);
            }
            $("#txtLocKeyWord").unbind("keypress").keypress(function (e) {
                if (event.keyCode == 13) {                 
                    
                    fastLocForAPI.keywordSearch();
                }
            });
            $("#addressSearchIcon").click(function () {             
               
                fastLocForAPI.keywordSearch();
            });
            $("#btnToggle").unbind('click').bind("click", toggleMainRight); //2016/06/14 資訊綜覽收放按鈕事件綁定 Kevin
            $("#ncdrMarker a,#NcdrLogo").on("click", function () {
                window.open('http://eocdss.ncdr.nat.gov.tw/web/', '_blank');
                //window.open("http://eocdss.ncdr.nat.gov.tw", "_blank", 'toolbar=yes,scrollbars=yes,resizable=yes,fullscreen=yes,height=' + screen.height + ', width=' + screen.width);
            });
            $("#buttonOpenWindow").on("click", function () {               
                windowObject = window.open(homeUrl, "_blank", 'toolbar=yes,scrollbars=yes,resizable=yes,fullscreen=yes,height=' + screen.height + ', width=' + screen.width);
                windowObject.moveTo(0, 0);
            });
            $("#buttonLocateHome").click(function () {
                //設定比例尺
                if (typeof (scale) != "undefined") {
                    map.setLevel(parseInt(scale));
                }

                //定位至中心點

                if (mapSpRef != "undefined" && mapSpRef.wkid == "4326") {
                    var xy84;

                    if (typeof (cx) != "undefined") {
                        xy84 = coordinatesTransfer(cx * 1, cy * 1, "EPSG:4326", "EPSG:4326");
                    }
                    cx = xy84.x.toFixed(5);
                    cy = xy84.y.toFixed(5);
                }
                var pt = new esri.geometry.Point(parseFloat(cx), parseFloat(cy), new esri.SpatialReference(mapSpRef));
                map.centerAt(pt);


            });
            $("#addressUnitLogo").click(function () {
               
                var barWidth = $("#addressSearchPanel").width();
                if (barWidth == 330) {
                    $("#addressSearchPanel").animate({
                        "width": "40px"
                    }, 1000);
                    $("#addressContent").hide("slide", { direction: "left" }, 1000);
                    $("#addressResult").hide("slide", { direction: "left" }, 1000);

                } else {
                    $("#addressSearchPanel").animate({
                        "width": "330px",
                    }, 1000);
                    $("#addressContent").show("slide", { direction: "left" }, 1000);
                    $("#addressResult").show("slide", { direction: "left" }, 1000);
                }   

            });
            
            //$("#addressUnitLogo").toggle(function () {
            //    $("#addressSearchPanel").animate({                   
            //        "width": "50px",
            //    }, 1000);
            //},
            //function () {
            //    $("#addressSearchPanel").animate({
            //        "width": "250px",
            //    }, 1000);
            //}
            //);
            ////if (isMovedCenter == false) {
            //var width = $('#map').width();
            //var height = $('#map').height();
            //var x = (width + 300-70) / 2;
            //var y = height-100;
            //console.log("x:" + x + "y:" + y);
            //var screenPt = new esri.geometry.ScreenPoint(x, y);
            //var mapPt = map.toMap(screenPt);
            //if (mapSpRef != "undefined") {
            //    //var xy84 = coordinatesTransfer(mapPt.x, mapPt.y, "EPSG:3826", "EPSG:4326");
            //    console.log('centerAt');
            //    //var xy84 = coordinatesTransfer(parseFloat(mapPt.x), parseFloat(mapPt.y), "EPSG:4326", "EPSG:3857");
            //    var xy84 = coordinatesTransfer(mapPt.x * 1, mapPt.y * 1, "EPSG:3826", "EPSG:4326");
            //    var mp = esri.geometry.webMercatorToGeographic(mapPt);

            //    posX = mp.x.toFixed(6);
            //    posY = mp.y.toFixed(6);
            //    //var pt = new esri.geometry.Point(parseFloat(xy84.x), parseFloat(xy84.y), new esri.SpatialReference(mapSpRef));
            //    var pt = new esri.geometry.Point(parseFloat(posX), parseFloat(posY), new esri.SpatialReference(mapSpRef));
            //    map.centerAt(pt);

            //}

            //console.log(mapPt);
            //isMovedCenter = true;
            ////}
            $('#btnCapture').click(ScreenCapture);
        });
    }

    //地圖縮放動作結束後事件
    function MapZoomEndPortal(extent, zoomFactor, anchor, level) {

        //比例尺小於可視範圍時, 替換對應底圖
        var lyrTiledMapBg = map.getLayer("lyrTiledMap" + curMapBase);
        if (map.getScale() > mapVisScale) {
            //lyrTiledMapWorldI.show();

            if (typeof (lyrTiledMapBg) != "undefined")
                lyrTiledMapBg.hide();
        }
        else {
            //lyrTiledMapWorldI.hide();

            if (typeof (lyrTiledMapBg) != "undefined") {
                lyrTiledMapBg.show();

                var curScale = map.getScale();
                var curZoomFactor = zoomFactor;
                setLod(curScale, curZoomFactor);
            }
        }

        SetQFuncVisibleByAll(); //設定圖例區顯示狀態
    }

    //地圖範圍改變事件
    function MapExtentChangePortal(extent, delta, outLevelChange, outLod) {
        oBookmark.relocTipbox();
        refreshOpenLayer(); //重整已開啟圖層資料
    }

    //設定比例尺
    function setLod(scale, zoomfactor) {
        var layer = map.getLayer("lyrTiledMap" + curMapBase);
        if (typeof (layer) == "undefined") return;

        if (layer.loaded) {
            var layerLods = (layer.minScale > mapVisScale) ? layer.tileInfo.lods : lods;
            var nearScale;
            var vaildLods = [];

            for (var i = 0; i < lods.length; i++) {
                for (var j = 0; j < layerLods.length; j++) {
                    if (lods[i].scale == layerLods[j].scale) {
                        vaildLods.push({ idx: i, scale: lods[i].scale, level: lods[i].level });
                        break;
                    }
                }
            }

            var idx;
            for (var k = 0; k < vaildLods.length; k++) {
                if (scale == vaildLods[k].scale) {
                    idx = vaildLods[k].idx;
                    break;
                } else {
                    if (zoomfactor > 1) { //放大
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

            if (typeof (idx) == "undefined") {
                idx = (zoomfactor > 1) ? (vaildLods.length - 1) : 0;
                map.setScale(vaildLods[idx].scale);
            }
        }
        else {
            dojo.connect(layer, "onLoad", setLod);
        }
    }

    //畫面截圖
    function ScreenCapture() {
        //setCounterFunc('64', '', 'Q', 'PTL');

        var execTime = convertDate(getCurrentDateTime(), "yyyyMMddHHmmss", "");
        //var url = 'ScreenCapture.aspx';
        //var name = 'ScreenCapture';
        var keys = ['BookID', 'BookName', 'xmin', 'ymin', 'xmax', 'ymax', 'sr'];
        var mapExtent = map.extent;
        if (typeof (mapSpRef) != "undefined" && mapSpRef.wkid == "4326") {
            mapExtent = esri.geometry.webMercatorToGeographic(map.extent);
        }

        var values = [
            oModTab.currTab.BookId,
            oModTab.currTab.BookName + "_" + execTime,
            (mapExtent.xmin).toFixed(5),
            (mapExtent.ymin).toFixed(5),
            (mapExtent.xmax).toFixed(5),
            (mapExtent.ymax).toFixed(5),
            mapSpRef.wkid
        ];
        var html = "";
        for (var i = 0; i < keys.length; i++) {
            html += keys[i] + "=" + values[i] + "&";
        }
        //window.open("ScreenCapture.aspx?" + html);
        window.open("BmkSnapshot.aspx?" + html);
    }

}

//頁籤
function ModuleTab() {
    var oCom = this;
    oCom.SetId;
    oCom.arrSrcData = []; //來源資料集
    oCom.currTab;
    oCom.currBmkGisParm;

    //載入頁籤資料
    oCom.loadSrcData = function () {

        // 2015/10/13 修改 : 調整頁籤的效能與警戒顯示
        //if (arrCaseCapData.length == 0) {
        //if (CapDataLoaded == 'N') {
        //    setTimeout(oCom.loadSrcData, 500);
        //    return;
        //}

        var url = "GetData/Portal/getModuleTab.ashx";
        var SetId = oCom.SetId;
        var IsLocal = (typeof (oGrpInfo.IsLocalEdition) == "undefined") ? "" : oGrpInfo.IsLocalEdition;
        var grpId = (typeof (oGrpInfo.GrpId) == "undefined") ? "" : oGrpInfo.GrpId; //加入群組Id @20150914 Andy
        $.ajax({ url: url, data: { Cmd: "ParticularTab", SetId: SetId, DataId: pageID } })
            .done(function (json) {
                oCom.arrSrcData = $.parseJSON(json);
                initBlock();
            })
            .fail(function (ex) { })
            .always(function () { });
    }

    //設定頁籤圖片來源網址
    oCom.getTabImageUrl = function (imgUrl) {
        var arrImgUrl = imgUrl.split("|");
        var url = "";
        if (arrImgUrl.length == 1) { //固定連結
            url = imgUrl;
        } else { //動態連結
            if (LBS_COUN_ID == "00") { //全台
                url = arrImgUrl[0];
            } else { //縣市

                //轉換縣市代碼
                var area;
                if (StrLeft(LBS_COUN_ID, 1) == "6")
                    area = StrLeft(LBS_COUN_ID, 2);
                else
                    area = StrLeft(LBS_COUN_ID, 5);

                //判斷不同縣市共用圖片,ex:65,10007:65;10004,10018:10004;10010,10020:10010
                if (arrImgUrl[2] != "") {
                    var arrTmp = arrImgUrl[2].split(";");
                    for (var i = 0; i < arrTmp.length; i++) {
                        if (arrTmp[i].split(":")[0].indexOf(area) > -1) {
                            area = arrTmp[i].split(":")[1];
                            break;
                        }
                    }                    
                }
                url = arrImgUrl[1].replace("[area]", area);
            }
            
        }

        return url;
    }

    //初始
    function initBlock() {

        //#region 產生頁籤
        $('#tabMenu').empty();
        var scrollbarHtml = '';
        scrollbarHtml += '<div style="position:absolute; right:0px; top:2px; height:25px;"><img id="MainTabPrev" src="images/Portal/left.png" style="vertical-align: middle;padding-right: 10px; cursor:pointer" /><img id="MainTabNext" src="images/Portal/right.png" style="vertical-align: middle;padding-right: 10px; cursor:pointer"  /></div>';
        scrollbarHtml += '<div style="position:absolute; right:0px; bottom:0px; height:25px;"><img id="SubTabPrev" src="images/Portal/left.png" style="vertical-align: middle;padding-right: 10px; cursor:pointer" /><img id="SubTabNext" src="images/Portal/right.png" style="vertical-align: middle;padding-right: 10px; cursor:pointer" /></div>';
        $('#tabMenu').prepend(initTab()).append(scrollbarHtml);
        oCom.setMainTabScrollbar(); //設定捲軸
        //設定子頁籤警戒頁籤hover時顏色 2016/08/12 Kevin
        $('#tabMenu .tabsBmk a').hover(function () {
            
            //$(this).children().css("background-color", "#00DAD9");
            if ($(this).hasClass("IsAlt")) {
               
                $(this).children().removeClass("altItem");
                $(this).children().addClass("spanHover");
            }
           
        }, function () {
            //$(this).children().css("background-color", "#00DAD9");
            if ($(this).hasClass("IsAlt")) {
                
                $(this).children().removeClass("spanHover");
                $(this).children().addClass("altItem");
            }
         
        });
        //子頁籤
        $('#tabMenu').find('.tabsBmk').each(function () {
            $(this)
                .children()
                .click(function () {
                    
                    $(this).children('span')
                        .addClass('tabsBmk-active');//頁籤點擊變色
                        //.siblings().removeClass('tabsBmk-active')
                        //.parent().siblings().children('a').children('span').removeClass('tabsBmk-active').children().css('color', '#046EB8');
                    $(this).siblings().children('span')
                      .removeClass('tabsBmk-active');
                    $(this).siblings().children('span').css('color', '#FFF');
                    //設定所有警戒頁籤為白字(紅底)
                    //$(this).siblings().children().css('color', '#046EB8');
                    $(this).siblings(".IsAlt").children().css('color', '#FFF');
                    //$(this).siblings(".IsAlt").children('span').css({
                    //    'background': '#C7310C',
                    //    'width':'110px'
                    //});
                    $(this).siblings(".IsAlt").children('span').addClass("altItem");
                    //設定當前頁籤顏色,若有警戒,則為紅字,反之白字
                    if ($(this).hasClass('IsAlt')) {
                        $(this).children().css('color', '#BB0D33');
                        //$(this).children('span').css({
                        //    'background': '#00DAD9',
                        //    'width': '110px'
                        //});
                        $(this).siblings(".IsAlt").children('span').addClass("altItem");
                    } else {
                        $(this).children().css('color', '#323C50');
                    }

                    // 2015/10/14 修改 : 頁籤綁定統計圖頁籤，自動開啟
                    // 2016/01/27 修改：不要讓Chart一直重畫
                    var chartTabTimeOut = 0;
                    if ($(this).children().attr('ChartId') != 'null') {
                        var clickChartTab = function () {
                            if (($("#R2").find('#ul_Chart li').length > 0) && (keepChartId != $('#tabMenu').find('.tabsBmk-active').find('span').attr('ChartId'))) {
                                $('#ul_Chart a[href=#ChartTab_' + $('#tabMenu').find('.tabsBmk-active').find('span').attr('ChartId') + ']').click();
                            }
                            else
                                chartTabTimeOut = setTimeout(clickChartTab, 1000);
                        };
                        clickChartTab();
                        clearTimeout(chartTabTimeOut);
                    }

                    $(".viewRT_History.ui-draggable[id^='RT_']").remove(); // 2015/12/24 清除CCTV畫面

                    //子頁籤click事件
                    //childTabClick($(this).children().attr('DataId')); // 2016/01/27 修改：不要讓Chart一直重畫
                    childTabClick($(this).children().attr('DataId'), $('#tabMenu').find('.tabsBmk-active').find('span').attr('ChartId'));  // 2016/01/27 修改：不要讓Chart一直重畫
                })
                .each(function () {
                    var target = $(this);                    
                    //arrCaseCapData.forEach(function (element, index, array) {
                    //    if (element.AltId == target.children().attr('AltType')) {
                    //        if (element.description != "") {
                    //            target.addClass('IsAlt');
                    //        }
                    //    }
                    //});
                });
        });

        //父頁籤
        $('#tabMenu').find('ul.tabs li a').each(function () {
            var obj = getArryObj(oCom.arrSrcData, 'DataId', $(this).attr('DataId'));
            var altDesc = (obj.AltType === undefined || obj.AltType === null) ? "查無資料" : (getArryObj(arrCaseCapData, 'AltId', obj.AltType).description === undefined ? "查無資料" : getArryObj(arrCaseCapData, 'AltId', obj.AltType).description);
            if (altDesc != "查無資料") {
                $(this).parent().addClass('IsAlt');
                $(this).css('color', '#FFF');
            }
            $(this).click(function () {
                //console.log("parentTab");
                //console.log($(this).children("div").html());
                $("#parentTabName").html($(this).children("div").html());
                $("#parentTabName").css({'font-size':'15px','font-weight':'bold'});
                var tabElmId = $(this).attr('href');
                currTabElmId = tabElmId;
                oCom.setSubTabScrollbar(tabElmId); //設定捲軸
                $(this).parent().siblings().children().children().css('color', '#404040'); //設定所有頁籤為灰字
                $(this).parent().siblings(".IsAlt").children().children('div').css('color', '#fff'); //設定所有警戒頁籤為白字(紅底)
                $(this).parent().siblings(".IsAlt").children().children('div').addClass("altItem"); //設定所有警戒頁籤為白字(紅底)
                $(this).children('div')
                       .addClass('tabsBmk-active');//頁籤點擊變色
                //設定當前頁籤顏色,若有警戒,則為紅字,反之白字
                if ($(this).parent().hasClass('IsAlt')) {
                    $(this).children().css('color', '#C7310C');                    
                } else {
                    $(this).children().css('color', '#fff');
                    //$(this).parent().siblings().children().children().css('color', '#323C50');
                }
               
                $('#tabsCase').text(altDesc);

                //預設開啟項下第一個子頁籤
                $("#tabMenu " + tabElmId).children().eq(0).trigger('click');
            });
        });

        $("#tabMenu").tabs();
        $("#tabMenu").tabs('refresh');
        
        //#endregion

        $("#R1").tabs();

        //#region 預設開啟第一個書籤 // 2015/11/25 修改
        //var initBmk = function () {
        //    console.log('wait initBmk');
        //    if (arrFuncList.length == 0)//等待arrFuncList建立，才能套疊書籤
        //        setTimeout(initBmk, 1000);
        //    else {
        //        $('#tabMenu .tabs li a:first').trigger('click');
        //        //$("#tabMenu .tabsBmk:first").children().eq(0).trigger('click'); //移到父頁籤click事件
        //    }
        //}
        //initBmk();//預設開啟第一頁第一個
        $('#tabMenu .tabs li a:first').trigger('click');  // 2015/11/25 修改
        loadFuncListDataAll(); //初始載入圖層資料 // 2015/11/25 修改
        //#endregion
    }

    //組出頁籤的HTML字串，回傳
    function initTab() {
        var parentArry = [];
        var childArry = [];

        //將原始資料分為父頁籤陣列跟子頁籤陣列
        oCom.arrSrcData.forEach(function (element, index, array) {
            if (element.ParentId == null) {
                parentArry[index] = oCom.arrSrcData[index];
            }
            else {
                if (typeof childArry[element.ParentId] == "undefined") {
                    childArry[element.ParentId] = [];
                    childArry[element.ParentId].push(oCom.arrSrcData[index]);
                } else {
                    childArry[element.ParentId].push(oCom.arrSrcData[index]);
                }
            }
        });
        var parentHTML = "";
        var childHTML = [];

        //用父頁籤陣列組出HTML字串                
        parentHTML += "<ul class='tabs'>";
        parentArry.forEach(function (element, index, array) {            
            parentHTML += "<li><a DataId='" + element.DataId + "' href='#tabs-" + element.DataId + "'>" +"<div id='parentTitle' style='display:inline-block;line-height:22px;width:110.5px;color:#323C50' >"+ element.PageTitle + "</div></a></li>";
            childHTML[element.DataId * 1] = "";
            childHTML[element.DataId * 1] += "<div id='tabs-" + element.DataId + "' class='tabsBmk'>";
        });
        parentHTML += "</ul>";

        //用子頁籤陣列組出HTML字串
        var parentAlt = [];
        childArry.forEach(function (element, index, array) {
            childArry[index].forEach(function (ele, idx, arr) {
                var objP = getArryObj(parentArry, 'DataId', ele.ParentId);
                if (objP != "") { //存在父頁籤物件時，才建立子頁籤物件
                    childHTML[index] += "<a><span style='display:inline-block;line-height:20px;color:#fff;width:110px;' DataId='" + ele.DataId + "' AltType='" + ele.AltType + "'>" + ele.PageTitle + "</span></a>"; // 2015/10/14 修改
                    //childHTML[index] += "<li  style='width:120px;display:inline;'><a><span DataId='" + ele.DataId + "' AltType='" + ele.AltType + "' ChartId = '" + ele.ChartId + "' >" + ele.PageTitle + "</span></a></li>"; // 2015/10/14 修改
                }
            });
        });

        var HTML = "";
        HTML += parentHTML;
        childHTML.forEach(function (element, index, array) {
            childHTML[index] += "</div>";
            //childHTML[index] += "</ul>";
            HTML += childHTML[index];
        });

        return HTML;
    }

    //子頁籤click事件
    //function childTabClick(DataId) { // 2016/01/27 修改：不要讓Chart一直重畫
    function childTabClick(DataId, ChartID) { // 2016/01/27 修改：不要讓Chart一直重畫
        //setCounterFunc("68", DataId, "Q", "PTL"); //功能操作記錄
        
        var obj = getArryObj(oCom.arrSrcData, 'DataId', DataId);
        oCom.currTab = obj;
        oCom.currBmkGisParm = null;
        console.log("childTab");
        console.log(obj.PageTitle);
        $('#childTabName').html(obj.PageTitle);
        $('#childTabName').css({ 'font-size': '15px', 'font-weight': 'bold' });
        var initBmk = function () { // 2015/11/25 修改
            if (arrFuncList.length == 0)//等待arrFuncList建立，才能套疊書籤 // 2015/11/25 修改
                setTimeout(initBmk, 1000); // 2015/11/25 修改
            else {
                //地圖區連動事件
                switch (obj.LyrType) {
                    case "BMK"://套疊書籤
                        //console.log('BMK'); 
                        $("#map").show();
                        $("#divImg").hide();
                        $("#divGME").hide();

                        
                        //oBookmark.openedBmkTime = obj.BookTime; //加入書籤時間，河川水位判斷是否有專案時間分別撈即時(沒時間)或即時+歷史(有時間)  @20160420 Andy //改回沒有時間判斷 @20160428    Andy
                        oBookmark.Mp_ID_fromPortal2 = obj.MpID; // 2016/01/26 修改，加入畫布
                        oBookmark.OpenBookmark(obj, "portal");
                        oCom.currBmkGisParm = oBookmark.convertGISParm(oCom.currTab.GISLink);
                        
                        break;

                    case "IMG"://開啟DB圖片
                        //console.log('IMG');
                        var divImgH = $("#divImg").height();
                        var html = "";
                        if (obj.ImgType == "url") {
                            var url = oCom.getTabImageUrl(obj.ImgUrl)
                            html += "<div style='text-align: center;'>";
                            html += "<img src='" + url + "' style='cursor:pointer;height:" + divImgH + "px' onclick='window.open(\"" + url + "\")' />";
                            html += "</div>";
                        }
                        else if (obj.ImgType == "file") {
                            var url = "GetData/Portal/getModuleTab.ashx?Cmd=Img&DataId=" + DataId;
                            html += "<div style='text-align: center;'>";
                            html += "<img src='" + url + "' style='cursor:pointer;height:" + divImgH + "px' onclick='window.open(\"" + url + "\")' />";
                            html += "</div>";

                        } else if (obj.ImgType == "html") {
                            html = "<div style='height:" + divImgH + "px'>" + obj.ImgCode + "</div>";
                        }

                        $("#divImg").empty().append(html);
                        $("#divImg").show();
                        $("#map").hide();
                        $("#divGME").hide();
                        break;

                    case "GME"://開啟GME iframe
                        //console.log('GME');
                        $("#divGME").empty().append(obj.GMECode);
                        $("#divGME iframe").width("100%");
                        $("#divGME iframe").height("100%");
                        $("#divGME").show();
                        $("#map").hide();
                        $("#divImg").hide();
                        break;
                }

                runCountySelectChange();    //等拿到arrFuncList，設定完currBmkGisParm再執行 @20160324 Andy
            }
        }
        initBmk(); // 2015/11/25 修改

        //資訊區連動事件
        tabsCaseUrlTmp = ''; // 2015/09/07 修改 : 資訊綜覽地區性，參數初始化
        $('#tabsCase').empty().append("<div style='width:32px; height:32px; position:absolute; top:50%; left:50%; margin-left:-16px; margin-top:-16px; border:none;'><img src='images/loading.gif' /></div>");
        switch (obj.InfoType) {
            case "CAP"://讀對應CAP之description, 於縣市鄉鎮選單change事件中執行
                $('#tabsCase').text("資料讀取中...");
                //2016/06/13 修正資訊綜覽(CAP類)為資料讀取中問題 Kevin
                var descContent = '';
                var descArr = [];
                //arrCaseCapData.forEach(function (element, index, array) {
                //    if (element.AltId == obj.AltType) {
                //        descArr.push(element.description);
                //        //descContent = descContent + element.description+"<br/>";
                //        //$('#tabsCase').text(element.description);
                //    } else {
                //        $('#tabsCase').text("尚無資料");
                //    }
                //});

                console.log(descArr);
                var outputArray = [];

                for (var i = 0; i < descArr.length; i++) {

                    if ((jQuery.inArray(descArr[i], outputArray)) == -1) {

                        outputArray.push(descArr[i]);

                    }

                }
                console.log(outputArray);
                for (var i = 0; i < outputArray.length; i++) {
                    descContent = descContent + outputArray[i] + "<br/>";
                }
                if (descContent == '') { $('#tabsCase').text("尚無資料"); }
                else {
                    $('#tabsCase').html(descContent);
                }
                break;
            case "MAN"://讀取自訂內文(InfoContent)
                if (obj.InfoContent == null || obj.InfoContent=="") {
                    $('#tabsCase').text("尚無資料");
                } else {
                    $('#tabsCase').html(obj.InfoContent);
                }
                break;
            case "TXT"://讀文字檔來源
                // 2015/09/07 修改 : 資訊綜覽地區性
                tabsCaseUrlTmp = obj.InfoUrl;
//Su 0927	Start
                //if (obj.InfoUrl != tabsCaseAreaInfoUrl) {
                //$.ajax({
                //    url: "GetData/Portal/getModuleInfo.ashx",
                //    type: 'POST',
                //    data: {
                //        path: obj.InfoUrl
                //    },
                //    dataType: "text",
                //    success: function (data) {
                //        $('#tabsCase').empty().append(data);
                //    },
                //    error: function () { $('#tabsCase').text("尚無資料"); }
                //});
                //} else 
//Su 0927 end
                    oCom.setTabsCaseAreaInfo(obj.InfoUrl);


                break;
            case "RSS"://讀RSS來源
                break;
        }
        //右側表單等開啟或地址定位顯示與否設定
        if (info == "N") {
            closeTabs("#tabInfo", "#tabsCase", "#closeTabsCase", "#openTabsCase");
            //$("#tabsCase").css("width", "0%");
        } else {
            openTabs("#tabInfo", "#tabsCase", "#closeTabsCase", "#openTabsCase");
        }
        if (mapControl == "N") {
            closeTabs("#mapInfo", "#divOpenFunc", "#closeMapInfo", "#openMapInfo");
        } else {
            openTabs("#mapInfo", "#divOpenFunc", "#closeMapInfo", "#openMapInfo");
        }
        if (addressLocate == "N") {
            $("#divAddressSearch").hide();
        }
        $("#btnToggle").show();
        //setTimeout(function () {
        //    if ($(window).height() < $(document).height()) {
        //        $("#tabsCase").css({
        //            "height": "200px", "overflow-y": "auto"
        //        });
        //    }
        //}, 1000);
        //定位區連動事件
        // 2015/07/13 再修
        //$('#selCounty').val(LBS_COUN_ID).trigger('change');
        function runCountySelectChange() {
            if ($('#selCounty').find('option').length > 1) {
                
                $('#selCounty').val(LBS_COUN_ID);
                setTimeout(CountySelectChange(false, ChartID), 1000); // 2016/01/27 修改：判斷是否要重Load鄉鎮清單、不要讓Chart一直重畫
            }
            else
                setTimeout(function () { runCountySelectChange(); }, 1000);
        }

        //runCountySelectChange();  //等拿到arrFuncList，設定完currBmkGisParm再執行 @20160324 Andy

        //$('#selCounty').val(LBS_COUN_ID);
        //setTimeout(CountySelectChange, 1000);
    }

    // 2015/09/07 修改 : 資訊綜覽地區性
    // 執行
    oCom.setTabsCaseAreaInfo = function (sUrl) {

        var CounVal = '', CounSelNa = '', TownVal = '';
        CounSelNa = $('#selCounty :selected').text();
        CounVal = $('#selCounty').val();
        TownVal = $('#selTownship').val();

        if (SixCity.indexOf(CounSelNa) != -1) CounVal = CounVal.substring(0, 2);
        if (CounVal == '00') CounVal = null;
        if (TownVal == '00') TownVal = null;

        $.ajax({
            url: "GetData/Portal/getModuleInfo.ashx",
            type: 'POST',
            data: {
                path: sUrl,
                CounID: CounVal,
                TownID: TownVal
            },
            dataType: "text",
            success: function (data) {
                $('#tabsCase').empty().append(data);
            },
            error: function () { $('#tabsCase').text("尚無資料"); }
        });        
    }



    //主頁籤寬度與捲軸
    oCom.setMainTabScrollbar = function() {
        $("#MainTabPrev").hide();
        $("#MainTabNext").hide();
        var tabWidth = 120; //頁籤寬度 Kevin 調整寬度
        var tabid = "#tabMenu ul.tabs";

        //頁籤捲軸
        var totCount = $(tabid + " li").length; //總數量
        var showCount = Math.floor(($(tabid).width() - 30) / tabWidth); //可顯示數量
        var idxStart = 0;
        var idxEnd = (showCount - 1);
        if ((totCount * tabWidth) > $(tabid).width()) {
            $("#MainTabNext").show();

            $(tabid + " li:lt(" + (showCount) + ")").show();
            $(tabid + " li:gt(" + (showCount - 1) + ")").hide();
        }
        else {
            $(tabid + " li:lt(" + (showCount) + ")").show(); // 2015/06/29 修改書籤在視窗變換大小時會消失問題
        }

        //bind event
        $("#MainTabNext").unbind("click").bind("click", function () {
            if (idxStart >= 0 && idxEnd < totCount) {
                $("#MainTabPrev").show();
                idxStart += 1;
                idxEnd += 1;
            }
            $(tabid + " li:lt(" + idxStart + ")").hide();
            $(tabid + " li:eq(" + idxEnd + ")").show();
            $(tabid + " li:gt(" + idxEnd + ")").hide();

            if (idxEnd == (totCount - 1)) {
                $("#MainTabNext").hide();
            }
        });
        $("#MainTabPrev").unbind("click").bind("click", function () {
            idxStart -= 1;
            idxEnd -= 1;
            $(tabid + " li:gt(" + idxEnd + ")").hide();
            $(tabid + " li:eq(" + idxStart + ")").show();
            $(tabid + " li:lt(" + idxStart + ")").hide();

            if (idxStart == 0) {
                $("#MainTabPrev").hide();
            }
            if (idxEnd < (totCount - 1)) {
                $("#MainTabNext").show();
            }

        });
    }

    //子頁籤寬度與捲軸
    oCom.setSubTabScrollbar = function (tabid) {
        $("#SubTabPrev").hide();
        $("#SubTabNext").hide();
        var subTabWidth = 120; //子頁籤寬度

        //子頁籤捲軸
        var totCount = $(tabid + " a").length; //總數量
        var showCount = Math.floor(($(tabid).width() - 30) / subTabWidth); //可顯示數量
        var idxStart = 0;
        var idxEnd = (showCount - 1);
        if ((totCount * subTabWidth) > $("#tabMenu").width()) {
            $("#SubTabNext").show();
            $(tabid + " a:lt(" + (showCount) + ")").show();
            $(tabid + " a:gt(" + (showCount - 1) + ")").hide();
        }
        else {
            $(tabid + " a:lt(" + (showCount) + ")").show(); // 2015/06/29 修改書籤在視窗變換大小時會消失問題
        }

        //bind event
        $("#SubTabNext").unbind("click").bind("click", function () {
            if (idxStart >= 0 && idxEnd < totCount) {
                $("#SubTabPrev").show();
                idxStart += 1;
                idxEnd += 1;
            }
            $(tabid + " a:lt(" + idxStart + ")").hide();
            $(tabid + " a:eq(" + idxEnd + ")").show();
            $(tabid + " a:gt(" + idxEnd + ")").hide();

            if (idxEnd == (totCount - 1)) {
                $("#SubTabNext").hide();
            }
        });
        $("#SubTabPrev").unbind("click").bind("click", function () {
            idxStart -= 1;
            idxEnd -= 1;
            $(tabid + " a:gt(" + idxEnd + ")").hide();
            $(tabid + " a:eq(" + idxStart + ")").show();
            $(tabid + " a:lt(" + idxStart + ")").hide();

            if (idxStart == 0) {
                $("#SubTabPrev").hide();
            }
            if (idxEnd < (totCount - 1)) {
                $("#SubTabNext").show();
            }

        });
    }
}

//統計圖
function ModuleChart() {
    var oCom = this;
    oCom.SetId;
    oCom.BlockId = "R2"; //圖表區元素ID
    oCom.Index;
    oCom.arrSrcData = []; //來源資料集
    oCom.ChartMoreData = []; //Chart資料集
    var isInit = "Y";

    oCom.loadSrcData = function (LBS, PageCode, PageIndex) {
        var url = "GetData/Portal/getModuleChart.ashx";
        var data = {};
        data.SetId = oCom.SetId;
        data.LBS = (typeof LBS == "undefined") ? "" : encodeURI(LBS_COUN_NA);//沒有傳入LBS就是取全臺範圍
        //data.PageTile = (typeof pageTitle == "undefined") ? "" : encodeURI(pageTitle);//沒有傳入頁籤，預設就是第一個頁籤
        data.PageCode = (typeof PageCode == "undefined") ? "" : encodeURI(PageCode);//沒有傳入頁籤，預設就是第一個頁籤
        $.ajax({
            url: url,
            type: 'get',
            data: data,
            dataType: "json",
            cache: false,   //不允許快取   
            beforeSend: function () {
                //$('#ChartTab_12 div:first').empty().append("<img src='images/loading_Large.gif' />")
                $("#" + oCom.BlockId).find('div:not(:first):visible').empty().append("<div style='width:32px; height:32px; position:absolute; top:50%; left:50%; margin-left:-16px; margin-top:-16px;'><img src='images/loading.gif' /></div>");
            },
            success: function (result) {
                oCom.arrSrcData = result;
               
                if (isInit == "Y") {
                    //initBlock(oCom.arrSrcData);
                    //initBlock(oCom.arrSrcData, PageIndex);
                    initBlock(oCom.arrSrcData, PageCode, PageIndex); // 2015/10/01 增修地震統計圖
                }
                else {
                    //refreshBlock(oCom.arrSrcData);
                    //refreshBlock(oCom.arrSrcData, PageIndex);
                    refreshBlock(oCom.arrSrcData, PageCode, PageIndex);  // 2015/10/01 增修地震統計圖
                }
            },
            error: function () {
            }
        });
    }

    //介面初始化
    //function initBlock(arrSrcData) {
    //function initBlock(arrSrcData, PageIndex) {
    function initBlock(arrSrcData, PageCode, PageIndex) { // 2015/10/01 增修地震統計圖
        $("#" + oCom.BlockId).empty();
        $("#" + oCom.BlockId).append("<ul id='ul_Chart' class='tabs'></ul>");

        //#region 參數設定
        var ChartW = $("#" + oCom.BlockId).width();
        var ChartH = $("#" + oCom.BlockId).height();
        var liH = "33%"; //預設3個頁籤
        var sizeF = 16; //抬頭字體大小

        if (arrSrcData.length == 1) {
            liH = "99.5%";
        } else if (arrSrcData.length == 2) {
            liH = "49.5%";
        } else if (arrSrcData.length == 3) {
            liH = "33%"; sizeF = 14;
        } else {
            liH = "24.6%"; sizeF = 12;
        }
        //#endregion

        //#region 創建頁籤
        for (var i = 0; i < arrSrcData.length; i++) {
            //$("#ul_Chart").append("<li style='width:" + liH + ";'><a href='#ChartTab_" + arrSrcData[i].DataId + "' style='font-size: " + sizeF + "px;' title='" + arrSrcData[i].DataTitle + "' onclick=\"ChangeChartTab(LBS_COUN_NA,this.title,'"+i.toString()+"');\">" + arrSrcData[i].DataTitle + "</a></li>"); //加頁籤標頭
            $("#ul_Chart").append("<li style='width:" + liH + ";'><a href='#ChartTab_" + arrSrcData[i].DataId + "' style='font-size: " + sizeF + "px;' title='" + arrSrcData[i].DataTitle + "' onclick=\"ChangeChartTab(LBS_COUN_NA,'" + arrSrcData[i].DataType + "','" + i.toString() + "');\">" + arrSrcData[i].DataTitle + "</a></li>"); //改加頁籤代號 // 2015/10/01 增修地震統計圖
            $("#" + oCom.BlockId).append("<div id='ChartTab_" + arrSrcData[i].DataId + "' style='width:" + (ChartW - 6) + "px; height:" + (ChartH - 35) + "px;'></div>");
            
            if (arrSrcData[i].ChartData.length != 0) {
                var data = google.visualization.arrayToDataTable(arrSrcData[i].ChartData);

                if (arrSrcData[i].ChartType == "pie") { //圓餅圖
                    var chart = new google.visualization.PieChart(document.getElementById("ChartTab_" + arrSrcData[i].DataId));
                    var pieColor = getPieChartColor(arrSrcData[i].DataType);
                    var options = {
                        colors: pieColor,
                        chartArea: { left: 10, top: 10, width: "90%", height: "90%" },
                        is3D: true,
                        backgroundColor: "transparent",
                        legend: 'none' // 2015/10/01 增修地震統計圖
                    };
                    chart.draw(data, options);
                }
                if (arrSrcData[i].ChartType == "column") { //直方圖
                    var dataDefShow = google.visualization.arrayToDataTable(arrSrcData[i].ChartDataDef); //預設顯示五筆
                    var chart = new google.visualization.ColumnChart(document.getElementById("ChartTab_" + arrSrcData[i].DataId));
                    var options = {
                        height: 170,
                        chartArea: { left: 40, top: 20, width: "83%", height: "60%" },
                        legend: { position: 'bottom', textStyle: { fontSize: 6 } },
                        vAxis: { viewWindow: { min: 0 } }, //y軸從0開始
                        hAxis: { textStyle: { fontSize: 8 } }
                    };
                    chart.draw(dataDefShow, options);

                    // 2015/10/08 修改：針對地震部分，點選直方圖可以區域定位
                    if (arrSrcData[i].DataType == 'RT_EQColumn') {
                        google.visualization.events.addListener(chart, 'select', testChartTab);

                        function testChartTab() {
                            var selection = chart.getSelection();
                            var item = selection[0];
                            if ($('#selCounty').val() == '00') {
                                var chartText = dataDefShow.getValue(item.row, 0);
                                $("#selCounty option").filter(function () {
                                    return this.text == chartText;
                                }).attr('selected', true).trigger('change');
                            } else if ($('#selCounty').val() != '00') {
                                var chartText = dataDefShow.getValue(item.row, 0);
                                $("#selTownship option").filter(function () {
                                    return this.text == chartText;
                                }).attr('selected', true).trigger('change');
                            }

                        }
                    }
                }
                oCom.ChartMoreData[i] = data; //將資料傳至全域供"更多"按鈕使用            

                //時間與更多
                var html = "";
                html += "<span style=\"position:absolute;left:3px;bottom:5px;font-size:10px;\">時間:" + arrSrcData[i].RstDate.replace("T", " ") + "</span>";
                html += "<img id=\"ChartMore_" + arrSrcData[i].DataId + "\" src=\"images/Portal/ShowMore.png\" title=\"更多\" style=\"position:absolute;cursor: pointer;right:0px;bottom:0px; background-color:#fff;\" />";
                $("#ChartTab_" + arrSrcData[i].DataId).append(html);
                $("#ChartMore_" + arrSrcData[i].DataId).unbind('click').bind("click",
                    {
                        index: i,
                        type: arrSrcData[i].ChartType,
                        DataTitle: arrSrcData[i].DataTitle,
                        DataType: arrSrcData[i].DataType,
                        RstDate: arrSrcData[i].RstDate
                    },
                    function (e) { ShowChartMore(e.data.index, e.data.type, e.data.DataTitle, e.data.DataType, e.data.RstDate); });
            }
            else {
                // 2015/10/01 增修地震統計圖
                if (arrSrcData[i].DataType == PageCode)
                    $("#ChartTab_" + arrSrcData[i].DataId).append('該地區未發生地震');
            else
                $("#ChartTab_" + arrSrcData[i].DataId).append(html);

                //$("#ChartTab_" + arrSrcData[i].DataId).append(html);
            }                
        }
        //#endregion

        $("#" + oCom.BlockId).tabs();
        $("#" + oCom.BlockId).tabs('refresh');
        //$("#" + oCom.BlockId).tabs({ active: 0 });
        $("#" + oCom.BlockId).tabs({ active: Number(PageIndex) });
        isInit = "N";
    }

    //function refreshBlock(arrSrcData, PageIndex) {
    function refreshBlock(arrSrcData, PageCode, PageIndex) { // 2015/10/01 增修地震統計圖
        
        //#region 移除原有的tabs
        //$("#" + oCom.BlockId).tabs("remove", 2); //Old API...Changed in 1.9

        $("#" + oCom.BlockId)
            .find(".ui-tabs-nav li").remove()// Remove the tab
            .each(function () {
                var panelId = $(this).attr("aria-controls");// Find the id of the associated panel                
                $("#" + panelId).remove();// Remove the panel
            });
        $("#" + oCom.BlockId).tabs("refresh");// Refresh the tabs widget
        //#endregion
        
        //#region 參數設定
        var ChartW = $("#" + oCom.BlockId).width();
        var ChartH = $("#" + oCom.BlockId).height();
        var liH = "33%"; //預設3個頁籤
        var sizeF = 16; //抬頭字體大小

        if (arrSrcData.length == 1) {
            liH = "99.5%";
        } else if (arrSrcData.length == 2) {
            liH = "49.5%";
        } else if (arrSrcData.length == 3) {
            liH = "33%"; sizeF = 14;
        } else {
            liH = "24.6%"; sizeF = 12;
        }
        //#endregion

        //#region 加入新的tabs
        //創建頁籤
        try {
            for (var i = 0; i < arrSrcData.length; i++) {
                //$("#ul_Chart").append("<li style='width:" + liH + ";'><a href='#ChartTab_" + arrSrcData[i].DataId + "' style='font-size: " + sizeF + "px;' title='" + arrSrcData[i].DataTitle + "' onclick=\"ChangeChartTab(LBS_COUN_NA,this.title,'" + i.toString() + "');\">" + arrSrcData[i].DataTitle + "</a></li>"); //加頁籤標頭
                $("#ul_Chart").append("<li style='width:" + liH + ";'><a href='#ChartTab_" + arrSrcData[i].DataId + "' style='font-size: " + sizeF + "px;' title='" + arrSrcData[i].DataTitle + "' onclick=\"ChangeChartTab(LBS_COUN_NA,'" + arrSrcData[i].DataType + "','" + i.toString() + "');\">" + arrSrcData[i].DataTitle + "</a></li>"); //改加頁籤代號 // 2015/10/01 增修地震統計圖
                $("#" + oCom.BlockId).append("<div id='ChartTab_" + arrSrcData[i].DataId + "' style='width:" + (ChartW - 6) + "px; height:" + (ChartH - 35) + "px;'></div>");//2016/08/08 Kevin

                if (arrSrcData[i].ChartData.length != 0) {
                    var data = google.visualization.arrayToDataTable(arrSrcData[i].ChartData);

                    if (arrSrcData[i].ChartType == "pie") { //圓餅圖
                        var chart = new google.visualization.PieChart(document.getElementById("ChartTab_" + arrSrcData[i].DataId));
                        var pieColor = getPieChartColor(arrSrcData[i].DataType);
                        var options = {
                            colors: pieColor,
                            chartArea: { left: 10, top: 10, width: "90%", height: "90%" },
                            is3D: true,
                            backgroundColor: "transparent",
                            legend: 'none' // 2015/10/01 增修地震統計圖
                        };
                        chart.draw(data, options);
                    }
                    if (arrSrcData[i].ChartType == "column") { //直方圖
                        var dataDefShow = google.visualization.arrayToDataTable(arrSrcData[i].ChartDataDef); //預設顯示五筆
                        var chart = new google.visualization.ColumnChart(document.getElementById("ChartTab_" + arrSrcData[i].DataId));
                        var options = {
                            height: 170,
                            chartArea: { left: 40, top: 20, width: "83%", height: "60%" },
                            legend: { position: 'bottom', textStyle: { fontSize: 6 } },
                            vAxis: { viewWindow: { min: 0 } }, //y軸從0開始
                            hAxis: { textStyle: { fontSize: 8 } }
                        };
                        chart.draw(dataDefShow, options);

                        // 2015/10/08 修改：針對地震部分，點選直方圖可以區域定位
                        if (arrSrcData[i].DataType == 'RT_EQColumn') {
                            google.visualization.events.addListener(chart, 'select', testChartTab); 

                            function testChartTab() {
                                var selection = chart.getSelection();
                                var item = selection[0];
                                if ($('#selCounty').val() == '00') {
                                    var chartText = dataDefShow.getValue(item.row, 0);
                                    $("#selCounty option").filter(function () {
                                        return this.text == chartText;
                                    }).attr('selected', true).trigger('change');
                                } else if ($('#selCounty').val() != '00') {
                                    var chartText = dataDefShow.getValue(item.row, 0);
                                    $("#selTownship option").filter(function () {
                                        return this.text == chartText;
                                    }).attr('selected', true).trigger('change');
                                }

                            }
                        }
                    }
                    oCom.ChartMoreData[i] = data; //將資料傳至全域供"更多"按鈕使用            

                    //時間與更多
                    var html = "";
                    html += "<span style=\"position:absolute;left:3px;bottom:5px;font-size:10px;\">時間:" + arrSrcData[i].RstDate.replace("T", " ") + "</span>";
                    html += "<img id=\"ChartMore_" + arrSrcData[i].DataId + "\" src=\"images/Portal/ShowMore.png\" title=\"更多\" style=\"position:absolute;cursor: pointer;right:0px;bottom:0px; background-color:#fff;\" />";
                    $("#ChartTab_" + arrSrcData[i].DataId).append(html);
                    $("#ChartMore_" + arrSrcData[i].DataId).unbind('click').bind("click",
                        {
                            index: i,
                            type: arrSrcData[i].ChartType,
                            DataTitle: arrSrcData[i].DataTitle,
                            DataType: arrSrcData[i].DataType,
                            RstDate: arrSrcData[i].RstDate
                        },
                        function (e) { ShowChartMore(e.data.index, e.data.type, e.data.DataTitle, e.data.DataType, e.data.RstDate); });
                }
                else {
                    // 2015/10/01 增修地震統計圖
                    if (arrSrcData[i].DataType == PageCode)
                        $("#ChartTab_" + arrSrcData[i].DataId).append('該地區未發生地震');
                else
                    $("#ChartTab_" + arrSrcData[i].DataId).append(html);

                    // $("#ChartTab_" + arrSrcData[i].DataId).append(html);
                }
            }
        } catch (ex) { oCom.loadSrcData(); }

        //$("#" + oCom.BlockId).tabs("refresh").tabs({ active: 0 });// Refresh the tabs widget        
        $("#" + oCom.BlockId).tabs("refresh").tabs({ active: Number(PageIndex) });// Refresh the tabs widget        
        //#endregion
    }

    //Chart顯示更多
    function ShowChartMore(index, type, DataTitle, DataType, RstDate) {

        //setCounterFunc("65", oCom.arrSrcData[index].DataId, "Q", "PTL"); //功能操作記錄

        easyDialog.open({
            container: 'divChartMore',
            fixed: true,
            overlay: true
        });

        //讓視窗可移動
        $("#divChartMore").draggable();
        $("#divChartMore").empty();

        var ChartW = $("#divChartMore").width();
        var ChartH = $("#divChartMore").height();

        $("#divChartMore").append('<img src="images/Portal/close.png" alt="關閉" style="top:3px;right:3px; cursor: pointer;position:absolute;" onclick="easyDialog.close();$(\'#divChertMore\').hide()">');
        $("#divChartMore").append("<div style='top:5px; left:10px;color:#fff;position:absolute;font-size:12pt;'>" + DataTitle + "</div>");
        //$("#divChartMore").append("<div id='ChartMoreShow' style='width:" + ChartW + "px; height:" + (ChartH - 60) + "px;top:30px;'></div>");
        $("#divChartMore").append("<div id='ChartMoreShow' style='width:" + ChartW + "px; height:" + (ChartH - 60) + "px;top:30px;position:absolute;'></div>");

        $("#divChartMore").css("background-color", "#046EB8");

        if (type == "pie") { //圓餅圖
            var chart = new google.visualization.PieChart(document.getElementById("ChartMoreShow"));
            var pieColor = getPieChartColor(DataType);
            var options = {
                colors: pieColor,
                chartArea: { left: 60, top: 30, width: "90%", height: "90%" },
                is3D: true
            };
        } else {
            var chart = new google.visualization.ColumnChart(document.getElementById("ChartMoreShow"));
            var options = {
                legend: { position: 'bottom', textStyle: { fontSize: 6 } },
                chartArea: { left: 60, top: 30, width: "90%", height: "80%" }
            };
        }
        chart.draw(oCom.ChartMoreData[index], options);

        RstDate = RstDate.replace("T", " ");
        var dataArea = (oCom.arrSrcData[index].DataArea == "") ? "全台" : oCom.arrSrcData[index].DataArea;

        // 2015/10/15 修改
        //$("#divChartMore").append("<div style='bottom:5px; right:10px;color:#fff;position:absolute;font-size:12pt;'>資訊所在位置：" + dataArea + "　　最新發布時間：" + RstDate + "</div>");
        if (DataTitle == '地震區域統計' && $('#selCounty').val() != '00')
            $("#divChartMore").append("<div style='bottom:5px; right:10px;color:#fff;position:absolute;font-size:12pt;'><span style='margin-right:35px'>單位 : 鄉鎮數</span>資訊所在位置：" + dataArea + "　　最新發布時間：" + RstDate + "</div>");
        else
        $("#divChartMore").append("<div style='bottom:5px; right:10px;color:#fff;position:absolute;font-size:12pt;'>資訊所在位置：" + dataArea + "　　最新發布時間：" + RstDate + "</div>");
    }

    //取出圓餅圖色碼
    function getPieChartColor(chartType) {
        var pieColor = ['#97C479'];

        if (chartType == "RT_RainPie") { //雨量圓餅圖
            pieColor = ['#68CCEE', '#EDC240', '#F66DFB', '#CB4B4B', '#97C479'];
        }
        if (chartType == "RT_WraRiver") { //河川圓餅圖
            pieColor = ['#FF8D9D', '#C0A0FF', '#EDC240', '#97C479'];
        }
        if (chartType == "RT_WraReservoir") {//水庫圓餅圖
            pieColor = ['#FF8D9D', '#C0A0FF', '#97C479'];
        }
        if (chartType == "RT_EQPie") { //地震圓餅圖 // 2015/10/01 增修地震統計圖
            pieColor = ['#BEDFEA', '#98D2E6', '#80CBE5', '#6CC3E1', '#5ABFE1', '#46B8DF', '#21ABDA'];
        }

        return pieColor;
    }

}

function ChangeChartTab(LBS, PageCode, PageIndex) {
    oModChart.loadSrcData(LBS, PageCode, PageIndex);
}

//防災速報
function NcdrEQ() {
    var oCom = this;

    //判斷防災速報是否顯示
    oCom.getNCDREQTime = function () {
        var url = "GetData/Portal/getNCDREQTime.ashx";
        var Event = encodeURIComponent(NCDREQ.Event); 

        $.ajax({
            url: url,
            type: 'get',
            data: {
                "Event": Event
            },
            dataType: "json",
            cache: false,   //不允許快取   
            success: function (data) {
                if (data.IsShowIcon == "Y") {
                    $("#btnNCDREQ").css("display", "inline-block");
                    $("#btnNCDREQ").html('<img src="images/Toolbar/NCDR_EQ_Exc.gif" style="width:15px;height:15px;"/> ' + NCDREQ.TitleName);
                    $("#divNCDREQTitle").html(NCDREQ.TitleName);
                    $('#NCDREQClose').click(function () {
                        easyDialog.close();
                        $('#divNCDREQ').hide();
                    });
                } else {
                    $("#btnNCDREQ").css("display", "none");
                    $("#btnNCDREQ").html("");
                    $("#divNCDREQTitle").html("");
                }

                if (data.IsShowPage == "Y") {
                    initNCDREQ();
                }
            },
            error: function () {
            }
        });
    }

    //防災速報視窗
    oCom.showNCDREQ = function () {
        //setCounterFunc("71", "", "Q", "PTL"); //功能操作記錄

        easyDialog.open({
            container: 'divNCDREQ',
            fixed: true,
            overlay: true
        });
    }

    //Su-計算圖片大小-Start

    function imgLoad(url, callback) {
        var img = new Image();
        img.src = url;
        if (img.complete) {
            callback(img.width, img.height);
        } else {
            img.onload = function () {
                if (img.width > 1024) {
                    var x = 1024;
                    var y = img.height * 1024 / img.width;
                    if (y > 768) {
                        y = 768;
                        x = img.width * 768 / img.height;
                    }
                }
                callback(x, y);
                img.onload = null;
            };
        };
    };
    //Su-計算圖片大小-END

    //組視窗資料
    function initNCDREQ() {
        $("#divEqItme").empty();
        $("#divEqItme").append('<ul><li id="liNCDREQ1" class="btnNCDREQon">' + NCDREQ.P1.Name + '</li>');
        $("#divEqItme").append('<li id="liNCDREQ2" class="btnNCDREQ">' + NCDREQ.P2.Name + '</li>');
        $("#divEqItme").append('<li id="liNCDREQ3" class="btnNCDREQ" style="display:none">' + NCDREQ.P3.Name + '</li>');
        $("#divEqItme").append('<li id="liNCDREQ4" class="btnNCDREQ" style="display:none">' + NCDREQ.P4.Name + '</li>');
        $("#divEqItme").append('<li id="liNCDREQ5" class="btnNCDREQ" style="display:none">' + NCDREQ.P5.Name + '</li>');
        //$("#divEqItme").append('<li id="liNCDREQ6" class="btnNCDREQ" style="display:none">' + NCDREQ.P6.Name + '</li></ul>');
        $("#divEqItme").append('<li id="liNCDREQ6" class="btnNCDREQ" style="display:none">' + NCDREQ.P6.Name + '</li>'); // 2016/1/19 修改防災速報
        $("#divEqItme").append('<li id="liNCDREQ7" class="btnNCDREQ" style="display:none">' + NCDREQ.P7.Name + '</li></ul>'); // 2016/1/19 修改防災速報
        $("#divEqItme li").bind("click", function () {
            var id = this.id.replace("liNCDREQ", "");
            changeNCDREQ(id);
        })

        $("#divEqPict").empty();
        //$("#divEqPict").append('<img id="imgNCDREQ" src="' + NCDREQ.P1.Url + '" style="width:100%;" />');
        //Su-加入彈跳視窗超連結-Start
        imgLoad(NCDREQ.P1.Url, function (x, y) {
            $("#divEqPict").append('<a id="hrefNCDREQ" href="#" onClick="MyWindow=window.open(\'' + NCDREQ.P1.Url + '\', \'' + NCDREQ.P1.Name + '\', \'height=' + y + ',width=' + x + ',left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no\');">點圖放大</br><img id="imgNCDREQ" src="' + NCDREQ.P1.Url + '" style="width:100%;" /></a>');
        });
        //Su-加入彈跳視窗超連結-End
        $("#divEqPict").append('<img src="' + NCDREQ.P2.Url + '" onload="liNCDREQ2.style.display=\'\'" style="display:none;width:100%;" />'); //圖片存在才顯示右方文字
        $("#divEqPict").append('<img src="' + NCDREQ.P3.Url + '" onload="liNCDREQ3.style.display=\'\'" style="display:none;width:100%;" />'); //圖片存在才顯示右方文字
        $("#divEqPict").append('<img src="' + NCDREQ.P4.Url + '" onload="liNCDREQ4.style.display=\'\'" style="display:none;width:100%;" />'); //圖片存在才顯示右方文字
        $("#divEqPict").append('<img src="' + NCDREQ.P5.Url + '" onload="liNCDREQ5.style.display=\'\'" style="display:none;width:100%;" />'); //圖片存在才顯示右方文字
        $("#divEqPict").append('<img src="' + NCDREQ.P6.Url + '" onload="liNCDREQ6.style.display=\'\'" style="display:none;width:100%;" />'); //圖片存在才顯示右方文字  
        $("#divEqPict").append('<img src="' + NCDREQ.P7.Url + '" onload="liNCDREQ7.style.display=\'\'" style="display:none;width:100%;" />'); //圖片存在才顯示右方文字 // 2016/1/19 修改防災速報

        oCom.showNCDREQ(); //預設開啟
    }

    //防災速報內容切換
    function changeNCDREQ(N) {
        //setCounterFunc("72", N, "Q", "PTL"); //功能操作記錄

        $("#liNCDREQ1").attr("class", "btnNCDREQ");
        $("#liNCDREQ2").attr("class", "btnNCDREQ");
        $("#liNCDREQ3").attr("class", "btnNCDREQ");
        $("#liNCDREQ4").attr("class", "btnNCDREQ");
        $("#liNCDREQ5").attr("class", "btnNCDREQ");
        $("#liNCDREQ6").attr("class", "btnNCDREQ");
        $("#liNCDREQ7").attr("class", "btnNCDREQ"); // 2016/1/19 修改防災速報

        /*
        if (N == 1) {
            $("#imgNCDREQ").attr("src", NCDREQ.P1.Url);
            $("#liNCDREQ1").attr("class", "btnNCDREQon");
        } else if (N == 2) {
            $("#imgNCDREQ").attr("src", NCDREQ.P2.Url);
            $("#liNCDREQ2").attr("class", "btnNCDREQon");
        } else if (N == 3) {
            $("#imgNCDREQ").attr("src", NCDREQ.P3.Url);
            $("#liNCDREQ3").attr("class", "btnNCDREQon");
        } else if (N == 4) {
            $("#imgNCDREQ").attr("src", NCDREQ.P4.Url);
            $("#liNCDREQ4").attr("class", "btnNCDREQon");
        } else if (N == 5) {
            $("#imgNCDREQ").attr("src", NCDREQ.P5.Url);
            $("#liNCDREQ5").attr("class", "btnNCDREQon");
        } else if (N == 6) {
            $("#imgNCDREQ").attr("src", NCDREQ.P6.Url);
            $("#liNCDREQ6").attr("class", "btnNCDREQon");
        }
        */
        //Su-加入彈跳視窗超連結-Start
        if (N == 1) {
            $("#imgNCDREQ").attr("src", NCDREQ.P1.Url);
            imgLoad(NCDREQ.P1.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P1.Url + "', '" + NCDREQ.P1.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            });
            $("#liNCDREQ1").attr("class", "btnNCDREQon");
        } else if (N == 2) {
            $("#imgNCDREQ").attr("src", NCDREQ.P2.Url);
            imgLoad(NCDREQ.P2.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P2.Url + "', '" + NCDREQ.P2.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            }); $("#liNCDREQ2").attr("class", "btnNCDREQon");
        } else if (N == 3) {
            $("#imgNCDREQ").attr("src", NCDREQ.P3.Url);
            imgLoad(NCDREQ.P3.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P3.Url + "', '" + NCDREQ.P3.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            }); $("#liNCDREQ3").attr("class", "btnNCDREQon");
        } else if (N == 4) {
            $("#imgNCDREQ").attr("src", NCDREQ.P4.Url);
            imgLoad(NCDREQ.P4.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P4.Url + "', '" + NCDREQ.P4.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            }); $("#liNCDREQ4").attr("class", "btnNCDREQon");
        } else if (N == 5) {
            $("#imgNCDREQ").attr("src", NCDREQ.P5.Url);
            imgLoad(NCDREQ.P5.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P5.Url + "', '" + NCDREQ.P5.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            }); $("#liNCDREQ5").attr("class", "btnNCDREQon");
        } else if (N == 6) {
            $("#imgNCDREQ").attr("src", NCDREQ.P6.Url);
            imgLoad(NCDREQ.P6.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P6.Url + "', '" + NCDREQ.P6.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            }); $("#liNCDREQ6").attr("class", "btnNCDREQon");
        } else if (N == 7) { // 2016/1/19 修改防災速報
            $("#imgNCDREQ").attr("src", NCDREQ.P7.Url);
            imgLoad(NCDREQ.P7.Url, function (x, y) {
                $("#hrefNCDREQ").attr("onClick", "MyWindow=window.open('" + NCDREQ.P7.Url + "', '" + NCDREQ.P7.Name + "', 'height=" + y + ",width=" + x + ",left=10,top=10,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');");
            }); $("#liNCDREQ7").attr("class", "btnNCDREQon");
        }

        //Su-加入彈跳視窗超連結-END
    }
}

//跑馬燈
function ModuleMarguee() {
    var oCom = this;
    oCom.arrSrcData = []; //來源資料集
    oCom.Count = 0;

    oCom.loadSrcData = function () {
        var url = "GetData/Portal/getModuleMarquee.ashx";
        $.ajax({
            url: url,
            type: 'get',
            data: {
                "PasHour": PasHour //2015/03/10 加上「水保局土石流警戒」RSS解除警報的「過期」時數
            },
            dataType: "json",
            cache: false,   //不允許快取   
            success: function (data) {
                oCom.arrSrcData = data;
                initBlock(oCom.arrSrcData);
            },
            error: function () {
            }
        });
    }    

    //介面初始化
    function initBlock(arrSrcData) {

        /*
        //#region 載入書籤圖層資料至arrFuncList
        var funcs = ""
        oCom.arrSrcData.forEach(function (element, index, array) {
            if (element.GISLink != "" && element.GISLink != null) {
                var gislink = oBookmark.convertGISParm(element.GISLink);
                funcs += "," + gislink.Func + "," + gislink.QFunc;
            }
        });
        funcs = funcs.substring(1);
        loadFuncListDataByIDs(funcs);
        //#endregion        
        */

        $("#divMarguee").empty();

        //db現有資料,才有定位坐標
        for (var i = 0; i < arrSrcData.length; i++) {
            var html = "";
            //html += '<div>';
            // 2015/03/10 修改：跑馬燈水平輪播
            html += '<div id="MarD' + i.toString() + '" onmouseenter="MarRun(this);" onmouseleave="ClsMarRun(this);">';

            //定位圖示
            if (arrSrcData[i].TM_X > 0 && arrSrcData[i].TM_Y > 0) {
                // 2015/07/16 臨時修改：跑馬燈的定位icon不要被水平輪播的訊息遮住
                //html += '<img class="MargueeLoc" title="定位" src="images/other/Loc.png" px="' + arrSrcData[i].TM_X + '" py="' + arrSrcData[i].TM_Y + '" style="vertical-align:middle" />';
                // 2015/10/21 修改跑馬燈位置
                html += '<img class="MargueeLoc" title="定位" src="images/other/Loc.png" px="' + arrSrcData[i].TM_X + '" py="' + arrSrcData[i].TM_Y + '" style="vertical-align:middle;position:absolute;z-index:100;padding-top:3px;" />';
            }

            var style = "";
            // 2015/03/10 修改：加入頁籤判斷
            //if (arrSrcData[i].BookId == "" || arrSrcData[i].BookId == null) {
            if ((arrSrcData[i].BookId == "" || arrSrcData[i].BookId == null ) && arrSrcData[i].PtlTabId == null) {
                // 2015/07/16 臨時修改：跑馬燈的定位icon不要被水平輪播的訊息遮住
                //style = "style='cursor:default;'";
                if (arrSrcData[i].TM_X > 0 && arrSrcData[i].TM_Y > 0)
                    style = "style='cursor:default;position:absolute;left:27px;z-index:80;'";
                else
                    style = "style='cursor:default;'";

                html += '<a title="' + arrSrcData[i].Caption + '" ' + style + ' SN="' + arrSrcData[i].SN + '" >' + arrSrcData[i].Caption + '</a>';
            } else { //書籤樣式
                // 2015/07/16 臨時修改：跑馬燈的定位icon不要被水平輪播的訊息遮住
                //style = "style='cursor:pointer; text-decoration:underline'";
                if (arrSrcData[i].TM_X > 0 && arrSrcData[i].TM_Y > 0)
                    style = "style='cursor:pointer; text-decoration:underline;position:absolute;left:27px;z-index:80;'";
                else
                    style = "style='cursor:pointer; text-decoration:underline;'";

                html += '<a title="' + arrSrcData[i].Caption + '" ' + style + ' SN="' + arrSrcData[i].SN + '" class="MargueeBmk" Ptl="' + arrSrcData[i].PtlTabId + '" >' + arrSrcData[i].Caption + '</a>';
            }

            html += '</div>'
            $("#divMarguee").append(html);
        }

        //cap資料:去除重複(headline+AreaDesc+sent)
        var distCapData = [];
        //for (var i = 0; i < arrCaseCapData.length; i++) {
        //    if (i == 0) distCapData.push(arrCaseCapData[i]);

        //    var isExist = false;
        //    for (var j = 0; j < distCapData.length; j++) {
        //        if (arrCaseCapData[i].headline == distCapData[j].headline
        //            && arrCaseCapData[i].AreaDesc == distCapData[j].AreaDesc
        //            && arrCaseCapData[i].sent == distCapData[j].sent) {
        //            isExist = true;
        //            break;
        //        }
        //    }

        //    if (!isExist) distCapData.push(arrCaseCapData[i]);
        //}
        for (var i = 0; i < distCapData.length; i++) {
            var html = "";
            //html += '<div>';
            // 2015/03/10 修改：跑馬燈水平輪播
            html += '<div id="MarC' + i.toString() + '" onmouseenter="MarRun(this);" onmouseleave="ClsMarRun(this);">';

            // 2015/03/10 修改：跑馬燈Cap資料的部份優化
            // 定位圖示：from Cap
            if (distCapData[i].TM_X > 0 && distCapData[i].TM_Y > 0) {
                // 2015/07/16 臨時修改
                //html += '<img class="MargueeLoc" title="定位" src="images/other/Loc.png" px="' + distCapData[i].TM_X + '" py="' + distCapData[i].TM_Y + '" style="vertical-align:middle" />';
                // 2015/10/21 修改跑馬燈位置
                html += '<img class="MargueeLoc" title="定位" src="images/other/Loc.png" px="' + distCapData[i].TM_X + '" py="' + distCapData[i].TM_Y + '" style="vertical-align:middle;position:absolute;z-index:100;padding-top:3px;" />';
            }
            //html += '<a title="' + distCapData[i].headline + '" style="cursor:default;">' + distCapData[i].headline + "-" + distCapData[i].AreaDesc + ' (發布時間:' + distCapData[i].sent + ')' + '</a>';
            if (distCapData[i].PtlTabId == null) {
                // 2015/07/16 臨時修改
                //html += '<a title="' + distCapData[i].headline + '" style="default;">';
                if (distCapData[i].TM_X > 0 && distCapData[i].TM_Y > 0)
                    html += '<a title="' + distCapData[i].headline + '" style="default;position:absolute;left:27px;z-index:80;">';
                else
                    html += '<a title="' + distCapData[i].headline + '" style="default;">';

                html += distCapData[i].headline + "-" + distCapData[i].AreaDesc + ' (發布時間:' + distCapData[i].sent + ')' + '</a>';
            } else {
                // 2015/07/16 臨時修改
                //html += '<a title="' + distCapData[i].headline + '" style="cursor:pointer; text-decoration:underline;" class="MargueePtl" Ptl="' + distCapData[i].PtlTabId + '">';
                if (distCapData[i].TM_X > 0 && distCapData[i].TM_Y > 0)
                    html += '<a title="' + distCapData[i].headline + '" style="cursor:pointer; text-decoration:underline; position:absolute;left:27px;z-index:80;" class="MargueePtl" Ptl="' + distCapData[i].PtlTabId + '">';
                else
                    html += '<a title="' + distCapData[i].headline + '" style="cursor:pointer; text-decoration:underline;" class="MargueePtl" Ptl="' + distCapData[i].PtlTabId + '">';

                html += distCapData[i].headline + "-" + distCapData[i].AreaDesc + ' (發布時間:' + distCapData[i].sent + ')' + '</a>';
            }


            html += '</div>'
            $("#divMarguee").append(html);
        }

        $("#divMarguee").show();

        //跑馬燈輪播 (外面div的id名稱、包在裡面的標籤類型、延遲毫秒數、速度、高度)
        if (arrSrcData.length > 1) {
            //changeMarguee('divMarguee', 'div', 5000, 50, 35); //2015/10/21 修改跑馬燈位置
            changeMarguee('divMarguee', 'div', 5000, 50, 25); // 2015/10/21 修改跑馬燈位置
        }

        //bind event
        $("#divMarguee").unbind("click").bind("click", function (e) { ShowMargueeMore(e); });
        $("#divMarguee div img.MargueeLoc").unbind("click").bind("click", function (e) { MapCenter(e); });
        $("#divMarguee div a.MargueeBmk").unbind("click").bind("click", function (e) {
            if ($(this).attr('Ptl') != null)
                CtrlPtl($(this).attr('Ptl')); // 2015/03/10 修改：跑馬燈控制頁籤

            var obj = getArryObj(oCom.arrSrcData, 'SN', $(this).attr('SN'));
            if (obj.GISLink != '') // 2015/03/10 修改：跑馬燈控制頁籤
                oBookmark.OpenBookmark(obj, "portal");
        });

        // 2015/03/10 修改：跑馬燈控制頁籤
        $("#divMarguee div a.MargueePtl").unbind("click").bind("click", function (e) {
            if ($(this).attr('Ptl') != null)
                CtrlPtl($(this).attr('Ptl'));
        });
    }

    // 2015/03/10 修改：跑馬燈控制頁籤
    // 2015/07/30 修改為可以被外界呼叫的方法(因應示警平台)
    //function CtrlPtl(Ptl) {
    oCom.CtrlPtl = function (Ptl) {
        debugger;
        if ($('span[dataid="' + Ptl + '"]').html() != undefined) {
            if ($('span[dataid="' + Ptl + '"]').parent().parent().css('display') == 'none') {
                var PtlParentId = $('span[dataid="' + Ptl + '"]').parent().parent().attr('id').replace('tabs-', '');
                $('a[dataid="' + PtlParentId + '"]').click();
            }

            setTimeout(function () { $('span[dataid="' + Ptl + '"]').click(); }, 1000);
        } else if ($('a[dataid="' + Ptl + '"]').html() != undefined) {
            $('a[dataid="' + Ptl + '"]').click();
        }
    }

    //跑馬燈資料輪播
    function changeMarguee(box, stf, delay, speed, h) {
        clearInterval(timerMoveMsg);
        clearTimeout(timerChangeMsg);

        //取得id
        var slideBox = document.getElementById(box);

        //預設值 delay:幾毫秒滾動一次(1000毫秒=1秒), speed:數字越小越快, h:高度
        var delay = delay || 1000, speed = speed || 20, h = h || 20;
        var pause = false;
        var s = function () { timerMoveMsg = setInterval(slide, speed); }

        //主要動作的地方
        slide = function () {
            //當滑鼠移到上面的時候就會暫停
            if (pause) return;
            //滾動條往下滾動 數字越大會越快但是看起來越不連貫，所以這邊用1
            slideBox.scrollTop += 1;
            //滾動到一個高度(h)的時候就停止
            if (slideBox.scrollTop % h == 0) {
                //跟setInterval搭配使用的
                clearInterval(timerMoveMsg);
                //將剛剛滾動上去的前一項加回到整列的最後一項
                slideBox.appendChild(slideBox.getElementsByTagName(stf)[0]);
                //再重設滾動條到最上面
                slideBox.scrollTop = 0;
                //延遲多久再執行一次
                timerChangeMsg = setTimeout(s, delay);
            }
        }

        //滑鼠移上去會暫停 移走會繼續動
        slideBox.onmouseover = function () { pause = true; }
        slideBox.onmouseout = function () { pause = false; }

        //起始的地方，沒有這個就不會動囉
        timerChangeMsg = setTimeout(s, delay);
    }

    //顯示更多跑馬燈資料
    function ShowMargueeMore(evt) {

        if (evt.target.tagName == "IMG") return;
        if (evt.target.tagName == "A") return;

        //if ($("#divMarguee").height() > 35) { //顯示單行 // 2015/10/21 修改跑馬燈位置
        if ($("#divMarguee").height() > 25) { //顯示單行 // 2015/10/21 修改跑馬燈位置
            $("#divMarguee").animate({
                //height: "35px" // 2015/10/21 修改跑馬燈位置
                height: "25px" // 2015/10/21 修改跑馬燈位置
            }, 300, function () {
                $("#divMarguee").scrollTop(0);
                $("#divMarguee").css("overflowY", "");
                //changeMarguee("divMarguee", "div", 5000, 50, 35); // 2015/10/21 修改跑馬燈位置
                changeMarguee("divMarguee", "div", 5000, 50, 25); // 2015/10/21 修改跑馬燈位置
            });
        } else { //顯示更多
            //setCounterFunc("67", "", "Q", "PTL"); //功能操作記錄

            $("#divMarguee").animate({
                height: "175px"
            }, 300, function () {
                $("#divMarguee").scrollTop(0);
                $("#divMarguee").css("overflowY", "auto");
                clearInterval(timerMoveMsg);
                clearTimeout(timerChangeMsg);
            });
        }
    }

    //定位
    function MapCenter(evt) {
        var X = $(evt.target).attr("px");
        var Y = $(evt.target).attr("py");

        if (X > 0) {
            ZoomToLoc(parseFloat(X), parseFloat(Y), 6);
        }
    }

}

// 2015/03/10 修改：跑馬燈水平輪播(開啟)
var MarRunFun;
function MarRun(obj) {
    var BoxLen = Math.ceil(Number($("#divMarguee div:eq(0)").css('width').replace('px', '')) / 16);
    var strLen = $(obj).find('a').attr('title').trim().length;
    if (strLen >= BoxLen) {
        var ThanOneLen = (strLen < BoxLen) ? BoxLen + strLen : strLen * 2; //第二次開始要兩倍數

        var CtrlNum = 0;
        var leftNum = 0;
        marLeft();
        function marLeft() {
            if (CtrlNum <= strLen) {
                CtrlNum++;
                leftNum = leftNum - 16;

                MarRunFun = setTimeout(function () {
                    $(obj).find('a').css('margin-left', leftNum + 'px');
                    marLeft();
                }, 200);
            } else {
                leftNum = Number($("#divMarguee div:eq(0)").css('width').replace('px', ''));
                strLen = ThanOneLen;
                CtrlNum = 0;
                marLeft();
            }
        }
    }
}

// 2015/03/10 修改：跑馬燈水平輪播(關閉)
function ClsMarRun(obj) {
    clearInterval(MarRunFun);
    $(obj).find('a').css('margin-left', '0px');
}


//友站連結
function ModuleLink() {
    var oCom = this;
    oCom.arrSrcData = []; //來源資料集

    oCom.loadSrcData = function () {
        var url = "GetData/Portal/getModuleLink.ashx";
        $.ajax({
            url: url,
            type: 'get',
            data: {
            },
            dataType: "json",
            cache: false,   //不允許快取   
            success: function (data) {
                oCom.arrSrcData = data;
                initBlock(oCom.arrSrcData);
            },
            error: function () {
            }
        });
    }


    //介面初始化
    function initBlock(arrSrcData) {

        //讓視窗可移動
        $("#divWebLink").draggable();
        $("#divWebLink").empty();

        var WebLinkW = $("#divWebLink").width();
        var WebLinkH = $("#divWebLink").height();

        $("#divWebLink").append('<img src="images/Portal/close.png" alt="關閉" style="top:3px;right:3px; cursor: pointer;position:absolute;" onclick="easyDialog.close();$(\'#divMargueeMore\').hide()">');
        $("#divWebLink").append("<div style='top:5px; left:10px;color:#fff;position:absolute;font-size:12pt;'>相關連結</div>");
        $("#divWebLink").append("<div id='WebLinkMoreShow' style='position:absolute;overflow:auto;background-color:#fff;width:" + WebLinkW + "px; height:" + (WebLinkH - 60) + "px;top:30px;'></div>");

        $("#divWebLink").css("background-color", "#046EB8");
        var html = "";
        html += "<ul style='font-size: 12pt;margin-left: 25px;'>"
        for (var i = 0; i < oCom.arrSrcData.length; i++) {
            html += "<li style='padding: 5px 0px 5px 0px;list-style-type:disc;'><a href='" + oCom.arrSrcData[i].Url + "' target='_blank' onclick='setCounterFunc(\"73\", \"" + oCom.arrSrcData[i].LinkId + "\", \"Q\", \"PTL\")'>" + oCom.arrSrcData[i].LinkTitle + "</a></li>";
        }
        html += "</ul>"
        $("#WebLinkMoreShow").append(html);

        $("#aWebLink").on("click", function () {

            easyDialog.open({
                container: 'divWebLink',
                fixed: true,
                overlay: true
            });
        });
        //2016.04.29 Kevin 個人專區點擊事件 
        $("#selfInfoLink").on("click", function () {
            window.open('editUserData.aspx', '_blank');
        });
    }



}

//#region 繪製行政界
function drawZone(type, zone) {
    var queryTaskCoun, queryTaskTown, query;
    //queryTaskCoun = new esri.tasks.QueryTask(gpCityTownPolygon + "/7?Token=" + gpNCDR_Token);
    //queryTaskTown = new esri.tasks.QueryTask(gpCityTownPolygon + "/3?Token=" + gpNCDR_Token);
    queryTaskCoun = new esri.tasks.QueryTask(gpCityTownPolygon + "/55?Token=" + gpNCDR_Token); // 2015/09/16 修正縣市鄉鎮畫不出來的問題
    queryTaskTown = new esri.tasks.QueryTask(gpCityTownPolygon + "/52?Token=" + gpNCDR_Token); // 2015/09/16 修正縣市鄉鎮畫不出來的問題
    query = new esri.tasks.Query();

    if (type == "coun") {
        query.outFields = ["COUN_NA"];
        query.where = "COUN_NA = '" + zone.replace('台', '臺') + "'";
        query.outSpatialReference = map.spatialReference;
        query.returnGeometry = true;
        queryTaskCoun.execute(query, queryZoneRlt);
    } else {
        //query.outFields = ["ALLNAME"];
        //query.where = "ALLNAME = '" + zone.replace('臺', '台') + "'";
        query.outFields = ["COUN_NA", "TOWN_NA"]; // 2015/09/16 修正縣市鄉鎮畫不出來的問題
        query.where = "COUN_NA = '" + zone.split(',')[0] + "' and TOWN_NA = '" + zone.split(',')[1] + "'"; // 2015/09/16 修正縣市鄉鎮畫不出來的問題
        query.outSpatialReference = map.spatialReference;
        query.returnGeometry = true;
        queryTaskTown.execute(query, queryZoneRlt);
    }
}

//行政界查詢結果
function queryZoneRlt(featureSet) {
    var oDraw = new objDraw();

    // 2015/09/16 修正縣市鄉鎮畫不出來的問題
    //if (typeof (featureSet.features[0].attributes.ALLNAME) == "undefined")
    //    oDraw.ViewType = "行政界(" + featureSet.features[0].attributes.COUN_NA.replace('台', '臺') + ")";
    //else
    //    oDraw.ViewType = "行政界(" + featureSet.features[0].attributes.ALLNAME.replace('台', '臺') + ")";
    if (typeof (featureSet.features[0].attributes.TOWN_NA) == "undefined")
        oDraw.ViewType = "行政界(" + featureSet.features[0].attributes.COUN_NA.replace('台', '臺') + ")";
    else
        oDraw.ViewType = "行政界(" + featureSet.features[0].attributes.COUN_NA.replace('台', '臺') + featureSet.features[0].attributes.TOWN_NA.replace('台', '臺') + ")";

    oDraw.State = "polygon_edit";
    oDraw.Geometry = featureSet.features[0].geometry;
    oDraw.Symbol.LineStyle = "SOLID";
    oDraw.Symbol.LineColor = new dojo.Color([139, 69, 19, 1]);
    oDraw.Symbol.LineWidth = "5";
    oDraw.Symbol.Style = "solid";
    oDraw.Symbol.Color = new dojo.Color([0, 0, 0, 0]);

    var outLine = new esri.symbol.SimpleLineSymbol(oDraw.Symbol.LineStyle, oDraw.Symbol.LineColor, oDraw.Symbol.LineWidth);
    //var sfsFill = new esri.symbol.SimpleFillSymbol(oDraw.Symbol.Style, outLine, oDraw.Symbol.Color);
    var graphic = new esri.Graphic(oDraw.Geometry, outLine, oDraw);
    graphic.id = "gcZone";

    var gLayer = map.getLayer(graphic.id);
    if (typeof (gLayer) != "undefined") {
        map.removeLayer(gLayer);
    }
    var gl = new esri.layers.GraphicsLayer({ id: graphic.id });
    map.addLayer(gl);
    gl.add(graphic);

    //外框線
    var oDraw1 = new objDraw();

    // 2015/09/16 修正縣市鄉鎮畫不出來的問題
    //if (typeof (featureSet.features[0].attributes.ALLNAME) == "undefined")
    //    oDraw1.ViewType = "行政界(" + featureSet.features[0].attributes.COUN_NA.replace('台', '臺') + ")";
    //else
    //    oDraw1.ViewType = "行政界(" + featureSet.features[0].attributes.ALLNAME.replace('台', '臺') + ")";
    if (typeof (featureSet.features[0].attributes.TOWN_NA) == "undefined")
        oDraw1.ViewType = "行政界(" + featureSet.features[0].attributes.COUN_NA.replace('台', '臺') + ")";
    else
        oDraw1.ViewType = "行政界(" + featureSet.features[0].attributes.COUN_NA.replace('台', '臺') + featureSet.features[0].attributes.TOWN_NA.replace('台', '臺') + ")";

    oDraw1.State = "polygon_edit";
    oDraw1.Geometry = featureSet.features[0].geometry;
    oDraw1.Symbol.LineStyle = "SPLOD";
    oDraw1.Symbol.LineColor = new dojo.Color([255, 255, 0, 1]);
    oDraw1.Symbol.LineWidth = "2";
    oDraw1.Symbol.Style = "solid";
    oDraw1.Symbol.Color = new dojo.Color([0, 0, 0, 0]);

    var outLine1 = new esri.symbol.SimpleLineSymbol(oDraw1.Symbol.LineStyle, oDraw1.Symbol.LineColor, oDraw1.Symbol.LineWidth);
    var graphic1 = new esri.Graphic(oDraw1.Geometry, outLine1, oDraw1);
    graphic1.id = "gcZone1";
    gl.add(graphic1);
}

function objDraw() {
    var obj = this;
    obj.ViewType = "";
    obj.State = "";
    obj.Geometry = [];
    obj.Symbol = {
        Color: "",
        Text: "", Size: "", Bold: "", Italic: "", Underline: "", BGColor: "", HtmlText: "", //文字
        Style: "", Width: "", Alpha: "",
        LineStyle: "", LineColor: "", LineWidth: "", LineAlpha: "", //區域外框線
        Source: "" //圖片
    };
    obj.Graphic = new esri.Graphic();
}
//#endregion

// 2015/07/30 示警平台前台 Start
var LimitData;
var ReloadLimit = false, JudgeLimit = false; // 2015/09/08 修改 : 網頁自動更新機制
var RainWarnTime = '', RiverWarnTime = '', refreshIntervalId = ''; // 2015/09/08 修改 : 網頁自動更新機制
function setMegDivShow(obj) {
    if ($(obj).parent().css('height') != '27px')
        $(obj).parent().animate({ 'height': '27px' }, 700);
    else
        $(obj).parent().animate({ 'height': '300px' }, 700);
}

function getLimitData() {
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

            if (!JudgeLimit) { // 2015/09/08 修改 : 網頁自動更新機制()
                LimitData = data;
                if (LimitData != undefined) {
                    $('#MegDivSimple').show();

                    // 2015/09/08 修改 : 網頁自動更新機制
                    if (!ReloadLimit) {
                        setMegDivShow($('#MegDivSimpleCtrl'));
                        $('audio')[0].play();
                    }

                    for (var i = 0; i < data.RainLimitList[0].length; i++) {
                        var RainLimitData = data.RainLimitList[0][i];
                        var sHtml = '<div class="MegDivClass" onclick="openTabAndCenter(' + RainLimitData.Cr_DataId + ',' + RainLimitData.nWGS84_Lon + ',' + RainLimitData.nWGS84_lat + ');">';
                        sHtml += RainLimitData.WarnLevel + '，';
                        sHtml += '請關注，';

                        var cHtml = '';
                        for (var j = 0; j < data.RainFocusList[0].length; j++) {
                            if (data.RainFocusList[0][j].LimitID == RainLimitData.LimitID)
                                cHtml += '<a href=\'#\' style="text-decoration: underline;" onclick="FocusCenter(event,' + data.RainFocusList[0][j].WGS84Lon + ',' + data.RainFocusList[0][j].WGS84Lat + ');">' + data.RainFocusList[0][j].Focus + '</a>、';
                        }

                        sHtml += cHtml.substring(0, (cHtml.length - 1));
                        sHtml += '單位' + RainLimitData.GrpName + '：' + RainLimitData.STNM + '雨量站，';
                        sHtml += getLimitType(RainLimitData.WarnReason, 'Rain') + ' ' + RainLimitData.WarnRain + ' mm，';
                        sHtml += '達' + getLimitType(RainLimitData.WarnReason, 'Rain') + ' ' + RainLimitData.WarnLimit + ' mm 門檻';
                        sHtml += '</div>'

                        $('#MegDivSimple div:eq(1)').append(sHtml);
                    };

                    for (var i = 0; i < data.RiverLimitList[0].length; i++) {
                        var RiverLimitData = data.RiverLimitList[0][i];
                        var sHtml = '<div class="MegDivClass" onclick="openTabAndCenter(' + RiverLimitData.Cr_DataId + ',' + RiverLimitData.nWGS84_Lon + ',' + RiverLimitData.nWGS84_lat + ');">';
                        sHtml += RiverLimitData.WarnLevel + '，';
                        sHtml += '請關注，';

                        var cHtml = '';
                        for (var j = 0; j < data.RiverFocusList[0].length; j++) {
                            if (data.RiverFocusList[0][j].RLimitID == RiverLimitData.RLimitID)
                                cHtml += '<a href=\'#\' style="text-decoration: underline;" onclick="FocusCenter(event,' + data.RiverFocusList[0][j].WGS84Lon + ',' + data.RiverFocusList[0][j].WGS84Lat + ');">' + data.RiverFocusList[0][j].Focus + '</a>、';
                        }

                        sHtml += cHtml.substring(0, (cHtml.length - 1));
                        sHtml += '單位' + RiverLimitData.GrpName + '：' + RiverLimitData.ST_NAME + '河川水位站，';
                        sHtml += getLimitType(RiverLimitData.WarnReason, 'River') + ' ' + RiverLimitData.WarnRiver + ' 公尺，';
                        sHtml += '達' + getLimitType(RiverLimitData.WarnReason, 'River') + ' ' + RiverLimitData.WarnLimit + ' 公尺';
                        sHtml += '</div>'

                        $('#MegDivSimple div:eq(1)').append(sHtml);
                    };


                    // 2015/09/08 修改 : 網頁自動更新機制
                    clearInterval(refreshIntervalId);
                    refreshIntervalId = setInterval(function () {
                        ReloadLimit = true;
                        JudgeLimit = true;
                        getLimitData();
                    }, (LimitReloadMin * 60 * 1000));

                    $('#MegReload').css('display', 'none');
                }
            }
            else {
                var showBtn = false;
                if (RainWarnTime == '')
                    RainWarnTime = data.RainLimitList[0][0].WarnTime.toString();

                if (RiverWarnTime == '')
                    RiverWarnTime = data.RiverLimitList[0][0].WarnTime.toString();

                if (RainWarnTime != data.RainLimitList[0][0].WarnTime.toString()) {
                    //alert('雨量該更新了 : ' + RainWarnTime + '   ' + data.RainLimitList[0][0].WarnTime.toString());
                    RainWarnTime = data.RainLimitList[0][0].WarnTime.toString();
                    showBtn = true;
                }

                if (RiverWarnTime != data.RiverLimitList[0][0].WarnTime.toString()) {
                    //alert('河川該更新了 : ' + RiverWarnTime + '   ' + data.RiverLimitList[0][0].WarnTime.toString());
                    RiverWarnTime = data.RiverLimitList[0][0].WarnTime.toString();
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
function reloadLimitData() {
    JudgeLimit = false;
    ReloadLimit = true;
    $('#MegDivSimple div:eq(1)').empty();
    getLimitData();
}

function getLimitType(type, typesrc) {
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

// 開啟對應的頁籤(運用跑馬燈開頁籤的函式) 與 定位到雨量站
function openTabAndCenter(TabID, Lon, Lat) {
    oModMarguee.CtrlPtl(TabID);

    if (Lon != '0' && Lat != '0') {
        setTimeout(function () {
            var pt = new esri.geometry.Point(parseFloat(Lon), parseFloat(Lat), new esri.SpatialReference(mapSpRef));
            map.centerAt(pt);
        }, 1000);
    }
}

//關注目標定位
function FocusCenter(e, Lon, Lat) {
    debugger;
    var pt = new esri.geometry.Point(parseFloat(Lon), parseFloat(Lat), new esri.SpatialReference(mapSpRef));
    map.centerAndZoom(pt, 7);
    e.stopPropagation();
}

// 2015/07/30 示警平台前台 End

function toggleMainRight() {
   
    if (isMainRightShow == "Y") {
        isMainRightShow = "N";        
        $("#mainRight").hide("slide", { direction: "right" }, 1000);//加上滑入效果 2016/12/20 Kevin
        $("#btnToggle").animate({
            "position": "fixed",
            "top": 0,
            "right": 1,           
        }, 1000);
    } else if (isMainRightShow == "N") {   
        isMainRightShow = "Y";
        var contentWidth=$("#mainRight").width();
       $("#mainRight").show("slide", { direction: "right" }, 1000,function(){});
        $("#btnToggle").animate({
            "position": "fixed",
            "top": 0,
            "right": contentWidth,
        },1000);
    }

    
}