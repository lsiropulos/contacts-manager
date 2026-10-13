namespace DTOs.UpdateContactDtos
{
    public record UpdatePhoneNumberDto(
        Guid? Id,
        string Number,
        bool IsPrimary
    ) : BasePhoneNumberDto(Number, IsPrimary)
    {
    }
}
