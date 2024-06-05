/**
 * @author Wei756 <wei756fg@gmail.com>
 * @license MIT
 */

/**
 * @description URL 파라미터를 반환합니다.
 *
 * @return {Array} 파라미터
 */
function getURLParams() {
  const params = [];

  try {
    // 현재 페이지의 url
    const url = decodeURIComponent(decodeURIComponent(location.href));

    // url에서 '?' 문자 이후의 파라미터 문자열까지 자르고 파라미터 구분자("&") 로 분리
    const paramsStr = url
      .substring(url.indexOf('?') + 1, url.length)
      .split('&');

    // paramsStr 배열을 다시 "=" 구분자로 분리하여 param 배열에 key:value 로 담는다.
    paramsStr.map((param) => {
      const [k, v] = param.split('=');
      params[k] = v;
    });
  } catch (err) {
    console.error(err);
  }

  return params;
}

/**
 * @description 문자열 뒤에 알맞는 조사(을/를)를 반환합니다.
 *
 * @param {string} str 문자열
 */
function getEul(str) {
  const lastChar = str.charCodeAt(str.length - 1); // str의 마지막 글자

  if (lastChar >= 0xac00 && lastChar <= 0xd7af) {
    // 한글이면
    return (lastChar - 44032) % 28 ? '을' : '를';
  } else {
    // 한글 아니면
    return '을(를)';
  }
}

/**
 * @param {string} selector 
 * @returns {Element | null}
 */
function $query(selector) {
  return document.querySelector(selector);
}

/**
 * @param {number} miliseconds
 * @returns {Promise<never>}
 */
function wait(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

/**
 * @param {string} selector
 * @param {(el: Element) => Promise<any>} handler
 * @param {number} timeout
 * @returns {Promise<HTMLElement>}
 */
async function waitUntilLoadedElement(
  selector,
  handler = async () => {},
  timeout = 10000,
) {
  const startTime = Date.now();
  while (!$query(selector)) {
    if (timeout != -1 && Date.now() - startTime > timeout) {
      break;
    }
    await wait(30);
  }
  const element = $query(selector);
  await handler(element);
  return element;
}

/**
 * @description 숫자를 1000단위로 컴마가 삽입된 문자열로 변환합니다.
 *
 * @param {number} n
 * @returns {string}
 */
function formatNumberWithCommas(n) {
  const parts = n.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}