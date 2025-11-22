// Reseller Dashboard JavaScript
class ResellerDashboard {
    constructor() {
        this.resellerId = this.getResellerId();
        this.resellerData = this.loadResellerData();
        this.sales = this.loadSales();
        this.generatedCodes = this.loadGeneratedCodes();
        
        this.init();
    }
    
    init() {
        this.updateStats();
        this.populateRecentSales();
        this.initMonthlyChart();
        this.loadResellerProfile();
    }
    
    // Get reseller ID (in production, this would come from authentication)
    getResellerId() {
        // For demo, generate a unique ID
        let resellerId = localStorage.getItem('resellerId');
        if (!resellerId) {
            resellerId = 'RESELLER_' + Date.now().toString();
            localStorage.setItem('resellerId', resellerId);
        }
        return resellerId;
    }
    
    // Load reseller data
    loadResellerData() {
        const defaultData = {
            id: this.resellerId,
            name: 'أحمد محمد',
            email: 'ahmed.reseller@example.com',
            phone: '+963123456789',
            commissionRate: 0.10, // 10% commission ($5 per $50 ticket)
            joinDate: new Date().toISOString(),
            status: 'active'
        };
        
        const stored = localStorage.getItem(`reseller_${this.resellerId}`);
        return stored ? JSON.parse(stored) : defaultData;
    }
    
    // Load sales data
    loadSales() {
        const stored = localStorage.getItem(`sales_${this.resellerId}`);
        return stored ? JSON.parse(stored) : this.generateSampleSales();
    }
    
    // Load generated codes
    loadGeneratedCodes() {
        const stored = localStorage.getItem(`codes_${this.resellerId}`);
        return stored ? JSON.parse(stored) : [];
    }
    
    // Generate sample sales for demonstration
    generateSampleSales() {
        const sampleSales = [
            {
                id: 'SALE_001',
                code: 'AHMED-SYRIA-ABC123',
                studentName: 'محمد علي',
                studentEmail: 'mohamed.ali@example.com',
                amount: 50,
                commission: 5,
                status: 'confirmed',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                paymentMethod: 'cash'
            },
            {
                id: 'SALE_002',
                code: 'AHMED-SYRIA-DEF456',
                studentName: 'فاطمة حسن',
                studentEmail: 'fatima.hassan@example.com',
                amount: 50,
                commission: 5,
                status: 'confirmed',
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                paymentMethod: 'cash'
            },
            {
                id: 'SALE_003',
                code: 'AHMED-SYRIA-GHI789',
                studentName: 'عمر يوسف',
                studentEmail: 'omar.youssef@example.com',
                amount: 50,
                commission: 5,
                status: 'pending',
                timestamp: new Date().toISOString(), // Today
                paymentMethod: 'cash'
            }
        ];
        
        this.saveSales(sampleSales);
        return sampleSales;
    }
    
    // Save sales data
    saveSales(sales) {
        localStorage.setItem(`sales_${this.resellerId}`, JSON.stringify(sales));
    }
    
    // Save generated codes
    saveGeneratedCodes(codes) {
        localStorage.setItem(`codes_${this.resellerId}`, JSON.stringify(codes));
    }
    
    // Update statistics
    updateStats() {
        const confirmedSales = this.sales.filter(sale => sale.status === 'confirmed');
        const pendingSales = this.sales.filter(sale => sale.status === 'pending');
        
        const totalSales = this.sales.length;
        const totalCommission = confirmedSales.reduce((sum, sale) => sum + sale.commission, 0);
        const pendingCommission = pendingSales.reduce((sum, sale) => sum + sale.commission, 0);
        
        // Calculate conversion rate (for demo, using a formula)
        const generatedCodesCount = this.generatedCodes.length;
        const conversionRate = generatedCodesCount > 0 ? ((totalSales / generatedCodesCount) * 100).toFixed(1) : 0;
        
        document.getElementById('total-sales').textContent = totalSales;
        document.getElementById('total-commission').textContent = `$${totalCommission}`;
        document.getElementById('pending-commission').textContent = `$${pendingCommission}`;
        document.getElementById('conversion-rate').textContent = `${conversionRate}%`;
        
        // Update commission breakdown
        document.getElementById('tickets-sold').textContent = confirmedSales.length;
        document.getElementById('total-amount').textContent = `$${confirmedSales.reduce((sum, sale) => sum + sale.amount, 0)}`;
        document.getElementById('your-commission').textContent = `$${totalCommission}`;
    }
    
    // Populate recent sales table
    populateRecentSales() {
        const tbody = document.getElementById('recent-sales-body');
        const recentSales = this.sales
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
        
        tbody.innerHTML = recentSales.map(sale => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">${sale.code}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${sale.studentName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">$${sale.amount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm commission-earned">$${sale.commission}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${this.getStatusClass(sale.status)}">${this.getStatusLabel(sale.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${this.formatDate(sale.timestamp)}</td>
            </tr>
        `).join('');
    }
    
    // Initialize monthly performance chart
    initMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        // Generate last 6 months data
        const months = [];
        const salesData = [];
        const commissionData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('ar-SA', { month: 'short' }));
            
            // Simulate monthly data
            const monthlySales = Math.floor(Math.random() * 10) + (i === 0 ? this.sales.filter(s => s.status === 'confirmed').length : 0);
            const monthlyCommission = monthlySales * 5;
            
            salesData.push(monthlySales);
            commissionData.push(monthlyCommission);
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'المبيعات',
                        data: salesData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'العمولة ($)',
                        data: commissionData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'الشهر'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'عدد المبيعات'
                        },
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'العمولة ($)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }
    
    // Load reseller profile
    loadResellerProfile() {
        document.getElementById('reseller-name').textContent = this.resellerData.name;
        document.getElementById('reseller-avatar').textContent = this.resellerData.name.charAt(0);
    }
    
    // Generate new codes
    generateCodes() {
        const quantity = parseInt(document.getElementById('code-quantity').value) || 1;
        const ticketType = document.getElementById('ticket-type').value;
        
        if (quantity < 1 || quantity > 50) {
            alert('يرجى إدخال عدد بين 1 و 50');
            return;
        }
        
        const newCodes = [];
        const resellerPrefix = this.resellerData.name.split(' ')[0].toUpperCase();
        
        for (let i = 0; i < quantity; i++) {
            const code = this.generateUniqueCode(resellerPrefix);
            newCodes.push({
                code: code,
                resellerId: this.resellerId,
                resellerName: this.resellerData.name,
                ticketType: ticketType,
                amount: 50,
                commission: 5,
                status: 'unused',
                generatedAt: new Date().toISOString(),
                usedAt: null,
                studentInfo: null
            });
        }
        
        // Add to generated codes array
        this.generatedCodes.push(...newCodes);
        this.saveGeneratedCodes(this.generatedCodes);
        
        // Display the codes
        this.displayGeneratedCodes(newCodes);
        
        // Show the generated codes section
        document.getElementById('generated-codes-section').style.display = 'block';
        
        // Update stats
        this.updateStats();
        
        console.log('Generated codes:', newCodes);
    }
    
    // Generate unique code
    generateUniqueCode(prefix) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}-SYRIA-${timestamp}${random}`;
    }
    
    // Display generated codes
    displayGeneratedCodes(codes) {
        const container = document.getElementById('codes-display');
        
        const codesHtml = codes.map(codeData => `
            <div class="coupon-preview">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-lg text-gray-800">دورة الذكاء الاصطناعي</h4>
                        <p class="text-sm text-gray-600">أُبي سكر</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600">$50</div>
                        <div class="text-xs text-gray-500">سوريا</div>
                    </div>
                </div>
                
                <div class="bg-gray-100 p-3 rounded-lg mb-4">
                    <div class="text-xs text-gray-500 mb-1">كود الخصم</div>
                    <div class="font-mono font-bold text-lg">${codeData.code}</div>
                </div>
                
                <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>صالح حتى: 15 يناير 2026</span>
                    <span>موزع: ${this.resellerData.name}</span>
                </div>
                
                <div class="qr-code-container mb-4">
                    <canvas id="qr-${codeData.code}" width="100" height="100"></canvas>
                </div>
                
                <div class="flex space-x-2 space-x-reverse">
                    <button onclick="printSingleCoupon('${codeData.code}')" class="print-btn flex-1">طباعة</button>
                    <button onclick="shareCoupon('${codeData.code}')" class="obai-btn-secondary flex-1 text-xs">مشاركة</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = codesHtml;
        
        // Generate QR codes
        codes.forEach(codeData => {
            this.generateQRCode(codeData.code);
        });
    }
    
    // Generate QR code
    generateQRCode(code) {
        const canvas = document.getElementById(`qr-${code}`);
        if (canvas) {
            const registrationUrl = `https://aisurvey.obaisukar.com/?code=${code}&reseller=${this.resellerId}`;
            
            QRCode.toCanvas(canvas, registrationUrl, {
                width: 100,
                height: 100,
                color: {
                    dark: '#1a365d',
                    light: '#ffffff'
                }
            }, function (error) {
                if (error) console.error('QR Code generation error:', error);
            });
        }
    }
    
    // Utility functions
    getStatusClass(status) {
        const classes = {
            'confirmed': 'status-confirmed',
            'pending': 'status-pending',
            'cancelled': 'status-cancelled',
            'unused': 'status-pending'
        };
        return classes[status] || 'status-pending';
    }
    
    getStatusLabel(status) {
        const labels = {
            'confirmed': 'مؤكد',
            'pending': 'قيد الانتظار',
            'cancelled': 'ملغي',
            'unused': 'غير مستخدم'
        };
        return labels[status] || status;
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

// Global functions
function generateCodes() {
    dashboard.generateCodes();
}

function printAllCoupons() {
    const codes = dashboard.generatedCodes.filter(code => code.status === 'unused');
    if (codes.length === 0) {
        alert('لا توجد كوبونات للطباعة');
        return;
    }
    
    // Create a print-friendly page
    const printWindow = window.open('', '_blank');
    const printContent = codes.map(codeData => `
        <div class="coupon-print" style="page-break-after: always; padding: 20px; border: 2px dashed #ccc; margin-bottom: 20px;">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                <h2 style="margin: 0; color: #1a365d;">دورة الذكاء الاصطناعي الشاملة</h2>
                <p style="margin: 5px 0; color: #666;">أُبي سكر - 15 ديسمبر 2025</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 24px; font-weight: bold; color: #10b981;">$50</div>
                    <div style="font-size: 14px; color: #666;">تذكرة سوريا</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #666;">موزع:</div>
                    <div style="font-weight: bold;">${dashboard.resellerData.name}</div>
                </div>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">كود التسجيل</div>
                <div style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${codeData.code}</div>
            </div>
            
            <div style="font-size: 12px; color: #666; text-align: center;">
                <p>للتسجيل: aisurvey.obaisukar.com</p>
                <p>صالح حتى: 15 يناير 2026</p>
                <p>أو ادفع كاش للموزع واحصل على الكود</p>
            </div>
        </div>
    `).join('');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>طباعة الكوبونات</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                @media print { 
                    .coupon-print { page-break-after: always; }
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function printSingleCoupon(code) {
    const codeData = dashboard.generatedCodes.find(c => c.code === code);
    if (!codeData) return;
    
    // Similar to printAllCoupons but for single coupon
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>كوبون - ${code}</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                .coupon { border: 2px dashed #ccc; padding: 30px; max-width: 400px; margin: 0 auto; }
            </style>
        </head>
        <body>
            <div class="coupon">
                <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                    <h2 style="margin: 0; color: #1a365d;">دورة الذكاء الاصطناعي الشاملة</h2>
                    <p style="margin: 5px 0; color: #666;">أُبي سكر - 15 ديسمبر 2025</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 28px; font-weight: bold; color: #10b981;">$50</div>
                        <div style="font-size: 16px; color: #666;">تذكرة سوريا</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: #666;">موزع:</div>
                        <div style="font-weight: bold;">${dashboard.resellerData.name}</div>
                    </div>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">كود التسجيل</div>
                    <div style="font-family: monospace; font-size: 22px; font-weight: bold; letter-spacing: 3px;">${code}</div>
                </div>
                
                <div style="font-size: 14px; color: #666; text-align: center; line-height: 1.6;">
                    <p>للتسجيل: <strong>aisurvey.obaisukar.com</strong></p>
                    <p>صالح حتى: <strong>15 يناير 2026</strong></p>
                    <p>أو ادفع كاش للموزع واحصل على الكود</p>
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function shareCoupon(code) {
    const shareText = `كوبون دورة الذكاء الاصطناعي الشاملة - أُبي سكر
تذكرة بقيمة $50
كود التسجيل: ${code}

للتسجيل: https://aisurvey.obaisukar.com/?code=${code}

صالح حتى 15 يناير 2026`;

    if (navigator.share) {
        navigator.share({
            title: 'كوبون دورة الذكاء الاصطناعي',
            text: shareText,
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('تم نسخ تفاصيل الكوبون! يمكنك مشاركتها الآن.');
        });
    }
}

function requestPayout() {
    const totalCommission = dashboard.sales
        .filter(sale => sale.status === 'confirmed')
        .reduce((sum, sale) => sum + sale.commission, 0);
    
    if (totalCommission === 0) {
        alert('لا توجد عمولة متاحة للصرف');
        return;
    }
    
    const confirmed = confirm(`هل تريد طلب صرف عمولة بقيمة $${totalCommission}؟`);
    if (confirmed) {
        // In production, this would call an API
        alert(`تم إرسال طلب صرف عمولة بقيمة $${totalCommission}. سيتم التواصل معك خلال 24 ساعة.`);
        
        // Log the payout request
        console.log('Payout requested:', {
            resellerId: dashboard.resellerId,
            amount: totalCommission,
            timestamp: new Date().toISOString()
        });
    }
}

function downloadSalesReport() {
    const sales = dashboard.sales;
    const csv = [
        ['الكود', 'اسم الطالب', 'البريد الإلكتروني', 'المبلغ', 'العمولة', 'الحالة', 'التاريخ'],
        ...sales.map(sale => [
            sale.code,
            sale.studentName,
            sale.studentEmail,
            sale.amount,
            sale.commission,
            dashboard.getStatusLabel(sale.status),
            dashboard.formatDate(sale.timestamp)
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${dashboard.resellerId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function viewCommissionHistory() {
    alert('سيتم إضافة صفحة سجل العمولات قريباً');
}

function contactSupport() {
    const message = `السلام عليكم،

أنا ${dashboard.resellerData.name} - موزع دورة الذكاء الاصطناعي
معرف الموزع: ${dashboard.resellerId}

أحتاج مساعدة في:
[اكتب مشكلتك هنا]

شكراً لكم`;
    
    const mailtoLink = `mailto:support@obaisukar.com?subject=طلب دعم - موزع&body=${encodeURIComponent(message)}`;
    window.open(mailtoLink);
}

function closeCouponModal() {
    document.getElementById('coupon-modal').style.display = 'none';
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ResellerDashboard();
});