using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using System.Text;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("tasks/csv")]
        public async Task<IActionResult> DownloadTasksCsv([FromQuery] string? projectId)
        {
            // 1. Fetch the data based on ProjectId
            var query = _context.Tasks.AsQueryable();
            if (!string.IsNullOrEmpty(projectId))
            {
                query = query.Where(t => t.ProjectId == projectId);
            }

            var tasks = await query.ToListAsync();

            // 2. Build the CSV String
            var builder = new StringBuilder();
            builder.AppendLine("TaskId,Title,Status,Priority,Assignee,DueDate");

            foreach (var task in tasks)
            {
                var dueDate = task.DueDate?.ToString("yyyy-MM-dd") ?? "";
                builder.AppendLine($"{task.TaskId},{task.Title},{task.Status},{task.Priority},{task.Assignee},{dueDate}");
            }

            // 3. Return as a File Download
            var csvBytes = Encoding.UTF8.GetBytes(builder.ToString());
            return File(csvBytes, "text/csv", $"TaskReport_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}