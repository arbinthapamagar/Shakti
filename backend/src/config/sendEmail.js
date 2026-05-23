import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    if (!process.env.RESEND_API) {
      console.warn('RESEND_API not set — emails will not be sent');
      return null;
    }
    resendClient = new Resend(process.env.RESEND_API);
  }
  return resendClient;
};

const sendEmail = async ({ sendTo, subject, html }) => {
  const resend = getResendClient();
  if (!resend) return null;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Shakti <onboarding@resend.dev>',
      to: sendTo,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Email error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('sendEmail error:', error.message);
    return null;
  }
};

export {sendEmail};