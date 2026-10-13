namespace DTOs.CreateContact
{
    public record CreatePhoneNumberDto : BasePhoneNumberDto
    {
        public CreatePhoneNumberDto(string number, bool isPrimary) : base(number, isPrimary)
        {
        }
    }
}
