// ==UserScript==
// @name         ChatGPT 對話紀錄匯出工具 (下載TXT版)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  在 ChatGPT 頁面右下角新增一個「匯出」按鈕，一鍵將對話內容儲存成 .txt 檔案。
// @author       You (Based on your provided code)
// @match        https://chatgpt.com/*
// @icon         https://chat.openai.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 功能：將文字內容作為檔案下載 ---
    function downloadAsFile(text, filename) {
        // 已將 type 修改為 'text/plain' 以符合 TXT 格式
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // --- 核心的匯出邏輯 (改編自您提供的版本) ---
    function exportChatGptConversation() {
        try {
            // 1. 強化標題擷取，並提供預設值
            let title = "ChatGPT 對話紀錄"; // 先設定一個預設標題
            if (document.title && document.title.trim() !== "") {
                title = document.title.trim(); // 如果網頁標題存在且不為空，就使用它
            }

            // 2. 建立對話內文
            let conversationBody = "";
            const messages = document.querySelectorAll('div[data-message-author-role]');
            if (messages.length === 0) {
                // 如果找不到對話，直接提示使用者
                alert("找不到任何對話內容。\n請確認您在一個有效的對話頁面中。");
                return; // 中斷執行
            }

            messages.forEach(message => {
                const role = message.getAttribute('data-message-author-role');
                let contentText = '';

                // 根據角色尋找對應的內容區塊
                let contentDiv = null;
                if (role === 'assistant') {
                    contentDiv = message.querySelector('div.prose, div.markdown, div[class*="result-streaming"]');
                } else if (role === 'user') {
                    // 使用者的提問通常在這個區塊
                    contentDiv = message.querySelector('div[data-message-id]');
                }

                if (contentDiv) {
                    contentText = contentDiv.innerText.trim();
                }

                // 如果用精準選擇器找不到，就用比較籠統的方式再試一次
                if (!contentText) {
                    let fullMessageText = message.innerText.trim();
                    // 移除一些常見的、不需要的按鈕文字
                    const junkTexts = ["Copy", "Regenerate response", "Edit", "Share"];
                    junkTexts.forEach(junk => {
                        fullMessageText = fullMessageText.replace(new RegExp(junk, 'g'), '');
                    });
                    contentText = fullMessageText.trim();
                }

                if (contentText) {
                    let speaker = (role === 'user') ? "## 🗣️ 你:\n" : "## 🤖 ChatGPT:\n";
                    conversationBody += speaker + contentText + "\n\n---\n\n";
                }
            });

            // 3. 組合最終的檔案內容，確保標題在最前面
            const finalFileContent = "# " + title + "\n\n---\n\n" + conversationBody;
            // 已將副檔名修改為 .txt
            const filename = title + ".txt";

            // 4. 觸發下載
            downloadAsFile(finalFileContent, filename);

        } catch (e) {
            // 5. 黑盒子錯誤處理 (將 completion 改為 alert)
            let errorMessage = "腳本執行時發生未預期的錯誤！\n";
            errorMessage += "這不是您的錯，請回報以下資訊以進行修正：\n\n";
            errorMessage += "------------------------------------\n";
            errorMessage += "錯誤類型: " + e.name + "\n";
            errorMessage += "錯誤訊息: " + e.message + "\n";
            errorMessage += "錯誤堆疊: \n" + e.stack + "\n";
            errorMessage += "------------------------------------\n";
            
            alert(errorMessage);
        }
    }

    // --- 在頁面上建立並顯示一個按鈕 ---
    function addButtonToPage() {
        if (document.getElementById('chatgpt-export-button')) return;
        const exportButton = document.createElement('button');
        exportButton.id = 'chatgpt-export-button';
        exportButton.innerText = '匯出';
        Object.assign(exportButton.style, {
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            zIndex: '9999',
            backgroundColor: '#10A37F', // ChatGPT 綠
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '12px 18px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        });
        exportButton.addEventListener('click', exportChatGptConversation);
        document.body.appendChild(exportButton);
    }

    // 定時器確保按鈕能被成功加上
    setInterval(addButtonToPage, 1000);

})();
