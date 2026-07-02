using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using portfolio_backend.Settings;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace portfolio_backend.Controllers
{
    public class LoginRequest
    {
        public string Password { get; set; } = null!;
    }

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AdminSettings _adminSettings;
        private readonly JwtSettings _jwtSettings;

        public AuthController(IOptions<AdminSettings> adminSettings, IOptions<JwtSettings> jwtSettings)
        {
            _adminSettings = adminSettings.Value;
            _jwtSettings = jwtSettings.Value;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request?.Password) || request.Password != _adminSettings.Password)
            {
                return Unauthorized(new { error = "Invalid password" });
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.Role, "Admin"),
                new Claim(ClaimTypes.Name, "admin")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(_jwtSettings.ExpiryHours),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                expiresAt = token.ValidTo
            });
        }
    }
}