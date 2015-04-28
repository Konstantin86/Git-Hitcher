using System;
using System.ComponentModel.DataAnnotations;

namespace Hitcher.Models.Request
{
  public class PasswordRequestBase
  {
    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string Password { get; set; }

    [Required]
    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }
  }

  public class UserAddRequest : PasswordRequestBase
  {
    [Required]
    [Display(Name = "Username")]
    public string Username { get; set; }

    [Required]
    [EmailAddress]
    [Display(Name = "Email")]
    public string Email { get; set; }
  }

  public class ExternalUserAddRequest : UserAddRequest
  {
    [Required]
    public string Provider { get; set; }

    [Required]
    public string ExternalAccessToken { get; set; }
  }

  public class UserUpdateRequest
  {
    public string FirstName { get; set; }

    public string LastName { get; set; }

    [DataType(DataType.Date)]
    public DateTime? BirthDate { get; set; }

    public string Gender { get; set; }

    public string Country { get; set; }

    public string City { get; set; }

    public string PhoneNumber { get; set; }
  }

  public class PasswordUpdateRequest : PasswordRequestBase
  {
    [Required]
    [DataType(DataType.Password)]
    [Display(Name = "Current password")]
    public string OldPassword { get; set; }
  }
}