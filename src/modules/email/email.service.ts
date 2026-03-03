import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
    this.senderEmail = this.configService.get<string>('AWS_SES_SENDER_EMAIL')!;
  }

  async sendVerificationCode(toEmail: string, code: string): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.senderEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: 'Código de verificación - Agrodil',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #2d5a27;">Bienvenido a Agrodil</h2>
                <p>Tu código de verificación es:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2d5a27; padding: 16px; background: #f4f9f3; border-radius: 8px; text-align: center;">
                  ${code}
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 16px;">
                  Este código es válido por <strong>1 hora</strong>. No lo compartas con nadie.
                </p>
              </div>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Tu código de verificación de Agrodil es: ${code}\n\nEste código es válido por 1 hora.`,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await this.sesClient.send(command);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }
}
