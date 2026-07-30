// ================= SHARED UI COMPONENTS (Toast + Modals) =================
function showToast(message) {
    let existing = document.getElementById('app-toast');
    if (existing) existing.remove();

    let toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-16 left-1/2 transform -translate-x-1/2 z-[9999] bg-[#0b1121]/90 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-black/50 text-sm font-bold tracking-wide w-max opacity-0 translate-y-4 transition-all duration-300';
    toast.innerText = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-4');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function showConfirm(title, message, confirmText, onConfirm, iconType = 'delete') {
    let existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    let iconHtml = '';
    let iconBgColorClass = 'bg-red-100 dark:bg-red-900/30 text-red-500';
    let actionBtnColorClass = 'bg-red-500 hover:bg-red-600 shadow-red-500/30';
    let customInlineStyle = '';

    if (iconType === 'exit') {
        iconHtml = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h3a2 2 0 0 1 2 2v1m-5 13h3a2 2 0 0 0 2-2v-1M4.425 19.428l6 1.8A2 2 0 0 0 13 19.312V4.688a2 2 0 0 0-2.575-1.916l-6 1.8A2 2 0 0 0 3 6.488v11.024a2 2 0 0 0 1.425 1.916zM9.001 12H9m7 0h5m0 0-2-2m2 2-2 2"></path></svg>`;
    } else if (iconType === 'update') {
        iconHtml = `<img src="img/au_smart_hub.png" class="w-20 h-13 object-contain rounded-xl shadow-sm">`;
        iconBgColorClass = 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30';
        actionBtnColorClass = 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30';
        customInlineStyle = 'style="background-color: #eff6ff !important;"';
    } else {
        iconHtml = `<svg width="28" height="28" viewBox="0 0 280 280" fill="currentColor"><path d="M235.732,66.214l-28.006-13.301l1.452-3.057c6.354-13.379,0.639-29.434-12.74-35.789L172.316,2.611 c-6.48-3.079-13.771-3.447-20.532-1.042c-6.76,2.406-12.178,7.301-15.256,13.782l-1.452,3.057L107.07,5.106 c-14.653-6.958-32.239-0.698-39.2,13.955L60.7,34.155c-1.138,2.396-1.277,5.146-0.388,7.644c0.89,2.499,2.735,4.542,5.131,5.68 l74.218,35.25h-98.18c-2.797,0-5.465,1.171-7.358,3.229c-1.894,2.059-2.839,4.815-2.607,7.602l13.143,157.706 c1.53,18.362,17.162,32.745,35.588,32.745h73.54c18.425,0,34.057-14.383,35.587-32.745l11.618-139.408l28.205,13.396 c1.385,0.658,2.845,0.969,4.283,0.969c3.74,0,7.328-2.108,9.04-5.712l7.169-15.093C256.646,90.761,250.386,73.175,235.732,66.214z M154.594,23.931c0.786-1.655,2.17-2.905,3.896-3.521c1.729-0.614,3.59-0.521,5.245,0.267l24.121,11.455 c3.418,1.624,4.878,5.726,3.255,9.144l-1.452,3.057l-36.518-17.344L154.594,23.931z M169.441,249.604 c-0.673,8.077-7.55,14.405-15.655,14.405h-73.54c-8.106,0-14.983-6.328-15.656-14.405L52.35,102.728h129.332L169.441,249.604z M231.62,96.835l-2.878,6.06L83.057,33.701l2.879-6.061c2.229-4.695,7.863-6.698,12.554-4.469l128.661,61.108 C231.845,86.509,233.85,92.142,231.62,96.835z"/></svg>`;
    }

    let modal = document.createElement('div');
    modal.id = 'custom-confirm-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';

    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5 mx-auto ${iconBgColorClass}" ${customInlineStyle}>
                ${iconHtml}
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">${title}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-7 text-center leading-relaxed">${message}</p>
            <div class="flex gap-3">
                <button id="confirm-cancel-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">Cancel</button>
                <button id="confirm-ok-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg transition active:scale-95 ${actionBtnColorClass}">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });

    const close = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.remove(), 200);
    };

    document.getElementById('confirm-cancel-btn').onclick = close;
    document.getElementById('confirm-ok-btn').onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };
}

function showInputModal(title, placeholder, initialValue, confirmText, onConfirm, iconType = 'user') {
    let existing = document.getElementById('custom-input-modal');
    if (existing) existing.remove();

    let modal = document.createElement('div');
    modal.id = 'custom-input-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-200';

    let safeInitial = initialValue ? escapeHtml(initialValue) : "";

    let iconSvg = '';
    if (iconType === 'book') {
        iconSvg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.633c.14-.056.308-.118.503-.181A9.77 9.77 0 0 1 7.5 6a9.77 9.77 0 0 1 2.997.452c.195.063.363.125.503.181v10.88A11.817 11.817 0 0 0 7.5 17c-1.46 0-2.649.248-3.5.513V6.633zm8-1.748a9.257 9.257 0 0 0-.888-.337A11.769 11.769 0 0 0 7.5 4c-1.526 0-2.755.271-3.612.548a8.889 8.889 0 0 0-1.001.389 5.905 5.905 0 0 0-.357.18l-.025.014-.009.005-.003.002h-.001c-.002.002-.247.147-.002.002A1 1 0 0 0 2 6v13a1 1 0 0 0 1.51.86l-.005.003h.001l.002-.001.001-.001.037-.02c.037-.02.098-.05.182-.09.17-.078.43-.188.775-.3A9.77 9.77 0 0 1 7.5 19a9.77 9.77 0 0 1 2.997.451 6.9 6.9 0 0 1 .775.3 3.976 3.976 0 0 1 .223.112m0 0h-.001l-.002-.001-.001-.001c.314.185.704.185 1.018 0l.037-.02c.037-.02.098-.05.182-.09a6.9 6.9 0 0 1 .775-.3A9.77 9.77 0 0 1 16.5 19a9.77 9.77 0 0 1 2.997.451 6.9 6.9 0 0 1 .775.3 3.976 3.976 0 0 1 .219.11A1 1 0 0 0 22 19V6a1 1 0 0 0-.49-.86l-.002-.001h-.001l-.003-.003-.01-.005-.024-.014a5.883 5.883 0 0 0-.357-.18 8.897 8.897 0 0 0-1-.389A11.769 11.769 0 0 0 16.5 4c-1.525 0-2.755.271-3.612.548a9.112 9.112 0 0 0-.888.337m8 1.748v10.88A11.817 11.817 0 0 0 16.5 17c-1.46 0-2.649.248-3.5.513V6.633c.14-.056.308-.118.503-.181A9.77 9.77 0 0 1 16.5 6a9.77 9.77 0 0 1 2.997.452c.195.063.363.125.503.181zm.49.228l.005.002h-.001l-.003-.002zm0 13l.004.002-.002-.002" /></svg>`;
    } else {
        iconSvg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }

    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl transform scale-95 transition-transform duration-200 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-5 mx-auto">
                ${iconSvg}
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">${title}</h3>
            <input type="text" id="modal-input-field" autocomplete="off" class="w-full p-3.5 rounded-xl border-2 bg-black/5 text-gray-800 dark:bg-black/20 dark:text-white border-transparent focus:border-blue-500 outline-none mb-6 transition-colors text-center font-bold text-lg" placeholder="${placeholder}" value="${safeInitial}">
            <div class="flex gap-3">
                <button id="input-cancel-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition active:scale-95">Cancel</button>
                <button id="input-ok-btn" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition active:scale-95">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    let inputField = document.getElementById('modal-input-field');

    setTimeout(() => {
        inputField.focus();
        inputField.setSelectionRange(safeInitial.length, safeInitial.length);
    }, 100);

    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });

    const close = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.remove(), 200);
    };

    document.getElementById('input-cancel-btn').onclick = close;

    const submit = () => {
        let val = inputField.value.trim();
        if (val !== "") {
            close();
            if (onConfirm) onConfirm(val);
        } else {
            inputField.style.borderColor = "#ef4444";
            setTimeout(() => inputField.style.borderColor = "transparent", 400);
        }
    };

    document.getElementById('input-ok-btn').onclick = submit;
    inputField.onkeypress = (e) => {
        if (e.key === 'Enter') submit();
    };
}