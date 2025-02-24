// const functions = require("firebase-functions/v1");
// const admin = require("firebase-admin");

// admin.initializeApp();

// exports.updateFines = functions.pubsub
//   .schedule("every day at 00:00")
//   .timeZone("Asia/Kolkata") // Set correct timezone
//   .onRun(async () => {
//     const firestore = admin.firestore();
//     const borrowedRef = firestore.collection("borrowed");
//     const snapshot = await borrowedRef.get();
//     const today = new Date();

//     // Batch write for better performance
//     const batch = firestore.batch();
//     let updatedCount = 0;

//     snapshot.forEach((doc) => {
//       const books = doc.data().takenBooks || [];
//       let updated = false;

//       const updatedBooks = books.map((book) => {
//         const returnDate = new Date(book.returnDate);
//         if (today > returnDate && book.fine === 0) {
//           updated = true;
//           return { ...book, fine: 50 }; // Set fine to 50 if overdue
//         }
//         return book;
//       });

//       if (updated) {
//         batch.update(doc.ref, { takenBooks: updatedBooks });
//         updatedCount++;
//       }
//     });

//     if (updatedCount > 0) {
//       await batch.commit(); // Execute batch update
//       console.log(`✅ Updated fines for ${updatedCount} users.`);
//     } else {
//       console.log("✅ No fines to update.");
//     }

//     return null;
//   });






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





const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin
admin.initializeApp();
process.env.EMAIL_USER = "dopetech3257@gmail.com";
process.env.EMAIL_PASS = "bdneooxejlggnitw";

const emailUser = process.env.EMAIL_USER || "your-email@gmail.com";
const emailPass = process.env.EMAIL_PASS || "your-email-password";

// Nodemailer transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

exports.sendBookReturnedEmail = onDocumentUpdated("borrowed/{userId}", async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    if (!beforeData || !afterData) {
        console.log("No data found.");
        return;
    }

    const email = afterData.email; // User's email
    const name = afterData.name; // User's name

    // Check which books were marked as returned
    const returnedBooks = afterData.takenBooks.filter(book => 
        book.status === "returned" && !beforeData.takenBooks.some(b => b.isbn === book.isbn && b.status === "returned")
    );

    // Check if any new book was returned
    if (returnedBooks.length === 0) {
        console.log("No new books returned.");
        return;
    }

    // Prepare email content
    let bookListHtml = returnedBooks.map(
        (book) => `<p><strong>${book.title}</strong> by ${book.author} was successfully returned.</p>`
    ).join("");

    const mailOptions = {
        from: `"Library System" <${emailUser}>`,
        to: email,
        subject: `📚 Book(s) Returned`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Dear <strong>${name}</strong>,</h2>
                <p style="text-align: center;">The following book(s) have been successfully returned:</p>
                <div style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background-color: #fff; margin: 20px 0;">
                    ${bookListHtml}
                </div>
                <p style="text-align: center; margin-top: 20px;">Thank you for returning them!</p>
                <p style="color: #555; text-align: center;">📖 We hope to see you again soon!<br>Library Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email} about returned books.`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
});
