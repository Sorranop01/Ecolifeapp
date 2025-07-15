// nutrition.js

// --- MOCK DATA ---
const foodDatabase = [
    { id: 1, name: 'ข้าวกล่องคลีน ไก่ย่าง', calories: 320, protein: 35, carbs: 28, fat: 8 },
    { id: 2, name: 'สลัดผักสด น้ำสลัดงา', calories: 180, protein: 5, carbs: 15, fat: 10 },
    { id: 3, name: 'โปรตีนบาร์ ช็อกโกแลต', calories: 250, protein: 20, carbs: 25, fat: 8 },
    { id: 4, name: 'น้ำผลไม้สกัดเย็น', calories: 120, protein: 1, carbs: 30, fat: 0 },
    { id: 5, name: 'ข้าวกล่องปลาแซลมอน', calories: 450, protein: 30, carbs: 40, fat: 18 },
    { id: 6, name: 'โยเกิร์ตกรีกกับผลไม้', calories: 150, protein: 15, carbs: 20, fat: 2 },
    { id: 7, name: 'ไข่ต้ม (2 ฟอง)', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    { id: 8, name: 'อกไก่ต้ม (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
];

// --- STATE MANAGEMENT ---
let appState = {
    currentMeal: 'breakfast',
    today: new Date().toISOString().split('T')[0],
    meals: {},
    userProfile: {
        weight: null,
        height: null,
        age: null,
        gender: 'female',
        activityLevel: 1.2,
        healthGoal: 'maintain'
    },
    bmr: 0,
    tdee: 0,
};

// --- DOM ELEMENTS ---
const DOM = {
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    mealBtns: document.querySelectorAll('.meal-btn'),
    foodSearch: document.getElementById('foodSearch'),
    searchResults: document.getElementById('searchResults'),
    foodQuantity: document.getElementById('foodQuantity'),
    todayMealsContainer: document.getElementById('todayMeals'),
    // Summary
    totalCalories: document.getElementById('totalCalories'),
    totalProtein: document.getElementById('totalProtein'),
    totalCarbs: document.getElementById('totalCarbs'),
    totalFat: document.getElementById('totalFat'),
    calorieProgress: document.getElementById('calorieProgress'),
    caloriePercent: document.getElementById('caloriePercent'),
    // BMI
    weightInput: document.getElementById('weight'),
    heightInput: document.getElementById('height'),
    ageInput: document.getElementById('age'),
    genderSelect: document.getElementById('gender'),
    activityLevelSelect: document.getElementById('activityLevel'),
    bmiResultContainer: document.getElementById('bmiResult'),
    bmiValue: document.getElementById('bmiValue'),
    bmiCategory: document.getElementById('bmiCategory'),
    bmrValue: document.getElementById('bmrValue'),
    tdeeValue: document.getElementById('tdeeValue'),
    // Daily Summary
    summaryCalories: document.getElementById('summaryCalories'),
    summaryProtein: document.getElementById('summaryProtein'),
    summaryCarbs: document.getElementById('summaryCarbs'),
    summaryFat: document.getElementById('summaryFat'),
};

// --- UTILITY & CORE FUNCTIONS ---

function saveState() {
    localStorage.setItem('nutritionAppState', JSON.stringify(appState));
}

function loadState() {
    const savedState = localStorage.getItem('nutritionAppState');
    if (savedState) {
        appState = JSON.parse(savedState);
        // Ensure today's date is current
        const today = new Date().toISOString().split('T')[0];
        if (appState.today !== today) {
            // It's a new day, archive yesterday and start fresh
            // (History logic not fully implemented in this version)
            appState.today = today;
            appState.meals = {};
        }
    }
}

function switchTab(tabId) {
    DOM.tabContents.forEach(content => content.classList.remove('active'));
    DOM.tabs.forEach(tab => tab.classList.remove('active'));

    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');

    if (tabId === 'summary') {
        updateSummaryTab();
    }
}

function goBack() {
    history.back();
}

function resetAll() {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดหรือไม่? ข้อมูลที่บันทึกไว้จะถูกลบ')) {
        localStorage.removeItem('nutritionAppState');
        location.reload();
    }
}

// --- NUTRITION TAB LOGIC ---

function selectMeal(meal) {
    appState.currentMeal = meal;
    DOM.mealBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.meal === meal);
    });
}

function handleSearch() {
    const query = DOM.foodSearch.value.toLowerCase();
    if (query.length < 1) {
        DOM.searchResults.style.display = 'none';
        return;
    }

    const results = foodDatabase.filter(food => food.name.toLowerCase().includes(query));
    
    if (results.length > 0) {
        DOM.searchResults.innerHTML = results.map(food => 
            `<div class="search-result-item" data-id="${food.id}">${food.name}</div>`
        ).join('');
        DOM.searchResults.style.display = 'block';
    } else {
        DOM.searchResults.style.display = 'none';
    }
}

function selectSearchResult(foodId) {
    const food = foodDatabase.find(f => f.id == foodId);
    if (food) {
        DOM.foodSearch.value = food.name;
        DOM.foodSearch.dataset.selectedId = food.id;
        DOM.searchResults.style.display = 'none';
    }
}

function addFood() {
    const foodId = DOM.foodSearch.dataset.selectedId;
    const quantity = parseFloat(DOM.foodQuantity.value);

    if (!foodId || isNaN(quantity) || quantity <= 0) {
        alert('กรุณาเลือกอาหารและระบุจำนวนที่ถูกต้อง');
        return;
    }

    const foodTemplate = foodDatabase.find(f => f.id == foodId);
    const meal = appState.currentMeal;

    if (!appState.meals[meal]) {
        appState.meals[meal] = [];
    }

    const foodEntry = {
        ...foodTemplate,
        id: Date.now(), // Unique ID for this specific entry
        quantity: quantity,
        calories: Math.round(foodTemplate.calories * quantity),
        protein: Math.round(foodTemplate.protein * quantity),
        carbs: Math.round(foodTemplate.carbs * quantity),
        fat: Math.round(foodTemplate.fat * quantity),
    };

    appState.meals[meal].push(foodEntry);
    
    saveState();
    updateNutritionUI();

    // Reset form
    DOM.foodSearch.value = '';
    delete DOM.foodSearch.dataset.selectedId;
    DOM.foodQuantity.value = 1;
}

function removeFood(meal, entryId) {
    if (appState.meals[meal]) {
        appState.meals[meal] = appState.meals[meal].filter(entry => entry.id != entryId);
        saveState();
        updateNutritionUI();
    }
}

function clearTodayMeals() {
    if (confirm('คุณต้องการล้างรายการอาหารของวันนี้ทั้งหมดหรือไม่?')) {
        appState.meals = {};
        saveState();
        updateNutritionUI();
    }
}

function updateNutritionUI() {
    renderTodayMeals();
    updateNutritionSummary();
}

function renderTodayMeals() {
    if (Object.values(appState.meals).every(meal => meal.length === 0)) {
        DOM.todayMealsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🍽️</div>
                <p>ยังไม่มีการบันทึกอาหาร</p>
                <small>เริ่มเพิ่มอาหารจากด้านบน</small>
            </div>`;
        return;
    }

    let html = '';
    for (const meal of ['breakfast', 'lunch', 'dinner', 'snack']) {
        if (appState.meals[meal] && appState.meals[meal].length > 0) {
            const mealTitle = document.querySelector(`.meal-btn[data-meal="${meal}"] .meal-label`).textContent;
            const mealEmoji = document.querySelector(`.meal-btn[data-meal="${meal}"] .meal-emoji`).textContent;
            html += `<div class="meal-group">
                        <div class="meal-group-title">${mealEmoji} ${mealTitle}</div>`;
            appState.meals[meal].forEach(entry => {
                html += `
                    <div class="meal-list-item">
                        <span>${entry.name} (${entry.quantity} หน่วย)</span>
                        <span>${entry.calories} kcal 
                            <button class="btn btn-ghost btn-sm" onclick="removeFood('${meal}', ${entry.id})">🗑️</button>
                        </span>
                    </div>`;
            });
            html += `</div>`;
        }
    }
    DOM.todayMealsContainer.innerHTML = html;
}

function updateNutritionSummary() {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal in appState.meals) {
        appState.meals[meal].forEach(entry => {
            totals.calories += entry.calories;
            totals.protein += entry.protein;
            totals.carbs += entry.carbs;
            totals.fat += entry.fat;
        });
    }

    DOM.totalCalories.textContent = totals.calories;
    DOM.totalProtein.textContent = totals.protein;
    DOM.totalCarbs.textContent = totals.carbs;
    DOM.totalFat.textContent = totals.fat;

    // Update progress ring
    const calorieGoal = appState.tdee > 0 ? appState.tdee : 2000;
    const percentage = Math.min(Math.round((totals.calories / calorieGoal) * 100), 100);
    const radius = DOM.calorieProgress.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    DOM.calorieProgress.style.strokeDashoffset = offset;
    DOM.caloriePercent.textContent = `${percentage}%`;
}


// --- BMI TAB LOGIC ---

function calculateBMI() {
    const weight = parseFloat(DOM.weightInput.value);
    const height = parseFloat(DOM.heightInput.value);
    const age = parseInt(DOM.ageInput.value);
    const gender = DOM.genderSelect.value;
    const activityLevel = parseFloat(DOM.activityLevelSelect.value);

    if (!weight || !height || !age) {
        alert('กรุณากรอกข้อมูล น้ำหนัก, ส่วนสูง และอายุให้ครบถ้วน');
        return;
    }

    // Save profile
    appState.userProfile = { weight, height, age, gender, activityLevel, healthGoal: appState.userProfile.healthGoal };

    // BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // BMR (Mifflin-St Jeor)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    appState.bmr = Math.round(bmr);

    // TDEE
    appState.tdee = Math.round(bmr * activityLevel);

    saveState();
    renderBmiResult(bmi);
    updateNutritionSummary(); // Recalculate progress with new TDEE goal
}

function renderBmiResult(bmi) {
    let category = '';
    if (bmi < 18.5) category = 'น้ำหนักน้อย';
    else if (bmi < 23) category = 'ปกติ';
    else if (bmi < 25) category = 'ท้วม';
    else if (bmi < 30) category = 'อ้วนระดับ 1';
    else category = 'อ้วนระดับ 2';

    DOM.bmiValue.textContent = bmi.toFixed(1);
    DOM.bmiCategory.textContent = category;
    DOM.bmrValue.textContent = appState.bmr.toLocaleString();
    DOM.tdeeValue.textContent = appState.tdee.toLocaleString();
    DOM.bmiResultContainer.style.display = 'block';
}

function setHealthGoals() {
    appState.userProfile.activityLevel = parseFloat(DOM.activityLevelSelect.value);
    appState.userProfile.healthGoal = document.getElementById('healthGoal').value;
    saveState();
    alert('ตั้งค่าเป้าหมายสุขภาพเรียบร้อยแล้ว');
    if (appState.userProfile.weight) {
        calculateBMI();
    }
}

// --- SUMMARY & HISTORY TAB LOGIC ---

function updateSummaryTab() {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal in appState.meals) {
        appState.meals[meal].forEach(entry => {
            totals.calories += entry.calories;
            totals.protein += entry.protein;
            totals.carbs += entry.carbs;
            totals.fat += entry.fat;
        });
    }
    DOM.summaryCalories.textContent = totals.calories;
    DOM.summaryProtein.textContent = totals.protein;
    DOM.summaryCarbs.textContent = totals.carbs;
    DOM.summaryFat.textContent = totals.fat;
    // Chart logic would go here
}

function exportHistory() {
    alert('ฟังก์ชันส่งออกข้อมูลยังไม่เปิดให้บริการ');
}


// --- INITIALIZATION ---

function init() {
    loadState();

    // Set up event listeners (using addEventListener is better practice than onclick)
    DOM.foodSearch.addEventListener('keyup', handleSearch);
    DOM.searchResults.addEventListener('click', (e) => {
        if (e.target.classList.contains('search-result-item')) {
            selectSearchResult(e.target.dataset.id);
        }
    });
    document.addEventListener('click', (e) => {
        if (!DOM.foodSearch.parentElement.contains(e.target)) {
            DOM.searchResults.style.display = 'none';
        }
    });
    DOM.mealBtns.forEach(btn => {
        btn.addEventListener('click', () => selectMeal(btn.dataset.meal));
    });

    // Set initial active meal
    selectMeal(appState.currentMeal);

    // Populate BMI form with saved data
    if (appState.userProfile.weight) DOM.weightInput.value = appState.userProfile.weight;
    if (appState.userProfile.height) DOM.heightInput.value = appState.userProfile.height;
    if (appState.userProfile.age) DOM.ageInput.value = appState.userProfile.age;
    DOM.genderSelect.value = appState.userProfile.gender;
    DOM.activityLevelSelect.value = appState.userProfile.activityLevel;
    
    // Initial render
    updateNutritionUI();

    // Calculate initial BMI if data exists
    if (appState.userProfile.weight && appState.userProfile.height && appState.userProfile.age) {
        calculateBMI();
    }
    
    // Set progress ring circumference
    const radius = DOM.calorieProgress.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    DOM.calorieProgress.style.strokeDasharray = `${circumference} ${circumference}`;
    DOM.calorieProgress.style.strokeDashoffset = circumference; // Start at 0
}

document.addEventListener('DOMContentLoaded', init);