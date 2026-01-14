using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/projects?email=... - Get projects where user is a member
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetProjects([FromQuery] string? email)
        {
            if (string.IsNullOrEmpty(email))
            {
                // Return all projects for backwards compatibility
                return Ok(await _context.Projects.ToListAsync());
            }

            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == email);
            if (user == null)
            {
                return Ok(new List<Project>()); // No projects if user not found
            }

            // Get project IDs where user is a member
            var memberProjectIds = await _context.ProjectMembers
                .Where(pm => pm.UserId == user.user_id)
                .Select(pm => pm.ProjectId)
                .ToListAsync();

            // Also include projects created by this user (for backwards compatibility)
            var projects = await _context.Projects
                .Where(p => memberProjectIds.Contains(p.ProjectId) || p.Creator == user.name || p.Creator == email)
                .ToListAsync();

            return Ok(projects);
        }

        // POST /api/projects - Create project and add creator as owner
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject([FromBody] CreateProjectDto dto)
        {
            var project = new Project
            {
                ProjectId = Guid.NewGuid().ToString(),
                Name = dto.Name,
                Description = dto.Description,
                Tags = dto.Tags,
                Creator = dto.Creator,
                Status = "Active"
            };

            _context.Projects.Add(project);

            // Find creator user and add as owner
            if (!string.IsNullOrEmpty(dto.CreatorEmail))
            {
                var creator = await _context.Users.FirstOrDefaultAsync(u => u.email == dto.CreatorEmail);
                if (creator != null)
                {
                    _context.ProjectMembers.Add(new ProjectMember
                    {
                        ProjectId = project.ProjectId,
                        UserId = creator.user_id,
                        Role = "Owner",
                        JoinedAt = DateTime.UtcNow
                    });
                }
            }

            // Add selected members
            if (dto.MemberIds != null && dto.MemberIds.Count > 0)
            {
                foreach (var userId in dto.MemberIds)
                {
                    // Don't add duplicate if creator is in members list
                    var existingMember = await _context.ProjectMembers
                        .FirstOrDefaultAsync(pm => pm.ProjectId == project.ProjectId && pm.UserId == userId);
                    
                    if (existingMember == null)
                    {
                        _context.ProjectMembers.Add(new ProjectMember
                        {
                            ProjectId = project.ProjectId,
                            UserId = userId,
                            Role = "Member",
                            JoinedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            // Log activity
            _context.ActivityLogs.Add(new ActivityLog
            {
                ProjectId = project.ProjectId,
                User = dto.Creator ?? "Anonymous",
                Message = $"created a new project: {project.Name}",
                Type = "ProjectCreated",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        // GET /api/projects/{id}/members - Get project members
        [HttpGet("{id}/members")]
        public async Task<ActionResult<IEnumerable<ProjectMemberDto>>> GetProjectMembers(string id)
        {
            try
            {
                var members = await _context.ProjectMembers
                    .Where(pm => pm.ProjectId == id)
                    .Join(_context.Users,
                        pm => pm.UserId,
                        u => u.user_id,
                        (pm, u) => new ProjectMemberDto
                        {
                            Id = pm.Id,
                            UserId = pm.UserId,
                            Role = pm.Role,
                            JoinedAt = pm.JoinedAt,
                            Name = u.name,
                            Email = u.email
                        })
                    .ToListAsync();

                return Ok(members);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching project members: {ex.Message}");
                return StatusCode(500, "Internal server error fetching members");
            }
        }

        // POST /api/projects/{id}/members - Add member to project
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddProjectMember(string id, [FromBody] AddMemberDto dto)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound("Project not found");

            // Check if already a member
            var existing = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.UserId == dto.UserId);
            
            if (existing != null)
            {
                return BadRequest("User is already a member of this project");
            }

            var member = new ProjectMember
            {
                ProjectId = id,
                UserId = dto.UserId,
                Role = dto.Role ?? "Member",
                JoinedAt = DateTime.UtcNow
            };

            _context.ProjectMembers.Add(member);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Member added successfully", member });
        }

        // DELETE /api/projects/{id}/members/{userId} - Remove member from project
        [HttpDelete("{id}/members/{userId}")]
        public async Task<IActionResult> RemoveProjectMember(string id, int userId)
        {
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.UserId == userId);

            if (member == null) return NotFound("Member not found");

            _context.ProjectMembers.Remove(member);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Member removed successfully" });
        }

        // DELETE /api/projects/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(string id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();

            // Remove all project members
            var members = _context.ProjectMembers.Where(pm => pm.ProjectId == id);
            _context.ProjectMembers.RemoveRange(members);

            // Remove all related tasks
            var relatedTasks = _context.Tasks.Where(t => t.ProjectId == id);
            _context.Tasks.RemoveRange(relatedTasks);

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    // DTOs
    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Tags { get; set; }
        public string? Creator { get; set; }
        public string? CreatorEmail { get; set; }
        public List<int>? MemberIds { get; set; }
    }

    public class AddMemberDto
    {
        public int UserId { get; set; }
        public string? Role { get; set; }
    }
}
