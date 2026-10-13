namespace Core.Contacts.Queries.GetContactById
{
    public record ContactDetailsDto(
        Guid Id,
        string FirstName,
        string Surname,
        DateOnly DateOfBirth,
        int Age,
        string Address,
        string Iban,
        List<PhoneNumberDetailsDto> PhoneNumbers
    );
}
