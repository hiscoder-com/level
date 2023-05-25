<div id="top"></div>

<br />
<div align="center">
  <a href="https://github.com/texttree/v-cana">
    <img src="images/logo.jpg" alt="Logo" width="80" height="80">
  </a>

<h1 align="center">Рабочий процесс департамента разработки</h1>

  <p align="center">
    <a href="https://github.com/texttree/v-cana/issues#workspaces/v-cana-project-620deae51595a40010a913fe/board">Zenhub Workspaces</a>
  </p>
</div>

<br>
<h2 align="center">Подготовка к спринту</h2>
<h4 align="center">Взаимодействие с владельцем продукта</h4>
<h4 align="center">Владелец продукта / Product Owner (PO)</h4>
<br>

- Новые issues создаются и добавляются в столбце <span style="font-weight:bold">New issues</span>
- <span style="font-weight:bold">Planned - Needs Definition</span> - здесь карточки, которые нужно сформулировать в конкретные issues. Если issue получается очень большая, то разбиваем ёё на небольшие issue так, чтобы на их выполнение уходило не больше недели. Создаём <span style="font-weight:bold">Epic</span> и группируем связанные issue в этом Epic 
- Поместите issue либо Epic в колонку <span style="font-weight:bold">Product Backlog</span> после завершения определения. Четко определенная issue будет включать в себя описание требования, ключевые результаты/определение выполненного, макеты, если нужно
- Расставить карточки по порядку приоритета, что самое важное – вверх. Можно обсудить с командой


> Примечание:
>
> Спринт длится 2 недели. Определяем что мы будем делать: исправлять ошибки, добавлять новые функции, или все вместе.
><br>

<br>
<h4 align="center">Разработчик / Developer (DEV)</h4>
<h4 align="center">Начало работы над issue</h4>
<br>

- Сначала проверьте, нет ли <span style="font-weight:bold">Pull Request, Issues</span>, которые назначены вам, они в приоритете
- Выберите одну, или несколько задач из <span style="font-weight:bold">Product Backlog</span>
- Проверьте что задача четко определена
- Перенесите карточку либо карточки в <span style="font-weight:bold">Sprint Backlog</span>
- Назначьте себя исполнителем issue
- Перенесите карточку в <span style="font-weight:bold">In Progress</span>
- Создайте новую ветвь от текущей рабочей ветви (develop)
- Решите issue
- Во время работы над issue старайтесь фиксировать (коммитить) небольшие изменения, и давать им понятные названия
- Создайте <span style="font-weight:bold">PR</span> для <span style="font-weight:bold">feature-ветки</span> в <span style="font-weight:bold">develop</span>
- При создании PR необходимо <span style="font-weight:bold">коротко описать проделанную работу</span> в <span style="font-weight:bold">Description</span>
- Убедитесь, что PR связан с соответствующей рассматриваемой issue
- Убедитесь, что для проверки PR, назначено как минимум <span style="font-weight:bold">2 Reviewers</span>. Уведомите Reviewers о том, что им необходимо проверить PR
- Проведите ручную проверку кода, чтобы убедиться, что нет простых ошибок, таких как оставшиеся комментарии и console.log()
- При создании PR карточка автоматически перемещается в <span style="font-weight:bold">Review/QA</span>
- Если сделана последняя задача из <span style="font-weight:bold">Epic</span> то перенесите  <span style="font-weight:bold">Epic</span> в <span style="font-weight:bold">Review/QA</span>
- Если есть замечания по коду от Reviewers, вы получите комментарии по недостаткам кода
- Как только получаете два одобрения, подтверждаете запрос на слияние веток (<span style="font-weight:bold">merge pull request</span>)
- После слияния веток удалите ветку, над которой вы работали
- Перенесите карточку в <span style="font-weight:bold">Done</span>
- <span style="font-weight:bold">По окончании Sprint Review</span> перенесите карточку в <span style="font-weight:bold">Closed</span>

> Примечание:
>
> По окончании спринта делать release в ветку master
> <br>

<br>
<h4 align="center">Правильное именование веток</h4>
<br>

  <h5 align="center" style="font-weight:bold">{type}-{name}-{number}</h5>
<br>

где <span style="font-weight:bold">type</span> - тип ветви (feature, fix)
    <span style="font-weight:bold">name</span> - псевдоним разработчика, работающего над ветвью 
    <span style="font-weight:bold">number</span> - номер прикрепленного issue GitHub

Например, <span style="font-weight:bold">feature-john-34</span>

> Примечание:
>
> Если над проектом идёт командная работа, то при создании ветви необходимо указывать псевдоним разработчика, работающего над ветвью. В случае, если над ветвью работают несколько разработчиков, псевдоним не указывают. Этого правила надо также придерживаться в случае, если вы один работаете над проектом (<span style="font-weight:bold">feature-12</span>)
> <br>

<br>
<h4 align="center">Как исправлять ошибки</h4>
<br>

- Убедитесь, что шаги для воспроизведения ошибки ясны и точны
- Если ошибка критичная, то делаем <span style="font-weight:bold">hotfix</span> ветку от master, проходим все шаги; если все в порядке, то публикуем в master и в develop
- Если ошибка не критичная, то работаем по обычной схеме

<br>
<h4 align="center">Проверка PR</h4>
<br>

- Не допускать закомментированных кусков кода, console.log()
- <a href="#changelog">Changelog</a> и version в package.json надо обновить (<a href="#sermver">sermver</a>)
- Стараться придерживаться <a href="#codestyle">codestyle</a>. Если есть какие-то добавления, замечания - дополнять ими стандарт оформления кода
- Не забывать про документацию. Если внесены изменения в UI/UX, отметить это в документации, обновить скриншоты

<br>
<h2 id="sermver" align="center">Семантическое версионирование 2.0.0 (sermver)</h2>
<br>

Учитывая номер версии <span style="font-weight:bold">{major}.{minor}.{patch}</span>, следует увеличивать:

- <span style="font-weight:bold">major</span>-версию, когда сделаны обратно несовместимые изменения API
- <span style="font-weight:bold">minor</span>-версию, когда вы добавляете новую функциональность, не нарушая обратной совместимости
- <span style="font-weight:bold">patch</span>-версию, когда вы делаете обратно совместимые исправления

Семантическое версионирование также поддерживает и дополнительные части, идущие после патч версии. Например, там могут быть метки о том что это предварительный релиз или какой-то конкретный билд. Например: 1.2.3-beta.1, 1.2.3+abc123 или 1.2.3-beta.1+abc123 — обратите внимание что билд отделяется + (плюс), а наименование предварительного релиза - (дефис). Данные дополнительные указатели говорят о том, что релиз не стабильный, и в нём могут как всё поменять, так и вовсе удалить, либо добавить совершенной новый функционал в будущем.

Для подробного ознакомления с семантическим версионированием перейдите на страницу <a href="https://semver.org/lang/ru/">Semantic Versioning</a>

<br>
<h2 id="changelog" align="center">Журнализация изменений проекта (Changelog)</h2>
<br>

Все заметные изменения необходимо задокументировать в этом файле

#### Changelog

##### [0.1.0] - 2022-04-15

##### Added (for new features)
  - заголовок изменения
##### Changed (for changes in existing functionality)
  - заголовок изменения
##### Fixed (for any bug fixes)
  - заголовок изменения
##### Remove 
  - заголовок изменения
##### Deprecated (for soon-to-be removed features)
  - заголовок изменения
##### Security (in case of vulnerabilities)
  - заголовок изменения

<br>
<h2 id="codestyle" align="center">Правила организации кода проекта (codestyle)</h2>
<h4 align="center">Поддержка читаемости кода</h4>
<br>

- В коде должны быть понятные имена для переменных
- Выносить дублируемые куски кода в файл helper.js, который находится в корне проекта
- Стараться создавать файлы, код которых не превышает  100 строк
- Искать возможность вынести код в <span style="font-weight:bold">RCL</span>, или расширить существующую библиотеку
- Использовать <span style="font-weight:bold">hooks</span> для того чтобы оптимизировать приложение
- Не делать слишком перегруженный код с множеством <span style="font-weight:bold">if/else</span>
- После себя оставлять код чуточку чище и лучше
- Если кусок кода сложен для понимания - надо добавить комментарии в формате <a href="#jsdoc">jsdocs</a>

<h4 align="center">Форматирование кода</h4>
<br>

Для форматирования кода в проекте настроен eslint и prettier.

<br>
<h4 align="center">Деплой</h4>
<br>

Для деплоя настроены экшены.\
Деплой делается в netlify.

<br>
<h4 align="center">Структура папок и файлов</h4>
<br>

Единственными конкретными папками Next.js являются папки pages, public и styles
```
- components
    - Appbar.js
- pages
    - api
        - getUser.js
    - _app.js
    - index.js
- public
    - favicon.ico
    - vercel.svg
- styles
    - globals.css
- utils
    - hooks.js
    - supabaseClient.js
- CHANGELOG.md

- .env.local.example

- helper.js

- workflow.md

```

**components** - Здесь находятся компоненты приложения, которые переиспользуются на страницах

**pages** - Это компоненты React. Каждый файл — это страница, а каждая страница — это компонент React. 

**_app.js** - Это пользовательский компонент, который находится в папке страниц. Next.js использует этот компонент для инициализации страниц

**index.js** - Это страница, которая отображается, когда пользователь посещает корень приложения

**api** - Здесь находятся маршруты API (API routes) и сопоставляются с конечной точкой

<br>
<h4 align="center">Порядок импорта</h4>
<br>

Импорт стараемся группировать.
 - React
 - Next
 - сторонние контексты/компоненты/хуки
 - наши контексты/компоненты/хуки
 - наши константы/конфиги/хэлперы
 - картинки/иконки

 Например

```javascript
import { useState, useEffect, useRef } from 'react'

import Head from 'next/head'

import { useRouter } from 'next/router'

import Layout from '../components/Layout'

import VcanaLogo from '../public/vcana-logo.svg'
```

<br>
<h4 align="center">Порядок написания классов в Tailwind CSS</h4>
<br>

 - Макет
 - Флексбокс и Сетка
 - Интервал
 - Размеры
 - Типография
 - Фоны
 - Границы
 - Эффекты
 - Фильтры
 - Переходы и анимация

 Например

```javascript
className="custom-class group absolute flex justify-center pt-0 w-1/4 sm:w-1/3 md:w-1/2 text-xl text-slate-100 bg-orange-500 border-r-2 border-stone-800 shadow-md cursor-pointer hover:text-gray-100 hover:bg-blue-500"
```

<br>
<h2 align="center">Справочник</h2>
<br>

**Scrum** - методология управления проектами. 

**Kanban** - это метод, в основе которого лежит система вытягивания (pull system) производства, то есть, ограничение на количество незавершенной работы (work-in-process). Здесь все устроено так, чтобы застоявшиеся issue легко было отследить и перераспределить внутри команды. Это позволяет обнаруживать операционные проблемы и мотивировать сотрудников к улучшениям.

**Pipeline**  - колонки доски, которые служат для разбиения этапов работы над issue

**Issue** - задача, созданная в репозитории или в ZenHub. Обладает свойствами:
- **Labels** - ярлыки, помогающие классифицировать issue, для каждой issue можно поставить один или несколько ярлыков
- **Milestones** - фазы проекта, позволяет соотносить issue с фазами в которых они должны быть реализованы
- **Estimates** - оценка трудоемкости issue (измеряется в story points). Без данного показателя невозможно использовать диаграммы ZenHub
- **Assignees** - исполнители issue
- **Dependencies** - зависимости. Позволяет определить те issue, которые зависят от исполнения других

**Pull Request (PR)** - это запрос на интеграцию изменений из одной ветки в другую

**Reviewer** - обозреватель запроса на интеграцию изменений из одной ветки в другую

**Bug** - ошибки в системе. issue с данным лейблом имеют наивысший приоритет и должны быть взяты в работу первыми.

**Feature** - новая функциональность

**fix** - Если вы работаете над исправлением ошибок проекта, то ветвь начинается со слова fix

**Refactoring** - issue, связанные с корректировкой ранее написанного кода

**WIP** - issue, находящиеся в работе

**Deploy** — это процедура переноса сайта на сервер

<div id="jsdoc"></div>

**JSDoc** — генератор документации в HTML-формате из комментариев исходного кода на JavaScript

**New Issues**
Этот Pipeline является отправной точкой для новых issues. Любой из команды может создать issue в любое время и знать, что благодаря этому процессу она будет видна всем.

**Icebox**
issues с низким приоритетом, которые не будут нужны в ближайшее время

**Epics**
 это тема работы, которая содержит несколько issues. Эпики — это лучший способ сгруппировать связанные issues в более крупные цели, охватывающие спринты

**Planned - Needs Definition**
issues, которые нужно рассмотреть и оценить. Если issue получается очень большой, то превращаем карточку в Epic

**Product Backlog**
Предстоящие issues, которые были рассмотрены, оценены и расставлены по приоритетам сверху вниз

**Sprint Backlog**
issues, готовые к работе в спринте, с приоритетом сверху донизу.

**In Progress**
issues, над которыми сейчас работает команда

**Review/QA**
issues, которые открыты для тестирования. Код завершен, ожидается отзыв

**Done**
issues протестированы и готовы к развертыванию в рабочей среде



<!-- <li>Во время <span style="font-weight:bold">Sprint Review</span> показываете что сделали; если все в порядке, то команда решает, делать релиз или нет</li> -->
<!-- <li>Если делаем релиз, то делаем слияние веток <span style="font-weight:bold">develop</span> и <span style="font-weight:bold">master</span></li> -->
