// ==UserScript==
// @name         Gemini 對話紀錄匯出工具 (下載TXT版)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  在 Gemini 頁面右下角新增一個「匯出」按鈕，一鍵將對話內容儲存成 .txt 檔案。
// @author       You (Based on your provided code)
// @match        https://gemini.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 新增功能：將文字內容作為檔案下載 ---
    function downloadAsTxt(text, filename) {
        // 建立一個 Blob 物件 (可以想像成一個暫時的檔案)
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
        // 建立一個隱藏的下載連結
        const link = document.createElement("a");
        // 為這個暫時的檔案建立一個 URL
        const url = URL.createObjectURL(blob);
        link.href = url;
        // 設定下載的檔名
        link.download = filename;
        // 將連結加到頁面上 (這是為了相容 Firefox)
        document.body.appendChild(link);
        // 模擬點擊連結來觸發下載
        link.click();
        // 清理用過的連結和 URL，釋放記憶體
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // --- 核心的匯出邏輯 ---
    function exportConversation() {
        let result = { "final_content": "", "auto_filename": "" };
        let gemName = "Gemini";
        const firstModelNameElement = document.querySelector('.bot-name-text');
        if (firstModelNameElement) { gemName = firstModelNameElement.innerText.trim(); }

        let title = "";
        const titleElement = document.querySelector('.conversation-title');
        if (titleElement) {
            title = titleElement.innerText.trim();
        } else {
            const today = new Date();
            title = `對話紀錄_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        }

        result.auto_filename = `${gemName}-${title}.txt`;
        const turns = document.querySelectorAll('.conversation-container');
        let conversationText = "";
        turns.forEach(turn => {
            const userQueryElement = turn.querySelector('user-query .query-text');
            if (userQueryElement) { conversationText += "你：\n" + userQueryElement.innerText.trim() + "\n\n"; }
            const modelResponseElement = turn.querySelector('model-response .markdown');
            const modelNameElement = turn.querySelector('model-response .bot-name-text');
            if (modelResponseElement) {
                const modelNameInText = modelNameElement ? `${modelNameElement.innerText.trim()}` : gemName;
                conversationText += modelNameInText + "：\n" + modelResponseElement.innerText.trim() + "\n\n";
                conversationText += "--------------------\n\n";
            }
        });

        result.final_content = `標題: ${title}\n模型: ${gemName}\n\n${conversationText}`;

        // 如果有內容，就觸發下載，否則跳出提示
        if (conversationText.trim() !== "") {
            downloadAsTxt(result.final_content, result.auto_filename);
        } else {
            alert('找不到任何對話內容可以擷取。');
        }
    }

    // --- 在頁面上建立並顯示一個按鈕 (與之前相同) ---
    function addButtonToPage() {
        if (document.getElementById('gemini-export-button')) return;
        const exportButton = document.createElement('button');
        exportButton.id = 'gemini-export-button';
        exportButton.innerText = '匯出';
        Object.assign(exportButton.style, {
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            zIndex: '9999',
            backgroundColor: '#1A73E8',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '12px 18px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        });
        exportButton.addEventListener('click', exportConversation);
        document.body.appendChild(exportButton);
    }

    // 定時器確保按鈕能被成功加上 (與之前相同)
    setInterval(addButtonToPage, 1000);

})();
