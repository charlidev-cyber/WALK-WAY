// Alternative Notification Service for WalkWay
// Multiple notification methods when EmailJS fails

class NotificationService {
    constructor() {
        this.webhookUrl = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL'; // Discord webhook
        this.telegramBotToken = 'YOUR_BOT_TOKEN';
        this.telegramChatId = 'YOUR_CHAT_ID';
        this.init();
    }

    init() {
        console.log('NotificationService initialized');
        this.setupBrowserNotifications();
    }

    // Method 1: Browser Notifications (Instant)
    async setupBrowserNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }
        }
    }

    showBrowserNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    // Method 2: WhatsApp Business API (Free alternative)
    async sendWhatsAppNotification(orderData) {
        try {
            // Using WhatsApp Web API - Your phone number
            const message = this.formatWhatsAppMessage(orderData);
            const adminPhone = '917681886061'; // Your WhatsApp number
            const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
            
            // Show notification first
            this.showBrowserNotification('📱 WhatsApp Alert', 'Opening WhatsApp with order details...');
            
            // Auto-open WhatsApp after 1 second
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1000);
            
            console.log('WhatsApp notification opened for admin');
            return { success: true, method: 'whatsapp' };
        } catch (error) {
            console.error('WhatsApp notification failed:', error);
            return { success: false, error };
        }
    }

    // Method 3: Discord Webhook (Free and reliable)
    async sendDiscordNotification(orderData) {
        try {
            const embed = {
                title: "🛍️ New Order Alert - WalkWay",
                color: 0xf39c12,
                fields: [
                    { name: "Order ID", value: orderData.orderId, inline: true },
                    { name: "Customer", value: orderData.customerInfo.name, inline: true },
                    { name: "Email", value: orderData.customerInfo.email, inline: true },
                    { name: "Phone", value: orderData.customerInfo.phone, inline: true },
                    { name: "Total Amount", value: `₹${orderData.total}`, inline: true },
                    { name: "Payment Method", value: orderData.paymentMethod, inline: true },
                    { name: "Items", value: this.formatItemsList(orderData.items), inline: false },
                    { name: "Address", value: `${orderData.customerInfo.address}, ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}`, inline: false }
                ],
                timestamp: new Date().toISOString(),
                footer: { text: "WalkWay E-commerce" }
            };

            // Note: You need to set up Discord webhook URL
            if (this.webhookUrl.includes('YOUR_WEBHOOK_URL')) {
                console.log('Discord webhook not configured. Order details:', orderData);
                return { success: false, error: 'Webhook not configured' };
            }

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });

            if (response.ok) {
                console.log('Discord notification sent successfully');
                return { success: true, method: 'discord' };
            } else {
                throw new Error('Discord webhook failed');
            }
        } catch (error) {
            console.error('Discord notification failed:', error);
            return { success: false, error };
        }
    }

    // Method 4: Telegram Bot (Free and instant)
    async sendTelegramNotification(orderData) {
        try {
            const message = this.formatTelegramMessage(orderData);
            
            // Note: You need to set up Telegram bot
            if (this.telegramBotToken.includes('YOUR_BOT_TOKEN')) {
                console.log('Telegram bot not configured. Order details:', orderData);
                return { success: false, error: 'Telegram not configured' };
            }

            const telegramUrl = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
            
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.telegramChatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            if (response.ok) {
                console.log('Telegram notification sent successfully');
                return { success: true, method: 'telegram' };
            } else {
                throw new Error('Telegram API failed');
            }
        } catch (error) {
            console.error('Telegram notification failed:', error);
            return { success: false, error };
        }
    }

    // Method 5: Local Storage + Admin Dashboard (Always works)
    saveToLocalNotifications(orderData) {
        try {
            const notifications = JSON.parse(localStorage.getItem('admin_notifications')) || [];
            
            const notification = {
                id: Date.now(),
                type: 'new_order',
                title: 'New Order Received',
                message: `Order ${orderData.orderId} from ${orderData.customerInfo.name}`,
                orderData: orderData,
                timestamp: new Date().toISOString(),
                read: false
            };

            notifications.unshift(notification); // Add to beginning
            
            // Keep only last 100 notifications
            if (notifications.length > 100) {
                notifications.splice(100);
            }

            localStorage.setItem('admin_notifications', JSON.stringify(notifications));
            
            // Update notification count
            const unreadCount = notifications.filter(n => !n.read).length;
            localStorage.setItem('unread_notifications', unreadCount.toString());

            console.log('Notification saved to local storage');
            return { success: true, method: 'local_storage' };
        } catch (error) {
            console.error('Local storage notification failed:', error);
            return { success: false, error };
        }
    }

    // Method 6: Google Forms (Free and reliable)
    async sendToGoogleForm(orderData) {
        try {
            // You can create a Google Form and submit data to it
            const formData = new FormData();
            formData.append('entry.123456789', orderData.orderId); // Replace with actual entry IDs
            formData.append('entry.987654321', orderData.customerInfo.name);
            formData.append('entry.456789123', orderData.customerInfo.email);
            formData.append('entry.789123456', orderData.total);
            
            // Note: Replace with your Google Form URL
            const googleFormUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
            
            const response = await fetch(googleFormUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Required for Google Forms
            });

            console.log('Order data sent to Google Form');
            return { success: true, method: 'google_form' };
        } catch (error) {
            console.error('Google Form submission failed:', error);
            return { success: false, error };
        }
    }

    // Main notification method - tries multiple methods
    async sendOrderNotification(orderData) {
        console.log('🔔 Sending order notifications via multiple methods...');
        
        const results = [];

        // Method 1: Browser notification (instant)
        this.showBrowserNotification(
            'New Order Received!', 
            `Order ${orderData.orderId} from ${orderData.customerInfo.name} - ₹${orderData.total}`
        );
        results.push({ method: 'browser', success: true });

        // Method 2: Local storage (always works)
        const localResult = this.saveToLocalNotifications(orderData);
        results.push(localResult);

        // Method 3: WhatsApp (user needs to click)
        const whatsappResult = await this.sendWhatsAppNotification(orderData);
        results.push(whatsappResult);

        // Method 4: Discord (if configured)
        const discordResult = await this.sendDiscordNotification(orderData);
        results.push(discordResult);

        // Method 5: Telegram (if configured)
        const telegramResult = await this.sendTelegramNotification(orderData);
        results.push(telegramResult);

        // Method 6: Google Form (if configured)
        const googleResult = await this.sendToGoogleForm(orderData);
        results.push(googleResult);

        console.log('Notification results:', results);
        
        const successfulMethods = results.filter(r => r.success).length;
        return {
            success: successfulMethods > 0,
            methods: results,
            successCount: successfulMethods
        };
    }

    // Registration notifications
    async sendRegistrationNotification(userData) {
        console.log('🔔 Sending registration notifications...');
        
        // Browser notification
        this.showBrowserNotification(
            'New User Registered!', 
            `${userData.firstName} ${userData.lastName} just created an account`
        );

        // Local storage
        const notification = {
            id: Date.now(),
            type: 'new_registration',
            title: 'New User Registration',
            message: `${userData.firstName} ${userData.lastName} (${userData.email}) registered`,
            userData: userData,
            timestamp: new Date().toISOString(),
            read: false
        };

        const notifications = JSON.parse(localStorage.getItem('admin_notifications')) || [];
        notifications.unshift(notification);
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));

        // WhatsApp
        const message = `🎉 *New User Registration - WalkWay*\n\n*Name:* ${userData.firstName} ${userData.lastName}\n*Email:* ${userData.email}\n*Phone:* ${userData.phone}\n*Date:* ${userData.joinDate}`;
        const adminPhone = '917681886061'; // Your WhatsApp number
        const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
        
        // Show browser notification first
        this.showBrowserNotification('📱 New Registration', `${userData.firstName} ${userData.lastName} registered - Opening WhatsApp...`);
        
        // Auto-open WhatsApp for registration
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 2000);

        return { success: true };
    }

    // Helper methods
    formatItemsList(items) {
        return items.map(item => 
            `${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
        ).join('\n');
    }

    formatWhatsAppMessage(orderData) {
        return `🛍️ *New Order - WalkWay*\n\n*Order ID:* ${orderData.orderId}\n*Customer:* ${orderData.customerInfo.name}\n*Email:* ${orderData.customerInfo.email}\n*Phone:* ${orderData.customerInfo.phone}\n*Total:* ₹${orderData.total}\n*Payment:* ${orderData.paymentMethod}\n\n*Items:*\n${this.formatItemsList(orderData.items)}\n\n*Address:*\n${orderData.customerInfo.address}, ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}`;
    }

    formatTelegramMessage(orderData) {
        return `🛍️ <b>New Order - WalkWay</b>\n\n<b>Order ID:</b> ${orderData.orderId}\n<b>Customer:</b> ${orderData.customerInfo.name}\n<b>Email:</b> ${orderData.customerInfo.email}\n<b>Phone:</b> ${orderData.customerInfo.phone}\n<b>Total:</b> ₹${orderData.total}\n<b>Payment:</b> ${orderData.paymentMethod}\n\n<b>Items:</b>\n${this.formatItemsList(orderData.items)}\n\n<b>Address:</b>\n${orderData.customerInfo.address}, ${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}`;
    }
}

// Initialize notification service
const notificationService = new NotificationService();
window.notificationService = notificationService;

console.log('✅ Alternative notification service loaded successfully!');
