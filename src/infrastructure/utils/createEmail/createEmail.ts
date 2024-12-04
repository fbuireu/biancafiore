import { CONTACT_DETAILS, DEFAULT_LOCALE_STRING } from "@const/const.ts";
import type { Except } from "@const/types.ts";
import type { ContactFormData } from "@shared/ui/types.ts";

type GenerateHtmlParams = Except<ContactFormData, "recaptcha">;

const URL_ENCODED_SPACE_REGEX = /%20/g;

export function createEmail({ name, email, message }: GenerateHtmlParams): string {
	const date = new Date().toLocaleString(DEFAULT_LOCALE_STRING);
	const mailTo =
		`mailto:${email}?subject=Re: ${encodeURIComponent(CONTACT_DETAILS.EMAIL_SUBJECT)} from biancafiore.me`.replace(
			URL_ENCODED_SPACE_REGEX,
			" ",
		);

	return `<html lang="en"> 
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>New web contact form submission</title>
  </head>
  <body>
    <table style="width: 100%!important; height: 100%; background-color: #fafafa; padding: 20px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 100%; line-height: 1.6;">
      <tr>
        <td></td>
        <td style="border: 1px solid #eeeeee; background-color: #ffffff; border-radius: 4px; display: block!important; max-width: 600px!important; margin: 0 auto!important; clear: both!important;">
          <div style="padding: 20px; max-width: 600px; margin: 0 auto; display: block;">
            <table style="width: 100%;">
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #dddddd;"
                >
                  <h2 style="font-size: 40px">
                    Bianca<span style="color: #D4A259FF">F</span>iore
                  </h2>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: center;">
                  <h1 style="font-weight: 200; font-size: 36px; margin: 20px 0 30px 0; color: #333333;">
                    It's all about details innit?
                  </h1>
                </td>
              </tr>
              <tr>
                <th style="width: 80px; text-align: left; font-size: 18px;">
                  Name:
                </th>
                <td>${name}</td>
              </tr>
              <tr>
                <th style="width: 80px; text-align: left; font-size: 18px;">
                  Email:
                </th>
                <td>${email}</td>
              </tr>
							<tr>
                <th style="width: 80px; text-align: left; font-size: 18px;">
                  Date:
                </th>
                <td>${date}</td>
              </tr>
              <tr>
                <th style="text-align: left; font-size: 18px;">Message:</th>
                <td></td>
              </tr>
              <tr>
                <td colspan="2">${message}</td>
              </tr>
              <tr>
                <td colspan="2">
                  <p style="border-top: 1px solid #dddddd; padding-top: 20px;">
                    Reply directly by clicking the following button:
                  </p>
                  <a
                    href="mailto:${mailTo}"
                    style="font-size: 18px; text-align: center; text-decoration: none; background-color: #1E2021FF; padding: 16px; color: #ffffff; border-radius: 4px; display: block; width: calc(100% - 32px); margin-top: 16px; margin-bottom: 16px;"
                  >
                    Reply
                  </a>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 20px; margin-top: 30px; border-top: 1px solid #dddddd; color: #666666;"
                >
                  biancafiore.me
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-bottom: 20px; font-weight: bold; margin-top: 16px; color: #666666;"
                >
                  Sent with 🖤 by Ciccino Pastino
                </td>
              </tr>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </table>
  </body>
</html>;
`;
}
