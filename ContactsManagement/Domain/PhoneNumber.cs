namespace Domain
{
    public class PhoneNumber
    {
        public Guid Id { get; private set; }
        public string Number { get; private set; } = string.Empty;
        public bool IsPrimary { get; private set; }

        private PhoneNumber() { }

        public PhoneNumber(string number, bool isPrimary)
        {
            Number = number;
            IsPrimary = isPrimary;
        }

        public void Update(string number, bool isPrimary)
        {
            Number = number;
            IsPrimary = isPrimary;
        }

        public void MarkAsPrimary()
        {
            IsPrimary = true;
        }

        public void MarkAsNonPrimary()
        {
            IsPrimary = false;
        }
    }
}
