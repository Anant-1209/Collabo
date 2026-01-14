using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/users/me - Get current user's profile by email
        /// </summary>
        [HttpGet("me")]
        public async Task<ActionResult<User>> GetCurrentUser([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is required");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == email);
            
            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }

        /// <summary>
        /// GET /api/users - Get all users (for admin user management)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        /// <summary>
        /// PATCH /api/users/{id}/role - Update a user's role (Admin only)
        /// </summary>
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Validate the role value
            var validRoles = new[] { "Admin", "Project Manager", "Team Member", "Guest" };
            if (!validRoles.Contains(dto.Role))
            {
                return BadRequest($"Invalid role. Must be one of: {string.Join(", ", validRoles)}");
            }

            user.role = dto.Role;
            user.updated_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Role updated successfully", user });
        }

        /// <summary>
        /// DELETE /api/users/{id} - Delete a user from the database (Admin only)
        /// Also removes user from all project memberships and unassigns from tasks
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Prevent deleting admin users for safety
            if (user.role == "Admin")
            {
                return BadRequest("Cannot delete admin users");
            }

            // Remove user from all project memberships
            var memberships = _context.ProjectMembers.Where(pm => pm.UserId == id);
            _context.ProjectMembers.RemoveRange(memberships);

            // Unassign user from all tasks (set assignee to null)
            var assignedTasks = await _context.Tasks
                .Where(t => t.Assignee == user.name || t.Assignee == user.email)
                .ToListAsync();
            
            foreach (var task in assignedTasks)
            {
                task.Assignee = null;
            }

            // Delete the user
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }
    }

    /// <summary>
    /// DTO for role update requests
    /// </summary>
    public class RoleUpdateDto
    {
        public string Role { get; set; } = string.Empty;
    }
}
