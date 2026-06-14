// --- 1) マップ初期化 -------------------------------------------------------
const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true,
}).setView([38.5, 139.5], 6);

// ズームや移動を始めたら開いているポップアップを閉じる
map.on("zoomstart", () => map.closePopup());
map.on("movestart", () => map.closePopup());

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// --- 2) レイヤーグループ ---------------------------------------------------
const grouptunagari = L.layerGroup();
const groupevent = L.layerGroup();
const groupReport = L.layerGroup();
const groupLearning = L.layerGroup();

// --- 3) カラーピン設定（つながり＝赤、イベント＝青、レポート＝緑, 学び（見てほしいところ）=紫）-------------------------------------- ---------------
const icontunagari = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [40, 65],
  iconAnchor: [20, 65],
  popupAnchor: [0, -55],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [65, 65],
});

const iconevent = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [40, 65],
  iconAnchor: [20, 65],
  popupAnchor: [0, -55],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [65, 65],
});

const iconReport = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [40, 65],
  iconAnchor: [20, 65],
  popupAnchor: [0, -55],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [65, 65],
});

const iconLearning = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  iconSize: [40, 65],
  iconAnchor: [20, 65],
  popupAnchor: [0, -55],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [65, 65],
});

// --- 4) 地点データ（必要に応じて増減OK） -----------------------------------
const points = [
  {
    group: "event",
    lat: 37.31,
    lng: 137.15,
    title: "能登町 つなぐマーケット",
    date: "2025-08-12",
    image: "assets/image/LINE_ALBUM_20250614 つなぐマーケット_251031_1.jpg",
    audio: "",
    desc: "つながりを大切に。",
    icon: iconevent,
  },
  {
    group: "report",
    lat: 37.312815870427855,
    lng: 137.14736858300097,
    title: "あばれ祭り",
    date: "2025-07-04~6",
    image: "assets/image/LINE_ALBUM_202574-76 あばれ祭_251024_1.jpg",
    audio: "",
    movie: "",
    desc: "能登で行われるあばれ祭り。切子や神輿を担ぐ。",
    icon: iconReport,
  },

  {
    group: "event",
    lat: 35.938720757751405,
    lng: 139.59611018065607,
    title: "クリスマスマーケット",
    date: "2025-11-19",
    image: "assets/image/LINE_ALBUM_20251119 クリスマスマーケット_251125_1.jpg",
    image: "assets/image/LINE_ALBUM_20251119 クリスマスマーケット_251125_2.jpg",
    audio: "",
    desc: "聖学院で行いました",
    icon: iconevent,
  },
  {
    group: "report",
    lat: 39.003594230560225,
    lng: 141.6251236711646,
    title: "見学予定",
    date: "2027-3-01",
    image: "",
    audio: "",
    desc: "",
    icon: iconReport,
  },
];

// --- 5) マーカー生成＆各レイヤーに追加 -------------------------------------
const allLayers = [];
points.forEach((p) => {
  const html = `
    <div class="popup-media">
      <strong>${p.title}</strong><br/>
      <small>${p.date ?? ""}</small>
      ${p.image ? `<img src="${p.image}" alt="${p.title}" />` : ""}
      ${
        p.movie
          ? `
        <video controls>
          <source src="${p.movie}" type="video/mp4">
          お使いのブラウザは動画再生に対応していません。
        </video>
      `
          : ""
      }
      ${p.audio ? `<audio controls src="${p.audio}"></audio>` : ""}
      <div class="caption">${p.desc ?? ""}</div>
      ${p.url ? `<a href="${p.url}" target="_self" class="popup-link">詳しくはこちら →</a>` : ""}

    </div>
  `;

  const marker = L.marker([p.lat, p.lng], {
    icon: p.icon,
    title: p.title,
  }).bindPopup(html);

  if (p.group === "tunagari") marker.addTo(grouptunagari);
  if (p.group === "event") marker.addTo(groupevent);
  if (p.group === "report") marker.addTo(groupReport);
  if (p.group === "learning") marker.addTo(groupLearning);

  allLayers.push(marker);
});

// --- 6) レイヤーを地図に載せる ---------------------------------------------
grouptunagari.addTo(map);
groupevent.addTo(map);
groupReport.addTo(map);
groupLearning.addTo(map);

// --- 7) レイヤー切替UI -----------------------------------------------------
L.control
  .layers(
    { OpenStreetMap: osm },
    {
      "つながり(交流や招かれたもの)": grouptunagari,
      "イベント(主催しもの、企画したものや出し物)": groupevent,
      "レポート（現地の様子）": groupReport,
      "学び(知ってほしいもの)": groupLearning,
    },
    { collapsed: false },
  )
  .addTo(map);

// --- 8) すべてのマーカーが入るように自動調整 -------------------------------
if (allLayers.length > 0) {
  const fg = L.featureGroup(allLayers);
  map.fitBounds(fg.getBounds().pad(0.2));
}
