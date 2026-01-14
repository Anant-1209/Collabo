
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Hubs;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// 1. Authentication Configuration (Web App Style)
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"))
.EnableTokenAcquisitionToCallDownstreamApi(new[] { "User.Read" })
.AddInMemoryTokenCaches();

builder.Services.AddControllers();
builder.Services.AddSignalR();

// 2. Database Connection
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. CORS Policy
builder.Services.AddCors(options => {
    options.AddPolicy("CorsPolicy", policy => {
        policy.WithOrigins("https://localhost:59932","http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

var app = builder.Build();

// 4. Middleware Pipeline
app.UseRouting();
app.UseCors("CorsPolicy");

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();