using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Hitcher.DataAccess.Entities
{
  public class AppUser : IdentityUser
  {
    public AppUser()
    {
      PhotoPath = "default_avatar.png";
    }

    [MaxLength(100)]
    public string FirstName { get; set; }

    [MaxLength(100)]
    public string LastName { get; set; }

    [Required]
    public DateTime JoinDate { get; set; }

    public DateTime? BirthDate { get; set; }

    public string Sex { get; set; }

    public string Country { get; set; }

    public string City { get; set; }

    public string PhotoPath { get; set; }
  }
}