# دورة الذكاء الاصطناعي الشاملة - نظام التسجيل
## AI Course Registration System

نظام تسجيل متكامل لدورة الذكاء الاصطناعي الشاملة مع دعم الدفع المتعدد والإدارة الشاملة.

### المميزات الرئيسية

#### 🎯 **نظام دفع متعدد**
- **Stripe** للدفع الدولي ($150)
- **دفع محلي سوري** ($50)
- **أكواد خصم مجانية** للمحتاجين في سوريا
- **حماية IP** - كل كود يُستخدم مرة واحدة لكل جهاز

#### 🎨 **تصميم احترافي**
- **تصميم عربي متجاوب** مع دعم RTL كامل
- **ألوان العلامة التجارية** لأُبي سكر
- **تأثيرات بصرية متقدمة** وانيميشن
- **تحسين لجميع الشاشات** (ديسكتوب، تابلت، موبايل)

#### 📊 **لوحة تحكم شاملة**
- **إحصائيات فورية** للتسجيلات والإيرادات
- **رسوم بيانية تفاعلية** للتحليل
- **إدارة التسجيلات** (عرض، تعديل، حذف)
- **إرسال إيميلات جماعية** مع قوالب جاهزة
- **تصدير البيانات** إلى Excel

#### 🔄 **تكامل خارجي**
- **Zoho CRM** لإدارة العملاء
- **نظام إيميل تلقائي** مع قوالب
- **تتبع التسجيلات** بالوقت الفعلي

### البنية التقنية

```
ai-course-registration/
├── index.html              # الصفحة الرئيسية
├── assets/
│   ├── css/
│   │   └── brand-styles.css # أنماط العلامة التجارية
│   ├── js/
│   │   └── payment-handler.js # معالج الدفع والتسجيل
│   └── images/             # الصور والأيقونات
├── admin/
│   ├── dashboard.html      # لوحة التحكم
│   └── dashboard.js        # منطق لوحة التحكم
├── backend/               # ملفات الخادم (اختيارية)
└── README.md              # هذا الملف
```

### المتطلبات التقنية

#### 🌐 **Frontend**
- **HTML5** مع دعم RTL
- **CSS3** مع Flexbox و Grid
- **JavaScript ES6+**
- **TailwindCSS** للتصميم
- **Chart.js** للرسوم البيانية

#### 💳 **الدفع**
- **Stripe Elements** للدفع الدولي
- **واجهة برمجية محلية** للدفع السوري

#### 🗄️ **قاعدة البيانات**
- **LocalStorage** (للتجربة)
- **يمكن التكامل مع**: MySQL, PostgreSQL, MongoDB

### التثبيت والإعداد

#### 1. **إعداد الملفات الأساسية**

```bash
# نسخ الملفات
git clone [repository-url]
cd ai-course-registration

# إعداد التكوين
cp config.example.js config.js
```

#### 2. **إعداد Stripe**

في ملف `assets/js/payment-handler.js`:

```javascript
// استبدل بمفتاح Stripe الفعلي
const stripe = Stripe('pk_live_your_actual_stripe_key_here');
```

في إعدادات Stripe Dashboard:
- أضف webhook endpoints
- فعّل payment methods المطلوبة

#### 3. **إعداد قاعدة البيانات**

**للإنتاج - MySQL Example:**

```sql
CREATE DATABASE ai_course_db;

CREATE TABLE registrations (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(50),
    registration_type ENUM('syria-free', 'syria-paid', 'international'),
    amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    discount_code VARCHAR(50),
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    access_code VARCHAR(50) UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE discount_codes (
    code VARCHAR(50) PRIMARY KEY,
    discount_type ENUM('percentage', 'fixed', 'free'),
    discount_value DECIMAL(10,2),
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إضافة الأكواد الافتراضية
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses) VALUES
('ObaiLovesAi', 'free', 0, 100),
('SYRIA2025', 'free', 0, 50);

CREATE TABLE ip_validation (
    ip_address VARCHAR(45),
    discount_code VARCHAR(50),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip_address, discount_code)
);
```

#### 4. **إعداد Backend API (Node.js Example)**

```javascript
// server.js
const express = require('express');
const mysql = require('mysql2');
const stripe = require('stripe')('sk_live_your_secret_key');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// إعداد قاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'ai_course_db'
});

// API endpoints
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, userData } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            metadata: {
                user_email: userData.email,
                user_name: `${userData.firstName} ${userData.lastName}`
            }
        });
        
        res.send({
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/api/registrations', async (req, res) => {
    try {
        const registration = req.body;
        
        // إدراج في قاعدة البيانات
        const query = `
            INSERT INTO registrations 
            (id, first_name, last_name, email, phone, country, registration_type, 
             amount, payment_method, discount_code, status, access_code, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.promise().execute(query, [
            registration.registrationId || `REG_${Date.now()}`,
            registration.firstName,
            registration.lastName,
            registration.email,
            registration.phone,
            registration.country,
            registration.registrationType,
            registration.amount,
            registration.paymentMethod,
            registration.discountCode,
            registration.status,
            registration.accessCode,
            registration.ipAddress,
            registration.userAgent
        ]);
        
        res.status(201).send({ message: 'Registration saved successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### 5. **رفع الموقع على Digital Ocean**

#### **الطريقة 1: Static Hosting**

```bash
# إنشاء Droplet
# Ubuntu 20.04, اختر الحجم المناسب

# تثبيت Nginx
sudo apt update
sudo apt install nginx

# نسخ الملفات
sudo cp -r ai-course-registration/* /var/www/html/

# إعداد Nginx للـ SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d aisurvey.obaisukar.com

# إعداد Nginx configuration
sudo nano /etc/nginx/sites-available/aisurvey.obaisukar.com
```

**ملف Nginx:**

```nginx
server {
    listen 80;
    server_name aisurvey.obaisukar.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name aisurvey.obaisukar.com;
    
    ssl_certificate /etc/letsencrypt/live/aisurvey.obaisukar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aisurvey.obaisukar.com/privkey.pem;
    
    root /var/www/html;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /admin {
        try_files $uri $uri/ /admin/dashboard.html;
        # إضافة حماية للوحة التحكم
        auth_basic "Admin Panel";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### **الطريقة 2: App Platform**

```yaml
# .do/app.yaml
name: ai-course-registration
services:
- name: web
  source_dir: /
  github:
    repo: your-username/ai-course-registration
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  domains:
  - domain: aisurvey.obaisukar.com
    type: PRIMARY
  envs:
  - key: STRIPE_PUBLISHABLE_KEY
    value: pk_live_your_key_here
    type: SECRET
  - key: STRIPE_SECRET_KEY
    value: sk_live_your_key_here
    type: SECRET
```

### 6. **إعداد Zoho CRM Integration**

```javascript
// في payment-handler.js
async function sendToZohoCRM(registrationData) {
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
        'Access_Code': registrationData.accessCode
    };
    
    const response = await fetch('https://www.zohoapis.com/crm/v2/Leads', {
        method: 'POST',
        headers: {
            'Authorization': 'Zoho-oauthtoken YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [zohoCRMData] })
    });
}
```

### الاستخدام

#### **للطلاب:**
1. زيارة `https://aisurvey.obaisukar.com`
2. مشاهدة فيديو تعريفي بالدورة
3. اختيار نوع التسجيل:
   - **سوريا مدفوع** ($50)
   - **سوريا مجاني** (بكود خصم)
   - **دولي** ($150)
4. ملء النموذج والدفع
5. استلام كود الوصول

#### **للمدير:**
1. زيارة `https://aisurvey.obaisukar.com/admin`
2. مراجعة الإحصائيات
3. إدارة التسجيلات
4. إرسال إيميلات جماعية
5. تصدير البيانات

### الحماية والأمان

#### 🔒 **حماية البيانات**
- **تشفير SSL** إجباري
- **تحقق IP** للأكواد المجانية
- **حماية CSRF** للنماذج
- **تشفير كلمات المرور** للوحة التحكم

#### 🛡️ **حماية من الاحتيال**
- **حد أقصى للاستخدام** لكل كود
- **تتبع IP Address**
- **التحقق من البريد الإلكتروني**
- **مراجعة يدوية** للحالات المشبوهة

### المتابعة والصيانة

#### 📊 **المراقبة**
- **Google Analytics** لتتبع الزيارات
- **Stripe Dashboard** لمراقبة المدفوعات
- **لوحة التحكم الداخلية** للإحصائيات

#### 🔄 **النسخ الاحتياطي**
```bash
# نسخة احتياطية يومية لقاعدة البيانات
0 2 * * * mysqldump -u username -p password ai_course_db > /backups/db_$(date +\%Y\%m\%d).sql

# نسخة احتياطية للملفات
0 3 * * * tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz /var/www/html/
```

### الدعم الفني

#### 🆘 **في حالة المشاكل**
1. **فحص لوجات الخادم**: `sudo tail -f /var/log/nginx/error.log`
2. **فحص حالة البرنامج**: `sudo systemctl status nginx`
3. **اختبار قاعدة البيانات**: `mysql -u username -p -e "SELECT COUNT(*) FROM registrations;"`

#### 📧 **التواصل**
- **البريد الإلكتروني**: support@obaisukar.com
- **التليفون**: الرقم المخصص للدعم
- **GitHub Issues**: للمشاكل التقنية

### رقم الإصدار والتحديثات

**الإصدار الحالي**: v1.0.0
**تاريخ الإصدار**: يناير 2025

#### **التحديثات المخططة**:
- [ ] تطبيق موبايل
- [ ] دعم عملات إضافية
- [ ] نظام شهادات تلقائي
- [ ] لايف شات للدعم
- [ ] تكامل مع منصات أخرى

---

**تم تطويره بواسطة**: [اسمك/فريقك]  
**للاستفسارات**: [البريد الإلكتروني]  
**الترخيص**: [نوع الترخيص]