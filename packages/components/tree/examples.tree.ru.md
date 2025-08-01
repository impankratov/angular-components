### Список с деревом и текстовым поиском по нему

Если введен поисковый запрос — в дереве показываются только элементы:

- которые соответствуют поисковому запросу;
- находятся внутри нелистовых элементов, соответствующих запросу;
- являются родительскими по отношению к найденным в поисковом запросе.

Если найденный элемент является нелистовым — он отображается в развернутом виде. Если содержащиеся внутри него нелистовые элементы соответствуют поисковому запросу или ведут к нему, то они отображаются развернутыми (иначе — свернутыми). Все элементы, которые являются родительскими по отношению к найденному элементу, отображаются развернутыми.

Текст, совпавший с поисковым запросом в названии элемента, выделяется жирным.

<!-- example(tree-custom-filtering) -->

### Фильтрация с поиском + выбранные

<!-- example(tree-checked-filtering) -->

### Варианты множественного выбора элементов

Эти варианты поведения доступны и для [tree select](/ru/components/tree-select).

#### Дочерние подкатегории

**Когда используется**

Используется тогда, когда вложенные элементы — подмножество родительских.

Например, когда есть иерархический фильтр, и в нем есть категории товаров. Когда мы ищем в кофеварках и тостерах, то на самом деле мы ищем внутри мелкой кухонной бытовой техники, которая в свою очередь является подкатегорией бытовой техники в целом.

**Алгоритм работы**

<!-- cspell:ignore -ного -->

Алгоритм работы для такого три-селекта — привычная работа с 3-state-чекбоксом:

- Если выбраны все дети N-ного уровня, то их родитель (N-1) становится выбранным.
- Если не выбраны никакие элементы N-ного уровня, то их родитель (N-1) становится невыбранным.
- Если какие-то элементы N-ного уровня выбраны, а какие-то нет, то их родитель (N-1) становится выбранным.

**Как сохранить в модель и матчер селекта**

Идеальный вариант: Показывать в матчере селекта и сохранять в модели нужно минимальный набор элементов — элементы N-ного уровня, если они выбраны не все. И один элемент уровня N-1, если выбраны все элементы N-ного уровня.

Допустимый вариант: При выборе элемента уровня N-1 сохранять в модель все элементы уровня N (всех детей). Если существуют элементы уровня N+1, то и их тоже.

Расширение этого случая — кейс с привилегиями на папки / группы (вариант 3).

<!-- example(tree-descendants-subcategories) -->

#### Независимые элементы

Второй алгоритм работы дерева — независимые между собой уровни.

**Когда используется**

Все элементы между собой независимы, просто визуально объединены в дереве.

Например, в системе есть назначаемые пользователем теги и эти теги можно каким-то образом сгруппировать в папки и подпапки. Назначение объекту дочернего тега никак не означает, что должен быть назначен объект папка. И наоборот, назначение тега папки никак не влияет на назначение тега ребенка.

**Алгоритм работы**

Никакие галочки не влияют друг на друга.

**Как сохранить в модель и матчер селекта**

Сохраняются отмеченные галочки

<!-- example(tree-multiple-checkbox) -->

#### Права доступа

Третий вариант работы дерева это расширение варианта «Дочерние подкатегории»

**Когда используется**

Когда нужно назначить права на некоторые дерево объектов. При этом выполняются оба правила:

1. при выдаче прав доступа на родительский объект права назначаются и на дочерние элементы тоже.
2. важно сохранять явность выбора дочерних элементов, даже если родители выбраны. Например, сначала были выданы права на `группу 1.1`, потом были выданы права на группу 1. Если в системе важно, чтобы права на 1.1 были сохранены, то нужно применять этот алгоритм.

**Алгоритм работы**

Похож на вариант «Дочерние подкатегории», но есть одно ограничение.
При выборе родителя дочерние элементы не просто отмечаются, но и дизейблятся.
Сохраняется только то, что явно отмечено чекбоксами.

При этом, если был выбран какой-то элемент, а потом выбран его родитель, то соседи этого элемента будут выбраны и задизейблены, а тот, что был явно выбран не дизейблится. Тем самым он показывает, что на нем задано свое правило.
Если чекбокс с такого элемента снять, то он задизейблится. Чтобы вернуть ему явное задание, нужно будет снимать чекбокс родителя.

- Единичный не раскрывающийся узел
    - При выборе:
        - Выделяется синим, узел не блокируется.
    - При отмене выбора (деселект):
        - если родители не выбраны, то просто происходит деселект
        - если выбран любой родительский узел, происходит выбор и блокировка (становится серым)
- Раскрывающийся узел
    - При выборе:
        - все дочерние узлы, которые не выбраны, выбираются и блокируются (становятся серым).
        - если ребенок уже выбран, то ничего не происходит.
    - При отмене выбора (деселект):
        - если выбран любой родительский узел, происходит выбор и блокировка (становится серым)
        - если дочерний узел был выбран отдельно и выделен синим, то он остается нетронутым, а остальные дочерние узлы отменяют выбор (важно отметить, что некоторые заблокированные узлы могут быть внутри выбранных с помощью singleSelection)
        - Если дочерние узлы уровня +1 заблокированы, происходит отмена выбора и включение узла.
        - Если дочерний узел уровня +1 раскрывающийся, выполняется его рекурсивная проверка.
- Отличие от примера “**Дочерние подкатегории” :** Если выбраны все дочерние узлы, это не означает, что родительский узел автоматически выбирается.

**Как сохранить в модель и матчер селекта**

Сохраняются только отмеченные явно элементы. Задизейбленные не сохраняются.

<!-- example(tree-access-rights) -->

### Выбор и отметка

Клик по элементу выбирает его, обновляется информация в правой панели. Клик по чекбоксу отмечает элемент, но при этом информация в правой панели не меняется.

Списком можно также управлять и с клавиатуры. Клавиша Enter выбирает элемент и обновляет текст в правой панели, а Space ставит отметку. Выбор элемента меняется вместе с навигацией.

<!-- example(tree-select-and-mark) -->

### Выбор отдельно от фокуса

При навигации по списку выбранный элемент не меняется вместе с положением фокуса. Элемент можно выбрать по клику или по нажатию на клавишу Enter.

<!-- example(tree-selection-separate-from-focus) -->

### Раскрытие ветки по клику

По клику на элемент он становится выбранным, а также разворачивается первый уровень дочерних узлов.

<!-- example(tree-toggle-on-click) -->
