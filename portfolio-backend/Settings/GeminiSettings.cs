namespace portfolio_backend.Settings
{
    public class GeminiSettings
    {
        public string ApiKey { get; set; } = null!;

        // Fast default for short portfolio answers (~2s in testing).
        public string Model { get; set; } = "gemini-3.5-flash-lite";

        // Tried automatically when the main model is overloaded (429/5xx) or too slow.
        public string FallbackModel { get; set; } = "gemini-2.5-flash";

        // Limit per attempt, so visitors get an answer well before the site's 45s timeout.
        public int TimeoutSeconds { get; set; } = 15;
    }
}