# Реестр событий аналитики

| Событие | Где вызывается | Параметры |
|---|---|---|
| cta_click | элементы с data-event в HTML; js/analytics.js | button_name, page_section |
| class_view | карточки форматов | class_format |
| class_calc | js/main.js → updateCalculator | class_format, people, total_price |
| slot_select | js/main.js → выбор слота | slot_date, slot_time, seats_left |
| gift_select | изменение типа сертификата | gift_type, gift_amount |
| gift_preview | js/main.js → updateGift | gift_type |
| promo_copy | кнопка промокода | promo_code |
| contact_click | телефон и e-mail | contact_type |
| messenger_click | ссылки мессенджеров | messenger |
| social_click | ссылки соцсетей | network, page_section |
| form_start | первое взаимодействие с формой | form_id |
| form_error | ошибка проверки формы | field_name, error_type |
| generate_lead | успешная демо-валидация формы | lead_type, lead_format |
| form_submit | успешная демо-валидация формы | form_id |
| gallery_view | открытие макета работы | photo_index |
| click | внешняя ссылка | link_url, outbound |
| file_download | ссылка на PDF | file_name, file_extension |
| video_play | событие play для video | video_title |

**Важно:** generate_lead в этой версии отражает успешное прохождение локальной формы, а не подтверждение Google Таблицы. До реального подключения Apps Script событие не следует трактовать как серверно подтверждённую заявку. Для production необходимо согласовать отправку consent и настройки аналитики.
