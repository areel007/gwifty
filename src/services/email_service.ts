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

export const sendTradeNotification = async (
  whatsappNumber: string,
  email: string,
  password: string,
  attachments: { filename: string; content: Buffer }[]
) => {
  try {
    const mailOptions = {
      from: '"Your Company" <your-email@gmail.com>',
      to: "delzmiyaki@gmail.com",
      subject: "Trade Notification - Cryptowise",
      html: `<h3>Hello!</h3>
              <div style="width: 100%; height: 40px; background-color: #ccc;"></div>
               <p>Person with whatsapp number ${whatsappNumber} has initiated a trade.</p>`,
      attachments: attachments,
    };

    // Send the email
    await transporter(email, password).sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};
