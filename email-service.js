// Email Service using EmailJS
// This provides real email functionality for order confirmations and registration

class EmailService {
    constructor() {
        // Initialize EmailJS (you'll need to get these from emailjs.com)
        this.serviceId = 'service_58xhxmj'; // Your EmailJS service ID
        this.templateId = 'template_8wm274b'; // Your EmailJS template ID
        this.publicKey = 'w3dm9bQ8u4Km3IY1c'; // Your EmailJS public key
        
        // Load EmailJS library
        this.loadEmailJS();
    }
    
    loadEmailJS() {
        if (!window.emailjs) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(this.publicKey);
            };
            document.head.appendChild(script);
        }
    }
    
    // Send order confirmation email
    async sendOrderConfirmation(orderData) {
        try {
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
            
            // Send customer confirmation
            const customerResponse = await emailjs.send(
                this.serviceId,
                this.templateId,
                customerParams
            );
            
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
            
            // Send admin notification (use different template if available)
            try {
                await emailjs.send(
                    this.serviceId,
                    'template_admin_alert', // Create this template for admin notifications
                    adminParams
                );
                console.log('Admin notification sent');
            } catch (adminError) {
                // If admin template doesn't exist, send to same template
                adminParams.to_email = 'debaprakash09@gmail.com';
                adminParams.to_name = 'Admin';
                await emailjs.send(
                    this.serviceId,
                    this.templateId,
                    adminParams
                );
                console.log('Admin notification sent using customer template');
            }
            
            console.log('Order confirmation email sent:', customerResponse);
            return { success: true, response: customerResponse };
            
        } catch (error) {
            console.error('Failed to send order confirmation:', error);
            return { success: false, error };
        }
    }
    
    // Send welcome email for new registration
    async sendWelcomeEmail(userData) {
        try {
            const templateParams = {
                to_email: userData.email,
                to_name: `${userData.firstName} ${userData.lastName}`,
                join_date: userData.joinDate
            };
            
            const response = await emailjs.send(
                this.serviceId,
                'template_welcome',
                templateParams
            );
            
            console.log('Welcome email sent:', response);
            return { success: true, response };
            
        } catch (error) {
            console.error('Failed to send welcome email:', error);
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
