// =================================================================
// 健康記録カレンダー機能
// =================================================================

function initHealthCalendar() {
    document.getElementById('record-date').value = new Date().toISOString().split('T')[0];

    // 時・分セレクトを初期化
    let hourSel = document.getElementById('record-hour');
    let minuteSel = document.getElementById('record-minute');
    // 「時」「分」ラベルも追加
    let hourLabel = document.getElementById('record-hour-label');
    let minuteLabel = document.getElementById('record-minute-label');
    if (!hourSel) {
        hourSel = document.createElement('select');
        hourSel.id = 'record-hour';
        hourSel.style.width = 'auto';
        hourSel.style.display = 'inline-block';
        document.getElementById('record-date').after(hourSel);

        hourLabel = document.createElement('span');
        hourLabel.id = 'record-hour-label';
        hourLabel.textContent = '時';
        hourSel.after(hourLabel);
    }
    if (!minuteSel) {
        minuteSel = document.createElement('select');
        minuteSel.id = 'record-minute';
        minuteSel.style.width = 'auto';
        minuteSel.style.display = 'inline-block';
        hourLabel.after(minuteSel);

        minuteLabel = document.createElement('span');
        minuteLabel.id = 'record-minute-label';
        minuteLabel.textContent = '分';
        minuteSel.after(minuteLabel);
    }
    hourSel.innerHTML = '';
    minuteSel.innerHTML = '';
    for (let h = 0; h <= 23; h++) {
        const opt = document.createElement('option');
        opt.value = String(h).padStart(2, '0');
        opt.textContent = String(h).padStart(2, '0');
        hourSel.appendChild(opt);
    }
    for (let m = 0; m < 60; m += 10) {
        const opt = document.createElement('option');
        opt.value = String(m).padStart(2, '0');
        opt.textContent = String(m).padStart(2, '0');
        minuteSel.appendChild(opt);
    }
    hourSel.value = new Date().getHours().toString().padStart(2, '0');
    minuteSel.value = (Math.floor(new Date().getMinutes() / 10) * 10).toString().padStart(2, '0');

    updateCalendarDisplay();
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    updateCalendarDisplay();
}

function addHealthRecord() {
    const dateStr = document.getElementById('record-date').value;
    const hourSel = document.getElementById('record-hour');
    const minuteSel = document.getElementById('record-minute');
    const recordText = document.getElementById('record-text').value.trim();

    if (!dateStr) {
        alert('日付を入力してください。');
        return;
    }
    if (!recordText) {
        alert('記録内容を入力してください。');
        return;
    }
    const hour = hourSel ? hourSel.value : '00';
    const minute = minuteSel ? minuteSel.value : '00';
    const timeStr = `${hour}:${minute}`;
    const fullRecord = `${timeStr} ${recordText}`;

    if (!healthRecords[dateStr]) {
        healthRecords[dateStr] = [];
    }
    healthRecords[dateStr].push(fullRecord);

    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    document.getElementById('record-text').value = '';
    alert('記録を追加しました。');
    updateCalendarDisplay();
}

function updateCalendarDisplay() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth() + 1;

    document.getElementById('month-display').textContent = `${year}年 ${month}月`;
    document.getElementById('records-title').textContent = `${year}年${month}月の記録`;

    const recordsDisplay = document.getElementById('records-display');
    recordsDisplay.innerHTML = '';

    // カレンダー表示
    const calendarTable = document.createElement('table');
    calendarTable.style.width = '100%';
    calendarTable.style.marginBottom = '16px';
    calendarTable.style.borderCollapse = 'collapse';

    // 曜日ヘッダー
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const headerRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.padding = '4px';
        th.style.background = '#f0f0f0';
        headerRow.appendChild(th);
    });
    calendarTable.appendChild(headerRow);

    // 月初日・末日
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let date = 1;
    let started = false;

    for (let i = 0; i < 6; i++) { // 最大6週
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            cell.style.textAlign = 'center';
            cell.style.height = '32px';
            cell.style.cursor = 'pointer';
            cell.style.border = '1px solid #eee';
            if (!started && j === firstDay.getDay()) started = true;
            if (started && date <= lastDay.getDate()) {
                cell.textContent = date;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                if (healthRecords[dateStr] && healthRecords[dateStr].length > 0) {
                    cell.style.background = '#e0f7fa';
                    cell.style.fontWeight = 'bold';
                }
                cell.onclick = () => {
                    document.getElementById('record-date').value = dateStr;
                    document.getElementById('record-text').focus();
                    updateCalendarDisplay();
                };
                // 選択中の日付をハイライト
                if (document.getElementById('record-date').value === dateStr) {
                    cell.style.background = '#b3e5fc';
                }
                date++;
            } else {
                cell.textContent = '';
                cell.style.background = '#fafafa';
                cell.style.cursor = 'default';
            }
            row.appendChild(cell);
        }
        calendarTable.appendChild(row);
        if (date > lastDay.getDate()) break;
    }
    recordsDisplay.appendChild(calendarTable);

    // 選択日の記録一覧
    const selectedDate = document.getElementById('record-date').value;
    const selectedRecords = healthRecords[selectedDate] || [];
    const selectedHeader = document.createElement('div');
    selectedHeader.className = 'date-header';
    selectedHeader.textContent = `【${selectedDate}】の記録`;
    recordsDisplay.appendChild(selectedHeader);

    // 表形式で記録を表示
    if (selectedRecords.length > 0) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '8px';
        table.style.tableLayout = 'fixed';

        // ヘッダー
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['時間', '内容', '編集', '削除'].forEach((title, idx) => {
            const th = document.createElement('th');
            th.textContent = title;
            th.style.background = '#f0f0f0';
            th.style.padding = '4px';
            th.style.border = '1px solid #ddd';
            if (idx === 0) {
                th.style.width = '60px'; // 時間
                th.style.textAlign = 'center';
            } else if (idx === 1) {
                th.style.width = 'auto'; // 内容
            } else {
                th.style.width = '60px'; // 編集・削除
                th.style.textAlign = 'center';
            }
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        // 本体
        const tbody = document.createElement('tbody');
        selectedRecords.forEach((record, idx) => {
            let timePart = '';
            let textPart = record;
            const match = record.match(/^(\d{2}:\d{2})\s(.+)$/);
            if (match) {
                timePart = match[1];
                textPart = match[2];
            }

            const tr = document.createElement('tr');
            tr.style.verticalAlign = 'middle';

            // 時間セル
            const timeTd = document.createElement('td');
            timeTd.textContent = timePart;
            timeTd.style.border = '1px solid #ddd';
            timeTd.style.padding = '4px';
            timeTd.style.textAlign = 'center';
            timeTd.style.width = '60px';
            timeTd.style.whiteSpace = 'nowrap';

            // 内容セル
            const contentTd = document.createElement('td');
            contentTd.style.border = '1px solid #ddd';
            contentTd.style.padding = '4px';
            contentTd.style.wordBreak = 'break-all';
            contentTd.style.width = 'auto';

            // 編集セル
            const editTd = document.createElement('td');
            editTd.style.border = '1px solid #ddd';
            editTd.style.padding = '2px';
            editTd.style.textAlign = 'center';
            editTd.style.width = '60px';

            // 削除セル
            const deleteTd = document.createElement('td');
            deleteTd.style.border = '1px solid #ddd';
            deleteTd.style.padding = '2px';
            deleteTd.style.textAlign = 'center';
            deleteTd.style.width = '60px';

            // 編集・保存・キャンセルボタン
            let isEditing = false;
            const showEditMode = () => {
                isEditing = true;
                contentTd.innerHTML = '';
                editTd.innerHTML = '';
                deleteTd.innerHTML = '';

                // 時間編集
                const hourSel = document.createElement('select');
                hourSel.style.fontSize = '11px';
                hourSel.style.height = '22px';
                for (let h = 0; h <= 23; h++) {
                    const opt = document.createElement('option');
                    opt.value = String(h).padStart(2, '0');
                    opt.textContent = String(h).padStart(2, '0');
                    hourSel.appendChild(opt);
                }
                const minuteSel = document.createElement('select');
                minuteSel.style.fontSize = '11px';
                minuteSel.style.height = '22px';
                for (let m = 0; m < 60; m += 10) {
                    const opt = document.createElement('option');
                    opt.value = String(m).padStart(2, '0');
                    opt.textContent = String(m).padStart(2, '0');
                    minuteSel.appendChild(opt);
                }
                if (timePart) {
                    const [h, m] = timePart.split(':');
                    hourSel.value = h;
                    minuteSel.value = m;
                }

                // 内容編集
                const input = document.createElement('input');
                input.type = 'text';
                input.value = textPart;
                input.style.fontSize = '11px';
                input.style.height = '22px';
                input.style.width = '90%';
                input.style.marginRight = '4px';

                contentTd.appendChild(hourSel);
                contentTd.appendChild(document.createTextNode('時'));
                contentTd.appendChild(minuteSel);
                contentTd.appendChild(document.createTextNode('分 '));
                contentTd.appendChild(input);

                // 保存ボタン
                const saveBtn = document.createElement('button');
                saveBtn.textContent = '保存';
                saveBtn.style.fontSize = '11px';
                saveBtn.style.padding = '2px 6px';
                saveBtn.style.height = '22px';
                saveBtn.onclick = () => {
                    const newText = input.value.trim();
                    const newHour = hourSel.value;
                    const newMinute = minuteSel.value;
                    if (newText) {
                        healthRecords[selectedDate][idx] = `${newHour}:${newMinute} ${newText}`;
                        localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
                        updateCalendarDisplay();
                    }
                };
                editTd.appendChild(saveBtn);

                // キャンセルボタン
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'キャンセル';
                cancelBtn.style.fontSize = '11px';
                cancelBtn.style.padding = '2px 6px';
                cancelBtn.style.height = '22px';
                cancelBtn.onclick = () => {
                    updateCalendarDisplay();
                };
                deleteTd.appendChild(cancelBtn);
            };

            // 通常表示
            if (!isEditing) {
                contentTd.textContent = textPart;

                // 編集ボタン
                const editBtn = document.createElement('button');
                editBtn.textContent = '編集';
                editBtn.style.fontSize = '11px';
                editBtn.style.padding = '2px 6px';
                editBtn.style.height = '22px';
                editBtn.onclick = showEditMode;
                editTd.appendChild(editBtn);

                // 削除ボタン
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '削除';
                deleteBtn.style.fontSize = '11px';
                deleteBtn.style.padding = '2px 6px';
                deleteBtn.style.height = '22px';
                deleteBtn.onclick = () => {
                    if (confirm('この記録を削除しますか？')) {
                        healthRecords[selectedDate].splice(idx, 1);
                        if (healthRecords[selectedDate].length === 0) {
                            delete healthRecords[selectedDate];
                        }
                        localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
                        updateCalendarDisplay();
                    }
                };
                deleteTd.appendChild(deleteBtn);
            }

            tr.appendChild(timeTd);
            tr.appendChild(contentTd);
            tr.appendChild(editTd);
            tr.appendChild(deleteTd);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        recordsDisplay.appendChild(table);
    } else {
        const noRecord = document.createElement('div');
        noRecord.textContent = 'この日の記録はありません。';
        recordsDisplay.appendChild(noRecord);
    }

    // JSで強制的に下部に余白用の要素を追加する
    const spacer = document.createElement('div');
    // 【修正】高さを3倍の120pxに
    spacer.style.height = '120px'; 
    recordsDisplay.appendChild(spacer);
}