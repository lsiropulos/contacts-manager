using FluentValidation;


namespace Core.Contacts.Commands.CreateContact
{
    public class CreateContactCommandValidator : AbstractValidator<CreateContactCommand>
    {
        public CreateContactCommandValidator()
        {
            RuleFor(x => x.CreateContactDto).SetValidator(new BaseContactDtoValidator());

            RuleFor(x => x.CreateContactDto.PhoneNumbers)
                .NotEmpty().WithMessage("At least one phone number is required.")
                .Must(phones => phones.Count(p => p.IsPrimary) <= 1)
                .WithMessage("Only one primary phone number is allowed.");
        }
    }
}
