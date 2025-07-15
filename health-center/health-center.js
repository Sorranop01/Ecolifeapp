document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & DATABASE ---
    const foodDatabase = [
        { name: 'ข้าวกล้องผัดผัก', calories: 280, protein: 8, carbs: 45, fat: 6 },
        { name: 'สลัดผักใส่อกไก่', calories: 220, protein: 25, carbs: 12, fat: 8 },
        { name: 'โยเกิร์ตกรีกใส่เบอร์รี่', calories: 150, protein: 15, carbs: 18, fat: 3 },
        { name: 'ก๋วยเตี๋ยวต้มยำ (ไม่ใส่น้ำมัน)', calories: 320, protein: 18, carbs: 48, fat: 5 },
        { name: 'ปลาแซลมอนย่าง', calories: 410, protein: 35, carbs: 0, fat: 28 },
        { name: 'ผลไม้รวม 1 ถ้วย', calories: 120, protein: 2, carbs: 30, fat: 1 },
        { name: 'อกไก่ย่าง 100g', calories: 185, protein: 31, carbs: 0, fat: 6 },
        { name: 'ข้าวโพดต้ม 1 ฝัก', calories: 110, protein: 4, carbs: 25, fat: 1 },
        { name: 'ไข่ต้ม 1 ฟอง', calories: 78, protein: 6, carbs: 1, fat: 5 },
        { name: 'บร็อกโคลี่นึ่ง 1 ถ้วย', calories: 25, protein: 3, carbs: 5, fat: 0 }
    ];

    let currentMeal = 'breakfast';
    let summaryChartInstance = null;
    let selectedDate = getTodayDateString();
    let appData = {
        userProfile: {
            weight: '', height: '', age: '', gender: 'female', activityLevel: 1.2,
            bmi: null, bmr: null, tdee: null, calorieGoal: 2000, healthGoal: 'maintain',
            proteinGoal: 0, carbsGoal: 0, fatGoal: 0,
            dietaryRestrictions: [], allergies: '', medicalConditions: ''
        },
        dailyData: {} // Format: { 'YYYY-MM-DD': { intake: {...}, meals: [...] } }
    };

    // --- DOM ELEMENTS ---
    const elements = {
        backButton: document.getElementById('backButton'),
        dateSelector: document.getElementById('dateSelector'),
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        mealBtns: document.querySelectorAll('.meal-btn'),
        // Nutrition Tab
        foodSearch: document.getElementById('foodSearch'),
        searchResults: document.getElementById('searchResults'),
        foodQuantity: document.getElementById('foodQuantity'),
        foodUnit: document.getElementById('foodUnit'),
        addFoodBtn: document.getElementById('addFoodBtn'),
        clearMealsBtn: document.getElementById('clearMealsBtn'),
        // Profile Tab
        saveProfileBtn: document.getElementById('saveProfileBtn'),
        dietCheckboxes: document.querySelectorAll('input[name="diet"]'),
        allergiesInput: document.getElementById('allergies'),
        medicalConditionsInput: document.getElementById('medicalConditions'),
        // BMI Tab
        weightInput: document.getElementById('weight'),
        heightInput: document.getElementById('height'),
        genderSelect: document.getElementById('gender'),
        ageInput: document.getElementById('age'),
        healthGoalSelect: document.getElementById('healthGoal'),
        activityLevelSelect: document.getElementById('activityLevel'),
        bmiPrompt: document.getElementById('bmiPrompt'),
        goToProfileBtn: document.getElementById('goToProfileBtn'),
        // History Tab
        historyListContainer: document.getElementById('historyListContainer'),
        historyEmptyState: document.getElementById('historyEmptyState'),
        // Display Elements
        totalCalories: document.getElementById('totalCalories'),
        totalProtein: document.getElementById('totalProtein'),
        totalCarbs: document.getElementById('totalCarbs'),
        totalFat: document.getElementById('totalFat'),
        calorieProgress: document.getElementById('calorieProgress'),
        caloriePercent: document.getElementById('caloriePercent'),
        todayMealsContainer: document.getElementById('todayMeals'),
        bmiResultDiv: document.getElementById('bmiResult'),
        bmiResultValue: document.getElementById('bmiValue'),
        bmiResultCategory: document.getElementById('bmiCategory'),
        bmrValue: document.getElementById('bmrValue'),
        tdeeValue: document.getElementById('tdeeValue'),
        proteinGoal: document.getElementById('proteinGoal'),
        carbsGoal: document.getElementById('carbsGoal'),
        fatGoal: document.getElementById('fatGoal'),
        summaryCalories: document.getElementById('summaryCalories'),
        summaryProtein: document.getElementById('summaryProtein'),
        summaryCarbs: document.getElementById('summaryCarbs'),
        summaryFat: document.getElementById('summaryFat'),
        summaryChart: document.getElementById('summaryChart'),
        chartEmptyState: document.getElementById('chartEmptyState'),
    };

    // --- FUNCTIONS ---

    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const saveData = () => {
        localStorage.setItem('ecoLifeHealthData', JSON.stringify(appData));
    };

    const loadData = () => {
        const savedData = localStorage.getItem('ecoLifeHealthData');
        if (savedData) {
            appData = JSON.parse(savedData);
            // Ensure structure is valid
            if (!appData.dailyData) appData.dailyData = {};
            if (!appData.userProfile) appData.userProfile = {};
        }
        updateProfileInputs();
    };

    const updateProfileInputs = () => {
        const { userProfile } = appData;
        // Update form inputs with loaded profile data
        elements.weightInput.value = userProfile.weight || '';
        elements.heightInput.value = userProfile.height || '';
        elements.ageInput.value = userProfile.age || '';
        elements.genderSelect.value = userProfile.gender || 'female';
        elements.activityLevelSelect.value = userProfile.activityLevel || 1.2;
        elements.healthGoalSelect.value = userProfile.healthGoal || 'maintain';
        elements.allergiesInput.value = userProfile.allergies || '';
        elements.medicalConditionsInput.value = userProfile.medicalConditions || '';
        elements.dietCheckboxes.forEach(checkbox => {
            checkbox.checked = userProfile.dietaryRestrictions?.includes(checkbox.value) || false;
        });
    };

    const showTab = (tabName) => {
        elements.tabContents.forEach(tab => tab.classList.remove('active'));
        elements.tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    };

    const selectMeal = (mealName, clickedBtn) => {
        elements.mealBtns.forEach(b => b.classList.remove('active'));
        clickedBtn.classList.add('active');
        currentMeal = mealName;
    };

    const searchFood = () => {
        const query = elements.foodSearch.value.toLowerCase();
        if (query.length < 2) {
            elements.searchResults.style.display = 'none';
            return;
        }
        const matches = foodDatabase.filter(food => food.name.toLowerCase().includes(query));
        if (matches.length > 0) {
            elements.searchResults.innerHTML = matches.map(food => `
                <div class="search-item" data-food-name="${food.name}">
                    <span>${food.name}</span>
                    <span>${food.calories} kcal</span>
                </div>`).join('');
            elements.searchResults.style.display = 'block';
        } else {
            elements.searchResults.style.display = 'none';
        }
    };

    const selectFood = (foodName) => {
        elements.foodSearch.value = foodName;
        elements.searchResults.style.display = 'none';
    };

    const clearMeals = () => {
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลอาหารทั้งหมดในวันที่ ${selectedDate}?`)) {
            loadUIForDate(selectedDate, true); // true to force clear
        }
    };
    const addFood = () => {
        const foodName = elements.foodSearch.value;
        const quantity = parseFloat(elements.foodQuantity.value);
        const unit = elements.foodUnit.value;
        const food = foodDatabase.find(f => f.name === foodName);

        if (!food) {
            alert('กรุณาเลือกอาหารจากรายการ');
            return;
        }

        let dayData = appData.dailyData[selectedDate] || {
            intake: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            meals: []
        };

        const calories = Math.round(food.calories * quantity);
        dayData.intake.calories += calories;
        dayData.intake.protein += Math.round(food.protein * quantity * 10) / 10;
        dayData.intake.carbs += Math.round(food.carbs * quantity * 10) / 10;
        dayData.intake.fat += Math.round(food.fat * quantity * 10) / 10;

        dayData.meals.push({
            meal: currentMeal,
            food: `${foodName} (${quantity} ${unit})`,
            calories: calories,
            time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        });

        appData.dailyData[selectedDate] = dayData;
        saveData();
        updateAllDisplays(dayData.intake, dayData.meals);
        updateHistoryTab();
        elements.foodSearch.value = '';
        elements.foodQuantity.value = '1';
        showNotification('เพิ่มอาหารสำเร็จ! 🎉');
    };

    const updateAllDisplays = (intake, meals) => {
        const { userProfile } = appData;

        // Nutrition Display
        elements.totalCalories.textContent = Math.round(intake.calories);
        elements.totalProtein.textContent = Math.round(intake.protein * 10) / 10;
        elements.totalCarbs.textContent = Math.round(intake.carbs * 10) / 10;
        elements.totalFat.textContent = Math.round(intake.fat * 10) / 10;

        // Update BMI Tab display
        if (userProfile.bmi) {
            elements.bmiResultDiv.style.display = 'block';
            elements.bmiPrompt.style.display = 'none';
            updateBmiDisplay();
        } else {
            elements.bmiResultDiv.style.display = 'none';
            elements.bmiPrompt.style.display = 'block';
        }

        // Calorie Progress Ring
        const calorieGoal = appData.userProfile.calorieGoal || 2000;
        const percentage = Math.min((intake.calories / calorieGoal) * 100, 100);
        const circumference = 326.7;
        const offset = circumference - (percentage / 100) * circumference;
        elements.calorieProgress.style.strokeDashoffset = offset;
        elements.caloriePercent.textContent = Math.round(percentage);
        const progressGoalEl = document.querySelector('.progress-goal');
        if (progressGoalEl) {
            progressGoalEl.textContent = `เป้าหมาย ${calorieGoal} kcal`;
        }

        // Meals History
        if (meals.length === 0) {
            elements.todayMealsContainer.innerHTML = `<div class="empty-state">ยังไม่มีการบันทึกอาหาร เริ่มเพิ่มอาหารจากด้านบน</div>`;
        } else {
            const mealEmoji = { 'breakfast': '🌅', 'lunch': '☀️', 'dinner': '🌙', 'snack': '🍎' };
            elements.todayMealsContainer.innerHTML = meals.map(meal => `
                <div class="meal-item">
                    <div class="meal-time">${mealEmoji[meal.meal]} ${meal.time}</div>
                    <div class="meal-food">${meal.food}</div>
                    <div class="meal-calories">${meal.calories} kcal</div>
                </div>`).join('');
        }

        // Summary Tab
        elements.summaryCalories.textContent = Math.round(intake.calories);
        elements.summaryProtein.textContent = Math.round(intake.protein * 10) / 10;
        elements.summaryCarbs.textContent = Math.round(intake.carbs * 10) / 10;
        elements.summaryFat.textContent = Math.round(intake.fat * 10) / 10;
        renderSummaryChart(intake);
    };

    const updateBmiDisplay = () => {
        const { bmi, bmr, tdee, proteinGoal, carbsGoal, fatGoal } = appData.userProfile;

        let category = '', categoryClass = '';
        if (bmi < 18.5) { category = 'น้ำหนักน้อย'; categoryClass = 'bmi-underweight'; }
        else if (bmi < 25) { category = 'น้ำหนักปกติ'; categoryClass = 'bmi-normal'; }
        else if (bmi < 30) { category = 'น้ำหนักเกิน'; categoryClass = 'bmi-overweight'; }
        else { category = 'อ้วน'; categoryClass = 'bmi-obese'; }

        elements.bmiResultValue.textContent = bmi ? bmi.toFixed(1) : 0;
        elements.bmiResultCategory.textContent = category;
        elements.bmrValue.textContent = Math.round(bmr);
        elements.tdeeValue.textContent = Math.round(tdee);
        elements.proteinGoal.textContent = proteinGoal || 0;
        elements.carbsGoal.textContent = carbsGoal || 0;
        elements.fatGoal.textContent = fatGoal || 0;
        elements.bmiResultDiv.querySelector('.bmi-result').className = `bmi-result ${categoryClass}`;
    };

    const renderSummaryChart = (intake) => {
        if (summaryChartInstance) {
            summaryChartInstance.destroy();
        }

        const { protein, carbs, fat } = intake;
        const totalMacros = protein + carbs + fat;

        if (totalMacros === 0) {
            elements.summaryChart.parentElement.style.display = 'none';
            elements.chartEmptyState.style.display = 'block';
            return;
        }

        elements.summaryChart.parentElement.style.display = 'block';
        elements.chartEmptyState.style.display = 'none';

        const ctx = elements.summaryChart.getContext('2d');
        summaryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['โปรตีน (g)', 'คาร์โบไฮเดรต (g)', 'ไขมัน (g)'],
                datasets: [{
                    label: 'สัดส่วนสารอาหาร',
                    data: [protein, carbs, fat],
                    backgroundColor: ['#818cf8', '#facc15', '#fb923c'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.raw.toFixed(1)}g (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    const calculateBMI = () => {
        // Get values from userProfile state
        const { weight, height, age, gender, activityLevel } = appData.userProfile;

        // 1. Validation
        if (!weight || !height || !age) {
            // This case is handled in saveHealthProfile, but good to have a safeguard
            return; 
        }

        // 2. BMI Calculation
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        // 3. BMR Calculation
        let bmr = (gender === 'male')
            ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);

        // 4. TDEE Calculation
        const tdee = bmr * activityLevel;

        // 5. Update state with calculation results
        appData.userProfile.bmi = bmi;
        appData.userProfile.bmr = bmr;
        appData.userProfile.tdee = tdee;
        
        // 6. Adjust calorie goal based on health goal
        let adjustedGoal = tdee;
        switch (appData.userProfile.healthGoal) {
            case 'lose': adjustedGoal -= 500; break;
            case 'gain': adjustedGoal += 500; break;
            case 'muscle': adjustedGoal += 300; break;
        }
        appData.userProfile.calorieGoal = Math.round(adjustedGoal);

        // 7. Calculate macronutrient goals based on the final calorie goal
        const calorieGoal = appData.userProfile.calorieGoal;
        appData.userProfile.proteinGoal = Math.round((calorieGoal * 0.30) / 4); // 30% Protein
        appData.userProfile.carbsGoal = Math.round((calorieGoal * 0.40) / 4);   // 40% Carbs
        appData.userProfile.fatGoal = Math.round((calorieGoal * 0.30) / 9);     // 30% Fat
    };

    const saveHealthProfile = () => {
        const weight = parseFloat(elements.weightInput.value);
        const heightCm = parseFloat(elements.heightInput.value);
        const age = parseInt(elements.ageInput.value, 10);
        const dietaryRestrictions = Array.from(elements.dietCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        appData.userProfile = {
            ...appData.userProfile,
            weight, height: heightCm, age,
            gender: elements.genderSelect.value,
            activityLevel: parseFloat(elements.activityLevelSelect.value),
            healthGoal: elements.healthGoalSelect.value,
            dietaryRestrictions,
            allergies: elements.allergiesInput.value.trim(),
            medicalConditions: elements.medicalConditionsInput.value.trim()
        };

        calculateBMI();
        saveData();
        const dayData = appData.dailyData[selectedDate] || { intake: { calories: 0, protein: 0, carbs: 0, fat: 0 }, meals: [] };
        updateAllDisplays(dayData.intake, dayData.meals);
        showNotification('บันทึกโปรไฟล์สุขภาพเรียบร้อยแล้ว! ✅');
    };

    const updateHistoryTab = () => {
        const dates = Object.keys(appData.dailyData).sort().reverse();
        if (dates.length === 0) {
            elements.historyListContainer.innerHTML = '';
            elements.historyEmptyState.style.display = 'block';
            return;
        }

        elements.historyEmptyState.style.display = 'none';
        elements.historyListContainer.innerHTML = dates.map(date => {
            const dayData = appData.dailyData[date];
            const intake = dayData.intake;
            return `
                <div class="history-item" data-date="${date}">
                    <div class="history-date">${new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="history-summary">
                        <span>🔥 ${Math.round(intake.calories)} kcal</span>
                        <span>💪 ${Math.round(intake.protein)}g</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    const loadUIForDate = (dateString, forceClear = false) => {
        selectedDate = dateString;
        elements.dateSelector.value = dateString;

        if (forceClear) {
            delete appData.dailyData[dateString];
            saveData();
        }

        const dayData = appData.dailyData[dateString] || {
            intake: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            meals: []
        };

        updateAllDisplays(dayData.intake, dayData.meals);
        updateHistoryTab();
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: #4caf50; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; font-weight: 500;`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };

    // --- EVENT LISTENERS ---
    elements.backButton.addEventListener('click', () => window.history.back());
    elements.tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
    elements.mealBtns.forEach(btn => btn.addEventListener('click', () => selectMeal(btn.dataset.meal, btn)));
    elements.foodSearch.addEventListener('keyup', searchFood);
    elements.searchResults.addEventListener('click', (e) => {
        if (e.target.closest('.search-item')) {
            selectFood(e.target.closest('.search-item').dataset.foodName);
        }
    });

    elements.dateSelector.addEventListener('change', (e) => loadUIForDate(e.target.value));
    elements.addFoodBtn.addEventListener('click', addFood);
    elements.clearMealsBtn.addEventListener('click', clearMeals);
    elements.saveProfileBtn.addEventListener('click', saveHealthProfile);
    elements.goToProfileBtn.addEventListener('click', () => showTab('profile'));
    elements.historyListContainer.addEventListener('click', (e) => {
        const historyItem = e.target.closest('.history-item');
        if (historyItem) {
            const date = historyItem.dataset.date;
            loadUIForDate(date);
            showTab('nutrition');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.food-search')) {
            elements.searchResults.style.display = 'none';
        }
    });

    // --- INITIALIZATION ---
    const init = () => {
        loadData();
        loadUIForDate(selectedDate);
    };

    init();
});
