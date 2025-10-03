import axios from 'axios';

// FAST2SMS Provider
export const sendSMS = async (to, message) => {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    console.log('📱 Attempting to send SMS via FAST2SMS:', { to, messageLength: message.length });
    
    // Validate API key
    if (!apiKey) {
      console.error('❌ FAST2SMS API key not configured');
      return false;
    }
    
    // Format phone number
    let formattedTo = to.replace(/\D/g, '');
    if (formattedTo.startsWith('91') && formattedTo.length === 12) {
      formattedTo = formattedTo;
    } else if (formattedTo.length === 10) {
      formattedTo = '91' + formattedTo;
    } else {
      console.warn('📱 Invalid phone number format:', to);
      return false;
    }

    console.log('📱 Formatted phone number:', formattedTo);

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      sender_id: 'FSTSMS', // Default sender ID
      message: message,
      route: 'v3', // Transactional route
      numbers: formattedTo
    }, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ FAST2SMS response:', response.data);
    
    if (response.data.return === true) {
      console.log('✅ SMS sent successfully via FAST2SMS');
      return true;
    } else {
      console.error('❌ FAST2SMS API error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ FAST2SMS SMS error:', {
      error: error.response?.data || error.message,
      to: to
    });
    return false;
  }
};

// SMS templates
export const SMS_TEMPLATES = {
  COUPON_APPLIED: (couponOwnerName, appliedUserName, couponCode) => 
    `Hi ${couponOwnerName}! 🎉 Your coupon ${couponCode} was just used by ${appliedUserName}. You'll earn 2% from their purchases. Thank you for referring! - Cillage Team`,

  PURCHASE_BENEFIT: (couponOwnerName, customerName, purchaseAmount, benefitAmount, purchaseCount) =>
    `Hi ${couponOwnerName}! 💰 ${customerName} made a purchase of ₹${purchaseAmount}. You earned ₹${benefitAmount.toFixed(2)}! Total purchases: ${purchaseCount}. - Cillage Team`,

  WELCOME_COUPON: (userName, couponCode) =>
    `Welcome to Cillage, ${userName}! Use code ${couponCode} for 5% off your first purchase. Happy shopping! 🛍️`,

  ORDER_CONFIRMATION: (userName, orderId) =>
    `Hi ${userName}! Your order #${orderId} is confirmed. We'll notify you when it ships. Thank you for choosing Cillage!`
};