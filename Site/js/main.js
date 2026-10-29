/* Общие интерактивные элементы сайта */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(opened));
    toggle.textContent = opened ? '×' : '☰';
  });

  // Калькулятор мастер-классов.
  const format = document.querySelector('#class-format');
  const countOutput = document.querySelector('#people-output');
  const totalOutput = document.querySelector('#total-price');
  const note = document.querySelector('#calc-note');
  let people = 1;
  const prices = { wheel: 2900, date: 5200, handbuilding: 2400, course: 18000, corporate: 2400 };
  const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  function updateCalculator() {
    if (!format || !countOutput || !totalOutput) return;
    const type = format.value;
    const count = type === 'corporate' ? Math.max(6, people) : people;
    let total = type === 'date' ? prices.date * Math.ceil(count / 2) : type === 'course' ? prices.course * count : prices[type] * (type === 'corporate' ? count : count);
    totalOutput.textContent = money(total);
    countOutput.textContent = people;
    if (note) note.textContent = type === 'corporate' && people < 6
      ? `Минимальная оплата — за 6 гостей: ${money(14400)}.`
      : type === 'date' ? 'Стоимость указана за пару.' : type === 'course' ? 'Стоимость курса из 8 занятий для одного участника.' : 'В стоимость включены материалы и обжиг.';
    document.dispatchEvent(new CustomEvent('glina:class-calc', { detail: { format: type, people: count, total } }));
  }
  document.querySelector('#people-minus')?.addEventListener('click', () => { people = Math.max(1, people - 1); updateCalculator(); });
  document.querySelector('#people-plus')?.addEventListener('click', () => { people = Math.min(12, people + 1); updateCalculator(); });
  format?.addEventListener('change', updateCalculator);
  updateCalculator();

  // Расписание на 14 дней. Количество мест — демонстрационные данные из массива.
  const scheduleRoot = document.querySelector('#schedule-list');
  if (scheduleRoot) {
    const weekdayTimes = ['12:00', '15:00', '19:00'];
    const weekendTimes = ['11:00', '14:00', '17:00'];
    const slots = [];
    const now = new Date();
    for (let d = 0; d < 14; d++) {
      const date = new Date(now); date.setDate(now.getDate() + d);
      const times = [0, 6].includes(date.getDay()) ? weekendTimes : weekdayTimes;
      times.forEach((time, i) => slots.push({
        date: new Date(date), time,
        seats: ((d * 3 + i * 2 + 2) % 11), id: `${date.toISOString().slice(0,10)}-${time}`
      }));
    }
    const ruDate = d => new Intl.DateTimeFormat('ru-RU', { weekday:'long', day:'numeric', month:'long' }).format(d);
    let selected = null;
    function renderSchedule() {
      scheduleRoot.innerHTML = '';
      slots.forEach((slot, idx) => {
        let day = scheduleRoot.querySelector(`[data-day="${slot.date.toISOString().slice(0,10)}"]`);
        if (!day) {
          day = document.createElement('section'); day.className = 'schedule-day';
          day.dataset.day = slot.date.toISOString().slice(0,10);
          const h = document.createElement('h3'); h.innerHTML = `<span>${ruDate(slot.date)}</span><small>до 10 мест</small>`;
          day.appendChild(h);
          const list = document.createElement('div'); list.className = 'slot-list'; day.appendChild(list);
          scheduleRoot.appendChild(day);
        }
        const list = day.querySelector('.slot-list');
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'slot';
        btn.disabled = slot.seats === 0;
        btn.dataset.slotId = slot.id;
        btn.innerHTML = `${slot.time}<small>${slot.seats ? `${slot.seats} мест` : 'Нет мест'}</small>`;
        if (selected === slot.id) btn.classList.add('selected');
        btn.addEventListener('click', () => {
          selected = slot.id;
          document.querySelector('#selected-slot-label').textContent = `${ruDate(slot.date)}, ${slot.time}`;
          document.querySelector('#book-slot').disabled = false;
          renderSchedule();
          document.dispatchEvent(new CustomEvent('glina:slot-select', { detail: { date: slot.date.toISOString().slice(0,10), time: slot.time, seats_left: slot.seats } }));
        });
        list.appendChild(btn);
      });
    }
    renderSchedule();
    const peopleSelect = document.querySelector('#slot-people');
    function checkSeats() {
      const slot = slots.find(s => s.id === selected);
      const count = Number(peopleSelect.value);
      document.querySelector('#book-slot').disabled = !slot || count > slot.seats;
      document.querySelector('#selected-slot-label').textContent = slot
        ? `${ruDate(slot.date)}, ${slot.time} · ${slot.seats} свободных мест${count > slot.seats ? '. Уменьшите число гостей.' : ''}`
        : 'Выберите свободный слот в расписании.';
    }
    peopleSelect?.addEventListener('change', checkSeats);
    document.querySelector('#book-slot')?.addEventListener('click', () => {
      const slot = slots.find(s => s.id === selected);
      if (!slot || Number(peopleSelect.value) > slot.seats) return;
      sessionStorage.setItem('glina:selectedSlot', JSON.stringify({ date: slot.date.toISOString().slice(0,10), time: slot.time, people: peopleSelect.value }));
      location.href = 'contacts.html';
    });
  }

  // Предпросмотр подарочного сертификата.
  const giftType = document.querySelector('#gift-type');
  const recipient = document.querySelector('#recipient-name');
  const wish = document.querySelector('#gift-wish');
  const certRecipient = document.querySelector('#cert-recipient');
  const certDescription = document.querySelector('#cert-description');
  const certWish = document.querySelector('#cert-wish');
  const giftNames = { wheel:'Гончарный круг', date:'Свидание на круге', handbuilding:'Лепка руками', '2000':'Сертификат на 2 000 ₽', '3000':'Сертификат на 3 000 ₽', '5000':'Сертификат на 5 000 ₽' };
  function updateGift() {
    if (!giftType || !recipient || !wish) return;
    if (certRecipient) certRecipient.textContent = recipient.value.trim() || 'Ваше имя';
    if (certDescription) certDescription.textContent = giftNames[giftType.value];
    if (certWish) certWish.textContent = wish.value.trim() || 'С теплом и заботой';
    const nc = document.querySelector('#name-count'); if (nc) nc.textContent = `${recipient.value.length} / 30`;
    const wc = document.querySelector('#wish-count'); if (wc) wc.textContent = `${wish.value.length} / 80`;
    document.dispatchEvent(new CustomEvent('glina:gift-preview', { detail: { gift_type: giftType.value } }));
  }
  [giftType, recipient, wish].forEach(el => el?.addEventListener('input', updateGift));
  [giftType, recipient, wish].forEach(el => el?.addEventListener('change', updateGift));
  updateGift();
  document.querySelector('#gift-order')?.addEventListener('click', () => {
    sessionStorage.setItem('glina:leadType', 'gift');
    sessionStorage.setItem('glina:gift', JSON.stringify({ type: giftType.value, recipient: recipient.value, wish: wish.value }));
    location.href = 'contacts.html?type=gift';
  });
  document.querySelector('#copy-certificate')?.addEventListener('click', async () => {
    const text = `Подарочный сертификат «Глина»\nПолучатель: ${recipient.value}\nФормат: ${giftNames[giftType.value]}\nПожелание: ${wish.value}\nНомер предпросмотра: GL-2026-0001`;
    try { await navigator.clipboard.writeText(text); alert('Детали сертификата скопированы.'); }
    catch { alert(text); }
  });

  // Копирование промокода и просмотр работ.
  document.querySelector('#copy-promo')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('CLAY10'); document.querySelector('#promo-message').textContent = 'Промокод CLAY10 скопирован.'; }
    catch { document.querySelector('#promo-message').textContent = 'Ваш промокод: CLAY10'; }
    document.dispatchEvent(new CustomEvent('glina:promo-copy', { detail: { promo_code: 'CLAY10' } }));
  });
  const lightbox = document.querySelector('#lightbox');
  document.querySelectorAll('[data-gallery-index]').forEach(button => button.addEventListener('click', () => {
    if (!lightbox) return;
    lightbox.hidden = false;
    document.querySelector('#lightbox-caption').textContent = `Работа гостя · ${String(button.dataset.galleryIndex).padStart(2,'0')}`;
    document.dispatchEvent(new CustomEvent('glina:gallery-view', { detail: { photo_index: Number(button.dataset.galleryIndex) } }));
  }));
  document.querySelector('#lightbox-close')?.addEventListener('click', () => { lightbox.hidden = true; });
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.hidden = true; });

  // Форма: проверка полей, UTM-метки и демонстрационное сохранение заявки.
  const form = document.querySelector('#lead-form');
  if (form) {
    const params = new URLSearchParams(location.search);
    ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(key => {
      const value = params.get(key) || sessionStorage.getItem(`glina:${key}`) || '';
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = value;
      if (params.get(key)) sessionStorage.setItem(`glina:${key}`, value);
    });
    const slotData = JSON.parse(sessionStorage.getItem('glina:selectedSlot') || 'null');
    if (slotData) {
      const slotInput = form.querySelector('[name="slot"]');
      if (slotInput) slotInput.value = `${slotData.date}, ${slotData.time}`;
      const p = form.querySelector('[name="people"]'); if (p) p.value = slotData.people;
    }
    const qsType = params.get('type');
    if (qsType === 'gift' || sessionStorage.getItem('glina:leadType') === 'gift') {
      form.querySelector('[name="lead_type"]').value = 'gift';
      document.querySelector('#class-fields').hidden = true;
    }
    const giftData = JSON.parse(sessionStorage.getItem('glina:gift') || 'null');
    if (giftData) {
      form.querySelector('[name="class_format"]').value = giftData.type in {wheel:1,date:1,handbuilding:1,course:1,corporate:1} ? giftData.type : 'wheel';
    }
    form.addEventListener('input', e => {
      if (e.target.name) document.dispatchEvent(new CustomEvent('glina:form-start', { detail: { form_id: 'lead-form' } }));
    });
    form.addEventListener('change', e => {
      if (e.target.name === 'lead_type') {
        document.querySelector('#class-fields').hidden = e.target.value === 'gift';
        const slotInput = form.querySelector('[name="slot"]');
        if (e.target.value === 'gift') slotInput.value = '';
      }
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      const consent = form.querySelector('[name="consent"]');
      const phoneDigits = phone.value.replace(/\D/g,'');
      const errors = { name: name.value.trim().length < 2 ? 'Введите имя (не менее 2 символов).' : '',
        phone: !/^(7|8)?\d{10}$/.test(phoneDigits) ? 'Введите телефон: +7 и 10 цифр.' : '',
        email: email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? 'Проверьте формат e-mail.' : '',
        consent: !consent.checked ? 'Необходимо согласие на обработку данных.' : '' };
      Object.entries(errors).forEach(([key, message]) => {
        const field = form.querySelector(`[name="${key}"]`);
        const output = form.querySelector(`[data-error-for="${key}"]`);
        if (output) output.textContent = message;
        if (field) field.classList.toggle('invalid', Boolean(message));
        if (message) { valid = false; document.dispatchEvent(new CustomEvent('glina:form-error', { detail: { field_name: key, error_type: key === 'consent' ? 'required' : 'validation' } })); }
      });
      if (!valid) { document.querySelector('#form-alert').hidden = false; document.querySelector('#form-alert').textContent = 'Пожалуйста, проверьте поля, отмеченные сообщениями об ошибке.'; return; }
      const data = Object.fromEntries(new FormData(form).entries());
      data.request_id = `REQ-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
      data.created_at = new Date().toISOString();
      data.status = 'new';
      data.utm_source = data.utm_source || 'direct';
      data.utm_medium = data.utm_medium || 'none';
      data.utm_campaign = data.utm_campaign || 'not_set';
      data.utm_content = data.utm_content || 'not_set';
      // Демонстрационный режим: сохраняем заявку в этом браузере, без передачи на сервер.
      const leads = JSON.parse(localStorage.getItem('glina:demoLeads') || '[]');
      if (!leads.some(lead => lead.request_id === data.request_id)) leads.push(data);
      localStorage.setItem('glina:demoLeads', JSON.stringify(leads));
      sessionStorage.setItem('glina:lastRequest', data.request_id);
      document.dispatchEvent(new CustomEvent('glina:lead-success', { detail: { lead_type: data.lead_type, class_format: data.class_format } }));
      location.href = 'thanks.html';
    });
  }
  const thanksRequest = document.querySelector('#thanks-request');
  if (thanksRequest) thanksRequest.textContent = sessionStorage.getItem('glina:lastRequest') || 'REQ-DEMO';
});
