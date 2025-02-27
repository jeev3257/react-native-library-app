// const functions = require("firebase-functions");
// const admin = require("firebase-admin");

// admin.initializeApp();

// exports.updateFinesTrigger = functions.https.onCall(async (data, context) => {
//     try {
//         const firestore = admin.firestore();
//         const borrowedRef = firestore.collection("borrowed");
//         const snapshot = await borrowedRef.get();
//         const today = new Date();

//         // Batch write for better performance
//         const batch = firestore.batch();
//         let updatedCount = 0;

//         snapshot.forEach((doc) => {
//             const books = doc.data().takenBooks || [];
//             let updated = false;

//             const updatedBooks = books.map((book) => {
//                 const returnDate = new Date(book.returnDate);
//                 if (today > returnDate && book.fine === 0) {
//                     updated = true;
//                     return { ...book, fine: 50 }; // Set fine to 50 if overdue
//                 }
//                 return book;
//             });

//             if (updated) {
//                 batch.update(doc.ref, { takenBooks: updatedBooks });
//                 updatedCount++;
//             }
//         });

//         if (updatedCount > 0) {
//             await batch.commit(); // Execute batch update
//             console.log(`✅ Updated fines for ${updatedCount} users.`);
//             return { message: `Updated fines for ${updatedCount} users.` };
//         } else {
//             console.log("✅ No fines to update.");
//             return { message: "No fines to update." };
//         }
//     } catch (error) {
//         console.error("❌ Error updating fines:", error);
//         throw new functions.https.HttpsError("internal", "Error updating fines.");
//     }
// });
// const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");

// // Initialize Firebase Admin
// admin.initializeApp();

// // Set email credentials directly for testing
// process.env.EMAIL_USER = "dopetech3257@gmail.com";
// process.env.EMAIL_PASS = "bdneooxejlggnitw";

// // Fetch email credentials from environment variables
// const emailUser = process.env.EMAIL_USER || "your-email@gmail.com"; // Change if needed
// const emailPass = process.env.EMAIL_PASS || "your-email-password";

// // Nodemailer transporter (Gmail SMTP)
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: emailUser,
//         pass: emailPass,
//     },
// });

// exports.sendBookBorrowedEmail = onDocumentUpdated("borrowed/{userId}", async (event) => {
//     const beforeData = event.data.before.data();
//     const afterData = event.data.after.data();

//     if (!beforeData || !afterData) {
//         console.log("No data found.");
//         return;
//     }

//     const email = afterData.email; // User's email
//     const name = afterData.name; // User's name
//     const regid = afterData.regid; // Registration ID

//     const previousBooks = beforeData.takenBooks || [];
//     const updatedBooks = afterData.takenBooks || [];

//     // Find newly added books
//     const newBooks = updatedBooks.filter(
//         (book) => !previousBooks.some((b) => b.isbn === book.isbn)
//     );

//     if (newBooks.length === 0) {
//         console.log("No new books borrowed.");
//         return;
//     }

//     // Prepare email content
//     let bookListHtml = newBooks.map(
//         (book) => `<p><strong>${book.title}</strong> by ${book.author}<br>Return by: ${new Date(book.returnDate).toDateString()}</p>`
//     ).join("");

//     const mailOptions = {
//       from: `"Library System" <${emailUser}>`,
//       to: email,
//       subject: `📚 New Book(s) Borrowed`,
//       html: `
//           <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
//               <h2 style="color: #333; text-align: center;">Dear <strong>${name}</strong>,</h2>
//               <p style="text-align: center;">You have borrowed the following book(s):</p>
//               <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background-color: #fff; margin: 20px 0;">
//                   ${bookListHtml}
//               </div>
//               <p style="text-align: center; margin-top: 20px;">Please make sure to return them on time.</p>
//               <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHdsNmFydmhiZnFoZXg0MTJzMHk4dzRnYms0OWljeTBuYTZyNjl0ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/hAieQ20Ph6xJPnVqLr/giphy.gif" alt="Enjoy Reading!" style="display: block; margin: 0 auto; border-radius: 10px;">
//               <p style="color: #555; text-align: center;">📖 Happy Reading!<br>Library Team</p>
//           </div>
//       `,
//   };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Email sent to ${email} about borrowed books.`);
//     } catch (error) {
//         console.error("❌ Error sending email:", error);
//     }
// });

// const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");

// // Initialize Firebase Admin
// admin.initializeApp();
// process.env.EMAIL_USER = "dopetech3257@gmail.com";
// process.env.EMAIL_PASS = "bdneooxejlggnitw";

// const emailUser = process.env.EMAIL_USER || "your-email@gmail.com";
// const emailPass = process.env.EMAIL_PASS || "your-email-password";

// // Nodemailer transporter (Gmail SMTP)
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: emailUser,
//         pass: emailPass,
//     },
// });

// exports.sendBookReturnedEmail = onDocumentUpdated("borrowed/{userId}", async (event) => {
//     const beforeData = event.data.before.data();
//     const afterData = event.data.after.data();

//     if (!beforeData || !afterData) {
//         console.log("No data found.");
//         return;
//     }

//     const email = afterData.email; // User's email
//     const name = afterData.name; // User's name

//     // Check which books were marked as returned
//     const returnedBooks = afterData.takenBooks.filter(book =>
//         book.status === "returned" && !beforeData.takenBooks.some(b => b.isbn === book.isbn && b.status === "returned")
//     );

//     // Check if any new book was returned
//     if (returnedBooks.length === 0) {
//         console.log("No new books returned.");
//         return;
//     }

//     // Prepare email content
//     let bookListHtml = returnedBooks.map(
//         (book) => `<p><strong>${book.title}</strong> by ${book.author} was successfully returned.</p>`
//     ).join("");

//     const mailOptions = {
//         from: `"Library System" <${emailUser}>`,
//         to: email,
//         subject: `📚 Book(s) Returned`,
//         html: `
//             <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
//                 <h2 style="color: #333; text-align: center;">Dear <strong>${name}</strong>,</h2>
//                 <p style="text-align: center;">The following book(s) have been successfully returned:</p>
//                 <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background-color: #fff; margin: 20px 0;">
//                     ${bookListHtml}
//                 </div>
//                 <p style="text-align: center; margin-top: 20px;">Thank you for returning them!</p>
//                 <p style="color: #555; text-align: center;">📖 We hope to see you again soon!<br>Library Team</p>
//             </div>
//         `,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Email sent to ${email} about returned books.`);
//     } catch (error) {
//         console.error("❌ Error sending email:", error);
//     }
// });

// const { onSchedule } = require("firebase-functions/v2/scheduler");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");
// const functions = require("firebase-functions");

// // Initialize Firebase Admin (ensure it is initialized only once)
// admin.initializeApp();

// process.env.EMAIL_USER = "dopetech3257@gmail.com";
// process.env.EMAIL_PASS = "bdneooxejlggnitw";
// // Fetch email credentials from Firebase Config
// const emailUser = functions.config().email.user;
// const emailPass = functions.config().email.pass;

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: emailUser,
//         pass: emailPass,
//     },
// });

// exports.sendReturnReminderEmailsTrigger = functions.https.onCall(async (data, context) => {
//     try {
//         const currentDate = new Date();
//         const reminderDate = new Date();
//         reminderDate.setDate(currentDate.getDate() + 2);
//         const reminderDateStr = reminderDate.toISOString().split("T")[0]; // Extract date part

//         // Fetch all borrowed books
//         const borrowedBooksSnapshot = await admin.firestore().collection("borrowed").get();

//         if (borrowedBooksSnapshot.empty) {
//             console.log("✅ No borrowed books found.");
//             return { message: "No borrowed books found." };
//         }

//         // Process each borrowed book
//         for (const doc of borrowedBooksSnapshot.docs) {
//             const userData = doc.data();
//             const takenBooks = userData.takenBooks || [];

//             for (const book of takenBooks) {
//                 if (!book.returnDate || book.status === "returned") continue;

//                 const bookReturnDate = book.returnDate.split("T")[0]; // Extract date part

//                 if (bookReturnDate === reminderDateStr) {
//                     await sendReminderEmail(userData.email, userData.name, book, bookReturnDate);
//                 }
//             }
//         }
//         return { message: "Reminder emails sent successfully." };
//     } catch (error) {
//         console.error("❌ Error fetching borrowed books:", error);
//         throw new functions.https.HttpsError("internal", "Error sending reminder emails.");
//     }
// });

// // Function to send an email reminder
// async function sendReminderEmail(email, name, book, returnDate) {
//     const mailOptions = {
//         from: `"Library System" <${emailUser}>`,
//         to: email,
//         subject: "📅 Reminder: Book Return Due Soon",
//         html: `
//             <div style="font-family: Arial, sans-serif; padding: 20px;">
//                 <h2>📖 Library Return Reminder</h2>
//                 <p>Dear <strong>${name}</strong>,</p>
//                 <p>Your borrowed book <strong>${book.title}</strong> by ${book.author} is due in <strong>2 days</strong>.</p>
//                 <p>📅 Please return it by <strong>${returnDate}</strong> to avoid late fees.</p>
//                 <hr>
//                 <p>Thank you for using our library! 📚</p>
//             </div>
//         `,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`✅ Reminder email sent to ${email} for "${book.title}".`);
//     } catch (error) {
//         console.error(`❌ Error sending email to ${email}:`, error);
//     }
// }



const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = getFirestore();

exports.updateRecommendationsOnBorrowedChange = onDocumentUpdated(
    "borrowed/{regid}",
    async (event) => {
        const beforeData = event.data.before.data();
        const afterData = event.data.after.data();
        const regid = event.params.regid;

        // Check if takenBooks has changed
        if (JSON.stringify(beforeData.takenBooks) === JSON.stringify(afterData.takenBooks)) {
            console.log("No change in borrowed books, skipping...");
            return;
        }

        console.log("📚 Borrowed books changed for regid:", regid);

        // Find userId from `users` collection
        const userSnapshot = await db.collection("users").where("regid", "==", regid).get();
        if (userSnapshot.empty) {
            console.log("⚠️ No user found for regid:", regid);
            return;
        }
        const userId = userSnapshot.docs[0].id;

        // Extract borrowed book ISBNs
        const borrowedBooks = afterData.takenBooks.map((book) => book.isbn);

        return updateRecommendations(userId, [], borrowedBooks);
    }
);

// ✅ Function to update user recommendations in `user_rec`
async function updateRecommendations(userId, wishlist, borrowedBooks) {
    try {
        const allBooks = new Set([...wishlist, ...borrowedBooks]);
        let recommendedBooks = [];

        for (const bookId of allBooks) {
            const recDoc = await db.collection("recommendations").doc(bookId).get();
            if (recDoc.exists) {
                recommendedBooks = [...recommendedBooks, ...recDoc.data().similar_books];
            }
        }

        // Count occurrences and rank books
        const bookCounts = recommendedBooks.reduce((acc, book) => {
            acc[book] = (acc[book] || 0) + 1;
            return acc;
        }, {});

        // Sort and get top 10 recommendations
        const sortedBooks = Object.keys(bookCounts)
            .sort((a, b) => bookCounts[b] - bookCounts[a])
            .filter((book) => !allBooks.has(book)) // Exclude already owned books
            .slice(0, 10);

        // Update Firestore in `user_rec` instead of `recommendations`
        await db.collection("user_rec").doc(userId).set({
            recommended_books: sortedBooks,
        });

        console.log("✅ User recommendations updated in `user_rec` for user:", userId);
    } catch (error) {
        console.error("❌ Error updating recommendations:", error);
    }
}
