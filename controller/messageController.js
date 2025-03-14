import ErrorHandler from "../middleware/error.js";
import { Message } from "../models/messageSchema.js";
import nodemailer from "nodemailer";
import { catchAsyncError } from "../middleware/catchAsyncError.js";

export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, teamName } = req.body; // Ensure field names match frontend

  // Validate required fields
  if (!name || !email || !phone || !teamName) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  // Save message to the database
  const data = await Message.create({
    fullName: name, // Ensure compatibility with schema
    email,
    phoneNumber: phone,
    teamName,
  });

  // Ensure admin email is set
  const adminEmail = process.env.SMTP_MAIL;
  if (!adminEmail) {
    return next(new ErrorHandler("Admin email is not configured.", 500));
  }

  // Email Transporter Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // Secure mode for port 465
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email Content
  const mailOptions = {
    from: `"DPL Registration" <${process.env.SMTP_MAIL}>`, // Use a consistent sender format
    to: adminEmail,
    subject: `New Registration from ${name}`,
    text: `You have received a new registration:\n\n
        Full Name: ${name}
        Email: ${email}
        Phone Number: ${phone}
        Team Name: ${teamName}
    `,
    html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333;">New DPL Registration</h2>
                <p><strong>Full Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${phone}</p>
                <p><strong>Team Name:</strong> ${teamName}</p>
                
                <hr>
                <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply.</p>
            </div>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
    return next(new ErrorHandler("Email could not be sent.", 500));
  }

  res.status(201).json({
    success: true,
    message:
      "Registration successful! An email notification has been sent to the admin.",
    data,
  });
});
