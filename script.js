// ключ доступа
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiOTAzNzYzODItMzlmNy00Njc5LWExNTEtNDQyYTQzYjNmMzNhIiwiU3RlYW1JZCI6IjE4MTQzODcwNzUiLCJuYmYiOjE3MzMxNDY3NDksImV4cCI6MTc2NDY4Mjc0OSwiaWF0IjoxNzMzMTQ2NzQ5LCJpc3MiOiJodHRwczovL2FwaS5zdHJhdHouY29tIn0.hum-bsjj37K5_QN1QtsgF2wn6a5GoeD-PE7BUzQaB6E';

// URL API Stratz
const API_URL = 'https://api.stratz.com/graphql';

// Справочник имен героев (будет заполняться динамически)
let heroNames = {};

// Словарь для сопоставления стандартных имен героев с именами для изображений
const heroImageMapping = {
    'Shadow Fiend': 'nevermore',
    'Anti-Mage': 'antimage',
    'Vengeful Spirit':'vengefulspirit',
    'Windranger':'windrunner',
    'Zeus':'zuus',
    'Queen of Pain': 'queenofpain',
    'Necrophos':'necrolyte',
    'Wraith King':'skeleton_king',
    'Clockwerk':'rattletrap',
    "Nature's Prophet":"furion",
    'Lifestealer':'life_stealer',
    'Doom':'doom_bringer',
    'Outworld Destroyer':'obsidian_destroyer',
    'Treant Protector':'treant',
    'Io':'wisp',
    'Centaur Warrunner':'centaur',
    'Magnus':'magnataur',
    'Timbersaw':'shredder',
    'Underlord':'abyssal_underlord',
};

// Функция для получения URL изображения для героя
function getHeroImageUrl(heroName) {
    const formattedName = heroImageMapping[heroName] || heroName.toLowerCase().replace(/\s+/g, '_');
    return `https://cdn.stratz.com/images/dota2/heroes/${formattedName}_horz.png`;
}

// Функция для получения списка героев
async function getHeroList() {
    const query = `
        query {
            constants {
                heroes {
                    id
                    displayName
                }
            }
        }
    `;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();

    if (!result.data || !result.data.constants || !result.data.constants.heroes) {
        throw new Error('Некорректный формат ответа API');
    }

    // Заполняем справочник heroNames
    result.data.constants.heroes.forEach(({ id, displayName }) => {
        heroNames[id] = displayName;
    });
}

// Хранилище весов героев
const heroWeights = {};

// Создание выпадающего списка с кнопками
function createHeroDropdown(index) {
    const container = document.createElement('div');
    container.className = 'hero-select-container';

    const label = document.createElement('label');
    label.textContent = `герой ${index + 1}: `;

    const select = document.createElement('select');
    select.className = 'hero-select';
    select.setAttribute('data-hero-index', index);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите героя';
    select.appendChild(defaultOption);

    // Кнопка для увеличения веса
    const weightButton = document.createElement('button');
    weightButton.textContent = 'Вес: 1';
    weightButton.style.padding = '5px 10px';
    weightButton.style.cursor = 'pointer';
    weightButton.style.backgroundColor = '#f0ad4e';
    weightButton.style.color = '#fff';
    weightButton.style.border = 'none';
    weightButton.style.borderRadius = '5px';
    weightButton.style.fontSize = '0.9rem';

    // Кнопка для сброса веса
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Сбросить вес';
    resetButton.style.padding = '5px 10px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.backgroundColor = '#5bc0de';
    resetButton.style.color = '#fff';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '5px';
    resetButton.style.fontSize = '0.9rem';
    resetButton.disabled = true; // По умолчанию кнопка отключена

    // Обработчик нажатия для увеличения веса
    weightButton.addEventListener('click', () => {
        const heroId = select.value;

        if (!heroId) {
            alert('Выберите героя перед увеличением веса.');
            return;
        }

        // Увеличиваем вес
        heroWeights[heroId] = (heroWeights[heroId] || 1) + 0.5;

        // Показываем вес и разблокируем кнопку сброса
        weightButton.textContent = `Вес: ${heroWeights[heroId]}`;
        resetButton.disabled = false;
    });

    // Обработчик нажатия для сброса веса
    resetButton.addEventListener('click', () => {
        const heroId = select.value;

        if (!heroId) {
            alert('Герой не выбран.');
            return;
        }

        resetHeroWeight(heroId, weightButton, resetButton);
    });

    container.appendChild(label);
    container.appendChild(select);
    container.appendChild(weightButton);
    container.appendChild(resetButton);

    return container;
}
// Функция для сброса веса героя
function resetHeroWeight(heroId, weightButton, resetButton) {
    heroWeights[heroId] = 1; // Сбрасываем вес героя
    weightButton.textContent = `Вес: 1`;
    resetButton.disabled = true; // Отключаем кнопку сброса
}

// Функция для заполнения выпадающих списков
function populateHeroDropdowns() {
    const heroSelectContainer = document.getElementById('enemy-hero-selects');
    heroSelectContainer.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const dropdown = createHeroDropdown(i);
        heroSelectContainer.appendChild(dropdown);
    }

    const selects = document.querySelectorAll('.hero-select');
    selects.forEach(select => {
        Object.entries(heroNames).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            select.appendChild(option);
        });
    });
}

// Сетка изображений героев
function createHeroImageGrid() {
    const gridContainer = document.getElementById('hero-image-grid');
    gridContainer.innerHTML = '';  // Очищаем текущую сетку

    Object.entries(heroNames).forEach(([id, name]) => {
        const img = document.createElement('img');
        img.src = getHeroImageUrl(name);
        img.alt = name;
        img.className = 'hero-image';
        img.addEventListener('click', () => selectHeroByImage(id));

        const imgContainer = document.createElement('div');
        imgContainer.className = 'hero-image-container';
        imgContainer.appendChild(img);
        gridContainer.appendChild(imgContainer);
    });
}

let currentHeroIndex = 0; // Отслеживаем индекс текущего заполняемого списка

function selectHeroByImage(heroId) {
    const selects = document.querySelectorAll('.hero-select');

    // Найти первый незаполненный список
    const emptySelect = Array.from(selects).find(select => select.value === '');

    if (emptySelect) {
        // Если есть незаполненное поле, заполняем его
        emptySelect.value = heroId;
    } else {
        // Если все заполнены, находим первый и перезаполняем его
        selects[0].value = heroId;

        // Сдвигаем значения остальных списков
        for (let i = 1; i < selects.length; i++) {
            selects[i - 1].value = selects[i].value;
        }

        // Последнему списку присваиваем выбранного героя
        selects[selects.length - 1].value = heroId;
    }
}



// Запрос для получения контрпиков одного героя
async function getCounterPicks(heroId) {
    const query = `
        query {
            heroStats {
                matchUp(
                    heroId: ${heroId},
                    bracketBasicIds: [LEGEND_ANCIENT, DIVINE_IMMORTAL],
                    orderBy: 4,
                    take: 125
                ) {
                    vs {
                        heroId2
                        synergy
                    }
                }
            }
        }
    `;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.data || !result.data.heroStats || !result.data.heroStats.matchUp) {
        throw new Error('Некорректный формат ответа API');
    }

    return result.data.heroStats.matchUp[0].vs.map(({ heroId2, synergy }) => ({
        heroId: heroId2,
        synergy: synergy
    }));
}

// Получение всех контрпиков для списка героев
async function getAllCounterPicksParallel(enemyHeroIds) {
    const counterPickScores = {};

    const allCounters = await Promise.all(enemyHeroIds.map(getCounterPicks));

    allCounters.forEach((counters, index) => {
        const heroId = enemyHeroIds[index];
        const weight = heroWeights[heroId] || 1; // Вес героя или 1 по умолчанию

        counters.forEach(({ heroId: counterHeroId, synergy }) => {
            if (synergy < 0) {
                if (!counterPickScores[counterHeroId]) {
                    counterPickScores[counterHeroId] = 0;
                }

                // Умножаем синергию на вес героя
                counterPickScores[counterHeroId] -= synergy * weight;
            }
        });
    });

    return counterPickScores;
}


// Поиск топ-20 героев с максимальной синергией
function findTopCounterPicks(counterPickScores) {
    return Object.entries(counterPickScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 20)
        .map(([heroId, synergy]) => ({
            heroId: Number(heroId),
            synergy: synergy
        }));
}

// Обработчик кнопки
document.getElementById("calculate-button").addEventListener("click", async () => {
  const selects = document.querySelectorAll('.hero-select');
  const enemyHeroIds = Array.from(selects)
      .map(select => parseInt(select.value))
      .filter(id => !isNaN(id));

  if (enemyHeroIds.length === 0) {
      document.getElementById("result").textContent = "Выберите хотя бы одного героя.";
      return;
  }

  try {
      const counterPickScores = await getAllCounterPicksParallel(enemyHeroIds);
      const topPicks = findTopCounterPicks(counterPickScores);

      // Очищаем старые результаты
      const resultContainer = document.getElementById("result");
      resultContainer.innerHTML = '';
      
      // Создаем новый контейнер для результатов
      const resultList = document.createElement('div');
      resultList.classList.add('result-container');

      // Формируем результат с изображениями
      topPicks.forEach(({ heroId, synergy }, index) => {
          const heroName = heroNames[heroId] || `Герой с ID ${heroId}`;
          const heroImageUrl = getHeroImageUrl(heroNames[heroId]);

          const resultItem = document.createElement('div');
          resultItem.classList.add('result-item');

          const heroImage = document.createElement('img');
          heroImage.src = heroImageUrl;
          heroImage.alt = heroName;
          heroImage.classList.add('result-hero-image');

          const resultText = document.createElement('div');
          resultText.classList.add('result-text');
          resultText.textContent = `${index + 1}. ${heroName}`;

          const resultSynergy = document.createElement('div');
          resultSynergy.classList.add('result-synergy');
          resultSynergy.textContent = `Синергия: ${synergy.toFixed(2)}`;

          resultItem.appendChild(heroImage);
          resultItem.appendChild(resultText);
          resultItem.appendChild(resultSynergy);

          resultList.appendChild(resultItem);
      });

      // Добавляем контейнер с результатами в основной блок
      resultContainer.appendChild(resultList);
  } catch (error) {
      console.error(error);
      document.getElementById("result").textContent = "Ошибка: " + error.message;
  }
});


// Заполняем справочник героев при загрузке страницы
window.onload = async () => {
    try {
        await getHeroList();
        populateHeroDropdowns();
        createHeroImageGrid();  // Создаем сетку изображений
        console.log("Справочник героев заполнен.");
    } catch (error) {
        console.error("Ошибка при загрузке списка героев:", error);
    }
};