import nodemailer from "nodemailer";

// Create a transport for sending email
export const transporter = (email: string, password: string) => {
  return nodemailer.createTransport({
    service: "Gmail", // You can use any email service
    auth: {
      user: email,
      pass: password,
    },
  });
};

export const sendConfirmation = async (
  receiverEmail: string,
  confirmationCode: string,
  email: string,
  password: string
) => {
  try {
    const mailOptions = {
      from: '"Your Company" <your-email@gmail.com>',
      to: receiverEmail,
      subject: "Email Confirmation - Cryptowise",
      html: `<h3>Hello!</h3>
               <p>This is your confirmation code ${confirmationCode}`,
    };

    // Send the email
    await transporter(email, password).sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};
