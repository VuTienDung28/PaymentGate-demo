using Business_be.Models;
using Business_be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Business_be.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "Register success" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi đăng ký.", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var token = await _authService.LoginAsync(request);
            if (token == null) return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu!" });

            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi đăng nhập.", error = ex.Message });
        }
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin-policy")]
    public IActionResult AdminPolicy()
    {
        try
        {
            return Ok("Policy: Admin");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống.", error = ex.Message });
        }
    }

    [Authorize(Policy = "UserOnly")]
    [HttpGet("user-policy")]
    public IActionResult UserPolicy()
    {
        try
        {
            if (User.IsInRole("Admin"))
            {
                return Ok("Policy: Admin");
            }
            return Ok("Policy: User");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống.", error = ex.Message });
        }
    }
}