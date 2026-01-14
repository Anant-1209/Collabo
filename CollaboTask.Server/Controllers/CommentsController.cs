using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;
using Microsoft.AspNetCore.SignalR;
using CollaboTask.Server.Hubs;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public CommentsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("{taskId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(string taskId)
        {
            return await _context.Comments
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Comment>> PostComment([FromBody] Comment comment)
        {
            // 1. Initialize comment metadata
            comment.CommentId = Guid.NewGuid().ToString();
            comment.CreatedAt = DateTime.UtcNow;

            _context.Comments.Add(comment);

            // 2. Fetch the task to link activity to a project
            var task = await _context.Tasks.FindAsync(comment.TaskId);
            if (task == null) return BadRequest("Task not found");

            // 3. Log the activity for the Recent Activity feed
            _context.ActivityLogs.Add(new ActivityLog 
            {
                ProjectId = task.ProjectId,
                User = comment.Author,
                Message = $"commented on '{task.Title}': {comment.Text}",
                Type = "Comment",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // 4. Send targeted notification to the specific Project Group
            // This ensures only people viewing this project see the notification
            await _hubContext.Clients.Group(task.ProjectId).SendAsync("ReceiveNotification", new
            {
                id = DateTime.UtcNow.Ticks,
                message = $"{comment.Author} commented on {task.Title}",
                type = "Comment",
                projectId = task.ProjectId,
                isRead = false,
                time = "Just now"
            });

            return Ok(comment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(string id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}   