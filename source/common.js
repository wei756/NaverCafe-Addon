/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

/** 
 * @description URL 파라미터를 반환합니다.
 * @return {Array} 파라미터
 */
function getURLParams() {
    const params = [];
    
    try {
        // 현재 페이지의 url
        const url = decodeURIComponent(decodeURIComponent(location.href));
    
        // url에서 '?' 문자 이후의 파라미터 문자열까지 자르고 파라미터 구분자("&") 로 분리
        const paramsStr = url.substring( url.indexOf('?')+1, url.length ).split("&");
    
        // paramsStr 배열을 다시 "=" 구분자로 분리하여 param 배열에 key:value 로 담는다.
        paramsStr.map(param => {
            const [k, v] = param.split("=");
            params[k] = v;
        });
    } catch(err) {
        console.error(err);
    }
    
    return params;
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
    getBlockList(items => {

        // 차단 목록 생성
        if (!items[nid]) {
            items[nid] = [];
        }
        if (!items[keyword]) {
            items[keyword] = [];
        }
        if (items['showBestThumb'] === undefined) {
            items['showBestThumb'] = true;
        }
        chrome.storage.sync.set(items, () => {});

    });
}

/** 
 * @description 새로운 차단 목록 배열을 생성합니다.
 */
function resetBlockList() {
    const dummyList = {showBestThumb: true, darkmode: false, nid: [], keyword: [], version: 2};
    getBlockList(items => {
        chrome.storage.sync.set(dummyList, () => {});
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
        if (arr[i]['' + key] != null && 
            (arr[i]['cafeid'] === '-' || arr[i]['cafeid'] === cafeid) && 
            arr[i]['' + key] === value) {
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
    chrome.storage.sync.get(null, callback);
}

/** 
 * @description 차단 목록에서 회원 아이디/키워드를 제거합니다.
 * @param {string} type 회원 아이디/키워드
 * @param {string} cafeid 제거할 데이터의 카페 id
 * @param {string} key 제거할 데이터 키
 * @param {string} value 제거할 데이터 값
 */
function removeBlockItem(type, cafeid, key, value) {
    const msgNotBlocked = "차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + value + ")";
    getBlockList(items => {
        if (!items[type]) {
            return alert(msgNotBlocked);
        }
        const ind = indexBlockItem(items[type], cafeid, key, value);
        if (ind != -1) { // 존재하는지 여부 검사
            items[type].splice(ind, 1);

            const msgStr = 
                type == keyword ? 
                getEul(value) + " 차단 해제하였습니다." : 
                " 님을 차단 해제하였습니다.";
            alert(value + msgStr);
            
            chrome.storage.sync.set(items, () => {});
        } else {
            alert(msgNotBlocked);
        }
    });
}

/**
 * @description 인기글 목록에서 썸네일 표시여부를 반환합니다.
 * @param {function} callback 
 */
function isShowBestThumb(callback) {
    getBlockList(items => {
        callback(items['showBestThumb']);
    });
}

/**
 * @description 인기글 목록에서 썸네일 표시여부를 설정합니다.
 * @param {boolean} val 썸네일 표시여부
 * @param {function} callback 
 */
function setShowBestThumb(val, callback) {
    getBlockList(items => {
        items['showBestThumb'] = val;
        chrome.storage.sync.set(items, callback);
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

/**
 * 회원의 활동정지 상태를 반환합니다.
 * @param {string} cafeid 카페 id
 * @param {string} memberid 회원 id
 * @param {function} callback 
 */
function getActivityStop({ cafeid, memberid, callback }) {
    $.ajax({
        type: 'POST',
        url: `https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=${cafeid}&memberId=${memberid}`,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        success: data => {
            callback(data.message.status == '200' && data.message.result.activityStop);
        },
        error: xhr => {
            callback(false);
        }
    });
}