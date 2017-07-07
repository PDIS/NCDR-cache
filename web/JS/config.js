/**********************************
 * 系統參數
 **********************************/

//MapServer位置
//var mapServiceUrl = "http://140.110.141.217/ceocgis/rest/services/";  //地圖服務217
//var mapServiceUrl = "http://61.56.4.39/arcgis/rest/services/";  //地圖服務39
var mapServiceUrl = "https://dssmap1.ncdr.nat.gov.tw/ceocgis/rest/services/";  //地圖服務dssmap

//地圖服務連線Token
var gpNCDR_Token = "UGUYopriYafGuOoqlQz1DHXFMzp3dTgH0mWfWfVKdzNaD-KqnlOnKorVrI9FTZcAfuqkLW4mH3vxIUKciK_Haw..";  //NCDR地圖服務217
var gpOnline_Token = "UGUYopriYafGuOoqlQz1DHXFMzp3dTgH0mWfWfVKdzNaD-KqnlOnKorVrI9FTZcAfuqkLW4mH3vxIUKciK_Haw..";  //衛照地圖服務217

//var gpNCDR_Token = "1Pmiuwoew0hhe6FwiSxeAmOcqZ6h-UtTxFV9NO_WgpiFHQyLiBRd5Z7r9wq_1hFva7e-c6-jA8856fI-8AkF8A..";  //NCDR地圖服務217
//var gpOnline_Token = "1Pmiuwoew0hhe6FwiSxeAmOcqZ6h-UtTxFV9NO_WgpiFHQyLiBRd5Z7r9wq_1hFva7e-c6-jA8856fI-8AkF8A..";  //衛照地圖服務217
//var gpNCDR_Token = "9d1Z0KEHalyixraBfgFrYYFs0W6tX95NrRs1XN5e80eh7ux9FiaRfltzgh6Fez2KwnoefR1xWxfxfKAx6PF57Q..";  //NCDR地圖服務39
//var gpOnline_Token = "9d1Z0KEHalyixraBfgFrYYFs0W6tX95NrRs1XN5e80eh7ux9FiaRfltzgh6Fez2KwnoefR1xWxfxfKAx6PF57Q..";  //衛照地圖服務39

//靜態圖層URL
var gpTiledMapWorld = mapServiceUrl + "NCDR_CACHE_2014/World_WGS84/MapServer";       //世界地圖-淺色地圖版
var gpTiledMapWorldI = mapServiceUrl + "NCDR_CACHE_2014/WorldIWL_WGS84/MapServer";   //世界地圖-影像地圖版
//var gpTwLabel = mapServiceUrl + "NCDR_CACHE_2014/CMAPL6CITY_WGS84/MapServer";   //道路註記
var gpTwLabel = mapServiceUrl + "NCDR_CACHE_2016/CMAPL6CITY_WGS84/MapServer";   //道路註記

//動態圖層URL
var gpNCDRLayers = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE/MapServer";               //動態服務NCDR
var gpNCDRLayersPoint = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE_Point/MapServer";    //動態服務NCDRPoint
var gpNCDRLayersLine = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE_Line/MapServer";      //動態服務NCDRLine
var gpNCDRLayersPolygon = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE_Polygon/MapServer";//動態服務NCDRPolygon
var gpNCDRLayersPolygon2 = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE_Polygon_2/MapServer";//動態服務NCDRPolygon2
var gpNCDRLayersPolygon3 = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE_Polygon_3/MapServer";//動態服務NCDRPolygon3
var gpEQFS = mapServiceUrl + "NCDR_SDE_2014/NCDREQDASH_FS/FeatureServer";  //地震儀表板FeatureService
//var gpEQDash = mapServiceUrl + "NCDR_SDE_2014/EQDash/MapServer/0";       //地震儀表板-震度範圍
//var gpHSR = gpNCDRLayersLine + "/1";                                     //地震儀表板-高鐵

//查詢服務URL
var gpGeomeService = mapServiceUrl + "Utilities/Geometry/GeometryServer";      //區域分析用
//var gpCityTownPolygon = mapServiceUrl + "NCDR_CACHE_2013/NCDRFunc/MapServer";  //行政界繪製用
var gpCityTownPolygon = mapServiceUrl + "NCDR_SDE_2014/NCDR_SDE_Polygon/MapServer";  //行政界繪製用  // 2015/09/04 公版主題式表單修正

//LBS服務
var LBS_Url = mapServiceUrl + "NCDR_SDE_2014/TownShipWithGDBno_WGS84/MapServer/0";
var LBS_Token = "1Pmiuwoew0hhe6FwiSxeAmOcqZ6h-UtTxFV9NO_WgpiFHQyLiBRd5Z7r9wq_1hFva7e-c6-jA8856fI-8AkF8A.."; //LBS服務217
//var LBS_Token = "9d1Z0KEHalyixraBfgFrYYFs0W6tX95NrRs1XN5e80eh7ux9FiaRfltzgh6Fez2KwnoefR1xWxfxfKAx6PF57Q..";  //LBS服務39

//其他URL
//var gpNCDRPICUrl = "http://ncdrfile.ncdr.nat.gov.tw/NCDRPIC/";       //NCDRPIC虛擬目錄路徑(中央版) 2015/04/27 2015/12/7 Sophia說214有問題先改回中央連結
//var gpNCDRPICUrl = "http://61.56.4.74/NCDRPIC/";	               //NCDRPIC虛擬目錄路徑
var gpNCDRPICUrl = "http://ncdrfile.ncdr.nat.gov.tw/NCDRPIC/";	 //NCDRPIC虛擬目錄路徑(地方版) 2015/04/27 2015/12/7 Sophia說214有問題先改回中央連結
var gpNCDRWebUrl = "http://eocdss.ncdr.nat.gov.tw/NCDRWebV2/";	       //NCDRWeb路徑

//JSON File URL
var gpImageDBDataJsonUrl = "/ITW_JSON/ImageDBData/";	    //JSON檔路徑
var gpDBDataJsonUrl = "/ITW_JSON/DBData/";	                    //JSON檔路徑
var gpMapDBDataJsonUrl = "/ITW_JSON/MapDBData/";	            //JSON檔路徑
var gpRtuiDBDataJsonUrl = "/ITW_JSON/RtuiDBData/";	            //JSON檔路徑
var gpKmlDataJsonUrl = "/ITW_JSON/KmlData/";	            //JSON檔路徑

//客製化表單預設是否開啟
var IsRTUIFrmOpen = "Y";

//意見回饋
var surveyTarget = "all"; //填寫對象(中心:main/地方:local/全部:all/none:關閉)
var surverUrl = "https://docs.google.com/a/richitech.com.tw/forms/d/1PrescM5FSBnIoiZVrVS_JsRh73U5ysH3RjOE0Tp5C-k/viewform";//填寫網址

//單一登入、登出導向網址
var gpSingleLoginUrl = "https://www.cp.gov.tw/portal/Clogin.aspx?returnUrl="
var gpSingleLogoutUrl = "https://www.cp.gov.tw/portal/logout.aspx?logoutUrl=";

//入口災情綜覽URL
var NCDREQ = {
    Event: "http://140.110.141.215/NCDRJSON/NCDREQ/eqevent.txt",
    TitleName: "防災速報",
    P1: { Name: "地震震央以及PGA圖", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P1.png" },
    P2: { Name: "目前發生地震影響縣市", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P2.png" },
    P3: { Name: "區域地質", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P3.png" },
    P4: { Name: "各震區設施", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P4.png" },
    P5: { Name: "各震度設施清單", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P5.png" },
    P6: { Name: "各震度人數", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P6.png" },
    P7: { Name: "各震度人數清單", Url: "http://140.110.141.215/NCDRJSON/NCDREQ/P7.png" }
};

//驗證KML 連結
var CheckKmlUrl = "http://utility.arcgis.com/sharing/kml?url=";

//Google Analytics
//var gaNoPtl = "UA-43764352-4"; //ceocdss
//var gaNoSys = "UA-43764352-5"; //ceocdss
var gaNoPtl = "UA-43764352-3"; //eocdss
var gaNoSys = "UA-43764352-6"; //eocdss


//////////////////////////////////////////////////////////////
//比例尺參數
var lods = [
            //{ "level": 0, "resolution": 156543.03392800014, "scale": 5.91657527591555E8 },
            //{ "level": 1, "resolution": 78271.51696399994, "scale": 2.95828763795777E8 },
            //{ "level": 2, "resolution": 39135.75848200009, "scale": 1.47914381897889E8 },
            //{ "level": 3, "resolution": 19567.87924099992, "scale": 7.3957190948944E7 },
            //{ "level": 4, "resolution": 9783.93962049996, "scale": 3.6978595474472E7 },
            { "level": 0, "resolution": 4891.96981024998, "scale": 18489297.737236 },
            { "level": 1, "resolution": 2445.98490512499, "scale": 9244648.868618 },
            { "level": 2, "resolution": 1222.992452562495, "scale": 4622324.434309 },
            { "level": 3, "resolution": 611.4962262813797, "scale": 2311162.217155 },
            { "level": 4, "resolution": 305.74811314055756, "scale": 1155581.108577 },
            { "level": 5, "resolution": 152.87405657041106, "scale": 577790.554289 },
            { "level": 6, "resolution": 76.43702828507324, "scale": 288895.277144 },
            { "level": 7, "resolution": 38.21851414253662, "scale": 144447.638572 },
            { "level": 8, "resolution": 19.10925707126831, "scale": 72223.819286 },
            { "level": 9, "resolution": 9.554628535634155, "scale": 36111.909643 },
            { "level": 10, "resolution": 4.77731426794937, "scale": 18055.954822 },
            { "level": 11, "resolution": 2.388657133974685, "scale": 9027.977411 },
            { "level": 12, "resolution": 1.1943285668550503, "scale": 4513.988705 },
            { "level": 13, "resolution": 0.5971642835598172, "scale": 2256.994353 },
            { "level": 14, "resolution": 0.29858214164761665, "scale": 1128.497176 }
];
var lodsLabels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var mapSpRef = { wkid: 4326 };
var mapCenter = [120.76515, 23.74349]; //地圖中心點
var mapDfZoom = 3;  //地圖預設層級
var mapDfScale = 2311162.217155;  //地圖預設比例尺
var mapTwLevel = 3; //全台預設層級
var mapVisScale = 18489297.737236; //地圖可視比例尺(切換世界地圖,客製化圖片尺寸)
var isToken = 'Y';

//客製化圖層
var rtImgChangeLevel = 2; //圖點尺寸切換層級
var rtLocZoomLevel = 6;  //圖點定位縮放層級

var IdtRadius = 2;    //圖層查詢的半徑(公里)
var AAmaxRadius = 30; //環域分析的最大半徑(公里)

//2015/03/10：跑馬燈，設定「水保局土石流警戒」RSS解除警報的「過期」時數
var PasHour = 3;


// 2015/05/25 修改 分辨是那個瀏覽器
//IE, Firefox,Chrome, Opera, Safari(BrowserVer.ie)
var BrowserVer = {};
var ua = navigator.userAgent.toLowerCase();
var s;
(s = ua.match(/msie ([\d.]+)/)) ? BrowserVer.ie = s[1] :
(s = ua.match(/firefox\/([\d.]+)/)) ? BrowserVer.firefox = s[1] :
(s = ua.match(/chrome\/([\d.]+)/)) ? BrowserVer.chrome = s[1] :
(s = ua.match(/opera.([\d.]+)/)) ? BrowserVer.opera = s[1] :
(s = ua.match(/version\/([\d.]+).*safari/)) ? BrowserVer.safari = s[1] : 0;

// 2015/09/07 修改 : 資訊綜覽地區性
var tabsCaseAreaInfoUrl = 'http://satis.ncdr.nat.gov.tw/kml/gettxt.ashx';
var SixCity = ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市'];

// 2015/09/08 修改 : 網頁自動更新機制
var PgReloadMin = 60;    //分
var LimitReloadMin = 60; //分

//加入預設開啟底圖 @20160317 Andy
var defalutBgMapID = "6710";    //對應NCDRFuncList FuncId欄位

// legend Path 改為絕對路徑 (倉儲175) @20160706 Martin
var gLegendPath1 = "/NCDRPIC/NCDR/TOC/Legend1/";
var gLegendPath2 = "/NCDRPIC/NCDR/TOC/Legend2/";
var gPortalPath = "/NCDRPIC/NCDR/Portal/";

//行動版跳轉所用的參數 @20161108 Kevin
var pcFullUrl = "/ncdrwebv2/index.aspx";
//var domainName = "eocdss.ncdr.nat.gov.tw";
var domainName = "223.200.166.10";
var redirectUrl = "/NCDRWebV2/";
var mobileUrl = "/ncdrmobile/";

//頁籤API的站台網域 @20161107 Kevin
var APIUrlDomain = "223.200.166.10";
//頁籤API是否使用縮網址
var useShortUrl = "Y";
var setId = "1";