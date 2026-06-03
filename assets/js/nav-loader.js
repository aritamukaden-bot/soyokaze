// assets/js/nav-loader.js
document.addEventListener("DOMContentLoaded", async () => {
  const navContainer = document.getElementById("global-nav");
  if (!navContainer) return;

  // 今いるページの階層に応じて nav.html を探す候補を作る
  const makeCandidates = () => {
    // 例: /tunagari/activites_xxx.html -> ["./nav.html", "../nav.html", "/nav.html", "../../nav.html", ...]
    const path = (location.pathname || "/").split("?")[0].split("#")[0];
    const parts = path.split("/").filter(Boolean); // ["tunagari", "activites_xxx.html"]
    const depth = Math.max(0, parts.length - 1);   // ファイルを除いた階層数

    const candidates = [];

    // 同階層
    candidates.push("nav.html");

    // 1つ上、2つ上…と順に
    let prefix = "";
    for (let i = 0; i < depth; i++) {
      prefix += "../";
      candidates.push(prefix + "nav.html");
    }

    // ルート絶対（Live Server などサーバーで動かすと一番安定）
    candidates.push("/nav.html");

    // 重複除去
    return [...new Set(candidates)];
  };

  const candidates = makeCandidates();

  // nav.html を順に探して、見つかったらそれを使う
  const fetchFirstOk = async (urls) => {
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const html = await res.text();
        return { url, html };
      } catch (e) {
        // file:// などで fetch 自体が失敗するケースもあるので握りつぶして次へ
        continue;
      }
    }
    return null;
  };

  const result = await fetchFirstOk(candidates);

  if (!result) {
    console.error("ナビの読み込みに失敗しました。候補:", candidates);
    navContainer.innerHTML = "<!-- nav load failed -->";
    return;
  }

  navContainer.innerHTML = result.html;

  // ナビ挿入後にトグル初期化
  if (typeof window.initNavToggle === "function") {
    window.initNavToggle();
  }
});
