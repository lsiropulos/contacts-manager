using FluentValidation;

namespace Core.Contacts.Commands.UpdateContact
{
    public class UpdateContactCommandValidator : AbstractValidator<UpdateContactCommand>
    {
        public UpdateContactCommandValidator()
        {
            RuleFor(x => x.UpdateContactDto).SetValidator(new BaseContactDtoValidator());

            RuleFor(x => x.UpdateContactDto.PhoneNumbers)
                .NotEmpty().WithMessage("At least one phone number is required.")
                .Must(phones => phones.Count(p => p.IsPrimary) <= 1)
                .WithMessage("Only one primary phone number is allowed.");
        }
    }
}
