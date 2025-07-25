// ==UserScript==
// @name         Gemini 對話紀錄匯出工具 (頁面按鈕版)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  在 Gemini 頁面右下角新增一個「匯出」按鈕，一鍵擷取對話內容並複製到剪貼簿。
// @author       You (Based on your provided code)
// @match        https://gemini.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // 核心的匯出邏輯 (與之前相同)
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

        if (conversationText.trim() !== "") {
            GM_setClipboard(result.final_content);
            alert('對話紀錄已成功複製到剪貼簿！\n\n建議檔名：\n' + result.auto_filename);
        } else {
            alert('找不到任何對話內容可以擷取。');
        }
    }

    // --- 新增功能：在頁面上建立並顯示一個按鈕 ---
    function addButtonToPage() {
        // 如果按鈕已經存在，就不用再建立了
        if (document.getElementById('gemini-export-button')) return;

        const exportButton = document.createElement('button');
        exportButton.id = 'gemini-export-button';
        exportButton.innerText = '匯出';
        
        // 設定按鈕樣式，讓它浮動在右下角
        Object.assign(exportButton.style, {
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            zIndex: '9999',
            backgroundColor: '#1A73E8', // Google 藍
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '12px 18px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        });

        // 幫按鈕加上點擊事件
        exportButton.addEventListener('click', exportConversation);

        // 將按鈕加到網頁上
        document.body.appendChild(exportButton);
    }

    // Gemini 頁面內容是動態載入的，所以我們用一個定時器來確保按鈕能被成功加上
    // 每秒檢查一次，如果頁面刷新了或切換了，按鈕也能重新出現
    setInterval(addButtonToPage, 1000);

})();
