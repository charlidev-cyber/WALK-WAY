// Email Service using EmailJS
// This provides real email functionality for order confirmations and registration

class EmailService {
    constructor() {
        // Initialize EmailJS (you'll need to get these from emailjs.com)
        this.serviceId = 'service_58xhxmj'; // Your EmailJS service ID
        this.templateId = 'template_8wm274b'; // Your EmailJS template ID
        this.publicKey = 'w3dm9bQ8u4Km3IY1c'; // Your EmailJS public key
        this.isInitialized = false;
        
        // Load EmailJS library
        this.loadEmailJS();
    }
    
    loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (window.emailjs) {
                if (!this.isInitialized) {
                    emailjs.init(this.publicKey);
                    this.isInitialized = true;
                }
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                try {
                    emailjs.init(this.publicKey);
                    this.isInitialized = true;
                    console.log('EmailJS initialized successfully');
                    resolve();
                } catch (error) {
                    console.error('EmailJS initialization failed:', error);
                    reject(error);
                }
            };
            script.onerror = () => {
                console.error('Failed to load EmailJS library');
                reject(new Error('Failed to load EmailJS library'));
            };
            document.head.appendChild(script);
        });
    }
    
    async waitForInitialization() {
        if (this.isInitialized && window.emailjs) {
            return true;
        }
        
        // Wait up to 5 seconds for initialization
        for (let i = 0; i < 50; i++) {
            if (this.isInitialized && window.emailjs) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('EmailJS failed to initialize within timeout period');
    }
    
    // Send order confirmation email
    async sendOrderConfirmation(orderData) {
        try {
            // Wait for EmailJS to be properly initialized
            await this.waitForInitialization();
            
            console.log('Sending order confirmation email for order:', orderData.orderId);
            
            // Customer confirmation email
            const customerParams = {
                to_email: orderData.customerInfo.email,
                to_name: orderData.customerInfo.name,
                order_id: orderData.orderId,
                order_date: orderData.orderDate,
                total_amount: orderData.total,
                items_list: this.formatItemsList(orderData.items),
                delivery_address: `${orderData.customerInfo.address}, ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}`,
                payment_method: orderData.paymentMethod,
                phone: orderData.customerInfo.phone
            };
            
            console.log('Customer email params:', customerParams);
            
            // Send customer confirmation
            const customerResponse = await emailjs.send(
                this.serviceId,
                this.templateId,
                customerParams
            );
            
            console.log('Customer email sent successfully:', customerResponse);
            
            // Admin notification email (to you)
            const adminParams = {
                to_email: 'debaprakash09@gmail.com', // Admin email
                to_name: 'WalkWay Admin',
                subject: `New Order Alert - ${orderData.orderId}`,
                customer_name: orderData.customerInfo.name,
                customer_email: orderData.customerInfo.email,
                customer_phone: orderData.customerInfo.phone,
                order_id: orderData.orderId,
                order_date: orderData.orderDate,
                total_amount: orderData.total,
                items_list: this.formatItemsList(orderData.items),
                delivery_address: `${orderData.customerInfo.address}, ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}`,
                payment_method: orderData.paymentMethod
            };
            
            console.log('Admin email params:', adminParams);
            
            // Send admin notification using same template
            try {
                const adminResponse = await emailjs.send(
                    this.serviceId,
                    this.templateId,
                    adminParams
                );
                console.log('Admin notification sent successfully:', adminResponse);
            } catch (adminError) {
                console.error('Admin email failed:', adminError);
                // Don't fail the whole process if admin email fails
            }
            
            console.log('Order confirmation email sent:', customerResponse);
            return { success: true, response: customerResponse };
            
        } catch (error) {
            console.error('Failed to send order confirmation:', error);
            return { success: false, error };
        }
    }
    
    // Send welcome email for new registration + admin notification
    async sendWelcomeEmail(userData) {
        try {
            await this.waitForInitialization();
            
            console.log('Sending welcome email and admin notification for new user:', userData.email);
            
            // Welcome email to new user
            const welcomeParams = {
                to_email: userData.email,
                to_name: `${userData.firstName} ${userData.lastName}`,
                order_id: `NEW_USER_${Date.now()}`,
                order_date: userData.joinDate,
                total_amount: 'Welcome Bonus',
                items_list: `New User Registration - ${userData.firstName} ${userData.lastName}`,
                delivery_address: `Email: ${userData.email}, Phone: ${userData.phone}`,
                payment_method: 'Account Registration',
                phone: userData.phone
            };
            
            console.log('Welcome email params:', welcomeParams);
            
            // Send welcome email to user
            const userResponse = await emailjs.send(
                this.serviceId,
                this.templateId,
                welcomeParams
            );
            
            console.log('Welcome email sent to user:', userResponse);
            
            // Admin notification about new registration
            const adminParams = {
                to_email: 'debaprakash09@gmail.com',
                to_name: 'WalkWay Admin',
                order_id: `NEW_REGISTRATION_${Date.now()}`,
                order_date: userData.joinDate,
                total_amount: 'New User Alert',
                items_list: `🎉 New User Registered!\n\nName: ${userData.firstName} ${userData.lastName}\nEmail: ${userData.email}\nPhone: ${userData.phone}\nJoin Date: ${userData.joinDate}`,
                delivery_address: `User Details: ${userData.firstName} ${userData.lastName}`,
                payment_method: 'New Account Registration',
                phone: userData.phone,
                customer_name: `${userData.firstName} ${userData.lastName}`,
                customer_email: userData.email,
                customer_phone: userData.phone
            };
            
            console.log('Admin notification params:', adminParams);
            
            // Send admin notification
            try {
                const adminResponse = await emailjs.send(
                    this.serviceId,
                    this.templateId,
                    adminParams
                );
                console.log('Admin notification sent successfully:', adminResponse);
            } catch (adminError) {
                console.error('Admin notification failed:', adminError);
                // Don't fail the whole process if admin email fails
            }
            
            console.log('Registration emails sent successfully');
            return { success: true, response: userResponse };
            
        } catch (error) {
            console.error('Failed to send registration emails:', error);
            return { success: false, error };
        }
    }
    
    // Send password reset email
    async sendPasswordReset(email) {
        try {
            const resetToken = this.generateResetToken();
            const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;
            
            const templateParams = {
                to_email: email,
                reset_link: resetLink,
                expiry_time: '24 hours'
            };
            
            // Store reset token temporarily
            localStorage.setItem(`reset_token_${resetToken}`, JSON.stringify({
                email: email,
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }));
            
            const response = await emailjs.send(
                this.serviceId,
                'template_password_reset',
                templateParams
            );
            
            console.log('Password reset email sent:', response);
            return { success: true, response };
            
        } catch (error) {
            console.error('Failed to send password reset:', error);
            return { success: false, error };
        }
    }
    
    // Format items list for email template
    formatItemsList(items) {
        return items.map(item => 
            `${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
        ).join('\n');
    }
    
    // Generate secure reset token
    generateResetToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) + 
               Date.now().toString(36);
    }
    
    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize email service
const emailService = new EmailService();

// Export for use in other files
window.emailService = emailService;
