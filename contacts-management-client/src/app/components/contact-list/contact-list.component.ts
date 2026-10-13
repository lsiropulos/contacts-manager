import { Component, OnInit, inject, Signal, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';

// PrimeNG Modules
import { TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SharedModule, ConfirmationService, MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

import {
  ContactListDto,
  ContactDetailsDto,
  CreateContactDto,
  UpdateContactDto,
} from '../../models/contact.model';
import { getInitials } from '../../utils/string.utils';
import { ContactsState } from '../../store/contacts.state';
import {
  LoadContacts,
  LoadContactById,
  CreateContact,
  UpdateContact,
  DeleteContact,
} from '../../store/contacts.actions';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SharedModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    ContactFormComponent,
  ],
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent implements OnInit {
  private store = inject(Store);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Directly bind NGXS selectors as Signals
  contacts: Signal<ContactListDto[]> = this.store.selectSignal(ContactsState.contacts);
  loading: Signal<boolean> = this.store.selectSignal(ContactsState.loading);
  selectedContact: Signal<ContactDetailsDto | null> = this.store.selectSignal(
    ContactsState.selectedContact,
  );
  pagination = this.store.selectSignal(ContactsState.pagination);

  // Computed signals for PrimeNG Paginator
  total = computed(() => this.pagination().total);
  pageSize = computed(() => this.pagination().pageSize);
  currentPage = computed(() => this.pagination().page);
  first = computed(() => (this.currentPage() - 1) * this.pageSize());

  searchInput = signal('');
  // Computed property to determine if search button should be disabled
  isSearchDisabled = computed(() => this.searchInput().trim().length < 2);

  displayDialog = signal(false);
  dialogLoading = signal(false);
  isEditMode = signal(false);
  selectedContactToEdit = computed(() => (this.isEditMode() ? this.selectedContact() : null));
  dialogHeader = computed(() => (this.isEditMode() ? 'Edit Contact' : 'Create New Contact'));

  ngOnInit(): void {
    this.store.dispatch(new LoadContacts({ page: 1 }));
  }

  onSearch(): void {
    if (this.isSearchDisabled()) {
      return;
    }
    this.store.dispatch(new LoadContacts({ page: 1, searchTerm: this.searchInput().trim() }));
  }

  clearSearch(): void {
    const activeSearchTerm = this.pagination().searchTerm;

    // Clear local input
    this.searchInput.set('');

    // Only refetch if an active search query was previously executed against the backend
    if (activeSearchTerm) {
      this.store.dispatch(new LoadContacts({ page: 1, searchTerm: '' }));
    }
  }

  onPageChange(event: TablePageEvent): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
    this.store.dispatch(new LoadContacts({ page, pageSize }));
  }

  showCreateDialog(): void {
    this.isEditMode.set(false);
    this.dialogLoading.set(false);
    this.displayDialog.set(true);
  }

  editContact(id: string): void {
    this.isEditMode.set(true);
    this.dialogLoading.set(true);
    this.displayDialog.set(true);

    this.store.dispatch(new LoadContactById(id)).subscribe({
      next: () => {
        this.dialogLoading.set(false);
      },
      error: (err) => {
        this.dialogLoading.set(false);
        this.displayDialog.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contact details: ' + (err.message || 'Unknown error'),
        });
      },
    });
  }

  confirmDelete(contact: ContactListDto): void {
    this.confirmationService.confirm({
      header: 'Delete Contact',
      message: `Are you sure you want to delete "${contact.fullName}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(new DeleteContact(contact.id)).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Contact deleted successfully',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete contact: ' + (err.message || 'Unknown error'),
            });
          },
        });
      },
    });
  }

  handleFormSubmit(dto: CreateContactDto | UpdateContactDto): void {
    if (this.selectedContactToEdit()) {
      this.store
        .dispatch(
          new UpdateContact(this.selectedContactToEdit()?.id ?? '', dto as UpdateContactDto),
        )
        .subscribe({
          next: () => {
            this.displayDialog.set(false);
            this.isEditMode.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Contact updated successfully',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update contact: ' + (err.message || 'Unknown error'),
            });
          },
        });
    } else {
      this.store.dispatch(new CreateContact(dto as CreateContactDto)).subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.isEditMode.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Contact created successfully',
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create contact: ' + (err.message || 'Unknown error'),
          });
        },
      });
    }
  }

  getInitials(name: string): string {
    return getInitials(name);
  }
}
