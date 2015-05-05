using System;
using System.Collections.Generic;

namespace Hitcher.Models.Response
{
  public class UserResponse
  {
    public string Url { get; set; }
    public string Id { get; set; }
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool HasExternalLogins { get; set; }
    public string Gender { get; set; }
    public string Country { get; set; }
    public string City { get; set; }
    public DateTime? BirthDate { get; set; }
    public DateTime JoinDate { get; set; }
    public string PhotoPath { get; set; }
    public IList<string> Roles { get; set; }
    public IList<System.Security.Claims.Claim> Claims { get; set; }
  }
}