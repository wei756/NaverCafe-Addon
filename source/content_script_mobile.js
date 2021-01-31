/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){
    $(document).ready(function() {
        checkActivityStop();
    });

    /** 
     * @description URL 파라미터를 반환합니다.
     * @return {Array} 파라미터
     */
    function getURLParams() {
        // 파라미터가 담길 배열
        var param = new Array();
     
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
     
        return param;
    }

    /**
     * 문자열이 빈 문자열인지 체크하여 결과값을 리턴합니다.
     * @param str 체크할 문자열
     */
    function isEmpty(str) {
         
        if (typeof str == "undefined" || str == null || str == "")
            return true;
        else
            return false;
    }

    /**
     * 회원이 활동정지 상태인지 확인하고 그 상태를 출력합니다.
     */
    function checkActivityStop() {
        if (location.href.indexOf("CafeMemberProfile.nhn") != -1) {
            // 프로필 페이지 로딩
            var params = getURLParams();
            var cafeId = params["cafeId"];
            var memberId = params["memberId"];
            if (!isEmpty(memberId)) {
                $.ajax({
                    type: "POST",
                    url: "https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=" + cafeId + "&memberId=" + memberId,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    success:function(data){
                        if (data.message.status == "200" && data.message.result.activityStop) {
                            var stoppedElement = document.createElement("span");
                            stoppedElement.append(" (활동 정지됨)");
                            document.querySelector(".profile_head strong.nick").appendChild(stoppedElement);
                        }
                    },
                    error: function (xhr) {
                    }
                })
            }
        }
    }

});