# MASTER CODING RULES - Updated
## Essential Guidelines for Ethical & Logical Development

**Version**: 2.1.0  
**Last Updated**: January 2025  
**Status**: ENFORCED ALWAYS

---

## 🎯 **CORE PRINCIPLES**

### **Rule #1: Absolute Truthfulness**
- **NEVER fabricate numbers, statistics, or claims**
- **NO made-up student counts, success rates, or testimonials**
- **Only state verifiable facts with proper sources**
- **If uncertain, clearly state it as an estimate or remove claim entirely**

### **Rule #2: Logical UX/UI Design**
- **NEVER show information users shouldn't see**
- **NO public display of discount codes meant to be private**
- **Every UI element must serve a logical purpose for the user**
- **If it doesn't make sense from user perspective, don't include it**

### **Rule #3: Ethical Claims & Certificates**
- **Only offer certificates you have legal right to provide**
- **"Certificate of Completion from Obai Sukar" is acceptable**
- **NEVER claim "certified" or "accredited" without proper authorization**
- **Be transparent about what the certificate represents**

### **Rule #4: Cultural Sensitivity & Accuracy**
- **Use proper Arabic terminology**: "أهلنا في سوريا" not "brothers"**
- **Respect cultural context and language nuances**
- **Verify translations with native speakers when possible**

### **Rule #5: Technical Security & Integrity**
- **Every security measure must actually work**
- **Code uniqueness must be genuinely enforced**
- **No fake security features for show**
- **Test all validation and prevention systems**

---

## 📋 **DETAILED IMPLEMENTATION RULES**

### **Information Display Guidelines:**
```
✅ CORRECT: Registration form without showing discount codes
✅ CORRECT: "Apply discount code" field for those who have one
❌ WRONG: Publicly displaying "Code: ObaiLovesAi"
❌ WRONG: Showing private information in public interfaces
```

### **Claims & Promises:**
```
✅ CORRECT: "Certificate of completion from Obai Sukar course"
✅ CORRECT: "Professional training certificate"
❌ WRONG: "Certified AI Professional"
❌ WRONG: "Accredited by [authority we don't have]"
```

### **Number & Statistics:**
```
✅ CORRECT: "Target: Up to 1000 students"
✅ CORRECT: "Estimated market size"
❌ WRONG: "1000+ students trained" (when we haven't trained any yet)
❌ WRONG: Specific numbers without verification
```

### **Cultural References:**
```
✅ CORRECT: "أهلنا في سوريا" (Our people in Syria)
✅ CORRECT: "للأشقاء في سوريا" (For our siblings in Syria)
❌ WRONG: "Brothers" (loses cultural nuance)
❌ WRONG: Generic "Syrian people"
```

---

## 🔒 **SECURITY & VALIDATION RULES**

### **Code Generation & Usage:**
```javascript
// MANDATORY: Unique code generation with proper validation
function generateUniqueCode() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const checksum = generateChecksum(timestamp, random);
    return `OBAI-${timestamp.toString(36).toUpperCase()}-${random}-${checksum}`;
}

// MANDATORY: Code usage tracking
function validateCodeUsage(code, ipAddress, userId) {
    // Check if code exists
    // Check if already used
    // Check IP restrictions
    // Log usage attempt
    // Return validation result
}
```

### **Data Integrity:**
```sql
-- MANDATORY: Proper database constraints
CREATE TABLE discount_codes (
    code VARCHAR(50) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    used_by VARCHAR(50) NULL,
    ip_address VARCHAR(45) NULL,
    max_uses INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    
    CONSTRAINT unique_usage UNIQUE(code, used_by),
    INDEX idx_usage_tracking (code, ip_address, used_at)
);
```

---

## 🎨 **UX/UI LOGIC RULES**

### **Information Architecture:**
1. **User-Centric View**: Only show what users need to see
2. **Progressive Disclosure**: Reveal information when appropriate
3. **Contextual Relevance**: Every element must serve the user's goal
4. **Privacy by Design**: Sensitive info hidden by default

### **Discount Code Handling:**
```html
<!-- ✅ CORRECT: Private discount field -->
<div class="discount-section" style="display: none;" id="discount-section">
    <label>كود الخصم (إن وجد)</label>
    <input type="text" name="discountCode" placeholder="أدخل كود الخصم">
    <button type="button" onclick="showDiscountField()">لدي كود خصم</button>
</div>

<!-- ❌ WRONG: Public code display -->
<div class="public-codes">
    <p>كود الخصم: ObaiLovesAi</p> <!-- NEVER DO THIS -->
</div>
```

### **Certificate Representation:**
```html
<!-- ✅ CORRECT: Honest certificate description -->
<div class="certificate-info">
    <h3>شهادة إتمام دورة</h3>
    <p>ستحصل على شهادة إتمام رسمية من أُبي سكر تؤكد مشاركتك في الدورة</p>
    <small>* شهادة تدريبية وليست شهادة أكاديمية معتمدة</small>
</div>

<!-- ❌ WRONG: False certification claims -->
<div class="false-claims">
    <h3>شهادة معتمدة دولياً</h3> <!-- WRONG if not true -->
    <p>مؤهل معترف به عالمياً</p> <!-- WRONG if not true -->
</div>
```

---

## 📊 **CONTENT ACCURACY STANDARDS**

### **Statistics & Numbers:**
```markdown
✅ CORRECT Examples:
- "المستهدف: 500-1000 طالب في المرحلة الأولى"
- "متوسط الراتب في هذا المجال: $50,000-80,000 (حسب Glassdoor 2024)"
- "نتوقع نمو السوق بنسبة 25% (حسب تقرير McKinsey)"

❌ WRONG Examples:
- "أكثر من 1000 طالب مدرب" (when we haven't trained anyone)
- "معدل نجاح 95%" (without proper data)
- "راتب مضمون $100,000" (false promise)
```

### **Market Claims:**
```markdown
✅ CORRECT:
- "أول دورة شاملة بالعربية في المنطقة" (if verifiable)
- "خبرة 25+ سنة في التكنولوجيا" (if true for instructor)
- "محتوى حصري ومطور خصيصاً"

❌ WRONG:
- "الأفضل في العالم" (unprovable)
- "نجح 10,000 طالب" (if false)
- "معدل نجاح 100%" (unrealistic)
```

---

## 🌍 **ARABIC LOCALIZATION RULES**

### **Terminology Standards:**
```
أهلنا في سوريا = Our people in Syria ✅
الأشقاء في سوريا = Our siblings in Syria ✅
brothers in Syria = إخواننا في سوريا ❌ (loses nuance)

تكلفة خاصة = Special cost ✅
سعر مخفض = Reduced price ✅
مجاني = Free ✅
خصم = Discount ✅
```

### **Cultural Context:**
- **Family Terms**: Use proper Arabic family/community terms
- **Respect**: Address audience with appropriate level of formality
- **Regional Awareness**: Acknowledge economic situations respectfully
- **Religious Sensitivity**: Avoid conflicts with cultural values

---

## 🔧 **TECHNICAL IMPLEMENTATION RULES**

### **Code Quality Standards:**
```javascript
// ✅ MANDATORY: Proper error handling
function processRegistration(data) {
    try {
        validateInput(data);
        checkCodeUniqueness(data.discountCode);
        processPayment(data);
        sendConfirmation(data);
        
        return { success: true, message: "Registration successful" };
    } catch (error) {
        logError(error, data);
        return { success: false, message: getErrorMessage(error) };
    }
}

// ❌ NEVER: Fake validation that doesn't work
function fakeValidation(code) {
    return true; // This doesn't actually validate anything
}
```

### **Security Implementation:**
```sql
-- ✅ MANDATORY: Real constraints and validations
CREATE TABLE code_usage_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_email VARCHAR(255),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    error_reason VARCHAR(255),
    
    FOREIGN KEY (code) REFERENCES discount_codes(code),
    INDEX idx_ip_tracking (ip_address, attempt_time),
    INDEX idx_code_usage (code, success)
);
```

---

## ✅ **COMPLIANCE CHECKLIST**

Before any release, verify:

### **Content Review:**
- [ ] No false claims or made-up statistics
- [ ] All numbers are verifiable or clearly marked as estimates
- [ ] Certificate descriptions are accurate and legal
- [ ] Cultural references are appropriate and respectful
- [ ] No private information displayed publicly

### **UX/UI Review:**
- [ ] Every displayed element serves a logical user purpose
- [ ] No confusing or illogical interface decisions
- [ ] Discount codes hidden from public view
- [ ] Progressive disclosure implemented properly
- [ ] User flow makes sense from customer perspective

### **Technical Review:**
- [ ] All security measures actually function
- [ ] Code uniqueness properly enforced
- [ ] Database constraints prevent abuse
- [ ] Error handling covers all scenarios
- [ ] Logging captures security events

### **Legal & Ethical Review:**
- [ ] No false advertising or misleading claims
- [ ] Privacy policy covers all data collection
- [ ] Terms of service are fair and legal
- [ ] Certificate authority clearly stated
- [ ] Refund policy is clear and honest

---

## 🚨 **ENFORCEMENT**

**These rules are MANDATORY and must be followed in ALL projects.**

- **Violation Consequence**: Immediate code review and correction required
- **Quality Gate**: No deployment without compliance verification
- **Documentation**: All exceptions must be documented and approved
- **Training**: All team members must understand and acknowledge these rules

---

## 📝 **REVISION HISTORY**

- **v1.0**: Initial master coding rules
- **v2.0**: Added Arabic localization standards
- **v2.1**: Added logical UX rules and truthfulness enforcement

---

**Remember: Building trust requires absolute honesty. Better to underpromise and overdeliver than to make false claims that damage credibility.**