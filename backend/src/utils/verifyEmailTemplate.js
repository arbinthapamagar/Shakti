const verifyEmailTemplate = ({ name, otp, url }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>TukTuk App 🛺</h1>
      <p>Hello ${name},</p>

      ${otp ? `
        <p>Your verification code is:</p>
        <h2 style="
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          letter-spacing: 10px;
          font-size: 32px;
        ">${otp}</h2>
        <p>This code expires in 5 minutes.</p>
      ` : ''}

      ${url ? `
        <p>Or click the button below to verify your email:</p>
        <a href="${url}" style="
          color: white;
          background-color: #2563eb;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          display: inline-block;
        ">Verify Email</a>
      ` : ''}

      <p>Thanks,<br/>TukTuk App Team</p>
    </div>
  `;
};

export { verifyEmailTemplate };