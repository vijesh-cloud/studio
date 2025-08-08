
'use server';

/**
 * @fileOverview Manages the password reset process by sending a verification code.
 *
 * - sendPasswordResetCode - Generates a 6-digit code and emails it to the user.
 * - verifyPasswordResetCode - Verifies the provided code (placeholder for now).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';

// IMPORTANT: This is a placeholder for a secure secret management system.
// In a real production environment, use something like Google Secret Manager.
const SMTP_USER = process.env.SMTP_USER || 'your-email@example.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-password';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ecoverse.com';

// This would ideally be stored in a secure database with an expiration time.
// For this example, we'll store it in memory. This is NOT production-safe.
const codeStore: Record<string, { code: string; expires: number }> = {};


export const SendPasswordResetCodeInputSchema = z.object({
  email: z.string().email().describe('The user\'s email address.'),
});
export type SendPasswordResetCodeInput = z.infer<typeof SendPasswordResetCodeInputSchema>;

export const SendPasswordResetCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendPasswordResetCodeOutput = z.infer<typeof SendPasswordResetCodeOutputSchema>;

export const sendPasswordResetCode = ai.defineFlow(
  {
    name: 'sendPasswordResetCode',
    inputSchema: SendPasswordResetCodeInputSchema,
    outputSchema: SendPasswordResetCodeOutputSchema,
  },
  async (input) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the code (insecure, for demo purposes only)
    codeStore[input.email] = { code, expires };

    // In a real app, you would not use a mock SMTP service like this.
    // You would use a transactional email service (e.g., SendGrid, Mailgun).
    // This uses ethereal.email for a temporary, free SMTP server for testing.
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'reese.eichmann20@ethereal.email', // Generated ethereal user
        pass: 'HkGFQ5Nswq2P5nC2S7', // Generated ethereal password
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"EcoVerse Support" <${FROM_EMAIL}>`,
        to: input.email,
        subject: 'Your EcoVerse Password Reset Code',
        text: `Your password reset code is: ${code}`,
        html: `<b>Your password reset code is: ${code}</b><p>This code will expire in 10 minutes.</p>`,
      });

      console.log('Message sent: %s', info.messageId);
      // You can see the preview URL in the console logs when running locally
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      return {
        success: true,
        message: 'A password reset code has been sent to your email.',
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send password reset email.');
    }
  }
);


// --- Verification Flow (Conceptual) ---

export const VerifyPasswordResetCodeInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
export type VerifyPasswordResetCodeInput = z.infer<typeof VerifyPasswordResetCodeInputSchema>;

export const VerifyPasswordResetCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type VerifyPasswordResetCodeOutput = z.infer<typeof VerifyPasswordResetCodeOutputSchema>;


export const verifyPasswordResetCode = ai.defineFlow({
    name: 'verifyPasswordResetCode',
    inputSchema: VerifyPasswordResetCodeInputSchema,
    outputSchema: VerifyPasswordResetCodeOutputSchema,
}, async (input) => {
    const stored = codeStore[input.email];

    if (!stored) {
        return { success: false, message: 'No reset code found for this email. Please request one.' };
    }
    if (Date.now() > stored.expires) {
        delete codeStore[input.email];
        return { success: false, message: 'Your reset code has expired. Please request a new one.' };
    }
    if (stored.code !== input.code) {
        return { success: false, message: 'The verification code is incorrect.' };
    }

    // On success, remove the code so it can't be reused.
    delete codeStore[input.email];
    return { success: true, message: 'Code verified successfully.' };
});
