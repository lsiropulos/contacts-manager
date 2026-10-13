using Core.Contacts.Commands.CreateContact;
using Core.Contacts.Commands.DeleteContact;
using Core.Contacts.Commands.UpdateContact;
using Core.Contacts.Queries.GetContactById;
using Core.Contacts.Queries.GetContactsList;
using DTOs.CreateContact;
using DTOs.UpdateContactDtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContactsManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ContactsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedList<ContactListDto>>> GetContacts(
            CancellationToken cancellationToken,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            var query = new GetContactsListQuery(User.FindFirstValue(ClaimTypes.NameIdentifier), page, pageSize, searchTerm);
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ContactDetailsDto>> GetContactById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetContactByIdQuery(User.FindFirstValue(ClaimTypes.NameIdentifier), id), cancellationToken);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ContactDetailsDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ContactDetailsDto>> CreateContact([FromBody] CreateContactDto createContactDto, CancellationToken cancellationToken)
        {
            createContactDto.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var command = new CreateContactCommand(createContactDto);

            var contactId = await _mediator.Send(command, cancellationToken);

            // Retrieve the created contact details to return in the response body
            var createdContact = await _mediator.Send(new GetContactByIdQuery(createContactDto.UserId, contactId), cancellationToken);

            // Return 201 Created with Location header pointing to GET api/contacts/{id} and the created contact details in the response body
            return CreatedAtAction(
                nameof(GetContactById),
                new { id = contactId },
                createdContact);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateContact(Guid id, [FromBody] UpdateContactDto updateContactDto, CancellationToken cancellationToken)
        {
            updateContactDto.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _mediator.Send(new UpdateContactCommand(id, updateContactDto), cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteContact(Guid id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteContactCommand(User.FindFirstValue(ClaimTypes.NameIdentifier), id), cancellationToken);
            return NoContent();
        }
    }
}