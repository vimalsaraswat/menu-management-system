import nodemailer from "nodemailer";
import { env } from "~/env";

let transporterInstance: nodemailer.Transporter;

export const transporter = () => {
  transporterInstance ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporterInstance;
};
