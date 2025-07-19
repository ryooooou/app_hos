// =================================================================
// 症状診断機能（利用者がAPIキーを入力するバージョン）
// =================================================================

function saveApiKey() {
    const key = document.getElementById('gemini-api-key').value.trim();
    if (key) {
        localStorage.setItem('geminiApiKey', key);
        alert('APIキーを保存しました');
    }
}

function loadApiKey() {
    const key = localStorage.getItem('geminiApiKey') || '';
    document.getElementById('gemini-api-key').value = key;
}

async function diagnoseSymptoms() {
    const apiKey = document.getElementById('gemini-api-key').value.trim();
    if (!apiKey) {
        alert('Gemini APIキーを入力してください。');
        return;
    }
    const symptoms = document.getElementById('symptom-text').value.trim();
    if (!symptoms) {
        alert('警告: 症状を入力してください。');
        return;
    }

    const resultDiv = document.getElementById('diagnosis-result');
    const diagnoseBtn = document.getElementById('diagnose-btn');
    
    resultDiv.style.display = 'block';
    resultDiv.className = 'result-box loading-message';
    resultDiv.textContent = '診断中... AIが考えています。';
    diagnoseBtn.disabled = true;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    // 【大幅修正】プロンプトをJSON出力を厳密に要求するように変更
    const prompt = `以下の症状に基づき、最も適切な診療科を3つ候補として挙げ、それぞれの理由を簡潔に説明してください。回答は必ず以下のJSON形式で、他のテキストは一切含めないでください。

症状: ${symptoms}

回答JSON形式:
{
  "recommendations": [
    {"department": "診療科名1", "reason": "理由1"},
    {"department": "診療科名2", "reason": "理由2"},
    {"department": "診療科名3", "reason": "理由3"}
  ],
  "summary": "総合的なアドバイスや注意点をここに記述してください。"
}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ "contents": [{ "parts": [{ "text": prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`APIエラー (コード: ${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        let aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiResponseText) {
            resultDiv.className = 'result-box';
            
            // AIの回答がマークダウンのコードブロック( ```json ... ``` )で囲まれている場合も考慮
            const jsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                aiResponseText = jsonMatch[1];
            }

            try {
                // JSONデータをパースしてオブジェクトに変換
                const diagnosisData = JSON.parse(aiResponseText);
                const recommendations = diagnosisData.recommendations || [];
                const summary = diagnosisData.summary || "診断結果の詳細は上記をご確認ください。";

                let htmlContent = '';
                
                // 診療科と理由を表示
                recommendations.forEach((rec, index) => {
                    if(rec.department && rec.reason) {
                        htmlContent += `<p><strong>${index + 1}. ${rec.department}</strong>: ${rec.reason}</p>`;
                    }
                });
                
                // 総合的なアドバイスを表示
                if(summary) {
                    htmlContent += `<p style="margin-top: 20px;"><strong>【アドバイス】</strong><br>${summary}</p>`;
                }
                
                // 病院検索ボタンを生成
                const foundDepartments = recommendations.map(rec => rec.department).filter(Boolean);
                if (foundDepartments.length > 0) {
                    htmlContent += `<hr style="margin: 20px 0;">`;
                    htmlContent += `<p style="font-weight: bold; text-align: center;">提案された診療科で病院を探す:</p>`;
                    htmlContent += `<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 10px;">`;
                    foundDepartments.forEach(dep => {
                        // `departments`配列に含まれるかチェック
                        if (departments.includes(dep)) {
                            htmlContent += `<button class="btn-secondary" onclick="goToHospitalSearch('${dep}')">${dep} で病院を探す</button>`;
                        }
                    });
                    htmlContent += `</div>`;
                }

                resultDiv.innerHTML = htmlContent;

            } catch (jsonError) {
                // JSONのパースに失敗した場合、生のテキストをそのまま表示する（保険）
                console.error("JSON parse error:", jsonError);
                resultDiv.textContent = "AIからの回答形式が予期せぬものだったため、結果を整形できませんでした。以下に生の回答を表示します。\n\n" + aiResponseText;
            }

        } else {
            throw new Error('AIの回答が生成されませんでした。');
        }
    } catch (error) {
        resultDiv.className = 'result-box error-message';
        resultDiv.textContent = `エラーが発生しました: ${error.message}`;
    } finally {
        diagnoseBtn.disabled = false;
    }
}

/**
 * 病院検索画面に遷移し、指定された診療科を自動で選択する
 * @param {string} departmentName - 選択したい診療科名
 */
function goToHospitalSearch(departmentName) {
    showScreen('hospital-search');
    const departmentSelect = document.getElementById('department-select');
    if (departmentSelect) {
        departmentSelect.value = departmentName;
    }
}

// ページ読み込み時にAPIキーを自動入力
window.addEventListener('DOMContentLoaded', loadApiKey);