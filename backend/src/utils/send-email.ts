// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";
import ApiError from "@/utils/ApiError";
const defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.SMTP_TOKEN;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export const sendEmail = async (subject: string, email:string, name:string, params: object, id: number) => {
  try {
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.to = [
            { email, name },
    ];
    sendSmtpEmail.templateId = id;
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = params;

    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data: unknown) {
        console.log(
          "API called successfully. Returned data: " + JSON.stringify(data)
        );
      },
      function (error: Error) {
        console.error("Email Send Error", error);
      }
    );
  } catch (error) {
    return new ApiError(500, String(error));
  }
};
