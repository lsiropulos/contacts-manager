using Domain.Exceptions;

namespace Domain
{
    public class Contact
    {
        public Guid Id { get; private set; }
        public string UserId { get; private set; }
        public string FirstName { get; private set; } = string.Empty;
        public string Surname { get; private set; } = string.Empty;
        public DateOnly DateOfBirth { get; private set; }
        public string Address { get; private set; } = string.Empty;//TODO: for simplicity decided to keep address as string, but in real world it should be a domain entity
        public string Iban { get; private set; } = string.Empty;

        private readonly List<PhoneNumber> _phoneNumbers = new();
        public IReadOnlyCollection<PhoneNumber> PhoneNumbers => _phoneNumbers.AsReadOnly();

        // Required for EF Core
        private Contact() { }

        private Contact(string firstName, string surname, DateOnly dateOfBirth, string address, string iban, List<PhoneNumber> phoneNumbers, string userId)
        {
            Id = Guid.NewGuid();
            FirstName = firstName;
            Surname = surname;
            DateOfBirth = dateOfBirth;
            Address = address;
            Iban = iban;
            _phoneNumbers = phoneNumbers;
            UserId = userId;
        }

        public static Contact Create(
            string firstName,
            string surname,
            DateOnly dateOfBirth,
            string address,
            string iban,
            IEnumerable<(string Number, bool IsPrimary)> phoneNumbers,
            string userId)
        {
            ValidateAge(dateOfBirth);

            var phoneList = phoneNumbers?.ToList() ?? new List<(string Number, bool IsPrimary)>();
            ValidatePhoneNumbers(phoneList.Select(p => p.IsPrimary));

            var phoneEntities = phoneList
                .Select(p => new PhoneNumber(p.Number, p.IsPrimary))
                .ToList();

            return new Contact(
                firstName,
                surname,
                dateOfBirth,
                address,
                iban,
                phoneEntities,
                userId
            );
        }

        public void UpdateDetails(
            string firstName,
            string surname,
            DateOnly dateOfBirth,
            string address,
            string iban,
            IEnumerable<(Guid? Id, string Number, bool IsPrimary)> phoneNumbers)
        {
            ValidateAge(dateOfBirth);

            var phoneList = phoneNumbers?.ToList() ?? new List<(Guid? Id, string Number, bool IsPrimary)>();
            ValidatePhoneNumbers(phoneList.Select(p => p.IsPrimary));

            FirstName = firstName;
            Surname = surname;
            DateOfBirth = dateOfBirth;
            Address = address;
            Iban = iban;

            // 1. Remove phone numbers no longer present in the input list
            var incomingValidIds = phoneList
                .Where(p => p.Id is not null && p.Id != Guid.Empty)
                .Select(p => p.Id!.Value)
                .ToHashSet();

            _phoneNumbers.RemoveAll(existing => !incomingValidIds.Contains(existing.Id));

            // 2. Update existing or/and add new ones
            foreach (var incoming in phoneList)
            {
                var existing = _phoneNumbers.FirstOrDefault(p => incoming.Id is not null && p.Id == incoming.Id);
                if (existing != null)
                {
                    existing.Update(incoming.Number, incoming.IsPrimary);
                }
                else
                {
                    _phoneNumbers.Add(new PhoneNumber(incoming.Number, incoming.IsPrimary));
                }
            }
        }

        public void AddPhoneNumber(string number, bool isPrimary)
        {
            if (isPrimary)
            {
                SetAllPhoneNumbersNonPrimary();
            }

            _phoneNumbers.Add(new PhoneNumber(number, isPrimary));
        }

        public void SetPrimaryPhoneNumber(Guid phoneNumberId)
        {
            var target = _phoneNumbers.FirstOrDefault(p => p.Id == phoneNumberId)
                ?? throw new InvalidOperationException("Phone number not found.");

            SetAllPhoneNumbersNonPrimary();
            target.MarkAsPrimary();
        }

        private static void ValidateAge(DateOnly dateOfBirth)
        {
            var relativeTo = DateOnly.FromDateTime(DateTime.UtcNow); //TODO: Time zones may be considered here in a real-world scenario
            var yearsDiff = relativeTo.Year - dateOfBirth.Year;
            var age = dateOfBirth > relativeTo.AddYears(-yearsDiff) ? yearsDiff - 1 : yearsDiff;
            if (age < 16)
                throw new DomainException("A contact must be at least 16 years old.");
        }

        private static void ValidatePhoneNumbers(IEnumerable<bool> primaryFlags)
        {
            var flagsList = primaryFlags?.ToList();
            if (flagsList == null || !flagsList.Any())
                throw new DomainException("A contact must have at least one phone number.");

            if (flagsList.Count(isPrimary => isPrimary) > 1)
                throw new DomainException("A contact can have only one primary phone number.");
        }

        private void SetAllPhoneNumbersNonPrimary()
        {
            foreach (var phone in _phoneNumbers)
            {
                phone.MarkAsNonPrimary();
            }
        }
    }
}