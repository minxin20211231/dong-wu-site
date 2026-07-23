// 工具箱／登島表單統一送出處理
// 綁定所有 form[data-integration="pending"]：驗證 → 送出中 → 成功／失敗，避免連點，
// 同一 source 的多個表單（hero + repeat）成功後一起收尾，避免使用者以為要重填。
// 本機（localhost）只模擬往返、絕不呼叫正式 Worker，杜絕在預覽時寫入正式名單／漏斗。

const WORKER_ENDPOINT = 'https://dongwu-subscribe.minxin20211231.workers.dev';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_LOCAL = ['localhost', '127.0.0.1', '0.0.0.0', ''].includes(location.hostname);

type MsgKind = 'error' | 'success' | '';

function setMsg(form: HTMLFormElement, text: string, kind: MsgKind) {
  let m = form.querySelector<HTMLElement>('.form-msg');
  if (!m) {
    m = document.createElement('p');
    m.className = 'form-msg';
    m.setAttribute('aria-live', 'polite');
    form.appendChild(m);
  }
  m.textContent = text; // textContent，不當 HTML 解析 → 使用者輸入不會造成 XSS
  m.dataset.kind = kind;
  m.hidden = !text;
}

// 同一 source 的所有表單一起進入完成狀態
function markDone(email: string, source: string, allForms: HTMLFormElement[]) {
  allForms
    .filter((f) => (f.dataset.event || 'unknown') === source)
    .forEach((f) => {
      f.dataset.state = 'done';
      f.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach(
        (el) => (el.disabled = true),
      );
      const btn = f.querySelector<HTMLButtonElement>('button');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '✓ 已送出';
      }
      // 預設句適用「送出後會寄信」的名單（如信件課）；純收名單的表單（如登島預約）
      // 用 data-success-msg 覆寫，不承諾不會立刻發生的信
      setMsg(f, f.dataset.successMsg || `送出成功，確認信會寄到 ${email}`, 'success');
    });
}

function bindForm(form: HTMLFormElement, allForms: HTMLFormElement[]) {
  if (form.dataset.formsBound) return;
  form.dataset.formsBound = '1';

  const source = form.dataset.event || 'unknown';
  const optInEvent = form.dataset.optInEvent || '';
  const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
  const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
  const questionInput = form.querySelector<HTMLTextAreaElement>('textarea[name="question"]');
  const optInBox = form.querySelector<HTMLInputElement>('input[type="checkbox"]');
  const button = form.querySelector<HTMLButtonElement>('button');
  if (!emailInput || !button) return;

  const originalLabel = button.textContent || '送出';

  const submit = async () => {
    if (form.dataset.state === 'sending' || form.dataset.state === 'done') return;

    const name = nameInput?.value.trim() || '';
    const email = emailInput.value.trim().toLowerCase();
    if (nameInput && !name) {
      setMsg(form, '先留下怎麼稱呼你', 'error');
      nameInput.focus();
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setMsg(form, 'Email 格式好像不太對，再檢查一下', 'error');
      emailInput.focus();
      return;
    }

    const optIns = optInEvent && optInBox?.checked ? [optInEvent] : [];
    const question = questionInput?.value.trim() || '';
    const payload = {
      email,
      name,
      source,
      ...(optIns.length ? { opt_ins: optIns } : {}),
      ...(question ? { question } : {}),
    };

    form.dataset.state = 'sending';
    button.disabled = true;
    button.textContent = '送出中…';
    setMsg(form, '', '');

    try {
      if (IS_LOCAL) {
        // 本機預覽：模擬往返，絕不寫正式名單／漏斗。email 含 "fail" 可測失敗態。
        console.warn('[resource-forms] localhost 模擬送出，未呼叫 Worker。payload =', payload);
        await new Promise((r) => setTimeout(r, 650));
        if (email.includes('fail')) throw new Error('simulated_error');
        markDone(email, source, allForms);
        return;
      }
      const res = await fetch(WORKER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        markDone(email, source, allForms);
      } else {
        throw new Error((data && data.error) || 'request_failed');
      }
    } catch (err) {
      form.dataset.state = 'idle';
      button.disabled = false;
      button.textContent = originalLabel;
      setMsg(form, '送出失敗了，請稍後再試一次', 'error');
    }
  };

  // button 為 type="submit" 時 form submit 會觸發；保留 click 作為保險
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void submit();
  });
  button.addEventListener('click', (e) => {
    if (button.type !== 'submit') {
      e.preventDefault();
      void submit();
    }
  });
}

function initForms() {
  const forms = Array.from(
    document.querySelectorAll<HTMLFormElement>('form[data-integration="pending"]'),
  );
  forms.forEach((form) => bindForm(form, forms));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForms);
} else {
  initForms();
}
