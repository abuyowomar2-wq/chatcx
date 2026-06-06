(function () {
    'use strict';

    var ChatCXWidget = {
        settings: null,
        iframe: null,
        isOpen: false,
        conversationId: null,

        init: function (settings) {
            this.settings = settings;
            this.createTrigger();
            this.createIframe();
        },

        createTrigger: function () {
            var self = this;
            var trigger = document.createElement('button');
            trigger.id = 'chatcx-trigger';
            trigger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
            trigger.style.cssText = 'position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:' + (this.settings.primary_color || '#0ea5e9') + ';border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:999999;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;';
            trigger.onmouseenter = function () { trigger.style.transform = 'scale(1.1)'; };
            trigger.onmouseleave = function () { trigger.style.transform = 'scale(1)'; };
            trigger.onclick = function () { self.toggle(); };
            document.body.appendChild(trigger);
            this.trigger = trigger;
        },

        createIframe: function () {
            var self = this;
            this.iframe = document.createElement('div');
            this.iframe.id = 'chatcx-container';
            this.iframe.innerHTML = this.getWidgetHTML();
            this.iframe.style.cssText = 'position:fixed;bottom:90px;right:20px;width:360px;height:560px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:999998;display:none;background:white;font-family:Tajawal,sans-serif;';
            document.body.appendChild(this.iframe);
        },

        getWidgetHTML: function () {
            var s = this.settings;
            return '<div style="display:flex;flex-direction:column;height:100%;direction:rtl;">' +
                '<div style="background:' + (s.primary_color || '#0ea5e9') + ';color:white;padding:16px;text-align:center;">' +
                '<h3 style="margin:0;font-size:16px;">' + (s.title || 'تحدث معنا') + '</h3>' +
                '<p style="margin:4px 0 0;font-size:12px;opacity:0.9;">' + (s.subtitle || 'نحن هنا لمساعدتك') + '</p>' +
                '</div>' +
                '<div id="chatcx-messages" style="flex:1;overflow-y:auto;padding:12px;background:#f8fafc;">' +
                '<div style="text-align:center;color:#94a3b8;font-size:13px;margin-top:40px;">' +
                (s.welcome_message || 'مرحباً! كيف يمكننا مساعدتك اليوم؟') +
                '</div>' +
                '</div>' +
                '<div style="padding:12px;border-top:1px solid #e2e8f0;background:white;">' +
                '<div style="display:flex;gap:8px;">' +
                '<input id="chatcx-input" type="text" placeholder="اكتب رسالتك..." style="flex:1;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;font-family:inherit;">' +
                '<button id="chatcx-send" style="padding:10px 16px;background:' + (s.primary_color || '#0ea5e9') + ';color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;">إرسال</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        },

        toggle: function () {
            this.isOpen = !this.isOpen;
            this.iframe.style.display = this.isOpen ? 'block' : 'none';
            if (this.isOpen) {
                var self = this;
                setTimeout(function () {
                    var input = document.getElementById('chatcx-input');
                    if (input) input.focus();
                }, 300);
            }
        },

        sendMessage: function () {
            var self = this;
            var input = document.getElementById('chatcx-input');
            var message = input ? input.value.trim() : '';
            if (!message) return;

            var messagesDiv = document.getElementById('chatcx-messages');
            this.addMessage(message, 'user');
            input.value = '';

            var data = {
                tenant_id: this.settings.tenant_id,
                message: message
            };

            if (this.conversationId) {
                data.conversation_id = this.conversationId;
            } else {
                data.name = 'زائر';
            }

            var endpoint = this.settings.api_url + (this.conversationId ? '/message' : '/start');

            var xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    if (res.conversation_id) {
                        self.conversationId = res.conversation_id;
                    }
                    if (res.auto_reply) {
                        setTimeout(function () {
                            self.addMessage(res.auto_reply, 'agent');
                        }, 1000);
                    }
                }
            };
            xhr.send(JSON.stringify(data));
        },

        addMessage: function (text, type) {
            var messagesDiv = document.getElementById('chatcx-messages');
            if (!messagesDiv) return;

            var msg = document.createElement('div');
            msg.style.cssText = 'margin:8px 0;display:flex;' + (type === 'user' ? 'justify-content:flex-start;' : 'justify-content:flex-end;');
            msg.innerHTML = '<div style="max-width:80%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.4;' +
                (type === 'user'
                    ? 'background:#e2e8f0;color:#1e293b;border-bottom-right-radius:4px;'
                    : 'background:' + (this.settings.primary_color || '#0ea5e9') + ';color:white;border-bottom-left-radius:4px;') +
                '">' + text + '</div>';
            messagesDiv.appendChild(msg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    };

    window.ChatCXWidget = ChatCXWidget;

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var input = document.getElementById('chatcx-input');
            if (input && document.activeElement === input) {
                e.preventDefault();
                ChatCXWidget.sendMessage();
            }
        }
    });

    document.addEventListener('click', function (e) {
        if (e.target.id === 'chatcx-send') {
            ChatCXWidget.sendMessage();
        }
    });
})();
