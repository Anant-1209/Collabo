using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("sync-user")]
        public async Task<IActionResult> SyncUser([FromBody] SyncUserDto userData)
        {
            // Requirement 2.1.1: Check if user exists in MS-SQL [cite: 17, 143]
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.email == userData.Email);

            if (existingUser == null)
            {
                // Check if this is the first user in the system
                var userCount = await _context.Users.CountAsync();
                var defaultRole = userCount == 0 ? "Admin" : "Team Member";

                // New User Registration [cite: 143-150]
                var newUser = new User
                {
                    email = userData.Email,
                    name = userData.Name,
                    role = defaultRole,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "User registered successfully", user = newUser });
            }

            // Update existing profile info (preserve role!)
            existingUser.name = userData.Name;
            existingUser.updated_at = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "User login synced", user = existingUser });
        }
    }

    /// <summary>
    /// DTO for sync-user requests
    /// </summary>
    public class SyncUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
