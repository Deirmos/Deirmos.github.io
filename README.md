# LoliBox — сайт

Одностраничный статичный сайт приложения LoliBox: скачивание установщика,
скриншоты, возможности, донат через Boosty и FAQ.

Без сборки и зависимостей: чистые HTML, CSS и JS. Установщик на сайте не
хранится — кнопки ведут на GitHub Releases.

## Структура

```
index.html            главная страница
404.html              страница «не найдено»
styles.css            все стили
script.js             версия с GitHub, вкладки скриншотов, лайтбокс, копирование SHA
favicon.ico
robots.txt
sitemap.xml
_headers              заголовки безопасности и кеширования для Cloudflare Pages
assets/
  logo.png            иконка приложения
  branch.png          декоративная ветка
  og-image.png        картинка для соцсетей (1200×630)
  apple-touch-icon.png
  fonts/              Manrope (woff2, кириллица + латиница)
  screenshots/        шесть реальных скриншотов приложения
```

## Локальный просмотр

Из папки сайта:

```powershell
python -m http.server 8787
```

Откройте `http://127.0.0.1:8787/`. Через `file://` страница тоже
откроется, но запрос версии к GitHub API может не сработать.

## Публикация на Cloudflare Pages

Нужен бесплатный аккаунт Cloudflare: <https://dash.cloudflare.com/sign-up>.

### Вариант 1 — загрузка папки (быстрее всего)

1. Войдите в Cloudflare Dashboard.
2. Слева: **Workers & Pages** → **Create** → вкладка **Pages** →
   **Upload assets**.
3. Название проекта: `lolibox` (тогда адрес будет
   `https://lolibox.pages.dev`).
4. Перетащите **содержимое** папки `C:\Users\Deimon\code\LoliBox_Website`
   в окно загрузки. Важно: не саму папку, а файлы внутри — `index.html`
   должен оказаться в корне.
5. **Deploy site**. Через несколько секунд сайт будет доступен.

Ограничение: при каждом обновлении сайта нужно загружать файлы заново
(старые заменяются, если имена совпадают).

### Вариант 2 — через Git (автодеплой)

1. Создайте пустой репозиторий на GitHub, например `LoliBox-site`.
2. В папке сайта:
   ```powershell
   git init
   git add .
   git commit -m "site: initial"
   git branch -M main
   git remote add origin https://github.com/Deirmos/LoliBox-site.git
   git push -u origin main
   ```
3. В Cloudflare: **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → выберите репозиторий.
4. Настройки сборки:
   - Framework preset: **None**
   - Build command: оставить пустым
   - Build output directory: `/`
5. **Save and Deploy**. Дальше каждый `git push` в `main` будет
   обновлять сайт автоматически.

### Свой домен

В проекте Pages: **Custom domains** → **Set up a custom domain** →
введите домен и следуйте подсказкам. Если домен уже добавлен в Cloudflare,
DNS-запись создастся сама. HTTPS включается автоматически.

## Что обновлять при новом релизе

Кнопки скачивания уже умеют подхватывать последний релиз через GitHub API
(`/releases/latest`), поэтому обычно ничего менять не нужно. API-ответ
кешируется в браузере на 6 часов; если API недоступен, используется
статическая ссылка из HTML.

Статический фолбэк продублирован в трёх местах `index.html`:

```
https://github.com/Deirmos/LoliBox/releases/download/v1.0.10/LoliBox-Setup-1.0.10.exe
```

При выпуске новой версии обновите эти ссылки (поиск по `releases/download`)
и, если нужно, версию и SHA-256 в футере:

- `data-version` — версия в шапке (несколько мест);
- `data-size` — размер установщика;
- `data-sha` и `data-sha-version` — контрольная сумма.

Если версия из API отличается от `STATIC_VERSION` в `script.js`, блок с
SHA-256 автоматически скрывается, чтобы не показывать устаревший хеш.

## Если поменялся адрес сайта

Сейчас в метаданных указан `https://lolibox.pages.dev`. Если проект на
Cloudflare называется иначе или вы подключили свой домен, замените адрес в:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`;
- `sitemap.xml`;
- `robots.txt` (строка `Sitemap:`).

## Заголовки безопасности

Файл `_headers` включает CSP, запрет встраивания во фреймы и кеширование
ассетов на год. Если включите **Cloudflare Web Analytics**, добавьте в CSP:

- `script-src` → `https://static.cloudflareinsights.com`
- `connect-src` → `https://cloudflareinsights.com`

Иначе аналитика не загрузится.

## Донат

Ссылка на Boosty: `https://boosty.to/de1mon`. Встречается в шапке,
блоке поддержки и футере. На сайте указано, что пожертвования
добровольные и ничего не разблокируют.
