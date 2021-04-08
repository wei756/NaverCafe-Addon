/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

/** 
 * @description URL 파라미터를 반환합니다.
 * @return {Array} 파라미터
 */
function getURLParams() {
    // 파라미터가 담길 배열
    var param = new Array();
    
    try {
        // 현재 페이지의 url
        var url = decodeURIComponent(location.href);
        // url이 encodeURIComponent 로 인코딩 되었을때는 다시 디코딩 해준다.
        url = decodeURIComponent(url);
    
        var params;
        // url에서 '?' 문자 이후의 파라미터 문자열까지 자르기
        params = url.substring( url.indexOf('?')+1, url.length );
        // 파라미터 구분자("&") 로 분리
        params = params.split("&");
    
        // params 배열을 다시 "=" 구분자로 분리하여 param 배열에 key = value 로 담는다.
        var size = params.length;
        var key, value;
        for(var i=0 ; i < size ; i++) {
            key = params[i].split("=")[0];
            value = params[i].split("=")[1];
    
            param[key] = value;
        }
    } catch(err) {
        console.error(err);
    }
    
    return param;
}

/**
 * @description 네이버 아이디
     * @type {string}
    */
const nid = "nid";
/**
 * @description 키워드
     * @type {string}
    */
const keyword = "keyword";

initBlockList();

/** 
 * @description 차단 목록 배열을 생성합니다.
 */
function initBlockList() {
    getBlockList(function(items) {
    
        if (typeof items[nid] == "undefined" || items[nid] == null) { // 차단 목록 생성
            items[nid] = new Array(); // 새로운 array
        }
        if (typeof items[keyword] == "undefined" || items[keyword] == null) { // 차단 목록 생성
            items[keyword] = new Array(); // 새로운 array
        }
        chrome.storage.sync.set(items, function() { 
        });

    });
}

/** 
 * @description 새로운 차단 목록 배열을 생성합니다.
 */
function resetBlockList() {
    getBlockList(function(items) {

        var list = {darkmode: false, nid: [], keyword: [], version: 2};

        chrome.storage.sync.set(list, function() { 
        });

    });
}

/** 
 * @description 차단 목록에 특정값이 있는지 확인하고 그 인덱스를 반환합니다.
 * @param {Array}} 차단 목록
 * @param {string} cafeid 찾는 값의 카페 id
 * @param {string} key 찾는 값의 key
 * @param {string} value 찾는 값
 */
function indexBlockItem(arr, cafeid, key, value) {
    var le = arr.length;
    for (let i = 0; i < le; i++) {
        if (arr[i]['' + key] != null && (arr[i]['cafeid'] === '-' || arr[i]['cafeid'] === cafeid) && arr[i]['' + key] === value) {
            return i;
        }
    }
    return -1;
}

/** 
 * @description 차단 목록을 불러옵니다.
 * @param {function} callback 콜백 함수
 */
function getBlockList(callback) {
    chrome.storage.sync.get(null, function(items) {
        //console.log("items: " + JSON.stringify(items));
        callback(items);
    });
}

/** 
 * @description 차단 목록에서 회원 아이디/키워드를 제거합니다.
 * @param {string} type 회원 아이디/키워드
 * @param {string} cafeid 제거할 데이터의 카페 id
 * @param {string} key 제거할 데이터 키
 * @param {string} value 제거할 데이터 값
 */
function removeBlockItem(type, cafeid, key, value) {
    getBlockList(function(items) {
        if (typeof items[type] == "undefined" || items[type] == null) {
            alert("차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + value + ")");
        } else {
            var ind = indexBlockItem(items[type], cafeid, key, value)
            if (ind != -1) { // 존재하는지 여부 검사
                items[type].splice(ind, 1);

                const msgStr = 
                    type == keyword ? 
                    getEul(value) + " 차단 해제하였습니다." : 
                    " 님을 차단 해제하였습니다.";
                alert(value + msgStr);
                
                chrome.storage.sync.set(items, function() { 
                });
            } else {
                alert("차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + value + ")");
            }
        }
    });
}

/** 
 * @description 문자열 뒤에 알맞는 조사(을/를)를 반환합니다.
 * @param {string} str 문자열
 */
function getEul(str) {
    const lastChar = str.charCodeAt(str.length - 1); // str의 마지막 글자

    if (lastChar >= 0xAC00 && lastChar <= 0xD7AF) { // 한글이면
        return ((lastChar - 44032) % 28 ? '을' : '를');
    } else { // 한글 아니면
        return "을(를)";
    }
}