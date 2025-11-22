// Payment and Registration Handler for AI Course
class CourseRegistrationHandler {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.apiBaseUrl = 'https://aisurvey.obaisukar.com/api'; // Your actual domain
        this.usedCodes = new Set(JSON.parse(localStorage.getItem('usedDiscountCodes') || '[]'));
        this.ipValidation = new Map(JSON.parse(localStorage.getItem('ipValidation') || '[]'));
        
        this.initializeStripe();
        this.setupEventListeners();
    }
    
    // Initialize Stripe
    async initializeStripe() {
        try {
            // Replace with your actual Stripe publishable key
            this.stripe = Stripe('pk_live_your_actual_stripe_key_here');
            this.elements = this.stripe.elements({
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#1a365d',
                        colorBackground: '#ffffff',
                        colorText: '#1a202c',
                        borderRadius: '10px'
                    }
                }
            });
        } catch (error) {
            console.error('Stripe initialization failed:', error);
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Registration form handler
        document.getElementById('registrationForm')?.addEventListener('submit', (e) => this.handleRegistration(e));
        
        // Modal close handlers
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModals());
        });
        
        // Outside click to close modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }
    
    // Open registration modal
    openRegistration(type) {
        const modal = document.getElementById('registrationModal');
        const modalTitle = document.getElementById('modalTitle');
        const discountField = document.getElementById('discountCodeField');
        const paymentElementDiv = document.getElementById('payment-element');
        const submitButton = document.getElementById('submitButton');
        
        document.getElementById('registrationType').value = type;
        
        // Reset form
        document.getElementById('registrationForm').reset();
        document.getElementById('registrationType').value = type;
        
        switch(type) {
            case 'syria-paid':
                modalTitle.textContent = 'تسجيل - سوريا ($50)';
                discountField.style.display = 'none';
                paymentElementDiv.style.display = 'none';
                submitButton.textContent = 'تأكيد التسجيل - $50';
                submitButton.className = 'w-full obai-btn';
                break;
                
            case 'syria-free':
                modalTitle.textContent = 'طلب كود خصم مجاني';
                discountField.style.display = 'block';
                paymentElementDiv.style.display = 'none';
                submitButton.textContent = 'التحقق من الكود';
                submitButton.className = 'w-full obai-btn';
                break;
                
            case 'international':
                modalTitle.textContent = 'تسجيل دولي ($150)';
                discountField.style.display = 'none';
                paymentElementDiv.style.display = 'block';
                submitButton.textContent = 'ادفع $150 الآن';
                submitButton.className = 'w-full obai-btn';
                this.mountPaymentElement();
                break;
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Mount Stripe payment element
    async mountPaymentElement() {
        if (!this.elements) {
            await this.initializeStripe();
        }
        
        if (this.paymentElement) {
            this.paymentElement.unmount();
        }
        
        this.paymentElement = this.elements.create('payment', {
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
        });
        
        this.paymentElement.mount('#payment-element');
    }
    
    // Handle registration form submission
    async handleRegistration(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const registrationType = formData.get('registrationType');
        
        const userData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim().toLowerCase(),
            phone: formData.get('phone').trim(),
            country: formData.get('country'),
            registrationType: registrationType,
            discountCode: formData.get('discountCode')?.trim(),
            timestamp: new Date().toISOString(),
            ipAddress: await this.getUserIP(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            courseId: 'ai-comprehensive-dec-2025'
        };
        
        // Validate form data
        if (!this.validateUserData(userData)) {
            return;
        }
        
        try {
            switch(registrationType) {
                case 'international':
                    await this.handleStripePayment(userData);
                    break;
                case 'syria-paid':
                    await this.handleSyriaPaidRegistration(userData);
                    break;
                case 'syria-free':
                    await this.handleFreeRegistration(userData);
                    break;
            }
        } catch (error) {
            this.showError('حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.');
            console.error('Registration error:', error);
        }
    }
    
    // Validate user data
    validateUserData(userData) {
        const { firstName, lastName, email, phone, country } = userData;
        
        if (!firstName || !lastName) {
            this.showError('يرجى إدخال الاسم الأول واسم العائلة');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('يرجى إدخال بريد إلكتروني صحيح');
            return false;
        }
        
        if (!phone || phone.length < 8) {
            this.showError('يرجى إدخال رقم هاتف صحيح');
            return false;
        }
        
        if (!country) {
            this.showError('يرجى اختيار البلد');
            return false;
        }
        
        return true;
    }
    
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Get user IP address
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return 'unknown';
        }
    }
    
    // Handle Stripe payment for international users
    async handleStripePayment(userData) {
        if (!this.stripe || !this.paymentElement) {
            throw new Error('Stripe not initialized');
        }
        
        this.setLoadingState('جاري معالجة الدفع...');
        
        // Create payment intent on server
        const paymentIntent = await this.createPaymentIntent(userData, 15000); // $150 in cents
        
        if (!paymentIntent) {
            throw new Error('Failed to create payment intent');
        }
        
        // Confirm payment
        const {error: confirmError} = await this.stripe.confirmPayment({
            elements: this.elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success`,
                payment_method_data: {
                    billing_details: {
                        name: `${userData.firstName} ${userData.lastName}`,
                        email: userData.email,
                        phone: userData.phone
                    }
                }
            },
            redirect: 'if_required'
        });
        
        if (confirmError) {
            throw confirmError;
        }
        
        // If payment successful without redirect
        await this.completeRegistration(userData, {
            paymentMethod: 'stripe',
            amount: 150,
            currency: 'USD',
            paymentIntentId: paymentIntent.id
        });
    }
    
    // Create payment intent (simulated - replace with actual API call)
    async createPaymentIntent(userData, amount) {
        try {
            // In real implementation, call your backend API
            const response = await fetch(`${this.apiBaseUrl}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'usd',
                    userData: userData
                })
            });
            
            if (!response.ok) {
                throw new Error('Payment intent creation failed');
            }
            
            return await response.json();
        } catch (error) {
            // Fallback for demo - simulate payment intent
            console.warn('Using simulated payment intent:', error);
            return {
                id: 'pi_' + Date.now(),
                client_secret: 'pi_' + Date.now() + '_secret_' + Math.random()
            };
        }
    }
    
    // Handle Syria paid registration
    async handleSyriaPaidRegistration(userData) {
        this.setLoadingState('جاري التسجيل...');
        
        // Here you would integrate with Syrian payment processors
        // For demo, we'll simulate the process
        await this.simulateDelay(2000);
        
        await this.completeRegistration(userData, {
            paymentMethod: 'syria-local',
            amount: 50,
            currency: 'USD',
            status: 'pending_verification'
        });
    }
    
    // Handle free registration with discount code
    async handleFreeRegistration(userData) {
        const discountCode = userData.discountCode;
        
        if (!discountCode) {
            this.showError('يرجى إدخال كود الخصم');
            return;
        }
        
        // Validate discount code
        if (!this.validateDiscountCode(discountCode, userData.ipAddress)) {
            return;
        }
        
        this.setLoadingState('جاري التحقق من الكود...');
        await this.simulateDelay(1500);
        
        // Mark code as used
        this.markCodeAsUsed(discountCode, userData.ipAddress);
        
        await this.completeRegistration(userData, {
            paymentMethod: 'discount_code',
            amount: 0,
            currency: 'USD',
            discountCode: discountCode
        });
    }
    
    // Validate discount code
    validateDiscountCode(code, ipAddress) {
        // Check if code format is valid (reseller codes or special support codes)
        const isResellerCode = code.match(/^[A-Z]+-SYRIA-[A-Z0-9]+$/);
        const isSpecialSupportCode = code === 'ObaiLovesAi'; // Only for direct communication
        
        if (!isResellerCode && !isSpecialSupportCode) {
            this.showError('كود غير صحيح. يرجى التأكد من الكود أو التواصل معنا.');
            return false;
        }
        
        // Check if code was already used globally (not just by IP)
        const usedCodes = JSON.parse(localStorage.getItem('globalUsedCodes') || '[]');
        if (usedCodes.includes(code)) {
            this.showError('تم استخدام هذا الكود مسبقاً. كل كود يمكن استخدامه مرة واحدة فقط.');
            return false;
        }
        
        // Check if multiple codes used from same IP (anti-abuse)
        const ipHistory = JSON.parse(localStorage.getItem('ipCodeHistory') || '{}');
        const ipUsage = ipHistory[ipAddress] || [];
        
        if (ipUsage.length >= 1) { // Allow only 1 free code per IP
            this.showError('تم استخدام كود دعم من هذا الجهاز مسبقاً. كل جهاز يحق له كود واحد فقط.');
            return false;
        }
        
        return true;
    }
    
    // Mark discount code as used
    markCodeAsUsed(code, ipAddress) {
        // Mark globally as used (prevents any reuse)
        const globalUsedCodes = JSON.parse(localStorage.getItem('globalUsedCodes') || '[]');
        globalUsedCodes.push(code);
        localStorage.setItem('globalUsedCodes', JSON.stringify(globalUsedCodes));
        
        // Track IP usage for anti-abuse
        const ipHistory = JSON.parse(localStorage.getItem('ipCodeHistory') || '{}');
        if (!ipHistory[ipAddress]) {
            ipHistory[ipAddress] = [];
        }
        ipHistory[ipAddress].push({
            code: code,
            usedAt: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        localStorage.setItem('ipCodeHistory', JSON.stringify(ipHistory));
        
        // Log the usage for admin tracking
        const usageLog = JSON.parse(localStorage.getItem('codeUsageLog') || '[]');
        usageLog.push({
            code: code,
            ipAddress: ipAddress,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            success: true
        });
        localStorage.setItem('codeUsageLog', JSON.stringify(usageLog));
    }
    
    // Complete registration process
    async completeRegistration(userData, paymentData) {
        try {
            // Generate unique access code
            const accessCode = this.generateAccessCode();
            
            const registrationData = {
                ...userData,
                ...paymentData,
                accessCode: accessCode,
                status: 'confirmed',
                registrationId: 'REG_' + Date.now(),
                courseStartDate: '2025-12-15',
                courseEndDate: '2026-01-15'
            };
            
            // Store registration data
            await this.storeRegistrationData(registrationData);
            
            // Send to Zoho CRM
            await this.sendToZohoCRM(registrationData);
            
            // Send confirmation email
            await this.sendConfirmationEmail(registrationData);
            
            // Show success
            this.showSuccess(registrationData);
            
        } catch (error) {
            console.error('Registration completion error:', error);
            throw error;
        }
    }
    
    // Generate unique access code
    generateAccessCode() {
        const prefix = 'AI2025';
        const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
        return `${prefix}-${randomPart}`;
    }
    
    // Store registration data
    async storeRegistrationData(registrationData) {
        try {
            // In production, send to your backend API
            const response = await fetch(`${this.apiBaseUrl}/registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your-api-token'
                },
                body: JSON.stringify(registrationData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to store registration');
            }
            
        } catch (error) {
            // Fallback to local storage for demo
            console.warn('Using local storage fallback:', error);
            
            const existingRegistrations = JSON.parse(localStorage.getItem('courseRegistrations') || '[]');
            registrationData.id = Date.now().toString();
            existingRegistrations.push(registrationData);
            localStorage.setItem('courseRegistrations', JSON.stringify(existingRegistrations));
        }
    }
    
    // Send to Zoho CRM
    async sendToZohoCRM(registrationData) {
        try {
            // Replace with your Zoho CRM API credentials and endpoint
            const zohoCRMData = {
                'Lead_Source': 'AI Course Website',
                'First_Name': registrationData.firstName,
                'Last_Name': registrationData.lastName,
                'Email': registrationData.email,
                'Phone': registrationData.phone,
                'Country': registrationData.country,
                'Course': 'AI Comprehensive Course Dec 2025',
                'Registration_Type': registrationData.registrationType,
                'Payment_Amount': registrationData.amount,
                'Payment_Method': registrationData.paymentMethod,
                'Access_Code': registrationData.accessCode,
                'IP_Address': registrationData.ipAddress,
                'Registration_Date': registrationData.timestamp
            };
            
            const response = await fetch('https://www.zohoapis.com/crm/v2/Leads', {
                method: 'POST',
                headers: {
                    'Authorization': 'Zoho-oauthtoken YOUR_ZOHO_ACCESS_TOKEN',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: [zohoCRMData] })
            });
            
            if (!response.ok) {
                console.warn('Failed to send to Zoho CRM:', await response.text());
            }
            
        } catch (error) {
            console.warn('Zoho CRM integration failed:', error);
            // Don't throw error - registration should still complete
        }
    }
    
    // Send confirmation email
    async sendConfirmationEmail(registrationData) {
        try {
            const emailData = {
                to: registrationData.email,
                subject: 'تأكيد التسجيل - دورة الذكاء الاصطناعي الشاملة',
                template: 'course-registration-confirmation',
                data: registrationData
            };
            
            const response = await fetch(`${this.apiBaseUrl}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your-api-token'
                },
                body: JSON.stringify(emailData)
            });
            
            if (!response.ok) {
                console.warn('Failed to send confirmation email');
            }
            
        } catch (error) {
            console.warn('Email sending failed:', error);
        }
    }
    
    // Set loading state
    setLoadingState(message) {
        const submitButton = document.getElementById('submitButton');
        submitButton.disabled = true;
        submitButton.textContent = message;
        submitButton.style.opacity = '0.7';
    }
    
    // Reset loading state
    resetLoadingState() {
        const submitButton = document.getElementById('submitButton');
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    }
    
    // Show error message
    showError(message) {
        this.resetLoadingState();
        
        // Create or update error display
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
            
            const form = document.getElementById('registrationForm');
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    // Show success
    showSuccess(registrationData) {
        this.closeModals();
        
        const successModal = document.getElementById('successModal');
        const successContent = successModal.querySelector('.modal-content');
        
        successContent.innerHTML = `
            <span class="close" onclick="courseRegistration.closeModals()">&times;</span>
            <div class="text-green-500 text-6xl mb-4">✓</div>
            <h2 class="text-3xl font-bold text-green-600 mb-4">تم التسجيل بنجاح!</h2>
            <div class="text-gray-600 mb-6 space-y-2">
                <p>مرحباً ${registrationData.firstName}، تم تأكيد تسجيلك في دورة الذكاء الاصطناعي الشاملة</p>
                <div class="bg-gray-100 p-4 rounded-lg mt-4">
                    <p><strong>رمز الوصول الخاص بك:</strong></p>
                    <code class="text-lg font-mono bg-blue-100 px-3 py-1 rounded">${registrationData.accessCode}</code>
                </div>
                <p class="text-sm text-gray-500 mt-4">سيصلك إيميل تأكيد يحتوي على جميع التفاصيل وروابط الوصول للدورة</p>
            </div>
            <button onclick="courseRegistration.closeModals()" class="obai-btn">ممتاز</button>
        `;
        
        successModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Close all modals
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        
        // Reset forms
        document.getElementById('registrationForm')?.reset();
        this.resetLoadingState();
        
        // Clear any error messages
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Utility function for delays
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.courseRegistration = new CourseRegistrationHandler();
});

// Smooth scroll function
function scrollToPricing() {
    document.getElementById('pricing').scrollIntoView({
        behavior: 'smooth'
    });
}

// Global functions for HTML onclick events
function openRegistration(type) {
    window.courseRegistration.openRegistration(type);
}

function closeRegistration() {
    window.courseRegistration.closeModals();
}

function closeSuccess() {
    window.courseRegistration.closeModals();
}