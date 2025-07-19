// =================================================================
// 病院検索機能
// =================================================================

function initHospitalSearch() {
    const regionSelect = document.getElementById('region-select');
    const prefectureSelect = document.getElementById('prefecture-select');
    const citySelect = document.getElementById('city-select');
    const departmentSelect = document.getElementById('department-select');

    // 地方の選択肢を設定
    regionSelect.innerHTML = '<option value="">地方を選択</option>';
    Object.keys(regionData).forEach(region => {
        regionSelect.innerHTML += `<option value="${region}">${region}</option>`;
    });

    // 診療科の選択肢を設定
    departmentSelect.innerHTML = '<option value="">診療科を選択</option>';
    departments.forEach(dep => {
        departmentSelect.innerHTML += `<option value="${dep}">${dep}</option>`;
    });

    // イベントリスナーを設定
    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        prefectureSelect.innerHTML = '<option value="">都道府県を選択</option>';
        citySelect.innerHTML = '<option value="">市区町村を選択</option>';
        citySelect.disabled = true;
        if (selectedRegion) {
            regionData[selectedRegion].forEach(pref => {
                prefectureSelect.innerHTML += `<option value="${pref}">${pref}</option>`;
            });
            prefectureSelect.disabled = false;
        } else {
            prefectureSelect.disabled = true;
        }
    });

    prefectureSelect.addEventListener('change', async () => {
        const selectedPrefecture = prefectureSelect.value;
        citySelect.innerHTML = '<option value="">読込中...</option>';
        citySelect.disabled = true;
        if (selectedPrefecture) {
            try {
                // 市区町村取得APIは引き続き利用できます
                const url = `https://geoapi.heartrails.com/api/json?method=getCities&prefecture=${encodeURIComponent(selectedPrefecture)}`;
                const response = await fetch(url);
                const data = await response.json();
                const cities = data.response.location.map(loc => loc.city).sort();
                
                citySelect.innerHTML = '<option value="">市区町村を選択</option>';
                cities.forEach(city => {
                    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
                });
                citySelect.disabled = false;
            } catch (error) {
                console.error('City fetch error:', error);
                citySelect.innerHTML = '<option value="">取得エラー</option>';
            }
        }
    });
}

/**
 * Google検索へのリンクボタンを中央寄せで表示
 */
function searchHospitals() {
    const prefecture = document.getElementById('prefecture-select').value;
    const city = document.getElementById('city-select').value;
    const department = document.getElementById('department-select').value;
    
    if (!prefecture || !city || !department) {
        alert('すべての項目を選択してください。');
        return;
    }
    
    const resultsDiv = document.getElementById('hospital-results');
    
    // Google検索用の検索クエリ（キーワード）を作成
    const searchQuery = `${prefecture} ${city} ${department} 病院`;
    // Google検索用のURLを組み立てる
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    // 結果表示エリアを表示し、内容を更新
    resultsDiv.style.display = 'block';
    resultsDiv.className = 'result-box';
    
    // ボタン風に整形（中央寄せ、テキストも中央）
    resultsDiv.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
            <a href="${googleSearchUrl}" target="_blank" rel="noopener noreferrer"
                style="
                    display: inline-block;
                    text-align: center;
                    padding: 12px 28px;
                    font-size: 1.1em;
                    font-weight: bold;
                    background-color: #4285F4;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                    box-shadow: 0 2px 6px rgba(66,133,244,0.15);
                    transition: background 0.2s;
                    margin: 0 auto;
                "
                onmouseover="this.style.backgroundColor='#3367d6'"
                onmouseout="this.style.backgroundColor='#4285F4'"
            >
                「${searchQuery}」のGoogle検索結果を見る
            </a>
        </div>
    `;
}