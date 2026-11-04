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
_headers              заголовки для Cloudflare Pages (GitHub Pages их игнорирует)
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

## Публикация на GitHub Pages

Сайт раздаётся из репозитория `Deirmos/Deirmos.github.io` как user site.
Адрес: <https://deirmos.github.io/>.

Pages включён в настройках репозитория: **Settings → Pages → Build and
deployment → Source: Deploy from a branch**, ветка `main`, папка
`/ (root)`. Отдельная сборка не нужна — файлы отдаются как есть.

Обновление: `git push` в `main`, Pages пересоберёт сайт за минуту.

### Свой домен

**Settings → Pages → Custom domain** → введите домен → **Save**.
У регистратора создайте CNAME на `deirmos.github.io` (для `www`) или
A-записи на IP GitHub Pages (для корневого домена). HTTPS включится
автоматически после проверки DNS.

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

Сейчас в метаданных указан `https://deirmos.github.io`. Если адрес
изменится (свой домен, переименование репозитория), замените его в:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`;
- `sitemap.xml`;
- `robots.txt` (строка `Sitemap:`).

## Заголовки безопасности

Файл `_headers` предназначен для Cloudflare Pages; GitHub Pages его
игнорирует, поэтому CSP и `X-Frame-Options` на GitHub Pages не отдаются.
Если понадобятся заголовки — нужен свой сервер/прокси.

## Донат

Ссылка на Boosty: `https://boosty.to/de1mon`. Встречается в шапке,
блоке поддержки и футере. На сайте указано, что пожертвования
добровольные и ничего не разблокируют.
