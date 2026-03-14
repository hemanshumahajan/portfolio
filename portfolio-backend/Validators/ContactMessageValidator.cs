using FluentValidation;
using portfolio_backend.Models;

namespace portfolio_backend.Validators
{
    public class ContactMessageValidator : AbstractValidator<ContactMessage>
    {
        public ContactMessageValidator() 
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required")
                .MinimumLength(2).WithMessage("Name must be atleast 2 characters")
                .MaximumLength(100).WithMessage("Name is too long");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Please enter a valid email address");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Message is required")
                .MinimumLength(10).WithMessage("Message must be at least 10 characters")
                .MaximumLength(1000).WithMessage("Message must be under 1000 characters");
        }
    }
}