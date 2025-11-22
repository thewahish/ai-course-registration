// Admin Dashboard JavaScript for AI Course
class AdminDashboard {
    constructor() {
        this.registrations = [];
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.updateStats();
        this.initCharts();
        this.populateTables();
        this.setupEventListeners();
    }
    
    // Load data from localStorage (in production, this would be from API)
    async loadData() {
        try {
            // Load registrations
            this.registrations = JSON.parse(localStorage.getItem('courseRegistrations') || '[]');
            
            // If no data exists, create sample data for demo
            if (this.registrations.length === 0) {
                this.createSampleData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.createSampleData();
        }
    }
    
    // Create sample data for demonstration
    createSampleData() {
        const sampleRegistrations = [
            {
                id: '1',
                firstName: 'أحمد',
                lastName: 'محمد',
                email: 'ahmed.mohamed@email.com',
                phone: '+963123456789',
                country: 'syria',
                registrationType: 'syria-free',
                amount: 0,
                paymentMethod: 'discount_code',
                discountCode: 'ObaiLovesAi',
                status: 'confirmed',
                accessCode: 'AI2025-ABC123XY',
                timestamp: '2025-01-15T10:30:00.000Z',
                ipAddress: '192.168.1.100'
            },
            {
                id: '2',
                firstName: 'سارة',
                lastName: 'علي',
                email: 'sara.ali@email.com',
                phone: '+971501234567',
                country: 'uae',
                registrationType: 'international',
                amount: 150,
                paymentMethod: 'stripe',
                status: 'confirmed',
                accessCode: 'AI2025-DEF456ZW',
                timestamp: '2025-01-16T14:15:00.000Z',
                ipAddress: '10.0.0.50'
            },
            {
                id: '3',
                firstName: 'محمد',
                lastName: 'خالد',
                email: 'mohamed.khaled@email.com',
                phone: '+963987654321',
                country: 'syria',
                registrationType: 'syria-paid',
                amount: 50,
                paymentMethod: 'syria-local',
                status: 'pending',
                accessCode: 'AI2025-GHI789UV',
                timestamp: '2025-01-17T09:45:00.000Z',
                ipAddress: '192.168.1.200'
            },
            {
                id: '4',
                firstName: 'فاطمة',
                lastName: 'حسن',
                email: 'fatima.hassan@email.com',
                phone: '+966512345678',
                country: 'saudi',
                registrationType: 'international',
                amount: 150,
                paymentMethod: 'stripe',
                status: 'confirmed',
                accessCode: 'AI2025-JKL012ST',
                timestamp: '2025-01-18T16:20:00.000Z',
                ipAddress: '172.16.0.100'
            },
            {
                id: '5',
                firstName: 'عمر',
                lastName: 'يوسف',
                email: 'omar.youssef@email.com',
                phone: '+962791234567',
                country: 'jordan',
                registrationType: 'international',
                amount: 150,
                paymentMethod: 'stripe',
                status: 'confirmed',
                accessCode: 'AI2025-MNO345QR',
                timestamp: '2025-01-19T11:10:00.000Z',
                ipAddress: '203.0.113.50'
            }
        ];
        
        this.registrations = sampleRegistrations;
        localStorage.setItem('courseRegistrations', JSON.stringify(sampleRegistrations));
    }
    
    // Update statistics
    updateStats() {
        const totalRegistrations = this.registrations.length;
        const paidRegistrations = this.registrations.filter(r => r.amount > 0).length;
        const totalRevenue = this.registrations.reduce((sum, r) => sum + (r.amount || 0), 0);
        const conversionRate = totalRegistrations > 0 ? ((paidRegistrations / totalRegistrations) * 100).toFixed(1) : 0;
        
        document.getElementById('total-registrations').textContent = totalRegistrations;
        document.getElementById('paid-registrations').textContent = paidRegistrations;
        document.getElementById('total-revenue').textContent = `$${totalRevenue}`;
        document.getElementById('conversion-rate').textContent = `${conversionRate}%`;
    }
    
    // Initialize charts
    initCharts() {
        this.initRegistrationTimelineChart();
        this.initRegistrationTypeChart();
        this.initCountryChart();
        this.initDailyChart();
        this.initRevenueChart();
    }
    
    // Registration timeline chart
    initRegistrationTimelineChart() {
        const ctx = document.getElementById('registrationChart').getContext('2d');
        
        // Group registrations by date
        const dateGroups = {};
        this.registrations.forEach(reg => {
            const date = new Date(reg.timestamp).toLocaleDateString('ar-SA');
            dateGroups[date] = (dateGroups[date] || 0) + 1;
        });
        
        const labels = Object.keys(dateGroups).sort();
        const data = labels.map(date => dateGroups[date]);
        
        this.charts.registrationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'التسجيلات',
                    data: data,
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Registration type pie chart
    initRegistrationTypeChart() {
        const ctx = document.getElementById('typeChart').getContext('2d');
        
        const typeGroups = {};
        this.registrations.forEach(reg => {
            const type = this.getRegistrationTypeLabel(reg.registrationType);
            typeGroups[type] = (typeGroups[type] || 0) + 1;
        });
        
        this.charts.typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeGroups),
                datasets: [{
                    data: Object.values(typeGroups),
                    backgroundColor: [
                        '#10b981', // Green for Syria free
                        '#2d89ef', // Blue for Syria paid
                        '#8b5cf6'  // Purple for international
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
    
    // Country distribution chart
    initCountryChart() {
        const ctx = document.getElementById('countryChart').getContext('2d');
        
        const countryGroups = {};
        this.registrations.forEach(reg => {
            const country = this.getCountryLabel(reg.country);
            countryGroups[country] = (countryGroups[country] || 0) + 1;
        });
        
        this.charts.countryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(countryGroups),
                datasets: [{
                    label: 'عدد التسجيلات',
                    data: Object.values(countryGroups),
                    backgroundColor: '#1a365d'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Daily registrations chart
    initDailyChart() {
        const ctx = document.getElementById('dailyChart').getContext('2d');
        
        // Generate last 7 days
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('ar-SA');
        }).reverse();
        
        const dailyData = last7Days.map(date => {
            return this.registrations.filter(reg => {
                return new Date(reg.timestamp).toLocaleDateString('ar-SA') === date;
            }).length;
        });
        
        this.charts.dailyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'التسجيلات اليومية',
                    data: dailyData,
                    backgroundColor: '#00d4ff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Revenue analysis chart
    initRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        const revenueByType = {
            'سوريا مدفوع': 0,
            'دولي': 0
        };
        
        this.registrations.forEach(reg => {
            if (reg.registrationType === 'syria-paid') {
                revenueByType['سوريا مدفوع'] += reg.amount || 0;
            } else if (reg.registrationType === 'international') {
                revenueByType['دولي'] += reg.amount || 0;
            }
        });
        
        this.charts.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(revenueByType),
                datasets: [{
                    label: 'الإيرادات ($)',
                    data: Object.values(revenueByType),
                    backgroundColor: ['#10b981', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Populate tables
    populateTables() {
        this.populateRecentRegistrations();
        this.populateAllRegistrations();
    }
    
    // Populate recent registrations table
    populateRecentRegistrations() {
        const tbody = document.getElementById('recent-registrations-body');
        const recent = this.registrations
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        tbody.innerHTML = recent.map(reg => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${reg.firstName} ${reg.lastName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${reg.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${this.getCountryLabel(reg.country)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${this.getRegistrationTypeLabel(reg.registrationType)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${this.getStatusClass(reg.status)}">${this.getStatusLabel(reg.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${this.formatDate(reg.timestamp)}</td>
            </tr>
        `).join('');
    }
    
    // Populate all registrations table
    populateAllRegistrations() {
        const tbody = document.getElementById('all-registrations-body');
        
        tbody.innerHTML = this.registrations
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(reg => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${reg.firstName} ${reg.lastName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${reg.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${reg.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${this.getCountryLabel(reg.country)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${this.getRegistrationTypeLabel(reg.registrationType)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">$${reg.amount || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${this.getStatusClass(reg.status)}">${this.getStatusLabel(reg.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${this.formatDate(reg.timestamp)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="action-button btn-view ml-2" onclick="viewRegistration('${reg.id}')">عرض</button>
                    <button class="action-button btn-edit ml-2" onclick="editRegistration('${reg.id}')">تعديل</button>
                    <button class="action-button btn-delete" onclick="deleteRegistration('${reg.id}')">حذف</button>
                </td>
            </tr>
        `).join('');
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Search and filter functionality
        document.getElementById('search-input')?.addEventListener('input', () => this.filterRegistrations());
        document.getElementById('country-filter')?.addEventListener('change', () => this.filterRegistrations());
        document.getElementById('type-filter')?.addEventListener('change', () => this.filterRegistrations());
        document.getElementById('status-filter')?.addEventListener('change', () => this.filterRegistrations());
        
        // Form submissions
        document.getElementById('bulk-email-form')?.addEventListener('submit', (e) => this.handleBulkEmail(e));
        document.getElementById('course-settings-form')?.addEventListener('submit', (e) => this.handleCourseSettings(e));
        document.getElementById('system-settings-form')?.addEventListener('submit', (e) => this.handleSystemSettings(e));
    }
    
    // Filter registrations
    filterRegistrations() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const countryFilter = document.getElementById('country-filter')?.value || '';
        const typeFilter = document.getElementById('type-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        
        const filtered = this.registrations.filter(reg => {
            const matchesSearch = !searchTerm || 
                                 reg.firstName.toLowerCase().includes(searchTerm) ||
                                 reg.lastName.toLowerCase().includes(searchTerm) ||
                                 reg.email.toLowerCase().includes(searchTerm);
            
            const matchesCountry = !countryFilter || reg.country === countryFilter;
            const matchesType = !typeFilter || reg.registrationType === typeFilter;
            const matchesStatus = !statusFilter || reg.status === statusFilter;
            
            return matchesSearch && matchesCountry && matchesType && matchesStatus;
        });
        
        this.updateFilteredTable(filtered);
    }
    
    // Update filtered table
    updateFilteredTable(filteredData) {
        const tbody = document.getElementById('all-registrations-body');
        
        tbody.innerHTML = filteredData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(reg => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${reg.firstName} ${reg.lastName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${reg.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${reg.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${this.getCountryLabel(reg.country)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${this.getRegistrationTypeLabel(reg.registrationType)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">$${reg.amount || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${this.getStatusClass(reg.status)}">${this.getStatusLabel(reg.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${this.formatDate(reg.timestamp)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="action-button btn-view ml-2" onclick="viewRegistration('${reg.id}')">عرض</button>
                    <button class="action-button btn-edit ml-2" onclick="editRegistration('${reg.id}')">تعديل</button>
                    <button class="action-button btn-delete" onclick="deleteRegistration('${reg.id}')">حذف</button>
                </td>
            </tr>
        `).join('');
    }
    
    // Handle bulk email
    async handleBulkEmail(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const emailData = {
            recipients: formData.get('recipients'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Filter recipients based on selection
        let recipients = [];
        switch (emailData.recipients) {
            case 'all':
                recipients = this.registrations;
                break;
            case 'confirmed':
                recipients = this.registrations.filter(r => r.status === 'confirmed');
                break;
            case 'pending':
                recipients = this.registrations.filter(r => r.status === 'pending');
                break;
            case 'syria':
                recipients = this.registrations.filter(r => r.country === 'syria');
                break;
            case 'international':
                recipients = this.registrations.filter(r => r.registrationType === 'international');
                break;
        }
        
        // Simulate sending emails
        console.log(`Sending email to ${recipients.length} recipients:`, emailData);
        
        // In production, this would call your email API
        try {
            // Simulate API call
            await this.simulateEmailSending(recipients, emailData);
            alert(`تم إرسال الإيميل بنجاح إلى ${recipients.length} مشارك`);
            e.target.reset();
        } catch (error) {
            alert('حدث خطأ في إرسال الإيميلات');
            console.error('Email sending error:', error);
        }
    }
    
    // Simulate email sending
    async simulateEmailSending(recipients, emailData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Emails sent successfully');
                resolve();
            }, 2000);
        });
    }
    
    // Handle course settings
    handleCourseSettings(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settings = {
            startDate: formData.get('startDate'),
            syriaPrice: parseInt(formData.get('syriaPrice')),
            internationalPrice: parseInt(formData.get('internationalPrice')),
            maxParticipants: parseInt(formData.get('maxParticipants')),
            enableRegistration: formData.has('enableRegistration')
        };
        
        // Save settings to localStorage (in production, save to backend)
        localStorage.setItem('courseSettings', JSON.stringify(settings));
        alert('تم حفظ إعدادات الدورة بنجاح');
    }
    
    // Handle system settings
    handleSystemSettings(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settings = {
            stripePublicKey: formData.get('stripePublicKey'),
            zohoCRMToken: formData.get('zohoCRMToken'),
            smtpHost: formData.get('smtpHost'),
            smtpEmail: formData.get('smtpEmail')
        };
        
        // Save settings to localStorage (in production, save to backend securely)
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        alert('تم حفظ إعدادات النظام بنجاح');
    }
    
    // Utility functions
    getRegistrationTypeLabel(type) {
        const labels = {
            'syria-free': 'سوريا مجاني',
            'syria-paid': 'سوريا مدفوع',
            'international': 'دولي'
        };
        return labels[type] || type;
    }
    
    getCountryLabel(country) {
        const labels = {
            'syria': 'سوريا',
            'lebanon': 'لبنان',
            'jordan': 'الأردن',
            'iraq': 'العراق',
            'egypt': 'مصر',
            'saudi': 'السعودية',
            'uae': 'الإمارات',
            'qatar': 'قطر',
            'kuwait': 'الكويت',
            'bahrain': 'البحرين',
            'oman': 'عمان',
            'palestine': 'فلسطين',
            'morocco': 'المغرب',
            'tunisia': 'تونس',
            'algeria': 'الجزائر',
            'libya': 'ليبيا',
            'sudan': 'السودان',
            'yemen': 'اليمن',
            'other': 'أخرى'
        };
        return labels[country] || country;
    }
    
    getStatusLabel(status) {
        const labels = {
            'confirmed': 'مؤكد',
            'pending': 'قيد الانتظار',
            'cancelled': 'ملغي'
        };
        return labels[status] || status;
    }
    
    getStatusClass(status) {
        const classes = {
            'confirmed': 'status-confirmed',
            'pending': 'status-pending',
            'cancelled': 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    }
    
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Global functions for HTML onclick events
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).style.display = 'block';
    
    // Add active class to clicked sidebar item
    event.target.closest('.sidebar-item').classList.add('active');
}

function viewRegistration(id) {
    const registration = dashboard.registrations.find(r => r.id === id);
    if (!registration) return;
    
    const modal = document.getElementById('registration-modal');
    const details = document.getElementById('registration-details');
    
    details.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 class="font-semibold text-gray-700 mb-2">المعلومات الشخصية</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>الاسم:</strong> ${registration.firstName} ${registration.lastName}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${registration.email}</p>
                    <p><strong>الهاتف:</strong> ${registration.phone}</p>
                    <p><strong>البلد:</strong> ${dashboard.getCountryLabel(registration.country)}</p>
                </div>
            </div>
            
            <div>
                <h3 class="font-semibold text-gray-700 mb-2">معلومات التسجيل</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>نوع التسجيل:</strong> ${dashboard.getRegistrationTypeLabel(registration.registrationType)}</p>
                    <p><strong>المبلغ:</strong> $${registration.amount || 0}</p>
                    <p><strong>طريقة الدفع:</strong> ${registration.paymentMethod}</p>
                    <p><strong>الحالة:</strong> <span class="status-badge ${dashboard.getStatusClass(registration.status)}">${dashboard.getStatusLabel(registration.status)}</span></p>
                    ${registration.discountCode ? `<p><strong>كود الخصم:</strong> ${registration.discountCode}</p>` : ''}
                    <p><strong>كود الوصول:</strong> <code class="bg-gray-100 px-2 py-1 rounded">${registration.accessCode}</code></p>
                </div>
            </div>
            
            <div class="md:col-span-2">
                <h3 class="font-semibold text-gray-700 mb-2">معلومات تقنية</h3>
                <div class="space-y-2 text-sm text-gray-600">
                    <p><strong>تاريخ التسجيل:</strong> ${dashboard.formatDate(registration.timestamp)}</p>
                    <p><strong>عنوان IP:</strong> ${registration.ipAddress}</p>
                    <p><strong>معرف التسجيل:</strong> ${registration.id}</p>
                </div>
            </div>
        </div>
        
        <div class="mt-6 flex space-x-3 space-x-reverse">
            <button onclick="closeRegistrationModal()" class="obai-btn-secondary">إغلاق</button>
            <button onclick="editRegistration('${registration.id}')" class="obai-btn">تعديل</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function editRegistration(id) {
    // This would open an edit form
    alert(`تعديل التسجيل ${id} - سيتم إضافة هذه الميزة قريباً`);
}

function deleteRegistration(id) {
    if (confirm('هل أنت متأكد من حذف هذا التسجيل؟')) {
        dashboard.registrations = dashboard.registrations.filter(r => r.id !== id);
        localStorage.setItem('courseRegistrations', JSON.stringify(dashboard.registrations));
        dashboard.updateStats();
        dashboard.populateTables();
        alert('تم حذف التسجيل بنجاح');
    }
}

function closeRegistrationModal() {
    document.getElementById('registration-modal').style.display = 'none';
}

function generateNewCode() {
    const code = 'SYRIA-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    alert(`تم إنشاء كود جديد: ${code}`);
}

function exportRegistrations() {
    // Convert registrations to CSV
    const headers = ['الاسم الأول', 'اسم العائلة', 'البريد الإلكتروني', 'الهاتف', 'البلد', 'نوع التسجيل', 'المبلغ', 'الحالة', 'التاريخ'];
    const rows = dashboard.registrations.map(reg => [
        reg.firstName,
        reg.lastName,
        reg.email,
        reg.phone,
        dashboard.getCountryLabel(reg.country),
        dashboard.getRegistrationTypeLabel(reg.registrationType),
        reg.amount || 0,
        dashboard.getStatusLabel(reg.status),
        dashboard.formatDate(reg.timestamp)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function loadEmailTemplate(templateType) {
    const templates = {
        welcome: {
            subject: 'مرحباً بك في دورة الذكاء الاصطناعي الشاملة',
            message: 'مرحباً {{firstName}},\\n\\nنرحب بك في دورة الذكاء الاصطناعي الشاملة. نتطلع لرؤيتك في الدورة التي ستبدأ في 15 ديسمبر 2025.\\n\\nكود الوصول الخاص بك: {{accessCode}}\\n\\nتحياتنا,\\nفريق أُبي سكر'
        },
        reminder: {
            subject: 'تذكير: دورة الذكاء الاصطناعي تبدأ غداً',
            message: 'مرحباً {{firstName}},\\n\\nنذكرك بأن دورة الذكاء الاصطناعي الشاملة ستبدأ غداً. تأكد من تجهيز جهازك والاتصال بالإنترنت.\\n\\nرابط الوصول: {{courseLink}}\\n\\nنراك قريباً!'
        },
        access: {
            subject: 'معلومات الوصول لدورة الذكاء الاصطناعي',
            message: 'مرحباً {{firstName}},\\n\\nإليك معلومات الوصول الكاملة للدورة:\\n\\nكود الوصول: {{accessCode}}\\nرابط المنصة: {{platformLink}}\\nمجموعة التليجرام: {{telegramLink}}\\n\\nموفقين!'
        },
        completion: {
            subject: 'تهانينا! أتممت دورة الذكاء الاصطناعي بنجاح',
            message: 'عزيزي {{firstName}},\\n\\nتهانينا الحارة على إتمام دورة الذكاء الاصطناعي الشاملة بنجاح!\\n\\nيمكنك الآن تحميل شهادة الإتمام من الرابط التالي:\\n{{certificateLink}}\\n\\nنفخر بإنجازك ونتمنى لك التوفيق في مسيرتك!'
        }
    };
    
    const template = templates[templateType];
    if (template) {
        document.querySelector('[name="subject"]').value = template.subject;
        document.querySelector('[name="message"]').value = template.message;
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
});