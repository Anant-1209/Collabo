using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;   // Replace with your actual namespace for AppDbContext
using CollaboTask.Server.Models; // Replace with your actual namespace for ActivityLog

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ActivityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivity(string? projectId)
        {
            var query = _context.ActivityLogs.AsQueryable();

            if (!string.IsNullOrEmpty(projectId))
            {
                query = query.Where(a => a.ProjectId == projectId);
            }

            return await query
                .OrderByDescending(a => a.Timestamp)
                .Take(20)
                .ToListAsync();
        }
    }
}