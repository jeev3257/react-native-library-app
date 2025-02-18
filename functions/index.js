const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize Firebase Admin
admin.initializeApp();

// Set SendGrid API Key
sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

// Function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to retry fetching user data
const getUserWithRetry = async (uid, retries = 5, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const userRecord = await admin.auth().getUser(uid);
      if (userRecord.email) return userRecord; // If email exists, return user
      console.log(`🔄 Retry ${i + 1}: Email not found, waiting...`);
      await delay(delayMs);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    }
  }
  return null;
};

// Cloud Function to send a welcome email when a new user signs up
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  console.log("🚀 Function triggered: User created event!");
  console.log("🔍 User object:", user); // Log user object

  if (!user || !user.uid) {
    console.error("❌ Error: Invalid user data!");
    return null;
  }

  // Retry fetching user data if email is missing
  let userData = user;
  if (!user.email) {
    console.log("🔄 Email missing, retrying...");
    userData = await getUserWithRetry(user.uid);
    if (!userData || !userData.email) {
      console.error("❌ Error: Could not retrieve email after retries.");
      return null;
    }
  }

  console.log("⏳ Waiting 10 seconds before sending email...");
  await delay(10000); // Wait for 10 seconds

  const msg = {
    to: userData.email,
    from: "your-email@example.com",
    subject: "Welcome to Library App 📚",
    text: `Hello ${userData.displayName || "User"}, Welcome to our Library App!`,
    html: `<h2>Hello ${userData.displayName || "User"}</h2>
           <p>Welcome to our <b>Library App</b>! We are excited to have you.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Welcome email sent to:", userData.email);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }

  return null;
});
