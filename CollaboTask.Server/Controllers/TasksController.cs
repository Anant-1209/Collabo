using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;

namespace CollaboTask.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasks()
        {
            return await _context.Tasks.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<ProjectTask>> CreateTask(ProjectTask task)
        {
            _context.Tasks.Add(task);

            // Dynamically log whosoever is creating the task
            _context.ActivityLogs.Add(new ActivityLog {
                ProjectId = task.ProjectId,
                User = task.Creator ?? "New User", 
                Message = $"created task: {task.Title}",
                Type = "TaskCreated",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(task);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] StatusUpdateDto update)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Status = update.NewStatus;

            _context.ActivityLogs.Add(new ActivityLog {
                ProjectId = task.ProjectId,
                User = update.UserName, // Captured from whosoever moved the card
                Message = $"moved '{task.Title}' to {update.NewStatus}",
                Type = "StatusUpdate",
                Timestamp = DateTime.UtcNow
            });

            return Ok(task);
        }

        [HttpPatch("{id}/assignee")]
        public async Task<IActionResult> UpdateAssignee(string id, [FromBody] AssigneeUpdateDto update)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            var oldAssignee = task.Assignee ?? "Unassigned";
            task.Assignee = string.IsNullOrEmpty(update.Assignee) ? null : update.Assignee;

            _context.ActivityLogs.Add(new ActivityLog {
                ProjectId = task.ProjectId,
                User = update.UserName ?? "System",
                Message = task.Assignee != null 
                    ? $"assigned '{task.Title}' to {task.Assignee}" 
                    : $"unassigned '{task.Title}'",
                Type = "AssigneeUpdate",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    // Helper class for clean status updates
    public class StatusUpdateDto {
        public string NewStatus { get; set; }
        public string UserName { get; set; }
    }

    // Helper class for assignee updates
    public class AssigneeUpdateDto {
        public string? Assignee { get; set; }
        public string? UserName { get; set; }
    }
}