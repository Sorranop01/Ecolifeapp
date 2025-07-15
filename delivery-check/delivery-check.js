/**
 * Delivery Check Module
 * หน้าตรวจสอบเขตพื้นที่การจัดส่ง
 * @module DeliveryCheck
 */

// Module Pattern for better organization
const DeliveryCheck = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        API_ENDPOINTS: {
            CHECK_LOCATION: '/api/delivery/check-location',
            CHECK_ADDRESS: '/api/delivery/check-address',
            AUTOCOMPLETE: '/api/delivery/autocomplete'
        },
        FREE_DELIVERY_RADIUS: 40, // km
        DELIVERY_FEES: {
            ZONE_1: 0,    // 0-40km
            ZONE_2: 80,   // 40-60km
            ZONE_3: 150   // 60km+
        },
        DEBOUNCE_DELAY: 300, // ms
        CACHE_DURATION: 300000 // 5 minutes
    };

    // State Management
    const state = {
        currentMethod: 'location',
        isLoading: false,
        lastResult: null,
        addressCache: new Map()
    };

    // DOM Elements Cache
    const elements = {
        methodTabs: null,
        methodPanels: null,
        locationPanel: null,
        manualPanel: null,
        addressForm: null,
        postalCodeInput: null,
        addressInput: null,
        loadingOverlay: null,
        resultCard: null,
        detectBtn: null
    };

    /**
     * Initialize the module
     */
    function init() {
        cacheElements();
        bindEvents();
        setupAddressAutocomplete();
        checkSavedLocation();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.methodTabs = document.querySelectorAll('.method-tab');
        elements.methodPanels = document.querySelectorAll('.method-panel');
        elements.locationPanel = document.getElementById('locationPanel');
        elements.manualPanel = document.getElementById('manualPanel');
        elements.addressForm = document.getElementById('addressForm');
        elements.postalCodeInput = document.getElementById('postalCode');
        elements.addressInput = document.getElementById('address');
        elements.loadingOverlay = document.getElementById('loadingOverlay');
        elements.resultCard = document.getElementById('resultCard');
        elements.detectBtn = document.querySelector('.detect-location-btn');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Method tab switching
        elements.methodTabs.forEach(tab => {
            tab.addEventListener('click', handleTabClick);
        });

        // Location detection
        elements.detectBtn.addEventListener('click', handleLocationDetection);

        // Form submission
        elements.addressForm.addEventListener('submit', handleFormSubmit);

        // Postal code formatting
        elements.postalCodeInput.addEventListener('input', handlePostalCodeInput);

        // Address autocomplete
        elements.addressInput.addEventListener('input', debounce(handleAddressInput, CONFIG.DEBOUNCE_DELAY));
    }

    /**
     * Handle tab switching
     */
    function handleTabClick(e) {
        const tab = e.currentTarget;
        const method = tab.dataset.method;

        if (method === state.currentMethod) return;

        // Update UI
        elements.methodTabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Switch panels
        elements.methodPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        if (method === 'location') {
            elements.locationPanel.classList.add('active');
        } else {
            elements.manualPanel.classList.add('active');
            elements.postalCodeInput.focus();
        }

        state.currentMethod = method;
        hideResult();
    }

    /**
     * Handle location detection
     */
    async function handleLocationDetection() {
        if (state.isLoading) return;

        if (!('geolocation' in navigator)) {
            showNotification('เบราว์เซอร์ของคุณไม่รองรับการตรวจหาตำแหน่ง', 'error');
            return;
        }

        showLoading();

        try {
            const position = await getCurrentPosition();
            const result = await checkLocationByCoords(position.coords);
            displayResult(result);
            saveLastLocation(result);
        } catch (error) {
            hideLoading();
            handleLocationError(error);
        }
    }

    /**
     * Get current position (promisified)
     */
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
    }

    /**
     * Check location by coordinates
     */
    async function checkLocationByCoords(coords) {
        // In production, this would call the actual API
        // For now, simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate location check based on random result
                const isInZone = Math.random() > 0.3;
                const mockAddress = 'ราชเทวี กรุงเทพมหานคร 10400';
                
                resolve({
                    success: true,
                    data: {
                        inFreeZone: isInZone,
                        address: mockAddress,
                        distance: isInZone ? 15 : 55,
                        deliveryFee: isInZone ? 0 : 80,
                        estimatedTime: isInZone ? '1-2 ชม.' : '2-4 ชม.',
                        deliveryHours: isInZone ? '09:00-18:00' : '10:00-17:00',
                        coordinates: {
                            lat: coords.latitude,
                            lng: coords.longitude
                        }
                    }
                });
            }, 1500);
        });
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        if (state.isLoading) return;

        const postalCode = elements.postalCodeInput.value.trim();
        const address = elements.addressInput.value.trim();

        // Validation
        if (!postalCode && !address) {
            showFormError('กรุณาใส่รหัสไปรษณีย์หรือที่อยู่');
            return;
        }

        if (postalCode && !isValidPostalCode(postalCode)) {
            showFormError('รหัสไปรษณีย์ไม่ถูกต้อง');
            return;
        }

        // Check cache first
        const cacheKey = postalCode || address;
        if (state.addressCache.has(cacheKey)) {
            const cachedResult = state.addressCache.get(cacheKey);
            if (Date.now() - cachedResult.timestamp < CONFIG.CACHE_DURATION) {
                displayResult(cachedResult.data);
                return;
            }
        }

        showLoading();

        try {
            const result = await checkLocationByAddress(postalCode, address);
            displayResult(result);
            
            // Cache the result
            state.addressCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
        } catch (error) {
            hideLoading();
            showNotification('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
        }
    }

    /**
     * Check location by address
     */
    async function checkLocationByAddress(postalCode, address) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if postal code starts with Bangkok codes
                const bangkokCodes = ['10', '11'];
                const isInZone = postalCode ? 
                    bangkokCodes.some(code => postalCode.startsWith(code)) : 
                    Math.random() > 0.5;
                
                resolve({
                    success: true,
                    data: {
                        inFreeZone: isInZone,
                        address: address || `พื้นที่รหัส ${postalCode}`,
                        distance: isInZone ? 20 : 65,
                        deliveryFee: isInZone ? 0 : 80,
                        estimatedTime: isInZone ? '1-2 ชม.' : '2-4 ชม.',
                        deliveryHours: isInZone ? '09:00-18:00' : '10:00-17:00'
                    }
                });
            }, 1000);
        });
    }

    /**
     * Display result
     */
    function displayResult(result) {
        hideLoading();

        if (!result.success) {
            showNotification('ไม่สามารถตรวจสอบได้ กรุณาลองใหม่', 'error');
            return;
        }

        const { data } = result;
        const template = data.inFreeZone ? 
            document.getElementById('resultSuccessTemplate') : 
            document.getElementById('resultWarningTemplate');

        // Clone template
        const content = template.content.cloneNode(true);
        
        // Update subtitle
        content.querySelector('.result-subtitle').textContent = data.address;

        // Update delivery fee for warning state
        if (!data.inFreeZone) {
            content.querySelector('.info-value.text-warning').textContent = `฿${data.deliveryFee}`;
        }

        // Update time slots
        const timeValues = content.querySelectorAll('.info-value');
        timeValues[1].textContent = data.estimatedTime;
        timeValues[2].textContent = data.deliveryHours;

        // Clear and append
        elements.resultCard.innerHTML = '';
        elements.resultCard.appendChild(content);
        elements.resultCard.classList.add('show');

        // Bind check again button
        const checkAgainBtn = elements.resultCard.querySelector('.check-again-btn');
        if (checkAgainBtn) {
            checkAgainBtn.addEventListener('click', resetChecker);
        }

        // Scroll to result
        setTimeout(() => {
            elements.resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        // Save state
        state.lastResult = data;

        // Track analytics
        trackEvent('delivery_check_complete', {
            method: state.currentMethod,
            in_free_zone: data.inFreeZone,
            distance: data.distance
        });
    }

    /**
     * Handle postal code input
     */
    function handlePostalCodeInput(e) {
        // Allow only numbers
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        
        // Clear error on input
        clearFormError();
    }

    /**
     * Handle address input for autocomplete
     */
    async function handleAddressInput(e) {
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            hideAutocomplete();
            return;
        }

        try {
            const suggestions = await fetchAddressSuggestions(query);
            showAutocomplete(suggestions);
        } catch (error) {
            console.error('Autocomplete error:', error);
        }
    }

    /**
     * Setup address autocomplete
     */
    function setupAddressAutocomplete() {
        // In production, this would fetch from API
        // For now, use static suggestions
        const commonAreas = [
            'ราชเทวี กรุงเทพมหานคร',
            'สีลม บางรัก กรุงเทพมหานคร',
            'สยาม ปทุมวัน กรุงเทพมหานคร',
            'ลาดพร้าว จตุจักร กรุงเทพมหานคร',
            'อารีย์ พญาไท กรุงเทพมหานคร',
            'สุขุมวิท คลองเตย กรุงเทพมหานคร',
            'เอกมัย วัฒนา กรุงเทพมหานคร',
            'ทองหล่อ วัฒนา กรุงเทพมหานคร',
            'รามอินทรา บางเขน กรุงเทพมหานคร',
            'พระราม 9 ห้วยขวาง กรุงเทพมหานคร'
        ];

        const datalist = document.getElementById('address-suggestions');
        commonAreas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            datalist.appendChild(option);
        });
    }

    /**
     * Show loading state
     */
    function showLoading() {
        state.isLoading = true;
        elements.loadingOverlay.classList.add('show');
        hideResult();
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        state.isLoading = false;
        elements.loadingOverlay.classList.remove('show');
    }

    /**
     * Hide result
     */
    function hideResult() {
        elements.resultCard.classList.remove('show');
        elements.resultCard.innerHTML = '';
    }

    /**
     * Reset checker
     */
    function resetChecker() {
        hideResult();
        elements.addressForm.reset();
        clearFormError();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Show form error
     */
    function showFormError(message) {
        const errorEl = document.getElementById('postalCodeError');
        errorEl.textContent = message;
        elements.postalCodeInput.classList.add('error');
    }

    /**
     * Clear form error
     */
    function clearFormError() {
        const errorEl = document.getElementById('postalCodeError');
        errorEl.textContent = '';
        elements.postalCodeInput.classList.remove('error');
    }

    /**
     * Handle location error
     */
    function handleLocationError(error) {
        let message = 'ไม่สามารถตรวจหาตำแหน่งได้';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาลองใช้วิธีใส่ที่อยู่';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'ไม่สามารถหาตำแหน่งได้ กรุณาลองใหม่';
                break;
            case error.TIMEOUT:
                message = 'หมดเวลาในการหาตำแหน่ง กรุณาลองใหม่';
                break;
        }
        
        showNotification(message, 'warning');
    }

    /**
     * Validate postal code
     */
    function isValidPostalCode(code) {
        return /^\d{5}$/.test(code);
    }

    /**
     * Check saved location on init
     */
    function checkSavedLocation() {
        const saved = localStorage.getItem('lastDeliveryCheck');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Date.now() - data.timestamp < CONFIG.CACHE_DURATION) {
                    // Optionally show last result
                    // displayResult(data.result);
                }
            } catch (e) {
                console.error('Error loading saved location:', e);
            }
        }
    }

    /**
     * Save last location
     */
    function saveLastLocation(result) {
        try {
            localStorage.setItem('lastDeliveryCheck', JSON.stringify({
                result: result,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('Error saving location:', e);
        }
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        // In production, use a proper notification system
        alert(message);
    }

    /**
     * Track analytics event
     */
    function trackEvent(eventName, parameters) {
        // In production, send to analytics service
        console.log('Analytics:', eventName, parameters);
        
        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    /**
     * Debounce utility
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Fetch address suggestions (mock)
     */
    async function fetchAddressSuggestions(query) {
        // In production, call autocomplete API
        return new Promise((resolve) => {
            setTimeout(() => {
                const suggestions = [
                    `${query} กรุงเทพมหานคร`,
                    `${query} นนทบุรี`,
                    `${query} ปทุมธานี`
                ];
                resolve(suggestions);
            }, 200);
        });
    }

    /**
     * Show autocomplete suggestions
     */
    function showAutocomplete(suggestions) {
        const datalist = document.getElementById('address-suggestions');
        datalist.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });
    }

    /**
     * Hide autocomplete
     */
    function hideAutocomplete() {
        const datalist = document.getElementById('address-suggestions');
        datalist.innerHTML = '';
    }

    // Public API
    return {
        init: init,
        reset: resetChecker,
        checkLocation: handleLocationDetection,
        checkAddress: handleFormSubmit
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DeliveryCheck.init);
} else {
    DeliveryCheck.init();
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeliveryCheck;
}