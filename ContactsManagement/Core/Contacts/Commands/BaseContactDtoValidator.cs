using Core.Contacts.Helpers;
using DTOs;
using FluentValidation;

namespace Core.Contacts.Commands
{
    public class BaseContactDtoValidator : AbstractValidator<BaseContactDto>
    {
        public BaseContactDtoValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Surname).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Iban).NotEmpty(); // Add IBAN validation rules as needed
            RuleFor(x => x.Address).NotEmpty().MaximumLength(200);
            RuleFor(x => x.DateOfBirth)
                .Must(dateOfBirth => AgeHelper.CalculateAge(dateOfBirth) >= 16)
                .WithMessage("Contact must be at least 16 years old.");
        }
    }
}
