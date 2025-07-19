// =================================================================
// グローバル変数と共通データ
// =================================================================
const screens = document.querySelectorAll('.screen');
let geminiApiKey = localStorage.getItem('geminiApiKey') || '';

// 健康記録データ（localStorageから読み込み）
let healthRecords = JSON.parse(localStorage.getItem('healthRecords')) || {};
let currentCalendarDate = new Date();

// 病院検索用データ
const regionData = {
    "北海道・東北": ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    "関東": ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    "中部": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
    "近畿": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    "中国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
    "四国": ["徳島県", "香川県", "愛媛県", "高知県"],
    "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]
};
const departments = [
    "内科", "外科", "小児科", "産婦人科", "整形外科", "皮膚科", "眼科", "耳鼻咽喉科", 
    "泌尿器科", "精神科", "神経内科", "心療内科", "脳神経外科", "心臓血管外科", 
    "呼吸器科", "消化器科", "循環器科", "アレルギー科", "リハビリテーション科"
];

// =================================================================
// アプリケーション起動時の初期化処理
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 初期画面表示
    showScreen('main-menu');
    
    // 各機能の初期化関数を呼び出す
    // initSymptomChecker(); // symptom_checker.js側でDOMContentLoadedイベントで初期化されるため不要
    initHospitalSearch();
    initHealthCalendar();
});

// =================================================================
// 画面遷移ロジック
// =================================================================
function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.add('active');
    }
}