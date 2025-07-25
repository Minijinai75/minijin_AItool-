// ==UserScript==
// @name         Gemini 對話紀錄匯出工具
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  一鍵擷取並格式化 Google Gemini 網頁版的對話內容，並複製到剪貼簿。
// @author       You (Based on your provided code)
// @match        https://gemini.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // 將您的腳本邏輯包裝在一個函數中
    function exportConversation() {
        // 建立一個物件來儲存最終結果
        let result = {
            "final_content": "",
            "auto_filename": ""
        };

        // --- 1. 提取 Gem 的名稱和對話標題 ---
        let gemName = "Gemini"; // 預設名稱
        const firstModelNameElement = document.querySelector('.bot-name-text');
        if (firstModelNameElement) {
            gemName = firstModelNameElement.innerText.trim();
        }

        let title = "";
        const titleElement = document.querySelector('.conversation-title');
        if (titleElement) {
            title = titleElement.innerText.trim();
        } else {
            // 如果找不到標題，使用日期作為後備
            const today = new Date();
            title = `對話紀錄_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
        }

        // --- 2. 自動組合檔名 ---
        result.auto_filename = `${gemName}-${title}.txt`;

        // --- 3. 提取並格式化對話內容 ---
        const turns = document.querySelectorAll('.conversation-container');
        let conversationText = "";
        turns.forEach(turn => {
            const userQueryElement = turn.querySelector('user-query .query-text');
            if (userQueryElement) {
                conversationText += "你：\n" + userQueryElement.innerText.trim() + "\n\n";
            }

            const modelResponseElement = turn.querySelector('model-response .markdown');
            const modelNameElement = turn.querySelector('model-response .bot-name-text');

            if (modelResponseElement) {
                // 如果在回應中找到機器人名稱，就用那個名稱，否則用預設的
                const modelNameInText = modelNameElement ? `${modelNameElement.innerText.trim()}` : gemName;
                conversationText += modelNameInText + "：\n" + modelResponseElement.innerText.trim() + "\n\n";
                conversationText += "--------------------\n\n";
            }
        });

        // --- 4. 組合最終的檔案內容 (開頭加上標題行) ---
        result.final_content = `標題: ${title}\n模型: ${gemName}\n\n${conversationText}`;


        // --- 5. 將整理好的內容複製到剪貼簿，並給予提示 ---
        if (result.final_content) {
            GM_setClipboard(result.final_content);
            alert('對話紀錄已成功複製到剪貼簿！\n\n建議檔名：\n' + result.auto_filename);
        } else {
            alert('找不到任何對話內容可以擷取。');
        }
    }

    // --- 註冊一個選單命令，讓你可以手動觸發這個腳本 ---
    // 你可以點擊瀏覽器右上角的 Tampermonkey 圖示，然後點擊 "Gemini 對話紀錄匯出工具" 來執行它。
    GM_registerMenuCommand('匯出 Gemini 對話紀錄', exportConversation);

})();
