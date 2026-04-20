using Business_be.Models;
using Microsoft.AspNetCore.Identity;
using static Business_be.Controllers.AuthController;

namespace Business_be.Services
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterRequest request);
        Task<string?> LoginAsync(LoginRequest request);
        
    }
}