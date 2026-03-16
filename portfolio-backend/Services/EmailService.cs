using Microsoft.Extensions.Options;
using portfolio_backend.Models;
using portfolio_backend.Settings;
using System.Drawing;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using static System.Net.Mime.MediaTypeNames;

namespace portfolio_backend.Services
{
    public class EmailService
    {
        private readonly EmailSettings _settings;
        private readonly HttpClient _httpClient;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        }

        public async Task SendContactNotificationAsync(ContactMessage message)
        {
            var html = BuildEmailHtml(message);

            var payload = new
            {
                from = $"Portfolio Contact <{_settings.FromEmail}>",
                to = new[] { _settings.ToEmail },
                reply_to = message.Email,
                subject = $"New message from {message.Name} via Portfolio",
                html
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                "https://api.resend.com/emails", content);

            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine("📧 Resend response: " + (int)response.StatusCode + " - " + responseBody);


            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Resend error: {response.StatusCode} - {error}");
            }
        }

        private static string BuildEmailHtml(ContactMessage message)
        {
            var date = message.SentAt.ToString("dddd, MMMM d, yyyy") + " at " + message.SentAt.ToString("h:mm tt") + " UTC";

            var style = "<style>" +
                "body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:24px}" +
                ".card{background:white;border-radius:12px;max-width:560px;margin:0 auto;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)}" +
                ".header{background:#18181b;padding:24px 32px}" +
                ".header h1{color:white;margin:0;font-size:18px;font-weight:600}" +
                ".header p{color:#a1a1aa;margin:4px 0 0;font-size:14px}" +
                ".body{padding:32px}" +
                ".field{margin-bottom:20px}" +
                ".label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#71717a;margin-bottom:4px}" +
                ".value{font-size:15px;color:#18181b}" +
                ".message-box{background:#f4f4f5;border-radius:8px;padding:16px;font-size:15px;color:#18181b;line-height:1.6;white-space:pre-wrap}" +
                ".footer{padding:16px 32px;background:#f4f4f5;font-size:12px;color:#a1a1aa}" +
                "</style>";

            return "<!DOCTYPE html><html><head><meta charset='utf-8'>" + style + "</head><body>" +
            "<div class='card'>" +
                "<div class='header'>" +
                    "<h1>New Contact Form Submission</h1>" +
                    "<p>" + date + "</p>" +
                "</div>" +
                "<div class='body'>" +
                    "<div class='field'>" +
                        "<div class='label'>Name</div>" +
                        "<div class='value'>" + System.Web.HttpUtility.HtmlEncode(message.Name) + "</div>" +
                    "</div>" +
                    "<div class='field'>" +
                        "<div class='label'>Email</div>" +
                        "<div class='value'>" + System.Web.HttpUtility.HtmlEncode(message.Email) + "</div>" +
                    "</div>" +
                    "<div class='field'>" +
                        "<div class='label'>Message</div>" +
                        "<div class='message-box'>" + System.Web.HttpUtility.HtmlEncode(message.Message) + "</div>" +
                    "</div>" +
                "</div>" +
                "<div class='footer'>Sent from your portfolio contact form</div>" +
            "</div>" +
            "</body></html>";
        }
    }
}