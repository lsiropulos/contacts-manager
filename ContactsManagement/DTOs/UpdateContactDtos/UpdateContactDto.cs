namespace DTOs.UpdateContactDtos
{
    public class UpdateContactDto : BaseContactDto
    {
        public List<UpdatePhoneNumberDto> PhoneNumbers { get; set; } = new();
    }
}
