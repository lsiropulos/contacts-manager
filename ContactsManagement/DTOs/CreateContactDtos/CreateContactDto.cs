namespace DTOs.CreateContact
{
    public class CreateContactDto : BaseContactDto
    {
        public List<CreatePhoneNumberDto> PhoneNumbers { get; set; } = new List<CreatePhoneNumberDto>();
    }
}
