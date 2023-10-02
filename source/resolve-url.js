/**
 * @author Wei756 <wei756fg@gmail.com>
 * @license MIT
 */

if (window.name === "cafe_main") {
  let data = {
    baseUrl: `//${window.parent.location.host}${window.parent.location.pathname
      .split("/", 2)
      .join("/")}`,
    url: `?iframe_url_utf8=${encodeURIComponent(location.href)}`,
  };

  testIsArticle(data);

  window.parent.history.replaceState({}, null, data.baseUrl + data.url);
}

function testIsArticle(data) {
  let test = /^\/ca-fe\/cafes\/(.*)\/articles\/.*$/.exec(location.pathname);
  if (test) {
    data.url = `/${test[1]}`;
  } else if (location.pathname.endsWith("/ArticleRead.nhn")) {
    const searchParams = new URLSearchParams(location.search);
    data.url = `/${searchParams.get("articleid")}`;
  }
}
